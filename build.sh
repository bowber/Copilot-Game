#!/bin/bash
# Build script for the complete Copilot Game project

set -e

echo "🎮 Building Copilot Game..."

# Build the Rust WASM game engine
echo "🦀 Building Rust game engine..."
cd game
wasm-pack build --target web --out-dir pkg
echo "✅ Rust build complete"

# Copy WASM files to UI public directory
echo "📦 Copying WASM files to UI..."
cd ../ui
cp ../game/pkg/* public/
echo "✅ WASM files copied"

# Build the SolidJS frontend
echo "⚡ Building SolidJS frontend..."
npm run build
echo "✅ Frontend build complete"

echo "🚀 Build complete! Check ui/dist/ for the production build."