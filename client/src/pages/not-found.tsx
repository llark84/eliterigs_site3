import { AlertCircle, Home, Wrench, BookOpen, Zap } from 'lucide-react';
import { Link } from 'wouter';

import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QUICK_LINKS, PAGE_TITLES } from '@/constants/copy';

export default function NotFound() {
  const quickLinks = QUICK_LINKS.map((link) => ({
    ...link,
    icon: link.title === 'PC Builder' ? Wrench : link.title === 'PC Guides' ? BookOpen : Zap,
  }));

  return (
    <>
      <SEOHead
        title={PAGE_TITLES.notFound}
        description="The page you're looking for doesn't exist. Get back to building PCs with our wizard, guides, and preset builds."
        canonical="/404"
        noindex={true}
      />

      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Main 404 Card */}
          <Card className="text-center">
            <CardHeader className="pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Page Not Found</CardTitle>
              <p className="text-lg text-muted-foreground mt-2">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/" data-testid="button-home">
                <Button size="lg" className="mb-6">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Homepage
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Or explore some of our most popular features below
              </p>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid gap-4 md:grid-cols-3">
            {quickLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`link-${link.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Card className="h-full hover-elevate cursor-pointer transition-all duration-200">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <h3 className="font-semibold">{link.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {link.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Additional Help */}
          <Card className="bg-muted/30">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Still can't find what you're looking for?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try starting with our PC building wizard - it's designed to guide you through
                creating the perfect build for your needs and budget.
              </p>
              <Link href="/builder?step=1" data-testid="button-start-wizard">
                <Button variant="outline">
                  <Wrench className="w-4 h-4 mr-2" />
                  Start Building Wizard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
