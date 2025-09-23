import { lazy, Suspense } from 'react';
import { useRoute } from 'wouter';

import SEOHead from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Lazy load guide components for better performance
const Best1200Build = lazy(() => import('./guides/Best1200Build'));
const PCCompatibilityRules = lazy(() => import('./guides/PCCompatibilityRules'));
const SFFTerraGuide = lazy(() => import('./guides/SFFTerraGuide'));
import { BookOpen, CheckCircle2, AlertCircle, Info, ExternalLink, Clock } from 'lucide-react';

const GUIDE_DATA = {
  'pc-compatibility-rules': {
    title: 'PC Compatibility Guide — 10 Essential Rules',
    subtitle: 'Master PC building compatibility and avoid costly mistakes',
    description:
      'Learn the 10 essential PC compatibility rules every builder needs to know. From motherboard sockets to PSU requirements, this guide covers everything to ensure your components work together perfectly.',
    publishDate: '2025-09-12',
    readTime: '8 min read',
    difficulty: 'Beginner',
    content: [
      {
        title: '1. CPU and Motherboard Socket Compatibility',
        content:
          'Always match your CPU socket type with your motherboard. Intel uses LGA sockets (LGA1700, LGA1200) while AMD uses AM sockets (AM5, AM4). This is the most critical compatibility rule.',
        type: 'rule',
      },
      {
        title: '2. RAM Generation and Speed Support',
        content:
          'Modern motherboards support DDR4 or DDR5, never both. Check your motherboard specs for maximum RAM speed and capacity. Faster RAM can be used but will run at motherboard maximum speeds.',
        type: 'rule',
      },
      {
        title: '3. GPU Clearance and PCIe Compatibility',
        content:
          'Ensure your case has enough clearance for your GPU length and height. All modern GPUs use PCIe x16 slots, but check for physical clearance with CPU coolers and RAM.',
        type: 'rule',
      },
      {
        title: '4. Power Supply Wattage and Connectors',
        content:
          'Calculate total system power draw and add 20% headroom. Ensure your PSU has the right connectors: 24-pin motherboard, 8-pin CPU, PCIe connectors for GPU.',
        type: 'rule',
      },
      {
        title: '5. Storage Interface Compatibility',
        content:
          'M.2 slots support NVMe SSDs but check for PCIe generation (3.0 vs 4.0). SATA drives need both power and data cables. Some M.2 slots may disable SATA ports when used.',
        type: 'rule',
      },
    ],
  },
  'budget-gaming-build-guide': {
    title: 'Budget Gaming Build Guide — $800 Setup',
    subtitle: 'Build a capable gaming PC without breaking the bank',
    description:
      'Complete guide to building an $800 gaming PC that can handle modern games at 1080p high settings. Smart component choices and money-saving tips included.',
    publishDate: '2025-09-18',
    readTime: '12 min read',
    difficulty: 'Intermediate',
    content: [
      {
        title: 'Smart Budget Allocation Strategy',
        content:
          'For gaming builds, allocate 35-40% of budget to GPU, 20-25% to CPU, 15% to motherboard+RAM, 10% to storage, and remaining to PSU/case. This ensures balanced performance.',
        type: 'strategy',
      },
      {
        title: 'Component Recommendations Under $800',
        content:
          'AMD Ryzen 5 5600 ($129) + RTX 4060 ($299) provides excellent 1080p gaming. Pair with B450 motherboard ($79), 16GB DDR4-3200 ($45), and 650W PSU ($65).',
        type: 'recommendation',
      },
      {
        title: 'Where to Save vs Where to Invest',
        content:
          'Save on: case aesthetics, excessive RGB, brand premium. Invest in: reliable PSU, sufficient RAM, good cooling. Never skimp on PSU quality as it affects system stability.',
        type: 'tip',
      },
    ],
  },
} as const;

export default function GuideView() {
  const [match, params] = useRoute('/guides/:guideId');
  const guideId = params?.guideId;

  // Route to new dedicated guide components first
  switch (guideId) {
    case 'best-1200-gaming-pc-september-2025':
    case 'best-1500-build': // Legacy redirect support
      return (
        <Suspense
          fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
        >
          <Best1200Build />
        </Suspense>
      );

    case 'pc-compatibility-10-rules':
      return (
        <Suspense
          fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
        >
          <PCCompatibilityRules />
        </Suspense>
      );

    case 'sff-build-fractal-terra':
      return (
        <Suspense
          fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
        >
          <SFFTerraGuide />
        </Suspense>
      );
  }

  // Fallback to existing guide system for other guides
  const guide = guideId ? GUIDE_DATA[guideId as keyof typeof GUIDE_DATA] : null;

  if (!match || !guide) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-muted-foreground">Guide Not Found</h1>
              <p className="mt-2 text-muted-foreground">This guide is not available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // TechArticle JSON-LD for guides
  const guideJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishDate,
    dateModified: guide.publishDate,
    author: {
      '@type': 'Organization',
      name: 'EliteRigs',
      url: window.location.origin,
    },
    publisher: {
      '@type': 'Organization',
      name: 'EliteRigs',
      url: window.location.origin,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href,
    },
    articleSection: 'PC Building Guides',
    keywords: ['PC building', 'computer assembly', 'hardware compatibility', 'gaming PC'],
    educationalLevel: guide.difficulty,
    timeRequired: guide.readTime,
    about: {
      '@type': 'Thing',
      name: 'PC Building',
      description: 'Computer hardware assembly and compatibility',
    },
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      case 'advanced':
        return 'text-red-600 bg-red-50 dark:bg-red-950';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'rule':
        return CheckCircle2;
      case 'strategy':
        return Info;
      case 'recommendation':
        return BookOpen;
      case 'tip':
        return AlertCircle;
      default:
        return Info;
    }
  };

  return (
    <>
      <SEOHead
        pageType="guide"
        title={guide.title}
        description={guide.description}
        ogImage="/og-default.svg"
        ogType="article"
        jsonLd={guideJsonLd}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>Guide</span>
                  <Separator orientation="vertical" className="h-4" />
                  <Clock className="h-4 w-4" />
                  <span>{guide.readTime}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <Badge className={getDifficultyColor(guide.difficulty)}>{guide.difficulty}</Badge>
                </div>

                <CardTitle className="text-2xl" data-testid="text-guide-title">
                  {guide.title}
                </CardTitle>
                <CardDescription className="text-base">{guide.subtitle}</CardDescription>
                <p className="text-muted-foreground">{guide.description}</p>

                <div className="text-sm text-muted-foreground">
                  Published {guide.publishDate} by EliteRigs
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Guide Content */}
          <Card>
            <CardHeader>
              <CardTitle>Guide Contents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {guide.content.map((section, index) => {
                const Icon = getContentIcon(section.type);
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg mt-0.5">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <h3 className="font-medium" data-testid={`text-section-title-${index}`}>
                          {section.title}
                        </h3>
                        <p
                          className="text-muted-foreground"
                          data-testid={`text-section-content-${index}`}
                        >
                          {section.content}
                        </p>
                      </div>
                    </div>
                    {index < guide.content.length - 1 && <Separator />}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ready to start building?</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply what you learned with our interactive PC builder
                  </p>
                </div>
                <Button data-testid="button-start-building">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Start Building
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
