import { BaseVendorAdapter } from "./adapter";
import { PartIdentity, Offer } from "../../../shared/schema";

export class BestBuyAdapter extends BaseVendorAdapter {
  name = "Best Buy";

  enabled(): boolean {
    const enabledVendors = process.env.ENABLED_VENDORS?.split(',').map(v => v.trim().toLowerCase()) || [];
    return enabledVendors.includes('bestbuy') || enabledVendors.includes('*');
  }

  async fetchOffers(part: PartIdentity): Promise<Offer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 130 + 70));

    const offers: Offer[] = [];
    
    // Best Buy has limited PC component selection - 0-2 offers
    const numOffers = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numOffers; i++) {
      const basePrice = this.generateBestBuyPrice(part.kind);
      const shipping = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 8) + 5; // Free shipping on $35+
      const inStock = Math.random() > 0.3; // 70% in stock
      
      const searchQuery = encodeURIComponent(`${part.manufacturer} ${part.model}`);
      const mockUrl = `https://bestbuy.com/site/searchpage.jsp?st=${searchQuery}&_dyncharset=UTF-8`;
      
      const isGeekSquadEligible = Math.random() > 0.7; // 30% chance of Geek Squad services
      const hasStorePickup = Math.random() > 0.4; // 60% chance of store pickup
      const isOpenBox = Math.random() > 0.85; // 15% chance of open box
      
      let notes = '';
      if (isGeekSquadEligible) notes = 'Geek Squad installation available';
      else if (hasStorePickup) notes = 'Store pickup available';
      if (isOpenBox) notes = 'Open box - excellent condition';

      offers.push(this.createOffer({
        url: mockUrl,
        basePrice: isOpenBox ? Math.floor(basePrice * 0.88) : basePrice,
        shipping: hasStorePickup ? 0 : shipping,
        inStock: !isOpenBox || inStock, // Open box items might be out of stock
        notes: notes || undefined
      }));
    }

    return offers;
  }

  private generateBestBuyPrice(kind: string): number {
    const basePrices = {
      'cpu': { min: 100, max: 800 },
      'gpu': { min: 220, max: 2100 },    // Higher GPU prices, limited selection
      'motherboard': { min: 90, max: 550 }, // Limited selection
      'ram': { min: 60, max: 450 },     // Gaming-focused
      'storage': { min: 50, max: 350 },  // SSD focus
      'psu': { min: 70, max: 320 },     // Limited selection
      'case': { min: 60, max: 450 },    // Gaming cases
      'cooler': { min: 25, max: 220 }   // Limited selection
    };

    const range = basePrices[kind.toLowerCase() as keyof typeof basePrices] || { min: 60, max: 500 };
    const price = Math.random() * (range.max - range.min) + range.min;
    
    // Best Buy typically has higher prices but occasional good deals
    let pricingMultiplier = 1.05; // Generally 5% higher
    
    // Occasional deals on popular items
    if (Math.random() > 0.8) {
      pricingMultiplier = 0.95; // 20% chance of competitive pricing
    }
    
    return Math.round(price * pricingMultiplier);
  }
}