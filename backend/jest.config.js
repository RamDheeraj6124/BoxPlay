module.exports = {
    testEnvironment: 'node',
    testMatch: [
      '**/__tests__/**/*.test.js',
      '**/*.test.js',
      '**/*.spec.js',
    ],
    coverageDirectory: 'coverage',
    collectCoverage: true,
  };