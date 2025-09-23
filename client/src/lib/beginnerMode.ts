import { PCComponent } from '@shared/schema';

export interface ComponentWithDescriptions extends PCComponent {
  simpleDescription?: string;
  technicalDescription?: string;
}

export function explainPart(component: ComponentWithDescriptions, beginnerMode: boolean): string {
  if (beginnerMode && component.simpleDescription) {
    return `${component.name}: ${component.simpleDescription}`;
  }

  if (!beginnerMode && component.technicalDescription) {
    return `${component.name}: ${component.technicalDescription}`;
  }

  // Fallback to spec if descriptions not available
  return `${component.name}: ${component.spec || 'Standard'}`;
}

export function getDescription(
  component: ComponentWithDescriptions,
  beginnerMode: boolean
): string {
  if (beginnerMode && component.simpleDescription) {
    return component.simpleDescription;
  }

  if (!beginnerMode && component.technicalDescription) {
    return component.technicalDescription;
  }

  // Fallback to spec if descriptions not available
  return component.spec || 'Standard';
}

/**
 * Get plain English explanation for what a component does and why it matters
 */
export function getPlainEnglishExplanation(component: ComponentWithDescriptions): string {
  const category = component.category.toLowerCase();
  const name = component.name.toLowerCase();

  // CPU explanations
  if (category.includes('cpu')) {
    if (name.includes('i3') || name.includes('ryzen 3')) {
      return 'This CPU handles everyday tasks smoothly and works great for light gaming.';
    } else if (name.includes('i5') || name.includes('ryzen 5')) {
      return 'This CPU delivers excellent gaming performance and handles multitasking with ease.';
    } else if (name.includes('i7') || name.includes('ryzen 7')) {
      return 'This powerful CPU excels at demanding games and content creation tasks.';
    } else if (name.includes('i9') || name.includes('ryzen 9')) {
      return 'This high-end CPU provides top-tier performance for professional work and extreme gaming.';
    }
    return 'This CPU is the brain of your computer that handles all processing tasks.';
  }

  // GPU explanations
  if (category.includes('gpu')) {
    if (name.includes('rtx 4090') || name.includes('rx 7900 xt')) {
      return 'This GPU delivers ultra-smooth 4K gaming with maximum graphics settings.';
    } else if (
      name.includes('rtx 4080') ||
      name.includes('rtx 4070 ti') ||
      name.includes('rx 7800 xt')
    ) {
      return 'This GPU provides excellent 1440p gaming with high frame rates and ray tracing.';
    } else if (
      name.includes('rtx 4070') ||
      name.includes('rx 7700 xt') ||
      name.includes('rtx 3070')
    ) {
      return 'This GPU delivers smooth 1440p gaming and solid 1080p performance at max settings.';
    } else if (name.includes('rtx 4060') || name.includes('rx 6600') || name.includes('rtx 3060')) {
      return 'This GPU makes games look smooth at 1080p with good graphics quality.';
    }
    return 'This graphics card renders your games and makes visuals look smooth and detailed.';
  }

  // RAM explanations
  if (category.includes('ram') || category.includes('memory')) {
    if (name.includes('32gb') || name.includes('32 gb')) {
      return 'This memory lets you run multiple demanding programs and games simultaneously without slowdown.';
    } else if (name.includes('16gb') || name.includes('16 gb')) {
      return 'This memory provides enough space for modern gaming and multitasking between apps.';
    } else if (name.includes('8gb') || name.includes('8 gb')) {
      return 'This memory covers basic gaming needs but may limit multitasking with demanding games.';
    }
    return 'This memory stores data your CPU needs to access quickly, preventing stuttering and slowdowns.';
  }

  // Storage explanations
  if (category.includes('ssd')) {
    if (name.includes('1tb') || name.includes('2tb')) {
      return 'This fast storage loads your games and programs instantly with plenty of space for your library.';
    } else if (name.includes('500gb') || name.includes('512gb')) {
      return 'This fast storage makes your system boot quickly and games load in seconds.';
    }
    return 'This fast storage eliminates loading screens and makes your entire system feel snappy.';
  }

  if (category.includes('hdd')) {
    return 'This storage provides lots of space for files and games at a budget-friendly price.';
  }

  // Motherboard explanations
  if (category.includes('motherboard')) {
    return 'This motherboard connects all your parts together and determines what features you can use.';
  }

  // PSU explanations
  if (category.includes('psu') || category.includes('power')) {
    return 'This power supply safely delivers clean electricity to all your components.';
  }

  // Case explanations
  if (category.includes('case')) {
    return 'This case protects your components and provides airflow to keep everything cool.';
  }

  // Cooler explanations
  if (category.includes('cooler') || category.includes('cooling')) {
    return 'This cooler keeps your CPU at safe temperatures for reliable performance.';
  }

  // Default fallback
  return "This component plays an important role in your PC's overall performance.";
}
