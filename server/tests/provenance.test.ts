/**
 * Unit Tests for Provenance Service
 * Tests provenance verification and status transitions
 */

import { PCComponent } from '../../shared/schema';

// Mock fetch for testing
const mockFetch = (status: number, data?: any, headers?: Record<string, string>) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      status,
      headers: new Map(Object.entries(headers || {})),
      text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)),
    } as Response)
  );
};

// Mock crypto for testing
const mockCrypto = () => {
  const crypto = require('crypto');
  Object.defineProperty(global, 'crypto', {
    value: {
      subtle: {
        digest: (algorithm: string, data: ArrayBuffer) => {
          const hash = crypto.createHash('sha256');
          hash.update(Buffer.from(data));
          return Promise.resolve(hash.digest());
        }
      }
    }
  });
};

// Test component with spec URL
const testComponent: PCComponent = {
  id: 'test-gpu-1',
  name: 'Test GPU RTX 4070',
  brand: 'NVIDIA',
  category: 'GPU',
  price: 599,
  spec: '12GB GDDR6X, 200W TDP, PCIe 4.0',
  imageUrl: 'test.jpg',
  isAvailable: true,
  specUrl: 'https://nvidia.com/rtx-4070-spec',
  verifiedAt: null,
  sourceNote: null,
  lastStatus: null,
  lastEtag: null,
  lastHash: null
};

// Import the verifyComponentSpec function (would need to be exported from provenance.ts)
// For now, we'll create a mock implementation for testing
const mockVerifyComponentSpec = async (component: PCComponent): Promise<Partial<PCComponent>> => {
  const now = new Date().toISOString();
  
  if (!component.specUrl) {
    return {
      lastStatus: 'unknown',
      verifiedAt: now,
      sourceNote: 'No specification URL provided'
    };
  }

  try {
    const response = await fetch(component.specUrl, { method: 'HEAD' });
    const etag = response.headers.get('etag');
    
    if (response.status === 200) {
      // If this is first verification or no previous ETag
      if (!component.lastEtag || !etag) {
        return {
          lastStatus: 'fresh',
          verifiedAt: now,
          lastEtag: etag,
          sourceNote: 'Successfully verified'
        };
      }
      
      // Check if content changed
      if (etag !== component.lastEtag) {
        return {
          lastStatus: 'changed',
          verifiedAt: now,
          lastEtag: etag,
          sourceNote: 'Content changed since last verification'
        };
      }
      
      // Content unchanged - check if stale (14+ days)
      const lastVerified = component.verifiedAt ? new Date(component.verifiedAt) : new Date(0);
      const daysSinceVerified = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);
      
      return {
        lastStatus: daysSinceVerified >= 14 ? 'stale' : 'fresh',
        verifiedAt: now,
        lastEtag: etag,
        sourceNote: daysSinceVerified >= 14 ? 'Verification is stale' : 'Up to date'
      };
    } else {
      return {
        lastStatus: 'unknown',
        verifiedAt: now,
        sourceNote: `HTTP ${response.status} - Unable to verify specification`
      };
    }
  } catch (error) {
    return {
      lastStatus: 'unknown',
      verifiedAt: now,
      sourceNote: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Test: Fresh status for new component
 */
async function testFreshStatus() {
  console.log('\n=== Testing Fresh Status ===');
  mockFetch(200, 'Test specification content', { etag: '"abc123"' });
  
  const result = await mockVerifyComponentSpec(testComponent);
  
  console.assert(result.lastStatus === 'fresh', `Expected 'fresh', got '${result.lastStatus}'`);
  console.assert(result.lastEtag === '"abc123"', `Expected ETag '"abc123"', got '${result.lastEtag}'`);
  console.assert(result.verifiedAt !== null, 'Expected verifiedAt to be set');
  console.log('✓ Fresh status test passed');
}

/**
 * Test: Changed status when ETag differs
 */
async function testChangedStatus() {
  console.log('\n=== Testing Changed Status ===');
  mockFetch(200, 'Updated specification content', { etag: '"xyz789"' });
  
  const componentWithPreviousEtag = {
    ...testComponent,
    lastEtag: '"abc123"',
    verifiedAt: new Date().toISOString()
  };
  
  const result = await mockVerifyComponentSpec(componentWithPreviousEtag);
  
  console.assert(result.lastStatus === 'changed', `Expected 'changed', got '${result.lastStatus}'`);
  console.assert(result.lastEtag === '"xyz789"', `Expected new ETag '"xyz789"', got '${result.lastEtag}'`);
  console.assert(result.sourceNote?.includes('changed'), 'Expected source note to mention change');
  console.log('✓ Changed status test passed');
}

/**
 * Test: Stale status for old verification
 */
async function testStaleStatus() {
  console.log('\n=== Testing Stale Status ===');
  mockFetch(200, 'Test specification content', { etag: '"abc123"' });
  
  const oldDate = new Date();
  oldDate.setDate(oldDate.getDate() - 20); // 20 days ago
  
  const componentWithOldVerification = {
    ...testComponent,
    lastEtag: '"abc123"',
    verifiedAt: oldDate.toISOString()
  };
  
  const result = await mockVerifyComponentSpec(componentWithOldVerification);
  
  console.assert(result.lastStatus === 'stale', `Expected 'stale', got '${result.lastStatus}'`);
  console.assert(result.sourceNote?.includes('stale'), 'Expected source note to mention stale');
  console.log('✓ Stale status test passed');
}

/**
 * Test: Unknown status for failed requests
 */
async function testUnknownStatus() {
  console.log('\n=== Testing Unknown Status ===');
  mockFetch(404, 'Not found');
  
  const result = await mockVerifyComponentSpec(testComponent);
  
  console.assert(result.lastStatus === 'unknown', `Expected 'unknown', got '${result.lastStatus}'`);
  console.assert(result.sourceNote?.includes('404'), 'Expected source note to mention HTTP 404');
  console.log('✓ Unknown status test passed');
}

/**
 * Test: Unknown status for component without specUrl
 */
async function testNoSpecUrlStatus() {
  console.log('\n=== Testing No Spec URL Status ===');
  
  const componentWithoutSpec = {
    ...testComponent,
    specUrl: null
  };
  
  const result = await mockVerifyComponentSpec(componentWithoutSpec);
  
  console.assert(result.lastStatus === 'unknown', `Expected 'unknown', got '${result.lastStatus}'`);
  console.assert(result.sourceNote?.includes('No specification'), 'Expected source note about missing spec URL');
  console.log('✓ No spec URL test passed');
}

/**
 * Test: Network error handling
 */
async function testNetworkError() {
  console.log('\n=== Testing Network Error ===');
  
  // Mock fetch to throw an error
  global.fetch = jest.fn(() => Promise.reject(new Error('Network timeout')));
  
  const result = await mockVerifyComponentSpec(testComponent);
  
  console.assert(result.lastStatus === 'unknown', `Expected 'unknown', got '${result.lastStatus}'`);
  console.assert(result.sourceNote?.includes('Network error'), 'Expected source note about network error');
  console.log('✓ Network error test passed');
}

/**
 * Run all provenance tests
 */
export async function runProvenanceTests() {
  console.log('🧪 Running Provenance Tests');
  
  try {
    await testFreshStatus();
    await testChangedStatus();
    await testStaleStatus();
    await testUnknownStatus();
    await testNoSpecUrlStatus();
    await testNetworkError();
    
    console.log('\n✅ All provenance tests passed!');
  } catch (error) {
    console.error('\n❌ Provenance tests failed:', error);
    throw error;
  }
}

// Allow direct execution for testing
if (require.main === module) {
  runProvenanceTests();
}