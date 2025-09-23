import { PartIdentity, Offer, PriceResult } from "../../shared/schema";
import { VendorAdapter } from "./vendors/adapter";
import { AmazonAdapter } from "./vendors/amazon";
import { NeweggAdapter } from "./vendors/newegg";
import { MicrocenterAdapter } from "./vendors/microcenter";
import { BHPhotoAdapter } from "./vendors/bh";
import { BestBuyAdapter } from "./vendors/bestbuy";

// Cache configuration
const TTL_MIN = 10;
const TTL_MS = TTL_MIN * 60 * 1000;
const VENDOR_TIMEOUT_MS = 5000;
const MAX_RETRIES = 1;

// In-memory cache
interface CacheEntry {
  result: PriceResult;
  ts: number;
}

const cache = new Map<string, CacheEntry>();

// Initialize vendor adapters
const vendorAdapters: VendorAdapter[] = [
  new AmazonAdapter(),
  new NeweggAdapter(),
  new MicrocenterAdapter(),
  new BHPhotoAdapter(),
  new BestBuyAdapter()
];

/**
 * Generate normalized cache key for a part
 */
function generateCacheKey(part: PartIdentity): string {
  const normalizedKey = `${part.manufacturer} ${part.model}`.toLowerCase().trim();
  return `pricing:${normalizedKey}`;
}

/**
 * Check if cache entry is fresh
 */
function isCacheFresh(entry: CacheEntry): boolean {
  return (Date.now() - entry.ts) < TTL_MS;
}

/**
 * Get tax rate from environment
 */
function getTaxRate(): number {
  const taxRate = process.env.TAX_RATE;
  return taxRate ? parseFloat(taxRate) : 0;
}

/**
 * Compute tax estimate and total for an offer
 */
function computeOfferTotals(offer: Offer): Offer {
  const taxRate = getTaxRate();
  const taxEstimate = Math.round(offer.basePrice * taxRate);
  const total = offer.basePrice + offer.shipping + taxEstimate;
  
  return {
    ...offer,
    taxEstimate,
    total
  };
}

/**
 * Fetch offers from a vendor with timeout and retry
 */
async function fetchOffersWithRetry(
  adapter: VendorAdapter, 
  part: PartIdentity, 
  attempt = 1
): Promise<Offer[]> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), VENDOR_TIMEOUT_MS);
    });
    
    const fetchPromise = adapter.fetchOffers(part);
    const offers = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Compute totals for each offer
    return offers.map(computeOfferTotals);
  } catch (error) {
    console.warn(`[Pricing] ${adapter.name} failed (attempt ${attempt}):`, error);
    
    if (attempt <= MAX_RETRIES) {
      // Retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      return fetchOffersWithRetry(adapter, part, attempt + 1);
    }
    
    // Return empty array if all retries failed
    return [];
  }
}

/**
 * De-duplicate offers by URL
 */
function deduplicateOffers(offers: Offer[]): Offer[] {
  const seenUrls = new Set<string>();
  const uniqueOffers: Offer[] = [];
  
  for (const offer of offers) {
    if (!seenUrls.has(offer.url)) {
      seenUrls.add(offer.url);
      uniqueOffers.push(offer);
    }
  }
  
  return uniqueOffers;
}

/**
 * Sort offers by total price ascending
 */
function sortOffersByPrice(offers: Offer[]): Offer[] {
  return [...offers].sort((a, b) => a.total - b.total);
}

/**
 * Main price fetching function
 */
export async function fetchPrices(part: PartIdentity): Promise<PriceResult> {
  const cacheKey = generateCacheKey(part);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && isCacheFresh(cached)) {
    console.log(`[Pricing] Cache hit for ${part.manufacturer} ${part.model}`);
    return cached.result;
  }
  
  console.log(`[Pricing] Fetching fresh prices for ${part.manufacturer} ${part.model}`);
  
  // Get enabled adapters
  const enabledAdapters = vendorAdapters.filter(adapter => adapter.enabled());
  
  if (enabledAdapters.length === 0) {
    console.warn('[Pricing] No enabled vendor adapters found');
    const emptyResult: PriceResult = {
      partId: part.id,
      offers: [],
      best: null,
      generatedAt: new Date().toISOString()
    };
    return emptyResult;
  }
  
  // Fetch offers from all enabled vendors in parallel
  const vendorPromises = enabledAdapters.map(adapter => 
    fetchOffersWithRetry(adapter, part)
  );
  
  try {
    const vendorResults = await Promise.all(vendorPromises);
    
    // Flatten all offers from all vendors
    const allOffers = vendorResults.flat();
    
    // De-duplicate by URL
    const uniqueOffers = deduplicateOffers(allOffers);
    
    // Sort by total price
    const sortedOffers = sortOffersByPrice(uniqueOffers);
    
    // Best offer is the cheapest (first after sorting)
    const best = sortedOffers.length > 0 ? sortedOffers[0] : null;
    
    const result: PriceResult = {
      partId: part.id,
      offers: sortedOffers,
      best,
      generatedAt: new Date().toISOString()
    };
    
    // Cache the result
    cache.set(cacheKey, {
      result,
      ts: Date.now()
    });
    
    console.log(`[Pricing] Fetched ${sortedOffers.length} offers from ${enabledAdapters.length} vendors`);
    
    return result;
  } catch (error) {
    console.error('[Pricing] Error fetching prices:', error);
    
    // Return empty result on error
    const errorResult: PriceResult = {
      partId: part.id,
      offers: [],
      best: null,
      generatedAt: new Date().toISOString()
    };
    
    return errorResult;
  }
}

/**
 * Clear cache entries older than TTL
 */
export function cleanupCache(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];
  
  for (const [key, entry] of cache.entries()) {
    if ((now - entry.ts) >= TTL_MS) {
      expiredKeys.push(key);
    }
  }
  
  expiredKeys.forEach(key => cache.delete(key));
  
  if (expiredKeys.length > 0) {
    console.log(`[Pricing] Cleaned up ${expiredKeys.length} expired cache entries`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: Array<{ key: string; age: number }> } {
  const now = Date.now();
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    age: Math.round((now - entry.ts) / 1000) // Age in seconds
  }));
  
  return {
    size: cache.size,
    entries
  };
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  cache.clear();
  console.log('[Pricing] Cache cleared');
}

/**
 * Batch fetch prices for multiple parts
 */
export async function fetchPricesBatch(parts: PartIdentity[]): Promise<PriceResult[]> {
  console.log(`[Pricing] Batch fetching prices for ${parts.length} parts`);
  
  const promises = parts.map(part => fetchPrices(part));
  const results = await Promise.all(promises);
  
  return results;
}

// Schedule periodic cache cleanup (every 5 minutes)
setInterval(cleanupCache, 5 * 60 * 1000);