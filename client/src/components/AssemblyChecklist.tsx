import {
  CheckCircle2,
  Circle,
  Package,
  Search,
  Wrench,
  Power,
  Download,
  ChevronRight,
  ExternalLink,
  Monitor,
  Keyboard,
  Mouse,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

interface AssemblyChecklistProps {
  onClose?: () => void;
  hasAccessories?: boolean;
  selectedAccessories?: { [id: string]: any };
}

const getInitialSteps = (
  hasAccessories: boolean = false,
  selectedAccessories: { [id: string]: any } = {}
): ChecklistStep[] => {
  const baseSteps: ChecklistStep[] = [
    {
      id: 'order',
      title: 'Order your parts',
      description:
        'Purchase all components from your selected vendors. Keep tracking numbers and receipts.',
      icon: Package,
      completed: false,
    },
    {
      id: 'unbox',
      title: 'Unbox and check everything arrived',
      description: 'Verify all parts are present and undamaged. Check against your build list.',
      icon: Search,
      completed: false,
    },
    {
      id: 'assembly',
      title: 'Follow our beginner assembly guide',
      description: 'Step-by-step instructions for safely assembling your PC components.',
      icon: Wrench,
      completed: false,
    },
    {
      id: 'power-on',
      title: 'First power on checklist',
      description: 'Ensure all connections are secure before powering on for the first time.',
      icon: Power,
      completed: false,
    },
    {
      id: 'windows',
      title: 'Install Windows + updates',
      description: 'Set up your operating system and install all necessary drivers and updates.',
      icon: Download,
      completed: false,
    },
  ];

  // Add accessory setup steps if user has accessories
  if (hasAccessories && Object.keys(selectedAccessories).length > 0) {
    const accessorySteps: ChecklistStep[] = [];

    // Check for specific accessory types and add relevant steps
    const accessories = Object.values(selectedAccessories);
    const hasMonitor = accessories.some(
      (acc) =>
        acc.category?.toLowerCase().includes('monitor') ||
        acc.name?.toLowerCase().includes('monitor')
    );
    const hasKeyboard = accessories.some(
      (acc) =>
        acc.category?.toLowerCase().includes('keyboard') ||
        acc.name?.toLowerCase().includes('keyboard')
    );
    const hasMouse = accessories.some(
      (acc) =>
        acc.category?.toLowerCase().includes('mouse') || acc.name?.toLowerCase().includes('mouse')
    );

    if (hasMonitor) {
      accessorySteps.push({
        id: 'connect-monitor',
        title: 'Connect your monitor',
        description:
          'Connect your monitor to your graphics card (or motherboard if no dedicated GPU) using HDMI, DisplayPort, or other video cables.',
        icon: Monitor,
        completed: false,
      });
    }

    if (hasKeyboard) {
      accessorySteps.push({
        id: 'connect-keyboard',
        title: 'Connect your keyboard',
        description:
          'Plug in your keyboard to a USB port. For wireless keyboards, follow pairing instructions.',
        icon: Keyboard,
        completed: false,
      });
    }

    if (hasMouse) {
      accessorySteps.push({
        id: 'connect-mouse',
        title: 'Connect your mouse',
        description:
          'Plug in your mouse to a USB port. For wireless mice, follow pairing instructions and ensure batteries are installed.',
        icon: Mouse,
        completed: false,
      });
    }

    // Insert accessory steps after "windows" step but before completion
    const windowsIndex = baseSteps.findIndex((step) => step.id === 'windows');
    if (windowsIndex !== -1) {
      baseSteps.splice(windowsIndex + 1, 0, ...accessorySteps);
    }
  }

  return baseSteps;
};

export default function AssemblyChecklist({
  onClose,
  hasAccessories = false,
  selectedAccessories = {},
}: AssemblyChecklistProps) {
  const [steps, setSteps] = useState<ChecklistStep[]>(() =>
    getInitialSteps(hasAccessories, selectedAccessories)
  );
  const [currentStep, setCurrentStep] = useState(0);

  const toggleStep = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, completed: !step.completed } : step))
    );
  };

  const completedCount = steps.filter((step) => step.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="assembly-checklist">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Assembly Checklist
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your step-by-step guide to building your PC
            </p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-checklist"
            >
              ×
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <Badge variant="secondary" data-testid="progress-badge">
              {completedCount}/{steps.length} completed
            </Badge>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Step Detail */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {steps[currentStep] &&
                  (() => {
                    const IconComponent = steps[currentStep].icon;
                    return <IconComponent className="w-5 h-5 text-primary" />;
                  })()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">
                  Step {currentStep + 1}: {steps[currentStep]?.title}
                </h3>
                <p className="text-sm text-muted-foreground">{steps[currentStep]?.description}</p>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStep(steps[currentStep].id)}
                    className="gap-2"
                    data-testid={`button-toggle-step-${steps[currentStep]?.id}`}
                  >
                    {steps[currentStep]?.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    {steps[currentStep]?.completed ? 'Completed' : 'Mark Complete'}
                  </Button>

                  {steps[currentStep]?.id === 'assembly' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-primary"
                      data-testid="button-view-guide"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Guide
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* All Steps Overview */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">All Steps</h4>
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === currentStep;

            return (
              <div
                key={step.id}
                className={`
                  flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors
                  ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}
                `}
                onClick={() => setCurrentStep(index)}
                data-testid={`step-${step.id}`}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <IconComponent
                      className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                      {step.title}
                    </span>
                    {step.completed && (
                      <Badge variant="secondary" className="text-xs">
                        Done
                      </Badge>
                    )}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            data-testid="button-prev-step"
          >
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>

          <Button
            onClick={handleNextStep}
            disabled={currentStep === steps.length - 1}
            data-testid="button-next-step"
          >
            Next
          </Button>
        </div>

        {completedCount === steps.length && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Congratulations!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                You've completed your PC build! Enjoy your new system.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
