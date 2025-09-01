module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/__tests__/**',
    '!**/testing/**',
    '!**/demo/**',
    '!**/archive/**',
    '!jest.config.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 80,
      statements: 80
    },
    './agents/': {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 85
    },
    './methodologies/': {
      branches: 75,
      functions: 85,
      lines: 80,
      statements: 80
    },
    './shared/': {
      branches: 80,
      functions: 90,
      lines: 85,
      statements: 85
    }
  },
  moduleNameMapping: {
    '^@agents/(.*)$': '<rootDir>/agents/$1',
    '^@tasks/(.*)$': '<rootDir>/tasks/$1',
    '^@methodologies/(.*)$': '<rootDir>/methodologies/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@testing/(.*)$': '<rootDir>/testing/$1',
    '^@feedback/(.*)$': '<rootDir>/feedback/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/testing/setup/test-setup.ts'],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  forceExit: true,
  detectOpenHandles: true,
  bail: false,
  maxWorkers: '50%',
};