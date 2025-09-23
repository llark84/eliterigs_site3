import { Gamepad2, Monitor, Zap, HardDrive, Cpu, MemoryStick, ExternalLink } from 'lucide-react';
import { useRoute, useLocation } from 'wouter';

import SEOHead from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockPresets, mockComponents } from '@/lib/mock-data';
import type { ComponentWithDescriptions } from '@/lib/beginnerMode';

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  const icons = {
    CPU: Cpu,
    GPU: Monitor,
    RAM: MemoryStick,
    Motherboard: Monitor,
    Storage: HardDrive,
    SSD: HardDrive,
    HDD: HardDrive,
    PSU: Zap,
    Case: Monitor,
    Cooler: Monitor,
  };
  return icons[category as keyof typeof icons] || Monitor;
};

export default function PresetView() {
  // Support both /presets/:presetId and legacy /preset/:presetId routes
  const [match1, params1] = useRoute('/presets/:presetId');
  const [match2, params2] = useRoute('/preset/:presetId');
  const [, setLocation] = useLocation();
  
  const match = match1 || match2;
  const presetId = params1?.presetId ?? params2?.presetId;
  const preset = presetId ? mockPresets.find(p => p.id === presetId) : null;

  const handleStartBuilding = () => {
    // Navigate to builder with preset parameter
    setLocation(`/builder?preset=${presetId}`);
  };

  if (!match || !preset) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-muted-foreground">Preset Not Found</h1>
              <p className="mt-2 text-muted-foreground">This build preset is not available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get components for this preset
  const presetComponents: ComponentWithDescriptions[] = preset && preset.components ? 
    JSON.parse(preset.components as string).map((id: string) => 
      mockComponents.find(c => c.id === id)
    ).filter((c): c is ComponentWithDescriptions => c !== undefined) : [];

  // TechArticle JSON-LD for preset builds
  const presetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: preset.name,
    description: preset.description || '',
    datePublished: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      name: 'EliteRigs',
      url: window.location.origin,
    },
    publisher: {
      '@type': 'Organization',
      name: 'EliteRigs',
      url: window.location.origin,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href,
    },
    articleSection: 'PC Building',
    keywords: ['PC building', 'gaming build', 'computer build', 'PC preset', preset.tier || 'gaming'],
    about: {
      '@type': 'Product',
      name: preset.name,
      category: 'Computer Hardware',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        price: preset.price,
      },
    },
  };

  return (
    <>
      <SEOHead
        pageType="preset"
        title={`${preset.name} — EliteRigs`}
        description={preset.description}
        ogImage="/og-default.svg"
        ogType="article"
        jsonLd={presetJsonLd}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="h-6 w-6 text-blue-600" />
                    <Badge variant="outline">{preset.tier}</Badge>
                  </div>
                  <CardTitle className="text-2xl" data-testid="text-preset-name">
                    {preset.name}
                  </CardTitle>
                  <p className="text-muted-foreground">{preset.description}</p>
                </div>
                <div className="text-right">
                  <div
                    className="text-2xl font-bold text-green-600"
                    data-testid="text-preset-price"
                  >
                    ${preset.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Est. Total</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Components */}
          <Card>
            <CardHeader>
              <CardTitle>Build Components</CardTitle>
              <CardDescription>
                Carefully selected components optimized for {preset.tier} performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {presetComponents.map((component, index) => {
                const Icon = getCategoryIcon(component.category);
                return (
                  <div
                    key={component.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium" data-testid={`text-component-${component.id}`}>
                          {component.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{component.category}</div>
                      </div>
                    </div>
                    <div className="font-semibold" data-testid={`text-price-${component.id}`}>
                      ${component.price.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ready to build?</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with this preset and customize to your needs
                  </p>
                </div>
                <Button onClick={handleStartBuilding} data-testid="button-start-build">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Start Building
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
