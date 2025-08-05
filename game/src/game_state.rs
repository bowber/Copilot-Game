use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Represents the different screens/states of the RPG game
/// Now simplified to only include the game HUD and modal overlays
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum GameScreen {
    GameHUD,
    Inventory,
    Shop,
    HelpModal,
}

/// Available regions for server selection
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum Region {
    EU,
    Asia,
    Vietnam,
}

/// Core game state that manages the entire game flow
#[derive(Debug, Clone)]
pub struct GameState {
    pub current_screen: GameScreen,
    pub selected_region: Option<Region>,
    pub player_name: Option<String>,
    pub is_loading: bool,
    pub error_message: Option<String>,
    // Game world state (for when in GameHUD)
    pub player_x: f64,
    pub player_y: f64,
    pub world_width: f64,
    pub world_height: f64,
    // Legacy ball physics (keeping for backward compatibility)
    pub ball_x: f64,
    pub ball_y: f64,
    pub ball_dx: f64,
    pub ball_dy: f64,
}

impl GameState {
    pub fn new(width: f64, height: f64) -> Self {
        Self {
            current_screen: GameScreen::GameHUD, // Start directly in game
            selected_region: Some(Region::EU), // Default region
            player_name: Some("Player".to_string()), // Default player name
            is_loading: false,
            error_message: None,
            player_x: width / 2.0,
            player_y: height / 2.0,
            world_width: width,
            world_height: height,
            // Initialize legacy ball physics for compatibility
            ball_x: width / 2.0,
            ball_y: height / 2.0,
            ball_dx: 3.0,
            ball_dy: 2.0,
        }
    }

    /// Transition to a new screen
    pub fn transition_to(&mut self, screen: GameScreen) {
        self.current_screen = screen;
        self.error_message = None;
    }

    /// Set the selected region for multiplayer
    pub fn set_region(&mut self, region: Region) {
        self.selected_region = Some(region);
    }

    /// Set player name (from login screen)
    pub fn set_player_name(&mut self, name: String) {
        self.player_name = Some(name);
    }

    /// Set loading state
    pub fn set_loading(&mut self, loading: bool) {
        self.is_loading = loading;
    }

    /// Set error message
    pub fn set_error(&mut self, message: String) {
        self.error_message = Some(message);
    }

    /// Clear error message
    pub fn clear_error(&mut self) {
        self.error_message = None;
    }

    /// Update player position (for movement in game world)
    pub fn move_player(&mut self, dx: f64, dy: f64) {
        // Player can always move when game is active
        self.player_x = (self.player_x + dx).clamp(0.0, self.world_width);
        self.player_y = (self.player_y + dy).clamp(0.0, self.world_height);
    }

    /// Reset to initial state
    pub fn reset(&mut self) {
        self.current_screen = GameScreen::GameHUD; // Reset to game HUD
        self.selected_region = Some(Region::EU); // Keep default region
        self.player_name = Some("Player".to_string()); // Keep default name
        self.is_loading = false;
        self.error_message = None;
        self.player_x = self.world_width / 2.0;
        self.player_y = self.world_height / 2.0;
        // Reset legacy ball physics
        self.ball_x = self.world_width / 2.0;
        self.ball_y = self.world_height / 2.0;
        self.ball_dx = 3.0;
        self.ball_dy = 2.0;
    }

    /// Legacy ball physics update (for backward compatibility)
    pub fn update_ball_physics(&mut self) {
        const BALL_RADIUS: f64 = 25.0;

        // Update ball position
        self.ball_x += self.ball_dx;
        self.ball_y += self.ball_dy;

        // Bounce off walls
        if self.ball_x <= BALL_RADIUS || self.ball_x >= self.world_width - BALL_RADIUS {
            self.ball_dx = -self.ball_dx;
        }
        if self.ball_y <= BALL_RADIUS || self.ball_y >= self.world_height - BALL_RADIUS {
            self.ball_dy = -self.ball_dy;
        }

        // Keep ball in bounds
        self.ball_x = self
            .ball_x
            .clamp(BALL_RADIUS, self.world_width - BALL_RADIUS);
        self.ball_y = self
            .ball_y
            .clamp(BALL_RADIUS, self.world_height - BALL_RADIUS);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_game_state_initialization() {
        let state = GameState::new(800.0, 600.0);

        assert_eq!(state.current_screen, GameScreen::GameHUD);
        assert_eq!(state.selected_region, Some(Region::EU));
        assert_eq!(state.player_name, Some("Player".to_string()));
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

        state.transition_to(GameScreen::Inventory);
        assert_eq!(state.current_screen, GameScreen::Inventory);

        state.transition_to(GameScreen::Shop);
        assert_eq!(state.current_screen, GameScreen::Shop);

        state.transition_to(GameScreen::GameHUD);
        assert_eq!(state.current_screen, GameScreen::GameHUD);

        state.transition_to(GameScreen::HelpModal);
        assert_eq!(state.current_screen, GameScreen::HelpModal);
    }

    #[test]
    fn test_region_selection() {
        let mut state = GameState::new(800.0, 600.0);

        state.set_region(Region::EU);
        assert_eq!(state.selected_region, Some(Region::EU));

        state.set_region(Region::Asia);
        assert_eq!(state.selected_region, Some(Region::Asia));
    }

    #[test]
    fn test_player_movement() {
        let mut state = GameState::new(800.0, 600.0);

        // Player should always be able to move
        let initial_x = state.player_x;
        let initial_y = state.player_y;

        state.move_player(10.0, -5.0);
        assert_eq!(state.player_x, initial_x + 10.0);
        assert_eq!(state.player_y, initial_y - 5.0);

        // Movement should be clamped to world boundaries
        state.move_player(-1000.0, -1000.0);
        assert_eq!(state.player_x, 0.0);
        assert_eq!(state.player_y, 0.0);

        state.move_player(2000.0, 2000.0);
        assert_eq!(state.player_x, 800.0);
        assert_eq!(state.player_y, 600.0);
    }

    #[test]
    fn test_movement_in_modal_screens() {
        let mut state = GameState::new(800.0, 600.0);

        // Movement should work even when in modal screens (overlay game)
        state.transition_to(GameScreen::Inventory);
        let initial_x = state.player_x;
        let initial_y = state.player_y;

        state.move_player(10.0, -5.0);
        assert_eq!(state.player_x, initial_x + 10.0); // Should change
        assert_eq!(state.player_y, initial_y - 5.0); // Should change
    }

    #[test]
    fn test_error_handling() {
        let mut state = GameState::new(800.0, 600.0);

        state.set_error("Test error".to_string());
        assert_eq!(state.error_message, Some("Test error".to_string()));

        state.clear_error();
        assert_eq!(state.error_message, None);

        // Transitioning should clear errors
        state.set_error("Another error".to_string());
        state.transition_to(GameScreen::Shop);
        assert_eq!(state.error_message, None);
    }

    #[test]
    fn test_reset() {
        let mut state = GameState::new(800.0, 600.0);

        // Modify state
        state.transition_to(GameScreen::Inventory);
        state.set_region(Region::Asia);
        state.set_player_name("TestPlayer".to_string());
        state.set_loading(true);
        state.set_error("Test error".to_string());
        state.move_player(100.0, 50.0);

        // Reset should restore initial state
        state.reset();

        assert_eq!(state.current_screen, GameScreen::GameHUD);
        assert_eq!(state.selected_region, Some(Region::EU));
        assert_eq!(state.player_name, Some("Player".to_string()));
        assert!(!state.is_loading);
        assert_eq!(state.error_message, None);
        assert_eq!(state.player_x, 400.0);
        assert_eq!(state.player_y, 300.0);
    }

    #[test]
    fn test_ball_physics_compatibility() {
        let mut state = GameState::new(800.0, 600.0);
        let initial_x = state.ball_x;
        let initial_y = state.ball_y;

        state.update_ball_physics();

        // Ball should have moved
        assert_ne!(state.ball_x, initial_x);
        assert_ne!(state.ball_y, initial_y);
    }
}
