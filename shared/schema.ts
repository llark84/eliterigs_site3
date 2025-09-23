import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const pcComponents = pgTable("pc_components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  spec: text("spec"),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  // Verification and tracking fields
  specUrl: text("spec_url"),
  verifiedAt: text("verified_at"),
  sourceNote: text("source_note"),
  lastStatus: text("last_status"), // 'fresh'|'stale'|'unknown'|'changed'
  lastEtag: text("last_etag"),
  lastHash: text("last_hash"),
});

export const buildPresets = pgTable("build_presets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  price: integer("price").notNull(),
  description: text("description"),
  components: text("components"), // JSON string of component IDs
});

export const userBuilds = pgTable("user_builds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  components: text("components"), // JSON string of selected components
  totalPrice: integer("total_price").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertComponentSchema = createInsertSchema(pcComponents).omit({
  id: true,
});

export const insertPresetSchema = createInsertSchema(buildPresets).omit({
  id: true,
});

export const insertBuildSchema = createInsertSchema(userBuilds).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PCComponent = typeof pcComponents.$inferSelect;
export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type BuildPreset = typeof buildPresets.$inferSelect;
export type InsertPreset = z.infer<typeof insertPresetSchema>;
export type UserBuild = typeof userBuilds.$inferSelect;
export type InsertBuild = z.infer<typeof insertBuildSchema>;

// Component categories for type safety
export const COMPONENT_CATEGORIES = [
  "CPU",
  "GPU", 
  "Motherboard",
  "RAM",
  "SSD",
  "HDD",
  "Case",
  "PSU",
  "Cooler",
  "AIO", // Added AIO category
  "Fan"
] as const;

// Status values for component verification tracking
export const COMPONENT_STATUS = [
  "fresh",
  "stale", 
  "unknown",
  "changed"
] as const;

export type ComponentStatus = typeof COMPONENT_STATUS[number];

export type ComponentCategory = typeof COMPONENT_CATEGORIES[number];

// Build tiers
export const BUILD_TIERS = [
  "Entry",
  "Mid-range", 
  "High-end",
  "Enthusiast",
  "Custom"
] as const;

export type BuildTier = typeof BUILD_TIERS[number];

// Compatibility checking interfaces
export interface CompatibilityCheck {
  type: 'hard' | 'soft';
  category: string;
  issue: string;
  details: string;
  id?: string; // Rule ID (e.g., 'SFF-001', 'CORE-001')
  partIds?: string[]; // Component IDs involved in the check
  source?: {
    url?: string; // Manufacturer spec URL
    note?: string; // Heuristic or fallback explanation
  };
}

export interface BuildCompatibility {
  hardFails: CompatibilityCheck[];
  softWarns: CompatibilityCheck[];
  score: number; // 0-100
  rulesVersion: string;
  overrideReason?: string;
}

// Pricing and part identity interfaces
export interface PartIdentity {
  id: string;
  kind: string;
  manufacturer: string;
  model: string;
  sku?: string;
  upc?: string;
  mpn?: string;
}

export interface Offer {
  vendor: string;
  url: string;
  basePrice: number;
  shipping: number;
  taxEstimate: number;
  total: number;
  inStock: boolean;
  lastChecked: string;
  currency: 'USD';
  notes?: string;
}

export interface PriceResult {
  partId: string;
  offers: Offer[];
  best: Offer | null;
  generatedAt: string;
}