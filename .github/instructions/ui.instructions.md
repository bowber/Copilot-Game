# SolidJS Frontend Instructions

## 📍 Location: `/ui/`

This directory contains the SolidJS + TypeScript frontend that interfaces with the Rust WASM game engine.

### 🔧 Key Files
- `package.json` - NPM dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint linting rules
- `.prettierrc` - Code formatting configuration
- `vite.config.ts` - Build tool configuration
- `vitest.config.ts` - Testing framework setup

### 🚀 Development Commands

```bash
cd ui

# Install dependencies
npm install

# Start development server with hot reload
npm run dev                  # Starts on http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test                     # Watch mode
npm test run                 # Single run
npm run test:ui             # Visual test interface
```

### 🧹 Code Quality Commands

```bash
cd ui

# Linting
npm run lint                 # Check for issues
npm run lint:fix            # Auto-fix issues

# Formatting
npm run format              # Format all files
npm run format:check        # Check formatting

# Type checking
npm run type-check          # TypeScript validation
```

### 🧪 Testing

Frontend tests cover UI components and WASM integration:

```bash
# Run all tests (25 test cases)
npm test run

# Specific test patterns
npm test -- --grep "component"
npm test -- --grep "wasm"
npm test -- --grep "utils"

# Coverage report
npm test run -- --coverage

# Debug tests
npm test -- --reporter=verbose
```

### 📋 Mandatory Pre-commit Checks

Before committing any frontend code changes:

```bash
npm run format:check         # Prettier formatting
npm run lint                 # ESLint (max 0 warnings)
npm run type-check          # TypeScript validation
npm test run                # All tests must pass
```

### 🎯 Code Quality Rules

The frontend enforces strict quality standards:

- **ESLint**: Zero warnings policy
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode enabled
- **Testing**: Comprehensive test coverage
- **Performance**: Optimized bundle size

### 📁 Source Structure

```
ui/src/
├── App.tsx              # Main application component
├── components/          # Reusable UI components
│   ├── GameCanvas.tsx   # Canvas wrapper for WASM game
│   ├── GameControls.tsx # Play/pause/restart buttons
│   └── GameInfo.tsx     # Game status and information
├── utils/               # Utility functions
│   ├── wasm-loader.ts   # WASM module loading
│   └── game-state.ts    # Game state management
├── styles/              # CSS and styling
├── tests/               # Test files
└── types/               # TypeScript type definitions
```

### 🔗 WASM Integration

The frontend communicates with the Rust game engine:

```typescript
// Load WASM module
import init, { Game } from '../game/pkg/game.js';

// Initialize game
await init();
const game = new Game();

// Game loop
const update = () => {
  game.update();
  game.render(canvas);
  requestAnimationFrame(update);
};
```

### 🎨 UI Components

Key components:

- **GameCanvas**: Manages HTML5 canvas and WASM rendering
- **GameControls**: Play/pause/restart button controls
- **GameInfo**: Displays game status and performance metrics
- **App**: Main application layout and state management

### 🐛 Common Issues

1. **WASM loading**: Check that game engine built successfully
2. **Type errors**: Run `npm run type-check` for details
3. **Hot reload**: Restart dev server if WASM changes
4. **Test failures**: Check browser console for errors

### 📱 Responsive Design

The UI adapts to different screen sizes:
- Mobile: Touch-friendly controls
- Tablet: Optimized layout
- Desktop: Full feature set

### ⚡ Performance

Frontend optimizations:
- Lazy loading of WASM module
- Efficient rendering loop
- Minimal re-renders with SolidJS reactivity
- Production bundle optimization