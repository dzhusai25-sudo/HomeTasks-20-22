/**
 * Jest configuration
 * @type {import('jest').Config}
 */
const config = {
  testEnvironment: "jsdom",
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text"],
  coverageProvider: "v8",
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  moduleNameMapper: {
    "\\.css$": "<rootDir>/__mocks__/styleMock.js",
  },

  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js", "!src/**/index.js"],

  transformIgnorePatterns: ["/node_modules/"],
};

module.exports = config;
