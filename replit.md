# GateCtr Docs

Documentation site for GateCtr — an LLM gateway that sits between your app and any LLM provider.

## Project Overview

- **Framework**: Docusaurus 3.9.2
- **Language**: JavaScript (Node.js 20)
- **Port**: 5000
- **Start command**: `npm start` (docusaurus start --port 5000 --host 0.0.0.0)

## Architecture

A full Docusaurus v3 documentation site with:
- **Custom landing page** at `/` (`src/pages/index.js`)
- **Documentation** at `/docs/` (Markdown + MDX)
- **Internationalization (i18n)**: English (default) + French
- **SEO**: Per-page frontmatter (title, description, keywords), hreflang tags, Open Graph, JSON-LD structured data, sitemap

## Directory Structure

```
├── docs/                            ← English documentation (MDX)
│   ├── intro.md                     ← Introduction page
│   ├── getting-started/
│   │   ├── quickstart.md
│   │   ├── authentication.md
│   │   └── first-request.md
│   ├── features/
│   │   ├── budget-firewall.md
│   │   ├── context-optimizer.md
│   │   ├── model-router.md
│   │   ├── analytics.md
│   │   └── webhooks.md
│   ├── sdks/
│   │   ├── node.md
│   │   └── python.md
│   └── api-reference/
│       ├── complete.md
│       ├── chat.md
│       └── usage.md
├── i18n/
│   └── fr/                          ← French translations
│       ├── code.json                ← UI string translations
│       ├── docusaurus-theme-classic/ ← Navbar & footer translations
│       └── docusaurus-plugin-content-docs/current/ ← French docs (mirrors docs/)
├── src/
│   ├── css/custom.css               ← Purple theme (GateCtr brand)
│   └── pages/index.js               ← Custom landing page
├── static/img/                      ← Logo SVG and assets
├── docusaurus.config.js             ← Main configuration (i18n, SEO, navbar, footer)
└── sidebars.js                      ← Sidebar structure
```

## Key Configuration

- **`docusaurus.config.js`**: i18n (en/fr), SEO metadata, JSON-LD, navbar with locale dropdown, sitemap
- **`sidebars.js`**: Navigation tree for the docs sidebar
- **Deployment**: Configured for autoscale with `npm run build` + `npm run serve`

## i18n

- Default locale: `en` (English)
- Supported locales: `en`, `fr` (Français)
- French translations live in `i18n/fr/` — mirror the `docs/` structure
- Language switcher dropdown is in the navbar

## SEO

- Each doc has frontmatter: `title`, `description`, `keywords`
- Automatic `hreflang` alternate links for each locale
- Open Graph image configured
- JSON-LD Organization schema
- Auto-generated sitemap (weekly updates)
