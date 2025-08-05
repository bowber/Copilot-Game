# Game Overview

## 1. General Overview

**Game Type:** Role-Playing Game (RPG)

**Platform:** Web (PC-first)

**Rendering Engine:** wgpu (used directly)

**UI Framework:** SolidJS for rendering UI components

**Backend:** Planned for future (e.g., multiplayer, persistence)

## 2. User Interface (UI)

### Main Screens

- **Login Screen:** (temporary stub, backend auth coming later)
- **Server Selection:** Regions include EU, ASIA, VIETNAM
- **Main Menu**
- **Game HUD:** Displays player health, minimap, active abilities, etc.
- **Inventory Screen**
- **Shop Screen**
- **Modals**
  - **Help Modal:** Explains controls and basic tutorial

### UI Design

- **Visual Style:** Pixel art (retro-themed)
- **Target Device:** Desktop browsers
- **Mobile Support:** Limited (basic layout scaling and touch interaction)

## 3. Game Flow

- **Launch Game:** Shows fake login screen
- **Server Selection:** User picks from available regions
- **Enter Game World:** Assets load and player enters game map
- **Gameplay:** Real-time input, access to inventory/shop/help

## 4. Controls & Input

- **Input Devices:** Keyboard, Mouse, Touch

### Control Mapping:

- **WASD or Arrow Keys:** Movement
- **Mouse:** UI interaction, targeting
- **Touch:** Tap/drag (basic only)

**Planned Features:** Unified input event abstraction to support cross-input handling

## 5. Frontend Architecture

### Core Rendering with wgpu

- Uses wgpu directly for GPU rendering
- Custom pipelines for:
  - Tilemaps
  - Sprites
  - Pixel-perfect scaling
- Integrates winit for windowing and input
- Manages own game loop and ECS-like logic (or a custom scheduler)

### UI Layer with SolidJS

- HTML/CSS overlays rendered separately
- UI events sent to Rust backend via:
  - wasm_bindgen
  - JS glue code
  - Channels (e.g., tokio::sync::mpsc)
- Event-driven interaction from UI to game core (e.g., button click = command event)

### Architecture Diagram

```
+---------------------+       +-----------------------+
|  SolidJS UI Layer   | <---> |  Rust + wgpu Backend  |
+---------------------+       +-----------------------+
          |                              |
    HTML + JS                     ECS / Game Logic
          |                              |
  wasm_bindgen / Channels        wgpu Render Pipeline
```

## 6. Networking (Planned)

- Multiplayer backend not yet implemented
- Future integration:
  - Region-based server discovery
  - Player accounts / persistence
  - Real-time WebSocket or QUIC communication

## 7. Assets

### Sources

- **Icons & Images:** https://game-icons.net/
- **Sounds:** https://freesound.org/
- **Fonts:** https://fonts.google.com/