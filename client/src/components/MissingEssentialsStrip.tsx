import { PCComponent } from '@shared/schema';
import { X, AlertTriangle, ExternalLink, Wifi, Monitor, HardDrive, Zap } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MissingEssential {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
}

interface MissingEssentialsStripProps {
  selectedComponents: { [category: string]: PCComponent };
}

export default function MissingEssentialsStrip({
  selectedComponents,
}: MissingEssentialsStripProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const detectMissingEssentials = (): MissingEssential[] => {
    const missing: MissingEssential[] = [];
    const components = Object.values(selectedComponents);

    // Check for Wi-Fi capability
    const hasWifi =
      components.some(
        (comp) =>
          comp.category.toLowerCase() === 'motherboard' &&
          (comp.name.toLowerCase().includes('wifi') || comp.spec?.toLowerCase().includes('wifi'))
      ) ||
      components.some(
        (comp) =>
          comp.category.toLowerCase().includes('wifi') ||
          comp.name.toLowerCase().includes('wifi card')
      );

    if (!hasWifi) {
      missing.push({
        id: 'wifi',
        title: 'Wi-Fi Adapter',
        description: 'Connect to the internet wirelessly - essential for most setups.',
        icon: Wifi,
        link: 'https://www.amazon.com/s?k=wifi+adapter+pci',
      });
    }

    // Always suggest Windows license (since we can't detect if they already have one)
    missing.push({
      id: 'windows',
      title: 'Windows License',
      description: 'Operating system to run your PC - required to use your computer.',
      icon: HardDrive,
      link: 'https://www.microsoft.com/en-us/store/b/windows',
    });

    // Check for display cable
    const hasGPU = components.some((comp) => comp.category.toLowerCase() === 'gpu');
    missing.push({
      id: 'display-cable',
      title: hasGPU ? 'HDMI/DisplayPort Cable' : 'Display Cable',
      description: 'Connect your monitor to your graphics card or motherboard.',
      icon: Monitor,
      link: 'https://www.amazon.com/s?k=hdmi+cable+displayport',
    });

    // Check for thermal paste (if CPU cooler doesn't come with it)
    const hasCPUCooler = components.some(
      (comp) =>
        comp.category.toLowerCase().includes('cooler') ||
        comp.category.toLowerCase().includes('cooling')
    );

    // Most stock coolers come with thermal paste, but aftermarket ones might not
    if (hasCPUCooler) {
      const cooler = components.find(
        (comp) =>
          comp.category.toLowerCase().includes('cooler') ||
          comp.category.toLowerCase().includes('cooling')
      );

      // Check if it's likely an aftermarket cooler that might need thermal paste
      if (
        cooler &&
        !cooler.name.toLowerCase().includes('stock') &&
        !cooler.spec?.toLowerCase().includes('thermal paste included')
      ) {
        missing.push({
          id: 'thermal-paste',
          title: 'Thermal Paste',
          description: 'Essential for CPU cooling - check if your cooler includes it.',
          icon: Zap,
          link: 'https://www.amazon.com/s?k=thermal+paste+cpu',
        });
      }
    }

    return missing;
  };

  const missingItems = detectMissingEssentials();

  if (isDismissed || missingItems.length === 0) {
    return null;
  }

  return (
    <Card
      className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30"
      data-testid="missing-essentials-strip"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                Don't forget these essentials
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1.5 border border-amber-300 dark:border-amber-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      data-testid={`chip-${item.id}`}
                    >
                      <IconComponent className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                          - {item.description}
                        </span>
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`link-${item.id}`}
                      >
                        <ExternalLink className="w-3 h-3 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="h-6 w-6 p-0 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex-shrink-0"
            data-testid="button-dismiss-essentials"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
