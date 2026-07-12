# Security

Client-side hardening for the Meridian property search application.

## 1. Content Security Policy

Declared as a `<meta http-equiv="Content-Security-Policy">` in `index.html`.
A meta-tag policy rather than an HTTP header because the application is
deployed to GitHub Pages, a static host which does not permit custom
response headers.

| Directive     | Value                     | Reasoning                                                                                                                                                                                                                            |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `default-src` | `'self'`                  | Deny by default. Every other directive is a deliberate exception to this.                                                                                                                                                            |
| `script-src`  | `'self'`                  | No inline scripts, no third-party scripts, no `eval`. This is why the router is a HashRouter: the usual GitHub Pages `404.html` redirect for a BrowserRouter requires an inline script and would have forced `'unsafe-inline'` here. |
| `style-src`   | `'self' 'unsafe-inline'`  | Vite injects the bundled stylesheet inline at build time. This is the one relaxation in the policy. It is limited to styles, not scripts — a CSS injection cannot execute code.                                                      |
| `img-src`     | `'self' data:`            | Property photographs are served from our own origin. `data:` covers inlined SVG icons.                                                                                                                                               |
| `font-src`    | `'self'`                  | Archivo and IBM Plex Mono are self-hosted via `@fontsource` and bundled by Vite. Loading them from Google Fonts would have required adding `fonts.googleapis.com` and `fonts.gstatic.com` as trusted origins.                        |
| `frame-src`   | `https://maps.google.com` | The only third-party origin the policy permits. Required for the Google Map on the property page.                                                                                                                                    |
| `object-src`  | `'none'`                  | Blocks `<object>`, `<embed>` and `<applet>` — legacy plugin vectors with no legitimate use here.                                                                                                                                     |
| `base-uri`    | `'self'`                  | Prevents an injected `<base>` tag from re-pointing every relative URL on the page at an attacker's origin.                                                                                                                           |
| `form-action` | `'none'`                  | The application submits no forms to a server; the search form is handled entirely in JavaScript.                                                                                                                                     |

## 2. JSX encoding

React escapes any value interpolated into JSX before inserting it into the
DOM. A property description containing `<script>alert(1)</script>` renders as
that literal text, not as an executing script.

This protection is only lost if `dangerouslySetInnerHTML` is used.
**It is not used anywhere in this codebase.** The long property description
is rendered by splitting on newlines and mapping to `<p>` elements, each
receiving the text as a JSX child — which is escaped.

Verify with:

```bash
grep -r "dangerouslySetInnerHTML" src/
```

Expected output: nothing.

## 3. Iframe sandboxing

The Google Map is embedded with `sandbox="allow-scripts allow-same-origin"`.
Maps requires both to function; everything else the sandbox would otherwise
permit — form submission, top-level navigation, popups, plugins, pointer
lock — is withheld. Omitting the `sandbox` attribute entirely would grant
the frame all of them.

The map uses the **keyless** classic embed URL
(`maps.google.com/maps?q=...&output=embed`) rather than the Google Maps
Embed API. The Embed API requires an API key, which on a public repository
would mean committing a credential to source control and shipping it in the
client bundle. Avoiding an exposed secret was judged more important than the
Embed API's additional features.

## 4. Untrusted input

Two sources of input are treated as untrusted:

- **The search form.** Values reach a pure filter function that performs
  comparisons only — no string interpolation into the DOM, no `eval`, no
  dynamic property access on the dataset.
- **`localStorage`.** The persisted shortlist is user-editable via devtools.
  The `HYDRATE` case of the favourites reducer validates the payload — it
  discards non-arrays, non-string entries and duplicates — rather than
  trusting it. See `tests/favouritesReducer.test.js`.

## 5. Drag-and-drop payloads

The shortlist rail is a drop target. It accepts only a custom MIME type
(`application/x-meridian-property`) and ignores anything else, so a file, a
URL or a text selection dragged in from another tab is discarded rather than
parsed. The payload is JSON-parsed inside a `try/catch` and validated before
use.

## 6. External links

There are no outbound links to third-party sites. Were any added, they would
carry `rel="noopener noreferrer"` to prevent the opened page from accessing
`window.opener`.
