/**
 * Babel config — consumed by babel-jest only.
 * Vite handles its own transforms via esbuild, so this file
 * exists purely so the Jest test environment can parse JSX/ESM.
 */
module.exports = {
  presets: [
    // Compile modern JS down to whatever Node version is running Jest
    ['@babel/preset-env', { targets: { node: 'current' } }],
    // 'automatic' runtime = no need to `import React` in every test file
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};