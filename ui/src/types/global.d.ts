// Global type declarations for the enhanced game

interface GameInstance {
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

interface WasmBindings {
  default(): Promise<void>;
  start_game(canvasId: string): GameInstance;
}

declare global {
  interface Window {
    wasmBindings: WasmBindings;
  }
}

export {};
