/**
 * Integration Tests for Compatibility API
 * Tests /api/compatibility endpoint with known good and bad builds
 */

import { PCComponent } from '../../shared/schema';

// Mock components representing a known problematic build
const badBuildComponents: PCComponent[] = [
  // Intel CPU but AMD motherboard (socket mismatch)
  {
    id: 'cpu-intel-13700k',
    name: 'Intel i7-13700K',
    brand: 'Intel',
    category: 'CPU',
    price: 409,
    spec: 'LGA1700 Socket, 16c/24t, 125W TDP',
    imageUrl: ''
  },
  
  // High-end GPU with high power draw
  {
    id: 'gpu-nvidia-rtx4090',
    name: 'NVIDIA RTX 4090',
    brand: 'NVIDIA',
    category: 'GPU',
    price: 1599,
    spec: '24GB GDDR6X, 450W TDP, 336mm Length',
    imageUrl: ''
  },

  // AMD motherboard (incompatible with Intel CPU)
  {
    id: 'mb-asus-b550-tuf',
    name: 'ASUS TUF Gaming B550-PLUS',
    brand: 'ASUS',
    category: 'Motherboard',
    price: 159,
    spec: 'AM4 Socket, ATX, B550 Chipset, 12+2 VRM',
    imageUrl: ''
  },

  // DDR5 RAM (incompatible with AM4 motherboard)
  {
    id: 'ram-gskill-ddr5',
    name: 'G.SKILL Trident Z5 RGB 32GB',
    brand: 'G.SKILL',
    category: 'RAM',
    price: 179,
    spec: 'DDR5-5600, 32GB (2x16GB), CL36',
    imageUrl: ''
  },

  // Insufficient PSU for high-end build
  {
    id: 'psu-seasonic-450w',
    name: 'Seasonic Focus GX-450',
    brand: 'Seasonic',
    category: 'PSU',
    price: 79,
    spec: '450W, 80+ Gold, ATX, Modular',
    imageUrl: ''
  },

  // Mini-ITX case (too small for ATX motherboard)
  {
    id: 'case-ncase-m1',
    name: 'NCASE M1',
    brand: 'NCASE',
    category: 'Case',
    price: 210,
    spec: 'Mini-ITX, 130mm CPU Cooler, 320mm GPU',
    imageUrl: ''
  }
];

// Known good build components
const goodBuildComponents: PCComponent[] = [
  {
    id: 'cpu-amd-5800x3d',
    name: 'AMD Ryzen 7 5800X3D',
    brand: 'AMD',
    category: 'CPU',
    price: 349,
    spec: 'AM4 Socket, 8c/16t, 105W TDP, X3D Cache',
    imageUrl: ''
  },
  
  {
    id: 'gpu-amd-rx6800xt',
    name: 'AMD RX 6800 XT',
    brand: 'AMD',
    category: 'GPU',
    price: 599,
    spec: '16GB GDDR6, 300W TDP, 320mm Length',
    imageUrl: ''
  },

  {
    id: 'mb-asus-b550-tuf',
    name: 'ASUS TUF Gaming B550-PLUS',
    brand: 'ASUS',
    category: 'Motherboard',
    price: 159,
    spec: 'AM4 Socket, ATX, B550 Chipset, 12+2 VRM',
    imageUrl: ''
  },

  {
    id: 'ram-corsair-ddr4',
    name: 'Corsair Vengeance LPX 32GB',
    brand: 'Corsair',
    category: 'RAM',
    price: 119,
    spec: 'DDR4-3200, 32GB (2x16GB), CL16',
    imageUrl: ''
  },

  {
    id: 'psu-corsair-850w',
    name: 'Corsair RM850x',
    brand: 'Corsair',
    category: 'PSU',
    price: 139,
    spec: '850W, 80+ Gold, ATX, Modular',
    imageUrl: ''
  },

  {
    id: 'case-fractal-define-7',
    name: 'Fractal Design Define 7',
    brand: 'Fractal Design',
    category: 'Case',
    price: 169,
    spec: 'ATX, 167mm CPU Cooler, 360mm GPU',
    imageUrl: ''
  }
];

describe('Compatibility API Integration Tests', () => {
  const BASE_URL = 'http://localhost:5000';

  // Helper function to make API requests
  async function checkCompatibility(components: PCComponent[]) {
    const response = await fetch(`${BASE_URL}/api/compatibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ components }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  describe('Bad Build Detection', () => {
    test('should detect multiple compatibility issues in problematic build', async () => {
      const result = await checkCompatibility(badBuildComponents);

      // Verify response structure
      expect(result).toHaveProperty('hardFails');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('score');

      // Should have multiple hard failures
      expect(result.hardFails.length).toBeGreaterThan(0);
      
      // Check for specific expected issues
      const issueTypes = result.hardFails.map((issue: any) => issue.category);
      
      // Socket mismatch (Intel CPU + AMD motherboard)
      expect(issueTypes).toContain('Socket');
      
      // RAM type mismatch (DDR5 + AM4 motherboard)
      expect(issueTypes).toContain('Memory');
      
      // Form factor mismatch (ATX motherboard + Mini-ITX case)
      expect(issueTypes).toContain('Form Factor');
      
      // Power insufficiency (450W PSU + RTX 4090 + i7-13700K)
      expect(issueTypes).toContain('Power');

      // Score should be significantly reduced
      expect(result.score).toBeLessThan(50);
      
      // Verify specific error messages are informative
      const socketIssue = result.hardFails.find((issue: any) => issue.category === 'Socket');
      expect(socketIssue.details).toContain('LGA1700');
      expect(socketIssue.details).toContain('AM4');
      
      const powerIssue = result.hardFails.find((issue: any) => issue.category === 'Power');
      expect(powerIssue.details).toContain('450W');
    }, 10000); // 10 second timeout for API call

    test('should provide helpful recommendations for problematic build', async () => {
      const result = await checkCompatibility(badBuildComponents);

      // Should have recommendations to fix the issues
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      // Recommendations should be actionable
      const recommendations = result.recommendations.join(' ').toLowerCase();
      expect(recommendations).toMatch(/motherboard|psu|case|memory|socket/);
    }, 10000);
  });

  describe('Good Build Validation', () => {
    test('should pass compatible build with high score', async () => {
      const result = await checkCompatibility(goodBuildComponents);

      // Should have no hard failures
      expect(result.hardFails.length).toBe(0);
      
      // Should have high compatibility score
      expect(result.score).toBeGreaterThanOrEqual(90);
      
      // May have warnings but they shouldn't be critical
      if (result.warnings.length > 0) {
        // Warnings should be minor issues, not hard failures
        expect(result.score).toBeGreaterThan(80);
      }

      // Should have rules version for tracking
      expect(result.rulesVersion).toBeDefined();
    }, 10000);
  });

  describe('API Error Handling', () => {
    test('should handle invalid component data gracefully', async () => {
      const invalidComponents = [
        {
          id: 'invalid-component',
          name: 'Invalid Component',
          category: 'INVALID_CATEGORY',
          price: -100, // Invalid price
          spec: '', // Empty spec
        } as any
      ];

      try {
        const result = await checkCompatibility(invalidComponents);
        
        // Should still return a valid response structure
        expect(result).toHaveProperty('hardFails');
        expect(result).toHaveProperty('score');
      } catch (error) {
        // Or should return a proper HTTP error
        expect(error).toBeDefined();
      }
    }, 10000);

    test('should handle empty component list', async () => {
      const result = await checkCompatibility([]);

      // Should return empty results but valid structure
      expect(result).toHaveProperty('hardFails');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('score');
      
      expect(result.hardFails.length).toBe(0);
      expect(result.warnings.length).toBe(0);
    }, 10000);

    test('should handle malformed request gracefully', async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/compatibility`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invalid: 'data' }),
        });

        // Should return proper HTTP error status
        expect(response.status).toBeGreaterThanOrEqual(400);
      } catch (error) {
        // Network errors are also acceptable for this test
        expect(error).toBeDefined();
      }
    }, 10000);
  });

  describe('Performance Tests', () => {
    test('should respond within reasonable time limits', async () => {
      const startTime = Date.now();
      
      await checkCompatibility(badBuildComponents);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // API should respond within 2 seconds
      expect(responseTime).toBeLessThan(2000);
    }, 10000);

    test('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        checkCompatibility(goodBuildComponents)
      );

      const results = await Promise.all(requests);
      
      // All requests should succeed
      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result).toHaveProperty('score');
        expect(result.score).toBeGreaterThanOrEqual(90);
      });
    }, 15000);
  });
});