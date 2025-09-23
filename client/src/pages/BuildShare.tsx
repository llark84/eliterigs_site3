import { useQuery } from '@tanstack/react-query';
import { Share2, ExternalLink, Boxes } from 'lucide-react';
import { useRoute } from 'wouter';

import SEOHead from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BuildData {
  id: string;
  name: string;
  components: string; // JSON string
  totalPrice: number;
  isPublic: boolean;
}

export default function BuildShare() {
  const [match, params] = useRoute('/build/:buildId');
  const buildId = params?.buildId;

  const {
    data: buildData,
    isLoading,
    error,
  } = useQuery<BuildData>({
    queryKey: ['/api/builds', buildId],
    enabled: !!buildId,
  });

  // Generate JSON-LD for the shared build
  const buildJsonLd = buildData
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${buildData.name} - Custom PC Build`,
        description: `Complete PC build configuration: ${buildData.name}. Custom selected components with compatibility checking and pricing.`,
        category: 'Computer Hardware',
        brand: {
          '@type': 'Organization',
          name: 'EliteRigs',
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'USD',
          lowPrice: buildData.totalPrice,
          highPrice: buildData.totalPrice,
          price: buildData.totalPrice,
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.5',
          reviewCount: '1',
        },
      }
    : null;

  if (!match || !buildId) {
    return <div className="min-h-screen bg-background p-8">Build not found</div>;
  }

  if (isLoading) {
    return (
      <>
        <SEOHead pageType="build-share" />
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="grid gap-4 mt-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-20 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  if (error || !buildData) {
    return (
      <>
        <SEOHead pageType="build-share" />
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h1 className="text-2xl font-bold text-muted-foreground">Build Not Found</h1>
                <p className="mt-2 text-muted-foreground">
                  This build might be private or no longer available.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const components = buildData.components ? JSON.parse(buildData.components) : [];

  return (
    <>
      <SEOHead
        pageType="build-share"
        title={`${buildData.name} - Shared PC Build - EliteRigs`}
        description={`View this shared PC build: ${buildData.name}. Complete component list, pricing analysis, and compatibility notes. Total: $${buildData.totalPrice}.`}
        ogImage="/og-default.svg"
        ogType="product"
        jsonLd={buildJsonLd}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-8 space-y-8">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle
                    className="flex items-center gap-3 text-2xl"
                    data-testid="text-build-name"
                  >
                    <Share2 className="h-6 w-6 text-blue-600" />
                    {buildData.name}
                  </CardTitle>
                  <CardDescription>
                    Shared PC build configuration with {components.length} components
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600" data-testid="text-total-price">
                    ${buildData.totalPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Price</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Components List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-5 w-5" />
                Build Components
              </CardTitle>
              <CardDescription>
                Complete list of selected components with specifications and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {components.map((component: any, index: number) => (
                <div
                  key={component.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-muted">
                      <Boxes className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {component.category || 'Component'}
                        </Badge>
                        <span className="font-medium" data-testid={`text-component-name-${index}`}>
                          {component.name || 'Unknown Component'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {component.brand || 'Generic'} • {component.spec || 'Standard'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold" data-testid={`text-component-price-${index}`}>
                      ${(component.price || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Build Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">Like this build?</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your own custom PC configuration with our builder
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-share-build">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button data-testid="button-customize-build">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Customize Build
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
