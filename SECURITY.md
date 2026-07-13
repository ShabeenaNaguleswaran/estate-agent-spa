# Security

Client-side hardening for the Meridian property search application.
5COSC026W · BCS criterion 2.1.9 (Knowledge of information security issues)

## Threat model

A client-side application with no server has a narrow but real attack surface.
Three things are worth defending:

1. **Cross-site scripting.** If an attacker can execute JavaScript in the
   page, they own the session. This is the primary threat.
2. **Exfiltration.** If they do execute, what can they send, and where?
3. **Untrusted input.** Two inputs cross a trust boundary: `localStorage`
   (user-editable in devtools) and drag-and-drop payloads (droppable from
   any other tab).

The measures below address each in turn.

---

## 1. Content Security Policy

Declared in `index.html` as a `<meta http-equiv>`, because GitHub Pages is a
static host and does not permit custom response headers. A meta-tag policy
silently ignores `frame-ancestors`, `report-uri` and `sandbox`, so those are
omitted rather than included and quietly doing nothing.

| Directive                   | Value                                            | Reasoning                                                                                                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `default-src`               | `'self'`                                         | Deny by default. Every line below is a deliberate exception to this one.                                                                                                                                                                                                                                                 |
| `script-src`                | `'self'`                                         | **The load-bearing directive.** No inline scripts, no third-party scripts, no `eval`. An injected `<script>` tag or `onerror=` attribute will not execute.                                                                                                                                                               |
| `style-src`                 | `'self' 'unsafe-inline'`                         | Vite injects the bundled stylesheet inline; this cannot be avoided without leaving Vite's CSS pipeline. It is an acceptable relaxation because **a CSS injection cannot execute JavaScript** — the XSS defence lives in `script-src`, and this is a defence-in-depth layer, not the primary one.                         |
| `img-src`                   | `'self' data:`                                   | Property photographs are served from our own origin. `data:` covers inlined SVG icons.                                                                                                                                                                                                                                   |
| `font-src`                  | `'self'`                                         | Archivo and IBM Plex Mono are self-hosted via `@fontsource` and bundled by Vite. **This was a deliberate choice made at the start of the project**: loading them from Google Fonts would have required trusting `fonts.googleapis.com` and `fonts.gstatic.com` here, and a policy full of exceptions is a weaker policy. |
| `frame-src`                 | `https://maps.google.com https://www.google.com` | The **only** third-party origins the policy permits. Required for the Google Map. Both are listed because Google redirects the embed between them.                                                                                                                                                                       |
| `connect-src`               | `'self'`                                         | The application is entirely client-side: no `fetch`, no XHR, no WebSocket. If an injected script did somehow execute, it would have **nowhere to send the data it stole**.                                                                                                                                               |
| `object-src`                | `'none'`                                         | Blocks `<object>`, `<embed>` and `<applet>` — legacy plugin vectors with no legitimate use here.                                                                                                                                                                                                                         |
| `base-uri`                  | `'self'`                                         | Prevents an injected `<base>` tag from re-pointing every relative URL on the page at an attacker's origin. Frequently omitted; cheap to include.                                                                                                                                                                         |
| `form-action`               | `'none'`                                         | The application posts no forms — the search is handled entirely in JavaScript. An injected phishing form therefore has nowhere to submit to.                                                                                                                                                                             |
| `upgrade-insecure-requests` | —                                                | Rewrites any stray `http://` subresource request to `https://`.                                                                                                                                                                                                                                                          |

### The router is a CSP decision

The application uses `HashRouter`, not `BrowserRouter`.

The usual way to make a `BrowserRouter` survive a page refresh on GitHub Pages
is to copy `index.html` to `404.html` and add an **inline script** that
rewrites the URL. That inline script would have required `'unsafe-inline'` in
`script-src` — which is the one directive that actually stops XSS.

Hash-based routing needs no such script, so the policy stays strict. The
routing decision and the security decision are the same decision.

---

## 2. JSX encoding

React escapes every value interpolated into JSX before inserting it into the
DOM. A property description containing `<script>alert(1)</script>` renders as
that literal text, not as an executing script.

That guarantee is lost in exactly one circumstance: the use of
`dangerouslySetInnerHTML`. **It is not used anywhere in this codebase.** The
long property description is rendered by splitting on newlines and mapping to
`<p>` elements, each receiving the text as a JSX child — which React escapes.

This is not merely asserted, it is **enforced by a test**:
`tests/security.test.js` walks every `.js` and `.jsx` file under `src/` and
fails if `dangerouslySetInnerHTML`, `eval()` or `new Function()` appears in
any of them.

Verify manually with:

```bash
grep -r "dangerouslySetInnerHTML" src/    # expected: no output
```

---

## 3. The map iframe

The only third-party content in the application.

**Keyless embed.** The map uses the classic embed URL
(`maps.google.com/maps?q=...&output=embed`) rather than the Google Maps Embed
API. The Embed API requires an API key, which on a public repository would
mean **committing a credential to source control and shipping it in the client
bundle**. Avoiding an exposed secret was judged more important than the Embed
API's additional features. The trade-off is a single `frame-src` directive.

**Sandboxed.** The iframe carries `sandbox="allow-scripts allow-same-origin"`.
Maps needs both to function. Everything else the sandbox would otherwise permit
— form submission, top-level navigation, popups, plugins, pointer lock — is
withheld. Omitting the `sandbox` attribute entirely would grant the frame all
of them.

---

## 4. Untrusted input

Two inputs cross a trust boundary and are validated rather than assumed.

**`localStorage`.** The persisted shortlist is freely editable by the user in
devtools. The `HYDRATE` case of the favourites reducer discards non-arrays,
non-string entries and duplicates before the value reaches state. A tampered
payload cannot produce a broken row in the rail or a crash on first paint.
Asserted in `tests/favouritesReducer.test.js`.

**Drag-and-drop payloads.** The shortlist rail is a drop target, and a user can
drop a file, a URL or a text selection onto any element on the page. The rail
accepts only a custom MIME type (`application/x-meridian-property`) and ignores
everything else. The payload is `JSON.parse`d inside a `try/catch` and its
shape validated before use — a malformed drop is discarded silently rather than
throwing.

**Search input.** Search criteria reach a pure filter function that performs
comparisons only. There is no string interpolation into the DOM, no `eval`, and
no dynamic property access on the dataset.

---

## 5. Other measures

- **Referrer policy** — `strict-origin-when-cross-origin`, so the Google Maps
  frame is not told which page the user came from.
- **External links** — there are none. Were any added they would carry
  `rel="noopener noreferrer"`, preventing the opened page from accessing
  `window.opener`.
- **`lang="en-GB"`** — not a security measure, but declared, because an
  undeclared language is an accessibility defect.

---

## 6. What this does not defend against

Being honest about the limits is part of understanding them.

- A `<meta>` CSP is applied **as the parser reaches it**. A header-based policy
  applies to the whole document from byte zero. On a host that supported custom
  headers, the header would be strictly better.
- `style-src 'unsafe-inline'` permits CSS injection. The impact is limited to
  appearance and, in contrived cases, to exfiltration via CSS selectors — it
  cannot execute JavaScript.
- There is no server, so there is no authentication, no session, and no
  server-side validation to speak of. The shortlist is not sensitive data.

---

## Verification

```bash
npm test                    # includes tests/security.test.js
npm run build && npm run preview
# Open devtools -> Console. A correctly configured CSP produces NO violations.
# Then paste this into the console — it must be blocked:
#   const s = document.createElement('script');
#   s.textContent = 'alert(1)';
#   document.head.appendChild(s);
```
