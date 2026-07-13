/**
 * The application's base path, injected by Vite from the `base` option in
 * vite.config.js. Always ends with a trailing slash.
 *
 * Isolated into its own module because `import.meta` is Vite-specific syntax
 * that Babel cannot parse, which would otherwise make every module importing
 * it untestable. Jest maps this file to a stub (see jest.config.cjs), so the
 * path-handling logic in assets.js remains testable while the build-tool
 * coupling stays confined to this one line.
 */
export const BASE_URL = import.meta.env.BASE_URL;

export default BASE_URL;