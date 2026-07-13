import { BASE_URL } from './baseUrl.js';

/**
 * Resolves a relative asset path from properties.json into a URL that works
 * in both dev (base = '/') and production on GitHub Pages
 * (base = '/estate-agent-spa/').
 *
 * Paths are stored in the JSON WITHOUT a leading slash, because an absolute
 * path like /images/... would resolve to github.io/images/... on the deployed
 * site and 404 — the base path would be skipped entirely.
 *
 * @param {string} path - Relative path, e.g. "images/properties/prop1/01.jpg"
 * @returns {string} Fully-qualified URL for use in an <img src>
 */
export function assetUrl(path) {
  if (!path) return '';

  // Strip any accidental leading slash so we never double up
  const clean = path.replace(/^\/+/, '');
  return `${BASE_URL}${clean}`;
}

export default assetUrl;