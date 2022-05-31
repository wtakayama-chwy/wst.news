module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  setupFiles: ['<rootDir>/src/tests/mockedEnv.js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  transform: {
    // all files that starts with 1 or more chars containing extensions js|jsx|ts|tsx
    /**
     * ^ - init with
     * . - any char
     * + - one or more of something
     */
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(scss|css|sass)$': 'identity-obj-proxy',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.tsx',
    '!src/**/*.spec.tsx',
    '!src/**/_app.tsx',
    '!src/**/_document.tsx',
  ],
  coverageReporters: ['lcov', 'json'],
}
