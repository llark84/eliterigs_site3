import { PCComponent, BuildPreset } from '@shared/schema';
import { HelpCircle, Lightbulb, Link2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface RationaleTooltipProps {
  item: PCComponent | BuildPreset;
  type: 'component' | 'preset';
  children?: React.ReactNode;
  className?: string;
}

export default function RationaleTooltip({
  item,
  type,
  children,
  className,
}: RationaleTooltipProps) {
  const getComponentRationale = (component: PCComponent) => {
    const category = component.category.toLowerCase();

    const rationales = {
      cpu: {
        why: 'Central processing unit handles all computing tasks. More cores = better multitasking, higher clock speed = faster single-threaded performance.',
        pairWith: [
          'High-performance RAM (3200MHz+)',
          'Compatible motherboard chipset',
          'Adequate CPU cooler',
          'Sufficient PSU wattage',
        ],
      },
      gpu: {
        why: 'Graphics card renders all visuals. VRAM handles texture quality, core count affects frame rates, newer architectures improve efficiency.',
        pairWith: [
          "CPU that won't bottleneck",
          'PSU with enough wattage + PCIe connectors',
          'Case with adequate clearance',
          'High refresh rate monitor',
        ],
      },
      ram: {
        why: 'System memory stores active data. 16GB minimum for gaming, 32GB for content creation. Speed affects performance in CPU-heavy tasks.',
        pairWith: [
          'CPU/motherboard supporting the speed',
          'Dual-channel configuration',
          'Leave room for future upgrades',
        ],
      },
      motherboard: {
        why: 'Connects all components together. Chipset determines features, socket must match CPU, expansion slots for upgrades.',
        pairWith: [
          'Compatible CPU socket',
          'RAM with supported speeds',
          'PSU with required connectors',
          'Case matching form factor',
        ],
      },
      ssd: {
        why: 'Storage device for OS and games. SSDs are much faster than HDDs. NVMe is faster than SATA. Consider capacity needs.',
        pairWith: [
          'Motherboard with M.2 slots for NVMe',
          'Additional storage for large files',
          'Regular backups',
        ],
      },
      hdd: {
        why: 'Mass storage for files and games. Slower than SSD but more cost-effective for large capacity. Good for secondary storage.',
        pairWith: [
          'Primary SSD for OS',
          'SATA cables and power connectors',
          'Consider noise levels',
        ],
      },
      psu: {
        why: 'Powers all components safely. 80+ rating for efficiency, modular cables reduce clutter. Never cheap out on PSU quality.',
        pairWith: [
          'Wattage 20-30% above total system draw',
          'Required PCIe connectors for GPU',
          'Case with adequate PSU clearance',
        ],
      },
      case: {
        why: 'Houses and protects components. Size determines compatibility, airflow affects temperatures, build quality impacts durability.',
        pairWith: [
          'Motherboard form factor',
          'GPU clearance',
          'CPU cooler height',
          'PSU size',
          'Adequate fans for airflow',
        ],
      },
      cooler: {
        why: 'Keeps CPU at safe temperatures. Stock coolers adequate for basic use, aftermarket needed for overclocking or quiet operation.',
        pairWith: [
          'CPU socket compatibility',
          'Case height clearance',
          'RAM clearance',
          'Thermal paste application',
        ],
      },
      fan: {
        why: 'Provides airflow for cooling. Intake fans bring cool air, exhaust fans remove heat. Balance is key for optimal temperatures.',
        pairWith: [
          'Case fan mounting points',
          'Fan controller or motherboard headers',
          'Positive/negative pressure balance',
        ],
      },
    };

    return (
      rationales[category as keyof typeof rationales] || {
        why: 'This component is essential for a complete PC build.',
        pairWith: ['Compatible components', 'Adequate power supply', 'Proper cooling'],
      }
    );
  };

  const getPresetRationale = (preset: BuildPreset) => {
    const tier = preset.tier.toLowerCase();

    const rationales = {
      entry: {
        why: 'Budget-friendly build for basic gaming and productivity. Focuses on essential components with good price-to-performance ratio.',
        pairWith: [
          '1080p gaming monitor',
          'Basic peripherals',
          'Entry-level games and applications',
        ],
      },
      'mid-range': {
        why: 'Balanced build for 1440p gaming and content creation. Offers strong performance across most modern games and applications.',
        pairWith: [
          '1440p high refresh monitor',
          'Quality peripherals',
          'AAA games at high settings',
        ],
      },
      'high-end': {
        why: 'Premium build for 4K gaming and professional work. High-end components ensure smooth performance in demanding scenarios.',
        pairWith: [
          '4K monitor or ultrawide',
          'Premium peripherals',
          'Professional software and latest games',
        ],
      },
      enthusiast: {
        why: 'Top-tier build for maximum performance. Cutting-edge components for enthusiasts who want the absolute best.',
        pairWith: [
          'High-end monitors',
          'Professional peripherals',
          'Demanding workloads and future-proofing',
        ],
      },
    };

    return (
      rationales[tier as keyof typeof rationales] || {
        why: 'This preset offers a curated selection of compatible components.',
        pairWith: ['Compatible monitor', 'Quality peripherals', 'Appropriate use cases'],
      }
    );
  };

  const rationale =
    type === 'component'
      ? getComponentRationale(item as PCComponent)
      : getPresetRationale(item as BuildPreset);

  const itemName = type === 'component' ? (item as PCComponent).name : (item as BuildPreset).name;

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className={`w-6 h-6 p-0 text-muted-foreground hover:text-foreground ${className}`}
            data-testid={`button-rationale-${type}-${item.id}`}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-chart-1" />
            <h4 className="font-semibold text-sm">Why recommended</h4>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{rationale.why}</p>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-chart-2" />
              <h4 className="font-semibold text-sm">What to pair this with</h4>
            </div>

            <div className="space-y-1">
              {rationale.pairWith.map((item, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs mr-1 mb-1"
                  data-testid={`badge-pairing-${index}`}
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
