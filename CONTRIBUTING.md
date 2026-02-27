# Contributing to AllYourTypes

Thank you for your interest in contributing to **AllYourTypes**! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9

### Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/TypeYourImage.git
cd AllYourTypes

# 3. Install dependencies
pnpm install

# 4. Start the dev server
pnpm dev
```

The app opens at `http://localhost:5174`.

### Available Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `pnpm dev`           | Start development server           |
| `pnpm build`         | Production build (typecheck + Vite)|
| `pnpm preview`       | Serve production build locally     |
| `pnpm lint`          | Run ESLint                         |
| `pnpm lint:fix`      | Run ESLint with auto-fix           |
| `pnpm typecheck`     | TypeScript type checking           |
| `pnpm format`        | Format code with Prettier          |
| `pnpm format:check`  | Check formatting without changes   |

## Development Workflow

### Branch Strategy

We follow the **Git Flow** model:

```
main              ← Production (deployed to allurtypes.veinpal.com)
├── develop       ← Integration branch
│   ├── feat/*    ← New features
│   ├── fix/*     ← Bug fixes
│   ├── refactor/* ← Code restructuring
│   ├── chore/*   ← Dependencies/tooling
│   ├── ci/*      ← CI/CD changes
│   └── docs/*    ← Documentation
└── release/x.y.z ← Release preparation
```

1. **Create** a feature branch from `develop`: `git checkout -b feat/my-feature develop`
2. **Work** on your changes, committing frequently
3. **Open a PR** from your branch into `develop`
4. **CI runs** automatically (lint, typecheck, build, security)
5. After review and approval, the PR is merged into `develop`

### Conventional Commits

All commits **must** follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add AVIF output support
fix: handle SVG viewBox dimensions correctly
refactor: extract conversion pipeline
chore: update dependencies
ci: add security scanning
docs: improve API documentation
test: add converter unit tests
perf: optimize canvas memory usage
```

## Coding Standards

### TypeScript

- **No `any`** — use proper types, generics, or `unknown` with type guards.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use `readonly` on properties that should never be mutated.

### React

- Functional components only.
- Prefer `useMemo` / `useCallback` for expensive computations and stable references.
- Keep components focused — one responsibility per component.

### Styling

- Tailwind CSS utility-first approach.
- Keep class strings readable — break long ones across multiple lines.

### File Organization

- Keep files small and focused (200–400 lines typical, 800 max).
- Functions under 50 lines — extract helpers when exceeding.
- No deep nesting (>4 levels — use early returns).

### Imports

- Group imports: external deps → local modules.
- Use absolute paths where configured.

## Submitting a Pull Request

### Before Submitting

- [ ] All checks pass locally:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm build
  ```
- [ ] Code is formatted: `pnpm format`
- [ ] Commit messages follow Conventional Commits
- [ ] PR description explains **what** and **why**
- [ ] No secrets or sensitive data in code
- [ ] Screenshots included for UI changes

### PR Process

1. Fill out the PR template completely.
2. Link related issues (e.g., `Closes #42`).
3. Request a review from a maintainer.
4. Address review feedback promptly.
5. Once approved and CI passes, the PR will be merged.

## Reporting Bugs

Use the [Bug Report](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=bug_report.yml) template. Include:

- Browser and OS version
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable

## Requesting Features

Use the [Feature Request](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=feature_request.yml) template. Describe:

- The problem you're trying to solve
- Your proposed solution
- Alternatives you've considered

## Need Help?

- Check [existing issues](https://github.com/YosrBennagra/TypeYourImage/issues)
- Open a [Discussion](https://github.com/YosrBennagra/TypeYourImage/discussions) for questions

---

Thank you for helping make AllYourTypes better! 🎉
