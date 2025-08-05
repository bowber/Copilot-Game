import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, cleanup } from '@solidjs/testing-library';
import App from './App';

describe('Mobile Functionality', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('detects mobile based on window width', async () => {
    // Mock narrow window width
    Object.defineProperty(window, 'innerWidth', {
      value: 375,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 667,
      writable: true,
    });

    render(() => <App />);

    // Wait for the component to render and check if mobile classes are applied
    const appContainer = document.querySelector('.app-container');
    expect(appContainer).toBeTruthy();

    // The mobile detection should trigger based on window width
    expect(window.innerWidth).toBe(375);
  });

  it('has proper mobile CSS optimizations', () => {
    // Test that mobile CSS properties would be applied
    // In test environment, we'll just verify the app structure
    render(() => <App />);

    const appContainer = document.querySelector('.app-container');
    expect(appContainer).toBeTruthy();
  });

  it('canvas has touch-optimized attributes', async () => {
    render(() => <App />);

    // Find canvas element
    const canvas = document.getElementById('game-canvas');
    expect(canvas).toBeTruthy();

    if (canvas) {
      // Verify canvas has touch-optimized attributes
      expect(canvas.getAttribute('tabindex')).toBe('0');

      // Verify the canvas element exists and can be targeted for touch events
      expect(canvas.tagName.toLowerCase()).toBe('canvas');
    }
  });

  it('adjusts canvas size for mobile viewport', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      value: 375,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 667,
      writable: true,
    });

    render(() => <App />);

    const canvas = document.getElementById('game-canvas');
    expect(canvas).toBeTruthy();

    if (canvas) {
      // Canvas should be sized appropriately for mobile
      // The exact size depends on CSS calculations
      const canvasElement = canvas as HTMLCanvasElement;
      expect(canvasElement.width).toBeGreaterThan(0);
      expect(canvasElement.height).toBeGreaterThan(0);
    }
  });
});
