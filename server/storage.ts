import { type User, type InsertUser, type PCComponent, type InsertComponent, type BuildPreset, type InsertPreset, type UserBuild, type InsertBuild } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Component methods
  getAllComponents(): Promise<PCComponent[]>;
  getComponentsByCategory(category: string): Promise<PCComponent[]>;
  getComponent(id: string): Promise<PCComponent | undefined>;
  createComponent(component: InsertComponent): Promise<PCComponent>;
  
  // Preset methods
  getAllPresets(): Promise<BuildPreset[]>;
  getPreset(id: string): Promise<BuildPreset | undefined>;
  createPreset(preset: InsertPreset): Promise<BuildPreset>;
  
  // User build methods
  getUserBuilds(userId: string): Promise<UserBuild[]>;
  getBuild(id: string): Promise<UserBuild | undefined>;
  createBuild(build: InsertBuild): Promise<UserBuild>;
  updateBuild(id: string, build: Partial<InsertBuild>): Promise<UserBuild | undefined>;
  deleteBuild(id: string): Promise<boolean>;
  
  // Public build sharing methods
  saveBuild(build: { name: string; components: any; totalPrice: number }): Promise<{ id: string }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private components: Map<string, PCComponent>;
  private presets: Map<string, BuildPreset>;
  private builds: Map<string, UserBuild>;

  constructor() {
    this.users = new Map();
    this.components = new Map();
    this.presets = new Map();
    this.builds = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Component methods
  async getAllComponents(): Promise<PCComponent[]> {
    return Array.from(this.components.values());
  }

  async getComponentsByCategory(category: string): Promise<PCComponent[]> {
    return Array.from(this.components.values()).filter(
      (component) => component.category === category
    );
  }

  async getComponent(id: string): Promise<PCComponent | undefined> {
    return this.components.get(id);
  }

  async createComponent(insertComponent: InsertComponent): Promise<PCComponent> {
    const id = randomUUID();
    const component: PCComponent = { 
      ...insertComponent, 
      id,
      spec: insertComponent.spec ?? null,
      imageUrl: insertComponent.imageUrl ?? null,
      isAvailable: insertComponent.isAvailable ?? true,
      // Verification and tracking fields
      specUrl: insertComponent.specUrl ?? null,
      verifiedAt: insertComponent.verifiedAt ?? null,
      sourceNote: insertComponent.sourceNote ?? null,
      lastStatus: insertComponent.lastStatus ?? null,
      lastEtag: insertComponent.lastEtag ?? null,
      lastHash: insertComponent.lastHash ?? null
    };
    this.components.set(id, component);
    return component;
  }

  // Preset methods
  async getAllPresets(): Promise<BuildPreset[]> {
    return Array.from(this.presets.values());
  }

  async getPreset(id: string): Promise<BuildPreset | undefined> {
    return this.presets.get(id);
  }

  async createPreset(insertPreset: InsertPreset): Promise<BuildPreset> {
    const id = randomUUID();
    const preset: BuildPreset = { 
      ...insertPreset, 
      id,
      description: insertPreset.description ?? null,
      components: insertPreset.components ?? null
    };
    this.presets.set(id, preset);
    return preset;
  }

  // User build methods
  async getUserBuilds(userId: string): Promise<UserBuild[]> {
    return Array.from(this.builds.values()).filter(
      (build) => build.userId === userId
    );
  }

  async getBuild(id: string): Promise<UserBuild | undefined> {
    return this.builds.get(id);
  }

  async createBuild(insertBuild: InsertBuild): Promise<UserBuild> {
    const id = randomUUID();
    const build: UserBuild = { 
      ...insertBuild, 
      id,
      components: insertBuild.components ?? null,
      userId: insertBuild.userId ?? null,
      isPublic: insertBuild.isPublic ?? false
    };
    this.builds.set(id, build);
    return build;
  }

  async updateBuild(id: string, updateData: Partial<InsertBuild>): Promise<UserBuild | undefined> {
    const existingBuild = this.builds.get(id);
    if (!existingBuild) return undefined;
    
    const updatedBuild: UserBuild = { ...existingBuild, ...updateData };
    this.builds.set(id, updatedBuild);
    return updatedBuild;
  }

  async deleteBuild(id: string): Promise<boolean> {
    return this.builds.delete(id);
  }

  // Public build sharing methods
  async saveBuild(build: { name: string; components: any; totalPrice: number }): Promise<{ id: string }> {
    const id = randomUUID();
    const publicBuild: UserBuild = {
      id,
      userId: null, // Public build, not tied to a user
      name: build.name,
      components: typeof build.components === 'string' ? build.components : JSON.stringify(build.components),
      totalPrice: build.totalPrice,
      isPublic: true
    };
    this.builds.set(id, publicBuild);
    return { id };
  }
}

export const storage = new MemStorage();
