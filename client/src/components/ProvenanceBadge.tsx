import { PCComponent } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ProvenanceBadgeProps {
  component: PCComponent;
  size?: 'sm' | 'default';
  showAction?: boolean;
  onUpdate?: (updatedComponent: PCComponent) => void;
}

type ProvenanceStatus = 'fresh' | 'stale' | 'unknown' | 'changed';

export default function ProvenanceBadge({
  component,
  size = 'sm',
  showAction = false,
  onUpdate,
}: ProvenanceBadgeProps) {
  const { toast } = useToast();

  // Determine provenance status
  const getProvenanceStatus = (comp: PCComponent): ProvenanceStatus => {
    if (!comp.specUrl) return 'unknown';
    if (!comp.verifiedAt) return 'unknown';
    if (comp.lastStatus === 'changed') return 'changed';

    const verifiedDate = new Date(comp.verifiedAt);
    const daysSinceVerified = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceVerified >= 14) return 'stale';
    return 'fresh';
  };

  const status = getProvenanceStatus(component);

  // Get badge properties based on status
  const getBadgeProps = (status: ProvenanceStatus) => {
    switch (status) {
      case 'fresh':
        return {
          variant: 'default' as const,
          icon: ShieldCheck,
          color: 'text-chart-2',
          label: 'Fresh',
        };
      case 'stale':
        return {
          variant: 'secondary' as const,
          icon: Shield,
          color: 'text-yellow-600',
          label: 'Stale',
        };
      case 'changed':
        return {
          variant: 'destructive' as const,
          icon: ShieldAlert,
          color: 'text-destructive',
          label: 'Changed',
        };
      case 'unknown':
      default:
        return {
          variant: 'outline' as const,
          icon: ShieldQuestion,
          color: 'text-muted-foreground',
          label: 'Unknown',
        };
    }
  };

  const badgeProps = getBadgeProps(status);
  const Icon = badgeProps.icon;

  // Get domain from specUrl
  const getDomain = (url?: string | null) => {
    if (!url) return 'No URL';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'Invalid URL';
    }
  };

  // Get tooltip content
  const getTooltipContent = () => {
    const domain = getDomain(component.specUrl ?? undefined);
    const verifiedText = component.verifiedAt
      ? formatDistanceToNow(new Date(component.verifiedAt), { addSuffix: true })
      : 'Never verified';

    return (
      <div className="space-y-1 text-xs">
        <div className="font-medium">Specification Status</div>
        <div>Source: {domain}</div>
        <div>Verified: {verifiedText}</div>
        {component.sourceNote && (
          <div className="text-muted-foreground">{component.sourceNote}</div>
        )}
        {component.specUrl && <div className="text-primary">Click to open specification</div>}
      </div>
    );
  };

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/verify/${component.id}`, {});
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: 'Verification Complete',
        description: `Component ${component.name} verified successfully.`,
      });

      // Update component with new verification data
      const updatedComponent = {
        ...component,
        verifiedAt: result.verifiedAt,
        lastStatus: result.status,
        sourceNote: result.sourceNote || null,
        lastEtag: result.lastEtag,
        lastHash: result.lastHash,
      };

      onUpdate?.(updatedComponent);
    },
    onError: () => {
      toast({
        title: 'Verification Failed',
        description: 'Could not verify component specification.',
        variant: 'destructive',
      });
    },
  });

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (component.specUrl) {
      window.open(component.specUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleVerify = (e: React.MouseEvent) => {
    e.stopPropagation();
    verifyMutation.mutate();
  };

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={badgeProps.variant}
              className={`
                cursor-pointer transition-all duration-200 hover-elevate
                ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : ''}
                ${badgeProps.color}
                ${!component.specUrl ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={handleBadgeClick}
              data-testid={`badge-provenance-${component.id}`}
            >
              <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
              {badgeProps.label}
              {component.specUrl && (
                <ExternalLink
                  className={`${size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'} ml-1 opacity-60`}
                />
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-64">
            {getTooltipContent()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showAction && component.specUrl && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleVerify}
          disabled={verifyMutation.isPending}
          className="h-6 px-1.5"
          data-testid={`button-verify-${component.id}`}
        >
          <RefreshCw className={`w-3 h-3 ${verifyMutation.isPending ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
}
