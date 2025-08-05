/**
 * Error logging utility for capturing and managing errors and logs
 * Provides functionality to collect error details and system context for bug reporting
 */

export interface ErrorDetails {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'log' | 'info';
  message: string;
  stack?: string;
  source?: string;
  lineno?: number;
  colno?: number;
  context: SystemContext;
  gameState?: GameContext;
}

export interface SystemContext {
  userAgent: string;
  screen: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  timestamp: string;
  url: string;
}

export interface GameContext {
  canvasSize?: { width: number; height: number };
  gameStatus?: string;
  isGameRunning?: boolean;
  isFullscreen?: boolean;
  error?: string;
}

export class ErrorLogger {
  private errors: ErrorDetails[] = [];
  private maxErrors = 50; // Keep last 50 errors
  private originalConsole: typeof console;

  constructor() {
    this.originalConsole = { ...console };
    this.setupGlobalErrorHandling();
    this.interceptConsole();
  }

  private setupGlobalErrorHandling(): void {
    // Capture unhandled errors
    window.addEventListener('error', event => {
      this.logError({
        type: 'error',
        message: event.message,
        stack: event.error?.stack,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.logError({
        type: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack || new Error().stack,
      });
    });
  }

  private interceptConsole(): void {
    // Intercept console.error
    // eslint-disable-next-line no-console
    console.error = (...args: unknown[]) => {
      this.originalConsole.error(...args);
      this.logError({
        type: 'error',
        message: args.map(arg => String(arg)).join(' '),
        stack: new Error().stack,
      });
    };

    // Intercept console.warn
    // eslint-disable-next-line no-console
    console.warn = (...args: unknown[]) => {
      this.originalConsole.warn(...args);
      this.logError({
        type: 'warning',
        message: args.map(arg => String(arg)).join(' '),
      });
    };

    // Intercept console.log for important messages (optional)
    // eslint-disable-next-line no-console
    const originalLog = console.log;
    // eslint-disable-next-line no-console
    console.log = (...args: unknown[]) => {
      originalLog(...args);
      // Only log console.log messages that seem like errors or important info
      const message = args.map(arg => String(arg)).join(' ');
      if (
        message.toLowerCase().includes('error') ||
        message.toLowerCase().includes('failed') ||
        message.toLowerCase().includes('warning')
      ) {
        this.logError({
          type: 'log',
          message,
        });
      }
    };
  }

  private getSystemContext(): SystemContext {
    return {
      userAgent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        devicePixelRatio: window.devicePixelRatio || 1,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
  }

  private logError(params: {
    type: ErrorDetails['type'];
    message: string;
    stack?: string;
    source?: string;
    lineno?: number;
    colno?: number;
    gameState?: GameContext;
  }): void {
    const errorDetails: ErrorDetails = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: params.type,
      message: params.message,
      stack: params.stack,
      source: params.source,
      lineno: params.lineno,
      colno: params.colno,
      context: this.getSystemContext(),
      gameState: params.gameState,
    };

    // Add to errors array
    this.errors.unshift(errorDetails);

    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Emit custom event for toast notifications
    window.dispatchEvent(
      new CustomEvent('error-logged', {
        detail: errorDetails,
      })
    );
  }

  public logManualError(message: string, gameState?: GameContext): void {
    this.logError({
      type: 'error',
      message,
      stack: new Error().stack,
      gameState,
    });
  }

  public logGameError(message: string, gameState: GameContext): void {
    this.logError({
      type: 'error',
      message: `Game Error: ${message}`,
      stack: new Error().stack,
      gameState,
    });
  }

  public getErrors(): ErrorDetails[] {
    return [...this.errors];
  }

  public getLatestError(): ErrorDetails | undefined {
    return this.errors[0];
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public generateErrorReport(errorId?: string): string {
    const errors = errorId
      ? this.errors.filter(e => e.id === errorId)
      : this.errors.slice(0, 5); // Last 5 errors

    const report = {
      reportTimestamp: new Date().toISOString(),
      gameVersion: '1.0.0',
      errors: errors.map(error => ({
        timestamp: error.timestamp,
        type: error.type,
        message: error.message,
        stack: error.stack,
        source: error.source,
        line: error.lineno,
        column: error.colno,
        system: error.context,
        gameState: error.gameState,
      })),
    };

    return JSON.stringify(report, null, 2);
  }

  public destroy(): void {
    // Restore original console methods
    Object.assign(console, this.originalConsole);
  }
}

// Global instance
export const errorLogger = new ErrorLogger();
