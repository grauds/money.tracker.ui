const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,
  coverageReporters: ["clover", "json", "lcov", "text", "cobertura", "html"]
}
