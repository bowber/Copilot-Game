// Wrapper to load WASM module and expose it globally
import init, { start_game, Game } from './game.js';

// Create a global namespace for our WASM bindings
window.wasmBindings = {
  default: init,
  start_game,
  Game
};

console.log('WASM bindings exposed globally');