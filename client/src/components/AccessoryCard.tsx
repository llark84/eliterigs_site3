import {
  HelpCircle,
  Lightbulb,
  Plus,
  X,
  ShoppingCart,
  Thermometer,
  HardDrive,
  Zap,
  Cable,
  Shield,
  Wrench,
  AlertTriangle,
  Palette,
  Disc,
  Monitor,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useBeginnerMode } from '@/hooks/useBeginnerMode';

interface Accessory {
  id: string;
  name: string;
  category: string;
  price: number;
  rationale: {
    why: string;
    when: string;
  };
  triggers: string[];
  required_when: string;
  vendorPrices?: {
    amazon: number;
    newegg: number;
    bestbuy: number;
    microcenter: number;
  };
  lowestPrice?: number;
  averagePrice?: number;
}

interface AccessoryCardProps {
  accessory: Accessory;
  isSelected?: boolean;
  isRecommended?: boolean;
  onAdd?: (accessory: Accessory) => void;
  onSkip?: (accessoryId: string) => void;
  showRecommendedBadge?: boolean;
}

export default function AccessoryCard({
  accessory,
  isSelected = false,
  isRecommended = false,
  onAdd,
  onSkip,
  showRecommendedBadge = true,
}: AccessoryCardProps) {
  const { isBeginnerMode } = useBeginnerMode();

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons = {
      cooling: Thermometer,
      storage: HardDrive,
      power: Zap,
      connectivity: Cable,
      protection: Shield,
      tools: Wrench,
      safety: AlertTriangle,
      aesthetics: Palette,
      software: Disc,
      peripherals: Monitor,
    };
    const IconComponent = icons[category as keyof typeof icons] || ShoppingCart;
    return <IconComponent className="w-4 h-4" />;
  };

  // Get category color for styling
  const getCategoryColor = (category: string) => {
    const colors = {
      cooling: 'hsl(var(--cooler-color))',
      storage: 'hsl(var(--storage-color))',
      power: 'hsl(var(--psu-color))',
      connectivity: 'hsl(var(--primary))',
      protection: 'hsl(var(--chart-2))',
      tools: 'hsl(var(--chart-1))',
      safety: 'hsl(var(--chart-3))',
      aesthetics: 'hsl(var(--chart-4))',
      software: 'hsl(var(--chart-5))',
      peripherals: 'hsl(var(--primary))',
    };
    return colors[category as keyof typeof colors] || 'hsl(var(--primary))';
  };

  const handleAddClick = () => {
    if (onAdd) {
      onAdd(accessory);
    }
  };

  const handleSkipClick = () => {
    if (onSkip) {
      onSkip(accessory.id);
    }
  };

  return (
    <Card
      className={`hover-elevate transition-all duration-200 ${
        isSelected ? 'bg-primary/5 border-2' : 'border'
      } ${isRecommended ? 'ring-2 ring-chart-3/20' : ''}`}
      style={
        {
          borderColor:
            isSelected || isRecommended ? getCategoryColor(accessory.category) : undefined,
        } as React.CSSProperties
      }
      data-testid={`card-accessory-${accessory.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Badge
              variant="secondary"
              className="flex items-center gap-1"
              style={{
                backgroundColor: `color-mix(in srgb, ${getCategoryColor(accessory.category)} 15%, transparent)`,
                borderColor: `color-mix(in srgb, ${getCategoryColor(accessory.category)} 30%, transparent)`,
                color: getCategoryColor(accessory.category),
              }}
            >
              {getCategoryIcon(accessory.category)}
              {accessory.category.charAt(0).toUpperCase() + accessory.category.slice(1)}
            </Badge>

            {/* Recommended Badge */}
            {isRecommended && showRecommendedBadge && (
              <Badge variant="outline" className="text-chart-3 border-chart-3/30">
                Recommended
              </Badge>
            )}

            {/* Rationale Tooltip */}
            {isBeginnerMode && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 hover:bg-primary/10"
                    data-testid={`button-rationale-${accessory.id}`}
                  >
                    <HelpCircle className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Why this accessory?</span>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {accessory.rationale.why}
                    </p>

                    <Separator />

                    <div>
                      <span className="font-medium text-sm text-primary">When do you need it?</span>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {accessory.rationale.when}
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Price Display */}
          <div className="text-right">
            <div
              className="text-lg font-bold text-primary"
              data-testid={`text-accessory-price-${accessory.id}`}
            >
              {accessory.lowestPrice
                ? formatPrice(accessory.lowestPrice)
                : formatPrice(accessory.price)}
            </div>
            {accessory.lowestPrice && accessory.lowestPrice < accessory.price && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(accessory.price)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Accessory Name */}
        <div>
          <h3
            className="font-semibold text-base leading-tight"
            data-testid={`text-accessory-name-${accessory.id}`}
          >
            {accessory.name}
          </h3>
        </div>

        {/* Vendor Pricing Summary */}
        {accessory.vendorPrices && (
          <div className="text-xs text-muted-foreground">
            Best price from{' '}
            {Object.entries(accessory.vendorPrices).sort(([, a], [, b]) => a - b)[0][0]} •{' '}
            {Object.keys(accessory.vendorPrices).length} vendors checked
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isSelected ? (
            <>
              <Button
                onClick={handleAddClick}
                className="flex-1 gap-2"
                data-testid={`button-add-accessory-${accessory.id}`}
              >
                <Plus className="w-4 h-4" />
                Add to Build
              </Button>
              <Button
                variant="outline"
                onClick={handleSkipClick}
                className="px-3"
                data-testid={`button-skip-accessory-${accessory.id}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleSkipClick}
              className="w-full gap-2"
              data-testid={`button-remove-accessory-${accessory.id}`}
            >
              <X className="w-4 h-4" />
              Remove from Build
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
