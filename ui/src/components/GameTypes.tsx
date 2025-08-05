import { Component, createSignal, onMount, onCleanup, JSX } from 'solid-js';
import { errorLogger } from '../utils/error-logger';

// Enhanced interface for the new RPG game backend
export interface EnhancedGameInstance {
  // Core game methods
  update(): void;
  render(): void;
  resize(width: number, height: number): void;
  reset(): void;

  // New RPG methods
  handle_input(eventType: string, data: string): boolean;
  get_current_screen(): string;
  get_game_state(): string;

  // Legacy compatibility methods
  get_ball_position(): number[];
  get_ball_velocity(): number[];
}

export interface WasmBindings {
  default(): Promise<void>;
  start_game(canvasId: string): EnhancedGameInstance;
}

// Game state types (matching Rust backend)
export type GameScreen =
  | 'LoginScreen'
  | 'ServerSelection'
  | 'MainMenu'
  | 'GameHUD'
  | 'Inventory'
  | 'Shop'
  | 'HelpModal';

export type Region = 'EU' | 'ASIA' | 'VIETNAM';

export interface GameState {
  screen: GameScreen;
  region?: Region;
  player_name?: string;
  is_loading: boolean;
  error?: string;
  player_position: [number, number];
  ball_position: [number, number];
}

// Input handling utilities
export class InputManager {
  private gameInstance: EnhancedGameInstance | null = null;
  private keyListeners: Map<string, (event: KeyboardEvent) => void> = new Map();
  private mouseListeners: Map<string, (event: MouseEvent) => void> = new Map();
  private touchListeners: Map<string, (event: TouchEvent) => void> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  setGameInstance(instance: EnhancedGameInstance | null) {
    this.gameInstance = instance;
  }

  private setupEventListeners() {
    // Keyboard event handlers
    const handleKeyDown = (event: KeyboardEvent) => {
      if (this.gameInstance) {
        try {
          const handled = this.gameInstance.handle_input('keydown', event.code);
          if (handled) {
            event.preventDefault();
          }
        } catch (error) {
          errorLogger.logGameError('Error handling keydown event', {
            error: String(error),
          });
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (this.gameInstance) {
        try {
          this.gameInstance.handle_input('keyup', event.code);
        } catch (error) {
          errorLogger.logGameError('Error handling keyup event', {
            error: String(error),
          });
        }
      }
    };

    // Mouse event handlers
    const handleMouseClick = (event: MouseEvent) => {
      if (this.gameInstance) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const coords = JSON.stringify([x, y]);
        try {
          this.gameInstance.handle_input('mouseclick', coords);
        } catch (error) {
          errorLogger.logGameError('Error handling mouse click event', {
            error: String(error),
          });
        }
      }
    };

    // Touch event handlers
    const handleTouch = (event: TouchEvent) => {
      if (this.gameInstance && event.touches.length > 0) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const coords = JSON.stringify([x, y]);
        try {
          this.gameInstance.handle_input('touch', coords);
        } catch (error) {
          errorLogger.logGameError('Error handling touch event', {
            error: String(error),
          });
        }
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (this.gameInstance && event.touches.length > 0) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const coords = JSON.stringify([x, y]);
        try {
          // Send both touchstart and touch events to ensure game responds
          this.gameInstance.handle_input('touchstart', coords);
          this.gameInstance.handle_input('touch', coords);
        } catch (error) {
          errorLogger.logGameError('Error handling touchstart event', {
            error: String(error),
          });
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (this.gameInstance) {
        event.preventDefault();
        try {
          // Send touchend event to complete the interaction
          this.gameInstance.handle_input('touchend', '[]');
        } catch (error) {
          errorLogger.logGameError('Error handling touchend event', {
            error: String(error),
          });
        }
      }
    };

    // Store listeners for cleanup
    this.keyListeners.set('keydown', handleKeyDown);
    this.keyListeners.set('keyup', handleKeyUp);
    this.mouseListeners.set('click', handleMouseClick);
    this.touchListeners.set('touchstart', handleTouchStart);
    this.touchListeners.set('touchmove', handleTouch);
    this.touchListeners.set('touchend', handleTouchEnd);
  }

  attachToCanvas(canvas: HTMLCanvasElement) {
    // Remove existing listeners
    this.detachFromCanvas(canvas);

    // Add keyboard listeners to document (for global input)
    this.keyListeners.forEach((listener, event) => {
      document.addEventListener(event, listener as (e: Event) => void);
    });

    // Add mouse listeners to canvas
    this.mouseListeners.forEach((listener, event) => {
      canvas.addEventListener(event, listener as (e: Event) => void);
    });

    // Add touch listeners to canvas
    this.touchListeners.forEach((listener, event) => {
      canvas.addEventListener(event, listener as (e: Event) => void);
    });
  }

  detachFromCanvas(canvas: HTMLCanvasElement) {
    // Remove keyboard listeners from document
    this.keyListeners.forEach((listener, event) => {
      document.removeEventListener(event, listener as (e: Event) => void);
    });

    // Remove mouse listeners from canvas
    this.mouseListeners.forEach((listener, event) => {
      canvas.removeEventListener(event, listener as (e: Event) => void);
    });

    // Remove touch listeners from canvas
    this.touchListeners.forEach((listener, event) => {
      canvas.removeEventListener(event, listener as (e: Event) => void);
    });
  }

  // Virtual key handling for mobile controls
  handleVirtualKey(code: string, isPressed: boolean) {
    if (this.gameInstance) {
      try {
        const eventType = isPressed ? 'keydown' : 'keyup';
        const handled = this.gameInstance.handle_input(eventType, code);
        return handled;
      } catch (error) {
        errorLogger.logGameError(
          `Error handling virtual ${isPressed ? 'keydown' : 'keyup'} event for ${code}`,
          {
            error: String(error),
          }
        );
        return false;
      }
    }
    return false;
  }

  cleanup() {
    // Remove all event listeners
    this.keyListeners.forEach((listener, event) => {
      document.removeEventListener(event, listener as (e: Event) => void);
    });

    this.keyListeners.clear();
    this.mouseListeners.clear();
    this.touchListeners.clear();
  }
}

// Game state manager component
export const GameStateManager: Component<{
  gameInstance: EnhancedGameInstance | null;
  children: (
    gameState: GameState | null,
    currentScreen: GameScreen | null
  ) => JSX.Element;
}> = props => {
  const [gameState, setGameState] = createSignal<GameState | null>(null);
  const [currentScreen, setCurrentScreen] = createSignal<GameScreen | null>(
    null
  );

  // Poll game state regularly
  const updateGameState = () => {
    if (props.gameInstance) {
      try {
        const screenStr = props.gameInstance.get_current_screen();
        const stateStr = props.gameInstance.get_game_state();

        setCurrentScreen(screenStr as GameScreen);
        setGameState(JSON.parse(stateStr) as GameState);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to get game state:', error);
      }
    }
  };

  onMount(() => {
    // Update immediately and then every 100ms
    updateGameState();
    const interval = setInterval(updateGameState, 100);

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  // eslint-disable-next-line solid/reactivity
  return props.children(gameState(), currentScreen());
};

export default {
  InputManager,
  GameStateManager,
};
