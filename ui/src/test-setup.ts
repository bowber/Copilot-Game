import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock WASM module for tests
Object.defineProperty(window, 'wasmBindings', {
  value: {
    default: () => Promise.resolve(),
    start_game: () => ({
      update: vi.fn(),
      render: vi.fn(),
      resize: vi.fn(),
      reset: vi.fn(),
      get_ball_position: () => [400, 300],
      get_ball_velocity: () => [3, 2],
      // New RPG methods
      handle_input: vi.fn(() => true),
      get_current_screen: vi.fn(() => 'LoginScreen'),
      get_game_state: vi.fn(() =>
        JSON.stringify({
          screen: 'LoginScreen',
          is_loading: false,
          player_position: [400, 300],
          ball_position: [400, 300],
        })
      ),
    }),
  },
  writable: true,
});

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (callback: (time: number) => void) => {
    // Use fake timers instead of real setTimeout
    return setTimeout(() => callback(Date.now()), 16);
  },
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: (id: number) => clearTimeout(id),
});

// Mock HTMLCanvasElement methods
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === '2d') {
    return {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      set fillStyle(_value: unknown) {},
      set font(_value: unknown) {},
      set textAlign(_value: unknown) {},
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
}) as typeof HTMLCanvasElement.prototype.getContext;

// Mock user agent for consistent test environment
Object.defineProperty(navigator, 'userAgent', {
  value:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 test',
  configurable: true,
});

// Mock window dimensions for consistent testing
Object.defineProperty(window, 'innerWidth', {
  value: 1024,
  writable: true,
});

Object.defineProperty(window, 'innerHeight', {
  value: 768,
  writable: true,
});
