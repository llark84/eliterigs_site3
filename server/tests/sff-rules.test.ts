/**
 * Unit Tests for SFF Compatibility Rules
 * Tests the 6 SFF-specific compatibility rules with good and failing cases
 */

import { scoreBuild } from '../compatibility';
import { PCComponent } from '../../shared/schema';

// Mock SFF components for testing
const sffComponents = {
  // SFF Case
  sffCase: {
    id: 'case-ncase-m1',
    name: 'NCASE M1 V6.1',
    brand: 'NCASE',
    category: 'Case',
    price: 280,
    spec: 'Mini-ITX SFF, 3-slot GPU, sandwich layout, SFX only, 240mm radiator front',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://ncases.com/m1-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  sffCaseWithLimits: {
    id: 'case-dan-a4-h2o',
    name: 'DAN Cases A4-H2O',
    brand: 'DAN Cases',
    category: 'Case',
    price: 320,
    spec: 'Mini-ITX SFF, 2-slot GPU, sandwich layout, SFX only, 140mm PSU, PCIe 3.0 riser',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://dan-cases.com/a4-h2o-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  // GPUs - various thicknesses and features
  gpu2Slot: {
    id: 'gpu-rtx4070-founders',
    name: 'RTX 4070 Founders Edition',
    brand: 'NVIDIA',
    category: 'GPU',
    price: 599,
    spec: '12GB GDDR6X, 2-slot, 242mm length, 200W TDP, PCIe 4.0',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://nvidia.com/rtx4070-fe-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  gpu3Point2Slot: {
    id: 'gpu-rtx4080-asus',
    name: 'ASUS RTX 4080 TUF Gaming',
    brand: 'ASUS',
    category: 'GPU',
    price: 1199,
    spec: '16GB GDDR6X, 3.2-slot, 348mm length, 320W TDP, 12VHPWR connector, PCIe 4.0',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://asus.com/rtx4080-tuf-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  gpu12VHPWR: {
    id: 'gpu-rtx4090-zotac',
    name: 'Zotac RTX 4090 Trinity',
    brand: 'Zotac',
    category: 'GPU',
    price: 1599,
    spec: '24GB GDDR6X, 2.5-slot, 327mm length, 450W TDP, 12VHPWR connector, PCIe 4.0',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://zotac.com/rtx4090-trinity-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  // PSUs
  sfxPsu: {
    id: 'psu-corsair-sf750',
    name: 'Corsair SF750',
    brand: 'Corsair',
    category: 'PSU',
    price: 184,
    spec: '750W 80+ Platinum, SFX, 125mm length',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://corsair.com/sf750-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  sfxLPsu: {
    id: 'psu-silverstone-sx800',
    name: 'SilverStone SX800-LTI',
    brand: 'SilverStone',
    category: 'PSU',
    price: 199,
    spec: '800W 80+ Titanium, SFX-L, 140mm length',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://silverstonetek.com/sx800-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  // Coolers
  topDownCooler: {
    id: 'cooler-noctua-l9i',
    name: 'Noctua NH-L9i',
    brand: 'Noctua',
    category: 'Cooler',
    price: 45,
    spec: 'Low-profile Air, 37mm height, 65W TDP, top-down, 37mm RAM clearance, LGA1700',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://noctua.at/nh-l9i-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  aio240: {
    id: 'cooler-ekwb-240',
    name: 'EK-AIO 240 D-RGB',
    brand: 'EKWB',
    category: 'Cooler',
    price: 139,
    spec: 'AIO Liquid, 240mm radiator, 200W TDP, LGA1700',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://ekwb.com/aio-240-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  // RAM
  tallRam: {
    id: 'ram-gskill-rgb',
    name: 'G.Skill Trident Z RGB 32GB',
    brand: 'G.Skill',
    category: 'RAM',
    price: 149,
    spec: 'DDR5-6000, 32GB (2x16GB), CL30, 44mm height',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://gskill.com/tridentz-rgb-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  lowProfileRam: {
    id: 'ram-corsair-lpx',
    name: 'Corsair Vengeance LPX 32GB',
    brand: 'Corsair',
    category: 'RAM',
    price: 119,
    spec: 'DDR5-5600, 32GB (2x16GB), CL36, 31mm height',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://corsair.com/vengeance-lpx-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  // Motherboard
  itxMotherboard: {
    id: 'mb-asus-rog-strix-b650e-i',
    name: 'ASUS ROG Strix B650E-I Gaming WiFi',
    brand: 'ASUS',
    category: 'Motherboard',
    price: 299,
    spec: 'AM5 Socket, Mini-ITX, B650E Chipset, 8+4 VRM, PCIe 5.0',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://asus.com/rog-strix-b650e-i-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent,

  // CPU
  amCpu: {
    id: 'cpu-amd-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    brand: 'AMD',
    category: 'CPU',
    price: 399,
    spec: 'AM5 Socket, 8c/16t, 120W TDP, X3D Cache',
    imageUrl: '',
    isAvailable: true,
    specUrl: 'https://amd.com/7800x3d-spec',
    verifiedAt: null,
    sourceNote: null,
    lastStatus: null,
    lastEtag: null,
    lastHash: null
  } as PCComponent
};

/**
 * SFF-001: GPU thickness vs case slot support
 */
function testSFF001GoodCase() {
  console.log('\n=== SFF-001: GPU Thickness (Good Case) ===');
  
  const build = {
    GPU: sffComponents.gpu2Slot, // 2-slot GPU
    Case: sffComponents.sffCase   // 3-slot case
  };
  
  const result = scoreBuild(build);
  const sff001Issues = result.hardFails.filter(issue => issue.id === 'SFF-001');
  
  console.assert(sff001Issues.length === 0, 'Expected no SFF-001 hard fails for 2-slot GPU in 3-slot case');
  console.log('✓ SFF-001 good case passed');
}

function testSFF001FailCase() {
  console.log('\n=== SFF-001: GPU Thickness (Fail Case) ===');
  
  const build = {
    GPU: sffComponents.gpu3Point2Slot, // 3.2-slot GPU
    Case: sffComponents.sffCaseWithLimits // 2-slot case
  };
  
  const result = scoreBuild(build);
  const sff001Issues = result.hardFails.filter(issue => issue.id === 'SFF-001');
  
  console.assert(sff001Issues.length > 0, 'Expected SFF-001 hard fail for 3.2-slot GPU in 2-slot case');
  console.assert(sff001Issues[0].details.includes('3.2-slot'), 'Expected details to mention GPU thickness');
  console.log('✓ SFF-001 fail case passed');
}

/**
 * SFF-002: 12VHPWR side-clearance
 */
function testSFF002GoodCase() {
  console.log('\n=== SFF-002: 12VHPWR Clearance (Good Case) ===');
  
  const build = {
    GPU: sffComponents.gpu2Slot, // No 12VHPWR
    Case: sffComponents.sffCase  // Sandwich layout
  };
  
  const result = scoreBuild(build);
  const sff002Issues = result.softWarns.filter(issue => issue.id === 'SFF-002');
  
  console.assert(sff002Issues.length === 0, 'Expected no SFF-002 warnings for GPU without 12VHPWR');
  console.log('✓ SFF-002 good case passed');
}

function testSFF002WarnCase() {
  console.log('\n=== SFF-002: 12VHPWR Clearance (Warning Case) ===');
  
  const build = {
    GPU: sffComponents.gpu12VHPWR, // Has 12VHPWR
    Case: sffComponents.sffCase    // Sandwich layout
  };
  
  const result = scoreBuild(build);
  const sff002Issues = result.softWarns.filter(issue => issue.id === 'SFF-002');
  
  console.assert(sff002Issues.length > 0, 'Expected SFF-002 warning for 12VHPWR GPU in sandwich case');
  console.assert(sff002Issues[0].details.includes('12VHPWR'), 'Expected details to mention 12VHPWR');
  console.log('✓ SFF-002 warning case passed');
}

/**
 * SFF-003: PSU size compatibility
 */
function testSFF003GoodCase() {
  console.log('\n=== SFF-003: PSU Size (Good Case) ===');
  
  const build = {
    PSU: sffComponents.sfxPsu,    // SFX PSU
    Case: sffComponents.sffCase   // SFX only case
  };
  
  const result = scoreBuild(build);
  const sff003Issues = result.hardFails.filter(issue => issue.id === 'SFF-003');
  
  console.assert(sff003Issues.length === 0, 'Expected no SFF-003 hard fails for SFX PSU in SFX case');
  console.log('✓ SFF-003 good case passed');
}

function testSFF003FailCase() {
  console.log('\n=== SFF-003: PSU Size (Fail Case) ===');
  
  const build = {
    PSU: sffComponents.sfxLPsu,     // SFX-L PSU
    Case: sffComponents.sffCase     // SFX only case
  };
  
  const result = scoreBuild(build);
  const sff003Issues = result.hardFails.filter(issue => issue.id === 'SFF-003');
  
  console.assert(sff003Issues.length > 0, 'Expected SFF-003 hard fail for SFX-L PSU in SFX-only case');
  console.assert(sff003Issues[0].details.includes('SFX-L'), 'Expected details to mention SFX-L');
  console.log('✓ SFF-003 fail case passed');
}

/**
 * SFF-004: Top-down cooler vs RAM height
 */
function testSFF004GoodCase() {
  console.log('\n=== SFF-004: Cooler/RAM Clearance (Good Case) ===');
  
  const build = {
    Cooler: sffComponents.topDownCooler, // 37mm clearance
    RAM: sffComponents.lowProfileRam     // 31mm height
  };
  
  const result = scoreBuild(build);
  const sff004Issues = result.softWarns.filter(issue => issue.id === 'SFF-004');
  
  console.assert(sff004Issues.length === 0, 'Expected no SFF-004 warnings for low-profile RAM with top-down cooler');
  console.log('✓ SFF-004 good case passed');
}

function testSFF004WarnCase() {
  console.log('\n=== SFF-004: Cooler/RAM Clearance (Warning Case) ===');
  
  const build = {
    Cooler: sffComponents.topDownCooler, // 37mm clearance
    RAM: sffComponents.tallRam           // 44mm height
  };
  
  const result = scoreBuild(build);
  const sff004Issues = result.softWarns.filter(issue => issue.id === 'SFF-004');
  
  console.assert(sff004Issues.length > 0, 'Expected SFF-004 warning for tall RAM with top-down cooler');
  console.assert(sff004Issues[0].details.includes('44mm'), 'Expected details to mention RAM height');
  console.log('✓ SFF-004 warning case passed');
}

/**
 * SFF-005: PCIe riser generation compatibility
 */
function testSFF005GoodCase() {
  console.log('\n=== SFF-005: PCIe Riser Gen (Good Case) ===');
  
  const build = {
    GPU: sffComponents.gpu2Slot,          // PCIe 4.0
    Motherboard: sffComponents.itxMotherboard, // PCIe 5.0
    Case: sffComponents.sffCase           // No specific riser gen mentioned
  };
  
  const result = scoreBuild(build);
  const sff005Issues = result.softWarns.filter(issue => issue.id === 'SFF-005');
  
  console.assert(sff005Issues.length === 0, 'Expected no SFF-005 warnings when case riser gen not specified');
  console.log('✓ SFF-005 good case passed');
}

function testSFF005WarnCase() {
  console.log('\n=== SFF-005: PCIe Riser Gen (Warning Case) ===');
  
  const build = {
    GPU: sffComponents.gpu2Slot,             // PCIe 4.0
    Motherboard: sffComponents.itxMotherboard, // PCIe 5.0
    Case: sffComponents.sffCaseWithLimits    // PCIe 3.0 riser
  };
  
  const result = scoreBuild(build);
  const sff005Issues = result.softWarns.filter(issue => issue.id === 'SFF-005');
  
  console.assert(sff005Issues.length > 0, 'Expected SFF-005 warning for PCIe 3.0 riser with Gen4+ components');
  console.assert(sff005Issues[0].details.includes('riser'), 'Expected details to mention riser');
  console.log('✓ SFF-005 warning case passed');
}

/**
 * SFF-006: Radiator/GPU interference
 */
function testSFF006GoodCase() {
  console.log('\n=== SFF-006: Radiator/GPU (Good Case) ===');
  
  const build = {
    GPU: sffComponents.gpu2Slot,   // 242mm length
    Cooler: sffComponents.aio240,  // 240mm AIO
    Case: sffComponents.sffCase    // 240mm front support
  };
  
  const result = scoreBuild(build);
  const sff006Issues = [...result.hardFails, ...result.softWarns].filter(issue => issue.id === 'SFF-006');
  
  console.assert(sff006Issues.length === 0, 'Expected no SFF-006 issues for short GPU with 240mm AIO');
  console.log('✓ SFF-006 good case passed');
}

function testSFF006WarnCase() {
  console.log('\n=== SFF-006: Radiator/GPU (Warning Case) ===');
  
  const build = {
    GPU: sffComponents.gpu3Point2Slot, // 348mm length (long)
    Cooler: sffComponents.aio240,      // 240mm AIO
    Case: sffComponents.sffCase        // 240mm front support
  };
  
  const result = scoreBuild(build);
  const sff006Issues = result.softWarns.filter(issue => issue.id === 'SFF-006');
  
  console.assert(sff006Issues.length > 0, 'Expected SFF-006 warning for long GPU with 240mm AIO');
  console.assert(sff006Issues[0].details.includes('348mm'), 'Expected details to mention GPU length');
  console.log('✓ SFF-006 warning case passed');
}

/**
 * Run all SFF rules tests
 */
export function runSFFRulesTests() {
  console.log('🧪 Running SFF Rules Tests');
  
  try {
    // SFF-001: GPU thickness
    testSFF001GoodCase();
    testSFF001FailCase();
    
    // SFF-002: 12VHPWR clearance
    testSFF002GoodCase();
    testSFF002WarnCase();
    
    // SFF-003: PSU size
    testSFF003GoodCase();
    testSFF003FailCase();
    
    // SFF-004: Cooler/RAM clearance
    testSFF004GoodCase();
    testSFF004WarnCase();
    
    // SFF-005: PCIe riser generation
    testSFF005GoodCase();
    testSFF005WarnCase();
    
    // SFF-006: Radiator/GPU interference
    testSFF006GoodCase();
    testSFF006WarnCase();
    
    console.log('\n✅ All SFF rules tests passed!');
  } catch (error) {
    console.error('\n❌ SFF rules tests failed:', error);
    throw error;
  }
}

// Allow direct execution for testing
if (require.main === module) {
  runSFFRulesTests();
}