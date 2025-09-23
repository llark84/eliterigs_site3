export interface BeginnerPrompt {
  question: string;
  options: string[];
}

export interface WizardAnswers {
  who: string;
  purpose: string;
  budget: string;
}

export const beginnerPrompts: BeginnerPrompt[] = [
  {
    question: "Who's this PC for?",
    options: ['For me', 'For my kid', 'For school/college', 'Family build project'],
  },
  {
    question: 'What do you want to use it for?',
    options: ['Gaming', 'School/Work', 'Streaming/Content', 'All-around'],
  },
  {
    question: "What's your comfort zone budget?",
    options: ['<$600 (starter)', '$600–$1000 (mid-range)', '$1000+ (future-proof)'],
  },
];

// Map wizard answers to builder parameters
export function mapWizardAnswersToParams(answers: WizardAnswers): { use: string; budget: number } {
  // Map purpose to use case
  const useMap: Record<string, string> = {
    Gaming: 'gaming',
    'School/Work': 'budget',
    'Streaming/Content': 'streaming',
    'All-around': 'budget',
  };

  // Map budget string to number
  const budgetMap: Record<string, number> = {
    '<$600 (starter)': 600,
    '$600–$1000 (mid-range)': 1000,
    '$1000+ (future-proof)': 1500,
  };

  return {
    use: useMap[answers.purpose] || 'budget',
    budget: budgetMap[answers.budget] || 1000,
  };
}
