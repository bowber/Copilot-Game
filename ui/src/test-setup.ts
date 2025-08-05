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
    }),
  },
  writable: true,
});

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (callback: (time: number) => void) => {
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
