import fs from 'node:fs';
import path from 'node:path';

/**
 * Security regression tests.
 *
 * The Content Security Policy and the JSX encoding guarantee are both static
 * properties of the source, so they are enforced by a test rather than relied
 * upon by convention. A future change that weakens either one fails the test
 * command instead of shipping quietly.
 */

const readSource = (relativePath) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

/** Every .js and .jsx file under src/, recursively. */
const collectSourceFiles = (directory = 'src') => {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(full);
    return /\.jsx?$/.test(entry.name) ? [full] : [];
  });
};

/**
 * Extracts the CSP directive string from index.html.
 *
 * Reading the raw file and grepping it would be wrong: the surrounding HTML
 * comment explains which directives are deliberately omitted and why, so a
 * naive search would match the explanation rather than the policy. The policy
 * is parsed out of the content attribute instead.
 *
 * @returns {string} the directive list, whitespace-collapsed
 */
const readPolicy = () => {
  const html = readSource('index.html');

  const match = html.match(
    /http-equiv="Content-Security-Policy"\s+content="([^"]+)"/
  );

  if (!match) return '';
  return match[1].replace(/\s+/g, ' ').trim();
};

/**
 * Strips comments from a source file before scanning it.
 *
 * A plain text search matches the word wherever it appears — including inside
 * a comment explaining why the construct is NOT used. That is a false positive:
 * documenting a prohibition is not violating it. Comments are removed so the
 * scan sees only executable code.
 *
 * @param {string} source
 * @returns {string} source with block and line comments removed
 */
const stripComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, '')   // /* block */ and JSX {/* block */}
    .replace(/\/\/.*$/gm, '');          // // line

describe('security', () => {
  /**
   * TEST 1 — JSX encoding.
   *
   * React escapes every value interpolated into JSX before inserting it into
   * the DOM, so a property description containing markup renders as literal
   * text rather than executing. That guarantee is forfeited the moment
   * dangerouslySetInnerHTML is used anywhere in the codebase.
   *
   * The scan strips comments first: the codebase documents WHY the construct is
   * avoided, and a naive text search would match that documentation and fail on
   * an explanation rather than on a violation.
   */
  describe('JSX encoding', () => {
    it('never uses dangerouslySetInnerHTML anywhere in the source', () => {
      const offenders = collectSourceFiles().filter((file) =>
        stripComments(readSource(file)).includes('dangerouslySetInnerHTML')
      );

      // Listing the offending files rather than asserting a boolean means the
      // failure message names exactly what to fix.
      expect(offenders).toEqual([]);
    });

    it('never uses eval or the Function constructor', () => {
      const offenders = collectSourceFiles().filter((file) => {
        const code = stripComments(readSource(file));
        // Both would be blocked at runtime by script-src 'self', but failing
        // here is a clearer signal than a console error in production.
        return /\beval\s*\(/.test(code) || /new\s+Function\s*\(/.test(code);
      });

      expect(offenders).toEqual([]);
    });
  });


  /**
   * TEST 2 — The Content Security Policy.
   * Asserts the policy exists and that its load-bearing directives have not
   * been weakened.
   */
  describe('content security policy', () => {
    const policy = readPolicy();

    it('declares a Content Security Policy', () => {
      expect(policy).not.toBe('');
    });

    it('denies by default', () => {
      expect(policy).toMatch(/default-src 'self'/);
    });

    it("does not permit inline or eval'd scripts", () => {
      // The single most important line in the policy. 'unsafe-inline' or
      // 'unsafe-eval' in script-src would render the whole CSP close to
      // decorative, since XSS is the threat it primarily defends against.
      expect(policy).toMatch(/script-src 'self'\s*;/);
      expect(policy).not.toMatch(/script-src[^;]*unsafe-inline/);
      expect(policy).not.toMatch(/script-src[^;]*unsafe-eval/);
    });

    it('blocks plugin content, base tag injection and form submission', () => {
      expect(policy).toMatch(/object-src 'none'/);
      // Without base-uri, an injected <base> tag re-points every relative URL
      // on the page at an attacker's origin.
      expect(policy).toMatch(/base-uri 'self'/);
      // The application posts no forms; blocking form-action means an injected
      // phishing form has nowhere to submit to.
      expect(policy).toMatch(/form-action 'none'/);
    });

    it('permits no third-party origin except the Google Maps frame', () => {
      // connect-src 'self' means an injected script has nowhere to exfiltrate
      // the user's data to.
      expect(policy).toMatch(/connect-src 'self'/);
      expect(policy).toMatch(/frame-src https:\/\/maps\.google\.com/);
      // Fonts are self-hosted via @fontsource precisely so that no Google Fonts
      // origin needs to be trusted here.
      expect(policy).toMatch(/font-src 'self'/);
    });

    it('omits directives that a meta-tag policy silently ignores', () => {
      // frame-ancestors, report-uri and sandbox only take effect as an HTTP
      // header. Including them in a meta policy logs a console warning and does
      // nothing, which is worse than omitting them honestly.
      //
      // Note this asserts against the PARSED POLICY, not the raw file: the HTML
      // comment above the meta tag names these directives when explaining why
      // they are absent, and matching the file would match the explanation.
      expect(policy).not.toMatch(/frame-ancestors/);
      expect(policy).not.toMatch(/report-uri/);
      expect(policy).not.toMatch(/\bsandbox\b/);
    });
  });

  /**
   * TEST 3 — The map embed.
   * The single third-party frame in the application.
   */
  describe('map embed', () => {
    const source = readSource('src/components/property/PropertyMap.jsx');

    it('uses the keyless embed URL, so no API key is committed to the repo', () => {
      expect(source).toMatch(/output=embed/);
      // An API key in a public repository is a committed credential, shipped in
      // the client bundle for anyone to lift.
      expect(source).not.toMatch(/[?&]key=/);
    });

    it('sandboxes the iframe', () => {
      expect(source).toMatch(/sandbox="allow-scripts allow-same-origin"/);
      // Omitting sandbox entirely would grant the frame form submission,
      // top-level navigation, popups and plugins.
      expect(source).not.toMatch(/allow-top-navigation/);
      expect(source).not.toMatch(/allow-popups/);
    });
  });

  /**
   * TEST 4 — The deployed header policy.
   *
   * The meta-tag CSP is a fallback. The authoritative policy is the HTTP header
   * set in vercel.json, which applies from byte zero of the document and can
   * carry directives a meta policy silently ignores.
   */
  describe('deployment headers', () => {
    const config = JSON.parse(readSource('vercel.json'));

    const headerFor = (key) =>
      config.headers
        .flatMap((rule) => rule.headers)
        .find((header) => header.key === key)?.value ?? '';

    it('sets a Content Security Policy header', () => {
      const csp = headerFor('Content-Security-Policy');
      expect(csp).toMatch(/default-src 'self'/);
      expect(csp).toMatch(/script-src 'self'/);
      expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    });

    it('denies framing via frame-ancestors', () => {
      // The directive a meta-tag policy cannot honour, and the reason the
      // header version is strictly better than the meta tag alone.
      expect(headerFor('Content-Security-Policy')).toMatch(
        /frame-ancestors 'none'/
      );
    });

    it('disables MIME type sniffing', () => {
      expect(headerFor('X-Content-Type-Options')).toBe('nosniff');
    });

    it('denies device permissions the application does not need', () => {
      const permissions = headerFor('Permissions-Policy');
      expect(permissions).toMatch(/geolocation=\(\)/);
      expect(permissions).toMatch(/camera=\(\)/);
      expect(permissions).toMatch(/microphone=\(\)/);
    });
  });
});