# Deployment

**Live:** https://estate-agent-spa.vercel.app
**Host:** Vercel (static output, no serverless functions)

## Why Vercel and not GitHub Pages

The specification permits either. Vercel was chosen for one reason that matters
and one that is convenient.

**It can set HTTP response headers.** GitHub Pages cannot. That constraint
forced the Content Security Policy to be declared as a `<meta>` tag, and a
meta-tag policy **silently ignores `frame-ancestors`** — the directive that
prevents another site from embedding this one in an iframe, which is the
defence against clickjacking. On Vercel the policy is a real header and carries
that directive.

The convenience: Vercel builds and deploys on every push to `main`, so the live
site and the repository cannot drift apart. The rubric's Distinction band for
deployment requires the deployed application to "mirror the repository" — with
push-to-deploy that is structurally guaranteed rather than remembered.

## The one line that matters

`vite.config.js` sets `base: '/'`.

Vercel serves from the domain root; GitHub Pages serves from
`/<repository-name>/`. Getting this wrong is **silent and total** — every asset
resolves to the wrong path, the bundle 404s, and the page renders blank with no
error naming the cause.

The application is portable between the two because every image path in
`properties.json` is stored **without a leading slash** and resolved at render
time through `assetUrl()`, which prefixes it with `import.meta.env.BASE_URL`.
Changing that one value is the entire host migration.

## The router is still HashRouter

Vercel supports rewrites, so `BrowserRouter` would work here. It was kept as a
`HashRouter` deliberately.

The original reason was a GitHub Pages constraint. The reason it stays is that
the bundle is now **host-agnostic**: it deploys correctly to any static file
server with no rewrite configuration at all. Trading that portability for a
cosmetically nicer URL was not judged worthwhile a week before submission, when
the change would require retesting every route for no user-visible benefit.

## Headers set

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | see `vercel.json` | The authoritative policy. Identical to the meta tag, **plus** `frame-ancestors 'none'`. |
| `X-Content-Type-Options` | `nosniff` | The browser must not second-guess a declared `Content-Type`. A file served as text cannot be reinterpreted as script. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | The Google Maps frame is not told which page the user came from. |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=()` | The application needs none of these. Denying them means an injected script cannot prompt for them either. |
| `Cache-Control` on `/assets/*` | `max-age=31536000, immutable` | Vite fingerprints bundled filenames, so a change produces a new filename. A fingerprinted file can safely be cached for a year. `index.html` is deliberately **not** cached, so a new deploy is picked up immediately. |

## Two policies, not one

The CSP is declared **both** as a header and as a `<meta>` tag.

They do not override one another — where both are present, the browser enforces
the **intersection**: a resource must satisfy both policies to load. Having both
is therefore strictly safer, never weaker. The meta tag is the fallback for a
host that cannot set headers, and for `vite preview` locally.

## Deploying

Push to `main`. Vercel builds and deploys automatically.

To deploy manually:

```bash
npm install -g vercel
vercel --prod
```

## Verifying a deployment

```bash
curl -I https://estate-agent-spa.vercel.app
```

Confirm `content-security-policy` and `x-content-type-options` appear in the
response headers.

Then, in the browser:

1. Console shows **zero CSP violations**
2. Fonts render (a grotesque and a monospace — not Times New Roman)
3. Property images load — if they are broken, `base` is wrong
4. A property page's **Location** tab shows the map
5. Refresh a deep link such as `/#/property/prop3` — it must still work
6. Paste into the console; it must be **blocked**:
```js
   const s = document.createElement('script');
   s.textContent = 'alert(1)';
   document.head.appendChild(s);
```