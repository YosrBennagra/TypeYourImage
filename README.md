<div align="center">

# TypeYourImage

**Free online image format converter - upload, preview, convert, and download.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

[**Live Demo**](https://tyimage.veinpal.com) | [Report Bug](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=bug_report.yml) | [Request Feature](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=feature_request.yml)

</div>

---

## Overview

TypeYourImage converts images between PNG, JPG, WebP, GIF, and BMP formats. **100% client-side** - your files never leave your browser.

### How It Works

1. **Upload** any common image format (PNG, JPG/JPEG, WebP, GIF, SVG, BMP)
2. **Preview** the source image with dimensions and file size
3. **Select** an output format from the visual grid
4. **Adjust** quality for lossy formats (JPG, WebP)
5. **Download** the converted file instantly

## Features

- **Drag and drop** or click to browse
- **Preview** source image with dimensions and file size
- **Visual format selector** with format details
- **Quality slider** for lossy formats (JPG, WebP)
- **Transparency warnings** when converting alpha images to non-alpha formats
- **Convert again** to a different format without re-uploading
- **100% client-side** - images never leave your browser

## Supported Formats

| Format | Input | Output | Transparency | Quality Control |
| --- | --- | --- | --- | --- |
| PNG | Yes | Yes | Yes | No |
| JPG/JPEG | Yes | Yes | No | Yes |
| WebP | Yes | Yes | Yes | Yes |
| GIF | Yes | Yes | Limited | No |
| SVG | Yes | No | Yes | - |
| BMP | Yes | Yes | No | No |

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9

### Installation

`ash
git clone https://github.com/YosrBennagra/TypeYourImage.git
cd TypeYourImage
pnpm install
pnpm dev
`

Opens at http://localhost:5174.

### Production Build

`ash
pnpm build
pnpm preview
`

## Scripts

| Command | Description |
| --- | --- |
| pnpm dev | Start development server |
| pnpm build | Production build |
| pnpm preview | Serve production build locally |
| pnpm lint | Run ESLint |
| pnpm typecheck | TypeScript type checking |
| pnpm format | Format code with Prettier |

## Tech Stack

| Technology | Purpose |
| --- | --- |
| [Vite](https://vite.dev) | Fast dev server and bundler |
| [React 19](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |

## Project Structure

`
TypeYourImage/
+-- src/
|   +-- components/       # React components
|   |   +-- conversion-result.tsx
|   |   +-- drop-zone.tsx
|   |   +-- footer.tsx
|   |   +-- format-notes.tsx
|   |   +-- format-selector.tsx
|   |   +-- image-preview.tsx
|   |   +-- quality-slider.tsx
|   |   +-- step-indicator.tsx
|   +-- lib/              # Utilities
|   |   +-- constants.ts
|   |   +-- converter.ts
|   +-- App.tsx           # Main application
|   +-- index.css         # Global styles
|   +-- main.tsx          # Entry point
+-- index.html            # HTML entry
`

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: git checkout -b feat/my-feature
3. Make your changes
4. Run checks: pnpm lint && pnpm typecheck && pnpm build
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
6. Push and open a Pull Request

## Support

- [GitHub Discussions](https://github.com/YosrBennagra/TypeYourImage/discussions) - Questions
- [Bug Reports](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=bug_report.yml)
- [Feature Requests](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=feature_request.yml)

## Sponsors

- [GitHub Sponsors](https://github.com/sponsors/YosrBennagra)
- [Buy Me a Coffee](https://buymeacoffee.com/veinpal)

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

<div align="center">
Made with love by <a href="https://github.com/YosrBennagra">Veinpal</a>
</div>
