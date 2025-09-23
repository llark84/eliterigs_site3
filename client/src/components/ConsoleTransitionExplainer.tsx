import { ChevronDown, ChevronUp, Gamepad2, Settings, Keyboard, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ConsoleTransitionExplainer() {
  const [showFAQ, setShowFAQ] = useState(false);

  const faqs = [
    {
      question: 'Will my controller work?',
      answer:
        'Yes! Xbox controllers work natively with Windows, and PlayStation controllers work with Steam or DS4Windows software. You can use controllers for any game that supports them.',
    },
    {
      question: 'Do I need Windows?',
      answer:
        'Most PC games run on Windows, though many also work on Linux. Windows gives you the widest game compatibility and is easiest for beginners.',
    },
    {
      question: 'Is building hard?',
      answer:
        'Not at all! Modern PC building is like expensive LEGO - parts only fit one way. Our guide walks you through each step, and there are tons of helpful videos online.',
    },
  ];

  return (
    <Card
      className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20 border-blue-200 dark:border-blue-800/30"
      data-testid="console-transition-explainer"
    >
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gamepad2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              From PS5/Xbox to PC—what changes?
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-blue-200/50 dark:border-blue-700/50">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                Performance Flexibility
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Choose your frame rate, resolution, and graphics settings instead of fixed console
                specs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-blue-200/50 dark:border-blue-700/50">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                Upgradability
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Swap out parts as games get more demanding—no need to buy a whole new system.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-blue-200/50 dark:border-blue-700/50">
            <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                Input Options
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Use mouse & keyboard for competitive advantage, or stick with your favorite
                controller.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFAQ(!showFAQ)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            data-testid="button-toggle-faq"
          >
            Quick FAQ
            {showFAQ ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </Button>
        </div>

        {showFAQ && (
          <div className="mt-4 space-y-3 border-t border-blue-200 dark:border-blue-700 pt-4">
            {faqs.map((faq, index) => (
              <div key={index} className="text-left">
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                  {faq.question}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
