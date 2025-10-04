/**
 * Jest setup file for global test configuration
 */

// Import custom matchers
import './matchers/custom-matchers';

// Configure Jest timeouts
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Setup global test configuration
  process.env.NODE_ENV = 'test';

  // Suppress console.log during tests unless explicitly needed
  if (process.env.TEST_VERBOSE !== 'true') {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    // Keep console.error for debugging
  }
});

// Global test cleanup
afterAll(async () => {
  // Cleanup any global resources
  jest.clearAllTimers();
  jest.clearAllMocks();
});

// Global error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests
});

// Mock Date.now for consistent testing
const mockDate = new Date('2024-10-01T12:00:00Z');
const originalDateNow = Date.now;

beforeEach(() => {
  // Reset Date.now to a consistent value for each test
  Date.now = jest.fn(() => mockDate.getTime());
});

afterEach(() => {
  // Restore original Date.now
  Date.now = originalDateNow;

  // Clear all mocks after each test
  jest.clearAllMocks();
});

// Custom global utilities for tests
declare global {
  namespace globalThis {
    var testUtils: {
      mockDate: Date;
      resetToMockDate: () => void;
      advanceTimeBy: (ms: number) => void;
    };
  }
}

globalThis.testUtils = {
  mockDate,
  resetToMockDate: () => {
    Date.now = jest.fn(() => mockDate.getTime());
  },
  advanceTimeBy: (ms: number) => {
    const newTime = mockDate.getTime() + ms;
    Date.now = jest.fn(() => newTime);
  },
};

export {};
