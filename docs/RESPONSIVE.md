# Responsive design — technical justification

Meridian property search · 5COSC026W

## Summary

Two layouts, one breakpoint, hand-written media queries. No CSS framework,
no utility classes, no responsive library. The breakpoint is 1024px, which
is iPad landscape width, taken directly from the specification.

---

## 1. Why one breakpoint and not four

The brief asks for **two layouts**: large screen, and smaller than iPad
landscape. It does not ask for four, and adding more would be worse, not
better.

A layout that needs a breakpoint every 300px is a layout that is not fluid.
Between the two states this design adapts continuously, because:

- **Grids size themselves.** The results grid is
  `repeat(auto-fill, minmax(300px, 1fr))`. The column count is a consequence
  of the available width, not a number hard-coded per breakpoint. It renders
  three columns at 1400px, two at 1100px, and one at 700px without a single
  media query being involved.
- **The type scale is relative.** Sizes are in `rem`, so they respond to the
  user's own browser font setting — a user who has set 20px base text gets a
  proportionally larger interface, which a `px` scale would silently override.
- **Measure is capped in `ch`.** Prose blocks are `max-width: 68ch`, so the
  line length stays readable at any width without being told what the width is.

The single breakpoint exists for the one thing that genuinely cannot be
expressed fluidly: **a structural change of layout**, described below.

## 2. What changes at 1024px, and why

| Element                | Above 1024px                                         | At or below 1024px                                                        | Reason                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search layout**      | Two columns: `minmax(0, 1fr)` results + `300px` rail | One column                                                                | A 300px rail beside a results grid needs ~1000px to leave the grid usable. Below that the rail is stealing space the content needs.                                                                                                                                                                                                                             |
| **Shortlist rail**     | Docked right, `position: sticky`                     | Full width, moved **above** the results (`order: -1`), `position: static` | Two reasons. **(a)** The brief requires the favourites list to be _displayed on the search page_; below a fold of property cards on a phone, it effectively is not. Moving it above keeps the requirement honestly met. **(b)** A sticky element that is now full-width would occupy most of a phone viewport as the user scrolls, which is worse than useless. |
| **Search form**        | Five columns (`auto-fit, minmax(220px, 1fr)`)        | One column — but the min/max **pairs stay side by side**                  | The pairs are semantically linked; stacking "minimum price" above "maximum price" makes them read as two unrelated fields. They remain legible at half width because they contain short numeric values.                                                                                                                                                         |
| **Results grid**       | `auto-fill, minmax(300px, 1fr)`                      | Forced to `1fr`                                                           | A two-up grid at tablet width squeezes the card until the spec strip's date (`12 SEP 2025`) wraps to a second line — which destroys the vertical alignment the entire design depends on.                                                                                                                                                                        |
| **Card image**         | `4 / 3`                                              | `16 / 9`                                                                  | Cards are full width in the compact layout. A 4:3 image on a 390px-wide card is 292px tall and pushes the price below the fold. A wider crop keeps the price visible.                                                                                                                                                                                           |
| **Gallery thumbnails** | 104px column beside the main image                   | Horizontal strip **below**, with `scroll-snap`                            | A 104px column beside a full-width image at tablet size leaves the main photograph too narrow to be worth looking at.                                                                                                                                                                                                                                           |
| **Property header**    | Details left, shortlist button right                 | Stacked, button last                                                      | The user should read _what the property is_ before being asked to shortlist it.                                                                                                                                                                                                                                                                                 |
| **Tab strip**          | Three tabs, fixed                                    | Horizontally scrollable, `white-space: nowrap`                            | Allowing the tabs to wrap onto two rows breaks the underline that indicates the active tab. Scrolling preserves the affordance.                                                                                                                                                                                                                                 |
| **Type scale**         | `--text-2xl: 2rem`                                   | `1.625rem`                                                                | A 40px h1 at 390px consumes a third of the viewport before any content appears. The scale is compressed but the _ratio_ between levels is preserved, so hierarchy survives.                                                                                                                                                                                     |

## 3. Layout techniques and why each was chosen

**CSS Grid for structure.** The search layout is
`grid-template-columns: minmax(0, 1fr) var(--rail-width)`.

The `minmax(0, 1fr)` rather than a plain `1fr` is deliberate and is the sort
of thing that silently breaks a layout. A grid track defaults to a minimum
of `min-content` — so a long, unbroken property title would push the results
column wider than its allotted share and squeeze the rail. `minmax(0, 1fr)`
sets the floor to zero, so the track can shrink and the rail keeps its 300px.

**Grid `auto-fill` for the results.** The column count is derived from the
available width, not declared. This is what allows the same grid to work
both with the rail docked beside it (stealing 300px) and without it in the
compact layout — a `repeat(3, 1fr)` would have needed rewriting at every
breakpoint and would still be wrong at intermediate widths.

**Flexbox for components.** Cards, the rail header, the spec strip, and the
tab list are all one-dimensional arrangements of items along a single axis —
which is what flexbox is for. Grid is used only where two axes genuinely
interact.

**`aspect-ratio` rather than the padding-top hack.** Every image container
reserves its space before the image loads. This eliminates cumulative layout
shift: the grid does not reflow as images arrive.

## 4. Beyond width: input capability

Viewport width is a **proxy** for input method, and a poor one. A 1280px
touchscreen laptop exists. So does a 900px browser window on a desktop with
a mouse. Where the concern is genuinely about _input_ rather than _space_,
a width query is the wrong tool.

Two capability queries are used:

**`@media (hover: none)`** disables the card hover lift on touch devices.
This is not cosmetic. A `:hover` rule on a touch device fires on tap and
then _remains applied_ until the user taps elsewhere — so a tapped card sits
there lifted and shadowed, which reads as a rendering bug. This is a very
common shipped defect.

**`@media (pointer: coarse)`** enforces a 44×44px minimum on all icon
buttons — the favourite heart, the gallery arrows, the lightbox controls.
44px is Apple's and Google's recommended minimum touch target (WCAG 2.2's
floor is 24px). This query catches the touchscreen-laptop case that a width
query would miss entirely.

## 5. Where the media queries live

Component-specific rules live **in the component's own stylesheet**, at the
bottom of the file, immediately below the desktop rules they modify. A single
`responsive.css` holding every override would mean that changing a card's
layout requires editing two distant files and keeping them in sync.

`src/styles/responsive.css` holds only the **cross-cutting** concerns that
belong to no single component: overflow containment, the type scale
compression, touch target sizing, the pointer-capability queries, and print.

The breakpoint value `1024px` is repeated literally in each file, because
**CSS custom properties cannot be used inside a `@media` condition** — a
limitation of the cascade, not a choice. It is documented in
`variables.css` so the repetition is intentional and traceable rather than
accidental.

## 6. Accessibility baked into the responsive layer

- **`prefers-reduced-motion: reduce`** — every animation and transition is
  reduced to 0.01ms. The favourite button's bounce, the tab fade, the
  lightbox fade, the card lift. The information those animations carry is
  always also carried by a state change that does not move.
- **Relative units throughout** — a user who has increased their browser's
  base font size gets a proportionally larger interface. A `px` type scale
  would silently override that preference.
- **Focus is visible at every width** — `:focus-visible` outlines are not
  suppressed in the compact layout.

## 7. Tested at

| Width  | Device         | Result                                               |
| ------ | -------------- | ---------------------------------------------------- |
| 1440px | Desktop        | Three-column grid, rail docked                       |
| 1280px | Laptop         | Two-column grid, rail docked                         |
| 1024px | iPad landscape | **Switch point** — layout collapses to single column |
| 834px  | iPad portrait  | Single column, rail above results                    |
| 768px  | Small tablet   | Gallery thumbnails horizontal                        |
| 430px  | iPhone Pro Max | All touch targets ≥44px                              |
| 390px  | iPhone         | Type scale compressed, no overflow                   |
| 320px  | iPhone SE      | No horizontal scrollbar                              |
