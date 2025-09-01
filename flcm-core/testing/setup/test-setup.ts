/**
 * Test Setup Configuration
 * Global setup for Jest testing environment
 */

import { jest } from '@jest/globals';

// Configure Jest timeout
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
const originalConsole = console;

beforeEach(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.debug = jest.fn();
});

afterEach(() => {
  // Restore console methods after each test
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.debug = originalConsole.debug;
  
  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinTimeRange(min: number, max: number): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeWithinTimeRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${min}-${max}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${min}-${max}`,
        pass: false,
      };
    }
  },
});

// Test environment setup
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Minimal logging during tests

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export test utilities
export const createMockDate = (dateString: string) => {
  const mockDate = new Date(dateString);
  return jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
};

export const createMockTimers = () => {
  jest.useFakeTimers();
  return {
    advanceTime: (ms: number) => jest.advanceTimersByTime(ms),
    runAllTimers: () => jest.runAllTimers(),
    restore: () => jest.useRealTimers(),
  };
};

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const mockAsyncMethod = <T>(
  obj: any,
  method: string,
  implementation?: (...args: any[]) => Promise<T>
) => {
  return jest.spyOn(obj, method).mockImplementation(
    implementation || jest.fn().mockResolvedValue(undefined)
  );
};