import crypto from 'crypto';
import { PCComponent, ComponentStatus } from '@shared/schema';
import { storage } from './storage';

export interface VerificationResult {
  id: string;
  status: ComponentStatus;
  verifiedAt: string;
  sourceNote?: string | null;
  lastEtag?: string | null;
  lastHash?: string | null;
}

export interface ProvenanceStats {
  total: number;
  verified: number;
  fresh: number;
  stale: number;
  changed: number;
  unknown: number;
  errors: number;
}

// In-memory storage for provenance run tracking
let lastProvenanceRunAt: string | null = null;

export function getLastProvenanceRunAt(): string | null {
  return lastProvenanceRunAt;
}

export function setLastProvenanceRunAt(timestamp: string): void {
  lastProvenanceRunAt = timestamp;
}

/**
 * Verify a single component's specification URL
 */
export async function verifyPart(component: PCComponent): Promise<VerificationResult> {
  const now = new Date().toISOString();
  
  if (!component.specUrl) {
    return {
      id: component.id,
      status: 'unknown',
      verifiedAt: now,
      sourceNote: 'No specification URL provided'
    };
  }

  try {
    const url = new URL(component.specUrl);
    
    // First try HEAD request to get headers without downloading content
    const headResponse = await fetch(component.specUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'EliteRigs-Bot/1.0 (+https://eliterigs.replit.app)'
      },
      redirect: 'follow'
    });

    const etag = headResponse.headers.get('etag');
    const lastModified = headResponse.headers.get('last-modified');
    
    let status: ComponentStatus = 'fresh';
    let sourceNote = '';
    let newEtag = etag || undefined;
    let newHash = component.lastHash;

    // Check if URL was redirected
    if (headResponse.url !== component.specUrl) {
      sourceNote = `Redirected from ${component.specUrl} to ${headResponse.url}`;
    }

    if (!headResponse.ok) {
      if (headResponse.status === 404) {
        status = 'stale';
        sourceNote = `URL not found (404): ${component.specUrl}`;
      } else {
        status = 'unknown';
        sourceNote = `HTTP ${headResponse.status}: ${headResponse.statusText}`;
      }
    } else {
      // Compare with stored ETag or hash to detect changes
      if (component.lastEtag && etag && component.lastEtag !== etag) {
        status = 'changed';
        sourceNote = 'ETag changed, content may have been updated';
      } else if (!etag && component.lastHash) {
        // No ETag available, need to fetch content and compare hash
        try {
          const getResponse = await fetch(component.specUrl, {
            headers: {
              'User-Agent': 'EliteRigs-Bot/1.0 (+https://eliterigs.replit.app)'
            },
            redirect: 'follow'
          });
          
          if (getResponse.ok) {
            const content = await getResponse.text();
            const hash = crypto.createHash('sha256').update(content).digest('hex');
            newHash = hash;
            
            if (component.lastHash && component.lastHash !== hash) {
              status = 'changed';
              sourceNote = 'Content hash changed, specification has been updated';
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch content for hash comparison: ${component.specUrl}`, error);
          status = 'unknown';
          sourceNote = 'Failed to verify content changes';
        }
      }
    }

    // Update component in storage with new verification data
    const updatedComponent: PCComponent = {
      ...component,
      verifiedAt: now,
      lastStatus: status,
      sourceNote: sourceNote || undefined,
      lastEtag: newEtag,
      lastHash: newHash
    };

    // Save updated component (this will work with the current MemStorage)
    // In a real database implementation, this would update the existing record
    try {
      await storage.createComponent(updatedComponent);
    } catch (error) {
      console.warn(`Failed to update component ${component.id} verification data:`, error);
    }

    return {
      id: component.id,
      status,
      verifiedAt: now,
      sourceNote: sourceNote || null,
      lastEtag: newEtag || null,
      lastHash: newHash || null
    };

  } catch (error) {
    console.error(`Error verifying component ${component.id} at ${component.specUrl}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      id: component.id,
      status: 'unknown',
      verifiedAt: now,
      sourceNote: `Verification failed: ${errorMessage}`,
      lastEtag: null,
      lastHash: null
    };
  }
}

/**
 * Verify all components that have specification URLs
 */
export async function reverifyAll(): Promise<ProvenanceStats> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  console.log(`[Provenance] Starting bulk verification at ${timestamp}`);
  
  try {
    // Get all components from storage
    const allComponents = await storage.getAllComponents();
    const componentsWithSpecUrl = allComponents.filter(c => c.specUrl);
    
    const stats: ProvenanceStats = {
      total: componentsWithSpecUrl.length,
      verified: 0,
      fresh: 0,
      stale: 0,
      changed: 0,
      unknown: 0,
      errors: 0
    };

    console.log(`[Provenance] Found ${stats.total} components with specification URLs`);

    // Verify each component with a small delay to avoid overwhelming servers
    for (const component of componentsWithSpecUrl) {
      try {
        const result = await verifyPart(component);
        stats.verified++;
        
        switch (result.status) {
          case 'fresh':
            stats.fresh++;
            break;
          case 'stale':
            stats.stale++;
            break;
          case 'changed':
            stats.changed++;
            break;
          case 'unknown':
            stats.unknown++;
            break;
        }
        
        // Small delay between requests to be respectful to external servers
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`[Provenance] Failed to verify component ${component.id}:`, error);
        stats.errors++;
      }
    }

    const duration = Date.now() - startTime;
    setLastProvenanceRunAt(timestamp);
    
    console.log(`[Provenance] Bulk verification completed in ${duration}ms`);
    console.log(`[Provenance] Results:`, stats);
    
    return stats;
    
  } catch (error) {
    console.error(`[Provenance] Bulk verification failed:`, error);
    throw error;
  }
}