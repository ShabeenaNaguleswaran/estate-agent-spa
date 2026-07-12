/**
 * Jest configuration.
 * Three problems this file solves:
 *  1. Jest runs in Node, not a browser  -> jsdom environment
 *  2. Jest cannot parse .css or image imports -> stub them out
 *  3. react-widgets ships untranspiled ESM -> force Babel to transform it
 */
module.exports = {
  testEnvironment: 'jsdom',

  // Runs before each test file — registers jest-dom matchers
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],

  moduleNameMapper: {
    // `import './Card.css'` -> returns a proxy object instead of crashing
    '\\.(css)$': 'identity-obj-proxy',
    // `import img from './main.jpg'` -> returns a stub string
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },

  // By default Jest skips node_modules. react-widgets is ESM, so it must
  // be transformed — this pattern says "ignore node_modules EXCEPT react-widgets".
  transformIgnorePatterns: ['/node_modules/(?!(react-widgets)/)'],

  // Only pick up tests inside /tests
  testMatch: ['<rootDir>/tests/**/*.test.{js,jsx}'],
};