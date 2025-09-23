/**
 * Unit Tests for Compatibility Logic
 * Tests scoreBuild rules and PSU calculation functionality
 */

import { scoreBuild, parseSpecs, getGPUPowerEstimate } from '../compatibility';
import { PCComponent } from '../../shared/schema';

// Mock components for testing
const mockComponents = {
  // AMD Build Components
  amdrx6800_cpu: {
    id: 'cpu-amd-5800x3d',
    name: 'AMD Ryzen 7 5800X3D',
    brand: 'AMD',
    category: 'CPU',
    price: 349,
    spec: 'AM4 Socket, 8c/16t, 105W TDP, X3D Cache',
    imageUrl: ''
  } as PCComponent,

  amdrx6800_gpu: {
    id: 'gpu-amd-rx6800xt',
    name: 'AMD RX 6800 XT',
    brand: 'AMD',
    category: 'GPU',
    price: 599,
    spec: '16GB GDDR6, 300W TDP, 320mm Length',
    imageUrl: ''
  } as PCComponent,

  amd_motherboard: {
    id: 'mb-asus-b550-tuf',
    name: 'ASUS TUF Gaming B550-PLUS',
    brand: 'ASUS',
    category: 'Motherboard',
    price: 159,
    spec: 'AM4 Socket, ATX, B550 Chipset, 12+2 VRM',
    imageUrl: ''
  } as PCComponent,

  ddr4_ram: {
    id: 'ram-corsair-ddr4',
    name: 'Corsair Vengeance LPX 32GB',
    brand: 'Corsair',
    category: 'RAM',
    price: 119,
    spec: 'DDR4-3200, 32GB (2x16GB), CL16',
    imageUrl: ''
  } as PCComponent,

  // Intel Build Components
  intel_cpu: {
    id: 'cpu-intel-13700k',
    name: 'Intel i7-13700K',
    brand: 'Intel',
    category: 'CPU',
    price: 409,
    spec: 'LGA1700 Socket, 16c/24t, 125W TDP',
    imageUrl: ''
  } as PCComponent,

  intel_motherboard: {
    id: 'mb-msi-z790',
    name: 'MSI Z790 Gaming Pro WiFi',
    brand: 'MSI',
    category: 'Motherboard',
    price: 229,
    spec: 'LGA1700 Socket, ATX, Z790 Chipset, 14+2 VRM',
    imageUrl: ''
  } as PCComponent,

  ddr5_ram: {
    id: 'ram-gskill-ddr5',
    name: 'G.SKILL Trident Z5 RGB 32GB',
    brand: 'G.SKILL',
    category: 'RAM',
    price: 179,
    spec: 'DDR5-5600, 32GB (2x16GB), CL36',
    imageUrl: ''
  } as PCComponent,

  // Power Supply Units
  psu_650w: {
    id: 'psu-seasonic-650w',
    name: 'Seasonic Focus GX-650',
    brand: 'Seasonic',
    category: 'PSU',
    price: 109,
    spec: '650W, 80+ Gold, ATX, Modular',
    imageUrl: ''
  } as PCComponent,

  psu_850w: {
    id: 'psu-corsair-850w',
    name: 'Corsair RM850x',
    brand: 'Corsair',
    category: 'PSU',
    price: 139,
    spec: '850W, 80+ Gold, ATX, Modular',
    imageUrl: ''
  } as PCComponent,

  // Cases
  atx_case: {
    id: 'case-fractal-define-7',
    name: 'Fractal Design Define 7',
    brand: 'Fractal Design',
    category: 'Case',
    price: 169,
    spec: 'ATX, 167mm CPU Cooler, 360mm GPU',
    imageUrl: ''
  } as PCComponent,

  itx_case: {
    id: 'case-ncase-m1',
    name: 'NCASE M1',
    brand: 'NCASE',
    category: 'Case',
    price: 210,
    spec: 'Mini-ITX, 130mm CPU Cooler, 320mm GPU',
    imageUrl: ''
  } as PCComponent,

  // High-end GPU for power testing
  rtx4090: {
    id: 'gpu-nvidia-rtx4090',
    name: 'NVIDIA RTX 4090',
    brand: 'NVIDIA',
    category: 'GPU',
    price: 1599,
    spec: '24GB GDDR6X, 450W TDP, 336mm Length',
    imageUrl: ''
  } as PCComponent
};

describe('Compatibility Engine', () => {
  describe('parseSpecs functions', () => {
    test('parseSpecs.cpu should extract CPU specifications correctly', () => {
      const spec = 'AM4 Socket, 8c/16t, 105W TDP, X3D Cache';
      const parsed = parseSpecs.cpu(spec);
      
      expect(parsed.socket).toBe('AM4');
      expect(parsed.cores).toBe(8);
      expect(parsed.threads).toBe(16);
      expect(parsed.tdp).toBe(105);
      expect(parsed.isX3D).toBe(true);
    });

    test('parseSpecs.psu should extract PSU wattage correctly', () => {
      const spec = '650W, 80+ Gold, ATX, Modular';
      const parsed = parseSpecs.psu(spec);
      
      expect(parsed.wattage).toBe(650);
      expect(parsed.efficiency).toBe('80+ Gold');
      expect(parsed.formFactor).toBe('ATX');
    });

    test('parseSpecs.gpu should extract GPU specifications correctly', () => {
      const spec = '16GB GDDR6, 300W TDP, 320mm Length';
      const parsed = parseSpecs.gpu(spec);
      
      expect(parsed.vram).toBe(16);
      expect(parsed.power).toBe(300);
      expect(parsed.length).toBe(320);
    });

    test('parseSpecs.motherboard should extract socket and form factor', () => {
      const spec = 'AM4 Socket, ATX, B550 Chipset, 12+2 VRM';
      const parsed = parseSpecs.motherboard(spec);
      
      expect(parsed.socket).toBe('AM4');
      expect(parsed.formFactor).toBe('ATX');
      expect(parsed.chipset).toBe('B550');
    });

    test('parseSpecs.ram should extract memory type and speed', () => {
      const spec = 'DDR4-3200, 32GB (2x16GB), CL16';
      const parsed = parseSpecs.ram(spec);
      
      expect(parsed.type).toBe('DDR4');
      expect(parsed.speed).toBe(3200);
      expect(parsed.capacity).toBe(32);
    });
  });

  describe('PSU Wattage Calculation', () => {
    test('should calculate correct wattage requirement with 30% headroom', () => {
      const build = {
        CPU: mockComponents.amdrx6800_cpu, // 105W TDP
        GPU: mockComponents.amdrx6800_gpu, // ~300W estimated power
        PSU: mockComponents.psu_650w,      // 650W capacity
        Motherboard: mockComponents.amd_motherboard
      };

      const result = scoreBuild(build);
      
      // Expected: (105 + 300) * 1.3 = 526.5W rounded up = 527W
      // 650W PSU should be sufficient
      const powerIssues = result.hardFails.filter(issue => issue.category === 'Power');
      expect(powerIssues.length).toBe(0);
    });

    test('should fail when PSU wattage is insufficient', () => {
      const build = {
        CPU: mockComponents.intel_cpu,     // 125W TDP
        GPU: mockComponents.rtx4090,       // ~450W estimated power
        PSU: mockComponents.psu_650w,      // 650W capacity (insufficient)
        Motherboard: mockComponents.intel_motherboard
      };

      const result = scoreBuild(build);
      
      // Expected: (125 + 450) * 1.3 = 747.5W rounded up = 748W
      // 650W PSU should be insufficient
      const powerIssues = result.hardFails.filter(issue => issue.category === 'Power');
      expect(powerIssues.length).toBe(1);
      expect(powerIssues[0].issue).toBe('Insufficient PSU wattage');
      expect(powerIssues[0].details).toContain('650W');
    });

    test('should pass when PSU has adequate wattage for high-end build', () => {
      const build = {
        CPU: mockComponents.intel_cpu,     // 125W TDP
        GPU: mockComponents.rtx4090,       // ~450W estimated power
        PSU: mockComponents.psu_850w,      // 850W capacity (sufficient)
        Motherboard: mockComponents.intel_motherboard
      };

      const result = scoreBuild(build);
      
      // Expected: (125 + 450) * 1.3 = 747.5W rounded up = 748W
      // 850W PSU should be sufficient
      const powerIssues = result.hardFails.filter(issue => issue.category === 'Power');
      expect(powerIssues.length).toBe(0);
    });
  });

  describe('Socket Compatibility', () => {
    test('should pass when CPU and motherboard sockets match', () => {
      const build = {
        CPU: mockComponents.amdrx6800_cpu,     // AM4
        Motherboard: mockComponents.amd_motherboard  // AM4
      };

      const result = scoreBuild(build);
      
      const socketIssues = result.hardFails.filter(issue => issue.category === 'Socket');
      expect(socketIssues.length).toBe(0);
    });

    test('should fail when CPU and motherboard sockets do not match', () => {
      const build = {
        CPU: mockComponents.intel_cpu,        // LGA1700
        Motherboard: mockComponents.amd_motherboard  // AM4 (mismatch)
      };

      const result = scoreBuild(build);
      
      const socketIssues = result.hardFails.filter(issue => issue.category === 'Socket');
      expect(socketIssues.length).toBe(1);
      expect(socketIssues[0].issue).toBe('CPU socket mismatch');
      expect(socketIssues[0].details).toContain('LGA1700');
      expect(socketIssues[0].details).toContain('AM4');
    });
  });

  describe('RAM Type Compatibility', () => {
    test('should pass when RAM type matches motherboard platform', () => {
      const build = {
        RAM: mockComponents.ddr4_ram,              // DDR4
        Motherboard: mockComponents.amd_motherboard      // AM4 (expects DDR4)
      };

      const result = scoreBuild(build);
      
      const memoryIssues = result.hardFails.filter(issue => issue.category === 'Memory');
      expect(memoryIssues.length).toBe(0);
    });

    test('should pass when DDR5 is used with LGA1700 motherboard', () => {
      const build = {
        RAM: mockComponents.ddr5_ram,              // DDR5
        Motherboard: mockComponents.intel_motherboard    // LGA1700 (expects DDR5)
      };

      const result = scoreBuild(build);
      
      const memoryIssues = result.hardFails.filter(issue => issue.category === 'Memory');
      expect(memoryIssues.length).toBe(0);
    });

    test('should fail when RAM type does not match platform expectations', () => {
      const build = {
        RAM: mockComponents.ddr5_ram,              // DDR5
        Motherboard: mockComponents.amd_motherboard      // AM4 (expects DDR4)
      };

      const result = scoreBuild(build);
      
      const memoryIssues = result.hardFails.filter(issue => issue.category === 'Memory');
      expect(memoryIssues.length).toBe(1);
      expect(memoryIssues[0].issue).toBe('RAM type incompatible');
      expect(memoryIssues[0].details).toContain('DDR4');
      expect(memoryIssues[0].details).toContain('DDR5');
    });
  });

  describe('Form Factor Compatibility', () => {
    test('should pass when motherboard fits in case', () => {
      const build = {
        Motherboard: mockComponents.amd_motherboard,  // ATX
        Case: mockComponents.atx_case                 // ATX (compatible)
      };

      const result = scoreBuild(build);
      
      const formFactorIssues = result.hardFails.filter(issue => issue.category === 'Form Factor');
      expect(formFactorIssues.length).toBe(0);
    });

    test('should fail when motherboard is too large for case', () => {
      const build = {
        Motherboard: mockComponents.amd_motherboard,  // ATX
        Case: mockComponents.itx_case                 // Mini-ITX (too small)
      };

      const result = scoreBuild(build);
      
      const formFactorIssues = result.hardFails.filter(issue => issue.category === 'Form Factor');
      expect(formFactorIssues.length).toBe(1);
      expect(formFactorIssues[0].issue).toBe("Motherboard won't fit in case");
    });
  });

  describe('Overall Scoring', () => {
    test('should return perfect score for compatible build', () => {
      const build = {
        CPU: mockComponents.amdrx6800_cpu,
        GPU: mockComponents.amdrx6800_gpu,
        Motherboard: mockComponents.amd_motherboard,
        RAM: mockComponents.ddr4_ram,
        PSU: mockComponents.psu_850w,  // Adequate wattage
        Case: mockComponents.atx_case
      };

      const result = scoreBuild(build);
      
      expect(result.hardFails.length).toBe(0);
      expect(result.score).toBe(100);
    });

    test('should reduce score for builds with compatibility issues', () => {
      const build = {
        CPU: mockComponents.intel_cpu,        // LGA1700
        Motherboard: mockComponents.amd_motherboard,  // AM4 (mismatch)
        RAM: mockComponents.ddr5_ram,         // DDR5 on AM4 (mismatch)
        PSU: mockComponents.psu_650w          // Potentially insufficient
      };

      const result = scoreBuild(build);
      
      expect(result.hardFails.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(100);
      
      // Each hard fail reduces score by 15 points
      const expectedScore = Math.max(0, 100 - (result.hardFails.length * 15) - (result.softWarns.length * 5));
      expect(result.score).toBe(expectedScore);
    });

    test('should never return negative scores', () => {
      // Intentionally broken build with many issues
      const build = {
        CPU: mockComponents.intel_cpu,           // LGA1700
        GPU: mockComponents.rtx4090,             // High power draw
        Motherboard: mockComponents.amd_motherboard,    // AM4 (socket mismatch)
        RAM: mockComponents.ddr4_ram,            // DDR4 on Intel (type mismatch)
        PSU: mockComponents.psu_650w,            // Insufficient wattage
        Case: mockComponents.itx_case            // Too small for ATX motherboard
      };

      const result = scoreBuild(build);
      
      expect(result.hardFails.length).toBeGreaterThan(2);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('GPU Power Estimation', () => {
    test('should estimate RTX 4090 power correctly', () => {
      const power = getGPUPowerEstimate('24GB GDDR6X, 450W TDP, 336mm Length');
      
      // RTX 4090 should be estimated as high power draw
      expect(power).toBeGreaterThanOrEqual(400);
    });

    test('should estimate mid-range GPU power correctly', () => {
      const power = getGPUPowerEstimate('8GB GDDR6, 220W TDP, 270mm Length');
      
      // Mid-range GPU should be estimated as moderate power draw
      expect(power).toBeGreaterThanOrEqual(200);
      expect(power).toBeLessThan(300);
    });

    test('should provide default power estimate for unknown GPUs', () => {
      const power = getGPUPowerEstimate('Unknown GPU specification');
      
      // Should return reasonable default
      expect(power).toBeGreaterThan(0);
      expect(power).toBeLessThan(600); // Reasonable upper bound
    });
  });
});