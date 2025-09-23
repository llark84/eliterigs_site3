import { BaseVendorAdapter } from "./adapter";
import { PartIdentity, Offer } from "../../../shared/schema";

export class MicrocenterAdapter extends BaseVendorAdapter {
  name = "Micro Center";

  enabled(): boolean {
    const enabledVendors = process.env.ENABLED_VENDORS?.split(',').map(v => v.trim().toLowerCase()) || [];
    return enabledVendors.includes('microcenter') || enabledVendors.includes('*');
  }

  async fetchOffers(part: PartIdentity): Promise<Offer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 120 + 60));

    const offers: Offer[] = [];
    
    // Micro Center often has great deals but limited stock - 0-2 offers
    const numOffers = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numOffers; i++) {
      const basePrice = this.generateMicrocenterPrice(part.kind);
      const shipping = 0; // Micro Center focuses on in-store pickup
      const inStock = Math.random() > 0.25; // 75% in stock (limited inventory)
      
      const searchQuery = encodeURIComponent(`${part.manufacturer} ${part.model}`);
      const mockUrl = `https://microcenter.com/search/search_results.aspx?Ntt=${searchQuery}&Ntk=all`;
      
      const hasBundle = Math.random() > 0.7 && part.kind.toLowerCase() === 'cpu'; // 30% chance for CPU bundles
      const isOpenBox = Math.random() > 0.85; // 15% chance of open box
      
      let notes = 'In-store pickup only';
      if (hasBundle) notes = 'CPU + Motherboard bundle discount available';
      if (isOpenBox) notes = 'Open box item';

      offers.push(this.createOffer({
        url: mockUrl,
        basePrice: isOpenBox ? Math.floor(basePrice * 0.9) : basePrice,
        shipping,
        inStock,
        notes
      }));
    }

    return offers;
  }

  private generateMicrocenterPrice(kind: string): number {
    const basePrices = {
      'cpu': { min: 85, max: 700 },      // Great CPU deals
      'gpu': { min: 180, max: 1800 },    // Competitive GPU pricing
      'motherboard': { min: 70, max: 450 }, // Bundle deals
      'ram': { min: 40, max: 350 },
      'storage': { min: 30, max: 250 },
      'psu': { min: 50, max: 260 },
      'case': { min: 40, max: 350 },
      'cooler': { min: 15, max: 180 }
    };

    const range = basePrices[kind.toLowerCase() as keyof typeof basePrices] || { min: 40, max: 450 };
    const price = Math.random() * (range.max - range.min) + range.min;
    
    // Micro Center is known for competitive pricing, especially on CPUs and GPUs
    let competitiveMultiplier = 0.92; // Generally 8% more competitive
    if (kind.toLowerCase() === 'cpu') competitiveMultiplier = 0.88; // Even better CPU deals
    if (kind.toLowerCase() === 'gpu') competitiveMultiplier = 0.90; // Good GPU deals
    
    return Math.round(price * competitiveMultiplier);
  }
}