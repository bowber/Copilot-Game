# Rust Game Engine Instructions

## 📍 Location: `/game/`

This directory contains the Rust game engine that compiles to WebAssembly.

### 🔧 Key Files
- `Cargo.toml` - Package configuration and dependencies
- `src/lib.rs` - Main game logic and WASM exports
- `clippy.toml` - Linting rules for code quality
- `rustfmt.toml` - Code formatting configuration

### 🚀 Development Commands

```bash
cd game

# Build for development (with debug info)
wasm-pack build --target web --out-dir pkg --dev

# Build for production (optimized)
wasm-pack build --target web --out-dir pkg

# Run tests
cargo test --verbose

# Format code
cargo fmt --all

# Lint code
cargo clippy --all-targets --all-features -- -D warnings

# Check without building
cargo check
```

### 🧪 Testing

The game engine includes comprehensive tests:

```bash
# Run all tests
cargo test --verbose

# Run specific test modules
cargo test physics
cargo test collision
cargo test ball

# Run with output
cargo test -- --nocapture
```

### 📋 Mandatory Pre-commit Checks

Before committing any Rust code changes:

```bash
cargo fmt --all --check      # Formatting
cargo clippy --all-targets --all-features -- -D warnings  # Linting
cargo test --verbose         # All tests must pass
```

### 🎯 Code Quality Rules

The game follows strict quality standards:

- **Formatting**: Use `rustfmt.toml` configuration
- **Linting**: All clippy warnings treated as errors
- **Testing**: 100% test coverage for game logic
- **Performance**: Optimized for WASM size and speed

### 🔗 WASM Integration

The engine exports these functions to JavaScript:

- `new()` - Create new game instance
- `update()` - Update game state (called each frame)
- `render()` - Render to canvas
- `toggle_pause()` - Pause/resume game
- `restart()` - Reset game state

### 📁 Source Structure

```
game/src/
├── lib.rs           # Main WASM exports and game struct
├── physics.rs       # Physics calculations and collision detection
├── ball.rs          # Ball entity and movement logic
└── canvas.rs        # Rendering and canvas operations
```

### 🐛 Common Issues

1. **Build failures**: Check that `wasm-pack` is installed
2. **Size issues**: Use `--release` for smaller WASM files
3. **Browser errors**: Check console for WASM loading issues

### 🎮 Game Logic

The engine implements:
- Physics-based ball movement
- Collision detection with boundaries
- Smooth animation at 60 FPS
- State management (play/pause/restart)
- Canvas rendering optimizations