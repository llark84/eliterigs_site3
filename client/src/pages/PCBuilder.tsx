import { PCComponent, BuildPreset, BuildCompatibility } from '@shared/schema';
import type { Offer } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle2, Package, Sparkles } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useSearch } from 'wouter';

import AccessoryCard from '@/components/AccessoryCard';
import BuildSummary from '@/components/BuildSummary';
import CompatibilityStatus from '@/components/CompatibilityStatus';
import ComponentCard from '@/components/ComponentCard';
import PresetCard from '@/components/PresetCard';
import SearchFilters from '@/components/SearchFilters';
import SEOHead from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { USE_CASE_PRIORITIES } from '@/constants/config';
import { useParentKidMode } from '@/hooks/useParentKidMode';
import { buildCart, getVendorBreakdown, type CartItem } from '@/lib/cartBuilder';
import { mockComponents, mockPresets } from '@/lib/mock-data';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Use case priority configurations imported from constants

export default function PCBuilder() {
  // Parse query parameters
  const searchParams = new URLSearchParams(useSearch());
  const useCase = searchParams.get('use') || '';
  const budgetParam = searchParams.get('budget');
  const initialBudget = budgetParam ? parseInt(budgetParam, 10) : 2000;

  // Parent/Kid mode for quieter, easier builds
  const { isParentKidMode } = useParentKidMode();

  // Local state persistence key
  const BUILD_STORAGE_KEY = 'eliterigs-current-build';

  // Initialize build state from localStorage
  const initializeBuildState = () => {
    if (typeof window === 'undefined') return { components: {}, accessories: {} };

    try {
      const stored = localStorage.getItem(BUILD_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          components: parsed.components || {},
          accessories: parsed.accessories || {},
        };
      }
    } catch (error) {
      console.warn('Failed to parse build state from localStorage:', error);
    }
    return { components: {}, accessories: {} };
  };

  const initialBuildState = initializeBuildState();

  // State for selected components (category -> component mapping)
  const [selectedComponents, setSelectedComponents] = useState<{ [category: string]: PCComponent }>(
    initialBuildState.components
  );

  // State for selected accessories
  const [selectedAccessories, setSelectedAccessories] = useState<{ [id: string]: any }>(
    initialBuildState.accessories
  );
  const [showAccessories, setShowAccessories] = useState(false);

  // State for selected vendor offers
  const [selectedOffers, setSelectedOffers] = useState<{ [partId: string]: Offer }>({});

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, initialBudget]);

  // Compatibility override state
  const [overrideReason, setOverrideReason] = useState<string>('');

  // Build loading state
  const [, setIsLoadingSharedBuild] = useState(false);

  // Function to clear localStorage build state
  const clearBuildStorage = () => {
    try {
      localStorage.removeItem(BUILD_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear build state from localStorage:', error);
    }
  };

  // Persist build state to localStorage when it changes
  useEffect(() => {
    try {
      const buildState = {
        components: selectedComponents,
        accessories: selectedAccessories,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(buildState));
    } catch (error) {
      console.warn('Failed to save build state to localStorage:', error);
    }
  }, [selectedComponents, selectedAccessories, BUILD_STORAGE_KEY]);

  // Mock data queries - in real app these would be API calls
  //todo: remove mock functionality - replace with real API calls
  const { data: components = [] } = useQuery({
    queryKey: ['/api/components'],
    queryFn: () => Promise.resolve(mockComponents),
  });

  const { data: presets = [] } = useQuery({
    queryKey: ['/api/presets'],
    queryFn: () => Promise.resolve(mockPresets),
  });

  // Accessories query
  const { data: accessoriesData } = useQuery({
    queryKey: ['/api/accessories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/accessories');
      return await response.json();
    },
  });

  // Filter and sort components
  const filteredComponents = useMemo(() => {
    let filtered = components.filter((component: PCComponent) => {
      // Search query filter
      const matchesSearch =
        !searchQuery ||
        [component.name, component.brand, component.category, component.spec || '']
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;

      // Price filter
      const matchesPrice = component.price >= priceRange[0] && component.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort components
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'brand') {
      filtered.sort((a, b) => a.brand.localeCompare(b.brand));
    }

    return filtered;
  }, [components, searchQuery, selectedCategory, sortBy, priceRange]);

  // Apply use case filtering and prioritization, plus parent/kid mode preferences
  const prioritizedComponents = useMemo(() => {
    let components = filteredComponents;

    // Apply parent/kid mode preferences first (quieter, easier assembly, reliable brands)
    if (isParentKidMode) {
      components = [...components].sort((a, b) => {
        // Reliable brands prioritization (score higher for known reliable brands)
        const getReliabilityScore = (comp: PCComponent) => {
          const reliableBrands = [
            'ASUS',
            'MSI',
            'Gigabyte',
            'EVGA',
            'Corsair',
            'Seasonic',
            'Fractal Design',
            'be quiet!',
            'Noctua',
            'Cooler Master',
          ];
          const brand = comp.brand.toLowerCase();
          if (reliableBrands.some((reliable) => brand.includes(reliable.toLowerCase()))) return 3;
          return 0;
        };

        // Quiet/simple assembly prioritization by category
        const getQuietSimpleScore = (comp: PCComponent) => {
          let score = 0;
          const name = comp.name.toLowerCase();
          const spec = (comp.spec || '').toLowerCase();

          // Cases: prioritize quiet, mid-tower (easier than SFF), good airflow
          if (comp.category === 'Case') {
            if (
              name.includes('quiet') ||
              name.includes('silent') ||
              name.includes('sound dampening')
            )
              score += 3;
            if (name.includes('mid tower') || name.includes('mid-tower')) score += 2;
            if (name.includes('mini') || name.includes('itx') || name.includes('sff')) score -= 2; // Harder assembly
          }

          // PSU: prioritize modular (easier cable management), 80+ Gold or better
          if (comp.category === 'PSU') {
            if (name.includes('modular') && !name.includes('semi')) score += 2; // Full modular
            if (
              name.includes('80+ gold') ||
              name.includes('80+ platinum') ||
              name.includes('80+ titanium')
            )
              score += 2;
            if (name.includes('fanless') || name.includes('0rpm') || name.includes('quiet'))
              score += 1;
          }

          // CPU Coolers: prioritize stock or simple air coolers over complex AIOs
          if (comp.category.includes('Cooler') || comp.category.includes('Cooling')) {
            if (name.includes('stock') || name.includes('wraith')) score += 3; // Stock coolers are easiest
            if (name.includes('aio') || name.includes('liquid') || name.includes('water'))
              score -= 2; // AIOs are more complex
            if (name.includes('quiet') || name.includes('silent') || name.includes('noctua'))
              score += 1;
          }

          // Motherboards: prioritize ATX over mATX/ITX for easier building
          if (comp.category === 'Motherboard') {
            if (spec.includes('atx') && !spec.includes('micro') && !spec.includes('mini'))
              score += 1;
            if (name.includes('wifi') || spec.includes('wifi')) score += 1; // Built-in Wi-Fi is convenient
          }

          return score;
        };

        const aScore = getReliabilityScore(a) + getQuietSimpleScore(a);
        const bScore = getReliabilityScore(b) + getQuietSimpleScore(b);

        if (aScore !== bScore) return bScore - aScore; // Higher score first
        return 0;
      });
    }

    // Apply use case priorities if specified
    if (!useCase || !USE_CASE_PRIORITIES[useCase as keyof typeof USE_CASE_PRIORITIES]) {
      return components;
    }

    const priority = USE_CASE_PRIORITIES[useCase as keyof typeof USE_CASE_PRIORITIES];
    const { primaryCategories } = priority;

    // Separate primary and secondary categories
    const primary = components.filter((c) => primaryCategories.includes(c.category));
    const secondary = components.filter((c) => !primaryCategories.includes(c.category));

    // For gaming, prioritize high-end GPUs and CPUs
    if (useCase === 'gaming') {
      primary.sort((a, b) => {
        if (a.category === 'GPU' && b.category === 'GPU') {
          return b.price - a.price; // Higher price = better performance for GPUs
        }
        if (a.category === 'CPU' && b.category === 'CPU') {
          return b.price - a.price; // Higher price = better performance for CPUs
        }
        return 0;
      });
    }

    // For budget builds, prioritize value
    if (useCase === 'budget') {
      primary.sort((a, b) => a.price - b.price); // Lower price first
    }

    // For quiet SFF, prioritize low-power and compact components
    if (useCase === 'quiet-sff') {
      primary.sort((a, b) => {
        // For PSU, prioritize efficiency ratings and lower wattage
        if (a.category === 'PSU' && b.category === 'PSU') {
          const aEfficient = a.name.includes('80+ Gold') || a.name.includes('80+ Platinum');
          const bEfficient = b.name.includes('80+ Gold') || b.name.includes('80+ Platinum');
          if (aEfficient !== bEfficient) return aEfficient ? -1 : 1;
        }
        return 0;
      });
    }

    return [...primary, ...secondary];
  }, [filteredComponents, useCase, isParentKidMode]);

  // Calculate total price including accessories
  const componentPrice = Object.values(selectedComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );
  const accessoryPrice = Object.values(selectedAccessories).reduce(
    (sum, accessory) => sum + (accessory.lowestPrice || accessory.price),
    0
  );
  const totalPrice = componentPrice + accessoryPrice;

  // Compatibility checking
  const { data: compatibility, isLoading: compatibilityLoading } = useQuery({
    queryKey: ['/api/compatibility', selectedComponents, overrideReason],
    queryFn: async () => {
      if (Object.keys(selectedComponents).length === 0) {
        return null;
      }

      const response = await apiRequest('POST', '/api/compatibility', {
        build: selectedComponents,
        overrideReason,
      });
      return (await response.json()) as BuildCompatibility;
    },
    enabled: Object.keys(selectedComponents).length > 0,
  });

  // Override compatibility issues
  const overrideMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await apiRequest('POST', '/api/compatibility', {
        build: selectedComponents,
        overrideReason: reason,
      });
      return (await response.json()) as BuildCompatibility;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/compatibility'] });
    },
  });

  // Component selection handlers
  const handleSelectComponent = (component: PCComponent) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [component.category]: component,
    }));
  };

  const handleRemoveComponent = (category: string) => {
    setSelectedComponents((prev) => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const handleRemoveComponentById = (componentId: string) => {
    setSelectedComponents((prev) => {
      const updated = { ...prev };
      const category = Object.keys(updated).find((cat) => updated[cat].id === componentId);
      if (category) {
        delete updated[category];
      }
      return updated;
    });
  };

  // Handle component updates for provenance verification
  const handleUpdateComponent = (category: string, updatedComponent: PCComponent) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [category]: updatedComponent,
    }));
  };

  // Preset handlers
  const handleSelectPreset = (preset: BuildPreset) => {
    console.log('Applying preset:', preset.name);
    // In real app, would load preset components
    // For prototype, just show message
    alert(
      `Would apply "${preset.name}" preset build with ${preset.components ? JSON.parse(preset.components).length : 0} components`
    );
  };

  const handleViewPresetDetails = (preset: BuildPreset) => {
    console.log('View preset details:', preset.name);
    alert(
      `Viewing details for "${preset.name}"\nPrice: $${preset.price.toLocaleString()}\nTier: ${preset.tier}`
    );
  };

  // Build actions
  const handleSaveBuild = () => {
    console.log('Saving build with components:', selectedComponents);
    alert(`Build saved! Total components: ${Object.keys(selectedComponents).length}`);
  };

  const handleShareBuild = async () => {
    console.log('Sharing build:', selectedComponents);

    if (Object.keys(selectedComponents).length === 0) {
      alert('Please add some components before sharing your build.');
      return;
    }

    try {
      const buildData = {
        name: `PC Build - ${new Date().toLocaleDateString()}`,
        components: selectedComponents,
        totalPrice,
      };

      const response = await apiRequest('POST', '/api/builds', buildData);
      const result = await response.json();

      // Update URL with build ID
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('b', result.id);
      window.history.pushState({}, '', newUrl.toString());

      // Copy to clipboard
      await navigator.clipboard.writeText(newUrl.toString());
      alert('Build shared! Link copied to clipboard.');
    } catch (error) {
      console.error('Failed to share build:', error);
      alert('Failed to share build. Please try again.');
    }
  };

  const handleExportBuild = () => {
    console.log('Exporting build:', selectedComponents);
    const buildData = {
      components: selectedComponents,
      totalPrice,
      compatibility: compatibility
        ? {
            score: compatibility.score,
            issues: compatibility.hardFails.length + compatibility.softWarns.length,
          }
        : null,
      exportDate: new Date().toISOString(),
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(buildData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `eliterigs-build-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    alert('Build exported successfully!');
  };

  // Offer selection handler
  const handleOfferSelection = (partId: string, offer: Offer | null) => {
    setSelectedOffers((prev) => {
      if (offer === null) {
        const updated = { ...prev };
        delete updated[partId];
        return updated;
      } else {
        return { ...prev, [partId]: offer };
      }
    });
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout with components:', selectedComponents);
    console.log('Proceeding to checkout with accessories:', selectedAccessories);

    // Create cart items from selected offers
    const cartItems: CartItem[] = Object.entries(selectedOffers).map(([partId, offer]) => {
      const component = Object.values(selectedComponents).find((c) => c.id === partId);
      return {
        partId,
        partName: component ? `${component.brand} ${component.name}` : 'Unknown Part',
        offer,
      };
    });

    if (cartItems.length > 0) {
      // Generate cart with purchase links
      const partNames = Object.fromEntries(
        Object.values(selectedComponents).map((c) => [c.id, `${c.brand} ${c.name}`])
      );

      const cartHTML = buildCart(selectedOffers, partNames);
      const vendorBreakdown = getVendorBreakdown(cartItems);

      console.log('Cart HTML:', cartHTML);
      console.log('Vendor breakdown:', vendorBreakdown);

      // Create a more detailed checkout display
      const vendorSummary = Object.entries(vendorBreakdown)
        .map(
          ([vendor, details]) =>
            `${vendor}: ${details.count} items ($${details.total.toLocaleString()})`
        )
        .join('\n');

      alert(
        `Ready to checkout!\n\nVendor breakdown:\n${vendorSummary}\n\nOpen browser console to see purchase links.`
      );

      // In a real implementation, this would open vendor links or redirect to external checkout
      // For now, log the HTML links for testing
      console.log('Purchase links:', cartHTML);
    } else {
      // Fallback for components without selected offers
      const totalComponents = Object.keys(selectedComponents).length;
      const totalAccessories = Object.keys(selectedAccessories).length;
      const formatPrice = (price: number) => `$${price.toLocaleString()}`;
      alert(
        `Proceeding to checkout with ${totalComponents} components and ${totalAccessories} accessories totaling ${formatPrice(totalPrice)}\n\nNote: Select specific vendor offers in the pricing panel for direct purchase links.`
      );
    }
  };

  // Accessory handlers
  const handleAddAccessory = (accessory: any) => {
    setSelectedAccessories((prev) => ({
      ...prev,
      [accessory.id]: accessory,
    }));
  };

  const handleSkipAccessory = (accessoryId: string) => {
    setSelectedAccessories((prev) => {
      const updated = { ...prev };
      delete updated[accessoryId];
      return updated;
    });
  };

  // Smart accessory recommendations based on selected components
  const getRecommendedAccessories = () => {
    if (!accessoriesData) return [];

    const allAccessories = [...accessoriesData.essentials, ...accessoriesData.niceToHaves];
    const recommended = [];

    for (const accessory of allAccessories) {
      // Check if accessory is triggered by selected components
      const isTriggered = accessory.triggers.some((trigger: string) =>
        Object.keys(selectedComponents).includes(trigger)
      );

      if (isTriggered) {
        // Add specific logic for recommendations
        if (accessory.id === 'thermal-paste' && selectedComponents.Cooler) {
          // Recommend thermal paste if cooler doesn't typically include paste
          recommended.push({ ...accessory, reason: 'Your cooler may not include thermal paste' });
        } else if (
          accessory.id === 'case-fans' &&
          (selectedComponents.GPU || selectedComponents.CPU)
        ) {
          // Recommend case fans for performance builds
          recommended.push({
            ...accessory,
            reason: 'Additional cooling recommended for your build',
          });
        } else if (accessory.id === 'display-cable' && selectedComponents.GPU) {
          // Recommend display cable for gaming builds
          recommended.push({ ...accessory, reason: 'High-quality display cable for your GPU' });
        } else if (accessory.id === 'surge-protector') {
          // Always recommend surge protector
          recommended.push({ ...accessory, reason: 'Protect your investment from power surges' });
        } else if (isTriggered) {
          recommended.push(accessory);
        }
      }
    }

    return recommended.slice(0, 6); // Limit to 6 recommendations
  };

  // Handle compatibility override
  const handleOverride = (reason: string) => {
    setOverrideReason(reason);
    overrideMutation.mutate(reason);
  };

  // Load shared build on mount if URL parameter exists
  useEffect(() => {
    const loadSharedBuild = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const buildId = urlParams.get('b');

      if (!buildId) return;

      setIsLoadingSharedBuild(true);
      try {
        const response = await apiRequest('GET', `/api/builds/${buildId}`);
        const build = await response.json();

        if (build.components) {
          const components =
            typeof build.components === 'string' ? JSON.parse(build.components) : build.components;

          // Clear localStorage before loading shared build
          clearBuildStorage();

          setSelectedComponents(components);
          setSelectedAccessories({}); // Reset accessories for shared builds
          console.log('Loaded shared build:', build.name);
        }
      } catch (error) {
        console.error('Failed to load shared build:', error);
        // Remove invalid build ID from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('b');
        window.history.replaceState({}, '', newUrl.toString());
      } finally {
        setIsLoadingSharedBuild(false);
      }
    };

    loadSharedBuild();
  }, []);

  // Filter reset
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('relevance');
    setPriceRange([0, 2000]);
  };

  // SEO title and description based on use case
  const getSEOTitle = () => {
    if (useCase && budgetParam) {
      const useCaseTitle = useCase
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `${useCaseTitle} PC Build - $${parseInt(budgetParam).toLocaleString()} | EliteRigs`;
    }
    return 'PC Builder — EliteRigs Compatibility Checker';
  };

  const getSEODescription = () => {
    if (useCase && budgetParam) {
      const useCaseDesc =
        useCase === 'gaming'
          ? 'gaming PC'
          : useCase === 'streaming'
            ? 'streaming and content creation PC'
            : useCase === 'ai-ml'
              ? 'AI/ML workstation'
              : useCase === 'quiet-sff'
                ? 'quiet small form factor PC'
                : useCase === 'budget'
                  ? 'budget gaming PC'
                  : useCase === 'workstation'
                    ? 'professional workstation'
                    : 'custom PC';
      return `Build your perfect ${useCaseDesc} with a $${parseInt(budgetParam).toLocaleString()} budget. Get compatibility checks, pricing comparisons, and accessory recommendations.`;
    }
    return 'Build your perfect PC with compatibility checking, real-time pricing, and smart component recommendations. No guesswork, just results.';
  };

  return (
    <>
      <SEOHead
        title={getSEOTitle()}
        description={getSEODescription()}
        pageType="builder"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'EliteRigs PC Builder',
          description:
            'Interactive PC building tool with real-time compatibility checking and component recommendations',
          url: window.location.href,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web Browser',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: [
            'Component compatibility checking',
            'Real-time pricing comparison',
            'Smart accessory recommendations',
            'Build sharing and collaboration',
          ],
        }}
      />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-muted/30 to-muted/10 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h1
              className="text-3xl md:text-4xl font-bold tracking-tight"
              data-testid="text-hero-title"
            >
              Build smarter rigs, faster.
            </h1>
            <p className="mt-2 text-lg text-muted-foreground" data-testid="text-hero-subtitle">
              Professional PC building platform with compatibility checking and real-time pricing.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Featured Presets */}
              <section>
                <h2 className="text-2xl font-semibold mb-4" data-testid="text-presets-title">
                  Featured Build Presets
                </h2>
                <div
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  data-testid="grid-presets"
                >
                  {presets.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      onSelect={handleSelectPreset}
                      onViewDetails={handleViewPresetDetails}
                    />
                  ))}
                </div>
              </section>

              {/* Component Search and Filters */}
              <section>
                <h2 className="text-2xl font-semibold mb-4" data-testid="text-components-title">
                  PC Components
                </h2>

                <SearchFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  onClearFilters={handleClearFilters}
                />

                {/* Results Info */}
                <div className="flex justify-between items-center mt-4 mb-4">
                  <span className="text-sm text-muted-foreground" data-testid="text-results-count">
                    {prioritizedComponents.length} components found
                    {useCase && (
                      <span className="ml-2 text-primary">
                        (optimized for {useCase.replace('-', ' ')})
                      </span>
                    )}
                  </span>
                  {searchQuery && (
                    <span className="text-sm text-muted-foreground">
                      Searching for: "{searchQuery}"
                    </span>
                  )}
                </div>

                {/* Component Grid */}
                <div
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  data-testid="grid-components"
                >
                  {prioritizedComponents.map((component) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      isSelected={selectedComponents[component.category]?.id === component.id}
                      onSelect={handleSelectComponent}
                      onRemove={handleRemoveComponentById}
                      onUpdate={(updatedComponent) =>
                        handleUpdateComponent(component.category, updatedComponent)
                      }
                    />
                  ))}
                </div>

                {prioritizedComponents.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No components found matching your criteria.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="text-primary hover:underline mt-2"
                    >
                      Clear filters to see all components
                    </button>
                  </div>
                )}
              </section>

              {/* Build Completer Section */}
              {Object.keys(selectedComponents).length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2
                        className="text-2xl font-semibold flex items-center gap-2"
                        data-testid="text-accessories-title"
                      >
                        <Package className="w-6 h-6 text-primary" />
                        Build Completer
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Don't forget these essentials and nice-to-have accessories for your build
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowAccessories(!showAccessories)}
                      className="gap-2"
                      data-testid="button-toggle-accessories"
                    >
                      {showAccessories ? 'Hide' : 'Show'} Accessories
                      <Badge variant="secondary" className="ml-1">
                        {getRecommendedAccessories().length}
                      </Badge>
                    </Button>
                  </div>

                  {showAccessories && (
                    <Card className="p-4">
                      <div className="space-y-6">
                        {/* Smart Recommendations */}
                        {getRecommendedAccessories().length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-chart-3" />
                              <h3 className="font-semibold text-chart-3">Smart Recommendations</h3>
                              <Badge variant="outline" className="text-chart-3 border-chart-3/30">
                                Based on your build
                              </Badge>
                            </div>
                            <div
                              className="grid gap-4 sm:grid-cols-2"
                              data-testid="grid-recommended-accessories"
                            >
                              {getRecommendedAccessories().map((accessory) => (
                                <AccessoryCard
                                  key={`recommended-${accessory.id}`}
                                  accessory={accessory}
                                  isSelected={!!selectedAccessories[accessory.id]}
                                  isRecommended={true}
                                  onAdd={handleAddAccessory}
                                  onSkip={handleSkipAccessory}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* All Essentials */}
                        {accessoriesData?.essentials && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                              <h3 className="font-semibold text-primary">Essentials</h3>
                              <Badge variant="outline" className="text-primary border-primary/30">
                                Recommended for all builds
                              </Badge>
                            </div>
                            <div
                              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                              data-testid="grid-essential-accessories"
                            >
                              {accessoriesData.essentials
                                .filter(
                                  (accessory: any) =>
                                    !getRecommendedAccessories().some(
                                      (rec) => rec.id === accessory.id
                                    )
                                )
                                .map((accessory: any) => (
                                  <AccessoryCard
                                    key={`essential-${accessory.id}`}
                                    accessory={accessory}
                                    isSelected={!!selectedAccessories[accessory.id]}
                                    onAdd={handleAddAccessory}
                                    onSkip={handleSkipAccessory}
                                    showRecommendedBadge={false}
                                  />
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Nice-to-Haves */}
                        {accessoriesData?.niceToHaves && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <h3 className="font-semibold text-muted-foreground">Nice to Have</h3>
                              <Badge variant="outline">Optional upgrades</Badge>
                            </div>
                            <div
                              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                              data-testid="grid-optional-accessories"
                            >
                              {accessoriesData.niceToHaves
                                .filter(
                                  (accessory: any) =>
                                    !getRecommendedAccessories().some(
                                      (rec) => rec.id === accessory.id
                                    )
                                )
                                .map((accessory: any) => (
                                  <AccessoryCard
                                    key={`optional-${accessory.id}`}
                                    accessory={accessory}
                                    isSelected={!!selectedAccessories[accessory.id]}
                                    onAdd={handleAddAccessory}
                                    onSkip={handleSkipAccessory}
                                    showRecommendedBadge={false}
                                  />
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Summary */}
                        {Object.keys(selectedAccessories).length > 0 && (
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">
                                Selected Accessories ({Object.keys(selectedAccessories).length})
                              </span>
                              <span className="font-bold text-primary">
                                +${accessoryPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </section>
              )}
            </div>

            {/* Build Summary Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Compatibility Status */}
              <CompatibilityStatus
                compatibility={compatibility ?? null}
                isLoading={compatibilityLoading}
                onOverride={handleOverride}
              />

              {/* Build Summary */}
              <BuildSummary
                selectedComponents={selectedComponents}
                selectedAccessories={selectedAccessories}
                totalPrice={totalPrice}
                componentPrice={componentPrice}
                accessoryPrice={accessoryPrice}
                compatibility={compatibility ?? null}
                selectedOffers={selectedOffers}
                isParentKidMode={isParentKidMode}
                onOfferSelected={handleOfferSelection}
                onSaveBuild={handleSaveBuild}
                onShareBuild={handleShareBuild}
                onExportBuild={handleExportBuild}
                onCheckout={handleCheckout}
                onRemoveComponent={handleRemoveComponent}
                onRemoveAccessory={handleSkipAccessory}
                onUpdateComponent={handleUpdateComponent}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
