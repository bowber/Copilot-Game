import { render, screen, fireEvent } from '@solidjs/testing-library';
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
    expect(screen.getByText('🧪 Test Error')).toBeInTheDocument();
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

  it('renders simplified UI structure without informational content', () => {
    render(() => <App />);

    // Should NOT have header or info sections (simplified UI)
    expect(screen.queryByText('🎮 RPG Game')).not.toBeInTheDocument();
    expect(
      screen.queryByText('About This Enhanced RPG')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('RPG Game Features')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Technical Architecture')
    ).not.toBeInTheDocument();

    // Should only have game canvas and controls
    expect(document.getElementById('game-canvas')).toBeInTheDocument();
    expect(screen.getByText('Start/Resume')).toBeInTheDocument();
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
  it('has proper simplified structure', () => {
    render(() => <App />);

    // Should NOT have header (simplified UI)
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();

    // Should have essential game elements only
    expect(document.getElementById('game-canvas')).toBeInTheDocument();
    expect(screen.getByText('Start/Resume')).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    const { container } = render(() => <App />);

    // The first child is the ErrorToastManager, second child is the main container
    expect(container.children[1]).toHaveClass('app-container');
    expect(screen.getByText('Start/Resume').parentElement).toHaveClass(
      'dev-controls'
    );
  });
});
