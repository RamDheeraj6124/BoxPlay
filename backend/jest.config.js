module.exports = {
    testEnvironment: 'node',
    testMatch: [
      '**/__tests__/**/*.test.js',
      '**/__tests__/**/*.spec.js',
      '**/?(*.)+(spec|test).js'
    ],
    coverageDirectory: 'coverage',
    collectCoverage: true,
  };