import { BaseVendorAdapter } from "./adapter";
import { PartIdentity, Offer } from "../../../shared/schema";

export class AmazonAdapter extends BaseVendorAdapter {
  name = "Amazon";

  enabled(): boolean {
    const enabledVendors = process.env.ENABLED_VENDORS?.split(',').map(v => v.trim().toLowerCase()) || [];
    return enabledVendors.includes('amazon') || enabledVendors.includes('*');
  }

  async fetchOffers(part: PartIdentity): Promise<Offer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    const offers: Offer[] = [];
    
    // Generate 1-3 realistic Amazon offers
    const numOffers = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numOffers; i++) {
      const basePrice = this.generateRealisticPrice(part.kind);
      const shipping = Math.random() > 0.6 ? 0 : Math.floor(Math.random() * 15) + 5; // Prime vs standard
      const inStock = Math.random() > 0.1; // 90% in stock
      
      const searchQuery = encodeURIComponent(`${part.manufacturer} ${part.model}`);
      const mockUrl = `https://amazon.com/s?k=${searchQuery}&ref=sr_1_${i + 1}`;
      
      offers.push(this.createOffer({
        url: mockUrl,
        basePrice,
        shipping,
        inStock,
        notes: shipping === 0 ? 'Prime eligible' : undefined
      }));
    }

    return offers;
  }

  private generateRealisticPrice(kind: string): number {
    const basePrices = {
      'cpu': { min: 100, max: 800 },
      'gpu': { min: 200, max: 2000 },
      'motherboard': { min: 80, max: 500 },
      'ram': { min: 50, max: 400 },
      'storage': { min: 40, max: 300 },
      'psu': { min: 60, max: 300 },
      'case': { min: 50, max: 400 },
      'cooler': { min: 20, max: 200 }
    };

    const range = basePrices[kind.toLowerCase() as keyof typeof basePrices] || { min: 50, max: 500 };
    const price = Math.random() * (range.max - range.min) + range.min;
    
    // Add some variation (±10%)
    const variation = 1 + (Math.random() - 0.5) * 0.2;
    return Math.round(price * variation);
  }
}