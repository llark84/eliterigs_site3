// Simple client-side integrity checking for PC builds
// Uses basic heuristics and component specs for validation

export interface IntegrityResult {
  passes: IntegrityCheck[];
  warnings: IntegrityCheck[];
  fails: IntegrityCheck[];
  score: number; // 0-100
}

export interface IntegrityCheck {
  rule: string;
  message: string;
  category: 'compatibility' | 'power' | 'clearance';
  component?: string;
}

export interface PCComponent {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  spec?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

export type BuildComponents = { [category: string]: PCComponent };

// Extract socket from CPU/Motherboard specs
function extractSocket(spec: string): string | null {
  if (!spec) return null;

  // Common socket patterns
  const socketPatterns = [
    /AM5/i,
    /AM4/i,
    /LGA\s*1700/i,
    /LGA\s*1200/i,
    /LGA\s*1151/i,
    /TR4/i,
    /TRX40/i,
    /TRX50/i,
  ];

  for (const pattern of socketPatterns) {
    const match = spec.match(pattern);
    if (match) return match[0].toUpperCase().replace(/\s+/g, '');
  }

  return null;
}

// Extract TDP/TBP from component specs (in watts)
function extractPowerConsumption(spec: string, category: string): number | null {
  if (!spec) return null;

  // Look for power patterns: "125W", "TDP: 125W", "TBP 320W", etc.
  const powerPatterns = [
    /(?:TDP|TBP|Power):\s*(\d+)\s*W/i,
    /(\d+)\s*W\s*(?:TDP|TBP)/i,
    /(\d+)\s*W/g, // Generic wattage pattern
  ];

  for (const pattern of powerPatterns) {
    const matches = Array.from(spec.matchAll(pattern));
    if (matches.length > 0) {
      // Take the highest wattage found (for components with multiple power states)
      const powers = matches.map((match) => parseInt(match[1], 10)).filter((p) => !isNaN(p));
      if (powers.length > 0) {
        return Math.max(...powers);
      }
    }
  }

  // Fallback estimates based on component category and tier
  if (category === 'CPU') {
    if (spec.includes('i9') || spec.includes('Ryzen 9')) return 125;
    if (spec.includes('i7') || spec.includes('Ryzen 7')) return 105;
    if (spec.includes('i5') || spec.includes('Ryzen 5')) return 95;
    return 65; // Conservative default
  }

  if (category === 'GPU') {
    if (spec.includes('4090')) return 450;
    if (spec.includes('4080')) return 320;
    if (spec.includes('4070')) return 200;
    if (spec.includes('4060')) return 115;
    if (spec.includes('7800 XT')) return 263;
    if (spec.includes('7700 XT')) return 245;
    return 150; // Conservative default
  }

  return null;
}

// Extract PSU wattage
function extractPSUWattage(spec: string): number | null {
  if (!spec) return null;

  // Look for wattage: "650W", "750 Watts", etc.
  const wattagePattern = /(\d+)\s*W(?:att)?/i;
  const match = spec.match(wattagePattern);

  if (match) {
    return parseInt(match[1], 10);
  }

  return null;
}

// Extract GPU length from specs (in mm)
function extractGPULength(spec: string): number | null {
  if (!spec) return null;

  // Look for length: "312mm", "31.2cm", "Length: 315mm"
  const lengthPatterns = [
    /(?:Length|Size):\s*(\d+(?:\.\d+)?)\s*mm/i,
    /(\d+(?:\.\d+)?)\s*mm\s*(?:long|length)/i,
    /(\d+(?:\.\d+)?)\s*cm/i, // Convert cm to mm
    /(\d{3})\s*mm/g, // Generic 3-digit mm measurement
  ];

  for (const pattern of lengthPatterns) {
    const match = spec.match(pattern);
    if (match) {
      let length = parseFloat(match[1]);
      // Convert cm to mm if pattern matches cm
      if (pattern.source.includes('cm')) {
        length = length * 10;
      }
      return length;
    }
  }

  return null;
}

// Extract case GPU clearance (in mm)
function extractCaseGPUClearance(spec: string): number | null {
  if (!spec) return null;

  // Look for GPU clearance: "GPU: 330mm", "Max GPU Length: 315mm"
  const clearancePatterns = [
    /(?:Max\s*)?GPU(?:\s*(?:Length|Clearance|Support))?\s*:?\s*(\d+)\s*mm/i,
    /Graphics\s*Card\s*:?\s*(\d+)\s*mm/i,
    /VGA\s*:?\s*(\d+)\s*mm/i,
  ];

  for (const pattern of clearancePatterns) {
    const match = spec.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return null;
}

export function simpleChecks(components: BuildComponents): IntegrityResult {
  const passes: IntegrityCheck[] = [];
  const warnings: IntegrityCheck[] = [];
  const fails: IntegrityCheck[] = [];

  const cpu = components['CPU'];
  const motherboard = components['Motherboard'];
  const gpu = components['GPU'];
  const psu = components['PSU'];
  const pcCase = components['Case'];

  // Rule 1: CPU socket must equal motherboard socket
  if (cpu && motherboard) {
    const cpuSocket = extractSocket(cpu.spec || '');
    const motherboardSocket = extractSocket(motherboard.spec || '');

    if (cpuSocket && motherboardSocket) {
      if (cpuSocket === motherboardSocket) {
        passes.push({
          rule: 'Socket Compatibility',
          message: `CPU and motherboard both use ${cpuSocket} socket`,
          category: 'compatibility',
          component: 'CPU/Motherboard',
        });
      } else {
        fails.push({
          rule: 'Socket Compatibility',
          message: `Socket mismatch: CPU uses ${cpuSocket} but motherboard uses ${motherboardSocket}`,
          category: 'compatibility',
          component: 'CPU/Motherboard',
        });
      }
    } else {
      warnings.push({
        rule: 'Socket Compatibility',
        message: 'Could not determine socket compatibility from component specs',
        category: 'compatibility',
        component: 'CPU/Motherboard',
      });
    }
  }

  // Rule 2: PSU wattage ≥ CPU TDP + GPU TBP + 30% headroom
  if (cpu && gpu && psu) {
    const cpuTDP = extractPowerConsumption(cpu.spec || '', 'CPU');
    const gpuTBP = extractPowerConsumption(gpu.spec || '', 'GPU');
    const psuWattage = extractPSUWattage(psu.spec || '');

    if (cpuTDP && gpuTBP && psuWattage) {
      const totalComponentPower = cpuTDP + gpuTBP;
      const recommendedPSU = Math.ceil(totalComponentPower * 1.3); // 30% headroom
      const warningThreshold = Math.ceil(totalComponentPower * 1.1); // 10% headroom

      if (psuWattage >= recommendedPSU) {
        passes.push({
          rule: 'Power Supply Capacity',
          message: `PSU (${psuWattage}W) provides adequate power for CPU (${cpuTDP}W) + GPU (${gpuTBP}W) with good headroom`,
          category: 'power',
          component: 'PSU',
        });
      } else if (psuWattage >= warningThreshold) {
        warnings.push({
          rule: 'Power Supply Capacity',
          message: `PSU (${psuWattage}W) may be tight for CPU (${cpuTDP}W) + GPU (${gpuTBP}W). Recommended: ${recommendedPSU}W+`,
          category: 'power',
          component: 'PSU',
        });
      } else {
        fails.push({
          rule: 'Power Supply Capacity',
          message: `PSU (${psuWattage}W) insufficient for CPU (${cpuTDP}W) + GPU (${gpuTBP}W). Minimum: ${warningThreshold}W`,
          category: 'power',
          component: 'PSU',
        });
      }
    } else {
      warnings.push({
        rule: 'Power Supply Capacity',
        message: 'Could not determine power requirements from component specs',
        category: 'power',
        component: 'PSU',
      });
    }
  }

  // Rule 3: GPU length ≤ case max-GPU-length
  if (gpu && pcCase) {
    const gpuLength = extractGPULength(gpu.spec || '');
    const caseClearance = extractCaseGPUClearance(pcCase.spec || '');

    if (gpuLength && caseClearance) {
      if (gpuLength <= caseClearance) {
        passes.push({
          rule: 'GPU Clearance',
          message: `GPU (${gpuLength}mm) fits in case with ${caseClearance}mm clearance`,
          category: 'clearance',
          component: 'GPU/Case',
        });
      } else {
        fails.push({
          rule: 'GPU Clearance',
          message: `GPU (${gpuLength}mm) exceeds case clearance (${caseClearance}mm)`,
          category: 'clearance',
          component: 'GPU/Case',
        });
      }
    } else {
      warnings.push({
        rule: 'GPU Clearance',
        message: 'Could not determine GPU clearance from component specs',
        category: 'clearance',
        component: 'GPU/Case',
      });
    }
  }

  // Calculate score (0-100)
  const totalChecks = passes.length + warnings.length + fails.length;
  let score = 0;

  if (totalChecks > 0) {
    const passScore = (passes.length / totalChecks) * 100;
    const warningScore = (warnings.length / totalChecks) * 50; // Warnings count as half
    score = Math.round(passScore + warningScore);
  } else {
    score = 50; // Neutral score if no checks could be performed
  }

  return {
    passes,
    warnings,
    fails,
    score,
  };
}
