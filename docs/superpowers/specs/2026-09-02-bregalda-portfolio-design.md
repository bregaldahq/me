# Bregalda Portfolio Experience Design

**Status:** Approved in conversation on 2026-09-02; project 04 replaced with ChaosSQL by user request on 2026-09-04
**Repository:** `https://github.com/bregaldahq/me`  
**Primary language:** English  
**Primary conversion:** Open Ricardo Bregalda's LinkedIn profile

## Product goal

Build a visually distinctive portfolio for Bregalda, an independent software
studio founded by Ricardo Bregalda. The site must make a strong first impression,
demonstrate engineering ability through four real projects, and help generate
employment and freelance opportunities.

The brand statement is:

> Bregalda builds thoughtful tools for real technical problems.

The experience should evoke the calm, cinematic polish of an Apple product page
without copying Apple assets or layouts. It must feel deliberately art-directed,
not like a generic template or an AI-generated landing page.

## Audience and conversion

The primary audiences are engineering leaders, recruiters, founders, product
leaders, and potential freelance clients evaluating Ricardo's technical range and
judgment.

The primary CTA is `Connect on LinkedIn`, linking to
`https://www.linkedin.com/in/ricardomeneguzzibregalda`. It appears in the
persistent navigation, after the project sequence, and in the final contact
section. GitHub repository links are secondary CTAs attached to each case study.

The site does not include a contact form. LinkedIn is the single contact path so
the interface stays focused and does not require a backend, spam protection, or
message storage.

## Experience principles

1. **Projects are worlds, not cards.** Each project is represented by a planet
   with its own atmosphere, motion, interface, and technical evidence.
2. **Motion explains the story.** Scroll motion selects a project, approaches its
   planet, reveals its product surface, and returns to orbit. Motion is never
   decoration that competes with content.
3. **Real artifacts create credibility.** Project chapters show representative
   interfaces, code, architecture, outputs, and verified repository facts instead
   of fake dashboards or invented metrics.
4. **Clarity controls spectacle.** Large typography, disciplined spacing, clear
   hierarchy, and restrained copy prevent the 3D scene from becoming noisy.
5. **Every device gets a composed experience.** Mobile, tablet, laptop, desktop,
   ultrawide, touch, pointer, keyboard, and reduced-motion modes are designed as
   first-class variants.

## Brand system

### Identity

Bregalda is the lead identity. Ricardo is introduced once as the founder:

> Bregalda is an independent software studio founded by Ricardo Bregalda.

Use the supplied SVGs directly. Do not recreate the wordmark, monogram, sparkle,
or lockups in CSS or replace them with text, initials, emoji, or a generic icon.

The source assets remain in `public/brand/`:

- `bregalda_primary_lockup.svg`
- `bregalda_secondary_lockup.svg`
- `bregalda_wordmark.svg`
- `bregalda_monogram.svg`
- `icone_bregalda.svg`

The primary lockup carries the `BUILD • LEARN • SHIP` line. The secondary lockup
carries `SOFTWARE ENGINEERING`. Use the wordmark in the main navigation, the
monogram at the center of the orbital system, the primary lockup in the studio
section, and the secondary lockup only where the full engineering descriptor is
needed.

### Color

The canonical interface tokens come from `bregalda_palette.svg`:

- Warm cream: `#FCFBF8`
- Deep ink: `#2A2140`
- Bregalda purple: `#4B2E83`
- Signal yellow: `#F5C400`
- Ship green: `#22C55E`

Opacity variants of these colors are allowed. The source logo SVGs contain their
own purple, green, yellow, and white variants; those embedded colors remain
untouched when the assets render. No additional hue may be introduced into the UI.

### Typography

Use Inter as the variable display and body family. Use JetBrains Mono for compact
technical labels, statuses, code, and measurements. The custom Bregalda wordmark
remains the most geometric type element, so surrounding typography stays neutral,
precise, and spacious.

Use fluid type with `clamp()` and test every display line for wrapping. Headings
may be large, but no meaningful word may be clipped at 320 CSS pixels or at 200%
browser zoom.

### Anti-template constraints

Avoid gradient text, excessive rounded cards, generic glassmorphism, stock 3D
objects, floating technology logos, arbitrary dashboard statistics, repetitive
feature grids, oversized pill labels, and decorative copy that does not communicate
a real fact. Soft light, blur, and depth are allowed only as part of the orbital
atmosphere or product-stage composition.

## Information architecture

The site is a single English-language page with semantic landmarks and deep links:

1. Persistent navigation
2. Orbital opening and brand statement
3. ReconcileFlow project cycle
4. Aeternis Log project cycle
5. Workshop Management API project cycle
6. ChaosSQL project cycle
7. Bregalda studio statement
8. LinkedIn contact finale
9. Minimal footer with GitHub, LinkedIn, copyright, and reduced-motion-safe logo

Navigation links target `#work`, `#studio`, and `#contact`. The logo returns to the
top. A skip link targets the main content. Mobile navigation uses a compact menu
with a 44-by-44 CSS-pixel minimum touch target and no hover dependency.

## Scroll narrative

The first viewport shows all four project planets around the Bregalda monogram.
The planets are visible immediately; the opening must not require a click, drag,
or long loading animation.

Each project follows the same understandable cycle while preserving a distinct
visual identity:

```text
Orbit overview
    → selected planet gains emphasis
    → camera approaches while other planets recede
    → planet surface transforms into a product artifact
    → project premise and technical evidence appear
    → GitHub action becomes available
    → camera returns to the orbital system
    → orbital positions reorganize around the next project
```

The transitions form one continuous story. Section boundaries must not feel like
independent landing-page blocks. The orbital canvas persists across all four
cycles so the camera, lights, and planets can transition without remounting.

Native document scrolling remains in control. The implementation may use sticky
stages to provide visual time, but it must not intercept wheel or touch input,
apply artificial smooth scrolling, trap the user, or require scrolling through a
long empty segment after a scene has completed.

## Project narratives

### 01 — ReconcileFlow

**Headline:** `Logic you can inspect.`  
**Repository:** `https://github.com/bregaldahq/reconcileflow`

The chapter explains how two financial sources become deterministic,
reproducible, and auditable decisions. It highlights explicit normalization,
versioned matching rules, exact and tolerance-based matches, bounded split
matching, human review, append-only audit history, and evidence export.

The product artifact is a realistic reconciliation interface using synthetic data.
It shows result categories, a selected decision, the applied rule and version,
confidence, compared values, and evidence. Any visible metrics must be derived from
the repository's documented synthetic fixtures or clearly labeled demonstration
data.

The technical evidence names Python 3.12, FastAPI, PostgreSQL 17, Redis, Celery,
React 19, TypeScript, property-based testing, and the repository's verification
harness. The chapter may state the repository-documented quality snapshot of 84
backend tests, 10 frontend tests, 2 browser scenarios, and 86.42% backend coverage,
but it must label those values as a repository snapshot rather than live telemetry.

### 02 — Aeternis Log

**Headline:** `Proof that outlives the data.`  
**Repository:** `https://github.com/bregaldahq/aeternis-log`

The chapter explains the tamper-evident data anchoring flow: records are stored in
MongoDB, grouped into Merkle trees, and each batch root is anchored on Hyperledger
Fabric. An auditor can recompute the root and compare it with the immutable anchor.

The product artifact begins as individual records, compresses them into a Merkle
tree, and resolves into a proof certificate. The visual may expose a shortened
hash, verification status, batch identifier, and tree path using representative
demonstration values. It must not imply a live blockchain connection.

The technical evidence names the Go API, Gin, MongoDB, optional Redis caching,
Hyperledger Fabric with Raft consensus, Go chaincode, REST endpoints, and Go and
Python SDKs.

### 03 — Workshop Management API

**Headline:** `A business, modeled end to end.`  
**Repository:**
`https://github.com/bregaldahq/oficina-mecanica-tech-challenge`

The chapter follows a service order through vehicle reception, diagnosis, estimate
approval, service execution, inventory reservation, and delivery. The interaction
turns that business lifecycle into architectural layers so the viewer sees how the
domain maps to software boundaries.

The product artifact combines a realistic service-order timeline with a restrained
architecture cutaway. It highlights PHP 8.2 without an MVC framework, DDD, Clean
Architecture, MySQL 8, JWT, PHPUnit, PHPStan level 8, OpenAPI, Docker, Nginx,
Kubernetes autoscaling, Terraform, and GitHub Actions.

### 04 — ChaosSQL

**Headline:** `Turn chaos into a test.`
**Repository:** `https://github.com/bregaldahq/chaossql`

The chapter follows concurrent SQL operations from a failing invariant to a focused
reproduction. ChaosSQL stress-tests workloads, checks invariants, classifies
isolation anomalies, and reduces failing traces with causal delta debugging.

The artifact is a clearly labeled synthetic lost-update illustration based on
`examples/banking_lost_update/chaos.yaml`. Two transactions read balance 1000;
withdrawals of 50 and 100 write 950 and 900. The ledger implies 850 while the
overwritten account balance is 900. The visible invariant is
`actual_balance == expected_balance`. A trace → shrink → `repro_test.go` sequence
shows the tool's reproduction workflow, not a claimed live or measured output.
Do not invent timing, coverage, trace-reduction ratios, or engine guarantees.

Technical evidence names Go 1.25 (verified in `go.mod`, which supersedes the
README's older version label), SQLite, PostgreSQL, MySQL, seeded scheduling,
causal delta debugging, the Go testing SDK, HTML/JUnit reporting, and CI integration.
Scenario outcomes depend on database engine and isolation level.

During scroll, transactions interleave, the mismatched invariant gains emphasis,
and irrelevant trace detail recedes before the reproduction artifact is shown.
Keep every step readable in the static and reduced-motion variants.

## Studio and contact content

The studio section uses the approved copy structure:

- `Bregalda is an independent software studio founded by Ricardo Bregalda.`
- `Bregalda builds thoughtful tools for real technical problems.`
- `Build • Learn • Ship` appears only through the supplied primary lockup or as an
  accessible text alternative associated with that image.

The section briefly connects Ricardo's background in backend development,
production troubleshooting, software architecture, APIs, data systems, testing,
and distributed systems to the way Bregalda builds tools. It does not become a
full résumé timeline.

The contact finale asks visitors to discuss engineering roles, product work, or a
freelance project and links directly to LinkedIn. There is no vague `Get started`
CTA.

## Motion design

### Architecture

Use one lazily loaded Three.js scene, mounted once and shared across the complete
project sequence. React owns semantic content and controls; Three.js owns only the
planets, lighting, atmosphere, and camera. GSAP ScrollTrigger maps native scroll
progress to a deterministic scene timeline and DOM reveal variables. CSS handles
small hover, focus, press, and mask transitions.

No content is rendered as WebGL text. Product interfaces remain HTML so they are
sharp, responsive, selectable, indexable, and accessible.

### Planet treatment

Planets should feel tactile and atmospheric rather than like flat geometric
circles. Use lightweight spheres with original procedural noise, normal detail,
rim light, and brand-colored materials. Rings and orbital guides use low opacity
and disappear during close approaches. Do not use stock NASA imagery or unrelated
space photography.

Each project has a recognizable emphasis within the approved palette:

- ReconcileFlow: yellow signal light over purple and ink
- Aeternis Log: green verification light over deep purple
- Workshop API: warm yellow atmosphere with layered purple depth
- ChaosSQL: green transaction traces with yellow invariant signals over purple and ink

### Interaction

Pointer devices receive restrained parallax and planet tilt. Touch devices receive
press feedback and scroll-driven depth without requiring drag or device-orientation
permission. Keyboard users can navigate to every project and CTA without
interacting with the canvas.

The scene pauses when the document is hidden or the canvas is outside the active
story range. Resize and orientation changes recompute scene measurements without
reloading the page.

## Responsive behavior

### Small mobile: 320–479 CSS pixels

- Use a compact navigation with the real Bregalda mark and one menu control.
- Compose the orbital opening vertically, with a safe title area and four readable
  project labels outside crowded planet surfaces.
- Reduce visible atmospheric particles, shader detail, render resolution, and
  camera travel.
- Turn side-by-side project artifacts into a single reading column.
- Keep code and graph examples horizontally contained; never require page-level
  horizontal scrolling.
- Preserve 44-by-44 CSS-pixel interactive targets and safe-area insets.

### Large mobile and tablet: 480–1023 CSS pixels

- Increase orbital depth while retaining touch-first controls.
- Use portrait and landscape-specific camera framing.
- Allow selected project artifacts to overlap the atmospheric stage only when all
  text remains readable at 200% zoom.
- Avoid layouts that depend on a desktop pointer or precise dragging.

### Desktop: 1024–1919 CSS pixels

- Use the complete orbital composition, subtle pointer parallax, and layered
  product artifacts.
- Keep text columns within readable measures despite large display typography.
- Allow sticky project stages only while meaningful visual change is occurring.

### Ultrawide: 1920 CSS pixels and above

- Cap readable content width and camera expansion.
- Extend atmosphere into the additional space instead of stretching typography,
  project interfaces, or orbital distances indefinitely.

Use fluid interpolation rather than abrupt breakpoint-only scaling. The page must
remain complete and legible at 320-by-568, 360-by-800, 390-by-844, 768-by-1024,
1024-by-768, 1440-by-900, 1920-by-1080, and 2560-by-1440 CSS-pixel viewports.

## Accessibility and alternate modes

- Meet WCAG 2.2 AA contrast, keyboard, focus, semantics, naming, and target-size
  requirements.
- Use landmarks, logical heading order, descriptive links, and a skip link.
- Decorative canvas content is hidden from assistive technology. Equivalent text
  and project navigation exist in the DOM.
- Announce no continuous scroll progress through live regions.
- Honor `prefers-reduced-motion: reduce` on first render, without a flash of the
  animated state.
- Reduced motion replaces sticky travel and camera movement with static project
  compositions and short opacity changes of at most 150 milliseconds.
- If JavaScript is disabled, server-rendered brand, project summaries, repository
  links, studio copy, and LinkedIn CTA remain visible in normal document flow.
- If WebGL is missing, context creation fails, or the renderer is lost, swap the
  canvas for optimized static poster art and continue the DOM narrative.
- Respect `prefers-reduced-data` by skipping the WebGL bundle and large textures.

## Technical architecture

Retain the existing React 19, TypeScript, Vinext, Vite, Tailwind CSS, Cloudflare,
and OpenAI Sites-compatible foundation. Add Three.js, `@react-three/fiber`, GSAP,
Vitest, React Testing Library, Playwright, Axe for Playwright, and Lighthouse CI.

Use focused modules with these responsibilities:

- `app/page.tsx`: route entry and server-rendered page shell
- `app/layout.tsx`: English document metadata, fonts, social metadata, icons, and
  global providers
- `app/globals.css`: reset, brand tokens, typography, base accessibility rules,
  and no-JavaScript/reduced-motion defaults
- `app/portfolio/portfolio-page.tsx`: ordered semantic sections and enhancement
  boundaries
- `app/portfolio/project-data.ts`: typed static content for all four projects
- `app/portfolio/orbit/orbit-scene.tsx`: lazy Three.js canvas and renderer lifecycle
- `app/portfolio/orbit/planet.tsx`: reusable planet material, lighting, and
  performance-tier variants
- `app/portfolio/orbit/orbit-timeline.ts`: pure mapping from normalized story
  progress to active project, camera, planet, and light state
- `app/portfolio/motion/use-scroll-story.ts`: ScrollTrigger creation, refresh, and
  teardown
- `app/portfolio/projects/project-cycle.tsx`: reusable semantic project chapter
- `app/portfolio/projects/artifacts/`: one focused HTML/SVG artifact per project
- `app/portfolio/ui/`: navigation, studio, contact, footer, and motion-safe
  primitives
- `app/portfolio/performance.ts`: capability detection and high, medium, low, or
  static rendering tier

The project data model provides stable project IDs, ordering, English copy,
repository URLs, technologies, evidence items, planet theme, and artifact type.
Both the orbital scene and DOM chapters consume the same ordered project array so
labels, deep links, and transitions cannot drift apart.

Runtime data is local and static. Do not call the GitHub API from the visitor's
browser. Repository facts are editorial snapshots reviewed during implementation.

The data flow is:

```text
typed project data ──► semantic project chapters
        │
        └────────────► ordered planets and scene labels

native scroll ──► normalized timeline ──► camera/planet state
                                      └──► DOM reveal CSS variables

capability detection ──► high / medium / low / static rendering tier
```

## Performance requirements

- Largest Contentful Paint: at most 2.5 seconds on an emulated mid-range mobile
  device over Slow 4G in Lighthouse CI.
- Interaction to Next Paint: at most 200 milliseconds.
- Cumulative Layout Shift: below 0.1.
- Initial route JavaScript before the lazy orbital scene: at most 180 KB gzip.
- Lazy WebGL JavaScript: at most 250 KB gzip.
- Initial mobile image and texture transfer: at most 1.5 MB.
- Initial desktop image and texture transfer: at most 3 MB.
- Cap effective device pixel ratio at 1.0 for low tier, 1.25 for medium tier, and
  1.5 for high tier.
- Keep sustained animation near 60 frames per second on representative modern
  devices and at least 30 frames per second on the tested low-tier mobile profile.
  Automatically lower quality after repeated long frames rather than preserving
  effects at the cost of input responsiveness.

Reserve dimensions for every image and product artifact. Load the orbital bundle
after critical text and brand assets are available. Preload only the first project
texture; load later project assets near their story ranges.

## Error handling and resilience

The canvas boundary catches module-loading and runtime renderer errors and moves to
the static tier without hiding content. Listen for WebGL context loss, dispose GPU
resources on teardown, and avoid infinite renderer restart loops. A single failed
texture uses a project-specific solid or procedural fallback material.

External GitHub and LinkedIn links use normal anchors and remain functional without
client code. Missing non-critical decorative assets do not collapse section
dimensions. The page does not expose stack traces or raw errors to visitors.

## SEO and sharing

Set canonical metadata for `https://bregalda.com`, English title and description,
Open Graph and X metadata, a generated 1200-by-630 social card using the supplied
brand lockup, favicon assets, `robots` metadata, and a sitemap. Add Person and
Organization structured data that accurately describes Ricardo and Bregalda
without claiming a legal company status that was not provided.

All four projects appear as crawlable headings, summaries, and repository links in
the initial HTML. Canvas visuals do not carry unique SEO content.

## Test and review strategy

### Unit and component tests

- Validate project data completeness, ordering, unique IDs, URLs, and artifact
  mappings.
- Test timeline interpolation at the beginning, approach, reveal, evidence, return,
  and boundary points for all projects.
- Test capability-tier selection and WebGL failure fallback.
- Test navigation, menu focus management, escape behavior, project deep links, and
  CTA destinations.
- Test reduced-motion and reduced-data rendering before effects initialize.

### Browser tests

Use Playwright on Chromium, WebKit, and Firefox for:

- the complete orbit-to-project-to-orbit flow;
- keyboard-only navigation and visible focus;
- touch-sized controls and absence of horizontal overflow;
- resize and orientation changes during a project cycle;
- reduced-motion, reduced-data, JavaScript-disabled, and forced WebGL-failure modes;
- external repository and LinkedIn link attributes;
- console errors and renderer cleanup.

Use Axe in the representative desktop and mobile states. Add visual-regression
snapshots for the opening orbit, every selected planet, every product artifact, the
studio section, and the contact finale at the required viewport matrix.

### Manual visual QA

Verify physical or remote devices representing iOS Safari, Android Chrome, desktop
Safari, Chrome, Firefox, and Edge. Review scroll direction changes, fast flicks,
trackpads, mouse wheels, touch scrolling, browser zoom, text scaling, device safe
areas, tab restoration, and background/foreground transitions.

No animation is accepted solely because it looks correct in a desktop recording.

## CI/CD and delivery

The source of truth is the public repository `bregaldahq/me`. Pull requests and
pushes run deterministic install, formatting check, lint, type checking, unit
tests, browser tests, accessibility checks, production build, and performance
budgets. Deployment runs only from the protected `main` branch after required
quality checks pass.

After implementation and local verification, configure the user's GitHub and
Cloudflare sessions on their computer to:

1. Create a least-privilege Cloudflare API token.
2. Add the required account identifier and token as GitHub Actions secrets.
3. Connect the existing Cloudflare/Sites-compatible build to the new repository.
4. Deploy the production worker or site from `main`.
5. Attach and verify `bregalda.com` and HTTPS.
6. Run a production smoke test and verify the deployed commit SHA.

Never print secret values in terminal output, source files, CI logs, or chat.

## Explicitly out of scope

- A CMS, blog, admin interface, or runtime GitHub API integration
- A contact form, newsletter, authentication, database, or analytics dashboard
- Additional project detail routes in the first release
- Localization beyond English in the first release
- Scientific planetary simulation or stock space imagery
- Scroll hijacking, autoplay audio, cursor replacement, or required drag gestures
- Invented customer logos, testimonials, usage numbers, revenue, or live status

## Acceptance criteria

The implementation is ready for deployment only when all of the following are true:

1. The first viewport visibly contains the four planets and Bregalda identity.
2. Scroll transitions continuously from orbit to each project artifact and back to
   the reorganized orbital system.
3. The four approved project narratives use accurate, reviewable repository facts.
4. The supplied brand assets and approved SVG palette are used without redrawing or
   recoloring the identity.
5. LinkedIn is the primary CTA and every project has a working GitHub link.
6. All required viewport compositions pass without clipped content or page-level
   horizontal overflow.
7. Keyboard, screen-reader, reduced-motion, reduced-data, no-JavaScript, and WebGL
   fallback experiences preserve all essential content and actions.
8. Automated tests, accessibility checks, production build, and performance budgets
   pass in CI.
9. The production deployment comes from `bregaldahq/me` and the verified custom
   domain serves the same commit.
10. The final visual review confirms a polished, authored product narrative rather
    than a generic card-based portfolio.
