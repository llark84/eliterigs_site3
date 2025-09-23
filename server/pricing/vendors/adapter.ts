import { PartIdentity, Offer } from "../../../shared/schema";

/**
 * Vendor Adapter Interface
 * Defines the contract for pricing vendor integrations
 */
export interface VendorAdapter {
  /** Vendor display name */
  name: string;
  
  /** Check if this vendor adapter is enabled and configured */
  enabled(): boolean;
  
  /** Fetch pricing offers for a given part */
  fetchOffers(part: PartIdentity): Promise<Offer[]>;
}

/**
 * Affiliate Helper Function
 * Applies affiliate tags to vendor URLs based on environment variables
 */
export function applyAffiliate(url: string, vendor: string): string {
  try {
    const parsedUrl = new URL(url);
    
    switch (vendor.toLowerCase()) {
      case 'amazon': {
        const tag = process.env.AFFIL_AMAZON_TAG;
        if (tag) {
          parsedUrl.searchParams.set('tag', tag);
        }
        break;
      }
      
      case 'newegg': {
        const id = process.env.AFFIL_NEWEGG_ID;
        if (id) {
          parsedUrl.searchParams.set('cm_mmc', `AFC-${id}`);
        }
        break;
      }
      
      case 'bhphotovideo':
      case 'bh': {
        const id = process.env.AFFIL_BH_ID;
        if (id) {
          parsedUrl.searchParams.set('BI', id);
        }
        break;
      }
      
      case 'bestbuy': {
        const affil = process.env.AFFIL_BESTBUY_AFFIL;
        if (affil) {
          parsedUrl.searchParams.set('ref', affil);
        }
        break;
      }
      
      case 'microcenter': {
        const id = process.env.AFFIL_MICROCENTER_ID;
        if (id) {
          parsedUrl.searchParams.set('affid', id);
        }
        break;
      }
      
      default:
        // For unknown vendors, return URL unchanged
        break;
    }
    
    return parsedUrl.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    console.warn(`Failed to apply affiliate tags to URL: ${url}`, error);
    return url;
  }
}

/**
 * Utility function to check if a vendor has affiliate configuration
 */
export function hasAffiliateConfig(vendor: string): boolean {
  switch (vendor.toLowerCase()) {
    case 'amazon':
      return !!process.env.AFFIL_AMAZON_TAG;
    case 'newegg':
      return !!process.env.AFFIL_NEWEGG_ID;
    case 'bhphotovideo':
    case 'bh':
      return !!process.env.AFFIL_BH_ID;
    case 'bestbuy':
      return !!process.env.AFFIL_BESTBUY_AFFIL;
    case 'microcenter':
      return !!process.env.AFFIL_MICROCENTER_ID;
    default:
      return false;
  }
}

/**
 * Base Vendor Adapter Class
 * Provides common functionality for vendor implementations
 */
export abstract class BaseVendorAdapter implements VendorAdapter {
  abstract name: string;
  
  /**
   * Default enabled check - can be overridden by implementations
   */
  enabled(): boolean {
    return true;
  }
  
  abstract fetchOffers(part: PartIdentity): Promise<Offer[]>;
  
  /**
   * Apply affiliate tags to a URL for this vendor
   */
  protected applyAffiliateLink(url: string): string {
    return applyAffiliate(url, this.name);
  }
  
  /**
   * Create a standardized offer object
   */
  protected createOffer(data: {
    url: string;
    basePrice: number;
    shipping?: number;
    taxEstimate?: number;
    inStock?: boolean;
    notes?: string;
  }): Offer {
    const shipping = data.shipping || 0;
    const taxEstimate = data.taxEstimate || 0;
    const total = data.basePrice + shipping + taxEstimate;
    
    return {
      vendor: this.name,
      url: this.applyAffiliateLink(data.url),
      basePrice: data.basePrice,
      shipping,
      taxEstimate,
      total,
      inStock: data.inStock !== false, // Default to true if not specified
      lastChecked: new Date().toISOString(),
      currency: 'USD',
      notes: data.notes
    };
  }
}