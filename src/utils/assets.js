/**
 * Resolves a relative asset path from properties.json into a URL that works
 * in both dev (base = '/') and production on GitHub Pages (base = '/estate-agent-spa/').
 *
 * import.meta.env.BASE_URL is injected by Vite from the `base` option and
 * always ends with a trailing slash.
 *
 * @param {string} path - Relative path, e.g. "images/properties/prop1/01.jpg"
 * @returns {string} Fully-qualified URL for use in an <img src>
 */
export function assetUrl(path) {
  if (!path) return '';
  // Strip any accidental leading slash so we never double up
  const clean = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}