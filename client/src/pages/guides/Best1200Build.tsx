import {
  Monitor,
  Cpu,
  HardDrive,
  Zap,
  Gamepad2,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'wouter';

import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Best1200Build() {
  const buildComponents = [
    { name: 'AMD Ryzen 5 7600X', category: 'CPU', price: 229, icon: Cpu },
    { name: 'NVIDIA RTX 4060 Ti 16GB', category: 'GPU', price: 449, icon: Monitor },
    { name: '32GB DDR5-5600', category: 'RAM', price: 189, icon: Zap },
    { name: '1TB NVMe SSD', category: 'Storage', price: 79, icon: HardDrive },
    { name: 'B650 Motherboard', category: 'Motherboard', price: 139, icon: CheckCircle },
    { name: '650W 80+ Gold PSU', category: 'PSU', price: 89, icon: Zap },
  ];

  const total = buildComponents.reduce((sum, component) => sum + component.price, 0);

  return (
    <>
      <SEOHead
        title="Best $1,200 Gaming PC Build (September 2025) | Complete Parts List"
        description="The ultimate $1,200 gaming PC build guide with AMD Ryzen 5 7600X and RTX 4060 Ti. Includes compatibility checking, performance benchmarks, and step-by-step assembly guide."
        canonical="/guides/best-1200-gaming-pc-september-2025"
        pageType="guide"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: 'Best $1,200 Gaming PC Build (September 2025)',
          description:
            'Complete guide to building a $1,200 gaming PC with optimal price-to-performance ratio',
          author: {
            '@type': 'Organization',
            name: 'EliteRigs',
          },
          datePublished: '2025-09-01',
          dateModified: '2025-09-22',
        }}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Updated September 2025
            </Badge>
          </div>
          <h1 className="text-4xl font-bold">Best $1,200 Gaming PC Build</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The perfect balance of price and performance. Play modern games at 1440p high settings
            with this optimized build.
          </p>
        </div>

        {/* Quick Build Summary */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-primary" />
              Build at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Performance Target</h3>
                <p className="text-sm text-muted-foreground">
                  1440p High Settings @ 60+ FPS in AAA games
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Total Cost</h3>
                <p className="text-2xl font-bold text-primary">${total.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Build Time</h3>
                <p className="text-sm text-muted-foreground">2-3 hours for beginners</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/builder?use=gaming&budget=1200&preset=optimized">
                <Button size="lg" className="w-full md:w-auto" data-testid="button-start-build">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Start This Build in PC Builder
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Components List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Complete Parts List</h2>
          <div className="grid gap-4">
            {buildComponents.map((component, index) => {
              const IconComponent = component.icon;
              return (
                <Card key={index} className="hover-elevate transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{component.name}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {component.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${component.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Performance Expectations */}
        <Card>
          <CardHeader>
            <CardTitle>What to Expect: Gaming Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">1440p High Settings</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Cyberpunk 2077: 65+ FPS
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Call of Duty: 90+ FPS
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Fortnite: 120+ FPS
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Spider-Man Remastered: 80+ FPS
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Content Creation</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    1080p streaming while gaming
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    4K video editing (H.264)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Fast rendering with NVENC
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why This Build */}
        <Card>
          <CardHeader>
            <CardTitle>Why This Combination Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">CPU-GPU Balance</h3>
              <p className="text-sm text-muted-foreground">
                The Ryzen 5 7600X provides excellent gaming performance without bottlenecking the
                RTX 4060 Ti, ensuring optimal frame rates in all scenarios.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Future-Proof Memory</h3>
              <p className="text-sm text-muted-foreground">
                32GB of fast DDR5-5600 ensures smooth gaming today and headroom for future titles
                that demand more system memory.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Upgrade Path</h3>
              <p className="text-sm text-muted-foreground">
                B650 motherboard supports future AMD processors, and the 650W PSU can handle GPU
                upgrades up to RTX 4070 Ti class.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Assembly Guide Teaser */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Build?</h3>
              <p className="text-muted-foreground">
                Use our guided PC builder to customize this build, check compatibility, and get
                step-by-step assembly instructions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/builder?use=gaming&budget=1200&components=preset">
                  <Button variant="default" data-testid="button-customize-build">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Customize This Build
                  </Button>
                </Link>
                <Link href="/guides/pc-compatibility-10-rules">
                  <Button variant="outline" data-testid="button-compatibility-guide">
                    Learn Compatibility Rules
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
