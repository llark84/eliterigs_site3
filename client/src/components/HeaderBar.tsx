import { formatDistanceToNow } from 'date-fns';
import {
  Moon,
  Sun,
  Menu,
  GraduationCap,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Gamepad2,
  Baby,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBeginnerMode } from '@/hooks/useBeginnerMode';
import { useParentKidMode } from '@/hooks/useParentKidMode';
import { useTheme } from '@/hooks/useTheme';
import { useConsoleMode } from '@/lib/consoleMode';

interface HeaderBarProps {
  onMenuToggle?: () => void;
  priceTimestamp?: string | null;
  vendorCount?: number;
}

export default function HeaderBar({
  onMenuToggle,
  priceTimestamp,
  vendorCount = 0,
}: HeaderBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isBeginnerMode, toggleBeginnerMode } = useBeginnerMode();
  const { isParentKidMode, toggleParentKidMode } = useParentKidMode();
  const { isEnabled: isConsoleMode, toggleEnabled: toggleConsoleMode } = useConsoleMode();

  // Calculate price data freshness
  const getPriceFreshnessState = () => {
    if (!priceTimestamp)
      return { color: 'text-muted-foreground', icon: Clock, label: 'No price data' };

    const now = new Date();
    const timestamp = new Date(priceTimestamp);
    const minutesOld = (now.getTime() - timestamp.getTime()) / (1000 * 60);

    if (minutesOld <= 10) {
      return { color: 'text-chart-2', icon: CheckCircle2, label: 'Fresh prices' };
    } else if (minutesOld <= 30) {
      return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Prices aging' };
    } else {
      return { color: 'text-destructive', icon: XCircle, label: 'Stale prices' };
    }
  };

  const priceState = getPriceFreshnessState();
  const PriceIcon = priceState.icon;

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden"
            data-testid="button-menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div className="font-semibold text-lg" data-testid="text-brand">
              EliteRigs
              <span className="text-muted-foreground font-normal ml-2">PC Builder</span>
            </div>
            <Badge variant="outline" className="hidden md:inline-flex">
              v2.0
            </Badge>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Health Status - Hidden on mobile */}
          <Badge
            variant="outline"
            className="hidden lg:inline-flex items-center gap-1 text-chart-2 border-chart-2/30"
            data-testid="badge-status"
          >
            <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
            Online
          </Badge>

          {/* Console Mode Toggle */}
          <Button
            variant={isConsoleMode ? 'default' : 'outline'}
            size="icon"
            onClick={toggleConsoleMode}
            data-testid="button-console-toggle"
            className="hidden md:inline-flex"
          >
            <Gamepad2 className="w-4 h-4" />
          </Button>

          {/* Beginner Mode Toggle */}
          <Button
            variant={isBeginnerMode ? 'default' : 'outline'}
            size="icon"
            onClick={toggleBeginnerMode}
            data-testid="button-beginner-toggle"
            className="hidden sm:inline-flex"
          >
            <GraduationCap className="w-4 h-4" />
          </Button>

          {/* Parent/Kid Mode Toggle */}
          <Button
            variant={isParentKidMode ? 'default' : 'outline'}
            size="icon"
            onClick={toggleParentKidMode}
            data-testid="button-parent-kid-toggle"
            className="hidden sm:inline-flex"
          >
            <Baby className="w-4 h-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Trust Badges Footer */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Affiliate Disclosure */}
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Affiliate Links
              </Badge>

              {/* No Sponsored Placements */}
              <Badge variant="outline" className="text-xs text-chart-2 border-chart-2/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                No Sponsored Placements
              </Badge>

              {/* Price Timestamp */}
              {priceTimestamp && (
                <Badge
                  variant="outline"
                  className={`text-xs ${priceState.color} border-current/30`}
                >
                  <PriceIcon className="w-3 h-3 mr-1" />
                  Prices: {formatDistanceToNow(new Date(priceTimestamp), { addSuffix: true })}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              {vendorCount > 0 && (
                <span className="text-xs">
                  {vendorCount} vendor{vendorCount !== 1 ? 's' : ''} checked
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
