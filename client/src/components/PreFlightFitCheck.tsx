import { PCComponent } from '@shared/schema';
import { CheckCircle2, AlertTriangle, XCircle, Ruler } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PreFlightFitCheckProps {
  selectedComponents: { [category: string]: PCComponent };
}

interface FitCheck {
  type: 'gpu-case' | 'cooler-case' | 'psu-case';
  title: string;
  description: string;
  status: 'fits' | 'tight' | 'no-fit' | 'unknown';
  details?: string;
}

// Parsing functions extracted from compatibility logic
const parseSpecs = {
  gpu: (spec: string) => {
    const lengthMatch = spec.match(/(\d+)mm/i);
    const thicknessMatch = spec.match(/(\d+\.?\d*)[\s-]?slot/i);
    return {
      length: lengthMatch ? parseInt(lengthMatch[1]) : 320, // Default length
      thickness: thicknessMatch ? parseFloat(thicknessMatch[1]) : 2.5, // Default 2.5 slots
    };
  },

  case: (spec: string) => {
    const gpuLengthMatch = spec.match(/(\d+)mm GPU/i);
    const coolerHeightMatch = spec.match(/(\d+)mm CPU/i);
    const sffMatch = spec.toLowerCase().includes('sff');
    const maxGPUThicknessMatch = spec.match(/(\d+)[\s-]?slot/i);
    const sfxOnlyMatch = spec.toLowerCase().includes('sfx only');
    const maxPSULengthMatch = spec.match(/(\d+)mm PSU/i);

    return {
      maxGPULength: gpuLengthMatch ? parseInt(gpuLengthMatch[1]) : sffMatch ? 330 : 400,
      maxCoolerHeight: coolerHeightMatch ? parseInt(coolerHeightMatch[1]) : sffMatch ? 70 : 160,
      maxGPUThickness: maxGPUThicknessMatch ? parseInt(maxGPUThicknessMatch[1]) : null,
      sfxOnly: sfxOnlyMatch,
      maxPSULength: maxPSULengthMatch ? parseInt(maxPSULengthMatch[1]) : null,
    };
  },

  cooler: (spec: string) => {
    const heightMatch = spec.match(/(\d+)mm/i);
    const isAIOMatch = spec.toLowerCase().includes('aio') || spec.toLowerCase().includes('liquid');
    const radiatorSizeMatch = spec.match(/(\d+)mm radiator/i);

    return {
      height: heightMatch ? parseInt(heightMatch[1]) : isAIOMatch ? 27 : 155, // Default heights
      isAIO: isAIOMatch,
      radiatorSize: radiatorSizeMatch ? parseInt(radiatorSizeMatch[1]) : null,
    };
  },

  psu: (spec: string) => {
    const formFactorMatch = spec.match(/(ATX|SFX|SFX-L|TFX)/i);
    const lengthMatch = spec.match(/(\d+)mm/i);

    return {
      formFactor: formFactorMatch?.[1] || 'ATX',
      length: lengthMatch ? parseInt(lengthMatch[1]) : null,
    };
  },
};

export default function PreFlightFitCheck({ selectedComponents }: PreFlightFitCheckProps) {
  const generateFitChecks = (): FitCheck[] => {
    const checks: FitCheck[] = [];

    const gpu = selectedComponents['GPU'];
    const case_ = selectedComponents['Case'];
    const cooler = selectedComponents['CPU Cooler'] || selectedComponents['Cooler'];
    const psu = selectedComponents['PSU'];

    // GPU vs Case fit check
    if (gpu && case_) {
      const gpuSpecs = parseSpecs.gpu(gpu.spec || '');
      const caseSpecs = parseSpecs.case(case_.spec || '');

      const gpuLength = gpuSpecs.length;
      const maxGPULength = caseSpecs.maxGPULength;
      const clearance = maxGPULength - gpuLength;

      let status: 'fits' | 'tight' | 'no-fit';
      let details: string;

      if (clearance < 0) {
        status = 'no-fit';
        details = `GPU is ${Math.abs(clearance)}mm too long`;
      } else if (clearance <= 10) {
        status = 'tight';
        details = `Only ${clearance}mm clearance`;
      } else {
        status = 'fits';
        details = `${clearance}mm clearance`;
      }

      checks.push({
        type: 'gpu-case',
        title: 'GPU Length',
        description: `${gpuLength}mm GPU in case (max ${maxGPULength}mm)`,
        status,
        details,
      });
    }

    // CPU Cooler vs Case fit check
    if (cooler && case_) {
      const coolerSpecs = parseSpecs.cooler(cooler.spec || '');
      const caseSpecs = parseSpecs.case(case_.spec || '');

      if (!coolerSpecs.isAIO) {
        const coolerHeight = coolerSpecs.height;
        const maxCoolerHeight = caseSpecs.maxCoolerHeight;
        const clearance = maxCoolerHeight - coolerHeight;

        let status: 'fits' | 'tight' | 'no-fit';
        let details: string;

        if (clearance < 0) {
          status = 'no-fit';
          details = `Cooler is ${Math.abs(clearance)}mm too tall`;
        } else if (clearance <= 5) {
          status = 'tight';
          details = `Only ${clearance}mm clearance`;
        } else {
          status = 'fits';
          details = `${clearance}mm clearance`;
        }

        checks.push({
          type: 'cooler-case',
          title: 'CPU Cooler Height',
          description: `${coolerHeight}mm cooler in case (max ${maxCoolerHeight}mm)`,
          status,
          details,
        });
      } else {
        // AIO radiator fit check
        checks.push({
          type: 'cooler-case',
          title: 'AIO Radiator',
          description: 'Liquid cooler requires radiator mounting space',
          status: 'unknown',
          details: 'Check case radiator support manually',
        });
      }
    }

    // PSU Form Factor vs Case fit check
    if (psu && case_) {
      const psuSpecs = parseSpecs.psu(psu.spec || '');
      const caseSpecs = parseSpecs.case(case_.spec || '');

      const psuFormFactor = psuSpecs.formFactor;
      const sfxOnly = caseSpecs.sfxOnly;

      let status: 'fits' | 'tight' | 'no-fit';
      let details: string;

      if (sfxOnly && psuFormFactor === 'ATX') {
        status = 'no-fit';
        details = 'Case requires SFX PSU';
      } else if (psuFormFactor === 'SFX' && !sfxOnly) {
        status = 'fits';
        details = 'SFX PSU fits in ATX case';
      } else {
        status = 'fits';
        details = `${psuFormFactor} PSU matches case`;
      }

      checks.push({
        type: 'psu-case',
        title: 'PSU Form Factor',
        description: `${psuFormFactor} PSU compatibility`,
        status,
        details,
      });
    }

    return checks;
  };

  const fitChecks = generateFitChecks();

  if (fitChecks.length === 0) {
    return null; // Don't show if no relevant components selected
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fits':
        return <CheckCircle2 className="w-4 h-4 text-chart-2" />;
      case 'tight':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'no-fit':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fits':
        return (
          <Badge variant="outline" className="text-chart-2 border-chart-2/30">
            ✅ Fits
          </Badge>
        );
      case 'tight':
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            ⚠️ Tight Fit
          </Badge>
        );
      case 'no-fit':
        return <Badge variant="destructive">❌ Won't Fit</Badge>;
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            ? Unknown
          </Badge>
        );
    }
  };

  return (
    <Card data-testid="card-preflight-fit-check">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Ruler className="w-4 h-4" />
          Pre-Flight Fit Check
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {fitChecks.map((check, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-md bg-muted/30"
            data-testid={`fit-check-${check.type}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getStatusIcon(check.status)}</div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-sm" data-testid={`text-fit-title-${check.type}`}>
                  {check.title}
                </h4>
                {getStatusBadge(check.status)}
              </div>

              <p
                className="text-xs text-muted-foreground"
                data-testid={`text-fit-description-${check.type}`}
              >
                {check.description}
              </p>

              {check.details && (
                <p className="text-xs font-medium" data-testid={`text-fit-details-${check.type}`}>
                  {check.details}
                </p>
              )}
            </div>
          </div>
        ))}

        {fitChecks.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Add components to see fit compatibility
          </div>
        )}
      </CardContent>
    </Card>
  );
}
