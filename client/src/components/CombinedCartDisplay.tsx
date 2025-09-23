import { PCComponent } from '@shared/schema';
import type { Offer } from '@shared/schema';
import {
  ShoppingCart,
  ExternalLink,
  Package,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { buildCombinedCartDisplay, type CombinedCartDisplayData } from '@/lib/cartBuilder';

interface CombinedCartDisplayProps {
  selectedOffers: { [partId: string]: Offer };
  selectedComponents: { [category: string]: PCComponent };
  selectedAccessories: { [id: string]: any };
  onClose?: () => void;
}

export default function CombinedCartDisplay({
  selectedOffers,
  selectedComponents,
  selectedAccessories,
  onClose,
}: CombinedCartDisplayProps) {
  const [groupByVendor, setGroupByVendor] = useState(true);

  const formatPrice = useCallback((price: number) => `$${price.toLocaleString()}`, []);

  // Generate combined cart data
  const partNames = Object.fromEntries(
    Object.values(selectedComponents).map((c) => [c.id, `${c.brand} ${c.name}`])
  );

  const cartData = buildCombinedCartDisplay(
    selectedOffers,
    partNames,
    selectedAccessories,
    selectedComponents
  );
  const hasOffers = Object.keys(selectedOffers).length > 0;
  const hasAccessories = Object.keys(selectedAccessories).length > 0;

  // Group items by vendor if enabled - memoized for performance
  const groupedItems = useMemo(() => {
    return groupByVendor
      ? cartData.displayItems.reduce(
          (groups, item) => {
            const vendor = item.vendor || 'Unknown';
            if (!groups[vendor]) {
              groups[vendor] = [];
            }
            groups[vendor].push(item);
            return groups;
          },
          {} as { [vendor: string]: typeof cartData.displayItems }
        )
      : { 'All Items': cartData.displayItems };
  }, [cartData.displayItems, groupByVendor]);

  const vendorTotals = useMemo(
    () =>
      Object.entries(groupedItems).map(([vendor, items]) => ({
        vendor,
        total: items.reduce((sum, item) => sum + item.price, 0),
        count: items.length,
      })),
    [groupedItems]
  );

  return (
    <Card className="w-full" data-testid="combined-cart-display">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Complete Setup Cart
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your PC build and accessories ready for purchase
            </p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-combined-cart"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Cart Summary */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-md">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{cartData.components.length}</span>
              <span className="text-muted-foreground"> components</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{cartData.accessories.length}</span>
              <span className="text-muted-foreground"> accessories</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{formatPrice(cartData.total)}</div>
            <div className="text-xs text-muted-foreground">Total estimated cost</div>
          </div>
        </div>

        {/* Display Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={groupByVendor ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupByVendor(!groupByVendor)}
            data-testid="button-toggle-grouping"
          >
            {groupByVendor ? 'Grouped by Vendor' : 'Show All Items'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Information about cart contents */}
        {!hasOffers && hasAccessories && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <Info className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Component pricing not selected
              </p>
              <p className="text-amber-700 dark:text-amber-300">
                Use "Compare Prices" to select specific vendor offers for components to get direct
                purchase links.
              </p>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([vendor, items]) => (
            <div key={vendor} className="space-y-3">
              {groupByVendor && (
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{vendor}</h3>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-sm">
                      {vendorTotals.find((v) => v.vendor === vendor)?.count} items
                    </Badge>
                    <div className="text-sm font-medium mt-1">
                      {formatPrice(vendorTotals.find((v) => v.vendor === vendor)?.total || 0)}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.key} className="p-4 border border-border/50 rounded-md bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium truncate">{item.name}</span>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor:
                                item.type === 'component'
                                  ? 'hsl(var(--primary))'
                                  : 'hsl(var(--chart-2))',
                            }}
                          >
                            {item.type === 'component' ? 'PC Part' : 'Accessory'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{item.vendor}</span>
                          {item.inStock !== undefined && (
                            <div className="flex items-center gap-1">
                              {item.inStock ? (
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                              )}
                              <span>{item.inStock ? 'In Stock' : 'Check Availability'}</span>
                            </div>
                          )}
                          {item.shipping != null && (
                            <span className="text-xs">
                              Shipping:{' '}
                              {item.shipping === 0 ? 'Free' : `$${item.shipping.toLocaleString()}`}
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <div className="font-bold text-lg">{formatPrice(item.price)}</div>
                        </div>

                        {item.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            data-testid={`button-buy-${item.key}`}
                          >
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Buy
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {groupByVendor && vendor !== 'All Items' && items.length > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{vendor} Subtotal:</div>
                      <div className="font-bold text-lg">
                        {formatPrice(vendorTotals.find((v) => v.vendor === vendor)?.total || 0)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Cart Total */}
        <Separator />
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Grand Total:</span>
          <span className="text-primary">{formatPrice(cartData.total)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              // Copy cart summary to clipboard
              const summary = cartData.displayItems
                .map((item) => `${item.name} - ${item.vendor} - ${formatPrice(item.price)}`)
                .join('\n');
              navigator.clipboard.writeText(
                `PC Build Cart\n\n${summary}\n\nTotal: ${formatPrice(cartData.total)}`
              );
            }}
            data-testid="button-copy-cart"
          >
            Copy Cart List
          </Button>

          <Button
            variant="default"
            className="flex-1"
            onClick={() => {
              // Group purchase links by vendor for smart opening
              const vendorUrls = Object.entries(groupedItems).reduce(
                (urls, [vendor, items]) => {
                  const vendorLinks = items
                    .map((item) => item.url)
                    .filter((url): url is string => Boolean(url));
                  if (vendorLinks.length > 0) {
                    urls[vendor] = vendorLinks;
                  }
                  return urls;
                },
                {} as { [vendor: string]: string[] }
              );

              const vendorCount = Object.keys(vendorUrls).length;
              const linkCount = Object.values(vendorUrls).flat().length;

              if (linkCount === 0) {
                alert(
                  `Cart ready for checkout!\n\nTotal: ${formatPrice(cartData.total)}\n${cartData.components.length} components + ${cartData.accessories.length} accessories\n\nNote: Select vendor offers for direct purchase links.`
                );
                return;
              }

              // Show confirmation to avoid popup blocker issues
              const shouldOpen = confirm(
                `This will open ${linkCount} purchase links across ${vendorCount} vendor${vendorCount !== 1 ? 's' : ''}.\n\n` +
                  `Total: ${formatPrice(cartData.total)}\n` +
                  `${cartData.components.length} components + ${cartData.accessories.length} accessories\n\n` +
                  `Continue to open all purchase links?`
              );

              if (shouldOpen) {
                // Open vendor links with staggered timing to reduce popup blocking
                Object.entries(vendorUrls).forEach(([vendor, urls]) => {
                  urls.forEach((url, index) => {
                    setTimeout(() => {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }, index * 150); // Stagger to avoid popup blocking
                  });
                });
              }

              console.log('Combined cart checkout:', cartData);
            }}
            data-testid="button-proceed-checkout"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Open Purchase Links ({cartData.displayItems.filter((item) => item.url).length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
