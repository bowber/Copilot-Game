#!/bin/bash
# Development script for the Copilot Game project

set -e

echo "🎮 Starting Copilot Game development environment..."

# Build the Rust WASM game engine
echo "🦀 Building Rust game engine..."
cd game
wasm-pack build --target web --out-dir pkg
echo "✅ Rust build complete"

# Copy WASM files to UI public directory
echo "📦 Copying WASM files to UI..."
cd ../ui
cp ../game/pkg/* public/

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "⚡ Starting development server..."
echo "🌐 Open http://localhost:3000 in your browser"
npm run dev