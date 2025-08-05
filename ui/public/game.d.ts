/* tslint:disable */
/* eslint-disable */
export function main(): void;
export function start_game(canvas_id: string): Game;
/**
 * Represents the different screens/states of the RPG game
 * Now simplified to only include the game HUD and modal overlays
 */
export enum GameScreen {
  GameHUD = 0,
  Inventory = 1,
  Shop = 2,
  HelpModal = 3,
}
export class Game {
  free(): void;
  constructor(canvas_id: string);
  update(): void;
  render(): void;
  /**
   * Handle input events from the frontend
   */
  handle_input(event_type: string, data: string): boolean;
  /**
   * Get current game screen for the frontend
   */
  get_current_screen(): string;
  /**
   * Get current game state as JSON for the frontend
   */
  get_game_state(): string;
  resize(width: number, height: number): void;
  reset(): void;
  get_ball_position(): Float64Array;
  get_ball_velocity(): Float64Array;
  /**
   * Transition to a specific screen (called from SolidJS)
   */
  transition_to_screen(screen: string): void;
  /**
   * Set player name (called from SolidJS)
   */
  set_player_name(name: string): void;
  /**
   * Set selected region (called from SolidJS)
   */
  set_region(region: string): void;
  /**
   * Get player position for UI display
   */
  get_player_position(): Float64Array;
  /**
   * Check if player is moving (for UI indicators)
   */
  is_player_moving(): boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_game_free: (a: number, b: number) => void;
  readonly game_new: (a: number, b: number) => [number, number, number];
  readonly game_update: (a: number) => void;
  readonly game_render: (a: number) => void;
  readonly game_handle_input: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly game_get_current_screen: (a: number) => [number, number];
  readonly game_get_game_state: (a: number) => [number, number];
  readonly game_resize: (a: number, b: number, c: number) => void;
  readonly game_reset: (a: number) => void;
  readonly game_get_ball_position: (a: number) => [number, number];
  readonly game_get_ball_velocity: (a: number) => [number, number];
  readonly game_transition_to_screen: (a: number, b: number, c: number) => void;
  readonly game_set_player_name: (a: number, b: number, c: number) => void;
  readonly game_set_region: (a: number, b: number, c: number) => void;
  readonly game_get_player_position: (a: number) => [number, number];
  readonly game_is_player_moving: (a: number) => number;
  readonly main: () => void;
  readonly start_game: (a: number, b: number) => [number, number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
