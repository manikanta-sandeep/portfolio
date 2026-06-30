# Portfolio Application

Personal portfolio built with React + Vite, designed for GitHub Pages hosting with strong SEO and crawlability defaults.

## Runtime Requirement

- Node 20 only
- This repository enforces Node version with `.nvmrc`, `.npmrc` (`engine-strict=true`), and `package.json` engines.

## Local Development

1. `nvm use 20`
2. `npm install`
3. `npm run dev`

`npm run dev` opens the browser automatically, recompiles on every file change, and updates preview live.

If you want to preview from other devices on your network:

1. `npm run dev:host`

## Production Build

1. `nvm use 20`
2. `npm run build`
3. `npm run preview`

## Content Editing

- Main profile content: `src/data/profileData.js`
- Blog listing data: `src/data/blogData.js`

Update sections in `profileData.js` to edit:

- Hero/About
- Skills
- Projects
- Experience
- Education
- Certifications
- Contact links (Email, LinkedIn, GitHub)

## Resume Integration

Expected resume path for download button:

- `public/MSP_Resume_June.pdf`

If the file is missing, add your latest resume PDF there and keep the same filename, or update `resumeFile` in `src/data/profileData.js`.

## SEO and Crawlability

Implemented SEO features:

- Page-level title/description updates
- Open Graph metadata
- Twitter card metadata
- Canonical URLs
- Robots directives
- JSON-LD structured data for `Person`, `WebSite`, and `Blog`
- `public/robots.txt`
- `public/sitemap.xml`

## GitHub Pages Deployment

Workflow file:

- `.github/workflows/deploy-pages.yml`

Steps:

1. Push to `main`
2. In GitHub repository settings, enable Pages and set source to GitHub Actions
3. Workflow builds with Node 20 and deploys `dist/`

## Base URL Note

The app is configured for root hosting (`/`) in `vite.config.js`.
