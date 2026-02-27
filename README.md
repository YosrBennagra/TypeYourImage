<div align="center">

# ⚡ AllYourTypes

**Free online file converter — images, video, and audio. 100% in your browser.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg-WASM-green.svg)](https://ffmpegwasm.netlify.app/)

[**Live Demo**](https://allurtypes.veinpal.com) · [Report Bug](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=bug_report.yml) · [Request Feature](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=feature_request.yml)

</div>

---

## Overview

AllYourTypes converts images, videos, and audio between popular formats — entirely in your browser. Your files **never leave your device**. No uploads, no servers, no accounts.

- **Images** — converted instantly via the Canvas API
- **Video & Audio** — converted via [FFmpeg.wasm](https://ffmpegwasm.netlify.app/), a WebAssembly build of FFmpeg that runs client-side

### How It Works

1. **Choose a category** — Images, Video, or Audio (auto-detected from your file)
2. **Drop or browse** your file
3. **Select** an output format
4. **Adjust quality** for supported formats
5. **Download** the result

## Features

- **Multi-format conversion** — images, video, and audio in one tool
- **Category tabs** — switch between Images / Video / Audio
- **Auto-detection** — file type recognized automatically with smart category switching
- **Drag and drop** or click to browse
- **Live preview** — image thumbnails, video player, audio player
- **Quality control** — adjustable for lossy formats
- **Progress bar** — real-time conversion progress for video and audio
- **Transparency detection** — warnings when converting alpha images to non-alpha formats
- **Convert again** — switch format without re-uploading
- **100% client-side** — nothing leaves your browser
- **No sign-up** — no accounts, no tracking
- **FFmpeg lazy loading** — WASM engine downloaded from CDN on first video/audio use (~30 MB, cached)

## Supported Formats

### 🖼 Images

| Format | Input | Output | Transparency | Quality |
| ------ | ----- | ------ | ------------ | ------- |
| PNG    | ✅    | ✅     | ✅           | —       |
| JPG    | ✅    | ✅     | —            | ✅      |
| WebP   | ✅    | ✅     | ✅           | ✅      |
| GIF    | ✅    | ✅     | Limited      | —       |
| SVG    | ✅    | —      | ✅           | —       |
| BMP    | ✅    | ✅     | —            | —       |

### 🎬 Video

| Format | Output | Codec     | Notes                          |
| ------ | ------ | --------- | ------------------------------ |
| MP4    | ✅     | H.264     | Universal compatibility        |
| WebM   | ✅     | VP8       | Open web-optimized format      |
| GIF    | ✅     | —         | Animated, scaled to 480 px     |
| AVI    | ✅     | H.264     | Classic container format       |

### 🎵 Audio

| Format | Output | Codec      | Notes                     |
| ------ | ------ | ---------- | ------------------------- |
| MP3    | ✅     | LAME       | Universal playback        |
| WAV    | ✅     | PCM 16-bit | Lossless, large files     |
| OGG    | ✅     | Vorbis     | Open format, good quality |
| AAC    | ✅     | AAC        | High quality, small size  |
| FLAC   | ✅     | FLAC       | Lossless compression      |

## Quick Start

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9

### Installation

```bash
git clone https://github.com/YosrBennagra/TypeYourImage.git
cd TypeYourImage
pnpm install
pnpm dev
```

Opens at `http://localhost:5174`.

### Production Build

```bash
pnpm build
pnpm preview
```

## Scripts

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Start development server       |
| `pnpm build`     | Production build               |
| `pnpm preview`   | Serve production build locally |
| `pnpm lint`      | Run ESLint                     |
| `pnpm typecheck` | TypeScript type checking       |
| `pnpm format`    | Format code with Prettier      |

## Tech Stack

| Technology                                         | Purpose                            |
| -------------------------------------------------- | ---------------------------------- |
| [Vite](https://vite.dev)                           | Fast dev server and bundler        |
| [React 19](https://react.dev)                      | UI framework                       |
| [TypeScript](https://www.typescriptlang.org)       | Type safety                        |
| [Tailwind CSS](https://tailwindcss.com)            | Utility-first styling              |
| [FFmpeg.wasm](https://ffmpegwasm.netlify.app/)     | Client-side video & audio engine   |

## Project Structure

```
src/
├── components/
│   ├── category-tabs.tsx       # Image / Video / Audio tab bar
│   ├── conversion-result.tsx   # Download result card
│   ├── drop-zone.tsx           # Drag-and-drop file upload
│   ├── feature-cards.tsx       # Landing-page feature badges
│   ├── footer.tsx              # Page footer
│   ├── format-notes.tsx        # Format-specific tips
│   ├── format-selector.tsx     # Output format grid
│   ├── progress-bar.tsx        # FFmpeg conversion progress
│   ├── quality-slider.tsx      # Lossy quality control
│   ├── source-preview.tsx      # Unified image/video/audio preview
│   └── step-indicator.tsx      # Upload → Configure → Download
├── lib/
│   ├── audio-converter.ts      # Audio conversion (FFmpeg.wasm)
│   ├── constants.ts            # Formats, categories, types
│   ├── converter.ts            # Image conversion (Canvas API)
│   ├── ffmpeg-loader.ts        # Singleton FFmpeg loader
│   └── video-converter.ts      # Video conversion (FFmpeg.wasm)
├── App.tsx                     # Main application
├── index.css                   # Global styles
└── main.tsx                    # Entry point
```

## Privacy

All processing runs in your browser via the Canvas API (images) and FFmpeg compiled to WebAssembly (video/audio). **No files are uploaded to any server.** The FFmpeg WASM core (~30 MB) is fetched from a public CDN on first use and cached by your browser.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run checks: `pnpm lint && pnpm typecheck && pnpm build`
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
6. Push and open a Pull Request

## Support

- [GitHub Discussions](https://github.com/YosrBennagra/TypeYourImage/discussions) — Questions
- [Bug Reports](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=bug_report.yml)
- [Feature Requests](https://github.com/YosrBennagra/TypeYourImage/issues/new?template=feature_request.yml)

## Sponsors

- [GitHub Sponsors](https://github.com/sponsors/YosrBennagra)
- [Buy Me a Coffee](https://buymeacoffee.com/veinpal)

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">
Made with ⚡ by <a href="https://github.com/YosrBennagra">Veinpal</a>
</div>
