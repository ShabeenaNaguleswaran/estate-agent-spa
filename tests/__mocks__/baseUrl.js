// Stands in for src/utils/baseUrl.js, whose `import.meta.env` syntax Babel
// cannot parse. In tests the app is served from the root.
module.exports = {
  BASE_URL: '/',
  default: '/',
};