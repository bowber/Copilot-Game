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
        const game = window.wasmBindings.start_game(
          'game-canvas'
        ) as EnhancedGameInstance;
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

  const resizeCanvas = () => {
    try {
      const instance = gameInstance();
      if (canvasRef && instance) {
        let newWidth: number;
        let newHeight: number;

        if (isMobile()) {
          // On mobile, use optimal viewport dimensions
          newWidth = window.innerWidth;
          newHeight = window.innerHeight;

          // Use visual viewport if available for better mobile support
          if (window.visualViewport) {
            newWidth = window.visualViewport.width;
            newHeight = window.visualViewport.height;
          } else {
            // Fallback: reduce height slightly for mobile browser UI
            newHeight = window.innerHeight * 0.95;
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
    };

    checkMobile();

    // Set initial canvas size
    resizeCanvas();

    // Add resize listener
    window.addEventListener('resize', resizeCanvas);
  });

  onCleanup(() => {
    stopGame();
    window.removeEventListener('resize', resizeCanvas);

    // Cleanup input manager
    if (inputManager && canvasRef) {
      inputManager.detachFromCanvas(canvasRef);
      inputManager.cleanup();
    }
  });

  return (
    <>
      <ErrorToastManager />
      <div class={`app-container ${isMobile() ? 'mobile' : ''}`}>
        {/* Main Game UI with state management */}
        <GameStateManager gameInstance={gameInstance()}>
          {(gameState, currentScreen) => {
            // Debug logging
            // console.log('GameStateManager rendering:', {
            //   gameState,
            //   currentScreen,
            // });
            // console.log('Game instance exists:', !!gameInstance());

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

        {/* Simplified Development Controls */}
        <div class="dev-controls">
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
                }
              );
            }}
          >
            🧪 Test Error
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
