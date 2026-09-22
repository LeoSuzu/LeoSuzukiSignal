# Leo Suzuki Signal — implementation

Specification: [SITE_PLAN.md](SITE_PLAN.md). The user requested implementation of this existing design.

## Design

Charcoal #101518, panel #171e22, warm white #eeeae2, blue-grey #a2b1ba,
cyan #82cbd0 and amber #e5b879. Left-aligned editorial content occupies
the main column; a fixed section navigator and contextual terminal occupy
the right. Large condensed system typography makes the name distinctive;
monospace is reserved for navigation and terminal readouts. Own photographs
and project screenshots supply the imagery. No external runtime dependencies.

## Delivery checklist

- [x] Replace index.html with seven semantic sections, complete source content,
  native project disclosures, contact links and CV download.
- [x] Create style.css with responsive two-column layout, mobile status bar,
  visible focus, SVG motion and reduced-motion treatment.
- [x] Create script.js for section selection, terminal summaries and graphics,
  progress, one scheduled animation frame per scroll, and mobile close/reopen.
- [x] Add dependency-free Node build, local server, asset validation and Pages
  workflow. Publish only assets referenced by the site, preserving all originals.
- [x] Validate dist links and syntax, exercise interactions and responsive layout
  where local browser tooling is available. Document preview and deployment.

## Content provenance

SITE_PLAN.md, the supplied index.html, and read-only reference to
../MyCVSite/index.html. The supplied CV and project media are reused.
The old site is never modified. External project destinations are preserved
from the source; no new claims about their current availability are made.

## Verification — 2026-09-15

`npm test`: 3 passing checks. `npm run build`: 19 referenced public files.
Chromium checks against dist passed for all seven section summaries and unique
SVG graphics, sticky companion position, all eight keyboard-operated disclosures,
320/390/768/1024px layouts without horizontal overflow, mobile close/reopen and
focus return, reduced motion, no-JavaScript disclosure, CV retrieval and video
byte ranges. Desktop (1440px) and mobile (390px) screenshots were visually reviewed.
External destinations retain their original values; their availability was not tested.
GitHub Pages workflow is prepared but has not been executed or published.
