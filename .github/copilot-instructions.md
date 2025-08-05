# Copilot Game Development Instructions

## 🎯 Quick Start

This repository contains a modern web game built with **Rust + WebAssembly** backend and **SolidJS + TypeScript** frontend.

### Entry Points & Package Locations

| Component | Location | Package Manager | Entry Point |
|-----------|----------|----------------|-------------|
| **Rust Game Engine** | `/game/` | Cargo | `Cargo.toml` |
| **SolidJS Frontend** | `/ui/` | NPM | `package.json` |
| **Root Scripts** | `/` | Shell | `dev.sh`, `build.sh`, `lint.sh`, `test.sh` |

### 🚀 Development Environment Setup

```bash
# Quick development (recommended)
./dev.sh                    # Builds WASM + starts dev server on http://localhost:5173

# Manual development
cd game && wasm-pack build --target web --out-dir pkg
cd ui && npm install && npm run dev

# Production build
./build.sh                  # Creates optimized builds for both components

# Quality assurance (new!)
./lint.sh                   # Run all linting checks
./lint.sh fix              # Run linting + auto-fix issues
./test.sh                   # Run all tests (38 test cases)
```

### 📋 Mandatory Quality Checks

Before any commit, these checks MUST pass:

```bash
# Quick check (recommended)
./lint.sh                   # All linting and formatting checks
./test.sh                   # All test suites

# Manual checks
```

#### Rust (Game Engine)
```bash
cd game
cargo fmt --all --check      # Code formatting
cargo clippy --all-targets --all-features -- -D warnings  # Linting
cargo test --verbose         # Unit tests (13 tests)
```

#### Frontend (UI)
```bash
cd ui
npm run format:check         # Prettier formatting
npm run lint                 # ESLint with max 0 warnings
npm run type-check          # TypeScript type checking
npm test run                # Vitest tests (25 tests)
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   SolidJS UI    │    │  Rust Engine    │
│  (TypeScript)   │◄──►│    (WASM)       │
│                 │    │                 │
│ • Game Controls │    │ • Physics       │
│ • UI Components │    │ • Rendering     │
│ • State Mgmt    │    │ • Collision     │
└─────────────────┘    └─────────────────┘
```

### Key Technologies

- **Rust**: Game logic, physics, compiled to WASM
- **SolidJS**: Reactive UI framework
- **TypeScript**: Type safety for frontend
- **Vite**: Build tool with HMR
- **Vitest**: Frontend testing
- **wasm-pack**: Rust→WASM compilation

## 🔧 Development Workflow

### 1. Environment Setup
```bash
# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack
cargo install wasm-pack

# Install Node.js dependencies
cd ui && npm install
```

### 2. Development Loop
```bash
# Start development server (with hot reload)
./dev.sh

# In another terminal, run tests continuously
cd ui && npm test          # Frontend tests with watch mode
cd game && cargo test      # Rust tests
```

### 3. Quality Assurance
```bash
# Format code
cd game && cargo fmt --all
cd ui && npm run format

# Lint and fix issues
cd game && cargo clippy --all-targets --all-features --fix
cd ui && npm run lint:fix

# Run all tests
cd game && cargo test --verbose
cd ui && npm test run
```

### 4. Build Verification
```bash
# Build everything
./build.sh

# Verify builds work
cd ui && npm run preview   # Test production build
```

## 📁 Project Structure

```
├── .github/
│   ├── workflows/         # CI/CD pipelines
│   └── instructions/      # This documentation
├── game/                  # 🦀 Rust game engine
│   ├── src/lib.rs        # Main game logic
│   ├── Cargo.toml        # Rust dependencies
│   ├── clippy.toml       # Linting configuration
│   └── rustfmt.toml      # Formatting rules
├── ui/                    # ⚡ SolidJS frontend
│   ├── src/              # UI components and logic
│   ├── package.json      # NPM dependencies & scripts
│   ├── .eslintrc.json    # ESLint configuration
│   ├── .prettierrc       # Prettier formatting
│   └── tsconfig.json     # TypeScript configuration
├── dev.sh                # Development startup script
├── build.sh              # Production build script
├── lint.sh               # Code quality checking script
├── test.sh               # Comprehensive testing script
└── README.md             # Project overview
```

## 🧪 Testing Strategy

### Rust Tests (13 test cases)
- **Unit tests**: Core game logic
- **Physics tests**: Collision detection, boundary checks
- **Integration tests**: WASM bindings

```bash
cd game
cargo test --verbose       # Run all tests
cargo test physics        # Run physics-specific tests
cargo test collision      # Run collision tests
```

### Frontend Tests (25 test cases)
- **Component tests**: UI rendering and interaction
- **Integration tests**: WASM communication
- **Utility tests**: Helper functions

```bash
cd ui
npm test                  # Watch mode for development
npm test run             # Single run for CI
npm run test:ui          # Visual test UI
```

## 🚦 CI/CD Pipeline

All PRs automatically run:

1. **Code Quality**: Formatting, linting, type checking
2. **Testing**: Complete test suites for both components  
3. **Build Verification**: Ensure production builds work
4. **Performance**: Bundle size monitoring

### Status Badges
- [![CI](https://github.com/bowber/Copilot-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/bowber/Copilot-Game/actions/workflows/ci.yml)
- [![Tests](https://github.com/bowber/Copilot-Game/actions/workflows/test.yml/badge.svg)](https://github.com/bowber/Copilot-Game/actions/workflows/test.yml)

## 🎮 Game Features

- **Physics Engine**: Ball movement with collision detection
- **Canvas Rendering**: Smooth 60 FPS animation
- **Game Controls**: Play/Pause/Restart functionality
- **Responsive Design**: Adapts to different screen sizes
- **State Management**: Persistent game state across interactions

## 🐛 Debugging

### Common Issues

1. **WASM not loading**: Check that `wasm-pack build` completed successfully
2. **TypeScript errors**: Run `npm run type-check` to see detailed errors
3. **Test failures**: Check browser console for detailed error messages
4. **Build issues**: Ensure all dependencies are installed correctly

### Debug Commands
```bash
# Check WASM build
cd game && wasm-pack build --target web --out-dir pkg --dev

# Debug frontend
cd ui && npm run dev       # Includes source maps

# Verbose testing
cd game && cargo test -- --nocapture --test-threads=1
cd ui && npm test -- --reporter=verbose
```

## 🔗 Resources

- [Rust WASM Book](https://rustwasm.github.io/book/)
- [SolidJS Guide](https://docs.solidjs.com/)
- [wasm-pack Documentation](https://rustwasm.github.io/wasm-pack/)
- [Vite Documentation](https://vitejs.dev/)

## 🔄 Self Improvement

**Important**: Whenever making changes that affect development workflows, project structure, or documentation accuracy, always update the following files to maintain consistency:

- **`.github/copilot-instructions.md`** - This main instruction file
- **`.github/instructions/`** - Specific instruction files for different components:
  - `workflows.instructions.md` - CI/CD pipeline instructions  
  - `ui.instructions.md` - SolidJS frontend instructions
  - `game.instructions.md` - Rust game engine instructions

### When to Update Instructions

Update instruction files when changes affect:
- **Build processes** - Scripts, dependencies, compilation steps
- **Development workflows** - Setup procedures, commands, tools
- **Testing procedures** - Test commands, coverage, new test frameworks
- **Linting rules** - Code quality standards, formatting requirements
- **Project structure** - File organization, directory layout
- **Dependencies** - Package manager files, version requirements
- **Configuration files** - Tooling config, environment setup
- **CI/CD pipelines** - Workflow changes, quality gates

### Update Guidelines

- Keep instructions **accurate** and **up-to-date** with code changes
- Maintain **consistent tone** and formatting across all instruction files
- Update **version numbers** and **command examples** when they change
- Ensure **cross-references** between instruction files remain valid
- Test **commands and procedures** mentioned in updated instructions

---

*This documentation ensures a smooth development experience and maintains code quality standards.*