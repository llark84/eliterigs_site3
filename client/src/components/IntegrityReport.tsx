import { PCComponent } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, AlertTriangle, XCircle, Info, ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { IntegrityResult, IntegrityCheck } from '@/lib/simpleIntegrity';

interface IntegrityReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrityResult: IntegrityResult;
  selectedComponents?: { [category: string]: PCComponent };
}

export default function IntegrityReport({
  open,
  onOpenChange,
  integrityResult,
  selectedComponents = {},
}: IntegrityReportProps) {
  const { passes, warnings, fails, score } = integrityResult;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-950';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-950';
    return 'bg-red-50 dark:bg-red-950';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const CheckIcon = ({ type }: { type: 'pass' | 'warning' | 'fail' }) => {
    switch (type) {
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const CheckSection = ({
    title,
    checks,
    type,
    bgColor,
  }: {
    title: string;
    checks: IntegrityCheck[];
    type: 'pass' | 'warning' | 'fail';
    bgColor: string;
  }) => {
    if (checks.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CheckIcon type={type} />
          <h3 className="font-medium text-sm">
            {title} ({checks.length})
          </h3>
        </div>
        <div className="space-y-2">
          {checks.map((check, index) => (
            <div
              key={index}
              className={`p-3 rounded-md ${bgColor} border-l-4 ${
                type === 'pass'
                  ? 'border-l-green-500'
                  : type === 'warning'
                    ? 'border-l-yellow-500'
                    : 'border-l-red-500'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="font-medium text-sm">{check.rule}</div>
                  <div className="text-sm text-muted-foreground mt-1">{check.message}</div>
                  {check.component && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {check.component}
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {check.category}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get provenance status for a component
  const getProvenanceStatus = (component: PCComponent) => {
    if (!component.specUrl) return { status: 'none', color: 'text-yellow-600' };
    if (!component.verifiedAt) return { status: 'unknown', color: 'text-muted-foreground' };

    const verifiedDate = new Date(component.verifiedAt);
    const daysSinceVerified = (Date.now() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24);

    if (component.lastStatus === 'changed') {
      return { status: 'changed', color: 'text-destructive' };
    }
    if (daysSinceVerified >= 14) {
      return { status: 'stale', color: 'text-yellow-600' };
    }
    return { status: 'fresh', color: 'text-chart-2' };
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'fresh':
        return 'Fresh';
      case 'stale':
        return 'Stale';
      case 'changed':
        return 'Changed';
      case 'unknown':
        return 'Unknown';
      case 'none':
        return 'No Source';
      default:
        return 'Unknown';
    }
  };

  // Get domain from URL
  const getDomain = (url?: string | null) => {
    if (!url) return null;
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return null;
    }
  };

  const SourcesSection = () => {
    const components = Object.values(selectedComponents);
    if (components.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {components.map((component) => {
              const { status, color } = getProvenanceStatus(component);
              const domain = getDomain(component.specUrl);
              const hasSource = !!component.specUrl;

              return (
                <div
                  key={component.id}
                  className={`p-3 rounded-md border-l-4 ${
                    !hasSource
                      ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-l-yellow-500'
                      : 'bg-muted/20 border-l-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{component.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {component.category}
                        </Badge>
                      </div>

                      {!hasSource ? (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-xs">No manufacturer source on file</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Source:</span>
                            <button
                              onClick={() =>
                                window.open(component.specUrl!, '_blank', 'noopener,noreferrer')
                              }
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                              data-testid={`link-source-${component.id}`}
                            >
                              {domain}
                              <ExternalLink className="w-2 h-2" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              Status: <span className={color}>{getStatusLabel(status)}</span>
                            </span>
                            {component.verifiedAt && (
                              <span>
                                Verified:{' '}
                                {formatDistanceToNow(new Date(component.verifiedAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            )}
                          </div>
                          {component.sourceNote && (
                            <div className="text-xs text-muted-foreground">
                              Note: {component.sourceNote}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        data-testid="modal-integrity-report"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Info className="w-4 h-4 text-primary" />
            </div>
            Build Integrity Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Score */}
          <Card className={getScoreBgColor(score)}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Overall Score</span>
                <span
                  className={`text-2xl font-bold ${getScoreColor(score)}`}
                  data-testid="text-integrity-score"
                >
                  {score}/100
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={score} className="h-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className={getScoreColor(score)}>{getScoreLabel(score)}</span>
                  <span className="text-muted-foreground">
                    {passes.length} passes • {warnings.length} warnings • {fails.length} issues
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <div className="space-y-4">
            <CheckSection
              title="Issues Found"
              checks={fails}
              type="fail"
              bgColor="bg-red-50/50 dark:bg-red-950/20"
            />

            <CheckSection
              title="Warnings"
              checks={warnings}
              type="warning"
              bgColor="bg-yellow-50/50 dark:bg-yellow-950/20"
            />

            <CheckSection
              title="Checks Passed"
              checks={passes}
              type="pass"
              bgColor="bg-green-50/50 dark:bg-green-950/20"
            />
          </div>

          {/* Empty State */}
          {passes.length === 0 && warnings.length === 0 && fails.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-muted-foreground">
                  <Info className="w-8 h-8 mx-auto mb-2" />
                  <p>No components selected for integrity checking.</p>
                  <p className="text-sm mt-1">
                    Add components to your build to see compatibility analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sources Section */}
          <SourcesSection />

          <Separator />

          {/* Data Sources Note */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="w-3 h-3 mt-0.5 text-muted-foreground" />
              <div>
                <strong>Data sources & limits:</strong> Using on-page component specifications for
                basic compatibility checking. Results are estimates based on common patterns in spec
                text. Some edge cases may not be detected. Full manufacturer-verified compatibility
                engine coming soon.
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
