# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - 2026-02-27

### Added

- **Multi-format conversion**: Images, Video, and Audio
- Video conversion powered by FFmpeg.wasm (MP4, WebM, AVI, GIF)
- Audio conversion powered by FFmpeg.wasm (MP3, WAV, OGG, AAC, FLAC)
- Category tab interface (Images / Video / Audio)
- Auto-detection of file type with smart category switching
- Conversion progress bar for video and audio
- FFmpeg.wasm lazy loading (downloaded from CDN on first use)
- Feature cards on landing page (Privacy, Instant, No Sign-up)
- Unified source preview for all file types (image, video, audio)
- File size limits with warnings for large files
- Cross-Origin-Isolation headers for WebAssembly support
- Enhanced SEO with FAQPage structured data
- Comprehensive keyword targeting for images, video, and audio
- Deploy pipeline to Vercel (allurtypes.veinpal.com)

### Changed

- Rebranded from TypeYourImage to **AllYourTypes**
- Deployment domain changed to `allurtypes.veinpal.com`
- Format selector adapts to selected category
- Drop zone accepts category-specific file types
- Format notes cover image, video, and audio specifics
- Upgraded package to version 2.0.0

## [1.0.0] - 2025-06-01

### Added

- Initial release
- Drag & drop image upload
- Image format conversion (PNG, JPG, WebP, GIF, BMP)
- SVG input support
- Quality slider for lossy formats (JPG, WebP)
- Transparency detection and warnings
- Source image preview with dimensions and file size
- Visual format selector grid
- Step indicator (Upload → Configure → Download)
- Convert again without re-uploading
- 100% client-side Canvas API conversion
- Dark UI with neon accent theme
- Responsive layout
- Open source repository setup (LICENSE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT)
- CI/CD pipeline (lint, typecheck, build, security scan)
- Release pipeline with auto-generated changelogs
- Full SEO meta tags (Open Graph, Twitter Cards, structured data)

[Unreleased]: https://github.com/YosrBennagra/TypeYourImage/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/YosrBennagra/TypeYourImage/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/YosrBennagra/TypeYourImage/releases/tag/v1.0.0
