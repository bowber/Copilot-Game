# GitHub Pages Deployment Setup

This document provides information about the automated GitHub Pages deployment for the Copilot Game project.

## Overview

The repository now includes automated deployment to GitHub Pages that:
- Triggers on every push to the `main` branch
- Builds the complete application (Rust WASM + SolidJS frontend)
- Deploys to GitHub Pages at: https://bowber.github.io/Copilot-Game/

## Workflow Details

### File: `.github/workflows/deploy.yml`

The deployment workflow includes:

1. **Build Job**:
   - Sets up Rust toolchain with WASM target
   - Sets up Node.js environment
   - Caches dependencies for faster builds
   - Builds WASM in release mode for optimal size
   - Builds SolidJS frontend with production optimizations
   - Uploads build artifacts for deployment

2. **Deploy Job**:
   - Uses GitHub's official deployment action
   - Deploys the `ui/dist/` directory to GitHub Pages
   - Requires the build job to complete successfully

### Required Permissions

The workflow has the necessary permissions:
- `contents: read` - To read repository content
- `pages: write` - To deploy to GitHub Pages
- `id-token: write` - For GitHub's OIDC authentication

## Manual Setup Required

To enable this deployment, a repository maintainer needs to:

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Set Source to "GitHub Actions"
   - Save the configuration

2. **Verify Workflow Permissions**:
   - Go to repository Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is selected
   - Verify that "Read and write permissions" are enabled for GITHUB_TOKEN

## Build Process

The deployment builds:
- **Rust WASM**: Optimized release build (~63KB)
- **SolidJS Frontend**: Production build with minification
- **Static Assets**: All necessary files for web deployment

### Output Structure
```
ui/dist/
├── index.html              # Main application entry
├── assets/                 # CSS and JS bundles
├── game_bg.wasm           # Compiled Rust game engine
├── game.js                # WASM bindings
├── .nojekyll              # GitHub Pages configuration
└── other assets...
```

## Monitoring

- **Status Badge**: [![Deploy](https://github.com/bowber/Copilot-Game/actions/workflows/deploy.yml/badge.svg)](https://github.com/bowber/Copilot-Game/actions/workflows/deploy.yml)
- **Workflow Runs**: Check the Actions tab for deployment status
- **Live Demo**: https://bowber.github.io/Copilot-Game/

## Troubleshooting

### Common Issues

1. **Workflow fails on first run**:
   - Ensure GitHub Pages is enabled in repository settings
   - Check that the repository has the correct permissions

2. **WASM loading errors**:
   - The `.nojekyll` file prevents Jekyll processing
   - GitHub Pages should serve WASM files with correct MIME types

3. **Build failures**:
   - Check that all dependencies are correctly specified
   - Ensure the workflow has access to required caches

### Build Size Monitoring

The workflow monitors build sizes:
- WASM file should be < 100KB for optimal loading
- Frontend bundle includes size reporting
- Deployment includes compression (gzip) metrics

## Security

- Uses GitHub's official actions only
- No external dependencies or third-party deployment services
- Follows GitHub's security best practices for OIDC authentication