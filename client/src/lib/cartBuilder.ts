import type { Offer, PartIdentity } from '@shared/schema';

export interface CartLink {
  url: string;
  vendor: string;
  partName: string;
  price: number;
  offer: Offer;
}

export interface CartItem {
  partId: string;
  partName: string;
  offer: Offer;
}

export interface AccessoryCartItem {
  id: string;
  name: string;
  price: number;
  vendor?: string;
  url?: string;
  category: string;
}

/**
 * Convert selected offers to cart links for purchasing
 */
export function buildCartLinks(cartItems: CartItem[]): CartLink[] {
  return cartItems.map((item) => ({
    url: item.offer.url,
    vendor: item.offer.vendor,
    partName: item.partName,
    price: item.offer.total,
    offer: item.offer,
  }));
}

/**
 * Generate HTML for cart purchase links (matching original cartBuilder.js format)
 */
export function buildCartHTML(links: CartLink[]): string {
  return links
    .map(
      (link) =>
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.vendor} - ${link.partName} ($${link.price.toLocaleString()})</a>`
    )
    .join('<br>');
}

/**
 * Build cart from selected offers and part information
 */
export function buildCart(
  selectedOffers: { [partId: string]: Offer },
  partNames: { [partId: string]: string }
): string {
  const cartItems: CartItem[] = Object.entries(selectedOffers).map(([partId, offer]) => ({
    partId,
    partName: partNames[partId] || 'Unknown Part',
    offer,
  }));

  const cartLinks = buildCartLinks(cartItems);
  return buildCartHTML(cartLinks);
}

/**
 * Generate React components for cart links
 */
export function buildCartReactLinks(cartItems: CartItem[]) {
  return cartItems.map((item, index) => ({
    key: `${item.partId}-${index}`,
    vendor: item.offer.vendor,
    partName: item.partName,
    price: item.offer.total,
    url: item.offer.url,
    inStock: item.offer.inStock,
    shipping: item.offer.shipping,
    notes: item.offer.notes,
  }));
}

/**
 * Calculate total cart value
 */
export function calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => total + item.offer.total, 0);
}

/**
 * Group cart items by vendor for bulk purchasing
 */
export function groupCartByVendor(cartItems: CartItem[]): { [vendor: string]: CartItem[] } {
  return cartItems.reduce(
    (grouped, item) => {
      const vendor = item.offer.vendor;
      if (!grouped[vendor]) {
        grouped[vendor] = [];
      }
      grouped[vendor].push(item);
      return grouped;
    },
    {} as { [vendor: string]: CartItem[] }
  );
}

/**
 * Get vendor breakdown with totals
 */
export function getVendorBreakdown(cartItems: CartItem[]): {
  [vendor: string]: { total: number; count: number; items: CartItem[] };
} {
  const grouped = groupCartByVendor(cartItems);

  return Object.entries(grouped).reduce(
    (breakdown, [vendor, items]) => {
      breakdown[vendor] = {
        total: items.reduce((sum, item) => sum + item.offer.total, 0),
        count: items.length,
        items: items,
      };
      return breakdown;
    },
    {} as { [vendor: string]: { total: number; count: number; items: CartItem[] } }
  );
}

/**
 * Convert accessories to cart items for combined cart
 */
export function accessoriesToCartItems(selectedAccessories: {
  [id: string]: any;
}): AccessoryCartItem[] {
  return Object.values(selectedAccessories).map((accessory) => {
    let vendor = 'Multiple Vendors';
    let url = `https://www.google.com/search?q=${encodeURIComponent(accessory.name)}`;
    let price = accessory.price || 0;

    // If vendor prices exist, use the lowest priced vendor
    if (accessory.vendorPrices) {
      const vendors = Object.entries(accessory.vendorPrices) as [string, number][];
      if (vendors.length > 0) {
        const [bestVendor, bestPrice] = vendors.reduce((best, current) =>
          current[1] < best[1] ? current : best
        );

        // Format vendor display name
        const vendorDisplayNames: { [key: string]: string } = {
          amazon: 'Amazon',
          newegg: 'Newegg',
          bestbuy: 'Best Buy',
          microcenter: 'Micro Center',
          bhphotovideo: 'B&H Photo',
          bh: 'B&H Photo',
        };

        vendor =
          vendorDisplayNames[bestVendor.toLowerCase()] ||
          bestVendor.charAt(0).toUpperCase() + bestVendor.slice(1);
        price = typeof bestPrice === 'number' ? bestPrice : 0;

        // Generate vendor-specific URLs
        const vendorUrls: { [key: string]: string } = {
          amazon: `https://amazon.com/search?k=${encodeURIComponent(accessory.name)}`,
          newegg: `https://newegg.com/search?depa=0&order=BESTMATCH&listingonly=1&limit=50&type=keywords&keyword=${encodeURIComponent(accessory.name)}`,
          bestbuy: `https://bestbuy.com/search?st=${encodeURIComponent(accessory.name)}`,
          microcenter: `https://microcenter.com/search/search_results.aspx?N=&cat=&Ntt=${encodeURIComponent(accessory.name)}`,
          bhphotovideo: `https://bhphotovideo.com/search?q=${encodeURIComponent(accessory.name)}`,
          bh: `https://bhphotovideo.com/search?q=${encodeURIComponent(accessory.name)}`,
        };

        url = vendorUrls[bestVendor.toLowerCase()] || url;
      }
    }

    return {
      id: accessory.id,
      name: accessory.name,
      price: price,
      vendor: vendor,
      url: url,
      category: accessory.category,
    };
  });
}

/**
 * Build combined cart with both components and accessories
 */
export function buildCombinedCart(
  selectedOffers: { [partId: string]: Offer },
  partNames: { [partId: string]: string },
  selectedAccessories: { [id: string]: any },
  allComponents?: { [category: string]: any }
): {
  components: CartItem[];
  accessories: AccessoryCartItem[];
  total: number;
  componentTotal: number;
  accessoryTotal: number;
} {
  // Build component cart items from offers
  const componentCartItems: CartItem[] = Object.entries(selectedOffers).map(([partId, offer]) => ({
    partId,
    partName: partNames[partId] || 'Unknown Part',
    offer,
  }));

  // For any components that don't have selected offers, include them with fallback pricing
  if (allComponents) {
    Object.values(allComponents).forEach((component) => {
      // Only add fallback if this component doesn't already have a selected offer
      if (!selectedOffers[component.id]) {
        // Create a fallback offer for components without selected offers
        const fallbackOffer: Offer = {
          vendor: 'Multiple Vendors',
          url: `https://www.google.com/search?q=${encodeURIComponent(`${component.brand} ${component.name}`)}`,
          basePrice: component.price || 0,
          shipping: 0,
          taxEstimate: 0,
          total: component.price || 0,
          inStock: true,
          lastChecked: new Date().toISOString(),
          currency: 'USD' as const,
          notes: 'Price estimated - select vendor offers for accurate pricing',
        };

        componentCartItems.push({
          partId: component.id,
          partName: `${component.brand} ${component.name}`,
          offer: fallbackOffer,
        });
      }
    });
  }

  // Build accessory cart items
  const accessoryCartItems = accessoriesToCartItems(selectedAccessories);

  // Calculate totals
  const componentTotal = componentCartItems.reduce((sum, item) => sum + item.offer.total, 0);
  const accessoryTotal = accessoryCartItems.reduce((sum, item) => sum + item.price, 0);
  const total = componentTotal + accessoryTotal;

  return {
    components: componentCartItems,
    accessories: accessoryCartItems,
    total,
    componentTotal,
    accessoryTotal,
  };
}

export interface DisplayItem {
  key: string;
  type: 'component' | 'accessory';
  vendor: string;
  name: string;
  price: number;
  url?: string;
  inStock?: boolean;
  shipping?: number | null;
  notes?: string | null;
  category: string;
}

export interface CombinedCartDisplayData {
  components: CartItem[];
  accessories: AccessoryCartItem[];
  total: number;
  componentTotal: number;
  accessoryTotal: number;
  displayItems: DisplayItem[];
}

/**
 * Generate combined cart display data for React components
 */
export function buildCombinedCartDisplay(
  selectedOffers: { [partId: string]: Offer },
  partNames: { [partId: string]: string },
  selectedAccessories: { [id: string]: any },
  allComponents?: { [category: string]: any }
): CombinedCartDisplayData {
  const cart = buildCombinedCart(selectedOffers, partNames, selectedAccessories, allComponents);

  // Convert components to display format
  const componentLinks: DisplayItem[] = cart.components.map((item, index) => ({
    key: `component-${item.partId}-${index}`,
    type: 'component' as const,
    vendor: item.offer.vendor,
    name: item.partName,
    price: item.offer.total,
    url: item.offer.url,
    inStock: item.offer.inStock,
    shipping: item.offer.shipping,
    notes: item.offer.notes,
    category: 'PC Component',
  }));

  // Convert accessories to display format
  const accessoryLinks: DisplayItem[] = cart.accessories.map((item, index) => ({
    key: `accessory-${item.id}-${index}`,
    type: 'accessory' as const,
    vendor: item.vendor || 'Multiple Vendors',
    name: item.name,
    price: item.price,
    url: item.url,
    inStock: true,
    shipping: null,
    notes: null,
    category: item.category,
  }));

  return {
    ...cart,
    displayItems: [...componentLinks, ...accessoryLinks],
  };
}
