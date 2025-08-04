import { createSignal, onMount, onCleanup } from 'solid-js';

// Type definitions for WASM bindings
interface GameInstance {
  update(): void;
  render(): void;
  resize(width: number, height: number): void;
  reset(): void;
  get_ball_position(): { x: number; y: number };
  get_ball_velocity(): { x: number; y: number };
}

interface WasmBindings {
  default(): Promise<void>;
  start_game(canvasId: string): GameInstance;
}

// Extend window interface for our WASM module
declare global {
  interface Window {
    wasmBindings: WasmBindings;
  }
}

const App = () => {
  const [gameInstance, setGameInstance] = createSignal<GameInstance | null>(
    null
  );
  const [isGameRunning, setIsGameRunning] = createSignal(false);
  const [gameStatus, setGameStatus] = createSignal('Loading...');
  const [canvasSize, setCanvasSize] = createSignal({ width: 800, height: 600 });

  let animationId: number | null = null;
  let canvasRef: HTMLCanvasElement | undefined;

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
        throw new Error('WASM module failed to load');
      }

      setGameStatus('Initializing WASM...');

      // Initialize WASM
      await window.wasmBindings.default();

      // eslint-disable-next-line no-console
      console.log('WASM module loaded successfully');
      setGameStatus('Creating game instance...');

      if (canvasRef) {
        // Create the game instance
        const game = window.wasmBindings.start_game('game-canvas');
        setGameInstance(game);
        setGameStatus('Game ready!');

        // Start the game loop
        startGameLoop();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize game:', error);
      setGameStatus(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const startGameLoop = () => {
    if (!gameInstance()) return;

    setIsGameRunning(true);

    const gameLoop = () => {
      const game = gameInstance();
      if (game && isGameRunning()) {
        game.update();
        game.render();
        animationId = requestAnimationFrame(gameLoop);
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
    const instance = gameInstance();
    if (canvasRef && instance) {
      const newWidth = Math.min(window.innerWidth - 40, 800);
      const newHeight = Math.min(window.innerHeight - 200, 600);

      setCanvasSize({ width: newWidth, height: newHeight });
      instance.resize(newWidth, newHeight);
    }
  };

  onMount(() => {
    // Set initial canvas size
    resizeCanvas();

    // Add resize listener
    window.addEventListener('resize', resizeCanvas);

    // Initialize the game
    initializeGame();
  });

  onCleanup(() => {
    stopGame();
    window.removeEventListener('resize', resizeCanvas);
  });

  return (
    <div class="container">
      <header>
        <h1>🎮 Copilot Game</h1>
        <p>A Rust + WASM game with SolidJS frontend</p>
      </header>

      <div class="status">Status: {gameStatus()}</div>

      <div class="game-container">
        <canvas
          ref={canvasRef}
          id="game-canvas"
          class="game-canvas"
          width={canvasSize().width}
          height={canvasSize().height}
        />
      </div>

      <div class="controls">
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
      </div>

      <div class="info">
        <h3>About This Project</h3>
        <p>This is a demonstration of a modern web game architecture using:</p>

        <div class="architecture">
          <div class="arch-box">
            <h4>🦀 Rust + WASM Backend</h4>
            <ul>
              <li>Game logic written in Rust</li>
              <li>Compiled to WebAssembly</li>
              <li>High-performance graphics</li>
              <li>Canvas 2D rendering</li>
            </ul>
          </div>

          <div class="arch-box">
            <h4>⚡ SolidJS Frontend</h4>
            <ul>
              <li>Reactive UI framework</li>
              <li>TypeScript support</li>
              <li>Vite build system</li>
              <li>Modern web development</li>
            </ul>
          </div>
        </div>

        <h3>Game Features</h3>
        <ul>
          <li>Smooth 60 FPS animation</li>
          <li>Responsive canvas that adapts to screen size</li>
          <li>Physics-based ball movement with collision detection</li>
          <li>Real-time rendering from Rust to HTML5 Canvas</li>
          <li>Game state management (play/pause/restart)</li>
        </ul>

        <h3>Technical Details</h3>
        <p>
          The game engine is written entirely in Rust and compiled to
          WebAssembly. The SolidJS frontend provides the UI layer and manages
          the game lifecycle. Communication between Rust and JavaScript happens
          through wasm-bindgen bindings, allowing for efficient data transfer
          and function calls.
        </p>
      </div>
    </div>
  );
};

export default App;
