import { PCComponent, BuildCompatibility, CompatibilityCheck } from "@shared/schema";

export interface BuildComponents {
  [category: string]: PCComponent;
}

// Technical specification parsers
const parseSpecs = {
  cpu: (spec: string) => {
    const socketMatch = spec.match(/(AM5|AM4|LGA1700|LGA1200)/i);
    const tdpMatch = spec.match(/(\d+)W/i);
    const coresMatch = spec.match(/(\d+)c\/(\d+)t/i);
    const x3dMatch = spec.toLowerCase().includes('x3d');
    
    return {
      socket: socketMatch?.[1]?.toUpperCase(),
      tdp: tdpMatch ? parseInt(tdpMatch[1]) : null,
      cores: coresMatch ? parseInt(coresMatch[1]) : null,
      threads: coresMatch ? parseInt(coresMatch[2]) : null,
      isX3D: x3dMatch
    };
  },

  gpu: (spec: string) => {
    const vramMatch = spec.match(/(\d+)GB/i);
    const lengthMatch = spec.match(/(\d+)mm/i);
    const powerMatch = spec.match(/(\d+)W/i);
    const thicknessMatch = spec.match(/(\d+\.?\d*)[\s-]?slot/i);
    const connector12vhpwrMatch = spec.toLowerCase().includes('12vhpwr') || spec.toLowerCase().includes('12v-2x6');
    const pcie4Match = spec.match(/PCIe\s*4\.\d+/i);
    const pcie5Match = spec.match(/PCIe\s*5\.\d+/i);
    
    return {
      vram: vramMatch ? parseInt(vramMatch[1]) : null,
      length: lengthMatch ? parseInt(lengthMatch[1]) : 320, // Default length
      power: powerMatch ? parseInt(powerMatch[1]) : 250, // Default power draw
      estimatedPower: getGPUPowerEstimate(spec),
      thickness: thicknessMatch ? parseFloat(thicknessMatch[1]) : 2.5, // Default 2.5 slots
      uses12VHPWR: connector12vhpwrMatch,
      pcieGen: pcie5Match ? 5 : (pcie4Match ? 4 : 3)
    };
  },

  motherboard: (spec: string) => {
    const socketMatch = spec.match(/(AM5|AM4|LGA1700|LGA1200)/i);
    const formFactorMatch = spec.match(/(ATX|Mini-ITX|Micro-ATX|E-ATX)/i);
    const chipsetMatch = spec.match(/(B650|X670|B550|X570|Z790|B760)/i);
    const vrmMatch = spec.match(/(\d+)\+(\d+)/); // VRM phases
    const pcie4Match = spec.match(/PCIe\s*4\.\d+/i);
    const pcie5Match = spec.match(/PCIe\s*5\.\d+/i);
    
    return {
      socket: socketMatch?.[1]?.toUpperCase(),
      formFactor: formFactorMatch?.[1],
      chipset: chipsetMatch?.[1],
      vrmPhases: vrmMatch ? parseInt(vrmMatch[1]) + parseInt(vrmMatch[2]) : null,
      vrmClass: getVRMClass(spec, chipsetMatch?.[1]),
      pcieGen: pcie5Match ? 5 : (pcie4Match ? 4 : 3)
    };
  },

  ram: (spec: string) => {
    const typeMatch = spec.match(/(DDR4|DDR5)/i);
    const speedMatch = spec.match(/(\d+)/);
    const capacityMatch = spec.match(/(\d+)GB/i);
    const heightMatch = spec.match(/(\d+)mm/i);
    
    return {
      type: typeMatch?.[1]?.toUpperCase(),
      speed: speedMatch ? parseInt(speedMatch[1]) : null,
      capacity: capacityMatch ? parseInt(capacityMatch[1]) : null,
      height: heightMatch ? parseInt(heightMatch[1]) : 32 // Default 32mm for standard RAM
    };
  },

  psu: (spec: string) => {
    const wattageMatch = spec.match(/(\d+)W/i);
    const efficiencyMatch = spec.match(/(80\+ (?:Bronze|Silver|Gold|Platinum|Titanium))/i);
    const formFactorMatch = spec.match(/(ATX|SFX|SFX-L|TFX)/i);
    const lengthMatch = spec.match(/(\d+)mm/i);
    
    return {
      wattage: wattageMatch ? parseInt(wattageMatch[1]) : null,
      efficiency: efficiencyMatch?.[1],
      formFactor: formFactorMatch?.[1] || 'ATX',
      length: lengthMatch ? parseInt(lengthMatch[1]) : null
    };
  },

  cooler: (spec: string) => {
    const heightMatch = spec.match(/(\d+)mm/i);
    const tdpMatch = spec.match(/(\d+)W/i);
    const socketMatch = spec.match(/(AM5|AM4|LGA1700|LGA1200)/i);
    const typeMatch = spec.match(/(AIO|Air|Low-profile)/i);
    const clearanceMatch = spec.match(/(\d+)mm RAM/i);
    const topDownMatch = spec.toLowerCase().includes('top-down') || spec.toLowerCase().includes('down-draft');
    
    return {
      height: heightMatch ? parseInt(heightMatch[1]) : null,
      tdpRating: tdpMatch ? parseInt(tdpMatch[1]) : null,
      supportedSockets: socketMatch?.[1]?.toUpperCase(),
      type: typeMatch?.[1]?.toLowerCase(),
      ramClearance: clearanceMatch ? parseInt(clearanceMatch[1]) : null,
      isTopDown: topDownMatch
    };
  },

  case: (spec: string) => {
    const formFactorMatch = spec.match(/(ATX|Mini-ITX|Micro-ATX|E-ATX)/i);
    const gpuLengthMatch = spec.match(/(\d+)mm GPU/i);
    const coolerHeightMatch = spec.match(/(\d+)mm CPU/i);
    const sffMatch = spec.toLowerCase().includes('sff');
    const maxGPUThicknessMatch = spec.match(/(\d+)[\s-]?slot/i);
    const sandwichMatch = spec.toLowerCase().includes('sandwich');
    const sfxOnlyMatch = spec.toLowerCase().includes('sfx only');
    const maxPSULengthMatch = spec.match(/(\d+)mm PSU/i);
    const riserMatch = spec.match(/PCIe\s*(\d+\.\d+)/i);
    const radiatorMatch = spec.match(/(\d+)mm radiator/i);
    
    return {
      formFactor: formFactorMatch?.[1],
      maxGPULength: gpuLengthMatch ? parseInt(gpuLengthMatch[1]) : (sffMatch ? 330 : 400),
      maxCoolerHeight: coolerHeightMatch ? parseInt(coolerHeightMatch[1]) : (sffMatch ? 70 : 160),
      isSFF: sffMatch,
      maxGPUThickness: maxGPUThicknessMatch ? parseInt(maxGPUThicknessMatch[1]) : null,
      isSandwich: sandwichMatch,
      sfxOnly: sfxOnlyMatch,
      maxPSULength: maxPSULengthMatch ? parseInt(maxPSULengthMatch[1]) : null,
      riserGen: riserMatch ? parseFloat(riserMatch[1]) : null,
      maxRadiatorSize: radiatorMatch ? parseInt(radiatorMatch[1]) : null
    };
  }
};

function getGPUPowerEstimate(spec: string): number {
  const name = spec.toLowerCase();
  if (name.includes('4090')) return 450;
  if (name.includes('4080')) return 320;
  if (name.includes('4070')) return 200;
  if (name.includes('7900xt')) return 315;
  if (name.includes('7800xt')) return 263;
  return 250; // Default estimate
}

function getVRMClass(spec: string, chipset?: string): 'entry' | 'mid' | 'high' | 'premium' {
  if (!chipset) return 'mid';
  
  const chipsetLower = chipset.toLowerCase();
  const specLower = spec.toLowerCase();
  
  if (chipsetLower.includes('x670') || chipsetLower.includes('z790')) {
    if (specLower.includes('hero') || specLower.includes('formula') || specLower.includes('extreme')) return 'premium';
    if (specLower.includes('plus') || specLower.includes('pro')) return 'high';
    return 'high';
  }
  
  if (chipsetLower.includes('b650') || chipsetLower.includes('b760')) {
    if (specLower.includes('plus') || specLower.includes('pro')) return 'mid';
    return 'entry';
  }
  
  return 'mid';
}

export function scoreBuild(build: BuildComponents): BuildCompatibility {
  const hardFails: CompatibilityCheck[] = [];
  const softWarns: CompatibilityCheck[] = [];
  const rulesVersion = "1.1.0";

  // Parse component specifications
  const cpu = build.CPU ? parseSpecs.cpu(build.CPU.spec || '') : null;
  const gpu = build.GPU ? parseSpecs.gpu(build.GPU.spec || '') : null;
  const motherboard = build.Motherboard ? parseSpecs.motherboard(build.Motherboard.spec || '') : null;
  const ram = build.RAM ? parseSpecs.ram(build.RAM.spec || '') : null;
  const psu = build.PSU ? parseSpecs.psu(build.PSU.spec || '') : null;
  const cooler = build.Cooler ? parseSpecs.cooler(build.Cooler.spec || '') : null;
  const pcCase = build.Case ? parseSpecs.case(build.Case.spec || '') : null;

  // HARD COMPATIBILITY CHECKS
  
  // 1. CPU ↔ Socket compatibility
  if (cpu && motherboard) {
    if (cpu.socket && motherboard.socket && cpu.socket !== motherboard.socket) {
      hardFails.push({
        type: 'hard',
        category: 'Socket',
        issue: 'CPU socket mismatch',
        details: `CPU requires ${cpu.socket} but motherboard has ${motherboard.socket}`,
        id: 'CORE-001',
        partIds: [build.CPU?.id, build.Motherboard?.id].filter(Boolean) as string[],
        source: build.CPU?.specUrl ? { url: build.CPU.specUrl } : { note: "Component specification" }
      });
    }
  }

  // 2. RAM type compatibility
  if (ram && motherboard) {
    const expectedRAMType = motherboard.socket === 'AM5' || motherboard.socket === 'LGA1700' ? 'DDR5' : 'DDR4';
    if (ram.type && ram.type !== expectedRAMType) {
      hardFails.push({
        type: 'hard',
        category: 'Memory',
        issue: 'RAM type incompatible',
        details: `Platform expects ${expectedRAMType} but selected ${ram.type}`,
        id: 'CORE-002',
        partIds: [build.RAM?.id, build.Motherboard?.id].filter(Boolean) as string[],
        source: build.Motherboard?.specUrl ? { url: build.Motherboard.specUrl } : { note: "Platform specification" }
      });
    }
  }

  // 3. Form factor compatibility
  if (motherboard && pcCase) {
    if (motherboard.formFactor && pcCase.formFactor) {
      const compatible = checkFormFactorCompatibility(motherboard.formFactor, pcCase.formFactor);
      if (!compatible) {
        hardFails.push({
          type: 'hard',
          category: 'Form Factor',
          issue: 'Motherboard won\'t fit in case',
          details: `${motherboard.formFactor} motherboard incompatible with ${pcCase.formFactor} case`,
          id: 'CORE-003',
          partIds: [build.Motherboard?.id, build.Case?.id].filter(Boolean) as string[],
          source: build.Case?.specUrl ? { url: build.Case.specUrl } : { note: "Form factor specification" }
        });
      }
    }
  }

  // 4. PSU wattage check (GPU peak + CPU TDP + 30% headroom)
  if (psu && cpu && gpu) {
    const cpuTDP = cpu.tdp || 105; // Default TDP
    const gpuPower = gpu.estimatedPower;
    const requiredWattage = Math.ceil((cpuTDP + gpuPower) * 1.3); // 30% headroom
    
    if (psu.wattage && psu.wattage < requiredWattage) {
      hardFails.push({
        type: 'hard',
        category: 'Power',
        issue: 'Insufficient PSU wattage',
        details: `Need ~${requiredWattage}W but PSU only provides ${psu.wattage}W`,
        id: 'CORE-004',
        partIds: [build.PSU?.id, build.CPU?.id, build.GPU?.id].filter(Boolean) as string[],
        source: build.PSU?.specUrl ? { url: build.PSU.specUrl } : { note: "Power calculation" }
      });
    }
  }

  // 5. Cooler clearance
  if (cooler && pcCase) {
    if (cooler.height && pcCase.maxCoolerHeight && cooler.height > pcCase.maxCoolerHeight) {
      hardFails.push({
        type: 'hard',
        category: 'Clearance',
        issue: 'Cooler too tall for case',
        details: `Cooler is ${cooler.height}mm but case supports max ${pcCase.maxCoolerHeight}mm`,
        id: 'CORE-005',
        partIds: [build.Cooler?.id, build.Case?.id].filter(Boolean) as string[],
        source: build.Case?.specUrl ? { url: build.Case.specUrl } : { note: "Case clearance specification" }
      });
    }
  }

  // 6. GPU length clearance
  if (gpu && pcCase) {
    if (gpu.length && pcCase.maxGPULength && gpu.length > pcCase.maxGPULength) {
      hardFails.push({
        type: 'hard',
        category: 'Clearance',
        issue: 'GPU too long for case',
        details: `GPU is ${gpu.length}mm but case supports max ${pcCase.maxGPULength}mm`,
        id: 'CORE-006',
        partIds: [build.GPU?.id, build.Case?.id].filter(Boolean) as string[],
        source: build.Case?.specUrl ? { url: build.Case.specUrl } : { note: "Case clearance specification" }
      });
    }
  }

  // 7. Cooler socket compatibility
  if (cooler && cpu) {
    if (cooler.supportedSockets && cpu.socket && cooler.supportedSockets !== cpu.socket) {
      hardFails.push({
        type: 'hard',
        category: 'Socket',
        issue: 'Cooler socket mismatch',
        details: `Cooler supports ${cooler.supportedSockets} but CPU is ${cpu.socket}`,
        id: 'CORE-007',
        partIds: [build.Cooler?.id, build.CPU?.id].filter(Boolean) as string[],
        source: build.Cooler?.specUrl ? { url: build.Cooler.specUrl } : { note: "Cooler compatibility specification" }
      });
    }
  }

  // SOFT COMPATIBILITY WARNINGS

  // 1. VRM class vs CPU TDP/X3D
  if (motherboard && cpu) {
    if (cpu.isX3D && motherboard.vrmClass === 'entry') {
      softWarns.push({
        type: 'soft',
        category: 'VRM',
        issue: 'Weak VRM for X3D CPU',
        details: 'Entry-level VRM may limit X3D CPU performance under sustained loads',
        id: 'CORE-008',
        partIds: [build.CPU?.id, build.Motherboard?.id].filter(Boolean) as string[],
        source: build.Motherboard?.specUrl ? { url: build.Motherboard.specUrl } : { note: "VRM analysis" }
      });
    }
    
    if (cpu.tdp && cpu.tdp > 105 && motherboard.vrmClass === 'entry') {
      softWarns.push({
        type: 'soft',
        category: 'VRM',
        issue: 'VRM may limit high-TDP CPU',
        details: `${cpu.tdp}W CPU with entry-level VRM may throttle under load`,
        id: 'CORE-009',
        partIds: [build.CPU?.id, build.Motherboard?.id].filter(Boolean) as string[],
        source: build.Motherboard?.specUrl ? { url: build.Motherboard.specUrl } : { note: "VRM analysis" }
      });
    }
  }

  // 2. Cooler TDP rating
  if (cooler && cpu) {
    if (cooler.tdpRating && cpu.tdp && cooler.tdpRating < cpu.tdp) {
      softWarns.push({
        type: 'soft',
        category: 'Cooling',
        issue: 'Cooler may be inadequate',
        details: `Cooler rated for ${cooler.tdpRating}W but CPU is ${cpu.tdp}W`,
        id: 'CORE-010',
        partIds: [build.Cooler?.id, build.CPU?.id].filter(Boolean) as string[],
        source: build.Cooler?.specUrl ? { url: build.Cooler.specUrl } : { note: "TDP rating comparison" }
      });
    }
  }

  // 3. RAM clearance with large coolers
  if (cooler && ram && cooler.type === 'air') {
    if (cooler.height && cooler.height > 120) { // Large air coolers
      softWarns.push({
        type: 'soft',
        category: 'Clearance',
        issue: 'Potential RAM clearance issue',
        details: 'Large air cooler may interfere with tall RAM modules',
        id: 'CORE-011',
        partIds: [build.Cooler?.id, build.RAM?.id].filter(Boolean) as string[],
        source: { note: "Large cooler heuristic" }
      });
    }
  }

  // 4. PCIe lanes (simplified check)
  if (gpu && build.SSD) {
    const ssdCount = Object.keys(build).filter(key => key.includes('SSD') || key.includes('NVMe')).length;
    if (ssdCount > 2) {
      softWarns.push({
        type: 'soft',
        category: 'PCIe',
        issue: 'Potential PCIe lane limitation',
        details: 'Multiple NVMe drives may reduce GPU to x8 PCIe',
        id: 'CORE-012',
        partIds: [build.GPU?.id, build.SSD?.id].filter(Boolean) as string[],
        source: { note: "PCIe lane allocation heuristic" }
      });
    }
  }

  // SFF-SPECIFIC COMPATIBILITY CHECKS
  
  // SFF-001: GPU thickness vs case slot support
  if (gpu && pcCase && pcCase.isSFF) {
    if (pcCase.maxGPUThickness && gpu.thickness > pcCase.maxGPUThickness) {
      hardFails.push({
        type: 'hard',
        category: 'SFF Clearance',
        issue: 'GPU too thick for case',
        details: `GPU is ${gpu.thickness}-slot but case supports max ${pcCase.maxGPUThickness} slots`,
        id: 'SFF-001',
        partIds: [build.GPU?.id, build.Case?.id].filter(Boolean) as string[],
        source: build.Case?.specUrl ? { url: build.Case.specUrl } : { note: "Case specification" }
      });
    } else if (!pcCase.maxGPUThickness && pcCase.maxGPUThickness === 3 && gpu.thickness > 3) {
      // Heuristic: if case only mentions "3 slots" but GPU > ~62mm (3.2 slots)
      const estimatedThickness = gpu.thickness > 3.1 ? gpu.thickness * 20.6 : 62; // Estimate mm
      if (estimatedThickness > 62) {
        softWarns.push({
          type: 'soft',
          category: 'SFF Clearance',
          issue: 'GPU thickness may exceed case clearance',
          details: `GPU appears to be ${gpu.thickness}-slot (~${Math.round(estimatedThickness)}mm), verify case clearance`,
          id: 'SFF-001',
          partIds: [build.GPU?.id, build.Case?.id].filter(Boolean) as string[],
          source: { note: "Heuristic safety margin" }
        });
      }
    }
  }

  // SFF-002: 12VHPWR side-clearance
  if (gpu && pcCase && gpu.uses12VHPWR && pcCase.isSFF) {
    if (pcCase.isSandwich) {
      softWarns.push({
        type: 'soft',
        category: 'SFF Power',
        issue: '12VHPWR connector clearance concern',
        details: 'GPU uses 12VHPWR connector in sandwich layout - verify side panel clearance (≥35mm recommended)',
        id: 'SFF-002',
        partIds: [build.GPU?.id, build.Case?.id].filter(Boolean) as string[],
        source: build.Case?.specUrl ? { url: build.Case.specUrl } : { note: "Heuristic safety margin" }
      });
    }
  }

  // SFF-003: PSU size compatibility  
  if (psu && pcCase && pcCase.sfxOnly) {
    if (psu.formFactor === 'SFX-L') {
      hardFails.push({
        type: 'hard',
        category: 'SFF PSU',
        issue: 'PSU too long for case',
        details: 'Case supports SFX only but PSU is SFX-L format',
        id: 'SFF-003',
        partIds: [build.PSU?.id, build.Case?.id].filter(Boolean) as string[],
        source: build.Case?.specUrl ? { url: build.Case.specUrl } : { note: "Case specification" }
      });
    } else if (psu.length && pcCase.maxPSULength && psu.length > pcCase.maxPSULength) {
      hardFails.push({
        type: 'hard',
        category: 'SFF PSU', 
        issue: 'PSU too long for case',
        details: `PSU is ${psu.length}mm but case supports max ${pcCase.maxPSULength}mm`,
        id: 'SFF-003',
        partIds: [build.PSU?.id, build.Case?.id].filter(Boolean) as string[],
        source: build.Case?.specUrl ? { url: build.Case.specUrl } : { note: "Case specification" }
      });
    }
  }

  // SFF-004: Top-down cooler vs RAM height
  if (cooler && ram && cooler.isTopDown) {
    const maxRamHeight = cooler.ramClearance || 42; // Default 42mm if not specified
    if (ram.height > maxRamHeight) {
      softWarns.push({
        type: 'soft',
        category: 'SFF Cooling',
        issue: 'RAM height may interfere with cooler',
        details: `Top-down cooler with ${ram.height}mm RAM (clearance: ${maxRamHeight}mm) - verify compatibility`,
        id: 'SFF-004',
        partIds: [build.Cooler?.id, build.RAM?.id].filter(Boolean) as string[],
        source: build.Cooler?.specUrl ? { url: build.Cooler.specUrl } : { note: "Heuristic safety margin" }
      });
    }
  }

  // SFF-005: PCIe riser generation compatibility
  if (gpu && motherboard && pcCase && pcCase.riserGen) {
    const minGenRequired = Math.max(gpu.pcieGen, motherboard.pcieGen);
    if (pcCase.riserGen < 4.0 && minGenRequired >= 4) {
      softWarns.push({
        type: 'soft',
        category: 'SFF PCIe',
        issue: 'PCIe riser generation mismatch',
        details: `Case riser is PCIe ${pcCase.riserGen} but GPU/MB support Gen${minGenRequired} - bandwidth/stability risk`,
        id: 'SFF-005', 
        partIds: [build.GPU?.id, build.Motherboard?.id, build.Case?.id].filter(Boolean) as string[],
        source: build.Case?.specUrl ? { url: build.Case.specUrl } : { note: "Heuristic safety margin" }
      });
    }
  }

  // SFF-006: Radiator/GPU interference
  if (gpu && pcCase && cooler && cooler.type === 'aio') {
    if (pcCase.maxRadiatorSize === 240 && gpu.length > 280) { // Common front mount interference threshold
      const hasExplicitSpec = build.Case?.spec?.toLowerCase().includes('front radiator') || 
                             build.Case?.spec?.toLowerCase().includes('240mm');
      
      if (hasExplicitSpec) {
        hardFails.push({
          type: 'hard',
          category: 'SFF Layout',
          issue: 'GPU interferes with radiator mounting',
          details: `${gpu.length}mm GPU conflicts with 240mm front radiator mounting per case specification`,
          id: 'SFF-006',
          partIds: [build.GPU?.id, build.Cooler?.id, build.Case?.id].filter(Boolean) as string[],
          source: build.Case?.specUrl ? { url: build.Case.specUrl } : { note: "Case specification" }
        });
      } else {
        softWarns.push({
          type: 'soft',
          category: 'SFF Layout',
          issue: 'Potential GPU/radiator interference',
          details: `${gpu.length}mm GPU with 240mm radiator - check manual for clearance`,
          id: 'SFF-006',
          partIds: [build.GPU?.id, build.Cooler?.id, build.Case?.id].filter(Boolean) as string[],
          source: { note: "Check manual" }
        });
      }
    }
  }

  // Calculate compatibility score
  let score = 100;
  score -= hardFails.length * 25; // Hard fails are major
  score -= softWarns.length * 10; // Soft warns are moderate
  score = Math.max(0, Math.min(100, score)); // Clamp to 0-100

  return {
    hardFails,
    softWarns,
    score,
    rulesVersion
  };
}

function checkFormFactorCompatibility(motherboardFF: string, caseFF: string): boolean {
  const compatibilityMatrix: { [key: string]: string[] } = {
    'Mini-ITX': ['Mini-ITX', 'Micro-ATX', 'ATX', 'E-ATX'],
    'Micro-ATX': ['Micro-ATX', 'ATX', 'E-ATX'],
    'ATX': ['ATX', 'E-ATX'],
    'E-ATX': ['E-ATX']
  };
  
  return compatibilityMatrix[motherboardFF]?.includes(caseFF) || false;
}