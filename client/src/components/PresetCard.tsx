import { BuildPreset } from '@shared/schema';
import { ArrowRight, Monitor, Zap, DollarSign } from 'lucide-react';

import RationaleTooltip from '@/components/RationaleTooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBeginnerMode } from '@/hooks/useBeginnerMode';

interface PresetCardProps {
  preset: BuildPreset;
  onSelect?: (preset: BuildPreset) => void;
  onViewDetails?: (preset: BuildPreset) => void;
}

export default function PresetCard({ preset, onSelect, onViewDetails }: PresetCardProps) {
  const { isBeginnerMode } = useBeginnerMode();
  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'entry':
        return <DollarSign className="w-4 h-4" />;
      case 'mid-range':
        return <Monitor className="w-4 h-4" />;
      case 'high-end':
      case 'enthusiast':
        return <Zap className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'entry':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      case 'mid-range':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'high-end':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      case 'enthusiast':
        return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <Card className="hover-elevate cursor-pointer" data-testid={`card-preset-${preset.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Badge className={`${getTierColor(preset.tier)} flex items-center gap-1`}>
              {getTierIcon(preset.tier)}
              {preset.tier}
            </Badge>
            {isBeginnerMode && (
              <div onClick={(e) => e.stopPropagation()}>
                <RationaleTooltip item={preset} type="preset" className="ml-1" />
              </div>
            )}
          </div>
          <div className="text-right">
            <div
              className="text-2xl font-bold text-primary"
              data-testid={`text-preset-price-${preset.id}`}
            >
              {formatPrice(preset.price)}
            </div>
          </div>
        </div>
        <CardTitle className="text-xl" data-testid={`text-preset-name-${preset.id}`}>
          {preset.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{preset.description}</p>

        <div className="flex gap-2">
          <Button
            onClick={() => onSelect?.(preset)}
            className="flex-1"
            data-testid={`button-select-preset-${preset.id}`}
          >
            Use This Build
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={() => onViewDetails?.(preset)}
            data-testid={`button-details-preset-${preset.id}`}
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
