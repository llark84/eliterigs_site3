import {
  Ruler,
  Thermometer,
  Fan,
  Cpu,
  Monitor,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Link } from 'wouter';

import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SFFTerraGuide() {
  const clearanceSpecs = [
    {
      component: 'GPU Length',
      maximum: '335mm',
      notes: 'Remove some drive cages for longer cards',
      compatible: true,
      icon: Monitor,
    },
    {
      component: 'GPU Height',
      maximum: '131mm (2.5 slot)',
      notes: 'Thick cards may conflict with PSU cables',
      compatible: true,
      icon: Monitor,
    },
    {
      component: 'CPU Cooler',
      maximum: '165mm',
      notes: 'Low-profile or AIO recommended',
      compatible: false,
      icon: Fan,
    },
    {
      component: 'PSU Length',
      maximum: '165mm (SFX/SFX-L)',
      notes: 'ATX PSUs do not fit',
      compatible: true,
      icon: Zap,
    },
    {
      component: 'Front Radiator',
      maximum: '240mm AIO',
      notes: "280mm won't fit due to width",
      compatible: true,
      icon: Thermometer,
    },
  ];

  const recommendedBuild = [
    { component: 'CPU', suggestion: 'AMD Ryzen 7 7700X', reason: 'High performance, efficient' },
    { component: 'GPU', suggestion: 'RTX 4070 Super', reason: 'Perfect performance/size balance' },
    {
      component: 'Cooler',
      suggestion: 'Arctic Liquid Freezer II 240',
      reason: 'Excellent cooling in tight space',
    },
    { component: 'PSU', suggestion: 'Corsair SF750', reason: 'SFX-L, fully modular, quiet' },
    { component: 'RAM', suggestion: '32GB DDR5-5600', reason: 'Fast, low-profile' },
    { component: 'Storage', suggestion: '2TB NVMe SSD', reason: 'No SATA cable clutter' },
  ];

  return (
    <>
      <SEOHead
        title="SFF Build in a Fractal Terra: What Fits and What Doesn't | Complete Guide"
        description="Complete Fractal Design Terra case guide with GPU clearance, cooling options, and PSU compatibility. Includes optimized build recommendations for this premium SFF case."
        canonical="/guides/sff-build-fractal-terra"
        pageType="guide"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: "SFF Build in a Fractal Terra: What Fits and What Doesn't",
          description:
            'Comprehensive guide to building in the Fractal Design Terra small form factor case',
          author: {
            '@type': 'Organization',
            name: 'EliteRigs',
          },
          datePublished: '2025-09-10',
          dateModified: '2025-09-22',
        }}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-600 border-purple-500/20"
            >
              <Package className="w-3 h-3 mr-1" />
              Small Form Factor
            </Badge>
          </div>
          <h1 className="text-4xl font-bold">SFF Build in a Fractal Terra</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            What fits and what doesn't in Fractal's premium cube case. Complete compatibility guide
            with real measurements.
          </p>
        </div>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-purple-500/5 to-purple-600/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="w-6 h-6 text-purple-600" />
              Terra Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <h3 className="font-semibold">Dimensions</h3>
                <p className="text-sm text-muted-foreground">340×340×215mm</p>
              </div>
              <div>
                <h3 className="font-semibold">Volume</h3>
                <p className="text-sm text-muted-foreground">25 Liters</p>
              </div>
              <div>
                <h3 className="font-semibold">Motherboard</h3>
                <p className="text-sm text-muted-foreground">Mini-ITX only</p>
              </div>
              <div>
                <h3 className="font-semibold">Price Range</h3>
                <p className="text-sm text-muted-foreground">$180-220</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/presets/terra-4080s">
                <Button size="lg" data-testid="button-terra-preset">
                  <Package className="w-4 h-4 mr-2" />
                  See Our Optimized Terra Build
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Clearance Table */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Component Clearances</h2>
          <div className="grid gap-4">
            {clearanceSpecs.map((spec, index) => {
              const IconComponent = spec.icon;
              return (
                <Card key={index} className="hover-elevate transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{spec.component}</h3>
                          <p className="text-sm text-muted-foreground">{spec.notes}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{spec.maximum}</p>
                        {spec.compatible ? (
                          <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* What Fits / What Doesn't */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="w-5 h-5" />✅ What Fits Perfectly
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>RTX 4070 Super (285mm) - ideal performance/size</li>
                <li>240mm AIO radiators in front mount</li>
                <li>SFX and SFX-L power supplies</li>
                <li>Low-profile RAM (under 45mm)</li>
                <li>Multiple 2.5" SSDs</li>
                <li>Standard mini-ITX motherboards</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-5 h-5" />❌ What Doesn't Fit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>RTX 4090 (336mm) - too long by 1mm</li>
                <li>280mm radiators - case too narrow</li>
                <li>ATX power supplies - only SFX/SFX-L</li>
                <li>Tower coolers over 165mm</li>
                <li>3.5" hard drives (2.5" only)</li>
                <li>Tall RAM with RGB shrouds</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Optimized Build */}
        <Card>
          <CardHeader>
            <CardTitle>Our Optimized Terra Build</CardTitle>
            <p className="text-muted-foreground">
              Perfect balance of performance and compatibility
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {recommendedBuild.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0"
                >
                  <div>
                    <h3 className="font-semibold">{item.component}</h3>
                    <p className="text-sm text-purple-600">{item.suggestion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Total System Power</h3>
                  <p className="text-sm text-muted-foreground">Optimized for SFX PSU limits</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">~420W</p>
                  <p className="text-xs">650W PSU recommended</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Build Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Terra Build Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Cable Management</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Use fully modular SFX PSU</li>
                  <li>• Custom short cables recommended</li>
                  <li>• Route GPU power behind motherboard</li>
                  <li>• Avoid SATA drives for cleaner build</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Cooling Strategy</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 240mm AIO for CPU (front mount)</li>
                  <li>• Undervolt GPU for better thermals</li>
                  <li>• Two 120mm exhaust fans recommended</li>
                  <li>• Monitor temperatures during first boot</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assembly Order */}
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Ruler className="w-5 h-5" />
              Recommended Assembly Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Install motherboard standoffs and I/O shield</li>
              <li>Install CPU, RAM, and M.2 SSD on motherboard (outside case)</li>
              <li>Mount AIO radiator in front of case first</li>
              <li>Install PSU and custom cables</li>
              <li>Install motherboard with AIO pump pre-attached</li>
              <li>Install GPU last (may need to remove drive cage)</li>
              <li>Connect all cables and test boot before closing</li>
            </ol>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready for Your Terra Build?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Skip the guesswork with our pre-configured Terra build, or customize it to your
                needs with automatic compatibility checking.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/presets/terra-4080s">
                  <Button variant="default" data-testid="button-terra-build">
                    <Package className="w-4 h-4 mr-2" />
                    Terra RTX 4080S Build
                  </Button>
                </Link>
                <Link href="/builder?case=fractal-terra&form-factor=mini-itx">
                  <Button variant="outline" data-testid="button-custom-terra">
                    Customize Terra Build
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
