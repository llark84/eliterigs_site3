import { BuildCompatibility } from '@shared/schema';
import { AlertTriangle, CheckCircle2, Shield, AlertCircle, SkipForward } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CompatibilityStatusProps {
  compatibility: BuildCompatibility | null;
  isLoading?: boolean;
  onOverride?: (reason: string) => void;
}

export default function CompatibilityStatus({
  compatibility,
  isLoading = false,
  onOverride,
}: CompatibilityStatusProps) {
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const handleOverrideSubmit = () => {
    if (overrideReason.trim() && onOverride) {
      onOverride(overrideReason.trim());
      setOverrideDialogOpen(false);
      setOverrideReason('');
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="card-compatibility-loading">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compatibility Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyzing compatibility...</div>
        </CardContent>
      </Card>
    );
  }

  if (!compatibility) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-chart-2';
    if (score >= 70) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'default';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  return (
    <Card data-testid="card-compatibility-status">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compatibility Check
          </div>
          <Badge
            variant={getScoreBadge(compatibility.score)}
            className="text-sm"
            data-testid="badge-compatibility-score"
          >
            {compatibility.score}%
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hard Failures */}
        {compatibility.hardFails.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="font-semibold text-sm">Critical Issues</span>
            </div>
            {compatibility.hardFails.map((fail, index) => (
              <div
                key={index}
                className="bg-destructive/10 border border-destructive/20 rounded-md p-3"
              >
                <div
                  className="font-medium text-sm text-destructive"
                  data-testid={`text-hard-fail-${index}`}
                >
                  {fail.category}: {fail.issue}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{fail.details}</div>
              </div>
            ))}
          </div>
        )}

        {/* Soft Warnings */}
        {compatibility.softWarns.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold text-sm">Warnings</span>
            </div>
            {compatibility.softWarns.map((warn, index) => (
              <div
                key={index}
                className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/30 rounded-md p-3"
              >
                <div
                  className="font-medium text-sm text-yellow-700 dark:text-yellow-600"
                  data-testid={`text-soft-warn-${index}`}
                >
                  {warn.category}: {warn.issue}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{warn.details}</div>
              </div>
            ))}
          </div>
        )}

        {/* All Good */}
        {compatibility.hardFails.length === 0 && compatibility.softWarns.length === 0 && (
          <div className="flex items-center gap-2 text-chart-2 bg-chart-2/10 border border-chart-2/20 rounded-md p-3">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">All components are compatible!</span>
          </div>
        )}

        {/* Override Option for Hard Failures */}
        {compatibility.hardFails.length > 0 && (
          <div className="pt-2 border-t">
            <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  data-testid="button-override-compatibility"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Override Anyway
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Override Compatibility Issues</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    You're about to override {compatibility.hardFails.length} critical compatibility
                    issue(s). Please provide a reason for this override.
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="override-reason">Override Reason</Label>
                    <Textarea
                      id="override-reason"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g., I have adapter cables, custom mod planned, etc."
                      className="min-h-[80px]"
                      data-testid="textarea-override-reason"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setOverrideDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleOverrideSubmit}
                      disabled={!overrideReason.trim()}
                      className="flex-1"
                      data-testid="button-confirm-override"
                    >
                      Override
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Override Status */}
        {compatibility.overrideReason && (
          <div className="bg-muted/50 border rounded-md p-3">
            <div className="text-sm font-medium text-muted-foreground mb-1">Override Applied</div>
            <div className="text-xs text-muted-foreground">
              Reason: {compatibility.overrideReason}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          Rules v{compatibility.rulesVersion}
        </div>
      </CardContent>
    </Card>
  );
}
