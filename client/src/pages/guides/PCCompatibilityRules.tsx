import {
  AlertTriangle,
  CheckCircle,
  Cpu,
  Monitor,
  Zap,
  HardDrive,
  Wrench,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'wouter';

import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PCCompatibilityRules() {
  const compatibilityRules = [
    {
      id: 1,
      title: 'CPU Socket Must Match Motherboard',
      severity: 'critical',
      description:
        'AMD CPUs need AM4/AM5 motherboards. Intel CPUs need LGA 1700/1200 motherboards.',
      example: 'Ryzen 7000 series requires AM5 socket, not AM4',
      icon: Cpu,
    },
    {
      id: 2,
      title: 'RAM Speed Compatibility',
      severity: 'critical',
      description:
        "Check your CPU's memory controller limits. Motherboard QVL lists tested speeds.",
      example: 'DDR5-6000 might not work on all Ryzen 7000 CPUs without manual tuning',
      icon: Zap,
    },
    {
      id: 3,
      title: 'GPU Physical Clearance',
      severity: 'critical',
      description: 'Measure GPU length vs case clearance. Check for RAM/cable interference.',
      example: "RTX 4090 is 336mm long - won't fit in compact cases under 340mm",
      icon: Monitor,
    },
    {
      id: 4,
      title: 'PSU Wattage Requirements',
      severity: 'high',
      description: 'Calculate total system power + 20% headroom. Check PCIe power connectors.',
      example: 'RTX 4080 needs 750W+ PSU with 3x 8-pin or 2x 12VHPWR connectors',
      icon: Zap,
    },
    {
      id: 5,
      title: 'CPU Cooler Height vs Case',
      severity: 'high',
      description: 'Tower coolers must fit under case side panel. Check mm clearance specs.',
      example: 'Noctua NH-D15 is 165mm tall - needs 170mm+ case clearance',
      icon: Shield,
    },
    {
      id: 6,
      title: 'M.2 Slot Interference',
      severity: 'medium',
      description: 'M.2 SSDs can block PCIe slots or interfere with large GPUs/coolers.',
      example: 'Some M.2 slots disable SATA ports when used - check manual',
      icon: HardDrive,
    },
    {
      id: 7,
      title: 'Front Panel Connector Compatibility',
      severity: 'medium',
      description: 'USB-C front panels need motherboard USB 3.2 Gen2 headers.',
      example: "Case USB-C won't work without compatible motherboard header",
      icon: Wrench,
    },
    {
      id: 8,
      title: 'BIOS Version for New CPUs',
      severity: 'medium',
      description: 'Older motherboards may need BIOS updates for newest CPU generations.',
      example: 'B450 boards need BIOS update for Ryzen 5000 series support',
      icon: AlertTriangle,
    },
    {
      id: 9,
      title: 'RAM Capacity vs Motherboard',
      severity: 'low',
      description: 'Check maximum supported RAM capacity and configuration (2 vs 4 DIMMs).',
      example: 'Some boards support 128GB max, others only 64GB',
      icon: Zap,
    },
    {
      id: 10,
      title: 'PCIe Lane Distribution',
      severity: 'low',
      description: "Adding cards can reduce GPU from PCIe x16 to x8. Usually doesn't matter.",
      example: 'Adding M.2 SSD might reduce GPU to x8 speed on some boards',
      icon: HardDrive,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <SEOHead
        title="PC Compatibility: The Only 10 Rules That Actually Matter | EliteRigs"
        description="Master PC building compatibility with these 10 essential rules. Avoid costly mistakes with CPU sockets, RAM speeds, GPU clearance, and PSU requirements. Includes compatibility checker tool."
        canonical="/guides/pc-compatibility-10-rules"
        pageType="guide"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: 'PC Compatibility: The Only 10 Rules That Actually Matter',
          description:
            'Essential PC building compatibility rules to avoid common mistakes and component conflicts',
          author: {
            '@type': 'Organization',
            name: 'EliteRigs',
          },
          datePublished: '2025-09-15',
          dateModified: '2025-09-22',
        }}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Critical Knowledge
            </Badge>
          </div>
          <h1 className="text-4xl font-bold">
            PC Compatibility: The Only 10 Rules That Actually Matter
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Skip the fluff. These are the compatibility rules that will save you from expensive
            mistakes and DOA builds.
          </p>
        </div>

        {/* Quick Action */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Need to Check Your Build?</h3>
              <p className="text-muted-foreground">
                Our compatibility checker automatically validates these rules for your specific
                components.
              </p>
              <Link href="/builder?step=compatibility">
                <Button size="lg" data-testid="button-compatibility-checker">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check Build Compatibility
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* The 10 Rules */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">The 10 Compatibility Rules</h2>

          {compatibilityRules.map((rule) => {
            const IconComponent = rule.icon;
            return (
              <Card key={rule.id} className="hover-elevate transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          #{rule.id}: {rule.title}
                        </CardTitle>
                        <Badge variant={getSeverityColor(rule.severity)} className="mt-1">
                          {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)} Impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{rule.description}</p>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                      Example: {rule.example}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Common Mistakes */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Compatibility Mistakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-red-600">❌ What NOT to Do</h3>
                <ul className="space-y-2 text-sm">
                  <li>Assuming all DDR4 is compatible with all DDR4 motherboards</li>
                  <li>Buying a GPU without checking case clearance</li>
                  <li>Pairing high-end GPU with inadequate PSU</li>
                  <li>Ignoring CPU cooler height limits</li>
                  <li>Mixing RAM kits from different manufacturers</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-green-600">✅ Best Practices</h3>
                <ul className="space-y-2 text-sm">
                  <li>Check motherboard QVL for RAM compatibility</li>
                  <li>Measure case dimensions before GPU selection</li>
                  <li>Use PSU calculators with 20% headroom</li>
                  <li>Verify BIOS support for new CPU generations</li>
                  <li>Buy RAM as matched kits, not individual sticks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Troubleshooting */}
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-5 h-5" />
              Build Won't Boot? Quick Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Check all power connections (24-pin, CPU 8-pin, GPU power)</li>
              <li>Reseat RAM - try one stick in slot 2 first</li>
              <li>Clear CMOS if overclocked RAM won't boot</li>
              <li>Check CPU socket for bent pins (Intel) or damaged contacts (AMD)</li>
              <li>Verify all standoffs are installed correctly</li>
              <li>Test with minimal hardware first (CPU, 1 RAM stick, GPU)</li>
            </ol>
          </CardContent>
        </Card>

        {/* Tools and Next Steps */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Never Guess Compatibility Again</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Use our PC builder to automatically check these rules against your specific
                components. Get warnings before you buy, not after.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/builder?guided=true">
                  <Button variant="default" data-testid="button-guided-builder">
                    <Wrench className="w-4 h-4 mr-2" />
                    Guided PC Builder
                  </Button>
                </Link>
                <Link href="/guides/best-1200-gaming-pc-september-2025">
                  <Button variant="outline" data-testid="button-example-build">
                    See Example Build
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
