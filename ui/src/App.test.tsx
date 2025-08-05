import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from './App';

// Mock for requestAnimationFrame
let animationFrameId = 0;
const mockRequestAnimationFrame = vi.fn(callback => {
  animationFrameId++;
  setTimeout(callback, 16);
  return animationFrameId;
});

const mockCancelAnimationFrame = vi.fn(() => {
  // Mock implementation
});

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', mockRequestAnimationFrame);
  vi.stubGlobal('cancelAnimationFrame', mockCancelAnimationFrame);
  animationFrameId = 0;
  mockRequestAnimationFrame.mockClear();
  mockCancelAnimationFrame.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App Component', () => {
  it('renders the game title and description', () => {
    render(() => <App />);

    expect(screen.getByText('🎮 RPG Game')).toBeInTheDocument();
    expect(
      screen.getByText('A Rust + WASM RPG with SolidJS frontend')
    ).toBeInTheDocument();
  });

  it('shows loading status initially', () => {
    render(() => <App />);

    expect(screen.getByText(/Status:/)).toBeInTheDocument();
  });

  it('renders the game canvas', () => {
    render(() => <App />);

    const canvas = document.getElementById('game-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('id', 'game-canvas');
  });

  it('renders control buttons', () => {
    render(() => <App />);

    expect(screen.getByText('Start/Resume')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Restart')).toBeInTheDocument();
  });

  it('renders architecture information', () => {
    render(() => <App />);

    expect(
      screen.getByText(/Enhanced Rust \+ WASM Backend/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Enhanced SolidJS Frontend/)).toBeInTheDocument();
    expect(
      screen.getByText('Multi-screen game state management')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Reactive UI state management')
    ).toBeInTheDocument();
  });

  it('renders game features list', () => {
    render(() => <App />);

    expect(screen.getByText(/Multiple game screens/)).toBeInTheDocument();
    expect(screen.getByText(/Comprehensive input system/)).toBeInTheDocument();
    expect(screen.getByText(/Inventory and Shop systems/)).toBeInTheDocument();
  });

  it('shows technical details', () => {
    render(() => <App />);

    expect(
      screen.getByText(/The enhanced game engine is written in Rust/)
    ).toBeInTheDocument();
    expect(screen.getByText(/wasm-bindgen bindings/)).toBeInTheDocument();
  });

  it('initializes with proper canvas size', () => {
    render(() => <App />);

    const canvas = document.getElementById('game-canvas');
    expect(canvas).toHaveAttribute('width');
    expect(canvas).toHaveAttribute('height');
  });

  it('handles window resize events', async () => {
    render(() => <App />);

    // Simulate window resize
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
    });

    fireEvent(window, new Event('resize'));

    // Canvas should adapt to new size
    const canvas = document.getElementById('game-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('starts the game initialization process on mount', async () => {
    render(() => <App />);

    // Should show loading status
    await waitFor(() => {
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
    });
  });
});

describe('Game Controls Integration', () => {
  it('initializes buttons in correct disabled states', () => {
    render(() => <App />);

    const startButton = screen.getByText('Start/Resume');
    const pauseButton = screen.getByText('Pause');
    const restartButton = screen.getByText('Restart');

    // Initially, start should be disabled (no game instance yet)
    // Pause should be disabled (game not running)
    // Restart should be disabled (no game instance yet)
    expect(startButton).toBeDisabled();
    expect(pauseButton).toBeDisabled();
    expect(restartButton).toBeDisabled();
  });

  it('canvas has proper game-canvas class', () => {
    render(() => <App />);

    const canvas = document.getElementById('game-canvas');
    expect(canvas).toHaveClass('game-canvas');
  });
});

describe('Component Structure', () => {
  it('has proper semantic structure', () => {
    render(() => <App />);

    // Should have header
    expect(screen.getByRole('banner')).toBeInTheDocument();

    // Should have main content areas (updated for new content)
    expect(screen.getByText('About This Enhanced RPG')).toBeInTheDocument();
    expect(screen.getByText('RPG Game Features')).toBeInTheDocument();
    expect(screen.getByText('Technical Architecture')).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    const { container } = render(() => <App />);

    // The first child is now the ErrorToastManager, second child is the main container
    expect(container.children[1]).toHaveClass('app-container');
    expect(screen.getByText('Start/Resume').parentElement).toHaveClass(
      'dev-controls'
    );
  });
});
