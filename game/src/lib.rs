use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{console, CanvasRenderingContext2d, HtmlCanvasElement, window};

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

        console::log_1(&format!("Game initialized: {}x{}", width, height).into());

        Ok(Game {
            canvas,
            ctx,
            ball_x: width / 2.0,
            ball_y: height / 2.0,
            ball_dx: 3.0,
            ball_dy: 2.0,
            width,
            height,
        })
    }

    #[wasm_bindgen]
    pub fn update(&mut self) {
        // Update ball position
        self.ball_x += self.ball_dx;
        self.ball_y += self.ball_dy;

        // Bounce off walls
        if self.ball_x <= 25.0 || self.ball_x >= self.width - 25.0 {
            self.ball_dx = -self.ball_dx;
        }
        if self.ball_y <= 25.0 || self.ball_y >= self.height - 25.0 {
            self.ball_dy = -self.ball_dy;
        }

        // Keep ball in bounds
        self.ball_x = self.ball_x.clamp(25.0, self.width - 25.0);
        self.ball_y = self.ball_y.clamp(25.0, self.height - 25.0);
    }

    #[wasm_bindgen]
    pub fn render(&self) {
        // Clear canvas
        self.ctx.clear_rect(0.0, 0.0, self.width, self.height);
        
        // Set background
        self.ctx.set_fill_style(&"#1e1e1e".into());
        self.ctx.fill_rect(0.0, 0.0, self.width, self.height);

        // Draw ball
        self.ctx.begin_path();
        self.ctx.set_fill_style(&"#4fc3f7".into());
        self.ctx.arc(self.ball_x, self.ball_y, 25.0, 0.0, 2.0 * std::f64::consts::PI).unwrap();
        self.ctx.fill();

        // Draw title
        self.ctx.set_fill_style(&"white".into());
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
