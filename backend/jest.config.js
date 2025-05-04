module.exports = {
    testEnvironment: 'node', // Set test environment to Node.js
    testMatch: [
      '**/__tests__/**/*.test.js', // Include files in __tests__ directory ending in .test.js
      '**/?(*.)+(spec|test).js',   // Include files ending with .spec.js or .test.js
    ],
    coverageDirectory: 'coverage', // Directory for coverage output
    collectCoverage: true,         // Enable coverage collection
    verbose: true,                 // Show individual test results
  };