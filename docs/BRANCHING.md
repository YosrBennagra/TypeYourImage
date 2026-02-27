# Branching & Deployment Strategy

## Branch Structure

```
main              ← Production. Protected. Triggers deploy to tyimage.veinpal.com
├── develop       ← Integration branch. Features merge here first.
│   ├── feat/*    ← New features
│   ├── fix/*     ← Bug fixes
│   ├── refactor/* ← Restructuring
│   ├── chore/*   ← Dependencies/tooling
│   ├── ci/*      ← CI/CD changes
│   └── docs/*    ← Documentation
└── release/x.y.z ← Release prep (cut from develop)
```

## Flow

1. Create feature branch from `develop`: `feat/my-feature`
2. Work on feature, push commits
3. Open PR: `feat/my-feature` → `develop`
4. CI runs (lint, typecheck, build, security)
5. Merge to `develop` after review
6. When ready to release: cut `release/x.y.z` from `develop`
7. Open PR: `release/x.y.z` → `main`
8. Merge triggers deploy to **tyimage.veinpal.com**
9. Release workflow creates GitHub Release + tag
10. Back-merge PR auto-created: `main` → `develop`

## Conventional Commits

```
feat:      New feature
fix:       Bug fix
refactor:  Code restructuring
chore:     Dependencies, tooling
ci:        CI/CD changes
docs:      Documentation
test:      Tests
perf:      Performance improvement
```

## AI Agent Rules

- **ONLY push to the current feature branch** — never merge, never create PRs
- **NEVER push directly to `main` or `develop`**
- **Verify before pushing**: `pnpm lint` → `pnpm typecheck` → `pnpm build`

## Environments

| Environment | Branch   | URL                        | Auto-Deploy |
| ----------- | -------- | -------------------------- | ----------- |
| Development | `feat/*` | `localhost:5174`           | No          |
| Preview     | `feat/*` | Vercel preview URL         | Yes         |
| Staging     | develop  | Vercel preview URL         | Yes         |
| Production  | main     | `https://tyimage.veinpal.com`  | Yes         |

## Required GitHub Secrets

| Secret             | Description                       |
| ------------------ | --------------------------------- |
| `VERCEL_TOKEN`     | Vercel API token                  |
| `VERCEL_ORG_ID`    | Vercel organization ID            |
| `VERCEL_PROJECT_ID`| Vercel project ID for TypeYourImage |
