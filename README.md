# TypeYourImage

Free online image format converter — upload, preview, convert between PNG, JPG, WebP, GIF, BMP, and more. **100% client-side** — your files never leave your browser.

Live: [tym.veinpal.com](https://tym.veinpal.com)

---

## Features

- **Upload** any common image format (PNG, JPG/JPEG, WebP, GIF, SVG, BMP)
- **Preview** the source image with dimensions and file size
- **Select** an output format from a visual grid
- **Adjust quality** for lossy formats (JPG, WebP)
- **Transparency warnings** when converting alpha images to non-alpha formats
- **Download** the converted file instantly
- **Convert again** to a different format without re-uploading
- Clean, professional dark UI with responsive grid layout

## Tech Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS** for styling
- 100% client-side Canvas API conversion (no server required)

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9

### Install & Run

```bash
cd TypeYourImage
pnpm install
pnpm dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

### Build for Production

```bash
pnpm build
pnpm preview
```

### Lint & Typecheck

```bash
pnpm lint
pnpm typecheck
```

---

## Branching Workflow

Same strategy as the Veinpal monorepo:

```
main          ← production (deployed to Vercel)
  └─ dev      ← integration / staging
      └─ feature/<name>   ← feature work
      └─ fix/<name>       ← bug fixes
```

### Rules

1. **`main`** = production. Only merge from `dev` (or hotfix branches).
2. **`dev`** = integration. Feature branches merge here first.
3. **Feature branches** are created from `dev` and merged back into `dev`.
4. **Hotfix branches** are created from `main` and merged into both `main` and `dev`.

### Conventional Commits

```
feat(converter): add WebP quality slider
fix(upload): handle SVG viewBox dimensions
chore: update dependencies
docs: add deployment steps
```

---

## Deployment

### Deploy to Vercel

```bash
# 1. Install Vercel CLI
pnpm add -g vercel

# 2. Link the project (first time only)
cd TypeYourImage
vercel link
# → Select your Vercel team/account
# → Create a new project named "typeyourimage"

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod
```

### Custom Domain Setup (tym.veinpal.com)

1. In the Vercel dashboard, go to **Project Settings → Domains**.
2. Add `tym.veinpal.com`.
3. In your DNS provider, add a **CNAME** record:
   - **Name**: `tym`
   - **Value**: `cname.vercel-dns.com`
4. Vercel will auto-provision an SSL certificate.

Alternatively via CLI:

```bash
vercel domains add tym.veinpal.com
```

---

## Project Structure

```
TypeYourImage/
├── index.html                 # HTML entry
├── package.json               # Dependencies & scripts
├── vite.config.ts             # Vite configuration
├── tailwind.config.ts         # Tailwind theme
├── tsconfig.json              # TypeScript config
├── vercel.json                # Vercel deployment config
├── eslint.config.js           # ESLint flat config
├── src/
│   ├── main.tsx               # React entry
│   ├── App.tsx                # Main application component
│   ├── index.css              # Global styles + Tailwind
│   ├── lib/
│   │   ├── constants.ts       # Format definitions, types
│   │   └── converter.ts       # Image load, convert, download
│   └── components/
│       ├── drop-zone.tsx      # Drag-and-drop upload area
│       ├── image-preview.tsx  # Source image preview card
│       ├── format-selector.tsx# Output format grid
│       ├── quality-slider.tsx # Quality control for lossy formats
│       ├── step-indicator.tsx # Upload → Configure → Download
│       ├── format-notes.tsx   # Transparency & format warnings
│       ├── conversion-result.tsx # Success state + download
│       └── footer.tsx         # Privacy badge + links
```

## License

MIT
