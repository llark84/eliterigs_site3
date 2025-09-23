import { ArrowLeft, ArrowRight, CheckCircle2, Users, Monitor, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

import ConsoleTransitionExplainer from '@/components/ConsoleTransitionExplainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  beginnerPrompts,
  mapWizardAnswersToParams,
  type WizardAnswers,
} from '@/lib/beginnerPrompts';
import { cn } from '@/lib/utils';

interface BeginnerWizardProps {
  onComplete?: (answers: WizardAnswers) => void;
}

export default function BeginnerWizard({ onComplete }: BeginnerWizardProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const totalSteps = beginnerPrompts.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;
  const canGoNext = answers[currentStep] !== undefined;
  const canGoBack = currentStep > 0;

  // Icons for each step
  const stepIcons = [Users, Monitor, DollarSign];
  const StepIcon = stepIcons[currentStep];

  const handleOptionSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    if (answers.length === totalSteps) {
      const wizardAnswers: WizardAnswers = {
        who: answers[0],
        purpose: answers[1],
        budget: answers[2],
      };

      if (onComplete) {
        onComplete(wizardAnswers);
      } else {
        // Default behavior: navigate to builder
        const params = mapWizardAnswersToParams(wizardAnswers);
        setLocation(`/builder?use=${params.use}&budget=${params.budget}&wizard=true`);
      }
    }
  };

  const currentPrompt = beginnerPrompts[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
            Let's build your perfect PC
          </h1>
          <p className="text-muted-foreground text-lg">Just 3 quick questions to get you started</p>
        </div>

        {/* Console Transition Explainer */}
        <div className="mb-6">
          <ConsoleTransitionExplainer />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
              {Math.round(progress)}% complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-wizard" />
        </div>

        {/* Question Card */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <StepIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold" data-testid={`text-question-${currentStep}`}>
              {currentPrompt.question}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3">
              {currentPrompt.options.map((option, index) => {
                const isSelected = answers[currentStep] === option;
                return (
                  <Button
                    key={index}
                    variant={isSelected ? 'default' : 'outline'}
                    size="lg"
                    className={cn(
                      'justify-start text-left',
                      'transition-all duration-200',
                      isSelected && 'ring-2 ring-primary ring-offset-2'
                    )}
                    onClick={() => handleOptionSelect(option)}
                    data-testid={`button-option-${currentStep}-${index}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{option}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-primary-foreground" />}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={!canGoBack}
            className="gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  i <= currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canGoNext}
            className="gap-2"
            data-testid="button-next"
          >
            {isLastStep ? (
              <>
                Start Building
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Selected Answers Summary (if on last step) */}
        {isLastStep && answers.length === totalSteps && (
          <Card className="mt-8 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
            <CardContent className="p-6">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Your PC Profile
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Who it's for:</span>
                  <span className="font-medium">{answers[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Main use:</span>
                  <span className="font-medium">{answers[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget range:</span>
                  <span className="font-medium">{answers[2]}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
