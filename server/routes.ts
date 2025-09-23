import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scoreBuild, type BuildComponents } from "./compatibility";
import { fetchPrices, fetchPricesBatch, getCacheStats } from "./pricing";
import type { PartIdentity, PCComponent } from "../shared/schema";
import { AmazonAdapter } from "./pricing/vendors/amazon";
import { NeweggAdapter } from "./pricing/vendors/newegg";
import { MicrocenterAdapter } from "./pricing/vendors/microcenter";
import { BHPhotoAdapter } from "./pricing/vendors/bh";
import { BestBuyAdapter } from "./pricing/vendors/bestbuy";
import { verifyPart, reverifyAll, getLastProvenanceRunAt, type ProvenanceStats } from "./provenance";
import { z } from "zod";
import { readFileSync } from "fs";
import { join } from "path";

// Helper function to get enabled vendor names
function getEnabledVendorNames(): string[] {
  const adapters = [
    new AmazonAdapter(),
    new NeweggAdapter(),
    new MicrocenterAdapter(),
    new BHPhotoAdapter(),
    new BestBuyAdapter()
  ];
  
  return adapters.filter(adapter => adapter.enabled()).map(adapter => adapter.name);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Status endpoint for deployment sanity checks
  app.get('/status', (req, res) => {
    const startTime = Date.now() - (process.uptime() * 1000);
    res.json({
      app: 'eliterigs',
      version: '2.0.0',
      time: new Date().toISOString(),
      cacheAgeMinutes: Math.floor((Date.now() - startTime) / (1000 * 60))
    });
  });

  // Compatibility checking endpoint
  app.post('/api/compatibility', async (req, res) => {
    try {
      // Validate request body
      const requestSchema = z.object({
        build: z.record(z.object({
          id: z.string(),
          name: z.string(), 
          brand: z.string(),
          category: z.string(),
          price: z.number(),
          spec: z.string().optional(),
          imageUrl: z.string().optional(),
          isAvailable: z.boolean()
        })),
        overrideReason: z.string().optional()
      });

      const validatedData = requestSchema.parse(req.body);
      const { build, overrideReason } = validatedData;

      const compatibility = scoreBuild(build as BuildComponents);
      
      // If override reason provided, include it in response
      if (overrideReason) {
        compatibility.overrideReason = overrideReason;
      }

      res.json(compatibility);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request format', details: error.errors });
      }
      console.error('Compatibility check error:', error);
      res.status(500).json({ error: 'Failed to check compatibility' });
    }
  });

  // Pricing endpoint
  app.post('/api/prices', async (req, res) => {
    try {
      // Validate request body - expect array of PartIdentity
      const requestSchema = z.object({
        parts: z.array(z.object({
          id: z.string(),
          kind: z.string(),
          manufacturer: z.string(),
          model: z.string(),
          identifiers: z.record(z.string()).optional()
        })).min(1, 'Parts array cannot be empty')
      });

      const validatedData = requestSchema.parse(req.body);
      const { parts } = validatedData;

      // Guard against empty parts array
      if (parts.length === 0) {
        return res.status(400).json({ 
          error: 'Parts array cannot be empty' 
        });
      }

      // Get pricing data from all vendors
      const results = await fetchPricesBatch(parts);
      const vendors = getEnabledVendorNames();
      const generatedAt = new Date().toISOString();
      
      res.json({
        results,
        vendors,
        generatedAt
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid request format', 
          details: error.errors 
        });
      }
      console.error('Pricing error:', error);
      res.status(500).json({ error: 'Failed to fetch pricing data' });
    }
  });

  // Get enabled vendors endpoint
  app.get('/api/prices/vendors', (req, res) => {
    try {
      const vendors = getEnabledVendorNames();
      res.json({ vendors });
    } catch (error) {
      console.error('Error getting vendors:', error);
      res.status(500).json({ error: 'Failed to get vendor list' });
    }
  });

  // Detailed pricing endpoint for individual components
  app.post('/api/prices/detailed', async (req, res) => {
    try {
      const requestSchema = z.object({
        components: z.array(z.object({
          id: z.string(),
          name: z.string(),
          brand: z.string(),
          category: z.string(),
          price: z.number(),
          spec: z.string().optional(),
          imageUrl: z.string().optional(),
          isAvailable: z.boolean(),
          // Optional verification fields for pricing
          specUrl: z.string().optional(),
          verifiedAt: z.string().optional(),
          sourceNote: z.string().optional(),
          lastStatus: z.string().optional(),
          lastEtag: z.string().optional(),
          lastHash: z.string().optional()
        }))
      });

      const validatedData = requestSchema.parse(req.body);
      const { components } = validatedData;

      // Normalize undefined to null for storage consistency
      const normalizedComponents = components.map(c => ({
        ...c,
        spec: c.spec ?? null,
        imageUrl: c.imageUrl ?? null,
        specUrl: c.specUrl ?? null,
        verifiedAt: c.verifiedAt ?? null,
        sourceNote: c.sourceNote ?? null,
        lastStatus: c.lastStatus ?? null,
        lastEtag: c.lastEtag ?? null,
        lastHash: c.lastHash ?? null
      }));

      // Convert components to PartIdentity format for new pricing system
      const parts: PartIdentity[] = normalizedComponents.map(c => ({
        id: c.id,
        kind: c.category.toLowerCase(),
        manufacturer: c.brand,
        model: c.name,
        identifiers: {}
      }));

      const priceResults = await fetchPricesBatch(parts);
      
      // Convert to expected format for backward compatibility
      const results = priceResults.map(result => ({
        componentId: result.partId,
        componentName: parts.find(p => p.id === result.partId)?.model || 'Unknown',
        prices: result.offers.map(offer => ({
          vendor: offer.vendor,
          basePrice: offer.basePrice,
          ship: offer.shipping,
          taxEstimate: offer.taxEstimate,
          total: offer.total,
          lastChecked: new Date(offer.lastChecked)
        })),
        lowestPrice: result.best ? {
          vendor: result.best.vendor,
          basePrice: result.best.basePrice,
          ship: result.best.shipping,
          taxEstimate: result.best.taxEstimate,
          total: result.best.total,
          lastChecked: new Date(result.best.lastChecked)
        } : null
      }));
      
      res.json({
        results,
        generatedAt: priceResults[0]?.generatedAt || new Date().toISOString(),
        fromCache: false, // New system doesn't track this at batch level
        cacheStats: getCacheStats()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request format', details: error.errors });
      }
      console.error('Detailed pricing error:', error);
      res.status(500).json({ error: 'Failed to fetch detailed pricing data' });
    }
  });

  // Build sharing endpoints
  app.post('/api/builds', async (req, res) => {
    try {
      // Validate request body
      const requestSchema = z.object({
        name: z.string().min(1, 'Build name is required'),
        components: z.record(z.object({
          id: z.string(),
          name: z.string(),
          brand: z.string(),
          category: z.string(),
          price: z.number(),
          spec: z.string().optional(),
          imageUrl: z.string().optional(),
          isAvailable: z.boolean(),
          // Verification and tracking fields
          specUrl: z.string().optional(),
          verifiedAt: z.string().optional(),
          sourceNote: z.string().optional(),
          lastStatus: z.string().optional(), // 'fresh'|'stale'|'unknown'|'changed'
          lastEtag: z.string().optional(),
          lastHash: z.string().optional()
        })),
        totalPrice: z.number().min(0)
      });

      const validatedData = requestSchema.parse(req.body);
      const result = await storage.saveBuild(validatedData);
      
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request format', details: error.errors });
      }
      console.error('Save build error:', error);
      res.status(500).json({ error: 'Failed to save build' });
    }
  });

  app.get('/api/builds/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Build ID is required' });
      }

      const build = await storage.getBuild(id);
      
      if (!build) {
        return res.status(404).json({ error: 'Build not found' });
      }

      // Only return public builds for sharing
      if (!build.isPublic) {
        return res.status(404).json({ error: 'Build not found' });
      }

      res.json(build);
    } catch (error) {
      console.error('Get build error:', error);
      res.status(500).json({ error: 'Failed to get build' });
    }
  });

  // Accessories endpoint
  app.get('/api/accessories', async (req, res) => {
    try {
      // Read accessories data from JSON file
      const accessoriesPath = join(process.cwd(), 'data', 'accessories.json');
      const accessoriesData = JSON.parse(readFileSync(accessoriesPath, 'utf8'));
      
      // Add mock vendor pricing for each accessory
      const addVendorPricing = (item: any) => {
        const basePrice = item.price;
        // Generate realistic price variations across vendors (±10-20%)
        const priceVariation = 0.1 + Math.random() * 0.1; // 10-20% variation
        const amazonPrice = Math.round(basePrice * (1 + priceVariation * (Math.random() - 0.5) * 2));
        const neweggPrice = Math.round(basePrice * (1 + priceVariation * (Math.random() - 0.5) * 2));
        const bestbuyPrice = Math.round(basePrice * (1 + priceVariation * (Math.random() - 0.5) * 2));
        const microcenterPrice = Math.round(basePrice * (1 + priceVariation * (Math.random() - 0.5) * 2));
        
        return {
          ...item,
          vendorPrices: {
            amazon: amazonPrice,
            newegg: neweggPrice,
            bestbuy: bestbuyPrice,
            microcenter: microcenterPrice
          },
          lowestPrice: Math.min(amazonPrice, neweggPrice, bestbuyPrice, microcenterPrice),
          averagePrice: Math.round((amazonPrice + neweggPrice + bestbuyPrice + microcenterPrice) / 4)
        };
      };

      // Add vendor pricing to all items
      const essentialsWithPricing = accessoriesData.essentials.map(addVendorPricing);
      const niceToHavesWithPricing = accessoriesData.nice_to_haves.map(addVendorPricing);

      res.json({
        essentials: essentialsWithPricing,
        niceToHaves: niceToHavesWithPricing,
        categories: accessoriesData.categories,
        recommendationRules: accessoriesData.recommendation_rules,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Accessories endpoint error:', error);
      res.status(500).json({ error: 'Failed to load accessories data' });
    }
  });

  // Admin middleware for provenance endpoints
  const requireAdminToken = (req: any, res: any, next: any) => {
    const adminToken = process.env.ADMIN_TOKEN;
    const providedToken = req.headers['x-admin-token'];
    
    if (!adminToken) {
      return res.status(500).json({ error: 'Admin token not configured' });
    }
    
    if (!providedToken || providedToken !== adminToken) {
      return res.status(401).json({ error: 'Invalid or missing admin token' });
    }
    
    next();
  };

  // Manual verify single component
  app.post('/api/verify/:partId', requireAdminToken, async (req, res) => {
    try {
      const { partId } = req.params;
      
      // Get component from storage
      const component = await storage.getComponent(partId);
      if (!component) {
        return res.status(404).json({ error: 'Component not found' });
      }
      
      const result = await verifyPart(component);
      res.json(result);
      
    } catch (error) {
      console.error('Manual verification error:', error);
      res.status(500).json({ error: 'Failed to verify component' });
    }
  });

  // Manual bulk verification
  app.post('/api/reverify-all', requireAdminToken, async (req, res) => {
    try {
      const stats = await reverifyAll();
      res.json({
        message: 'Bulk verification completed',
        stats,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Bulk verification error:', error);
      res.status(500).json({ error: 'Failed to perform bulk verification' });
    }
  });

  // Get provenance information for all components
  app.get('/api/provenance', async (req, res) => {
    try {
      const allComponents = await storage.getAllComponents();
      const provenanceData = allComponents
        .filter(c => c.specUrl) // Only include components with spec URLs
        .map(c => ({
          id: c.id,
          kind: c.category,
          specUrl: c.specUrl,
          verifiedAt: c.verifiedAt,
          lastStatus: c.lastStatus
        }));
      
      res.json({
        components: provenanceData,
        lastProvenanceRunAt: getLastProvenanceRunAt(),
        total: provenanceData.length
      });
      
    } catch (error) {
      console.error('Provenance listing error:', error);
      res.status(500).json({ error: 'Failed to get provenance data' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
