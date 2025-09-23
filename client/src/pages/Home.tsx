import { useState, useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { useLocation } from 'wouter';

import SEOHead from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

// Lazy load showcase component for better performance
const BuiltWithEliteRigs = lazy(() => import('@/components/BuiltWithEliteRigs'));
import {
  Cpu,
  Monitor,
  Brain,
  Volume,
  DollarSign,
  Server,
  CheckCircle2,
  ShoppingCart,
  Wrench,
  ArrowRight,
} from 'lucide-react';

import { cn } from '@/lib/utils';

// Analytics store (in-memory for now)
const analyticsStore = {
  selections: [] as Array<{ use: string; budget: number; timestamp: string }>,
};

const USE_CASES = [
  {
    id: 'gaming',
    title: 'Gaming',
    subtitle: 'High FPS, smooth gameplay',
    description: 'Optimized for GPU performance and gaming at 1080p-4K',
    icon: Monitor,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  {
    id: 'streaming',
    title: 'Streaming/Creator',
    subtitle: 'Content creation powerhouse',
    description: 'Balanced CPU/GPU for streaming, video editing, and content creation',
    icon: Cpu,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'ai-ml',
    title: 'AI/ML',
    subtitle: 'Machine learning & AI tasks',
    description: 'High-end GPU and CPU for training models and data processing',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    id: 'quiet-sff',
    title: 'Quiet SFF',
    subtitle: 'Small form factor, whisper quiet',
    description: 'Compact builds with excellent thermal management and noise control',
    icon: Volume,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900',
    borderColor: 'border-teal-200 dark:border-teal-800',
  },
  {
    id: 'budget',
    title: 'Budget Builder',
    subtitle: 'Maximum value for money',
    description: 'Best performance per dollar with smart component selections',
    icon: DollarSign,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  {
    id: 'workstation',
    title: 'Workstation',
    subtitle: 'Professional workloads',
    description: 'High-core CPUs, ECC memory, and workstation GPUs for professional work',
    icon: Server,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
  },
];

const BUDGET_PRESETS = [800, 1200, 1500, 2000, 3000];

const FEATURES = [
  {
    title: 'Compatibility Checks',
    description: 'Hard/soft compatibility validation with manual override options',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  {
    title: 'Total Cost & Shipping',
    description: 'Real-time pricing from multiple vendors with shipping estimates',
    icon: ShoppingCart,
    color: 'text-blue-600',
  },
  {
    title: 'Build Completer',
    description: 'Never forget essential accessories like thermal paste and cables',
    icon: Wrench,
    color: 'text-orange-600',
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<number>(1500);
  const [customBudget, setCustomBudget] = useState<number>(1500);
  const [useCustomBudget, setUseCustomBudget] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);

  const finalBudget = useCustomBudget ? customBudget : selectedBudget;

  // Handle scroll for sticky button on mobile
  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 300 && selectedUseCase && finalBudget;
      setShowStickyButton(!!shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedUseCase, finalBudget]);

  const handleStartBuild = () => {
    if (!selectedUseCase || !finalBudget) return;

    // Log analytics
    analyticsStore.selections.push({
      use: selectedUseCase,
      budget: finalBudget,
      timestamp: new Date().toISOString(),
    });

    // Navigate to builder with query params
    setLocation(`/builder?use=${selectedUseCase}&budget=${finalBudget}`);
  };

  const canStartBuild = selectedUseCase && finalBudget;

  return (
    <>
      <SEOHead
        pageType="home"
        ogImage="/og-default.svg"
        ogType="website"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'EliteRigs',
          url: window.location.origin,
          description:
            'Professional PC building platform with component compatibility checking, pricing comparison, and smart accessory recommendations.',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${window.location.origin}/builder?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
          publisher: {
            '@type': 'Organization',
            name: 'EliteRigs',
            url: window.location.origin,
          },
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="pt-12 pb-16 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                Build a PC without guesswork
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                One URL, everything you need—from CPU to cables.
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                No more gotchas. EliteRigs guides your parts, checks fit and power, and adds the
                little things—paste, cables, fans—so your build just works.
              </p>
            </div>

            {/* What You'll Get Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 max-w-3xl mx-auto">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-3 p-4 rounded-lg bg-card border"
                >
                  <feature.icon className={cn('w-6 h-6 flex-shrink-0', feature.color)} />
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Case Selection */}
        <section className="px-4 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-usecase-title">
                Step 1: What's your main use case?
              </h2>
              <p className="text-muted-foreground">
                Choose your primary use to optimize component selection and priorities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {USE_CASES.map((useCase) => (
                <Card
                  key={useCase.id}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover-elevate',
                    useCase.bgColor,
                    useCase.borderColor,
                    selectedUseCase === useCase.id && 'ring-2 ring-primary ring-offset-2'
                  )}
                  onClick={() => setSelectedUseCase(useCase.id)}
                  data-testid={`card-usecase-${useCase.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <useCase.icon className={cn('w-8 h-8 flex-shrink-0 mt-1', useCase.color)} />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{useCase.title}</h3>
                        <p className="font-medium text-sm mb-2 text-muted-foreground">
                          {useCase.subtitle}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {useCase.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedUseCase && (
              <div className="text-center">
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                  Selected: {USE_CASES.find((uc) => uc.id === selectedUseCase)?.title}
                </Badge>
              </div>
            )}
          </div>
        </section>

        {/* Budget Selection */}
        {selectedUseCase && (
          <section className="px-4 pb-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" data-testid="text-budget-title">
                  Step 2: What's your budget?
                </h2>
                <p className="text-muted-foreground">
                  Choose a preset or set your custom budget range
                </p>
              </div>

              {/* Budget Presets */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {BUDGET_PRESETS.map((budget) => (
                  <Button
                    key={budget}
                    variant={selectedBudget === budget && !useCustomBudget ? 'default' : 'outline'}
                    className="h-16 text-lg font-semibold"
                    onClick={() => {
                      setSelectedBudget(budget);
                      setUseCustomBudget(false);
                    }}
                    data-testid={`button-budget-${budget}`}
                  >
                    ${budget.toLocaleString()}
                  </Button>
                ))}
              </div>

              {/* Custom Budget Slider */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Custom Budget</label>
                    <Badge variant="outline">${customBudget.toLocaleString()}</Badge>
                  </div>
                  <Slider
                    value={[customBudget]}
                    onValueChange={(value) => {
                      setCustomBudget(value[0]);
                      setUseCustomBudget(true);
                    }}
                    min={500}
                    max={5000}
                    step={50}
                    className="w-full"
                    data-testid="slider-budget"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$500</span>
                    <span>$5,000</span>
                  </div>
                </div>
              </Card>

              {(selectedBudget || customBudget) && (
                <div className="text-center mt-4">
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                    Budget: ${finalBudget.toLocaleString()}
                  </Badge>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Built with EliteRigs Showcase */}
        <Suspense
          fallback={
            <div className="h-32 flex items-center justify-center">Loading showcase...</div>
          }
        >
          <BuiltWithEliteRigs />
        </Suspense>

        {/* CTA Section */}
        {canStartBuild && (
          <section className="px-4 pb-16">
            <div className="max-w-2xl mx-auto text-center">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold gap-3"
                onClick={handleStartBuild}
                data-testid="button-start-build"
              >
                Start my build
                <ArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                We'll guide you through compatible components within your budget
              </p>
            </div>
          </section>
        )}

        {/* Mobile Sticky CTA */}
        {showStickyButton && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t md:hidden">
            <Button
              size="lg"
              className="w-full h-12 font-semibold gap-2"
              onClick={handleStartBuild}
              data-testid="button-start-build-sticky"
            >
              Start my build
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
