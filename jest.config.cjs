/**
 * Jest configuration.
 * Three problems this file solves:
 *  1. Jest runs in Node, not a browser  -> jsdom environment
 *  2. Jest cannot parse .css or image imports -> stub them out
 *  3. react-widgets ships untranspiled ESM -> force Babel to transform it
 */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],

  moduleNameMapper: {
  '\\.(css)$': 'identity-obj-proxy',
  '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/tests/__mocks__/fileMock.js',
  '^react-widgets/(.*)$': '<rootDir>/node_modules/react-widgets/cjs/$1.js',
  // Vite's import.meta.env is unparseable by Babel — stub the module that
  // reads it, so everything downstream of it stays testable.
  '^.*baseUrl\\.js$': '<rootDir>/tests/__mocks__/baseUrl.js',
},

  transformIgnorePatterns: ['/node_modules/(?!(react-widgets)/)'],
  testMatch: ['<rootDir>/tests/**/*.test.{js,jsx}'],

  /* Only measure what we author. Config files and entry points are not logic. */
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/data/**',
  ],

  /*
   * Enforced, not advisory. The two modules carrying the search and
   * favourites marks are held at 100%: a regression in either is the
   * difference between a working application and a broken one, and neither
   * has any excuse for an untested branch.
   */
  coverageThreshold: {
    './src/utils/filterProperties.js': {
      statements: 100, branches: 100, functions: 100, lines: 100,
    },
    './src/context/favouritesReducer.js': {
      statements: 100, branches: 100, functions: 100, lines: 100,
    },
  },
};