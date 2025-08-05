# CI/CD Pipeline Instructions

## 📍 Location: `.github/workflows/`

This directory contains GitHub Actions workflows for automated testing and quality assurance.

### 🔧 Workflow Files
- `ci.yml` - Fast CI for PR validation
- `test.yml` - Comprehensive testing suite

### 🚀 CI Pipeline (`ci.yml`)

Runs on every PR and push to main:

1. **Setup**: Rust toolchain, Node.js, wasm-pack
2. **Cache**: Cargo registry, NPM packages
3. **Lint**: Rust formatting/clippy, TypeScript checking
4. **Test**: All test suites (Rust + Frontend)
5. **Build**: WASM + Frontend production builds

### 🧪 Test Pipeline (`test.yml`)

Comprehensive quality checks:

1. **Security**: npm audit, dependency scanning
2. **Performance**: Bundle size monitoring
3. **Quality**: Code coverage, type safety
4. **Compatibility**: Cross-platform testing

### 📋 Quality Gates

All checks must pass for PR approval:

- ✅ Rust formatting (`cargo fmt --check`)
- ✅ Rust linting (`cargo clippy`)
- ✅ Rust tests (25 test cases)
- ✅ TypeScript checking
- ✅ Frontend linting (ESLint)
- ✅ Frontend tests (31 test cases)
- ✅ Production builds
- ✅ Security audits

### 🔧 Pipeline Configuration

```yaml
# Example job structure
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          components: clippy, rustfmt
      # ... additional steps
```

### 🚦 Status Checks

Pipeline status is visible on PRs:
- [![CI](https://github.com/bowber/Copilot-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/bowber/Copilot-Game/actions/workflows/ci.yml)
- [![Tests](https://github.com/bowber/Copilot-Game/actions/workflows/test.yml/badge.svg)](https://github.com/bowber/Copilot-Game/actions/workflows/test.yml)

### 🐛 Debugging Pipeline Failures

1. **Rust build failures**: Check cargo dependencies
2. **Frontend build failures**: Check npm dependencies
3. **Test failures**: Review specific test output
4. **Lint failures**: Run linters locally first

### 🔄 Pipeline Optimization

- **Caching**: Dependencies cached for faster runs
- **Concurrency**: Jobs run in parallel where possible
- **Early termination**: Fails fast on critical errors