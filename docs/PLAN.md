# 0x1d1e landing page — plan

Status: draft. Experimental, like everything else here.

## 1. Goal

A single-page landing site for the 0x1d1e org ("software made during idle cycles"), built to the "Dark Tech" design spec: black canvas, Inter Display headlines, Geist Mono data, square CTAs, pill chips, bento grid, event-stream table, metrics grid.

Content source: the org README (tone: terse, honest, "no fake stability"). Marketing-speak is out of character for this org, so the copy should stay dry.

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript (strict) | Required |
| Bundler | Vite | Static site, no SSR needed; fast CI |
| Package manager | pnpm | Already installed locally |
| Styling | Tailwind CSS v4 (`@theme` tokens in CSS) | Decided. Theme is restricted to the spec palette, so off-palette colors can't be expressed as utilities |
| Fonts | `@fontsource-variable/inter` (opsz) + `@fontsource-variable/geist-mono` (self-hosted) | No third-party requests; "Inter Display" needs verifying (see risks) |
| Tests | Vitest + React Testing Library; Playwright for e2e/visual | |
| Lint/format | ESLint (typescript-eslint, jsx-a11y) + Prettier | |
| Hosting | GitHub Pages via Actions (default), swappable | Zero cost, org-native |

Decision: Tailwind (spec uses `h-1.5` / `rounded-sm`). Palette is enforced by defining colors with `--color-*: initial` in `@theme` and then declaring only the spec colors, plus a lint check that rejects arbitrary values like `bg-[#abc]` and raw hex in TSX.

## 3. Design tokens (single source of truth)

`src/styles/theme.css` (Tailwind `@theme`). Only these colors may appear anywhere:

- bg `#000`, card `#0a0a0a`, chip `#1f1f1f`, ring `rgba(255,255,255,.145)`
- text `#fff`, `#e7e7e7`, muted `#999`, `#ededed`, CTA text `#121212`
- accent `#52a8ff`, success `#62c073`
- radii: `--radius-btn: 0`, `--radius-chip: 100px`, `--radius-bar: 2px`
- scrim: `linear-gradient(to top, rgba(0,0,0,.76) 0%, rgba(0,0,0,0) 93.785%)`

Enforced by resetting Tailwind's default colors and a script that fails CI on any hex/rgba or arbitrary color value outside the theme file ("MUST NOT use brand colors outside the defined hex codes").

## 4. Component map

```
src/
  components/
    Header/            absolute, top 38px, px 56px, MobileMenu (full-screen)
    Button/            variant "square", 0 radius, optional diagonal-arrow icon
    Chip/              v-chip: PASS | WARN | FAIL, uppercase Geist Mono 12px
    Card/              #0a0a0a + 1px ring
    Hero/              100svh, cover image, scrim, headline-fluid (32→60px)
    EventStream/       trace header, Sidebar (240px), SpanTable
    TimelineBar/       left%/width% bar, default vs active (#52a8ff)
    Bento/             RegressionCard, ClusteringCard, VersionReplayCard (diff)
    MetricsGrid/       4-col, border-connected, 56px / -3.36px values
    Footer/            links to CONTRIBUTING, SECURITY, repo
  data/                typed fixtures (spans, events, metrics): no fetching
  styles/              theme.css (Tailwind @theme), global.css
  App.tsx, main.tsx
```

Rule: all data rows render in Geist Mono. Data components take typed props. Fixtures live in `data/`, so nothing is hard-coded in JSX.

## 4b. Content model (no admin, git is the CMS)

No CMS or admin UI. Projects and people are markdown files with frontmatter; adding one is a PR.

```
0x1d1e/site                      (this repo; currently named landing-page)
├── src/
├── static/
└── content/                     in-repo at first, or fetched from the repo below

0x1d1e/content
├── projects/  kanade.md  kinetix.md  merro.md
├── people/
└── assets/
```

- Build-time only: Vite loads `content/**/*.md` (`import.meta.glob`), parses frontmatter, validates against zod schemas, and fails the build on bad content. No runtime fetching.
- Phase 1: `content/` lives inside this repo with seed entries. Phase 2: move to `0x1d1e/content`; CI checks it out into `content/` before build (pinned ref), and a `repository_dispatch` from the content repo triggers a site redeploy. The loader doesn't change between phases.
- Frontmatter for projects: `name`, `summary`, `status` (experimental | active | archived, rendered as a Chip), `repo`, `tags`, `updated`. Status defaults to experimental, per the org's "no fake stability" rule.
- The typed fixtures for Event Stream/Bento/Metrics stay as illustrative data unless real data is decided in #11.

## 4c. Motion

Library: `motion` (Motion for React). Tailwind handles simple hover/focus transitions; Motion handles scroll reveals, stagger, and mount/unmount (mobile menu).

- Tokens in one `src/motion/tokens.ts`: durations (fast 150ms, base 300ms, slow 600ms), one ease curve (`cubic-bezier(.2,.8,.2,1)`), stagger 60ms. Crisp and short, in keeping with the brutalist look. No bouncy springs.
- `<Reveal>` wrapper: fade + 12px rise on first viewport entry (`whileInView`, `once`), used by every section so transitions between sections are consistent.
- Per-section: hero headline/subtext/CTA staggered on load; bento cards staggered; metrics numbers count up once in view; event-stream timeline bars grow from left (scaleX / width) and focus row highlights with the accent color; chips and buttons get hover/focus transitions; mobile menu slides/fades with staggered links.
- Rules: animate only `opacity` and `transform` (plus bar width via transform) to avoid layout thrash; `prefers-reduced-motion` disables movement and keeps instant opacity changes; no animation blocks content or the CTA; content must render correctly with JS animation disabled.
- Verification: reduced-motion e2e test; no layout shift (CLS) introduced, checked by the Lighthouse budget.

## 5. Open questions / risks

1. **"Inter Display"** is not a standard npm font. Options: Inter variable with `opsz` axis (the Display optical size), or fall back to Inter. Needs a spike.
2. **Hero image**: spec wants a high-quality photo. We need a licensed or generated asset. Placeholder gradient until then.
3. **Event Stream content**: the spec is for an observability product. For 0x1d1e it should show something true (e.g. real build/trace data from our own repos), or be clearly labeled as illustrative. Fits the "verify things" rule.
4. **Org README links** `../CONTRIBUTION.md` and `../SECURITY.md`, which point at the org `.github` repo. The footer should link to the correct absolute URLs.
5. **Repo name**: target layout names the repo `0x1d1e/site`; this one is `landing-page`. Rename before release (GitHub redirects old URLs).
6. **Mobile menu**: full-screen, focus-trapped, Escape closes, body scroll locked. Needs real a11y testing.

## 6. Pipeline

```
 push / PR
    │
    ├─ verify (parallel jobs)
    │    ├─ typecheck   tsc --noEmit
    │    ├─ lint        eslint + prettier --check + palette check
    │    ├─ test        vitest run --coverage
    │    └─ build       vite build  → upload dist artifact
    │
    ├─ e2e (needs build)
    │    └─ playwright: smoke, mobile menu, a11y (axe), screenshots @ 390 / 1440
    │
    ├─ lighthouse (needs build, PRs)   perf ≥ 90, a11y ≥ 95 (budget, warn first)
    │
    └─ deploy (main only, needs all)   GitHub Pages
```

Details:
- `.github/workflows/ci.yml`: Node pinned via `.nvmrc`, pnpm cache, `concurrency` group to cancel superseded runs, `permissions: contents: read` by default.
- `.github/workflows/deploy.yml`: separate, `pages: write` + `id-token: write` only here; triggered on push to main after CI succeeds.
- PR previews: later, optional.
- Dependabot (npm + actions, weekly, grouped).
- Local parity: `pnpm check` runs typecheck + lint + test + build, which is exactly what CI runs. Optional pre-commit via lefthook.
- Branch protection on `main`: require `verify` + `e2e`, linear history.
- Conventional commits, no release automation (a landing page doesn't need it).

## 7. Milestones and issues

Each is a GitHub issue; labels: `infra`, `design-system`, `component`, `content`, `a11y`, `ci`.

**M0 — Foundation**
1. `infra` Scaffold Vite + React + TS strict, pnpm, `.nvmrc`, ESLint/Prettier, `pnpm check` script
2. `ci` CI workflow: typecheck, lint, test, build (+ branch protection)
3. `design-system` Tokens, global CSS, font loading (resolve "Inter Display" spike), palette-enforcement check
4. `ci` Deploy workflow to GitHub Pages + Dependabot

**M1 — Primitives**
5. `component` Button (square, arrow icon), Chip (PASS/WARN/FAIL), Card (ring) + tests
6. `component` Header + full-screen mobile menu (a11y: focus trap, Esc, scroll lock)

**M2 — Sections**
7. `component` Hero (100svh, scrim, headline-fluid, CTA)
8. `component` TimelineBar + EventStream table (sidebar, spans, focus state)
9. `component` Bento grid: Regression, Failure Clustering, Version Replay (diff)
10. `component` MetricsGrid (4-col, border-connected)
11. `content` Content pipeline (see 4b) and copy pass from org README + footer + real links; decide Event Stream data source

**M3 — Quality**
12. `ci` Playwright e2e + axe a11y + screenshot baselines (390 / 1440)
13. `ci` Lighthouse budget in PR checks
14. `a11y` Reduced-motion, contrast audit on #999 text, keyboard walkthrough

Dependency order: 1 → 2,3 → 4,5 → 6–10 (parallelizable) → 11 → 12–14.

## 8. Definition of done (per PR)

`pnpm check` green, new components have tests, no colors outside tokens, usable at 390px and 1440px, keyboard reachable.
