import { Component, Show } from 'solid-js';
import { GameState, GameScreen, InputManager } from './GameTypes';
import MobileControls from './MobileControls';
import {
  LoginScreen,
  ServerSelectionScreen,
  MainMenuScreen,
  GameHUDScreen,
  InventoryScreen,
  ShopScreen,
  HelpScreen,
} from './GameScreens';
import './MobileControls.css';
import './GameScreens.css';

// UI Components for each game screen
export const GameUI: Component<{
  gameState: GameState | null;
  currentScreen: GameScreen | null;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  canvasSize: { width: number; height: number };
  inputManager?: InputManager | null;
  isMobile?: boolean;
  gameInstance: any; // EnhancedGameInstance
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
        <ScreenSelector
          screen={props.currentScreen!}
          gameState={props.gameState!}
          gameInstance={props.gameInstance}
        />
      </Show>

      {/* Mobile Controls - only show on GameHUD screen when mobile */}
      <Show when={props.isMobile && props.currentScreen === 'GameHUD'}>
        <MobileControls inputManager={props.inputManager || null} show={true} />
      </Show>
    </div>
  );
};

const ScreenSelector: Component<{
  screen: GameScreen;
  gameState: GameState;
  gameInstance: any;
}> = props => {
  const screenProps = {
    gameState: props.gameState,
    currentScreen: props.screen,
    gameInstance: props.gameInstance,
  };

  // Debug logging
  console.log('ScreenSelector rendering with screen:', props.screen);
  console.log('Screen type:', typeof props.screen);

  return (
    <>
      <Show when={props.screen === 'LoginScreen'}>
        <LoginScreen {...screenProps} />
      </Show>

      <Show when={props.screen === 'ServerSelection'}>
        <ServerSelectionScreen {...screenProps} />
      </Show>

      <Show when={props.screen === 'MainMenu'}>
        <MainMenuScreen {...screenProps} />
      </Show>

      <Show when={props.screen === 'GameHUD'}>
        <GameHUDScreen {...screenProps} />
      </Show>

      <Show when={props.screen === 'Inventory'}>
        <InventoryScreen {...screenProps} />
      </Show>

      <Show when={props.screen === 'Shop'}>
        <ShopScreen {...screenProps} />
      </Show>

      <Show when={props.screen === 'HelpModal'}>
        <HelpScreen {...screenProps} />
      </Show>
    </>
  );
};

export default GameUI;
