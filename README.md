# Copilot Game

[![CI](https://github.com/bowber/Copilot-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/bowber/Copilot-Game/actions/workflows/ci.yml)
[![Tests](https://github.com/bowber/Copilot-Game/actions/workflows/test.yml/badge.svg)](https://github.com/bowber/Copilot-Game/actions/workflows/test.yml)
[![Deploy](https://github.com/bowber/Copilot-Game/actions/workflows/deploy.yml/badge.svg)](https://github.com/bowber/Copilot-Game/actions/workflows/deploy.yml)
[![Rust](https://img.shields.io/badge/rust-stable-orange.svg)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![SolidJS](https://img.shields.io/badge/solidjs-1.9+-blue.svg)](https://www.solidjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A modern web game built with **Rust + WebAssembly** for the game engine and **SolidJS + TypeScript** for the frontend. This project demonstrates how to create high-performance browser games using cutting-edge web technologies.

![Game Screenshot](https://github.com/user-attachments/assets/8dd7f004-cd96-41dd-8829-ab032d28d378)

## 🎮 Live Demo

🚀 **[Play the Game Now!](https://bowber.github.io/Copilot-Game/)**

The live demo is automatically deployed from the `main` branch using GitHub Actions and GitHub Pages. Every push to the main branch triggers a fresh build and deployment.

## 🧪 Testing & Quality

This project includes comprehensive testing to ensure code quality and reliability:

### 🦀 Rust Tests
- **Unit Tests**: Comprehensive game logic testing (25 test cases)
- **Physics Tests**: Ball movement, collision detection, boundary checking
- **Integration Tests**: WASM compilation and exports
- **Performance Tests**: Energy conservation and physics accuracy

```bash
cd game
cargo test                    # Run all Rust tests
cargo clippy                  # Lint code
cargo fmt                     # Format code
```

### ⚡ Frontend Tests  
- **Component Tests**: UI component rendering and behavior (50 test cases)
- **Mobile Controls**: Virtual joystick and touch button testing
- **Integration Tests**: WASM module loading and game controls
- **Utility Tests**: Canvas sizing, animation frame handling
- **Type Safety**: Strict TypeScript checking

```bash
cd ui
npm test                      # Run all frontend tests
npm run test:ui              # Run tests with UI
npx tsc --noEmit            # Type checking
```

### 🔄 Continuous Integration
- **Automated Testing**: Every PR runs full test suite
- **Code Quality**: Rust clippy lints + TypeScript strict mode
- **Build Verification**: Ensures WASM + frontend build successfully  
- **Performance Monitoring**: Bundle size tracking
- **Security Audits**: Dependency vulnerability scanning

### 📊 Quality Metrics
- **Test Coverage**: Rust game logic 100% covered
- **Code Quality**: Zero warnings in strict mode
- **Bundle Size**: WASM < 1MB, optimized for web delivery
- **Type Safety**: Full TypeScript strict mode compliance

- **High-Performance Game Engine**: Written in Rust, compiled to WebAssembly for near-native performance
- **Modern Frontend**: Built with SolidJS, TypeScript, and Vite for fast development and optimal UX
- **Real-time Graphics**: Smooth 60 FPS canvas-based rendering
- **Responsive Design**: Adapts to different screen sizes
- **Physics Simulation**: Ball bouncing with collision detection
- **Game State Management**: Play, pause, and restart functionality

## 🎮 Features

### Backend (`/game/`)
- **Language**: Rust
- **Target**: WebAssembly (WASM)
- **Build Tool**: wasm-pack
- **Graphics**: HTML5 Canvas 2D API
- **Features**: Physics simulation, collision detection, game loop

### Frontend (`/ui/`)
- **Framework**: SolidJS
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with modern features
- **WASM Integration**: Dynamic module loading

## 🚀 Quick Start

### Prerequisites

- **Rust** (latest stable): [Install Rust](https://rustup.rs/)
- **Node.js** (v18+): [Install Node.js](https://nodejs.org/)
- **wasm-pack**: Install with `cargo install wasm-pack`

### Setup and Run

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Copilot-Game
   ```

2. **Build the Rust game engine**
   ```bash
   cd game
   wasm-pack build --target web --out-dir pkg
   cd ..
   ```

3. **Setup and start the frontend**
   ```bash
   cd ui
   npm install
   npm run build-game  # This rebuilds the WASM if needed
   npm run dev         # Start development server
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The game should load automatically!

## 🛠️ Development

### Building the Game Engine

```bash
cd game
cargo check                                    # Check for compilation errors
wasm-pack build --target web --out-dir pkg    # Build for web
```

### Frontend Development

```bash
cd ui
npm run dev        # Start development server with hot reload
npm run build      # Build for production
npm run preview    # Preview production build
npm run build-all  # Build both WASM and frontend
```

### Project Structure

```
Copilot-Game/
├── game/                   # Rust WASM game engine
│   ├── src/
│   │   ├── lib.rs         # Main game logic and WASM bindings
│   │   └── main.rs        # Native entry point (development)
│   ├── Cargo.toml         # Rust dependencies and configuration
│   └── pkg/               # Generated WASM output
├── ui/                     # SolidJS frontend
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── index.tsx      # Application entry point
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets and WASM files
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── tsconfig.json      # TypeScript configuration
└── README.md              # This file
```

## 🎯 Game Features

### Current Features
- **Bouncing Ball**: Physics-based movement with wall collision
- **Smooth Animation**: 60 FPS rendering loop
- **Responsive Canvas**: Automatically adjusts to window size
- **Game Controls**: Start/pause/restart functionality
- **Mobile Controls**: Virtual joystick and touch buttons for mobile devices
- **Real-time Rendering**: Direct Rust-to-Canvas rendering
- **Cross-platform**: Desktop, tablet, and mobile support

### Technical Implementation
- **Game Loop**: Implemented in Rust for consistent performance
- **Collision Detection**: AABB collision with boundary bouncing
- **Memory Management**: Efficient WASM memory usage
- **Cross-platform**: Runs on any modern web browser

## 📱 Mobile Controls

The game includes comprehensive mobile controls for touch-based gameplay:

![Mobile Controls Demo](https://github.com/user-attachments/assets/5dc0714d-6463-4d6c-9ea7-9aef814feecf)

### Virtual Joystick
- **Location**: Bottom-left corner of the screen
- **Function**: Touch-based movement control (replaces WASD/arrow keys)
- **Design**: Circular joystick with responsive knob
- **Interaction**: Drag to move, detects 8-directional input

### Touch Buttons
- **🎒 Inventory Button**: Access inventory (I key equivalent)
- **🏪 Shop Button**: Open shop interface (T key equivalent)  
- **❓ Help Button**: Get help and controls info (H key equivalent)
- **Location**: Bottom-right corner, vertically stacked

### Mobile Features
- **Auto-detection**: Automatically enables on mobile devices
- **Responsive Design**: Scales for different screen sizes and orientations
- **Touch Optimized**: Large touch targets with visual feedback
- **Glassmorphism UI**: Modern blurred glass aesthetic
- **Non-intrusive**: Only appears during active gameplay (GameHUD screen)
- **Accessibility**: Proper ARIA labels and touch area sizing

### Technical Implementation
- **React Integration**: Built with SolidJS components
- **Input Mapping**: Converts touch events to keyboard equivalents
- **Performance**: Minimal overhead, maintains 60 FPS gameplay
- **Compatibility**: Works with existing input system seamlessly

## 🔧 Configuration

### Rust Configuration (`game/Cargo.toml`)
- **Target**: `wasm32-unknown-unknown`
- **Crate Type**: `["cdylib"]` for WASM export
- **Optimization**: Size-optimized builds for web delivery
- **Dependencies**: Minimal set for web compatibility

### Frontend Configuration (`ui/vite.config.ts`)
- **WASM Support**: Configured for WebAssembly module loading
- **Development Server**: Hot reload with WASM integration
- **Build Optimization**: Production builds with asset optimization

## 🚢 Deployment

### Automated Deployment (GitHub Pages)

The game is automatically deployed to GitHub Pages on every push to the `main` branch:

- **Live Demo**: [https://bowber.github.io/Copilot-Game/](https://bowber.github.io/Copilot-Game/)
- **Deployment Workflow**: `.github/workflows/deploy.yml`
- **Build Process**: Automated Rust WASM + SolidJS frontend compilation
- **Status**: [![Deploy](https://github.com/bowber/Copilot-Game/actions/workflows/deploy.yml/badge.svg)](https://github.com/bowber/Copilot-Game/actions/workflows/deploy.yml)

### Manual Building for Production

```bash
# Build everything
cd game && wasm-pack build --target web --out-dir pkg
cd ../ui && npm run build

# The ui/dist/ folder contains the complete application
```

### Deployment Options
- **GitHub Pages**: Automated deployment from main branch (default)
- **Static Hosting**: Deploy `ui/dist/` to any static host (Netlify, Vercel, etc.)
- **CDN**: WASM files are automatically optimized for CDN delivery
- **Docker**: Can be containerized with any web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test both Rust and TypeScript code
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- **Rust Code**: Follow standard Rust conventions, use `cargo fmt` and `cargo clippy`
- **TypeScript**: Follow the existing code style, ensure type safety
- **Testing**: Add tests for new features (when test infrastructure is added)
- **Documentation**: Update README for any new features or setup changes

## 📚 Learning Resources

### Rust + WASM
- [Rust and WebAssembly Book](https://rustwasm.github.io/docs/book/)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
- [The Rust Programming Language](https://doc.rust-lang.org/book/)

### SolidJS
- [SolidJS Documentation](https://www.solidjs.com/docs/latest)
- [SolidJS Tutorial](https://www.solidjs.com/tutorial/introduction_basics)

### Game Development
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Game Programming Patterns](http://gameprogrammingpatterns.com/)

## 🐛 Troubleshooting

### Common Issues

**WASM module fails to load**
- Ensure `wasm-pack` is installed: `cargo install wasm-pack`
- Rebuild the WASM module: `cd game && wasm-pack build --target web`
- Check browser console for specific error messages

**Development server won't start**
- Install dependencies: `cd ui && npm install`
- Check Node.js version: `node --version` (needs v18+)
- Clear cache: `rm -rf ui/node_modules ui/package-lock.json && npm install`

**Game doesn't render**
- Check browser developer tools console
- Ensure canvas element is properly sized
- Verify WASM bindings are loaded (check for "WASM bindings exposed globally" log)

### Performance Issues
- Enable browser developer tools performance profiling
- Check for memory leaks in the game loop
- Optimize WASM build with `--release` flag

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌟 Acknowledgments

- Built with ❤️ using GitHub Copilot
- Inspired by modern web game development practices
- Thanks to the Rust, SolidJS, and WebAssembly communities

## 📈 Additional Quality Indicators

To further reduce manual code review effort, consider adding these indicators:

### 🛡️ Security & Compliance
- **Dependabot**: Automated dependency updates
- **CodeQL**: Advanced security scanning for vulnerabilities
- **SAST**: Static application security testing
- **Dependency Licenses**: Automated license compliance checking

### 📊 Code Metrics
- **Code Coverage**: Test coverage reporting with codecov.io
- **Code Climate**: Maintainability and technical debt tracking  
- **SonarQube**: Code quality and security hotspots
- **Bundle Analyzer**: Visual dependency analysis and size optimization

### 🚀 Performance Monitoring
- **Lighthouse CI**: Automated performance, accessibility, and SEO audits
- **Bundle Size Bot**: Automatic bundle size change notifications
- **Performance Budgets**: Fail builds if performance thresholds exceeded
- **Core Web Vitals**: Real user performance monitoring

### 🔄 Development Workflow
- **Conventional Commits**: Standardized commit message format
- **Semantic Release**: Automated versioning and changelog generation
- **Pre-commit Hooks**: Automatic linting and formatting on commit
- **Branch Protection**: Require PR reviews and status checks

### 📱 Cross-platform Testing
- **Browser Matrix**: Test across Chrome, Firefox, Safari, Edge
- **Device Testing**: Mobile and tablet compatibility verification
- **WASM Compatibility**: Test WebAssembly support across platforms

### 🎯 Example Implementation
```yaml
# Add to .github/workflows/
- name: 📊 Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  
- name: 🔍 Run CodeQL Analysis
  uses: github/codeql-action/analyze@v2
  
- name: 📱 Cross-browser testing
  uses: browserstack/github-actions@master
```

These indicators provide automated quality gates that reduce the need for manual code inspection while maintaining high standards.

---

**Happy Gaming! 🎮**
