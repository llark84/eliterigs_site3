import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';

import { queryClient } from './lib/queryClient';

import BeginnerWizard from '@/components/BeginnerWizard';
import HeaderBar from '@/components/HeaderBar';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useRedirect } from '@/hooks/useRedirect';
import { ThemeProvider } from '@/hooks/useTheme';
import BuildShare from '@/pages/BuildShare';
import GuideView from '@/pages/GuideView';
import Home from '@/pages/Home';
import NotFound from '@/pages/not-found';
import PCBuilder from '@/pages/PCBuilder';
import PresetView from '@/pages/PresetView';

// Wrapper for BeginnerWizard to match Route props
function BeginnerWizardPage() {
  return <BeginnerWizard />;
}

function Router() {
  // Handle URL redirects
  useRedirect();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wizard" component={BeginnerWizardPage} />
      <Route path="/builder" component={PCBuilder} />
      <Route path="/build/:buildId" component={BuildShare} />

      {/* Modern clean URLs */}
      <Route path="/presets/:presetId" component={PresetView} />
      <Route path="/guides/:guideId" component={GuideView} />

      {/* Legacy redirects - maintain backward compatibility */}
      <Route path="/preset/:presetId" component={PresetView} />
      <Route path="/guide/:guideId" component={GuideView} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <HeaderBar />
            <main>
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
