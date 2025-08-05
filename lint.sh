#!/bin/bash

# Quick linting script for both Rust and Frontend
# Usage: ./lint.sh [fix]

set -e

echo "🔍 Running linting checks..."

# Rust linting
echo "📦 Checking Rust formatting..."
cd game
cargo fmt --all --check

echo "🔧 Running Rust clippy..."
cargo clippy --all-targets --all-features -- -D warnings

# Frontend linting
echo "⚡ Checking frontend formatting..."
cd ../ui
npm run format:check

echo "🔍 Running ESLint..."
npm run lint

echo "📝 Running TypeScript check..."
npm run type-check

# Optional: fix issues if requested
if [ "$1" = "fix" ]; then
    echo "🛠️  Fixing linting issues..."
    
    echo "📦 Formatting Rust code..."
    cd ../game
    cargo fmt --all
    
    echo "⚡ Formatting frontend code..."
    cd ../ui
    npm run format
    
    echo "🔧 Attempting to fix ESLint issues..."
    npm run lint:fix
    
    echo "✅ Auto-fix complete!"
fi

echo "✅ All linting checks passed!"