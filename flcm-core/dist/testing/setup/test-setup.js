"use strict";
/**
 * Test Setup Configuration
 * Global setup for Jest testing environment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAsyncMethod = exports.waitFor = exports.createMockTimers = exports.createMockDate = void 0;
const globals_1 = require("@jest/globals");
// Configure Jest timeout
globals_1.jest.setTimeout(30000);
// Mock console methods in tests to reduce noise
const originalConsole = console;
beforeEach(() => {
    // Suppress console output during tests unless explicitly needed
    console.log = globals_1.jest.fn();
    console.info = globals_1.jest.fn();
    console.warn = globals_1.jest.fn();
    console.error = globals_1.jest.fn();
    console.debug = globals_1.jest.fn();
});
afterEach(() => {
    // Restore console methods after each test
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
    // Clear all mocks after each test
    globals_1.jest.clearAllMocks();
});
// Custom matchers
expect.extend({
    toBeWithinTimeRange(received, min, max) {
        const pass = received >= min && received <= max;
        if (pass) {
            return {
                message: () => `expected ${received} not to be within range ${min}-${max}`,
                pass: true,
            };
        }
        else {
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
const createMockDate = (dateString) => {
    const mockDate = new Date(dateString);
    return globals_1.jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
};
exports.createMockDate = createMockDate;
const createMockTimers = () => {
    globals_1.jest.useFakeTimers();
    return {
        advanceTime: (ms) => globals_1.jest.advanceTimersByTime(ms),
        runAllTimers: () => globals_1.jest.runAllTimers(),
        restore: () => globals_1.jest.useRealTimers(),
    };
};
exports.createMockTimers = createMockTimers;
const waitFor = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.waitFor = waitFor;
const mockAsyncMethod = (obj, method, implementation) => {
    return globals_1.jest.spyOn(obj, method).mockImplementation(implementation || globals_1.jest.fn().mockResolvedValue(undefined));
};
exports.mockAsyncMethod = mockAsyncMethod;
//# sourceMappingURL=test-setup.js.map