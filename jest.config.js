/**
 * Jest configuration
 * @type {import('jest').Config}
 */
const config = {
  testEnvironment: 'jsdom',
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },

  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/index.js'],

  transformIgnorePatterns: ['/node_modules/'],
};

module.exports = config;
