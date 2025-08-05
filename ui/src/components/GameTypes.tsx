import { Component, createSignal, onMount, onCleanup } from 'solid-js';

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
        const handled = this.gameInstance.handle_input('keydown', event.code);
        if (handled) {
          event.preventDefault();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (this.gameInstance) {
        this.gameInstance.handle_input('keyup', event.code);
      }
    };

    // Mouse event handlers
    const handleMouseClick = (event: MouseEvent) => {
      if (this.gameInstance) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const coords = JSON.stringify([x, y]);
        this.gameInstance.handle_input('mouseclick', coords);
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
        this.gameInstance.handle_input('touch', coords);
      }
    };

    // Store listeners for cleanup
    this.keyListeners.set('keydown', handleKeyDown);
    this.keyListeners.set('keyup', handleKeyUp);
    this.mouseListeners.set('click', handleMouseClick);
    this.touchListeners.set('touchstart', handleTouch);
  }

  attachToCanvas(canvas: HTMLCanvasElement) {
    // Remove existing listeners
    this.detachFromCanvas(canvas);

    // Add keyboard listeners to document (for global input)
    this.keyListeners.forEach((listener, event) => {
      document.addEventListener(event, listener);
    });

    // Add mouse listeners to canvas
    this.mouseListeners.forEach((listener, event) => {
      canvas.addEventListener(event, listener);
    });

    // Add touch listeners to canvas
    this.touchListeners.forEach((listener, event) => {
      canvas.addEventListener(event, listener);
    });
  }

  detachFromCanvas(canvas: HTMLCanvasElement) {
    // Remove keyboard listeners from document
    this.keyListeners.forEach((listener, event) => {
      document.removeEventListener(event, listener);
    });

    // Remove mouse listeners from canvas
    this.mouseListeners.forEach((listener, event) => {
      canvas.removeEventListener(event, listener);
    });

    // Remove touch listeners from canvas
    this.touchListeners.forEach((listener, event) => {
      canvas.removeEventListener(event, listener);
    });
  }

  cleanup() {
    // Remove all event listeners
    this.keyListeners.forEach((listener, event) => {
      document.removeEventListener(event, listener);
    });
    
    this.keyListeners.clear();
    this.mouseListeners.clear();
    this.touchListeners.clear();
  }
}

// Game state manager component
export const GameStateManager: Component<{
  gameInstance: EnhancedGameInstance | null;
  children: (gameState: GameState | null, currentScreen: GameScreen | null) => any;
}> = (props) => {
  const [gameState, setGameState] = createSignal<GameState | null>(null);
  const [currentScreen, setCurrentScreen] = createSignal<GameScreen | null>(null);

  // Poll game state regularly
  const updateGameState = () => {
    if (props.gameInstance) {
      try {
        const screenStr = props.gameInstance.get_current_screen();
        const stateStr = props.gameInstance.get_game_state();
        
        setCurrentScreen(screenStr as GameScreen);
        setGameState(JSON.parse(stateStr) as GameState);
      } catch (error) {
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

  return props.children(gameState(), currentScreen());
};

export default {
  InputManager,
  GameStateManager,
};