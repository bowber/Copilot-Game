import { Component, Show } from 'solid-js';
import { GameState, GameScreen } from './GameTypes';

// UI Components for each game screen
export const GameUI: Component<{
  gameState: GameState | null;
  currentScreen: GameScreen | null;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  canvasSize: { width: number; height: number };
}> = props => {
  const setupCanvas = (canvas: HTMLCanvasElement) => {
    props.onCanvasReady(canvas);
  };

  return (
    <div class="game-ui">
      {/* Main game canvas - always present */}
      <canvas
        // eslint-disable-next-line solid/reactivity
        ref={setupCanvas}
        id="game-canvas"
        class="game-canvas"
        width={props.canvasSize.width}
        height={props.canvasSize.height}
        tabindex="0" // Make canvas focusable for keyboard input
      />

      {/* Screen-specific UI overlays */}
      <Show when={props.currentScreen && props.gameState}>
        <ScreenOverlay
          screen={props.currentScreen!}
          gameState={props.gameState!}
        />
      </Show>
    </div>
  );
};

const ScreenOverlay: Component<{
  screen: GameScreen;
  gameState: GameState;
}> = props => {
  return (
    <div class="screen-overlay">
      <Show when={props.screen === 'LoginScreen'}>
        <LoginScreenOverlay gameState={props.gameState} />
      </Show>

      <Show when={props.screen === 'ServerSelection'}>
        <ServerSelectionOverlay gameState={props.gameState} />
      </Show>

      <Show when={props.screen === 'MainMenu'}>
        <MainMenuOverlay gameState={props.gameState} />
      </Show>

      <Show when={props.screen === 'GameHUD'}>
        <GameHUDOverlay gameState={props.gameState} />
      </Show>

      <Show when={props.screen === 'Inventory'}>
        <InventoryOverlay gameState={props.gameState} />
      </Show>

      <Show when={props.screen === 'Shop'}>
        <ShopOverlay gameState={props.gameState} />
      </Show>

      <Show when={props.screen === 'HelpModal'}>
        <HelpModalOverlay gameState={props.gameState} />
      </Show>
    </div>
  );
};

const LoginScreenOverlay: Component<{ gameState: GameState }> = props => {
  return (
    <div class="login-overlay">
      <div class="login-ui">
        <div class="welcome-text">
          <h1>Welcome to RPG Game</h1>
          <p>Click anywhere or press Enter to begin your adventure!</p>
        </div>

        <Show when={props.gameState.is_loading}>
          <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Loading...</p>
          </div>
        </Show>

        <Show when={props.gameState.error}>
          <div class="error-message">
            <p>Error: {props.gameState.error}</p>
          </div>
        </Show>
      </div>
    </div>
  );
};

const ServerSelectionOverlay: Component<{ gameState: GameState }> = props => {
  return (
    <div class="server-selection-overlay">
      <div class="server-selection-ui">
        <h2>Select Your Region</h2>

        <div class="region-info">
          <Show when={props.gameState.region}>
            <p>Selected: {props.gameState.region}</p>
          </Show>
          <Show when={!props.gameState.region}>
            <p>Click a region below or press Enter for EU</p>
          </Show>
        </div>

        <div class="instructions">
          <p>🌍 Choose your preferred server region</p>
          <p>This affects latency and available features</p>
        </div>
      </div>
    </div>
  );
};

const MainMenuOverlay: Component<{ gameState: GameState }> = props => {
  return (
    <div class="main-menu-overlay">
      <div class="main-menu-ui">
        <h2>Main Menu</h2>

        <div class="player-info">
          <Show when={props.gameState.player_name}>
            <p class="welcome">Welcome back, {props.gameState.player_name}!</p>
          </Show>

          <Show when={props.gameState.region}>
            <p class="region">Region: {props.gameState.region}</p>
          </Show>
        </div>

        <div class="menu-actions">
          <p>🎮 Click the Start Game button to enter the world</p>
          <p>⌨️ Or press Enter to begin immediately</p>
        </div>
      </div>
    </div>
  );
};

const GameHUDOverlay: Component<{ gameState: GameState }> = props => {
  return (
    <div class="game-hud-overlay">
      <div class="hud-elements">
        {/* Top HUD */}
        <div class="top-hud">
          <div class="player-stats">
            <Show when={props.gameState.player_name}>
              <span class="player-name">{props.gameState.player_name}</span>
            </Show>
            <span class="coordinates">
              Position: ({Math.round(props.gameState.player_position[0])},{' '}
              {Math.round(props.gameState.player_position[1])})
            </span>
          </div>
        </div>

        {/* Bottom HUD */}
        <div class="bottom-hud">
          <div class="controls-hint">
            <div class="control-group">
              <span class="key">WASD</span>
              <span class="action">Move</span>
            </div>
            <div class="control-group">
              <span class="key">I</span>
              <span class="action">Inventory</span>
            </div>
            <div class="control-group">
              <span class="key">T</span>
              <span class="action">Shop</span>
            </div>
            <div class="control-group">
              <span class="key">H</span>
              <span class="action">Help</span>
            </div>
          </div>
        </div>

        {/* Side panels placeholder */}
        <div class="side-panels">
          <div class="minimap-placeholder">
            <p>🗺️ Minimap</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryOverlay: Component<{ gameState: GameState }> = () => {
  return (
    <div class="inventory-overlay modal-overlay">
      <div class="inventory-panel modal-panel">
        <div class="modal-header">
          <h3>🎒 Inventory</h3>
          <p class="close-hint">Press ESC to close</p>
        </div>

        <div class="inventory-content">
          <div class="inventory-grid">
            <div class="item-slot">
              <div class="item">🧪 Health Potion x3</div>
            </div>
            <div class="item-slot">
              <div class="item">⚔️ Magic Sword</div>
            </div>
            <div class="item-slot">
              <div class="item">🛡️ Iron Shield</div>
            </div>
            <div class="item-slot empty">
              <div class="item-placeholder">Empty</div>
            </div>
            <div class="item-slot empty">
              <div class="item-placeholder">Empty</div>
            </div>
            <div class="item-slot empty">
              <div class="item-placeholder">Empty</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopOverlay: Component<{ gameState: GameState }> = () => {
  return (
    <div class="shop-overlay modal-overlay">
      <div class="shop-panel modal-panel">
        <div class="modal-header">
          <h3>🏪 Shop</h3>
          <p class="close-hint">Press ESC to close</p>
        </div>

        <div class="shop-content">
          <div class="player-gold">
            <span class="gold-amount">💰 Gold: 750</span>
          </div>

          <div class="shop-items">
            <div class="shop-item">
              <span class="item-name">🧪 Health Potion</span>
              <span class="item-price">50g</span>
            </div>
            <div class="shop-item">
              <span class="item-name">📜 Magic Scroll</span>
              <span class="item-price">100g</span>
            </div>
            <div class="shop-item">
              <span class="item-name">🛡️ Steel Armor</span>
              <span class="item-price">500g</span>
            </div>
            <div class="shop-item">
              <span class="item-name">💍 Enchanted Ring</span>
              <span class="item-price">1000g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HelpModalOverlay: Component<{ gameState: GameState }> = () => {
  return (
    <div class="help-overlay modal-overlay">
      <div class="help-panel modal-panel">
        <div class="modal-header">
          <h3>❓ Help & Controls</h3>
          <p class="close-hint">Press ESC to close</p>
        </div>

        <div class="help-content">
          <div class="help-section">
            <h4>Movement</h4>
            <ul>
              <li>
                <strong>WASD</strong> or <strong>Arrow Keys</strong> - Move your
                character
              </li>
            </ul>
          </div>

          <div class="help-section">
            <h4>UI Controls</h4>
            <ul>
              <li>
                <strong>I</strong> - Toggle Inventory
              </li>
              <li>
                <strong>T</strong> - Toggle Shop
              </li>
              <li>
                <strong>H</strong> or <strong>F1</strong> - Toggle Help
              </li>
              <li>
                <strong>ESC</strong> - Go back/Close panels
              </li>
            </ul>
          </div>

          <div class="help-section">
            <h4>Mouse/Touch</h4>
            <ul>
              <li>
                <strong>Click</strong> - Interact with UI elements
              </li>
              <li>
                <strong>Tap</strong> - Mobile device interaction
              </li>
            </ul>
          </div>

          <div class="help-section">
            <h4>Game Flow</h4>
            <ul>
              <li>
                Start at the <strong>Login Screen</strong>
              </li>
              <li>
                Select your preferred <strong>Region</strong>
              </li>
              <li>
                Navigate through the <strong>Main Menu</strong>
              </li>
              <li>
                Enter the <strong>Game World</strong> and explore!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;
