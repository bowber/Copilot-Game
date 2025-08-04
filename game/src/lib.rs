use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{console, CanvasRenderingContext2d, HtmlCanvasElement, window};

// Ball physics constants
pub const BALL_RADIUS: f64 = 25.0;
pub const DEFAULT_BALL_SPEED_X: f64 = 3.0;
pub const DEFAULT_BALL_SPEED_Y: f64 = 2.0;

// Game state
#[wasm_bindgen]
pub struct Game {
    canvas: HtmlCanvasElement,
    ctx: CanvasRenderingContext2d,
    ball_x: f64,
    ball_y: f64,
    ball_dx: f64,
    ball_dy: f64,
    width: f64,
    height: f64,
}

// Core game logic (separate from WASM bindings for easier testing)
#[derive(Debug, Clone)]
pub struct GameState {
    pub ball_x: f64,
    pub ball_y: f64,
    pub ball_dx: f64,
    pub ball_dy: f64,
    pub width: f64,
    pub height: f64,
}

impl GameState {
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
        let document = window.document().ok_or("should have a document on window")?;
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

        console::log_1(&format!("Game initialized: {width}x{height}").into());

        Ok(Game {
            canvas,
            ctx,
            ball_x: width / 2.0,
            ball_y: height / 2.0,
            ball_dx: DEFAULT_BALL_SPEED_X,
            ball_dy: DEFAULT_BALL_SPEED_Y,
            width,
            height,
        })
    }

    #[wasm_bindgen]
    pub fn update(&mut self) {
        let mut state = GameState {
            ball_x: self.ball_x,
            ball_y: self.ball_y,
            ball_dx: self.ball_dx,
            ball_dy: self.ball_dy,
            width: self.width,
            height: self.height,
        };
        
        state.update();
        
        self.ball_x = state.ball_x;
        self.ball_y = state.ball_y;
        self.ball_dx = state.ball_dx;
        self.ball_dy = state.ball_dy;
    }

    #[wasm_bindgen]
    #[allow(deprecated)] // TODO: Update to use new fill_style API when stable
    pub fn render(&self) {
        // Clear canvas
        self.ctx.clear_rect(0.0, 0.0, self.width, self.height);
        
        // Set background
        self.ctx.set_fill_style(&JsValue::from_str("#1e1e1e"));
        self.ctx.fill_rect(0.0, 0.0, self.width, self.height);

        // Draw ball
        self.ctx.begin_path();
        self.ctx.set_fill_style(&JsValue::from_str("#4fc3f7"));
        self.ctx.arc(self.ball_x, self.ball_y, BALL_RADIUS, 0.0, 2.0 * std::f64::consts::PI).unwrap();
        self.ctx.fill();

        // Draw title
        self.ctx.set_fill_style(&JsValue::from_str("white"));
        self.ctx.set_font("40px Arial");
        self.ctx.set_text_align("center");
        self.ctx.fill_text("Rust Game in Browser!", self.width / 2.0, 50.0).unwrap();
        
        // Draw subtitle
        self.ctx.set_font("20px Arial");
        self.ctx.fill_text("Made with Rust + WASM", self.width / 2.0, 80.0).unwrap();
    }

    #[wasm_bindgen]
    pub fn resize(&mut self, width: u32, height: u32) {
        self.width = width as f64;
        self.height = height as f64;
        self.canvas.set_width(width);
        self.canvas.set_height(height);
    }

    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.ball_x = self.width / 2.0;
        self.ball_y = self.height / 2.0;
        self.ball_dx = DEFAULT_BALL_SPEED_X;
        self.ball_dy = DEFAULT_BALL_SPEED_Y;
    }

    #[wasm_bindgen]
    pub fn get_ball_position(&self) -> Vec<f64> {
        vec![self.ball_x, self.ball_y]
    }

    #[wasm_bindgen]
    pub fn get_ball_velocity(&self) -> Vec<f64> {
        vec![self.ball_dx, self.ball_dy]
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
    fn test_game_state_initialization() {
        let state = GameState::new(800.0, 600.0);
        
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
    fn test_ball_movement() {
        let mut state = GameState::new(800.0, 600.0);
        let initial_x = state.ball_x;
        let initial_y = state.ball_y;
        
        state.update();
        
        // Ball should have moved by velocity amount
        assert_eq!(state.ball_x, initial_x + DEFAULT_BALL_SPEED_X);
        assert_eq!(state.ball_y, initial_y + DEFAULT_BALL_SPEED_Y);
    }

    #[test]
    fn test_left_wall_collision() {
        let mut state = GameState::new(800.0, 600.0);
        
        // Position ball near left wall, moving left
        state.ball_x = BALL_RADIUS + 1.0;
        state.ball_y = 300.0;
        state.ball_dx = -5.0; // Moving left
        state.ball_dy = 2.0;
        
        state.update();
        
        // Ball should bounce off left wall (dx should reverse)
        assert!(state.ball_dx > 0.0, "Ball should bounce right after hitting left wall");
        assert_eq!(state.ball_dx, 5.0); // Should be positive now
        assert_eq!(state.ball_dy, 2.0); // Y velocity unchanged
        assert_eq!(state.ball_x, BALL_RADIUS); // Should be clamped to boundary
    }

    #[test]
    fn test_right_wall_collision() {
        let mut state = GameState::new(800.0, 600.0);
        
        // Position ball near right wall, moving right
        state.ball_x = 800.0 - BALL_RADIUS - 1.0;
        state.ball_y = 300.0;
        state.ball_dx = 5.0; // Moving right
        state.ball_dy = 2.0;
        
        state.update();
        
        // Ball should bounce off right wall (dx should reverse)
        assert!(state.ball_dx < 0.0, "Ball should bounce left after hitting right wall");
        assert_eq!(state.ball_dx, -5.0); // Should be negative now
        assert_eq!(state.ball_dy, 2.0); // Y velocity unchanged
        assert_eq!(state.ball_x, 800.0 - BALL_RADIUS); // Should be clamped to boundary
    }

    #[test]
    fn test_top_wall_collision() {
        let mut state = GameState::new(800.0, 600.0);
        
        // Position ball near top wall, moving up
        state.ball_x = 400.0;
        state.ball_y = BALL_RADIUS + 1.0;
        state.ball_dx = 3.0;
        state.ball_dy = -5.0; // Moving up
        
        state.update();
        
        // Ball should bounce off top wall (dy should reverse)
        assert!(state.ball_dy > 0.0, "Ball should bounce down after hitting top wall");
        assert_eq!(state.ball_dx, 3.0); // X velocity unchanged
        assert_eq!(state.ball_dy, 5.0); // Should be positive now
        assert_eq!(state.ball_y, BALL_RADIUS); // Should be clamped to boundary
    }

    #[test]
    fn test_bottom_wall_collision() {
        let mut state = GameState::new(800.0, 600.0);
        
        // Position ball near bottom wall, moving down
        state.ball_x = 400.0;
        state.ball_y = 600.0 - BALL_RADIUS - 1.0;
        state.ball_dx = 3.0;
        state.ball_dy = 5.0; // Moving down
        
        state.update();
        
        // Ball should bounce off bottom wall (dy should reverse)
        assert!(state.ball_dy < 0.0, "Ball should bounce up after hitting bottom wall");
        assert_eq!(state.ball_dx, 3.0); // X velocity unchanged
        assert_eq!(state.ball_dy, -5.0); // Should be negative now
        assert_eq!(state.ball_y, 600.0 - BALL_RADIUS); // Should be clamped to boundary
    }

    #[test]
    fn test_corner_collision() {
        let mut state = GameState::new(800.0, 600.0);
        
        // Position ball near top-left corner, moving up and left
        state.ball_x = BALL_RADIUS + 1.0;
        state.ball_y = BALL_RADIUS + 1.0;
        state.ball_dx = -5.0; // Moving left
        state.ball_dy = -3.0; // Moving up
        
        state.update();
        
        // Both velocities should reverse
        assert!(state.ball_dx > 0.0, "Ball should bounce right after hitting left wall");
        assert!(state.ball_dy > 0.0, "Ball should bounce down after hitting top wall");
        assert_eq!(state.ball_dx, 5.0);
        assert_eq!(state.ball_dy, 3.0);
    }

    #[test]
    fn test_ball_stays_in_bounds() {
        let mut state = GameState::new(800.0, 600.0);
        
        // Run simulation for many steps
        for _ in 0..1000 {
            state.update();
            
            // Ball should always stay within bounds
            assert!(state.ball_x >= BALL_RADIUS, "Ball X should not go below left boundary");
            assert!(state.ball_x <= 800.0 - BALL_RADIUS, "Ball X should not go beyond right boundary");
            assert!(state.ball_y >= BALL_RADIUS, "Ball Y should not go below top boundary");
            assert!(state.ball_y <= 600.0 - BALL_RADIUS, "Ball Y should not go beyond bottom boundary");
        }
    }

    #[test]
    fn test_set_velocity() {
        let mut state = GameState::new(800.0, 600.0);
        
        state.set_velocity(10.0, -5.0);
        
        assert_eq!(state.ball_dx, 10.0);
        assert_eq!(state.ball_dy, -5.0);
    }

    #[test]
    fn test_reset() {
        let mut state = GameState::new(800.0, 600.0);
        
        // Move ball and change velocity
        state.ball_x = 100.0;
        state.ball_y = 200.0;
        state.ball_dx = 10.0;
        state.ball_dy = -8.0;
        
        state.reset();
        
        // Should be back to initial state
        assert_eq!(state.ball_x, 400.0); // Center X
        assert_eq!(state.ball_y, 300.0); // Center Y
        assert_eq!(state.ball_dx, DEFAULT_BALL_SPEED_X);
        assert_eq!(state.ball_dy, DEFAULT_BALL_SPEED_Y);
    }

    #[test]
    fn test_constants() {
        assert_eq!(BALL_RADIUS, 25.0);
        assert_eq!(DEFAULT_BALL_SPEED_X, 3.0);
        assert_eq!(DEFAULT_BALL_SPEED_Y, 2.0);
    }

    #[test]
    fn test_different_canvas_sizes() {
        // Test with different canvas dimensions
        let test_cases = vec![
            (400.0, 300.0),
            (1024.0, 768.0),
            (1920.0, 1080.0),
            (100.0, 100.0), // Small canvas
        ];
        
        for (width, height) in test_cases {
            let state = GameState::new(width, height);
            
            // Ball should start at center
            assert_eq!(state.ball_x, width / 2.0);
            assert_eq!(state.ball_y, height / 2.0);
            
            // Dimensions should be correct
            assert_eq!(state.width, width);
            assert_eq!(state.height, height);
        }
    }

    #[test]
    fn test_physics_conservation() {
        let mut state = GameState::new(800.0, 600.0);
        
        // Set initial velocity
        let initial_speed = (state.ball_dx.powi(2) + state.ball_dy.powi(2)).sqrt();
        
        // Run simulation and check that speed is conserved after bounces
        for _ in 0..100 {
            state.update();
            let current_speed = (state.ball_dx.powi(2) + state.ball_dy.powi(2)).sqrt();
            
            // Speed should remain constant (energy conservation)
            assert!((current_speed - initial_speed).abs() < 1e-10, 
                    "Speed should be conserved: initial={}, current={}", initial_speed, current_speed);
        }
    }
}
