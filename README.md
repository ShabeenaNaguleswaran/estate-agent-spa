# Meridian — Property Search

A client-side property search application, built for **5COSC026W Advanced
Client-Side Web Development**. No server, no backend, no API. Everything runs
in the browser from a static bundle.

**Live:** https://<username>.github.io/estate-agent-spa/
**Repository:** https://github.com/<username>/estate-agent-spa

---

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script                  | Purpose                            |
| ----------------------- | ---------------------------------- |
| `npm run dev`           | Development server with hot reload |
| `npm run build`         | Production build to `dist/`        |
| `npm run preview`       | Serve the production build locally |
| `npm test`              | Run the Jest suite                 |
| `npm run test:coverage` | Run with a coverage report         |
| `npm run deploy`        | Build and publish to GitHub Pages  |

> Test the Content Security Policy against `npm run preview`, not `npm run dev`.
> Vite injects hot-reload client code in development that a strict policy
> correctly blocks.

---

## What it does

Searches seven properties by five criteria — **type, price range, bedroom
range, date added, and postcode area** — in any combination. Results can be
shortlisted by pressing a heart or by dragging a card onto the shortlist rail,
and removed by pressing a delete button or by dragging the item back out.

Each property has its own page with a photograph gallery, a floor plan, and a
map.

---

## Stack

| Choice                            | Why                                                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **React 18 + Vite**               | Vite for the build; no CRA, no webpack config to maintain                                                                          |
| **HashRouter**                    | GitHub Pages is a static host with no rewrite rules — see below                                                                    |
| **react-widgets**                 | Every form control is an enhanced widget: DropdownList, NumberPicker, DatePicker, Combobox                                         |
| **react-tabs**                    | Implements the WAI-ARIA tabs pattern correctly — roving tabindex, arrow-key navigation                                             |
| **Context + useReducer**          | The shortlist is a state machine with four transitions and one invariant. A reducer makes that invariant enforceable in one place. |
| **Native HTML5 drag and drop**    | No library. Five events, zero dependencies.                                                                                        |
| **Plain CSS + custom properties** | No Tailwind, no Bootstrap. The brief requires hand-written media queries.                                                          |
| **Jest + React Testing Library**  | 80 tests across 6 suites                                                                                                           |

---

## Architecture

src/
├── data/
│ └── properties.json 7 properties — the entire dataset
├── utils/
│ ├── filterProperties.js PURE. The search algorithm.
│ ├── format.js PURE. Price, date, bedroom formatting.
│ ├── assets.js Resolves paths against the GitHub Pages base
│ ├── baseUrl.js Isolates Vite's import.meta.env
│ └── dragTypes.js The drag-and-drop contract
├── context/
│ ├── favouritesReducer.js PURE. The shortlist state machine.
│ ├── FavouritesContext.jsx Provider — localStorage, effects, impurity
│ └── useFavourites.js Consumer hook
├── components/
│ ├── layout/ Header, Footer
│ ├── search/ SearchForm (react-widgets)
│ ├── results/ ResultsList, PropertyCard
│ ├── favourites/ FavouriteButton, FavouritesRail, FavouriteItem
│ └── property/ ImageGallery, PropertyTabs, FloorPlan, PropertyMap
├── pages/ SearchPage, PropertyPage, NotFound
└── styles/ variables, global, responsive

### The organising principle

**Logic is pure and lives outside React. Components render it.**

The search algorithm is a pure function. The shortlist is a pure reducer.
Neither imports React, touches the DOM, or reads `localStorage`. All of that
lives in the provider and the components.

That boundary is not decorative — it is what makes the two most important
behaviours in the application testable without mounting anything:

- `filterProperties.js` — every combination of one to five criteria, 100% branch coverage
- `favouritesReducer.js` — including duplicate prevention, 100% branch coverage

Both thresholds are **enforced in `jest.config.cjs`**. A regression fails the
test command rather than shipping quietly.

---

## Three decisions worth explaining

### 1. HashRouter, not BrowserRouter

GitHub Pages is a static file server with no rewrite rules. A deep link like
`/property/prop3` would 404 on refresh, because no such file exists on disk.

The standard workaround is to copy `index.html` to `404.html` and add an
**inline script** that rewrites the URL. That inline script would have required
`'unsafe-inline'` in `script-src` — the one CSP directive that actually stops
XSS.

Hash routing needs no such script. **The routing decision and the security
decision are the same decision.**

### 2. Duplicate prevention has exactly one implementation

A property can be shortlisted two ways: the heart button, and dragging the card
onto the rail. The obvious implementation guards against duplicates in both
places — and the moment those two guards drift apart, a property can be added
twice.

Instead, both paths dispatch the same `ADD` action, and the guard lives in the
reducer. **Neither the button nor the rail checks first.** There is one code
path by which a favourite can be added, so there is one place for the rule to
live. Asserted in `tests/favouritesReducer.test.js` and again, through the
interface, in `tests/PropertyCard.test.jsx`.

### 3. `formatDate` does not use `Intl.DateTimeFormat`

The results grid renders dates in a monospaced column with tabular figures, and
the alignment across every card depends on every month abbreviating to the same
width. That is a hard layout constraint.

`Intl` does not guarantee it. Current CLDR data abbreviates September as
`Sept` — four characters where every other month is three — and the
abbreviations vary by locale and by Node's ICU build. A hard constraint cannot
be delegated to a library that does not promise to honour it, so `formatDate`
owns a twelve-entry month table. `tests/format.test.js` asserts every date comes
out at exactly eleven characters.

---

## Design

**Concept: the surveyor's spec sheet.** Property listings come from a world of
floor plans, land registry entries and survey records — precise, measured,
data-forward. Not soft and lifestyle-driven.

**Two typefaces, and the split between them carries meaning.** Archivo for
everything structural; **IBM Plex Mono with tabular figures for every number** —
price, bedrooms, postcode, date. That treatment is why a column of prices in
the results grid aligns perfectly across cards, and it is what makes the grid
read as a record of properties rather than a list of products.

**Five colours.** Deep petrol ink, cool putty canvas, hairline borders, a
signal green for actions, and an oxblood reserved _exclusively_ for the
shortlist. Because that oxblood appears nowhere else, it reads unambiguously
wherever it shows up.

**Borders, not shadows. 2px corners, not pills.** One shadow exists in the
entire application, on the card hover lift.

---

## Responsive

One breakpoint: **1024px** — iPad landscape, taken from the specification.

Above it, two columns with the shortlist rail docked and sticky. Below it, a
single column with the rail moved _above_ the results, because a favourites
list below a fold of property cards on a phone is not, in any meaningful sense,
"displayed on the search page".

Between those states the layout adapts continuously — the grids are
`auto-fill/minmax`, the type is `rem`, and the prose measure is capped in `ch`.
Adding breakpoints at 768px and 480px would be treating the symptoms of a
layout that was not fluid to begin with.

Two **pointer-capability** queries do work that width queries cannot:
`hover: none` disables the card lift on touch (where a `:hover` rule fires on
tap and then sticks), and `pointer: coarse` enforces a 44px minimum on every
icon button — catching the touchscreen-laptop case a width query misses.

**Full justification: [`docs/RESPONSIVE.md`](docs/RESPONSIVE.md)**

---

## Security

A Content Security Policy with `script-src 'self'` — no inline scripts, no
`eval`, and exactly one third-party origin in the entire policy (the Google
Maps frame). `connect-src 'self'` means an injected script would have nowhere
to send stolen data; `form-action 'none'` means an injected phishing form would
have nowhere to submit.

`dangerouslySetInnerHTML` is used nowhere. That is not merely claimed — it is
**enforced**: `tests/security.test.js` walks every source file and fails the
suite if it, `eval`, or `new Function` appears.

**Full documentation: [`SECURITY.md`](SECURITY.md)**

---

## Testing

```bash
npm test
```

| Suite                       | Covers                                                           |
| --------------------------- | ---------------------------------------------------------------- |
| `filterProperties.test.js`  | Search: every criterion alone, and all five combined             |
| `favouritesReducer.test.js` | Add, remove, clear, hydrate — including duplicate prevention     |
| `format.test.js`            | Price, date and bedroom formatting, including fixed-width months |
| `PropertyCard.test.jsx`     | Card content and the favourite toggle, driven through the UI     |
| `SearchForm.test.jsx`       | All eight widgets, criteria reporting, range validation          |
| `security.test.js`          | CSP directives, the JSX encoding guarantee, the map embed        |

**80 tests. 100% branch coverage on `filterProperties` and `favouritesReducer`,
enforced by a threshold.**

Component tests query by **accessible role and name**, never by class name — so
they break when the interface stops being _usable_, not when it is restyled.

---

## Deployment

```bash
npm run deploy
```

Builds and publishes `dist/` to the `gh-pages` branch. `vite.config.js` sets
`base: '/estate-agent-spa/'`, which must match the repository name for asset
paths to resolve on the live site.

---

_This is individual coursework. All code is my own._
