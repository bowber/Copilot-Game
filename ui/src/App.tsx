import { createSignal, onMount, onCleanup } from 'solid-js';
import { ErrorToastManager } from './components/ErrorToast';
import { errorLogger } from './utils/error-logger';
import GameUI from './components/GameUI';
import {
  EnhancedGameInstance,
  InputManager,
  GameStateManager,
} from './components/GameTypes';
import './components/GameUI.css';
import './components/TestUI.css';

const App = () => {
  const [gameInstance, setGameInstance] =
    createSignal<EnhancedGameInstance | null>(null);
  const [isGameRunning, setIsGameRunning] = createSignal(false);
  const [gameStatus, setGameStatus] = createSignal('Loading...');
  const [canvasSize, setCanvasSize] = createSignal({ width: 800, height: 600 });
  const [isFullscreen, setIsFullscreen] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(false);

  let animationId: number | null = null;
  let canvasRef: HTMLCanvasElement | undefined;
  let inputManager: InputManager | undefined;

  const initializeGame = async () => {
    try {
      setGameStatus('Loading WASM module...');

      // Wait for the WASM module to be available globally
      let retries = 0;
      while (!window.wasmBindings && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!window.wasmBindings) {
        const errorMsg =
          'WASM module failed to load - check network connection';
        throw new Error(errorMsg);
      }

      setGameStatus('Initializing WASM...');

      // Initialize WASM
      await window.wasmBindings.default();

      // eslint-disable-next-line no-console
      console.log('Enhanced WASM module loaded successfully');
      setGameStatus('Creating game instance...');

      if (canvasRef) {
        // Create the enhanced game instance
        const game = window.wasmBindings.start_game('game-canvas') as EnhancedGameInstance;
        setGameInstance(game);
        setGameStatus('Game ready!');

        // Setup input handling
        if (inputManager) {
          inputManager.setGameInstance(game);
          inputManager.attachToCanvas(canvasRef);
        }

        // Start the game loop
        startGameLoop();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Log error with game context
      errorLogger.logGameError(errorMessage, {
        canvasSize: canvasSize(),
        gameStatus: gameStatus(),
        isGameRunning: isGameRunning(),
      });

      setGameStatus(`Error: ${errorMessage}`);
    }
  };

  const startGameLoop = () => {
    if (!gameInstance()) return;

    setIsGameRunning(true);

    const gameLoop = () => {
      try {
        const game = gameInstance();
        if (game && isGameRunning()) {
          game.update();
          game.render();
          animationId = requestAnimationFrame(gameLoop);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Game loop error';

        // Log error with game context
        errorLogger.logGameError(`Game loop error: ${errorMessage}`, {
          canvasSize: canvasSize(),
          gameStatus: gameStatus(),
          isGameRunning: isGameRunning(),
        });

        // Stop the game loop to prevent repeated errors
        setIsGameRunning(false);
        setGameStatus(`Game Error: ${errorMessage}`);
      }
    };

    gameLoop();
  };

  const stopGame = () => {
    setIsGameRunning(false);
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  const resumeGame = () => {
    if (gameInstance() && !isGameRunning()) {
      startGameLoop();
    }
  };

  const toggleFullscreen = () => {
    const newFullscreenState = !isFullscreen();
    setIsFullscreen(newFullscreenState);

    // Resize canvas immediately when toggling fullscreen
    setTimeout(() => resizeCanvas(), 0);

    // Capture current state before any async operations to avoid reactivity issues
    const currentCanvasSize = canvasSize();
    const currentGameStatus = gameStatus();
    const currentIsGameRunning = isGameRunning();

    // Use browser's fullscreen API if available
    if (newFullscreenState) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(error => {
          // Fallback to CSS-only fullscreen if browser fullscreen fails
          errorLogger.logGameError(
            'Browser fullscreen not supported or denied',
            {
              error: error.message,
              canvasSize: currentCanvasSize,
              gameStatus: currentGameStatus,
              isGameRunning: currentIsGameRunning,
            }
          );
        });
      }
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(error => {
          errorLogger.logGameError('Exit fullscreen failed', {
            error: error.message,
            canvasSize: currentCanvasSize,
            gameStatus: currentGameStatus,
            isGameRunning: currentIsGameRunning,
          });
        });
      }
    }
  };

  const resizeCanvas = () => {
    try {
      const instance = gameInstance();
      if (canvasRef && instance) {
        let newWidth: number;
        let newHeight: number;

        if (isFullscreen() || isMobile()) {
          // In fullscreen mode or mobile, use optimal viewport dimensions
          newWidth = window.innerWidth;
          newHeight = window.innerHeight;

          // On mobile, account for address bar and other UI elements
          if (isMobile()) {
            // Use visual viewport if available for better mobile support
            if (window.visualViewport) {
              newWidth = window.visualViewport.width;
              newHeight = window.visualViewport.height;
            } else {
              // Fallback: reduce height slightly for mobile browser UI
              newHeight = window.innerHeight * 0.95;
            }
          }
        } else {
          // Normal mode with size constraints
          newWidth = Math.min(window.innerWidth - 40, 800);
          newHeight = Math.min(window.innerHeight - 200, 600);
        }

        setCanvasSize({ width: newWidth, height: newHeight });
        instance.resize(newWidth, newHeight);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Canvas resize error';

      // Log error with game context
      errorLogger.logGameError(`Canvas resize error: ${errorMessage}`, {
        canvasSize: canvasSize(),
        gameStatus: gameStatus(),
        isGameRunning: isGameRunning(),
        isFullscreen: isFullscreen(),
      });
    }
  };

  const handleCanvasReady = (canvas: HTMLCanvasElement) => {
    canvasRef = canvas;

    // Initialize input manager and attach to canvas
    if (!inputManager) {
      inputManager = new InputManager();
    }

    // Focus canvas for keyboard input
    canvas.focus();

    // Initialize the game after canvas is ready
    initializeGame();
  };

  onMount(() => {
    // Detect mobile device
    const checkMobile = () => {
      // Don't auto-detect mobile in test environment
      if (
        typeof window !== 'undefined' &&
        window.location?.hostname === 'localhost' &&
        (window.navigator?.userAgent?.includes('jsdom') ||
          window.navigator?.userAgent?.includes('test'))
      ) {
        setIsMobile(false);
        return;
      }

      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) ||
        window.innerWidth <= 768 ||
        'ontouchstart' in window;
      setIsMobile(isMobileDevice);

      // Auto-enable fullscreen-like experience on mobile for better gameplay
      if (isMobileDevice && !isFullscreen()) {
        setIsFullscreen(true);
      }
    };

    checkMobile();

    // Set initial canvas size
    resizeCanvas();

    // Add resize listener
    window.addEventListener('resize', resizeCanvas);

    // Listen for browser fullscreen changes
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (isCurrentlyFullscreen !== isFullscreen()) {
        setIsFullscreen(isCurrentlyFullscreen);
        setTimeout(() => resizeCanvas(), 0);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  });

  onCleanup(() => {
    stopGame();
    window.removeEventListener('resize', resizeCanvas);

    // Remove fullscreen event listeners
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (isCurrentlyFullscreen !== isFullscreen()) {
        setIsFullscreen(isCurrentlyFullscreen);
        setTimeout(() => resizeCanvas(), 0);
      }
    };

    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener(
      'webkitfullscreenchange',
      handleFullscreenChange
    );
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

    // Cleanup input manager
    if (inputManager && canvasRef) {
      inputManager.detachFromCanvas(canvasRef);
      inputManager.cleanup();
    }
  });

  return (
    <>
      <ErrorToastManager />
      <div
        class={`app-container ${isFullscreen() ? 'fullscreen' : ''} ${isMobile() ? 'mobile' : ''}`}
      >
        <header class={`app-header ${isFullscreen() ? 'hidden' : ''}`}>
          <h1>🎮 RPG Game</h1>
          <p>A Rust + WASM RPG with SolidJS frontend</p>
          <div class="status">Status: {gameStatus()}</div>
        </header>

        {/* Main Game UI with state management */}
        <GameStateManager gameInstance={gameInstance()}>
          {(gameState, currentScreen) => {
            // Debug logging
            console.log('GameStateManager rendering:', { gameState, currentScreen });
            console.log('Game instance exists:', !!gameInstance());
            
            return (
              <GameUI
                gameState={gameState}
                currentScreen={currentScreen}
                onCanvasReady={handleCanvasReady}
                canvasSize={canvasSize()}
                inputManager={inputManager}
                isMobile={isMobile()}
                gameInstance={gameInstance()}
              />
            );
          }}
        </GameStateManager>

        {/* Development Controls */}
        <div
          class={`dev-controls ${isFullscreen() ? 'fullscreen-controls' : ''}`}
        >
          <button
            class="button"
            onClick={resumeGame}
            disabled={!gameInstance() || isGameRunning()}
          >
            Start/Resume
          </button>
          <button class="button" onClick={stopGame} disabled={!isGameRunning()}>
            Pause
          </button>
          <button
            class="button"
            onClick={initializeGame}
            disabled={!gameInstance()}
          >
            Restart
          </button>
          <button
            class="button fullscreen-button"
            onClick={toggleFullscreen}
            title={isFullscreen() ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen() ? '🔲' : '⛶'}{' '}
            {isFullscreen() ? 'Exit' : 'Fullscreen'}
          </button>

          {/* Test button for demonstrating error reporting */}
          <button
            class="button test-button"
            onClick={() => {
              errorLogger.logManualError(
                'This is a test error to demonstrate the error reporting system',
                {
                  canvasSize: canvasSize(),
                  gameStatus: gameStatus(),
                  isGameRunning: isGameRunning(),
                  isFullscreen: isFullscreen(),
                }
              );
            }}
          >
            🧪 Test Error
          </button>
        </div>

        <div class={`info ${isFullscreen() ? 'hidden' : ''}`}>
          <h3>About This Enhanced RPG</h3>
          <p>
            This is a demonstration of a modern RPG game architecture featuring:
          </p>

          <div class="architecture">
            <div class="arch-box">
              <h4>🦀 Enhanced Rust + WASM Backend</h4>
              <ul>
                <li>Multi-screen game state management</li>
                <li>Comprehensive input handling</li>
                <li>RPG game logic and flow</li>
                <li>High-performance graphics</li>
                <li>Canvas 2D rendering (wgpu ready)</li>
              </ul>
            </div>

            <div class="arch-box">
              <h4>⚡ Enhanced SolidJS Frontend</h4>
              <ul>
                <li>Reactive UI state management</li>
                <li>Screen-specific overlays</li>
                <li>Input event handling</li>
                <li>TypeScript support</li>
                <li>Modern web development</li>
              </ul>
            </div>
          </div>

          <h3>RPG Game Features</h3>
          <ul>
            <li>
              📱 Multiple game screens (Login, Server Selection, Main Menu, Game
              World)
            </li>
            <li>🎮 Comprehensive input system (WASD/Arrows, Mouse, Touch)</li>
            <li>🎒 Inventory and Shop systems</li>
            <li>❓ In-game help system</li>
            <li>🌍 Region selection for multiplayer preparation</li>
            <li>👤 Player character with movement</li>
            <li>🎯 Pixel-perfect RPG-style graphics</li>
            <li>🚨 Enhanced error reporting and debugging</li>
          </ul>

          <h3>Controls</h3>
          <div class="controls-grid">
            <div class="control-item">
              <strong>WASD / Arrow Keys:</strong> Move character
            </div>
            <div class="control-item">
              <strong>I:</strong> Toggle Inventory
            </div>
            <div class="control-item">
              <strong>T:</strong> Toggle Shop
            </div>
            <div class="control-item">
              <strong>H / F1:</strong> Toggle Help
            </div>
            <div class="control-item">
              <strong>ESC:</strong> Go back/Close panels
            </div>
            <div class="control-item">
              <strong>Enter:</strong> Confirm/Continue
            </div>
            <div class="control-item">
              <strong>Mouse/Touch:</strong> Interact with UI
            </div>
          </div>

          <h3>Technical Architecture</h3>
          <p>
            The enhanced game engine is written in Rust with comprehensive state
            management and compiled to WebAssembly. The SolidJS frontend
            provides reactive UI layers for each game screen. Communication
            between Rust and JavaScript uses enhanced wasm-bindgen bindings with
            JSON state serialization for efficient data transfer.
          </p>

          <p>
            <strong>🐛 Bug Reporting:</strong> This enhanced RPG includes
            comprehensive error reporting with detailed technical information
            for developers.
          </p>
        </div>
      </div>
    </>
  );
};

export default App;
