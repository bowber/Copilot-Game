#![allow(deprecated)]
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{console, window, CanvasRenderingContext2d, HtmlCanvasElement};

mod game_state;
mod input;

pub use game_state::{GameScreen, GameState, Region};
pub use input::{InputEvent, InputHandler, InputState};

// Re-export for backward compatibility
pub use game_state::GameState as LegacyGameState;

// Ball physics constants (kept for backward compatibility)
pub const BALL_RADIUS: f64 = 25.0;
pub const DEFAULT_BALL_SPEED_X: f64 = 3.0;
pub const DEFAULT_BALL_SPEED_Y: f64 = 2.0;

// Enhanced Game structure with RPG state management
#[wasm_bindgen]
pub struct Game {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    state: GameState,
    input_handler: InputHandler,
    width: f64,
    height: f64,
}

// Legacy game state structure (kept for backward compatibility)
#[derive(Debug, Clone)]
pub struct LegacyBallState {
    pub ball_x: f64,
    pub ball_y: f64,
    pub ball_dx: f64,
    pub ball_dy: f64,
    pub width: f64,
    pub height: f64,
}

impl LegacyBallState {
    pub fn new(width: f64, height: f64) -> Self {
        Self {
            ball_x: width / 2.0,
            ball_y: height / 2.0,
            ball_dx: DEFAULT_BALL_SPEED_X,
            ball_dy: DEFAULT_BALL_SPEED_Y,
            width,
            height,
        }
    }

    pub fn update(&mut self) {
        // Update ball position
        self.ball_x += self.ball_dx;
        self.ball_y += self.ball_dy;

        // Bounce off walls
        if self.ball_x <= BALL_RADIUS || self.ball_x >= self.width - BALL_RADIUS {
            self.ball_dx = -self.ball_dx;
        }
        if self.ball_y <= BALL_RADIUS || self.ball_y >= self.height - BALL_RADIUS {
            self.ball_dy = -self.ball_dy;
        }

        // Keep ball in bounds
        self.ball_x = self.ball_x.clamp(BALL_RADIUS, self.width - BALL_RADIUS);
        self.ball_y = self.ball_y.clamp(BALL_RADIUS, self.height - BALL_RADIUS);
    }

    pub fn set_velocity(&mut self, dx: f64, dy: f64) {
        self.ball_dx = dx;
        self.ball_dy = dy;
    }

    pub fn reset(&mut self) {
        self.ball_x = self.width / 2.0;
        self.ball_y = self.height / 2.0;
        self.ball_dx = DEFAULT_BALL_SPEED_X;
        self.ball_dy = DEFAULT_BALL_SPEED_Y;
    }
}

#[wasm_bindgen]
impl Game {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_id: &str) -> Result<Game, JsValue> {
        console_error_panic_hook::set_once();

        let window = window().ok_or("no global `window` exists")?;
        let document = window
            .document()
            .ok_or("should have a document on window")?;
        let canvas = document
            .get_element_by_id(canvas_id)
            .ok_or("should have a canvas element")?
            .dyn_into::<HtmlCanvasElement>()?;

        let ctx = canvas
            .get_context("2d")?
            .ok_or("should have a 2d context")?
            .dyn_into::<CanvasRenderingContext2d>()?;

        let width = canvas.width() as f64;
        let height = canvas.height() as f64;

        console::log_1(&format!("RPG Game initialized: {width}x{height}").into());

        Ok(Game {
            canvas,
            ctx,
            state: GameState::new(width, height),
            input_handler: InputHandler::new(),
            width,
            height,
        })
    }

    #[wasm_bindgen]
    pub fn update(&mut self) {
        // Process continuous input (movement)
        let (dx, dy) = self.input_handler.get_movement_delta();
        if dx != 0.0 || dy != 0.0 {
            self.state.move_player(dx, dy);
        }

        // Update legacy ball physics for backward compatibility
        if self.state.current_screen == GameScreen::GameHUD {
            self.state.update_ball_physics();
        }
    }

    #[wasm_bindgen]
    #[allow(deprecated)] // TODO: Update to use new fill_style API when stable
    pub fn render(&self) {
        // Clear canvas
        self.ctx.clear_rect(0.0, 0.0, self.width, self.height);

        // Only render game world elements (no UI)
        match self.state.current_screen {
            GameScreen::GameHUD => self.render_game_world(),
            _ => {
                // For non-game screens, just clear the canvas and let SolidJS handle UI
                self.render_background();
            }
        }
    }

    /// Handle input events from the frontend
    #[wasm_bindgen]
    pub fn handle_input(&mut self, event_type: &str, data: &str) -> bool {
        match event_type {
            "keydown" => {
                if let Some(input_event) = self.input_handler.handle_key_down(data) {
                    self.process_input_event(input_event)
                } else {
                    false
                }
            }
            "keyup" => {
                self.input_handler.handle_key_up(data);
                false
            }
            "mouseclick" => {
                if let Ok(coords) = serde_json::from_str::<(f64, f64)>(data) {
                    let input_event = self.input_handler.handle_mouse_click(coords.0, coords.1);
                    self.process_input_event(input_event)
                } else {
                    console::log_1(&format!("Failed to parse mouse coordinates: {data}").into());
                    false
                }
            }
            "touch" | "touchstart" => {
                // Handle both touch and touchstart events the same way
                if let Ok(coords) = serde_json::from_str::<(f64, f64)>(data) {
                    let input_event = self.input_handler.handle_touch(coords.0, coords.1);
                    self.process_input_event(input_event)
                } else {
                    console::log_1(&format!("Failed to parse touch coordinates: {data}").into());
                    false
                }
            }
            "touchend" => {
                // TouchEnd doesn't need coordinate processing, just acknowledge it
                console::log_1(&"Touch ended".into());
                false
            }
            _ => {
                console::log_1(&format!("Unknown input event type: {event_type}").into());
                false
            }
        }
    }

    /// Get current game screen for the frontend
    #[wasm_bindgen]
    pub fn get_current_screen(&self) -> String {
        format!("{:?}", self.state.current_screen)
    }

    /// Get current game state as JSON for the frontend
    #[wasm_bindgen]
    pub fn get_game_state(&self) -> String {
        serde_json::to_string(&serde_json::json!({
            "screen": format!("{:?}", self.state.current_screen),
            "region": self.state.selected_region.as_ref().map(|r| format!("{r:?}")),
            "player_name": self.state.player_name,
            "is_loading": self.state.is_loading,
            "error": self.state.error_message,
            "player_position": [self.state.player_x, self.state.player_y],
            "ball_position": [self.state.ball_x, self.state.ball_y]
        }))
        .unwrap_or_default()
    }

    #[wasm_bindgen]
    pub fn resize(&mut self, width: u32, height: u32) {
        self.width = width as f64;
        self.height = height as f64;
        self.canvas.set_width(width);
        self.canvas.set_height(height);

        // Update game state dimensions
        self.state.world_width = self.width;
        self.state.world_height = self.height;
    }

    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.state.reset();
    }

    // Legacy compatibility methods
    #[wasm_bindgen]
    pub fn get_ball_position(&self) -> Vec<f64> {
        vec![self.state.ball_x, self.state.ball_y]
    }

    #[wasm_bindgen]
    pub fn get_ball_velocity(&self) -> Vec<f64> {
        vec![self.state.ball_dx, self.state.ball_dy]
    }

    /// Transition to a specific screen (called from SolidJS)
    #[wasm_bindgen]
    pub fn transition_to_screen(&mut self, screen: &str) {
        let game_screen = match screen {
            "LoginScreen" => GameScreen::LoginScreen,
            "ServerSelection" => GameScreen::ServerSelection,
            "MainMenu" => GameScreen::MainMenu,
            "GameHUD" => GameScreen::GameHUD,
            "Inventory" => GameScreen::Inventory,
            "Shop" => GameScreen::Shop,
            "HelpModal" => GameScreen::HelpModal,
            _ => return, // Invalid screen, ignore
        };
        self.state.transition_to(game_screen);
    }

    /// Set player name (called from SolidJS)
    #[wasm_bindgen]
    pub fn set_player_name(&mut self, name: &str) {
        self.state.set_player_name(name.to_string());
    }

    /// Set selected region (called from SolidJS)
    #[wasm_bindgen]
    pub fn set_region(&mut self, region: &str) {
        let game_region = match region {
            "EU" => Region::EU,
            "Asia" => Region::Asia,
            "Vietnam" => Region::Vietnam,
            _ => return, // Invalid region, ignore
        };
        self.state.set_region(game_region);
    }

    /// Get player position for UI display
    #[wasm_bindgen]
    pub fn get_player_position(&self) -> Vec<f64> {
        vec![self.state.player_x, self.state.player_y]
    }

    /// Check if player is moving (for UI indicators)
    #[wasm_bindgen]
    pub fn is_player_moving(&self) -> bool {
        self.input_handler.is_moving()
    }
}

impl Game {
    /// Process input events and update game state accordingly
    fn process_input_event(&mut self, event: InputEvent) -> bool {
        match (&self.state.current_screen, event) {
            // Login Screen
            (GameScreen::LoginScreen, InputEvent::Enter) => {
                self.state.set_player_name("Player".to_string());
                self.state.transition_to(GameScreen::ServerSelection);
                true
            }
            (GameScreen::LoginScreen, InputEvent::MouseClick { .. }) => {
                self.state.set_player_name("Player".to_string());
                self.state.transition_to(GameScreen::ServerSelection);
                true
            }
            (GameScreen::LoginScreen, InputEvent::TouchTap { .. }) => {
                self.state.set_player_name("Player".to_string());
                self.state.transition_to(GameScreen::ServerSelection);
                true
            }

            // Server Selection
            (GameScreen::ServerSelection, InputEvent::Enter) => {
                if self.state.selected_region.is_none() {
                    self.state.set_region(Region::EU); // Default to EU
                }
                self.state.transition_to(GameScreen::MainMenu);
                true
            }
            (GameScreen::ServerSelection, InputEvent::MouseClick { x: _, y }) => {
                // Simple region selection based on click position
                let region = if y < self.height / 3.0 {
                    Region::EU
                } else if y < 2.0 * self.height / 3.0 {
                    Region::Asia
                } else {
                    Region::Vietnam
                };
                self.state.set_region(region);
                self.state.transition_to(GameScreen::MainMenu);
                true
            }
            (GameScreen::ServerSelection, InputEvent::TouchTap { x: _, y }) => {
                // Simple region selection based on touch position (same logic as mouse)
                let region = if y < self.height / 3.0 {
                    Region::EU
                } else if y < 2.0 * self.height / 3.0 {
                    Region::Asia
                } else {
                    Region::Vietnam
                };
                self.state.set_region(region);
                self.state.transition_to(GameScreen::MainMenu);
                true
            }

            // Main Menu
            (GameScreen::MainMenu, InputEvent::Enter) => {
                self.state.transition_to(GameScreen::GameHUD);
                true
            }
            (GameScreen::MainMenu, InputEvent::MouseClick { .. }) => {
                self.state.transition_to(GameScreen::GameHUD);
                true
            }
            (GameScreen::MainMenu, InputEvent::TouchTap { .. }) => {
                self.state.transition_to(GameScreen::GameHUD);
                true
            }

            // Game HUD - movement and UI toggles
            (GameScreen::GameHUD, InputEvent::ToggleInventory) => {
                self.state.transition_to(GameScreen::Inventory);
                true
            }
            (GameScreen::GameHUD, InputEvent::ToggleShop) => {
                self.state.transition_to(GameScreen::Shop);
                true
            }
            (GameScreen::GameHUD, InputEvent::ToggleHelp) => {
                self.state.transition_to(GameScreen::HelpModal);
                true
            }

            // Inventory, Shop, Help Modal - go back to game
            (
                GameScreen::Inventory | GameScreen::Shop | GameScreen::HelpModal,
                InputEvent::Escape,
            ) => {
                self.state.transition_to(GameScreen::GameHUD);
                true
            }
            (
                GameScreen::Inventory | GameScreen::Shop | GameScreen::HelpModal,
                InputEvent::MenuBack,
            ) => {
                self.state.transition_to(GameScreen::GameHUD);
                true
            }

            // Global escape handling
            (_, InputEvent::Escape) => {
                match self.state.current_screen {
                    GameScreen::LoginScreen => false, // Can't escape from login
                    GameScreen::ServerSelection => {
                        self.state.transition_to(GameScreen::LoginScreen);
                        true
                    }
                    GameScreen::MainMenu => {
                        self.state.transition_to(GameScreen::ServerSelection);
                        true
                    }
                    GameScreen::GameHUD => false, // Stay in game
                    _ => {
                        self.state.transition_to(GameScreen::GameHUD);
                        true
                    }
                }
            }

            _ => false, // Unhandled event
        }
    }

    /// Render basic background for non-game screens
    fn render_background(&self) {
        // Set a basic background color
        self.ctx.set_fill_style(&JsValue::from_str("#1e1e1e"));
        self.ctx.fill_rect(0.0, 0.0, self.width, self.height);
    }

    /// Render only the game world elements (ball, player, etc.) - no UI
    fn render_game_world(&self) {
        // Set background
        self.ctx.set_fill_style(&JsValue::from_str("#1e1e1e"));
        self.ctx.fill_rect(0.0, 0.0, self.width, self.height);

        // Draw bouncing ball (legacy compatibility)
        self.ctx.begin_path();
        self.ctx.set_fill_style(&JsValue::from_str("#4fc3f7"));
        self.ctx
            .arc(
                self.state.ball_x,
                self.state.ball_y,
                BALL_RADIUS,
                0.0,
                2.0 * std::f64::consts::PI,
            )
            .unwrap();
        self.ctx.fill();

        // Draw player character
        self.ctx.begin_path();
        self.ctx.set_fill_style(&JsValue::from_str("#ff6b6b"));
        self.ctx
            .arc(
                self.state.player_x,
                self.state.player_y,
                15.0,
                0.0,
                2.0 * std::f64::consts::PI,
            )
            .unwrap();
        self.ctx.fill();
    }
}

// Initialize the game
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    console::log_1(&"WASM Game loaded!".into());
}

// Export the Game for use in JavaScript
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn start_game(canvas_id: &str) -> Result<Game, JsValue> {
    Game::new(canvas_id)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_legacy_game_state_initialization() {
        let state = LegacyBallState::new(800.0, 600.0);

        // Ball should start at center
        assert_eq!(state.ball_x, 400.0);
        assert_eq!(state.ball_y, 300.0);

        // Ball should have default velocity
        assert_eq!(state.ball_dx, DEFAULT_BALL_SPEED_X);
        assert_eq!(state.ball_dy, DEFAULT_BALL_SPEED_Y);

        // Dimensions should be set correctly
        assert_eq!(state.width, 800.0);
        assert_eq!(state.height, 600.0);
    }

    #[test]
    fn test_legacy_ball_movement() {
        let mut state = LegacyBallState::new(800.0, 600.0);
        let initial_x = state.ball_x;
        let initial_y = state.ball_y;

        state.update();

        // Ball should have moved by velocity amount
        assert_eq!(state.ball_x, initial_x + DEFAULT_BALL_SPEED_X);
        assert_eq!(state.ball_y, initial_y + DEFAULT_BALL_SPEED_Y);
    }

    #[test]
    fn test_new_game_state_initialization() {
        let state = GameState::new(800.0, 600.0);

        assert_eq!(state.current_screen, GameScreen::LoginScreen);
        assert_eq!(state.selected_region, None);
        assert_eq!(state.player_name, None);
        assert!(!state.is_loading);
        assert_eq!(state.error_message, None);
        assert_eq!(state.player_x, 400.0);
        assert_eq!(state.player_y, 300.0);
        assert_eq!(state.world_width, 800.0);
        assert_eq!(state.world_height, 600.0);
    }

    #[test]
    fn test_screen_transitions() {
        let mut state = GameState::new(800.0, 600.0);

        state.transition_to(GameScreen::ServerSelection);
        assert_eq!(state.current_screen, GameScreen::ServerSelection);

        state.transition_to(GameScreen::MainMenu);
        assert_eq!(state.current_screen, GameScreen::MainMenu);

        state.transition_to(GameScreen::GameHUD);
        assert_eq!(state.current_screen, GameScreen::GameHUD);
    }

    #[test]
    fn test_player_movement() {
        let mut state = GameState::new(800.0, 600.0);

        // Movement should only work in GameHUD screen
        state.transition_to(GameScreen::GameHUD);
        let initial_x = state.player_x;
        let initial_y = state.player_y;

        state.move_player(10.0, -5.0);
        assert_eq!(state.player_x, initial_x + 10.0);
        assert_eq!(state.player_y, initial_y - 5.0);
    }

    #[test]
    fn test_input_handler() {
        let mut handler = InputHandler::new();

        assert_eq!(handler.handle_key_down("KeyW"), Some(InputEvent::MoveUp));
        assert_eq!(
            handler.handle_key_down("KeyI"),
            Some(InputEvent::ToggleInventory)
        );
        assert_eq!(handler.handle_key_down("Enter"), Some(InputEvent::Enter));

        assert!(handler.is_moving());
        handler.handle_key_up("KeyW");
        assert!(!handler.is_moving());
    }

    #[test]
    fn test_constants() {
        assert_eq!(BALL_RADIUS, 25.0);
        assert_eq!(DEFAULT_BALL_SPEED_X, 3.0);
        assert_eq!(DEFAULT_BALL_SPEED_Y, 2.0);
    }

    #[test]
    fn test_legacy_ball_physics() {
        let mut state = LegacyBallState::new(800.0, 600.0);
        let initial_x = state.ball_x;
        let initial_y = state.ball_y;

        state.update();

        // Ball should have moved
        assert_ne!(state.ball_x, initial_x);
        assert_ne!(state.ball_y, initial_y);
    }
}
