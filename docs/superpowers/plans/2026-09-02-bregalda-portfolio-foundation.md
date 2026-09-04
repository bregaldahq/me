# Bregalda Portfolio Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete server-rendered, English-language Bregalda portfolio foundation with accurate project stories, branded responsive layouts, accessible navigation, realistic HTML/SVG product artifacts, static orbital artwork, and sharing metadata.

**Architecture:** A Vinext server route renders every essential word and link from one typed project-data module. Focused React components compose the navigation, orbital opening, four project chapters, studio statement, contact finale, and footer; CSS modules provide the art-directed responsive layout while `app/globals.css` owns shared tokens and accessibility defaults. The page works without JavaScript and exposes stable enhancement hooks for the separate motion plan.

**Tech Stack:** React 19.2.6, TypeScript 5.9.3, Vinext 1.0.0-beta.5, Vite 8.0.13, Tailwind CSS 4.2.1, Base UI Sheet/Button primitives, Vitest 4.1.11, React Testing Library 16.3.3, jsdom 29.1.1, Sharp 0.34.5.

**Spec:** `docs/superpowers/specs/2026-09-02-bregalda-portfolio-design.md`

## Global Constraints

- The public site language is English; the canonical origin is `https://bregalda.com`.
- The primary CTA text is `Connect on LinkedIn` and its exact destination is `https://www.linkedin.com/in/ricardomeneguzzibregalda`.
- The project order is ReconcileFlow, Aeternis Log, Workshop Management API, ChaosSQL.
- Use only `#FCFBF8`, `#2A2140`, `#4B2E83`, `#F5C400`, `#22C55E`, their opacity variants, and colors embedded in the supplied SVGs.
- Use the supplied SVG identity files unchanged; do not redraw, recolor, or replace the Bregalda marks.
- Use Inter for display/body copy and JetBrains Mono for technical labels.
- Every essential heading, summary, technology, GitHub link, studio statement, and LinkedIn CTA must be present in the initial HTML.
- Do not add a form, CMS, analytics dashboard, runtime GitHub API request, authentication, database, blog, localization, testimonials, or invented metrics.
- Preserve Node.js `>=22.13.0`, npm, React, TypeScript, Vinext, Vite, Cloudflare, and `.openai/hosting.json`.
- Keep page-level horizontal overflow at zero from 320 CSS pixels through ultrawide layouts and at 200% zoom.
- Interactive targets are at least 44 by 44 CSS pixels on touch layouts.
- The static foundation is the no-JavaScript, reduced-data, reduced-motion, and WebGL-failure content source; motion may enhance it but never replace it.

## File Structure

- `app/page.tsx` — route entry that renders `PortfolioPage`.
- `app/layout.tsx` — English document shell, local font variables, canonical metadata, icons, and social metadata.
- `app/robots.ts`, `app/sitemap.ts` — crawl directives and the single canonical route.
- `app/globals.css` — brand tokens, reset, typography defaults, focus treatment, reduced-motion defaults, and overflow safeguards.
- `app/portfolio/project-data.ts` — the only source for project order, copy, URLs, evidence, artifact type, and planet theme.
- `app/portfolio/seo.ts` — site constants and accurate Person/Organization structured data.
- `app/portfolio/portfolio-page.tsx` — semantic section ordering and progressive-enhancement boundaries.
- `app/portfolio/portfolio-page.module.css` — page, chapter, studio, contact, and responsive composition.
- `app/portfolio/orbit/orbit-stage.tsx` — first-viewport static orbital artwork, DOM labels, monogram, and the mount point used by the motion plan.
- `app/portfolio/orbit/orbit-stage.module.css` — fallback artwork framing and responsive label placement.
- `app/portfolio/projects/project-cycle.tsx` — reusable project chapter with stable IDs and evidence markup.
- `app/portfolio/projects/project-artifact.tsx` — exhaustive artifact-type-to-component mapping.
- `app/portfolio/projects/artifacts/*.tsx` — one semantic HTML/SVG artifact per project.
- `app/portfolio/projects/artifacts/artifacts.module.css` — shared product-surface styling and contained diagrams.
- `app/portfolio/ui/*.tsx` — navigation, brand image wrapper, external link, studio, contact, and footer.
- `public/media/orbit-fallback.webp` — optimized original static orbital composition without text.
- `public/og.png` — branded 1200-by-630 social card.
- `tests/setup.ts`, `vitest.config.ts` — component-test environment.
- `scripts/optimize-image.mjs` — deterministic raster resize and compression.

---

### Task 1: Establish the Test Harness and Typed Project Source

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `app/portfolio/project-data.test.ts`
- Create: `app/portfolio/project-data.ts`

**Interfaces:**

- Produces: `PROJECT_IDS`, `PROJECTS`, `ProjectId`, `ArtifactType`, `ProjectEvidence`, `PlanetTheme`, and `PortfolioProject`.
- Consumers: every chapter, artifact mapping, orbit label, timeline, and planet in both implementation plans.

- [ ] **Step 1: Install the exact testing dependencies and add scripts**

Run:

```bash
npm install --save-dev vitest@4.1.11 @vitest/coverage-v8@4.1.11 jsdom@29.1.1 @testing-library/react@16.3.3 @testing-library/dom@10.4.1 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.7 sharp@0.34.5
```

Add these scripts to `package.json`:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

- [ ] **Step 2: Configure Vitest and the browser-like test setup**

Create `vitest.config.ts`:

```ts
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      thresholds: { lines: 85, functions: 85, branches: 80, statements: 85 },
    },
  },
});
```

Create `tests/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

- [ ] **Step 3: Write the failing project-data contract test**

Create `app/portfolio/project-data.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PROJECT_IDS, PROJECTS } from './project-data';

describe('PROJECTS', () => {
  it('keeps the approved order and one exhaustive artifact mapping per project', () => {
    expect(PROJECT_IDS).toEqual([
      'reconcileflow',
      'aeternis-log',
      'workshop-api',
      'chaossql',
    ]);
    expect(PROJECTS.map(({ id }) => id)).toEqual(PROJECT_IDS);
    expect(PROJECTS.map(({ artifact }) => artifact)).toEqual([
      'reconciliation',
      'merkle-proof',
      'service-order',
      'concurrency-trace',
    ]);
  });

  it('contains unique ids, approved headlines, HTTPS GitHub URLs, and evidence', () => {
    expect(new Set(PROJECTS.map(({ id }) => id)).size).toBe(4);
    expect(PROJECTS.map(({ headline }) => headline)).toEqual([
      'Logic you can inspect.',
      'Proof that outlives the data.',
      'A business, modeled end to end.',
      'Turn chaos into a test.',
    ]);

    for (const project of PROJECTS) {
      const url = new URL(project.repository);
      expect(url.protocol).toBe('https:');
      expect(url.hostname).toBe('github.com');
      expect(project.technologies.length).toBeGreaterThanOrEqual(4);
      expect(project.evidence.length).toBeGreaterThanOrEqual(2);
      expect(['#F5C400', '#22C55E']).toContain(project.planet.signal);
    }
  });

  it('labels snapshots and demonstrations instead of presenting them as live telemetry', () => {
    expect(PROJECTS[0].disclosure).toMatch(/repository snapshot/i);
    expect(PROJECTS[1].disclosure).toMatch(/representative demonstration/i);
    expect(PROJECTS[3].limitation).toBe(
      'Scenario outcomes depend on the database engine and isolation level.',
    );
  });
});
```

- [ ] **Step 4: Run the test and verify the missing module failure**

Run:

```bash
npm test -- app/portfolio/project-data.test.ts
```

Expected: FAIL because `./project-data` does not exist.

- [ ] **Step 5: Implement the project types and approved editorial snapshots**

Create `app/portfolio/project-data.ts` with these contracts and exact content:

```ts
export const PROJECT_IDS = [
  'reconcileflow',
  'aeternis-log',
  'workshop-api',
  'chaossql',
] as const;

export type ProjectId = (typeof PROJECT_IDS)[number];
export type ArtifactType =
  | 'reconciliation'
  | 'merkle-proof'
  | 'service-order'
  | 'concurrency-trace';
export type BrandSignal = '#F5C400' | '#22C55E';

export interface ProjectEvidence {
  readonly label: string;
  readonly value: string;
}

export interface PlanetTheme {
  readonly base: '#4B2E83' | '#2A2140';
  readonly signal: BrandSignal;
  readonly radius: number;
  readonly orbitRadius: number;
  readonly orbitOffset: number;
  readonly seed: number;
}

export interface PortfolioProject {
  readonly id: ProjectId;
  readonly sequence: '01' | '02' | '03' | '04';
  readonly name: string;
  readonly navLabel: string;
  readonly headline: string;
  readonly summary: string;
  readonly repository: `https://github.com/${string}`;
  readonly artifact: ArtifactType;
  readonly technologies: readonly string[];
  readonly evidence: readonly ProjectEvidence[];
  readonly disclosure?: string;
  readonly limitation?: string;
  readonly planet: PlanetTheme;
}

export const PROJECTS = [
  {
    id: 'reconcileflow', sequence: '01', name: 'ReconcileFlow', navLabel: 'ReconcileFlow',
    headline: 'Logic you can inspect.',
    summary: 'Two financial sources become deterministic, reproducible decisions—with the applied rule, version, confidence, and evidence preserved for review.',
    repository: 'https://github.com/bregaldahq/reconcileflow',
    artifact: 'reconciliation',
    technologies: ['Python 3.12', 'FastAPI', 'PostgreSQL 17', 'Redis 8', 'Celery', 'React 19', 'TypeScript', 'Hypothesis'],
    evidence: [
      { label: 'Matching', value: 'Exact, tolerance, and bounded split rules' },
      { label: 'Audit', value: 'Append-only decisions, reviews, and exports' },
      { label: 'Repository snapshot', value: '84 backend · 10 frontend · 2 browser · 86.42% coverage' },
    ],
    disclosure: 'Quality figures are a repository snapshot, not live telemetry.',
    planet: { base: '#4B2E83', signal: '#F5C400', radius: 1.08, orbitRadius: 4.6, orbitOffset: 0, seed: 11 },
  },
  {
    id: 'aeternis-log', sequence: '02', name: 'Aeternis Log', navLabel: 'Aeternis Log',
    headline: 'Proof that outlives the data.',
    summary: 'Records remain queryable in MongoDB while each batch becomes a Merkle root anchored on Hyperledger Fabric for independent integrity checks.',
    repository: 'https://github.com/bregaldahq/aeternis-log',
    artifact: 'merkle-proof',
    technologies: ['Go', 'Gin', 'MongoDB', 'Redis (optional)', 'Hyperledger Fabric', 'Raft', 'Go chaincode', 'Go and Python SDKs'],
    evidence: [
      { label: 'Integrity', value: 'Domain-separated SHA-256 Merkle proofs' },
      { label: 'Verification', value: 'Recompute off-chain data against the immutable anchor' },
      { label: 'Delivery', value: 'REST API, signed webhooks, Go and Python SDKs' },
    ],
    disclosure: 'Proof values in this portfolio are a representative demonstration, not a live blockchain connection.',
    planet: { base: '#2A2140', signal: '#22C55E', radius: 0.96, orbitRadius: 5.2, orbitOffset: 1.6, seed: 23 },
  },
  {
    id: 'workshop-api', sequence: '03', name: 'Workshop Management API', navLabel: 'Workshop API',
    headline: 'A business, modeled end to end.',
    summary: 'A service order moves from reception through diagnosis, approval, execution, inventory reservation, and delivery while domain rules stay isolated from infrastructure.',
    repository: 'https://github.com/bregaldahq/oficina-mecanica-tech-challenge',
    artifact: 'service-order',
    technologies: ['PHP 8.2', 'DDD', 'Clean Architecture', 'MySQL 8', 'JWT HS256', 'PHPUnit 11', 'PHPStan level 8', 'OpenAPI 3', 'Docker', 'Nginx', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    evidence: [
      { label: 'Domain', value: 'Named state transitions and domain events' },
      { label: 'Reliability', value: 'Atomic service-order and inventory persistence' },
      { label: 'Delivery', value: 'Containers, autoscaling, infrastructure as code, and CI/CD' },
    ],
    planet: { base: '#4B2E83', signal: '#F5C400', radius: 1.18, orbitRadius: 5.8, orbitOffset: 3.15, seed: 37 },
  },
  {
    id: 'chaossql', sequence: '04', name: 'ChaosSQL', navLabel: 'ChaosSQL',
    headline: 'Turn chaos into a test.',
    summary: 'Stress SQL workloads, check invariants, and shrink failing execution traces into focused reproductions. Concurrency bugs become evidence you can inspect.',
    repository: 'https://github.com/bregaldahq/chaossql',
    artifact: 'concurrency-trace',
    technologies: ['Go 1.25', 'SQLite', 'PostgreSQL', 'MySQL', 'Seeded scheduling', 'Causal delta debugging', 'Go testing SDK', 'GitHub Actions'],
    evidence: [
      { label: 'Detection', value: 'Concurrent workloads, SQL invariants, and isolation anomalies' },
      { label: 'Reduction', value: 'Causal delta debugging narrows failing traces to focused reproductions' },
      { label: 'Delivery', value: 'Go testing SDK, standalone reproduction tests, HTML reports, and JUnit exports' },
    ],
    limitation: 'Scenario outcomes depend on the database engine and isolation level.',
    planet: { base: '#2A2140', signal: '#22C55E', radius: 0.9, orbitRadius: 4.9, orbitOffset: 4.7, seed: 47 },
  },
] as const satisfies readonly PortfolioProject[];
```

- [ ] **Step 6: Run the focused test, then the full unit suite**

Run:

```bash
npm test -- app/portfolio/project-data.test.ts
npm test
```

Expected: both commands PASS.

- [ ] **Step 7: Commit the tested data foundation**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts app/portfolio/project-data.ts app/portfolio/project-data.test.ts
git commit -m "test: establish portfolio content contracts"
```

---

### Task 2: Establish Brand Tokens, Metadata Contracts, and Static Orbital Art

**Files:**

- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `app/portfolio/seo.ts`
- Create: `app/portfolio/seo.test.ts`
- Create: `app/portfolio/media-assets.test.ts`
- Create: `scripts/optimize-image.mjs`
- Create: `public/media/orbit-fallback.webp`

**Interfaces:**

- Produces: `SITE_URL`, `LINKEDIN_URL`, `GITHUB_ORG_URL`, `SITE_TITLE`, `SITE_DESCRIPTION`, `STRUCTURED_DATA`.
- Produces CSS custom properties `--cream`, `--ink`, `--purple`, `--yellow`, `--green`, `--font-sans`, `--font-mono`, `--page-gutter`, and `--content-max`.
- Consumers: `app/layout.tsx`, every CTA, all CSS modules, and final SEO files.

- [ ] **Step 1: Write the failing SEO contract test**

Create `app/portfolio/seo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  GITHUB_ORG_URL,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  STRUCTURED_DATA,
} from './seo';

describe('portfolio SEO constants', () => {
  it('uses the approved canonical identity and conversion path', () => {
    expect(SITE_URL.href).toBe('https://bregalda.com/');
    expect(SITE_TITLE).toBe('Bregalda — Thoughtful tools for real technical problems');
    expect(SITE_DESCRIPTION).toContain('independent software studio');
    expect(LINKEDIN_URL).toBe('https://www.linkedin.com/in/ricardomeneguzzibregalda');
    expect(GITHUB_ORG_URL).toBe('https://github.com/bregaldahq');
  });

  it('describes a studio and its founder without inventing legal status', () => {
    expect(STRUCTURED_DATA.map((entry) => entry['@type'])).toEqual(['Organization', 'Person']);
    expect(JSON.stringify(STRUCTURED_DATA)).not.toMatch(/inc\.|llc|ltda|corporation/i);
  });
});
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run `npm test -- app/portfolio/seo.test.ts`.

Expected: FAIL because `./seo` does not exist.

- [ ] **Step 3: Implement the stable site constants and structured data**

Create `app/portfolio/seo.ts`:

```ts
export const SITE_URL = new URL('https://bregalda.com');
export const SITE_TITLE = 'Bregalda — Thoughtful tools for real technical problems';
export const SITE_DESCRIPTION =
  'Bregalda is Ricardo Bregalda’s independent software studio, building auditable data systems, developer tools, APIs, and production-ready software.';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/ricardomeneguzzibregalda';
export const GITHUB_ORG_URL = 'https://github.com/bregaldahq';

export const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bregalda',
    url: SITE_URL.href,
    logo: new URL('/brand/bregalda_primary_lockup.svg', SITE_URL).href,
    founder: { '@type': 'Person', name: 'Ricardo Bregalda' },
    sameAs: [GITHUB_ORG_URL, LINKEDIN_URL],
    description: SITE_DESCRIPTION,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ricardo Bregalda',
    url: SITE_URL.href,
    worksFor: { '@type': 'Organization', name: 'Bregalda' },
    sameAs: [GITHUB_ORG_URL, LINKEDIN_URL],
    knowsAbout: ['Backend development', 'Software architecture', 'APIs', 'Data systems', 'Testing', 'Distributed systems'],
  },
] as const;
```

- [ ] **Step 4: Apply fonts, metadata, tokens, and accessibility defaults**

Use `Inter` and `JetBrains_Mono` from `next/font/google` in `app/layout.tsx`. Set `lang="en"`, `metadataBase`, title, description, canonical `/`, Open Graph/X text, favicon `/brand/icone_bregalda.svg`, and robots directives. Render the two JSON-LD objects as separate `application/ld+json` scripts with `JSON.stringify`.

Replace `app/globals.css` with the Tailwind import plus these exact base tokens and rules before component styling:

```css
@import 'tailwindcss';

:root {
  --cream: #fcfbf8;
  --ink: #2a2140;
  --purple: #4b2e83;
  --yellow: #f5c400;
  --green: #22c55e;
  --page-gutter: clamp(1rem, 3vw, 3rem);
  --content-max: 90rem;
  --text-max: 42rem;
  color-scheme: light;
}

*, *::before, *::after { box-sizing: border-box; }
html { min-width: 320px; scroll-behavior: auto; background: var(--cream); }
body { min-height: 100%; margin: 0; overflow-x: clip; background: var(--cream); color: var(--ink); font-family: var(--font-inter), sans-serif; text-rendering: optimizeLegibility; }
img, svg, canvas { display: block; max-width: 100%; }
a { color: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
:focus-visible { outline: 3px solid var(--yellow); outline-offset: 4px; }
::selection { background: var(--yellow); color: var(--ink); }
.technical-label { font-family: var(--font-jetbrains-mono), monospace; letter-spacing: 0.08em; text-transform: uppercase; }
.skip-link { position: fixed; top: 0.75rem; left: 0.75rem; z-index: 100; transform: translateY(-180%); background: var(--yellow); color: var(--ink); padding: 0.75rem 1rem; }
.skip-link:focus { transform: translateY(0); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation-duration: 0.15s !important; animation-iteration-count: 1 !important; transition-duration: 0.15s !important; } }
```

- [ ] **Step 5: Write an asset-budget test before generating the fallback**

Create `app/portfolio/media-assets.test.ts`:

```ts
// @vitest-environment node
import { readFile, stat } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('portfolio media assets', () => {
  it('ships an optimized WebP orbital fallback below 700 KB', async () => {
    const path = new URL('../../public/media/orbit-fallback.webp', import.meta.url);
    const [bytes, info] = await Promise.all([readFile(path), stat(path)]);
    expect(bytes.subarray(0, 4).toString('ascii')).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString('ascii')).toBe('WEBP');
    expect(info.size).toBeLessThan(700 * 1024);
  });
});
```

Run `npm test -- app/portfolio/media-assets.test.ts` and expect a missing-file failure.

- [ ] **Step 6: Generate and optimize the original orbit fallback**

Use the `imagegen` skill once for an in-page image with this brief:

```text
A cinematic, tactile four-planet orbital system photographed like a premium product reveal. Deep ink space (#2A2140), rich Bregalda purple planets (#4B2E83), warm cream rim light (#FCFBF8), restrained signal-yellow (#F5C400) and verification-green (#22C55E) illumination only. Four clearly distinct realistic mineral surfaces orbit a calm empty center reserved for a logo overlay. Elegant soft depth, believable material detail, subtle atmospheric haze, no blue, red, cyan, starscape, text, logos, interface HUD, spaceship, astronaut, stock-NASA look, or fantasy clutter. Wide 16:10 composition with generous negative space and a refined Apple product-photography sensibility.
```

Save the source outside the checkout at `/root/me/bregalda-orbit-fallback-source.png`, then create `scripts/optimize-image.mjs`:

```js
import sharp from 'sharp';

const [input, output, width, height] = process.argv.slice(2);
if (!input || !output || !width || !height) {
  throw new Error('Usage: node scripts/optimize-image.mjs input output width height');
}

const resized = sharp(input).resize(Number(width), Number(height), {
  fit: 'cover', position: 'centre',
});
const encoded = output.endsWith('.png')
  ? resized.png({ palette: true, quality: 90, effort: 10 })
  : resized.webp({ quality: 78, effort: 6 });
await encoded.toFile(output);
```

Run:

```bash
mkdir -p public/media
node scripts/optimize-image.mjs /root/me/bregalda-orbit-fallback-source.png public/media/orbit-fallback.webp 1600 1000
npm test -- app/portfolio/media-assets.test.ts
```

Expected: PASS and no off-palette hue or embedded text in visual inspection.

- [ ] **Step 7: Run focused tests and commit the brand foundation**

```bash
npm test -- app/portfolio/seo.test.ts app/portfolio/media-assets.test.ts
npm run typecheck
git add app/globals.css app/layout.tsx app/portfolio/seo.ts app/portfolio/seo.test.ts app/portfolio/media-assets.test.ts scripts/optimize-image.mjs public/media/orbit-fallback.webp
git commit -m "feat: establish Bregalda brand foundation"
```

---

### Task 3: Render the Complete Semantic Story and First Meaningful Preview

**Files:**

- Modify: `app/page.tsx`
- Create: `app/portfolio/portfolio-page.test.tsx`
- Create: `app/portfolio/portfolio-page.tsx`
- Create: `app/portfolio/portfolio-page.module.css`
- Create: `app/portfolio/orbit/orbit-stage.tsx`
- Create: `app/portfolio/orbit/orbit-stage.module.css`
- Create: `app/portfolio/projects/project-cycle.tsx`
- Create: `app/portfolio/ui/brand-mark.tsx`
- Create: `app/portfolio/ui/external-link.tsx`
- Create: `app/portfolio/ui/site-nav.tsx`
- Create: `app/portfolio/ui/studio-section.tsx`
- Create: `app/portfolio/ui/contact-section.tsx`
- Create: `app/portfolio/ui/site-footer.tsx`

**Interfaces:**

- `PortfolioPage(): JSX.Element` renders one `<main id="main-content">` and all sections.
- `ProjectCycle({ project }: { project: PortfolioProject }): JSX.Element` renders `article#project-${project.id}` with `data-project-cycle` and `data-project-id`.
- `ExternalLink` always adds `target="_blank"` and `rel="noreferrer"`.
- `OrbitStage({ projects })` renders the static poster, monogram, and four anchors before the future canvas mount.

- [ ] **Step 1: Write the failing semantic-page test**

Create `app/portfolio/portfolio-page.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PortfolioPage } from './portfolio-page';

describe('PortfolioPage', () => {
  it('renders the approved narrative, ordered projects, and conversion links', () => {
    render(<PortfolioPage />);

    expect(screen.getByRole('heading', { level: 1, name: /thoughtful tools/i })).toBeVisible();
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(4);
    expect(articles.map((article) => within(article).getByRole('heading', { level: 2 }).textContent)).toEqual([
      'Logic you can inspect.',
      'Proof that outlives the data.',
      'A business, modeled end to end.',
      'Turn chaos into a test.',
    ]);
    expect(screen.getAllByRole('link', { name: 'Connect on LinkedIn' })).toHaveLength(3);
    expect(screen.getAllByRole('link', { name: /view .* on github/i })).toHaveLength(4);
  });

  it('keeps the four project links and essential sections in server-rendered flow', () => {
    const { container } = render(<PortfolioPage />);
    expect(container.querySelectorAll('[data-orbit-project]')).toHaveLength(4);
    expect(container.querySelector('#work')).toBeTruthy();
    expect(container.querySelector('#studio')).toBeTruthy();
    expect(container.querySelector('#contact')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test and verify the missing component failure**

Run `npm test -- app/portfolio/portfolio-page.test.tsx`.

Expected: FAIL because `./portfolio-page` does not exist.

- [ ] **Step 3: Implement reusable brand and external-link primitives**

`BrandMark` accepts one of the five supplied asset filenames plus `alt`, `width`, `height`, and `className`; it renders a normal `<img>` whose source stays under `/brand/`. `ExternalLink` extends `React.ComponentProps<'a'>` and supplies `target="_blank"` and `rel="noreferrer"` while preserving its children and accessible name.

- [ ] **Step 4: Implement the static orbital opening**

Render this structure in `orbit-stage.tsx`:

```tsx
<section id="work" className={styles.stage} aria-labelledby="work-title" data-orbit-stage>
  <img className={styles.poster} src="/media/orbit-fallback.webp" alt="" width="1600" height="1000" />
  <div className={styles.atmosphere} aria-hidden="true" />
  <div className={styles.copy}>
    <p className="technical-label">Independent software studio</p>
    <h1 id="work-title">Thoughtful tools for real technical problems.</h1>
    <p>Bregalda turns hard technical systems into software people can understand, trust, and use.</p>
  </div>
  <img className={styles.monogram} src="/brand/bregalda_monogram.svg" alt="Bregalda" width="240" height="240" />
  <nav aria-label="Featured projects" className={styles.projectNav}>
    {projects.map((project) => (
      <a key={project.id} href={`#project-${project.id}`} data-orbit-project={project.id}>
        <span className="technical-label">{project.sequence}</span>
        <span>{project.navLabel}</span>
      </a>
    ))}
  </nav>
  <div data-orbit-canvas-root aria-hidden="true" />
</section>
```

The fallback image is decorative because the four project names and Bregalda identity remain in the DOM.

- [ ] **Step 5: Implement the project cycle and full page order**

`ProjectCycle` renders the sequence, name, headline, summary, evidence definition list, technology list, disclosure/limitation when present, and `View {project.name} on GitHub` link. `PortfolioPage` renders:

```tsx
<>
  <a className="skip-link" href="#main-content">Skip to content</a>
  <SiteNav />
  <main id="main-content">
    <OrbitStage projects={PROJECTS} />
    <div aria-label="Selected work">
      {PROJECTS.map((project) => <ProjectCycle key={project.id} project={project} />)}
    </div>
    <StudioSection />
    <ContactSection />
  </main>
  <SiteFooter />
</>
```

`SiteNav` contains the real wordmark, `Work`, `Studio`, `Contact`, and one LinkedIn CTA. `StudioSection` follows the project sequence with the second `Connect on LinkedIn` CTA, the supplied primary lockup, and both approved brand statements. `ContactSection` contains the third exact CTA and the explicit invitation to discuss engineering roles, product work, or freelance projects. `SiteFooter` links GitHub and LinkedIn and uses the current year without hiding content behind client state.

- [ ] **Step 6: Add the bounded visual slice**

In the two CSS modules, style only the first coherent slice needed for recognition:

- cream navigation with deep-ink text and a subtle bottom rule;
- a dark-ink first viewport with the fallback image, readable cream copy, four clearly separated project anchors, and central monogram;
- generous project-section spacing, readable text measure, sequence labels in mono, and alternating artifact/evidence alignment hooks;
- visible yellow focus treatment and no horizontal overflow at 320 pixels.

Do not add motion, sticky chapters, canvas behavior, or final artifact surfaces in this step.

- [ ] **Step 7: Run the semantic test and production type checks**

```bash
npm test -- app/portfolio/portfolio-page.test.tsx
npm run check
```

Expected: PASS.

- [ ] **Step 8: Complete the first meaningful preview gate**

Start and retain the development server with Node 22.13.0:

```bash
npx --yes --package node@22.13.0 --call 'npm run dev -- --host 0.0.0.0'
```

Use one `curl --fail` request against the exact printed local URL. After the response succeeds, open that URL once with `open_in_codex`; reuse that single browser tab for the rest of implementation. Do not perform browser inspection or screenshots at this checkpoint.

- [ ] **Step 9: Commit the meaningful static story**

```bash
git add app/page.tsx app/portfolio
git commit -m "feat: render the Bregalda portfolio story"
```

---

### Task 4: Build the Four Realistic Product Artifacts

**Files:**

- Create: `app/portfolio/projects/project-artifact.test.tsx`
- Create: `app/portfolio/projects/project-artifact.tsx`
- Create: `app/portfolio/projects/artifacts/reconcileflow-artifact.tsx`
- Create: `app/portfolio/projects/artifacts/aeternis-artifact.tsx`
- Create: `app/portfolio/projects/artifacts/workshop-artifact.tsx`
- Create: `app/portfolio/projects/artifacts/chaossql-artifact.tsx`
- Create: `app/portfolio/projects/artifacts/artifacts.module.css`
- Modify: `app/portfolio/projects/project-cycle.tsx`

**Interfaces:**

- `PROJECT_ARTIFACTS: Record<ArtifactType, React.ComponentType>` is exhaustive.
- `ProjectArtifact({ type }: { type: ArtifactType })` renders exactly one semantic artifact.
- Each root carries `data-project-artifact="<artifact-type>"` for motion and browser tests.

- [ ] **Step 1: Write the failing exhaustive-artifact test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PROJECTS } from '../project-data';
import { ProjectArtifact } from './project-artifact';

describe('ProjectArtifact', () => {
  it.each(PROJECTS)('renders the $name artifact with a useful accessible label', ({ artifact }) => {
    const { container } = render(<ProjectArtifact type={artifact} />);
    expect(container.querySelector(`[data-project-artifact="${artifact}"]`)).toBeTruthy();
    expect(screen.getByRole('group')).toHaveAccessibleName();
  });
});
```

Run `npm test -- app/portfolio/projects/project-artifact.test.tsx` and expect a missing-module failure.

- [ ] **Step 2: Implement the ReconcileFlow demonstration interface**

Render a labeled `Demo dataset` product surface with status counts `Matched 3`, `Review 1`, `Unmatched 1`; a selected `SPLIT_MATCHED` decision; `bounded_split@1`; confidence `1.000000`; one source amount `$1,000.00`; target amounts `$500.00`, `$300.00`, `$200.00`; and evidence `amount delta 0.00 ≤ 0.50`, `currency equal`, `group size 3 ≤ 4`. Mark all values as synthetic demonstration data and do not present them as live metrics.

- [ ] **Step 3: Implement the Aeternis proof certificate**

Render four representative record nodes, an SVG Merkle tree with visible connecting paths, batch `BAT-024`, shortened root `8f41…d2c9`, status `Verified`, and the explanation `Recomputed root matches the Fabric anchor`. Label the entire surface `Representative integrity proof`; do not imply a network connection.

- [ ] **Step 4: Implement the Workshop service-order cutaway**

Render service order `WO-2048` with the exact lifecycle `Received → Diagnosis → Awaiting approval → Executing → Finished → Delivered`. Pair it with four restrained architecture layers named `Presentation`, `Application`, `Domain`, and `Infrastructure`, and show the domain layer as independent from HTTP, PDO, and JWT.

- [ ] **Step 5: Implement the ChaosSQL concurrency-trace artifact**

Render the banking lost-update scenario as a synthetic interleaving and an explicit
invariant mismatch. The trace is illustrative, not a measurement or a live database
connection. Use green for transaction evidence and yellow for the violated invariant.

```tsx
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Named visual demonstration, not a form fieldset or heading group. */
import { Database, FileCode2, MoveRight } from 'lucide-react';
import s from './artifacts.module.css';

const INTERLEAVING = [
  ['01', 'T1', 'Read balance', '1000'],
  ['02', 'T2', 'Read balance', '1000'],
  ['03', 'T1', 'Withdraw 50', '950'],
  ['04', 'T2', 'Withdraw 100', '900'],
] as const;

export function ChaosSqlArtifact() {
  return <div role="group" aria-label="ChaosSQL synthetic lost-update trace" data-project-artifact="concurrency-trace" className={`${s.surface} ${s.chaos}`}>
    <div className={s.toolbar}><span><Database size={16} />chaossql</span><span className={s.mono}>banking_lost_update</span></div>
    <div className={s.appBody}>
      <div className={s.decision}><span className={s.eyebrow}>Concurrent withdrawals</span><span className={s.yellow}>Lost update / P4</span></div>
      <table className={s.traceTable} aria-label="Concurrent withdrawal interleaving">
        <thead><tr><th scope="col">Step</th><th scope="col">Tx</th><th scope="col">Operation</th><th scope="col">Balance</th></tr></thead>
        <tbody>{INTERLEAVING.map(([step, transaction, operation, balance]) => <tr key={step} data-trace-step={step}><td>{step}</td><td><span data-transaction={transaction}>{transaction}</span></td><td>{operation}</td><td>{balance}</td></tr>)}</tbody>
      </table>
      <div className={s.invariant}>
        <p className={s.eyebrow}>ledger_balance_consistency</p>
        <p className={s.violation}>Invariant violated</p>
        <code>actual_balance == expected_balance</code>
        <dl><div><dt>Actual balance</dt><dd>$900</dd></div><div><dt>Expected from ledger</dt><dd>$850</dd></div></dl>
        <p className={s.caption}>Two reads of 1000. One withdrawal overwritten.</p>
      </div>
      <div className={s.reproduction}><span>Trace</span><MoveRight size={14} aria-hidden="true" /><span>Shrink</span><MoveRight size={14} aria-hidden="true" /><span><FileCode2 size={14} aria-hidden="true" />repro_test.go</span></div>
    </div>
    <p className={s.disclaimer}>Synthetic illustration · no live database · balances are not measured output</p>
  </div>;
}
```

- [ ] **Step 6: Implement the exhaustive mapper and integrate it**

```tsx
const PROJECT_ARTIFACTS: Record<ArtifactType, React.ComponentType> = {
  reconciliation: ReconcileFlowArtifact,
  'merkle-proof': AeternisArtifact,
  'service-order': WorkshopArtifact,
  'concurrency-trace': ChaosSqlArtifact,
};

export function ProjectArtifact({ type }: { type: ArtifactType }) {
  const Artifact = PROJECT_ARTIFACTS[type];
  return <Artifact />;
}
```

Place `<ProjectArtifact type={project.artifact} />` inside each `ProjectCycle` before the evidence column.

- [ ] **Step 7: Style artifacts as distinct product surfaces**

Use shared deep-ink/purple surfaces, cream text, yellow/green signal colors, thin opacity borders, small technical labels, and limited corner radii. Keep tables, code, timelines, and SVGs inside `max-width: 100%`; use internal overflow only for code blocks and never page-level overflow. Avoid generic dashboard KPI cards, glass panels, gradients in text, and technology-logo clouds.

- [ ] **Step 8: Verify and commit the artifacts**

```bash
npm test -- app/portfolio/projects/project-artifact.test.tsx app/portfolio/portfolio-page.test.tsx
npm run check
git add app/portfolio/projects
git commit -m "feat: add project product artifacts"
```

---

### Task 5: Finish Responsive Navigation, Layout, and Static Accessibility

**Files:**

- Create: `app/portfolio/ui/site-nav.test.tsx`
- Modify: `app/portfolio/ui/site-nav.tsx`
- Modify: `app/portfolio/portfolio-page.module.css`
- Modify: `app/portfolio/orbit/orbit-stage.module.css`
- Modify: `app/portfolio/projects/artifacts/artifacts.module.css`
- Modify: `app/globals.css`

**Interfaces:**

- `SiteNav` reuses `Sheet`, `SheetTrigger`, `SheetContent`, `SheetTitle`, and `SheetClose` from `@/components/ui/sheet`.
- Mobile enhancement preserves a `<noscript>` navigation fallback.
- Stable hooks: `[data-nav]`, `[data-mobile-menu]`, `[data-project-cycle]`, and `[data-project-artifact]`.

- [ ] **Step 1: Write failing keyboard and destination tests for navigation**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LINKEDIN_URL } from '../seo';
import { SiteNav } from './site-nav';

describe('SiteNav', () => {
  it('opens the mobile menu, closes on Escape, and restores focus', async () => {
    const user = userEvent.setup();
    render(<SiteNav />);
    const trigger = screen.getByRole('button', { name: 'Open navigation' });
    await user.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('uses approved anchors and the exact LinkedIn destination', () => {
    render(<SiteNav />);
    expect(screen.getAllByRole('link', { name: 'Work' })[0]).toHaveAttribute('href', '#work');
    expect(screen.getAllByRole('link', { name: 'Studio' })[0]).toHaveAttribute('href', '#studio');
    expect(screen.getAllByRole('link', { name: 'Contact' })[0]).toHaveAttribute('href', '#contact');
    expect(screen.getAllByRole('link', { name: 'Connect on LinkedIn' })[0]).toHaveAttribute('href', LINKEDIN_URL);
  });
});
```

- [ ] **Step 2: Run the test and verify it fails before the Sheet behavior exists**

Run `npm test -- app/portfolio/ui/site-nav.test.tsx`.

Expected: FAIL because the menu trigger/dialog behavior is absent.

- [ ] **Step 3: Implement the compact mobile Sheet**

Use the existing Base UI-backed Sheet and Button components. The trigger has `aria-label="Open navigation"`, a 44-pixel minimum size, and a simple three-line icon made from semantic spans. The Sheet title is `Navigation`; each anchor is wrapped in `SheetClose` so choosing it closes the dialog. Preserve the full desktop links and add a `<noscript>` list containing Work, Studio, Contact, and LinkedIn for JavaScript-disabled mobile visitors.

- [ ] **Step 4: Compose each required viewport instead of scaling one layout**

Implement these explicit CSS ranges plus fluid interpolation:

```css
@media (max-width: 479px) {
  .chapter { padding: 4rem 1rem; }
  .chapterGrid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 2rem; }
  .projectNav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .projectNav a { min-height: 44px; }
}
@media (min-width: 480px) and (max-width: 1023px) {
  .chapter { padding: 5rem var(--page-gutter); }
  .chapterGrid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 3rem; }
  .projectNav { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .chapterGrid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 4rem; align-items: center; }
}
@media (min-width: 1920px) {
  .chapterGrid { max-width: 90rem; margin-inline: auto; }
}
```

Use `clamp()` for heading size, section padding, and gaps. Keep line lengths at `--text-max`, use `minmax(0, 1fr)` for grid tracks, and set `min-width: 0` on every grid/flex child containing code or SVG.

- [ ] **Step 5: Finish static and reduced-mode behavior**

- The fallback image remains visible when no canvas is mounted.
- Every project section stays in normal flow with no sticky positioning in the foundation.
- `prefers-reduced-motion` transitions remain at or below 150 ms.
- `noscript` content contains all navigation actions.
- Decorative images use empty alt text; supplied identity marks use accurate Bregalda alternatives.
- External links have descriptive names and `rel="noreferrer"`.
- Page content remains readable at 200% zoom and no meaningful word is clipped.

- [ ] **Step 6: Run component, formatting, lint, and type checks**

```bash
npm test -- app/portfolio/ui/site-nav.test.tsx app/portfolio/portfolio-page.test.tsx
npm run format
npm run format:check
npm run check
```

Expected: all commands PASS.

- [ ] **Step 7: Commit responsive and accessibility behavior**

```bash
git add app/globals.css app/portfolio
git commit -m "feat: compose responsive accessible portfolio layouts"
```

---

### Task 6: Complete Sharing, Crawling, and Foundation Verification

**Files:**

- Modify: `app/layout.tsx`
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Modify: `app/portfolio/media-assets.test.ts`
- Create: `public/og.png`
- Modify: `README.md`

**Interfaces:**

- Open Graph and X both use absolute `https://bregalda.com/og.png`.
- `robots.ts` permits `/` and points to `https://bregalda.com/sitemap.xml`.
- `sitemap.ts` emits exactly one canonical URL.

- [ ] **Step 1: Extend the failing media contract for the social card**

Add to `media-assets.test.ts`:

```ts
it('ships a PNG social card below 1 MB', async () => {
  const path = new URL('../../public/og.png', import.meta.url);
  const [bytes, info] = await Promise.all([readFile(path), stat(path)]);
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(info.size).toBeLessThan(1024 * 1024);
});
```

Run `npm test -- app/portfolio/media-assets.test.ts` and expect the social-card assertion to fail because `public/og.png` is absent.

- [ ] **Step 2: Generate exactly one branded social-card candidate**

Dispatch exactly one image-generation subagent with `fork_turns="none"`. Instruct it to make one imagegen request, save the result outside the Site checkout, return only the path, and not invoke Sites skills/tools, edit source, initialize another Site, or spawn agents. Use this brief:

```text
Create a 1200×630 premium social card for Bregalda using only warm cream #FCFBF8, deep ink #2A2140, Bregalda purple #4B2E83, signal yellow #F5C400, and ship green #22C55E. Use the supplied Bregalda primary lockup faithfully. Show the exact headline “Thoughtful tools for real technical problems.” and the exact supporting line “Independent software studio by Ricardo Bregalda.” as crisp, legible typography. Surround it with the same tactile four-planet orbital atmosphere as the portfolio, restrained and editorial, not a generic AI landing page. No extra words, invented logos, blue/cyan/red hues, gradients in text, stock space photography, interface HUD, or clutter.
```

Inspect the returned image for exact text and brand fidelity. Retry once only if unusable. Save its source outside the checkout at `/root/me/bregalda-og-source.png`, then run `node scripts/optimize-image.mjs /root/me/bregalda-og-source.png public/og.png 1200 630`.

- [ ] **Step 3: Wire social metadata and crawl files**

Add Open Graph and X image objects with width `1200`, height `630`, and alt `Bregalda — Thoughtful tools for real technical problems`. Create `robots.ts` and `sitemap.ts` using `SITE_URL`; do not add routes beyond `/`.

- [ ] **Step 4: Update the README to describe the implemented foundation**

State that the portfolio is English, static-content-first, progressively enhanced, and backed by tests. Keep development commands accurate: `npm ci`, `npm run dev`, `npm test`, `npm run check`, and `npm run build`.

- [ ] **Step 5: Run complete foundation verification**

```bash
npm run format:check
npm run check
npm run test:coverage
npx --yes --package node@22.13.0 --call 'npm run build'
git status --short
```

Expected: formatting, lint, type checking, coverage thresholds, and production build all pass; `git status --short` shows only the intended Task 6 files.

- [ ] **Step 6: Commit the completed static foundation**

```bash
git add app/layout.tsx app/robots.ts app/sitemap.ts app/portfolio/media-assets.test.ts public/og.png README.md
git commit -m "feat: complete portfolio metadata and sharing"
```

## Foundation Completion Check

- The first viewport contains the real Bregalda identity, orbital artwork, and four named project destinations.
- All four project chapters, artifacts, facts, GitHub links, studio copy, and LinkedIn CTAs are present without JavaScript.
- The 320, 360, 390, 768, 1024, 1440, 1920, and 2560 CSS-pixel compositions have explicit layout rules.
- The page is ready for the motion plan without moving semantic content into WebGL.
- Unit/component tests, coverage thresholds, formatting, lint, type checking, and the production build pass.
