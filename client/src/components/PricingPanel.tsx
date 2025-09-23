import type { PartIdentity, PriceResult, Offer } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Clock, ExternalLink, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface PricingPanelProps {
  parts: PartIdentity[];
  onOfferSelected?: (partId: string, offer: Offer | null) => void;
  selectedOffers?: { [partId: string]: Offer };
}

interface PricingApiResponse {
  results: PriceResult[];
  vendors: string[];
  generatedAt: string;
}

export default function PricingPanel({
  parts,
  onOfferSelected,
  selectedOffers = {},
}: PricingPanelProps) {
  const [lastRefreshTime, setLastRefreshTime] = useState<string>(new Date().toISOString());

  // Create cache key based on parts
  const cacheKey = [
    'api/prices',
    parts
      .map((p) => `${p.manufacturer}-${p.model}`)
      .sort()
      .join(','),
  ];

  // Fetch enabled vendors first
  const { data: vendorsData } = useQuery({
    queryKey: ['api/prices/vendors'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/prices/vendors');
      return response.json() as Promise<{ vendors: string[] }>;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch pricing data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: cacheKey,
    queryFn: async (): Promise<PricingApiResponse> => {
      if (parts.length === 0) {
        return { results: [], vendors: [], generatedAt: new Date().toISOString() };
      }
      const response = await apiRequest('POST', '/api/prices', { parts });
      return response.json();
    },
    enabled: parts.length > 0 && (vendorsData?.vendors.length || 0) > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/prices', { parts });
      return response.json() as Promise<PricingApiResponse>;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(cacheKey, newData);
      setLastRefreshTime(newData.generatedAt);
    },
  });

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const handleOfferSelection = (partId: string, offer: Offer | null) => {
    onOfferSelected?.(partId, offer);
  };

  const getSelectedOffer = (partId: string) => {
    return selectedOffers[partId] || null;
  };

  const isOfferSelected = (partId: string, offer: Offer) => {
    const selected = getSelectedOffer(partId);
    return selected?.vendor === offer.vendor && selected?.url === offer.url;
  };

  // Check if vendors are enabled
  const noVendorsEnabled = vendorsData?.vendors.length === 0;

  if (noVendorsEnabled) {
    return (
      <Card data-testid="card-pricing-panel">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="text-destructive font-medium mb-2">No vendors enabled.</div>
            <div className="text-sm text-muted-foreground">
              Configure ENABLED_VENDORS environment variable to enable price comparison.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (parts.length === 0) {
    return (
      <Card data-testid="card-pricing-panel">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Add components to your build to compare prices
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-pricing-panel">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Compare Prices
            {data && <Badge variant="secondary">{data.vendors.length} vendors</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            {data && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span data-testid="text-last-price-check">
                  Last check: {formatDistanceToNow(new Date(data.generatedAt), { addSuffix: true })}
                </span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending || isLoading}
              data-testid="button-refresh-prices"
            >
              <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching prices from {parts.length} parts...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive">
            Failed to fetch pricing data. Please try again.
          </div>
        )}

        {data && data.results.length > 0 && (
          <div className="space-y-6">
            {data.results.map((result) => {
              const part = parts.find((p) => p.id === result.partId);
              const selectedOffer = getSelectedOffer(result.partId);

              if (!part) return null;

              return (
                <div key={result.partId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium" data-testid={`text-part-name-${result.partId}`}>
                      {part.manufacturer} {part.model}
                    </h3>
                    <div className="flex items-center gap-2">
                      {selectedOffer && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {selectedOffer.vendor} selected
                        </Badge>
                      )}
                      {result.offers.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {result.offers.length} offers
                        </Badge>
                      )}
                    </div>
                  </div>

                  {result.offers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm border rounded-md">
                      No offers available for this part
                    </div>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vendor</TableHead>
                            <TableHead className="text-right">Base Price</TableHead>
                            <TableHead className="text-right">Shipping</TableHead>
                            <TableHead className="text-right">Tax</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.offers.map((offer, index) => {
                            const isBest =
                              result.best &&
                              offer.vendor === result.best.vendor &&
                              offer.url === result.best.url;
                            const isSelected = isOfferSelected(result.partId, offer);

                            return (
                              <TableRow
                                key={`${offer.vendor}-${index}`}
                                className={`
                                  ${isBest ? 'bg-chart-2/10 border-chart-2/20' : ''}
                                  ${isSelected ? 'bg-primary/5 border-primary/20' : ''}
                                  cursor-pointer hover:bg-muted/50
                                `}
                                onClick={() =>
                                  handleOfferSelection(result.partId, isSelected ? null : offer)
                                }
                                data-testid={`row-offer-${result.partId}-${offer.vendor.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{offer.vendor}</span>
                                    {isBest && (
                                      <Badge
                                        variant="default"
                                        className="text-xs bg-chart-2 text-white"
                                      >
                                        Best
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatPrice(offer.basePrice)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {offer.shipping > 0 ? formatPrice(offer.shipping) : 'Free'}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatPrice(offer.taxEstimate)}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {formatPrice(offer.total)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    variant={offer.inStock ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {offer.inStock ? 'In Stock' : 'Out of Stock'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(offer.url, '_blank', 'noopener,noreferrer');
                                    }}
                                    className="h-8 w-8 p-0"
                                    data-testid={`button-view-offer-${result.partId}-${offer.vendor.toLowerCase().replace(/\s+/g, '-')}`}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {result.offers.length > 0 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {selectedOffer
                          ? `Selected: ${selectedOffer.vendor} - ${formatPrice(selectedOffer.total)}`
                          : `Best price: ${result.best ? formatPrice(result.best.total) : 'N/A'}`}
                      </span>
                      {selectedOffer?.notes && (
                        <span className="italic">{selectedOffer.notes}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {data && data.results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No pricing data available for the selected parts
          </div>
        )}
      </CardContent>
    </Card>
  );
}
