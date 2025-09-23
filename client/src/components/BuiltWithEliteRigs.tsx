import { Plus, Cpu, HardDrive, Monitor } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BuildShowcase {
  id: string;
  title: string;
  description: string;
  specs: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
  };
  price: number;
  imageUrl?: string;
  tags: string[];
}

const showcaseBuilds: BuildShowcase[] = [
  {
    id: 'gaming-beast',
    title: 'Gaming Beast',
    description: 'High-end gaming rig for 4K ultra settings',
    specs: {
      cpu: 'AMD Ryzen 7 7800X3D',
      gpu: 'RTX 4080 Super',
      ram: '32GB DDR5-6000',
      storage: '2TB NVMe SSD',
    },
    price: 2899,
    tags: ['Gaming', '4K Ready', 'High-End'],
  },
  {
    id: 'content-creator',
    title: "Creator's Dream",
    description: 'Optimized for video editing and streaming',
    specs: {
      cpu: 'Intel i9-14900K',
      gpu: 'RTX 4070 Ti Super',
      ram: '64GB DDR5-5600',
      storage: '4TB NVMe SSD',
    },
    price: 3299,
    tags: ['Content Creation', 'Streaming', 'Workstation'],
  },
  {
    id: 'budget-champion',
    title: 'Budget Champion',
    description: 'Great performance without breaking the bank',
    specs: {
      cpu: 'AMD Ryzen 5 7600',
      gpu: 'RTX 4060 Ti',
      ram: '16GB DDR5-5200',
      storage: '1TB NVMe SSD',
    },
    price: 1299,
    tags: ['Budget', '1440p Gaming', 'Value'],
  },
];

export default function BuiltWithEliteRigs() {
  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  return (
    <section
      className="py-16 bg-gradient-to-b from-background to-muted/20"
      data-testid="section-built-with-eliterigs"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
            Built with EliteRigs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our community has created with our PC builder. Real builds from real users.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {showcaseBuilds.map((build) => (
            <Card
              key={build.id}
              className="group overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover-elevate transition-all duration-300 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/5"
              data-testid={`showcase-build-${build.id}`}
            >
              {/* Image Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden rounded-t-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge
                    variant="outline"
                    className="bg-background/80 backdrop-blur-sm border-primary/20 text-primary"
                  >
                    Showcase
                  </Badge>
                </div>
                <div className="absolute bottom-4 right-4 text-white/80">
                  <Monitor className="w-6 h-6" />
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                {/* Build Title & Description */}
                <div className="space-y-2">
                  <h3
                    className="font-semibold text-lg group-hover:text-primary transition-colors"
                    data-testid={`text-build-title-${build.id}`}
                  >
                    {build.title}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground leading-relaxed"
                    data-testid={`text-build-description-${build.id}`}
                  >
                    {build.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl font-bold text-primary"
                    data-testid={`text-build-price-${build.id}`}
                  >
                    {formatPrice(build.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">total build cost</span>
                </div>

                {/* Key Specs */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground min-w-[40px]">CPU:</span>
                    <span className="font-medium" data-testid={`text-build-cpu-${build.id}`}>
                      {build.specs.cpu}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground min-w-[40px]">GPU:</span>
                    <span className="font-medium" data-testid={`text-build-gpu-${build.id}`}>
                      {build.specs.gpu}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground min-w-[40px]">RAM:</span>
                    <span className="font-medium" data-testid={`text-build-ram-${build.id}`}>
                      {build.specs.ram}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {build.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 rounded-full"
                      data-testid={`badge-build-tag-${build.id}-${index}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Build Section */}
        <div className="text-center">
          <Card className="inline-block bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-primary/20 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Share Your Build</h3>
                  <p className="text-muted-foreground max-w-md">
                    Built something amazing? Show it off to the community and inspire other
                    builders.
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled
                  className="bg-background/50 backdrop-blur-sm border-primary/30"
                  data-testid="button-submit-build"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your Build
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Coming Soon
                  </Badge>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Community submissions will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
