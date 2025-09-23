import { PCComponent } from '@shared/schema';
import { Plus, Check } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import ProvenanceBadge from '@/components/ProvenanceBadge';
import RationaleTooltip from '@/components/RationaleTooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBeginnerMode } from '@/hooks/useBeginnerMode';
import {
  ComponentWithDescriptions,
  getDescription,
  getPlainEnglishExplanation,
} from '@/lib/beginnerMode';

interface ComponentCardProps {
  component: ComponentWithDescriptions;
  isSelected?: boolean;
  onSelect?: (component: ComponentWithDescriptions) => void;
  onRemove?: (componentId: string) => void;
  onUpdate?: (component: ComponentWithDescriptions) => void;
}

export default function ComponentCard({
  component,
  isSelected = false,
  onSelect,
  onRemove,
  onUpdate,
}: ComponentCardProps) {
  const { isBeginnerMode } = useBeginnerMode();
  const handleClick = () => {
    if (isSelected && onRemove) {
      onRemove(component.id);
      console.log(`Removed ${component.name} from build`);
    } else if (onSelect) {
      onSelect(component);
      console.log(`Added ${component.name} to build`);
    }
  };

  const formatPrice = useCallback((price: number) => `$${price.toLocaleString()}`, []);

  // Get category-specific color for beginner-friendly learning - memoized
  const categoryColor = useMemo(() => {
    const colors = {
      CPU: 'hsl(var(--cpu-color))',
      GPU: 'hsl(var(--gpu-color))',
      RAM: 'hsl(var(--ram-color))',
      SSD: 'hsl(var(--storage-color))',
      HDD: 'hsl(var(--storage-color))',
      Motherboard: 'hsl(var(--motherboard-color))',
      PSU: 'hsl(var(--psu-color))',
      Case: 'hsl(var(--case-color))',
      Cooler: 'hsl(var(--cooler-color))',
      Fan: 'hsl(var(--cooler-color))',
    };
    return colors[component.category as keyof typeof colors] || 'hsl(var(--primary))';
  }, [component.category]);

  return (
    <Card
      className={`hover-elevate cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-primary/5 border-2' : 'border'
      }`}
      style={
        {
          borderColor: isSelected ? categoryColor : undefined,
        } as React.CSSProperties
      }
      onClick={handleClick}
      data-testid={`card-component-${component.id}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Component Image */}
          {component.imageUrl && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
              <img
                src={component.imageUrl}
                alt={component.name}
                className="object-cover w-full h-full"
                loading="lazy"
                decoding="async"
                data-testid={`img-component-${component.id}`}
              />
            </div>
          )}

          {/* Component Info */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-xs border"
                  style={{
                    backgroundColor: `hsl(var(--${component.category.toLowerCase()}-color) / 0.10)`,
                    borderColor: `hsl(var(--${component.category.toLowerCase()}-color) / 0.25)`,
                    color: categoryColor,
                  }}
                >
                  {component.category}
                </Badge>
                {isBeginnerMode && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <RationaleTooltip item={component} type="component" className="ml-1" />
                  </div>
                )}
                <div onClick={(e) => e.stopPropagation()}>
                  <ProvenanceBadge
                    component={component}
                    size="sm"
                    showAction={true}
                    onUpdate={(updatedComponent) => onUpdate?.(updatedComponent)}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg" data-testid={`text-price-${component.id}`}>
                  {formatPrice(component.price)}
                </div>
              </div>
            </div>

            <div>
              <h3
                className="font-semibold text-base leading-tight"
                data-testid={`text-name-${component.id}`}
              >
                {component.name}
              </h3>

              {/* Plain English Explanation - Always shown */}
              <p
                className="text-sm text-primary/80 font-medium mb-1"
                data-testid={`text-explanation-${component.id}`}
              >
                {getPlainEnglishExplanation(component)}
              </p>

              {/* Technical Description - Only shown in Nerd mode */}
              {!isBeginnerMode && (
                <p
                  className="text-sm text-muted-foreground"
                  data-testid={`text-technical-${component.id}`}
                >
                  {component.brand} • {getDescription(component, isBeginnerMode)}
                </p>
              )}
            </div>

            {/* Action Button */}
            <Button
              size="sm"
              variant={isSelected ? 'secondary' : 'default'}
              className="w-full mt-2"
              data-testid={`button-${isSelected ? 'remove' : 'add'}-${component.id}`}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Selected
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Build
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
