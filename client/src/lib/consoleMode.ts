/**
 * Console Mode - Controller/Keyboard First Navigation
 *
 * Maps D-pad/arrows/Enter/Backspace to focus management and primary actions.
 * Provides a console-like experience for users who prefer keyboard navigation.
 */

export interface ConsoleModeConfig {
  enabled: boolean;
  focusOnMount: boolean;
  wrapNavigation: boolean; // Whether to wrap to first/last element
  highlightFocus: boolean; // Whether to add visual focus indicators
}

export interface FocusableElement {
  element: HTMLElement;
  priority: number; // Lower numbers get focus first
  group?: string; // Optional grouping for section-based navigation
  onActivate?: () => void; // Custom activation handler
}

class ConsoleModeManager {
  private config: ConsoleModeConfig = {
    enabled: false,
    focusOnMount: true,
    wrapNavigation: true,
    highlightFocus: true,
  };

  private focusableElements: FocusableElement[] = [];
  private currentFocusIndex: number = -1;
  private boundHandlers: { [key: string]: (e: KeyboardEvent) => void } = {};
  private isInitialized: boolean = false;
  private focusIndicatorClass: string = 'console-mode-focus';

  constructor() {
    this.loadConfig();
  }

  /**
   * Initialize console mode with optional configuration
   */
  public initialize(config?: Partial<ConsoleModeConfig>): void {
    if (this.isInitialized) return;

    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupKeyBindings();
    this.setupStyleSheet();
    this.isInitialized = true;

    // Auto-focus first element if configured
    if (this.config.enabled && this.config.focusOnMount) {
      setTimeout(() => this.focusFirst(), 100);
    }
  }

  /**
   * Enable/disable console mode
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();

    if (enabled) {
      this.attachKeyListeners();
      if (this.config.focusOnMount && this.focusableElements.length > 0) {
        this.focusFirst();
      }
    } else {
      this.detachKeyListeners();
      this.clearFocus();
    }
  }

  /**
   * Check if console mode is currently enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Register focusable elements for navigation
   */
  public registerFocusable(
    element: HTMLElement,
    priority: number = 0,
    group?: string,
    onActivate?: () => void
  ): void {
    // Remove existing registration for this element
    this.unregisterFocusable(element);

    const focusableElement: FocusableElement = {
      element,
      priority,
      group,
      onActivate,
    };

    this.focusableElements.push(focusableElement);

    // Sort by priority (lower numbers first)
    this.focusableElements.sort((a, b) => a.priority - b.priority);

    // Update current focus index if needed
    if (this.currentFocusIndex >= 0) {
      const currentElement = this.getCurrentFocusElement();
      if (currentElement) {
        this.currentFocusIndex = this.focusableElements.findIndex(
          (fe) => fe.element === currentElement.element
        );
      }
    }
  }

  /**
   * Unregister a focusable element
   */
  public unregisterFocusable(element: HTMLElement): void {
    const index = this.focusableElements.findIndex((fe) => fe.element === element);
    if (index > -1) {
      if (this.currentFocusIndex === index) {
        this.clearFocus();
      } else if (this.currentFocusIndex > index) {
        this.currentFocusIndex--;
      }
      this.focusableElements.splice(index, 1);
    }
  }

  /**
   * Clear all registered elements
   */
  public clearAll(): void {
    this.focusableElements = [];
    this.currentFocusIndex = -1;
  }

  /**
   * Focus the first available element
   */
  public focusFirst(): void {
    if (this.focusableElements.length === 0) return;
    this.setFocusIndex(0);
  }

  /**
   * Focus the last available element
   */
  public focusLast(): void {
    if (this.focusableElements.length === 0) return;
    this.setFocusIndex(this.focusableElements.length - 1);
  }

  /**
   * Focus the next element
   */
  public focusNext(): void {
    if (this.focusableElements.length === 0) return;

    let nextIndex = this.currentFocusIndex + 1;

    if (nextIndex >= this.focusableElements.length) {
      nextIndex = this.config.wrapNavigation ? 0 : this.focusableElements.length - 1;
    }

    this.setFocusIndex(nextIndex);
  }

  /**
   * Focus the previous element
   */
  public focusPrevious(): void {
    if (this.focusableElements.length === 0) return;

    let prevIndex = this.currentFocusIndex - 1;

    if (prevIndex < 0) {
      prevIndex = this.config.wrapNavigation ? this.focusableElements.length - 1 : 0;
    }

    this.setFocusIndex(prevIndex);
  }

  /**
   * Activate the currently focused element
   */
  public activateCurrent(): void {
    const current = this.getCurrentFocusElement();
    if (!current) return;

    if (current.onActivate) {
      current.onActivate();
    } else {
      // Default activation behavior
      const element = current.element;
      if (element instanceof HTMLButtonElement) {
        element.click();
      } else if (element instanceof HTMLAnchorElement) {
        element.click();
      } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        element.focus();
      } else {
        // Try to trigger click event
        element.click();
      }
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): ConsoleModeConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ConsoleModeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  // Private methods

  private getCurrentFocusElement(): FocusableElement | null {
    if (this.currentFocusIndex < 0 || this.currentFocusIndex >= this.focusableElements.length) {
      return null;
    }
    return this.focusableElements[this.currentFocusIndex];
  }

  private setFocusIndex(index: number): void {
    if (index < 0 || index >= this.focusableElements.length) return;

    // Clear previous focus
    this.clearFocus();

    // Set new focus
    this.currentFocusIndex = index;
    const focusElement = this.focusableElements[index];

    if (focusElement && focusElement.element) {
      focusElement.element.focus();

      if (this.config.highlightFocus) {
        focusElement.element.classList.add(this.focusIndicatorClass);
      }

      // Scroll element into view if needed
      focusElement.element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }

  private clearFocus(): void {
    const current = this.getCurrentFocusElement();
    if (current && this.config.highlightFocus) {
      current.element.classList.remove(this.focusIndicatorClass);
    }
  }

  private setupKeyBindings(): void {
    this.boundHandlers = {
      ArrowUp: (e: KeyboardEvent) => {
        if (!this.config.enabled) return;
        e.preventDefault();
        this.focusPrevious();
      },
      ArrowDown: (e: KeyboardEvent) => {
        if (!this.config.enabled) return;
        e.preventDefault();
        this.focusNext();
      },
      ArrowLeft: (e: KeyboardEvent) => {
        if (!this.config.enabled) return;
        e.preventDefault();
        this.focusPrevious();
      },
      ArrowRight: (e: KeyboardEvent) => {
        if (!this.config.enabled) return;
        e.preventDefault();
        this.focusNext();
      },
      Enter: (e: KeyboardEvent) => {
        if (!this.config.enabled) return;
        e.preventDefault();
        this.activateCurrent();
      },
      Space: (e: KeyboardEvent) => {
        if (!this.config.enabled) return;
        e.preventDefault();
        this.activateCurrent();
      },
      Backspace: (e: KeyboardEvent) => {
        if (!this.config.enabled) return;
        // Only prevent default if not in an input field
        const activeElement = document.activeElement;
        if (
          !(activeElement instanceof HTMLInputElement) &&
          !(activeElement instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault();
          // Could implement "back" functionality here
        }
      },
      Escape: (e: KeyboardEvent) => {
        if (!this.config.enabled) return;
        e.preventDefault();
        this.clearFocus();
      },
    };
  }

  private attachKeyListeners(): void {
    Object.entries(this.boundHandlers).forEach(([key, handler]) => {
      document.addEventListener(
        'keydown',
        (e: KeyboardEvent) => {
          if (e.key === key) {
            handler(e);
          }
        },
        { capture: true }
      );
    });
  }

  private detachKeyListeners(): void {
    // Note: In a real implementation, you'd want to store references to the actual event listeners
    // For this prototype, we'll rely on the enabled flag to disable functionality
  }

  private setupStyleSheet(): void {
    if (document.getElementById('console-mode-styles')) return;

    const style = document.createElement('style');
    style.id = 'console-mode-styles';
    style.textContent = `
      .${this.focusIndicatorClass} {
        outline: 2px solid hsl(var(--primary)) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2) !important;
        z-index: 1000 !important;
        position: relative !important;
      }

      .${this.focusIndicatorClass}::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        background: linear-gradient(45deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.2));
        border-radius: 6px;
        z-index: -1;
        animation: console-focus-pulse 2s ease-in-out infinite;
      }

      @keyframes console-focus-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 0.8; }
      }
    `;

    document.head.appendChild(style);
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('console-mode-config');
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load console mode config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('console-mode-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save console mode config:', error);
    }
  }
}

// Global instance
export const consoleMode = new ConsoleModeManager();

// Hook for React components
export function useConsoleMode() {
  const isEnabled = consoleMode.isEnabled();

  const setEnabled = (enabled: boolean) => {
    consoleMode.setEnabled(enabled);
  };

  const toggleEnabled = () => {
    consoleMode.setEnabled(!consoleMode.isEnabled());
  };

  const registerElement = (
    element: HTMLElement | null,
    priority: number = 0,
    group?: string,
    onActivate?: () => void
  ) => {
    if (element) {
      consoleMode.registerFocusable(element, priority, group, onActivate);

      // Return cleanup function
      return () => {
        consoleMode.unregisterFocusable(element);
      };
    }
  };

  return {
    isEnabled,
    setEnabled,
    toggleEnabled,
    registerElement,
    focusFirst: () => consoleMode.focusFirst(),
    focusNext: () => consoleMode.focusNext(),
    focusPrevious: () => consoleMode.focusPrevious(),
    activateCurrent: () => consoleMode.activateCurrent(),
    config: consoleMode.getConfig(),
    updateConfig: (config: Partial<ConsoleModeConfig>) => consoleMode.updateConfig(config),
  };
}

// Initialize console mode when this module is loaded
if (typeof window !== 'undefined') {
  consoleMode.initialize();
}
