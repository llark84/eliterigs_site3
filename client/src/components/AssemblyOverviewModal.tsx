import { Wrench, CheckCircle2, ExternalLink, Clock, Play } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface AssemblyOverviewModalProps {
  trigger?: React.ReactNode;
}

const assemblySteps = [
  {
    number: 1,
    title: 'Prepare your workspace',
    description: 'Clear a large, well-lit area and gather a Phillips-head screwdriver',
    icon: '🔧',
  },
  {
    number: 2,
    title: 'Install CPU and RAM',
    description: 'Put the processor and memory into the motherboard first (easier on a table)',
    icon: '⚡',
  },
  {
    number: 3,
    title: 'Mount motherboard in case',
    description: 'Screw the motherboard onto the standoffs inside your computer case',
    icon: '🏠',
  },
  {
    number: 4,
    title: 'Connect storage and GPU',
    description: 'Plug in your SSD and graphics card, then secure with screws',
    icon: '💾',
  },
  {
    number: 5,
    title: 'Wire everything up',
    description:
      "Connect power cables and front panel connectors (don't worry, they only fit one way)",
    icon: '🔌',
  },
  {
    number: 6,
    title: 'First boot and setup',
    description: 'Power on, install Windows, and enjoy your new gaming PC',
    icon: '🚀',
  },
];

export default function AssemblyOverviewModal({ trigger }: AssemblyOverviewModalProps) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" size="sm" data-testid="button-assembly-overview">
      <Wrench className="w-4 h-4 mr-2" />
      Assembly Guide
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="modal-assembly-overview"
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="w-5 h-5 text-primary" />
            10-Minute Assembly Overview
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-primary border-primary/30">
              Beginner Friendly
            </Badge>
            <span>•</span>
            <span>Quick overview to get you started</span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Introduction */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-sm leading-relaxed">
                Building a PC is like assembling expensive LEGO blocks - everything has a specific
                place and only fits one way. This overview gives you the big picture before you
                start.
              </p>
            </CardContent>
          </Card>

          {/* Assembly Steps */}
          <div className="space-y-3">
            {assemblySteps.map((step, index) => (
              <Card
                key={step.number}
                className="hover-elevate transition-all duration-200"
                data-testid={`assembly-step-${step.number}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Step Number */}
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {step.number}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{step.icon}</span>
                        <h3
                          className="font-medium text-base"
                          data-testid={`text-step-title-${step.number}`}
                        >
                          {step.title}
                        </h3>
                      </div>
                      <p
                        className="text-sm text-muted-foreground leading-relaxed"
                        data-testid={`text-step-description-${step.number}`}
                      >
                        {step.description}
                      </p>
                    </div>

                    {/* Success Indicator */}
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground/30" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Next Steps */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Play className="w-4 h-4" />
                Ready for the detailed guide?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This was just a quick overview. For step-by-step instructions with photos and
                troubleshooting tips, check out our complete assembly guide.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" data-testid="button-full-guide">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Full Written Guide
                </Button>
                <Button variant="outline" size="sm" data-testid="button-video-guide">
                  <Play className="w-4 h-4 mr-2" />
                  Video Tutorial
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-close-overview"
            >
              Got it!
            </Button>
            <Button onClick={() => setOpen(false)} data-testid="button-start-building">
              Start Building
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
