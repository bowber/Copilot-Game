import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { vi } from 'vitest';
import App from './App';

// Mock WASM bindings
global.window.wasmBindings = {
  default: vi.fn().mockResolvedValue(undefined),
  start_game: vi.fn().mockReturnValue({
    update: vi.fn(),
    render: vi.fn(),
    resize: vi.fn(),
  }),
};

describe('Fullscreen Functionality', () => {
  beforeEach(() => {
    // Reset DOM and mocks
    document.body.innerHTML = '';
    vi.clearAllMocks();
    
    // Mock fullscreen API
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null,
    });
    
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    
    Object.defineProperty(document, 'exitFullscreen', {
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('renders fullscreen button', async () => {
    render(() => <App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Fullscreen/)).toBeInTheDocument();
    });
    
    const fullscreenButton = screen.getByText(/Fullscreen/);
    expect(fullscreenButton).toBeInTheDocument();
    expect(fullscreenButton.textContent).toContain('⛶');
  });

  it('toggles fullscreen state when button is clicked', async () => {
    render(() => <App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Fullscreen/)).toBeInTheDocument();
    });
    
    const fullscreenButton = screen.getByText(/Fullscreen/);
    
    // Initially should show "Fullscreen"
    expect(fullscreenButton.textContent).toContain('Fullscreen');
    
    // Click to enter fullscreen
    fireEvent.click(fullscreenButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Exit/)).toBeInTheDocument();
    });
    
    // Should now show "Exit"
    const exitButton = screen.getByText(/Exit/);
    expect(exitButton.textContent).toContain('Exit');
    expect(exitButton.textContent).toContain('🔲');
  });

  it('applies fullscreen CSS classes when in fullscreen mode', async () => {
    render(() => <App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Fullscreen/)).toBeInTheDocument();
    });
    
    const appContainer = document.querySelector('.app-container');
    const devControls = document.querySelector('.dev-controls');
    
    // Initially not fullscreen
    expect(appContainer).not.toHaveClass('fullscreen');
    expect(devControls).not.toHaveClass('fullscreen-controls');
    
    // Click fullscreen button
    const fullscreenButton = screen.getByText(/Fullscreen/);
    fireEvent.click(fullscreenButton);
    
    await waitFor(() => {
      expect(appContainer).toHaveClass('fullscreen');
      expect(devControls).toHaveClass('fullscreen-controls');
    });
  });

  it('calls browser fullscreen API when supported', async () => {
    const mockRequestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: mockRequestFullscreen,
    });
    
    render(() => <App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Fullscreen/)).toBeInTheDocument();
    });
    
    const fullscreenButton = screen.getByText(/Fullscreen/);
    fireEvent.click(fullscreenButton);
    
    expect(mockRequestFullscreen).toHaveBeenCalled();
  });

  it('handles exit fullscreen correctly', async () => {
    render(() => <App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Fullscreen/)).toBeInTheDocument();
    });
    
    // Enter fullscreen
    const fullscreenButton = screen.getByText(/Fullscreen/);
    fireEvent.click(fullscreenButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Exit/)).toBeInTheDocument();
    });
    
    // Exit fullscreen
    const exitButton = screen.getByText(/Exit/);
    fireEvent.click(exitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Fullscreen/)).toBeInTheDocument();
    });
    
    // Should be back to normal state
    const backToFullscreenButton = screen.getByText(/Fullscreen/);
    expect(backToFullscreenButton.textContent).toContain('⛶');
  });

  it('maintains game functionality in fullscreen mode', async () => {
    render(() => <App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Fullscreen/)).toBeInTheDocument();
    });
    
    // Enter fullscreen
    const fullscreenButton = screen.getByText(/Fullscreen/);
    fireEvent.click(fullscreenButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Exit/)).toBeInTheDocument();
    });
    
    // Game controls should still be available
    expect(screen.getByText('Start/Resume')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Restart')).toBeInTheDocument();
  });
});