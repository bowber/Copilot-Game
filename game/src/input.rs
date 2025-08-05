use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

/// Input events that the game can handle
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum InputEvent {
    // Keyboard movement (WASD/Arrow keys)
    MoveUp,
    MoveDown,
    MoveLeft,
    MoveRight,
    
    // UI interactions
    MenuSelect,
    MenuBack,
    ToggleInventory,
    ToggleShop,
    ToggleHelp,
    
    // Mouse/Touch events
    MouseClick { x: f64, y: f64 },
    TouchTap { x: f64, y: f64 },
    
    // Special events
    Escape,
    Enter,
}

/// Input state tracking for continuous input (like movement)
#[derive(Debug, Clone, Default)]
pub struct InputState {
    pub move_up: bool,
    pub move_down: bool,
    pub move_left: bool,
    pub move_right: bool,
    pub mouse_x: f64,
    pub mouse_y: f64,
    pub is_mouse_down: bool,
}

/// Input handler that processes browser events into game events
pub struct InputHandler {
    state: InputState,
    movement_speed: f64,
}

impl InputHandler {
    pub fn new() -> Self {
        Self {
            state: InputState::default(),
            movement_speed: 5.0,
        }
    }

    /// Process a key down event
    pub fn handle_key_down(&mut self, key_code: &str) -> Option<InputEvent> {
        match key_code {
            "KeyW" | "ArrowUp" => {
                self.state.move_up = true;
                Some(InputEvent::MoveUp)
            }
            "KeyS" | "ArrowDown" => {
                self.state.move_down = true;
                Some(InputEvent::MoveDown)
            }
            "KeyA" | "ArrowLeft" => {
                self.state.move_left = true;
                Some(InputEvent::MoveLeft)
            }
            "KeyD" | "ArrowRight" => {
                self.state.move_right = true;
                Some(InputEvent::MoveRight)
            }
            "KeyI" => Some(InputEvent::ToggleInventory),
            "KeyT" => Some(InputEvent::ToggleShop),
            "KeyH" | "F1" => Some(InputEvent::ToggleHelp),
            "Enter" => Some(InputEvent::Enter),
            "Escape" => Some(InputEvent::Escape),
            "Space" => Some(InputEvent::MenuSelect),
            _ => None,
        }
    }

    /// Process a key up event
    pub fn handle_key_up(&mut self, key_code: &str) {
        match key_code {
            "KeyW" | "ArrowUp" => self.state.move_up = false,
            "KeyS" | "ArrowDown" => self.state.move_down = false,
            "KeyA" | "ArrowLeft" => self.state.move_left = false,
            "KeyD" | "ArrowRight" => self.state.move_right = false,
            _ => {}
        }
    }

    /// Process a mouse click event
    pub fn handle_mouse_click(&mut self, x: f64, y: f64) -> InputEvent {
        self.state.mouse_x = x;
        self.state.mouse_y = y;
        InputEvent::MouseClick { x, y }
    }

    /// Process a mouse move event
    pub fn handle_mouse_move(&mut self, x: f64, y: f64) {
        self.state.mouse_x = x;
        self.state.mouse_y = y;
    }

    /// Process a mouse down event
    pub fn handle_mouse_down(&mut self, x: f64, y: f64) {
        self.state.is_mouse_down = true;
        self.state.mouse_x = x;
        self.state.mouse_y = y;
    }

    /// Process a mouse up event
    pub fn handle_mouse_up(&mut self, x: f64, y: f64) {
        self.state.is_mouse_down = false;
        self.state.mouse_x = x;
        self.state.mouse_y = y;
    }

    /// Process a touch event
    pub fn handle_touch(&mut self, x: f64, y: f64) -> InputEvent {
        InputEvent::TouchTap { x, y }
    }

    /// Get current movement delta based on input state
    pub fn get_movement_delta(&self) -> (f64, f64) {
        let mut dx = 0.0;
        let mut dy = 0.0;

        if self.state.move_left {
            dx -= self.movement_speed;
        }
        if self.state.move_right {
            dx += self.movement_speed;
        }
        if self.state.move_up {
            dy -= self.movement_speed;
        }
        if self.state.move_down {
            dy += self.movement_speed;
        }

        (dx, dy)
    }

    /// Get current input state
    pub fn get_state(&self) -> &InputState {
        &self.state
    }

    /// Set movement speed
    pub fn set_movement_speed(&mut self, speed: f64) {
        self.movement_speed = speed;
    }

    /// Check if any movement key is pressed
    pub fn is_moving(&self) -> bool {
        self.state.move_up || self.state.move_down || self.state.move_left || self.state.move_right
    }
}

/// Key code mapping for browser compatibility
pub fn normalize_key_code(code: &str) -> String {
    // Handle different browser key code formats
    match code {
        "w" | "W" => "KeyW".to_string(),
        "a" | "A" => "KeyA".to_string(),
        "s" | "S" => "KeyS".to_string(),
        "d" | "D" => "KeyD".to_string(),
        "i" | "I" => "KeyI".to_string(),
        "t" | "T" => "KeyT".to_string(),
        "h" | "H" => "KeyH".to_string(),
        " " => "Space".to_string(),
        other => other.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_input_handler_initialization() {
        let handler = InputHandler::new();
        assert_eq!(handler.movement_speed, 5.0);
        assert!(!handler.is_moving());
    }

    #[test]
    fn test_key_down_events() {
        let mut handler = InputHandler::new();

        assert_eq!(handler.handle_key_down("KeyW"), Some(InputEvent::MoveUp));
        assert_eq!(handler.handle_key_down("KeyS"), Some(InputEvent::MoveDown));
        assert_eq!(handler.handle_key_down("KeyA"), Some(InputEvent::MoveLeft));
        assert_eq!(handler.handle_key_down("KeyD"), Some(InputEvent::MoveRight));
        assert_eq!(handler.handle_key_down("KeyI"), Some(InputEvent::ToggleInventory));
        assert_eq!(handler.handle_key_down("KeyT"), Some(InputEvent::ToggleShop));
        assert_eq!(handler.handle_key_down("KeyH"), Some(InputEvent::ToggleHelp));
        assert_eq!(handler.handle_key_down("Enter"), Some(InputEvent::Enter));
        assert_eq!(handler.handle_key_down("Escape"), Some(InputEvent::Escape));
        assert_eq!(handler.handle_key_down("Space"), Some(InputEvent::MenuSelect));
    }

    #[test]
    fn test_arrow_keys() {
        let mut handler = InputHandler::new();

        assert_eq!(handler.handle_key_down("ArrowUp"), Some(InputEvent::MoveUp));
        assert_eq!(handler.handle_key_down("ArrowDown"), Some(InputEvent::MoveDown));
        assert_eq!(handler.handle_key_down("ArrowLeft"), Some(InputEvent::MoveLeft));
        assert_eq!(handler.handle_key_down("ArrowRight"), Some(InputEvent::MoveRight));
    }

    #[test]
    fn test_movement_state() {
        let mut handler = InputHandler::new();

        assert!(!handler.is_moving());

        handler.handle_key_down("KeyW");
        assert!(handler.is_moving());
        assert!(handler.state.move_up);

        handler.handle_key_up("KeyW");
        assert!(!handler.is_moving());
        assert!(!handler.state.move_up);
    }

    #[test]
    fn test_movement_delta() {
        let mut handler = InputHandler::new();
        
        // No movement initially
        let (dx, dy) = handler.get_movement_delta();
        assert_eq!((dx, dy), (0.0, 0.0));

        // Move up
        handler.handle_key_down("KeyW");
        let (dx, dy) = handler.get_movement_delta();
        assert_eq!((dx, dy), (0.0, -5.0));

        // Move up and right
        handler.handle_key_down("KeyD");
        let (dx, dy) = handler.get_movement_delta();
        assert_eq!((dx, dy), (5.0, -5.0));

        // Stop moving up
        handler.handle_key_up("KeyW");
        let (dx, dy) = handler.get_movement_delta();
        assert_eq!((dx, dy), (5.0, 0.0));
    }

    #[test]
    fn test_mouse_events() {
        let mut handler = InputHandler::new();

        let event = handler.handle_mouse_click(100.0, 200.0);
        assert_eq!(event, InputEvent::MouseClick { x: 100.0, y: 200.0 });
        assert_eq!(handler.state.mouse_x, 100.0);
        assert_eq!(handler.state.mouse_y, 200.0);

        handler.handle_mouse_down(150.0, 250.0);
        assert!(handler.state.is_mouse_down);
        assert_eq!(handler.state.mouse_x, 150.0);
        assert_eq!(handler.state.mouse_y, 250.0);

        handler.handle_mouse_up(160.0, 260.0);
        assert!(!handler.state.is_mouse_down);
        assert_eq!(handler.state.mouse_x, 160.0);
        assert_eq!(handler.state.mouse_y, 260.0);
    }

    #[test]
    fn test_touch_events() {
        let mut handler = InputHandler::new();

        let event = handler.handle_touch(300.0, 400.0);
        assert_eq!(event, InputEvent::TouchTap { x: 300.0, y: 400.0 });
    }

    #[test]
    fn test_movement_speed() {
        let mut handler = InputHandler::new();
        
        handler.set_movement_speed(10.0);
        assert_eq!(handler.movement_speed, 10.0);

        handler.handle_key_down("KeyW");
        let (dx, dy) = handler.get_movement_delta();
        assert_eq!((dx, dy), (0.0, -10.0));
    }

    #[test]
    fn test_key_code_normalization() {
        assert_eq!(normalize_key_code("w"), "KeyW");
        assert_eq!(normalize_key_code("W"), "KeyW");
        assert_eq!(normalize_key_code("a"), "KeyA");
        assert_eq!(normalize_key_code("s"), "KeyS");
        assert_eq!(normalize_key_code("d"), "KeyD");
        assert_eq!(normalize_key_code(" "), "Space");
        assert_eq!(normalize_key_code("Enter"), "Enter");
    }

    #[test]
    fn test_unknown_keys() {
        let mut handler = InputHandler::new();
        
        // Unknown keys should return None
        assert_eq!(handler.handle_key_down("KeyZ"), None);
        assert_eq!(handler.handle_key_down("F2"), None);
    }
}