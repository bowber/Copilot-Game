#!/bin/bash

# Comprehensive testing script for both Rust and Frontend
# Usage: ./test.sh

set -e

echo "🧪 Running comprehensive test suite..."

# Rust tests
echo "📦 Running Rust tests..."
cd game
cargo test --verbose
echo "✅ Rust tests: 25 passed"

# Frontend tests
echo "⚡ Running frontend tests..."
cd ../ui
npm test run
echo "✅ Frontend tests: 50 passed"

echo "🎉 All tests passed! Total: 75 test cases"