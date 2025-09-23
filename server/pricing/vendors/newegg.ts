import { BaseVendorAdapter } from "./adapter";
import { PartIdentity, Offer } from "../../../shared/schema";

export class NeweggAdapter extends BaseVendorAdapter {
  name = "Newegg";

  enabled(): boolean {
    const enabledVendors = process.env.ENABLED_VENDORS?.split(',').map(v => v.trim().toLowerCase()) || [];
    return enabledVendors.includes('newegg') || enabledVendors.includes('*');
  }

  async fetchOffers(part: PartIdentity): Promise<Offer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 75));

    const offers: Offer[] = [];
    
    // Generate 0-2 Newegg offers (sometimes they don't have items)
    const numOffers = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numOffers; i++) {
      const basePrice = this.generateCompetitivePrice(part.kind);
      const shipping = Math.random() > 0.3 ? 0 : Math.floor(Math.random() * 12) + 8; // Free shipping threshold
      const inStock = Math.random() > 0.15; // 85% in stock
      
      const searchQuery = encodeURIComponent(`${part.manufacturer} ${part.model}`);
      const mockUrl = `https://newegg.com/p/pl?d=${searchQuery}&N=${this.getCategoryFilter(part.kind)}`;
      
      const isShellShocker = Math.random() > 0.9; // 10% chance of shell shocker deal
      
      offers.push(this.createOffer({
        url: mockUrl,
        basePrice: isShellShocker ? Math.floor(basePrice * 0.85) : basePrice,
        shipping,
        inStock,
        notes: isShellShocker ? 'Shell Shocker Deal' : (shipping === 0 ? 'Free shipping' : undefined)
      }));
    }

    return offers;
  }

  private generateCompetitivePrice(kind: string): number {
    const basePrices = {
      'cpu': { min: 95, max: 750 },
      'gpu': { min: 190, max: 1900 },
      'motherboard': { min: 75, max: 480 },
      'ram': { min: 45, max: 380 },
      'storage': { min: 35, max: 280 },
      'psu': { min: 55, max: 280 },
      'case': { min: 45, max: 380 },
      'cooler': { min: 18, max: 190 }
    };

    const range = basePrices[kind.toLowerCase() as keyof typeof basePrices] || { min: 45, max: 480 };
    const price = Math.random() * (range.max - range.min) + range.min;
    
    // Newegg tends to be slightly more competitive
    const competitiveDiscount = 0.95 + Math.random() * 0.1; // 5-15% more competitive
    return Math.round(price * competitiveDiscount);
  }

  private getCategoryFilter(kind: string): string {
    const filters = {
      'cpu': '34-230',
      'gpu': '38-483',
      'motherboard': '13-145',
      'ram': '20-147',
      'storage': '35-636',
      'psu': '58-442',
      'case': '11-147',
      'cooler': '35-573'
    };
    
    return filters[kind.toLowerCase() as keyof typeof filters] || '34-230';
  }
}