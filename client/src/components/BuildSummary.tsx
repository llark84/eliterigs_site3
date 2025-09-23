import { PCComponent, BuildCompatibility } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  Save,
  Share2,
  AlertTriangle,
  CheckCircle2,
  X,
  Download,
  ShoppingCart,
  RefreshCw,
  Clock,
  FileText,
  Printer,
  Shield,
  Wrench,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { lazy, Suspense } from 'react';
import AssemblyChecklist from '@/components/AssemblyChecklist';
import IntegrityReport from '@/components/IntegrityReport';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { downloadJSONExport, openPrintView } from '@/features/export';
import { apiRequest, queryClient } from '@/lib/queryClient';

import { simpleChecks, type BuildComponents, type IntegrityResult } from '@/lib/simpleIntegrity';
import ProvenanceBadge from '@/components/ProvenanceBadge';
import PricingPanel from '@/components/PricingPanel';

// Lazy load assembly modal for better performance
const AssemblyOverviewModal = lazy(() => import('@/components/AssemblyOverviewModal'));
import CombinedCartDisplay from '@/components/CombinedCartDisplay';
import MissingEssentialsStrip from '@/components/MissingEssentialsStrip';
import PreFlightFitCheck from '@/components/PreFlightFitCheck';

import type { PartIdentity, Offer } from '@shared/schema';

interface BuildSummaryProps {
  selectedComponents: { [category: string]: PCComponent };
  selectedAccessories?: { [id: string]: any };
  totalPrice: number;
  componentPrice?: number;
  accessoryPrice?: number;
  compatibility?: BuildCompatibility | null;
  selectedOffers?: { [partId: string]: Offer };
  isParentKidMode?: boolean;
  onOfferSelected?: (partId: string, offer: Offer | null) => void;
  onSaveBuild?: () => void;
  onShareBuild?: () => void;
  onExportBuild?: () => void;
  onCheckout?: () => void;
  onRemoveComponent?: (category: string) => void;
  onRemoveAccessory?: (accessoryId: string) => void;
  onUpdateComponent?: (category: string, component: PCComponent) => void;
}

interface PricingData {
  totalLowestPrice: number;
  totalHighestPrice: number;
  vendorBreakdown: { [vendor: string]: { total: number; components: number } };
  generatedAt: string;
  fromCache: boolean;
}

export default function BuildSummary({
  selectedComponents,
  selectedAccessories = {},
  totalPrice,
  componentPrice = 0,
  accessoryPrice = 0,
  compatibility,
  selectedOffers: passedSelectedOffers,
  isParentKidMode = false,
  onOfferSelected,
  onSaveBuild,
  onShareBuild,
  onExportBuild,
  onCheckout,
  onRemoveComponent,
  onRemoveAccessory,
  onUpdateComponent,
}: BuildSummaryProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showIntegrityReport, setShowIntegrityReport] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<IntegrityResult>({
    passes: [],
    warnings: [],
    fails: [],
    score: 0,
  });
  const [selectedOffers, setSelectedOffers] = useState<{ [partId: string]: Offer }>(
    passedSelectedOffers || {}
  );
  const [showPricingPanel, setShowPricingPanel] = useState(false);
  const [showAssemblyChecklist, setShowAssemblyChecklist] = useState(false);
  const [showCombinedCart, setShowCombinedCart] = useState(false);

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const componentCount = Object.keys(selectedComponents).length;
  const accessoryCount = Object.keys(selectedAccessories).length;
  const totalItemCount = componentCount + accessoryCount;
  const requiredCategories = ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'PSU', 'Case'];
  const missingCategories = requiredCategories.filter((cat) => !selectedComponents[cat]);
  const isComplete = missingCategories.length === 0;

  // Run integrity checks whenever components change
  useEffect(() => {
    if (componentCount > 0) {
      const result = simpleChecks(selectedComponents as BuildComponents);
      setIntegrityResult(result);
    }
  }, [selectedComponents, componentCount]);

  // Convert components to array for pricing API
  const componentsArray = Object.values(selectedComponents);

  // Convert components to PartIdentity format for new pricing system
  const partsForPricing: PartIdentity[] = componentsArray.map((component) => ({
    id: component.id,
    kind:
      Object.keys(selectedComponents).find((key) => selectedComponents[key].id === component.id) ||
      component.category.toLowerCase(),
    manufacturer: component.brand,
    model: component.name,
    sku: undefined,
    upc: undefined,
    mpn: undefined,
  }));

  // Fetch pricing data
  const {
    data: pricingData,
    isLoading: isPricingLoading,
    refetch: refetchPricing,
  } = useQuery({
    queryKey: [
      '/api/prices',
      componentsArray
        .map((c) => c.id)
        .sort()
        .join(','),
    ],
    queryFn: async () => {
      if (componentsArray.length === 0) return null;
      const response = await apiRequest('POST', '/api/prices', { components: componentsArray });
      return response.json() as Promise<PricingData>;
    },
    enabled: componentsArray.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Pricing refresh mutation
  const pricingRefreshMutation = useMutation({
    mutationFn: async () => {
      // Use current components array, not stale closure
      const currentComponents = Object.values(selectedComponents);
      const response = await apiRequest('POST', '/api/prices', { components: currentComponents });
      return response.json() as Promise<PricingData>;
    },
    onSuccess: (data) => {
      // Use current components array for query key, not stale closure
      const currentComponents = Object.values(selectedComponents);
      const queryKey = [
        '/api/prices',
        currentComponents
          .map((c) => c.id)
          .sort()
          .join(','),
      ];
      queryClient.setQueryData(queryKey, data);
    },
  });

  // Get vendor count from pricing data
  const vendorCount = pricingData?.vendorBreakdown
    ? Object.keys(pricingData.vendorBreakdown).length
    : 0;

  // Calculate total based on selected offers or best prices
  const calculateCustomTotal = () => {
    let customTotal = accessoryPrice; // Start with accessory price

    Object.values(selectedComponents).forEach((component) => {
      const selectedOffer = selectedOffers[component.id];
      if (selectedOffer) {
        customTotal += selectedOffer.total;
      } else {
        customTotal += component.price; // Fallback to component price
      }
    });

    return customTotal;
  };

  const customTotal = calculateCustomTotal();
  const usingCustomPricing = Object.keys(selectedOffers).length > 0;
  const displayTotal = usingCustomPricing ? customTotal : totalPrice;

  // Get best pricing info
  const bestPrice = pricingData?.totalLowestPrice ?? totalPrice;
  const potentialSavings = pricingData ? totalPrice - pricingData.totalLowestPrice : 0;
  const customSavings = usingCustomPricing ? totalPrice - customTotal : 0;

  // Get compatibility score
  const compatibilityScore = compatibility?.score ?? 100;

  // Export handlers
  const handleExportJSON = () => {
    const buildName = `PC Build - ${new Date().toLocaleDateString()}`;
    downloadJSONExport(
      selectedComponents,
      totalPrice,
      compatibility ?? null,
      buildName,
      selectedAccessories,
      componentPrice,
      accessoryPrice
    );
  };

  const handlePrintSheet = () => {
    const buildName = `PC Build - ${new Date().toLocaleDateString()}`;
    openPrintView(
      selectedComponents,
      totalPrice,
      compatibility ?? null,
      buildName,
      pricingData
        ? {
            totalLowestPrice: pricingData.totalLowestPrice,
            vendorBreakdown: pricingData.vendorBreakdown,
            generatedAt: pricingData.generatedAt,
          }
        : undefined,
      selectedAccessories,
      componentPrice,
      accessoryPrice
    );
  };

  // Handle scroll to show/hide sticky bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 300 && totalItemCount > 0;
      setShowStickyBar(shouldShow);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalItemCount]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <Card className="sticky top-4" data-testid="card-build-summary">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            Current Build
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-chart-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Build Status */}
          <div className="text-sm space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Components</span>
              <span data-testid="text-component-count">{componentCount} selected</span>
            </div>

            {accessoryCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Accessories</span>
                <span data-testid="text-accessory-count">{accessoryCount} selected</span>
              </div>
            )}

            {!isComplete && (
              <div className="text-yellow-600 dark:text-yellow-400 text-xs">
                Missing: {missingCategories.join(', ')}
              </div>
            )}
          </div>

          {/* Parent/Kid Mode Note */}
          {isParentKidMode && (
            <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-md">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Quiet build, easier assembly parts chosen
              </span>
            </div>
          )}

          <Separator />

          {/* Selected Components and Accessories List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {/* Components Section */}
            {Object.entries(selectedComponents).map(([category, component]) => (
              <div
                key={category}
                className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xs text-muted-foreground">{category}</div>
                    <ProvenanceBadge
                      component={component}
                      size="sm"
                      onUpdate={(updatedComponent) =>
                        onUpdateComponent?.(category, updatedComponent)
                      }
                    />
                  </div>
                  <div
                    className="text-sm font-medium truncate"
                    data-testid={`text-selected-${category.toLowerCase()}`}
                  >
                    {component.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatPrice(component.price)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveComponent?.(category)}
                  className="w-6 h-6 p-0"
                  data-testid={`button-remove-${category.toLowerCase()}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Accessories Section */}
            {Object.entries(selectedAccessories).map(([id, accessory]) => (
              <div
                key={`accessory-${id}`}
                className="flex items-center justify-between gap-2 p-2 rounded-md bg-primary/5 border border-primary/20"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-primary/60">Accessory</div>
                  <div
                    className="text-sm font-medium truncate"
                    data-testid={`text-selected-accessory-${id}`}
                  >
                    {accessory.name}
                  </div>
                  <div className="text-xs text-primary/60">
                    {formatPrice(accessory.lowestPrice || accessory.price)}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveAccessory?.(id)}
                  className="w-6 h-6 p-0 text-primary/60 hover:text-primary"
                  data-testid={`button-remove-accessory-${id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {totalItemCount === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No components selected yet
              </div>
            )}
          </div>

          <Separator />

          {/* Pre-Flight Fit Check */}
          {componentCount >= 2 && (
            <>
              <PreFlightFitCheck selectedComponents={selectedComponents} />
              <Separator />
            </>
          )}

          {/* Pricing Section */}
          <div className="space-y-3">
            {/* Component Price Breakdown */}
            {(componentCount > 0 || accessoryCount > 0) && (
              <div className="space-y-2">
                {componentCount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Components ({componentCount})</span>
                    <span data-testid="text-component-price">{formatPrice(componentPrice)}</span>
                  </div>
                )}

                {accessoryCount > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Accessories ({accessoryCount})</span>
                    <span className="text-primary" data-testid="text-accessory-price">
                      {formatPrice(accessoryPrice)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center border-t pt-2">
              <span className="font-semibold">Total Price</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary" data-testid="text-total-price">
                  {formatPrice(displayTotal)}
                </div>
                {usingCustomPricing && (
                  <div className="text-xs text-chart-2">
                    Selected offers{' '}
                    {customSavings > 0 ? `(Save $${customSavings.toLocaleString()})` : ''}
                  </div>
                )}
                {totalItemCount > 0 && !usingCustomPricing && (
                  <div className="text-xs text-muted-foreground">
                    ~${Math.round(displayTotal / totalItemCount)} per item
                  </div>
                )}
              </div>
            </div>

            {pricingData && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Best Price Available</span>
                  <div className="text-right">
                    <span
                      className="font-semibold text-lg text-chart-2"
                      data-testid="text-best-price"
                    >
                      {formatPrice(bestPrice)}
                    </span>
                    {potentialSavings > 0 && (
                      <div className="text-xs text-chart-2">
                        Save ${potentialSavings.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span data-testid="text-price-check-time">
                      Last price check:{' '}
                      {formatDistanceToNow(new Date(pricingData.generatedAt), { addSuffix: true })}
                      {pricingData.fromCache && ' (cached)'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => pricingRefreshMutation.mutate()}
                    disabled={pricingRefreshMutation.isPending}
                    className="h-6 px-2"
                    data-testid="button-refresh-pricing"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${pricingRefreshMutation.isPending ? 'animate-spin' : ''}`}
                    />
                  </Button>
                </div>
              </>
            )}

            {isPricingLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Checking prices across vendors...</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Compatibility Status */}
          <div className="flex items-center gap-2">
            <Badge variant={isComplete ? 'default' : 'secondary'}>
              {isComplete ? 'Build Complete' : 'In Progress'}
            </Badge>
            {compatibility && (
              <Badge
                variant={compatibility.hardFails.length > 0 ? 'destructive' : 'outline'}
                className={compatibility.hardFails.length === 0 ? 'text-chart-2' : ''}
              >
                Score: {compatibilityScore}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Missing Essentials Strip */}
      {componentCount > 0 && (
        <div className="mt-4">
          <MissingEssentialsStrip selectedComponents={selectedComponents} />
        </div>
      )}

      <Card className="sticky bottom-4 z-10 border shadow-lg">
        <CardContent className="p-4">
          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={onSaveBuild}
              disabled={totalItemCount === 0}
              className="w-full"
              data-testid="button-save-build"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Build
            </Button>

            <Button
              variant="outline"
              onClick={onShareBuild}
              disabled={totalItemCount === 0}
              className="w-full"
              data-testid="button-share-build"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Build
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportJSON}
                disabled={totalItemCount === 0}
                className="flex-1"
                data-testid="button-export-json"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export JSON
              </Button>

              <Button
                variant="outline"
                onClick={handlePrintSheet}
                disabled={totalItemCount === 0}
                className="flex-1"
                data-testid="button-print-sheet"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Sheet
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowIntegrityReport(true)}
              disabled={componentCount === 0}
              className="w-full"
              data-testid="button-integrity-report"
            >
              <Shield className="w-4 h-4 mr-2" />
              Integrity Report
              {integrityResult.score > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {integrityResult.score}/100
                </Badge>
              )}
            </Button>

            {/* Compare Prices Button */}
            <Button
              variant="outline"
              onClick={() => setShowPricingPanel(!showPricingPanel)}
              disabled={componentCount === 0}
              className="w-full"
              data-testid="button-compare-prices"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Compare Prices
              {showPricingPanel && (
                <Badge variant="secondary" className="ml-2">
                  Open
                </Badge>
              )}
            </Button>

            {/* Assembly Overview Modal */}
            <Suspense
              fallback={
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                  data-testid="button-assembly-overview"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Loading...
                </Button>
              }
            >
              <AssemblyOverviewModal
                trigger={
                  <Button
                    variant="outline"
                    className="w-full"
                    data-testid="button-assembly-overview"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Assembly Guide (10 min)
                  </Button>
                }
              />
            </Suspense>

            {/* Assembly Checklist Button */}
            <Button
              variant="outline"
              onClick={() => setShowAssemblyChecklist(!showAssemblyChecklist)}
              className="w-full"
              data-testid="button-assembly-checklist"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Assembly Checklist
              {showAssemblyChecklist && (
                <Badge variant="secondary" className="ml-2">
                  Open
                </Badge>
              )}
            </Button>

            {/* Buy PC + Accessories Button */}
            {(componentCount > 0 || accessoryCount > 0) && (
              <Button
                variant="default"
                onClick={() => setShowCombinedCart(!showCombinedCart)}
                className="w-full"
                data-testid="button-buy-pc-accessories"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy PC + Accessories
                {showCombinedCart && (
                  <Badge variant="secondary" className="ml-2">
                    Open
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Panel Section */}
      {showPricingPanel && componentCount > 0 && (
        <div className="mt-6" data-testid="section-pricing-panel">
          <PricingPanel
            parts={partsForPricing}
            selectedOffers={selectedOffers}
            onOfferSelected={
              onOfferSelected ||
              ((partId, offer) => {
                setSelectedOffers((prev) => {
                  const updated = { ...prev };
                  if (offer) {
                    updated[partId] = offer;
                  } else {
                    delete updated[partId];
                  }
                  return updated;
                });
              })
            }
          />
        </div>
      )}

      {/* Assembly Checklist Section */}
      {showAssemblyChecklist && (
        <div className="mt-6" data-testid="section-assembly-checklist">
          <AssemblyChecklist
            onClose={() => setShowAssemblyChecklist(false)}
            hasAccessories={accessoryCount > 0}
            selectedAccessories={selectedAccessories}
          />
        </div>
      )}

      {/* Combined Cart Section */}
      {showCombinedCart && (componentCount > 0 || accessoryCount > 0) && (
        <div className="mt-6" data-testid="section-combined-cart">
          <CombinedCartDisplay
            selectedOffers={selectedOffers}
            selectedComponents={selectedComponents}
            selectedAccessories={selectedAccessories}
            onClose={() => setShowCombinedCart(false)}
          />
        </div>
      )}

      {/* Sticky Bottom Bar */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-border 
          transform transition-transform duration-300 ease-in-out
          ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}
        `}
        data-testid="sticky-build-summary"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Build Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Items:</span>
                <Badge variant="outline" data-testid="sticky-part-count">
                  {totalItemCount}
                </Badge>
                {accessoryCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({componentCount} + {accessoryCount})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold text-lg" data-testid="sticky-total-price">
                  {formatPrice(displayTotal)}
                </span>
                {usingCustomPricing && <span className="text-xs text-chart-2 ml-1">(custom)</span>}
              </div>

              {compatibility && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Score:</span>
                  <Badge
                    variant={compatibility.hardFails.length > 0 ? 'destructive' : 'default'}
                    data-testid="sticky-compatibility-score"
                  >
                    {compatibilityScore}
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Vendors:</span>
                <Badge variant="secondary" data-testid="sticky-vendor-count">
                  {vendorCount}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onShareBuild}
                disabled={totalItemCount === 0}
                data-testid="sticky-button-share"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onExportBuild}
                disabled={totalItemCount === 0}
                data-testid="sticky-button-export"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>

              <Button
                size="sm"
                onClick={onCheckout}
                disabled={totalItemCount === 0}
                data-testid="sticky-button-checkout"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Integrity Report Modal */}
      <IntegrityReport
        open={showIntegrityReport}
        onOpenChange={setShowIntegrityReport}
        integrityResult={integrityResult}
        selectedComponents={selectedComponents}
      />
    </>
  );
}
