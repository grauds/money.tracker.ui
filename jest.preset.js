const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,
  coverageReporters: ["clover", "json", "text", "cobertura", "html"],
  coveragePathIgnorePatterns: [
    'index.js',
    'index.jsx',
    'index.ts',
    '/node_modules/'
  ],
}
