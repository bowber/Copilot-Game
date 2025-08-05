import { Component, Show } from 'solid-js';
import { GameState, GameScreen, EnhancedGameInstance } from './GameTypes';

interface GameScreenProps {
  gameState: GameState | null;
  currentScreen: GameScreen | null;
  gameInstance: EnhancedGameInstance | null;
}

// Game HUD Overlay Component - The main game interface
export const GameHUDScreen: Component<GameScreenProps> = props => {
  const toggleInventory = () => {
    props.gameInstance?.transition_to_screen('Inventory');
  };

  const toggleShop = () => {
    props.gameInstance?.transition_to_screen('Shop');
  };

  const toggleHelp = () => {
    props.gameInstance?.transition_to_screen('HelpModal');
  };

  return (
    <div class="game-screen game-hud-screen">
      {/* Top HUD */}
      <div class="top-hud">
        <div class="player-stats">
          <Show when={props.gameState?.player_name}>
            <span class="player-name">👤 {props.gameState!.player_name}</span>
          </Show>
          <Show when={props.gameState?.player_position}>
            <span class="coordinates">
              📍 Position: ({Math.round(props.gameState!.player_position[0])}, {Math.round(props.gameState!.player_position[1])})
            </span>
          </Show>
        </div>
        
        <div class="game-info">
          <span class="level">Level 1</span>
          <div class="health-bar">
            <div class="health-fill" style={{ width: '80%' }}></div>
            <span class="health-text">HP: 80/100</span>
          </div>
        </div>
      </div>

      {/* Side HUD */}
      <div class="side-hud">
        <button class="hud-btn inventory-btn" onClick={toggleInventory} title="Inventory (I)">
          🎒
        </button>
        <button class="hud-btn shop-btn" onClick={toggleShop} title="Shop (T)">
          🏪
        </button>
        <button class="hud-btn help-btn" onClick={toggleHelp} title="Help (H)">
          ❓
        </button>
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
        
        <div class="action-bar">
          <div class="action-slot">🗡️</div>
          <div class="action-slot">🛡️</div>
          <div class="action-slot">🧪</div>
          <div class="action-slot empty"></div>
        </div>
      </div>

      {/* Minimap */}
      <div class="minimap">
        <div class="minimap-content">
          🗺️ Minimap
          <div class="player-dot"></div>
        </div>
      </div>
    </div>
  );
};

// Inventory Modal Component
export const InventoryScreen: Component<GameScreenProps> = props => {
  const closeInventory = () => {
    props.gameInstance?.transition_to_screen('GameHUD');
  };

  return (
    <div class="game-screen inventory-screen">
      <div class="modal-overlay" onClick={closeInventory}>
        <div class="modal-panel inventory-panel" onClick={(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>🎒 Inventory</h3>
            <button class="close-btn" onClick={closeInventory}>✕</button>
          </div>

          <div class="inventory-content">
            <div class="inventory-tabs">
              <button class="tab active">All Items</button>
              <button class="tab">Weapons</button>
              <button class="tab">Armor</button>
              <button class="tab">Consumables</button>
            </div>

            <div class="inventory-grid">
              <div class="item-slot">
                <div class="item">
                  <span class="item-icon">🧪</span>
                  <span class="item-name">Health Potion</span>
                  <span class="item-count">x3</span>
                </div>
              </div>
              <div class="item-slot">
                <div class="item">
                  <span class="item-icon">⚔️</span>
                  <span class="item-name">Magic Sword</span>
                  <span class="item-count">x1</span>
                </div>
              </div>
              <div class="item-slot">
                <div class="item">
                  <span class="item-icon">🛡️</span>
                  <span class="item-name">Iron Shield</span>
                  <span class="item-count">x1</span>
                </div>
              </div>
              {Array.from({ length: 9 }, () => (
                <div class="item-slot empty">
                  <div class="item-placeholder">Empty</div>
                </div>
              ))}
            </div>
          </div>

          <div class="modal-footer">
            <p class="help-text">Press ESC or click outside to close</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Shop Modal Component
export const ShopScreen: Component<GameScreenProps> = props => {
  const closeShop = () => {
    props.gameInstance?.transition_to_screen('GameHUD');
  };

  return (
    <div class="game-screen shop-screen">
      <div class="modal-overlay" onClick={closeShop}>
        <div class="modal-panel shop-panel" onClick={(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>🏪 Shop</h3>
            <button class="close-btn" onClick={closeShop}>✕</button>
          </div>

          <div class="shop-content">
            <div class="player-gold">
              <span class="gold-amount">💰 Gold: 750</span>
            </div>

            <div class="shop-categories">
              <button class="category active">⚔️ Weapons</button>
              <button class="category">🛡️ Armor</button>
              <button class="category">🧪 Potions</button>
              <button class="category">📜 Scrolls</button>
            </div>

            <div class="shop-items">
              <div class="shop-item">
                <div class="item-info">
                  <span class="item-icon">🧪</span>
                  <div class="item-details">
                    <span class="item-name">Health Potion</span>
                    <span class="item-description">Restores 50 HP</span>
                  </div>
                </div>
                <div class="item-purchase">
                  <span class="item-price">50g</span>
                  <button class="buy-btn">Buy</button>
                </div>
              </div>

              <div class="shop-item">
                <div class="item-info">
                  <span class="item-icon">📜</span>
                  <div class="item-details">
                    <span class="item-name">Magic Scroll</span>
                    <span class="item-description">Casts fireball spell</span>
                  </div>
                </div>
                <div class="item-purchase">
                  <span class="item-price">100g</span>
                  <button class="buy-btn">Buy</button>
                </div>
              </div>

              <div class="shop-item">
                <div class="item-info">
                  <span class="item-icon">🛡️</span>
                  <div class="item-details">
                    <span class="item-name">Steel Armor</span>
                    <span class="item-description">+20 Defense</span>
                  </div>
                </div>
                <div class="item-purchase">
                  <span class="item-price">500g</span>
                  <button class="buy-btn">Buy</button>
                </div>
              </div>

              <div class="shop-item">
                <div class="item-info">
                  <span class="item-icon">💍</span>
                  <div class="item-details">
                    <span class="item-name">Enchanted Ring</span>
                    <span class="item-description">+10% Magic Power</span>
                  </div>
                </div>
                <div class="item-purchase">
                  <span class="item-price">1000g</span>
                  <button class="buy-btn disabled">Not enough gold</button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <p class="help-text">Press ESC or click outside to close</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Help Modal Component
export const HelpScreen: Component<GameScreenProps> = props => {
  const closeHelp = () => {
    props.gameInstance?.transition_to_screen('GameHUD');
  };

  return (
    <div class="game-screen help-screen">
      <div class="modal-overlay" onClick={closeHelp}>
        <div class="modal-panel help-panel" onClick={(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>❓ Help & Controls</h3>
            <button class="close-btn" onClick={closeHelp}>✕</button>
          </div>

          <div class="help-content">
            <div class="help-section">
              <h4>🎮 Movement</h4>
              <ul>
                <li><strong>WASD</strong> or <strong>Arrow Keys</strong> - Move your character</li>
                <li><strong>Mouse</strong> - Look around (planned)</li>
              </ul>
            </div>

            <div class="help-section">
              <h4>🎯 UI Controls</h4>
              <ul>
                <li><strong>I</strong> - Toggle Inventory</li>
                <li><strong>T</strong> - Toggle Shop</li>
                <li><strong>H</strong> or <strong>F1</strong> - Toggle Help</li>
                <li><strong>ESC</strong> - Go back/Close panels</li>
              </ul>
            </div>

            <div class="help-section">
              <h4>📱 Mouse/Touch</h4>
              <ul>
                <li><strong>Click</strong> - Interact with UI elements</li>
                <li><strong>Tap</strong> - Mobile device interaction</li>
                <li><strong>Drag</strong> - Move items (planned)</li>
              </ul>
            </div>

            <div class="help-section">
              <h4>🗺️ Game Flow</h4>
              <ul>
                <li>Start at the <strong>Login Screen</strong></li>
                <li>Select your preferred <strong>Region</strong></li>
                <li>Navigate through the <strong>Main Menu</strong></li>
                <li>Enter the <strong>Game World</strong> and explore!</li>
              </ul>
            </div>

            <div class="help-section">
              <h4>⭐ Tips</h4>
              <ul>
                <li>Keep an eye on your health bar</li>
                <li>Visit the shop to upgrade your equipment</li>
                <li>Manage your inventory wisely</li>
                <li>Explore the world to find treasures</li>
              </ul>
            </div>
          </div>

          <div class="modal-footer">
            <p class="help-text">Press ESC or click outside to close</p>
          </div>
        </div>
      </div>
    </div>
  );
};