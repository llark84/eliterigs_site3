import { BaseVendorAdapter } from "./adapter";
import { PartIdentity, Offer } from "../../../shared/schema";

export class BHPhotoAdapter extends BaseVendorAdapter {
  name = "B&H Photo";

  enabled(): boolean {
    const enabledVendors = process.env.ENABLED_VENDORS?.split(',').map(v => v.trim().toLowerCase()) || [];
    return enabledVendors.includes('bh') || enabledVendors.includes('bhphoto') || enabledVendors.includes('*');
  }

  async fetchOffers(part: PartIdentity): Promise<Offer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 80));

    const offers: Offer[] = [];
    
    // B&H has selective inventory but good service - 0-2 offers
    const numOffers = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numOffers; i++) {
      const basePrice = this.generateBHPrice(part.kind);
      const shipping = Math.random() > 0.4 ? 0 : Math.floor(Math.random() * 10) + 8; // Free shipping threshold
      const inStock = Math.random() > 0.2; // 80% in stock
      
      const searchQuery = encodeURIComponent(`${part.manufacturer} ${part.model}`);
      const mockUrl = `https://bhphotovideo.com/c/search?Ntt=${searchQuery}&N=0&InitialSearch=yes`;
      
      const hasExtendedWarranty = Math.random() > 0.6; // 40% chance of extended warranty offer
      const isPreOrder = Math.random() > 0.9; // 10% chance of pre-order
      
      let notes = 'No sales tax in most states';
      if (hasExtendedWarranty) notes = 'Extended warranty available';
      if (isPreOrder) notes = 'Pre-order item';

      offers.push(this.createOffer({
        url: mockUrl,
        basePrice,
        shipping,
        inStock: !isPreOrder && inStock,
        notes
      }));
    }

    return offers;
  }

  private generateBHPrice(kind: string): number {
    const basePrices = {
      'cpu': { min: 90, max: 780 },
      'gpu': { min: 200, max: 1950 },
      'motherboard': { min: 80, max: 520 },
      'ram': { min: 50, max: 400 },
      'storage': { min: 40, max: 320 },
      'psu': { min: 60, max: 300 },
      'case': { min: 50, max: 420 },
      'cooler': { min: 20, max: 200 }
    };

    const range = basePrices[kind.toLowerCase() as keyof typeof basePrices] || { min: 50, max: 500 };
    const price = Math.random() * (range.max - range.min) + range.min;
    
    // B&H typically has MSRP or slightly higher but no tax benefit
    const pricingMultiplier = 0.98 + Math.random() * 0.08; // -2% to +6% variation
    return Math.round(price * pricingMultiplier);
  }
}