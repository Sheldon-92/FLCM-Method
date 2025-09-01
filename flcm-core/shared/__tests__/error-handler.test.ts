/**
 * Unit Tests for Enhanced Error Handler
 */

import {
  EnhancedErrorHandler,
  getErrorHandler,
  handleAgentError,
  EnhancedError,
  ErrorCategory,
  ErrorSeverity,
  RecoveryStrategy,
  ErrorHandlingConfig
} from '../error-handler';

describe('EnhancedErrorHandler', () => {
  let errorHandler: EnhancedErrorHandler;
  let testError: Error;

  beforeEach(() => {
    errorHandler = new EnhancedErrorHandler();
    testError = new Error('Test error message');
  });

  describe('Constructor', () => {
    test('should initialize with default configuration', () => {
      expect(errorHandler).toBeDefined();
      expect(errorHandler).toBeInstanceOf(EnhancedErrorHandler);
    });

    test('should accept custom configuration', () => {
      const customConfig: Partial<ErrorHandlingConfig> = {
        maxRetries: 5,
        retryDelay: 2000,
        enableDetailedLogging: false
      };

      const customHandler = new EnhancedErrorHandler(customConfig);
      expect(customHandler).toBeInstanceOf(EnhancedErrorHandler);
    });
  });

  describe('handleError', () => {
    test('should handle error and return enhanced error object', () => {
      const enhancedError = errorHandler.handleError(
        'test-agent',
        testError,
        { operation: 'test-operation' },
        ErrorCategory.PROCESSING,
        ErrorSeverity.MEDIUM
      );

      expect(enhancedError).toBeDefined();
      expect(enhancedError.id).toBeDefined();
      expect(enhancedError.agentId).toBe('test-agent');
      expect(enhancedError.category).toBe(ErrorCategory.PROCESSING);
      expect(enhancedError.severity).toBe(ErrorSeverity.MEDIUM);
      expect(enhancedError.message).toBe('Test error message');
      expect(enhancedError.context.operation).toBe('test-operation');
      expect(enhancedError.recoveryStrategy).toBe(RecoveryStrategy.FALLBACK);
      expect(enhancedError.resolved).toBe(false);
    });

    test('should use default values when not provided', () => {
      const enhancedError = errorHandler.handleError('test-agent', testError);

      expect(enhancedError.category).toBe(ErrorCategory.SYSTEM);
      expect(enhancedError.severity).toBe(ErrorSeverity.MEDIUM);
      expect(enhancedError.context).toEqual({});
    });

    test('should assign appropriate recovery strategy based on category', () => {
      const networkError = errorHandler.handleError(
        'test-agent', 
        testError, 
        {}, 
        ErrorCategory.NETWORK
      );
      const validationError = errorHandler.handleError(
        'test-agent', 
        testError, 
        {}, 
        ErrorCategory.VALIDATION
      );
      const configError = errorHandler.handleError(
        'test-agent', 
        testError, 
        {}, 
        ErrorCategory.CONFIGURATION
      );

      expect(networkError.recoveryStrategy).toBe(RecoveryStrategy.RETRY);
      expect(validationError.recoveryStrategy).toBe(RecoveryStrategy.RETRY);
      expect(configError.recoveryStrategy).toBe(RecoveryStrategy.MANUAL_INTERVENTION);
    });

    test('should assess user impact correctly', () => {
      const criticalError = errorHandler.handleError(
        'test-agent',
        testError,
        {},
        ErrorCategory.SYSTEM,
        ErrorSeverity.CRITICAL
      );

      const lowError = errorHandler.handleError(
        'test-agent',
        testError,
        {},
        ErrorCategory.USER_INPUT,
        ErrorSeverity.LOW
      );

      expect(criticalError.userImpact).toContain('High');
      expect(lowError.userImpact).toContain('Low');
    });
  });

  describe('attemptRecovery', () => {
    let sampleError: EnhancedError;
    let mockRecoveryAction: jest.Mock;

    beforeEach(() => {
      sampleError = errorHandler.handleError(
        'test-agent',
        testError,
        { operation: 'test' },
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM
      );
      mockRecoveryAction = jest.fn();
    });

    test('should attempt retry recovery successfully', async () => {
      mockRecoveryAction.mockResolvedValueOnce('success');

      const result = await errorHandler.attemptRecovery(sampleError, mockRecoveryAction);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(mockRecoveryAction).toHaveBeenCalledTimes(1);
    });

    test('should retry multiple times on failure before giving up', async () => {
      mockRecoveryAction
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValueOnce('success');

      const result = await errorHandler.attemptRecovery(sampleError, mockRecoveryAction);

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(mockRecoveryAction).toHaveBeenCalledTimes(3);
    });

    test('should fail after max retries exceeded', async () => {
      mockRecoveryAction.mockRejectedValue(new Error('Always fails'));

      const result = await errorHandler.attemptRecovery(sampleError, mockRecoveryAction);

      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect(mockRecoveryAction).toHaveBeenCalledTimes(3); // Default max retries
    });

    test('should handle skip recovery strategy', async () => {
      sampleError.recoveryStrategy = RecoveryStrategy.SKIP;

      const result = await errorHandler.attemptRecovery(sampleError, mockRecoveryAction);

      expect(result.success).toBe(true);
      expect(result.result).toBeNull();
      expect(mockRecoveryAction).not.toHaveBeenCalled();
    });

    test('should handle manual intervention strategy', async () => {
      sampleError.recoveryStrategy = RecoveryStrategy.MANUAL_INTERVENTION;

      const result = await errorHandler.attemptRecovery(sampleError, mockRecoveryAction);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Manual intervention required');
      expect(mockRecoveryAction).not.toHaveBeenCalled();
    });

    test('should handle graceful degradation strategy', async () => {
      sampleError.recoveryStrategy = RecoveryStrategy.GRACEFUL_DEGRADATION;
      sampleError.category = ErrorCategory.RESOURCE;

      const result = await errorHandler.attemptRecovery(sampleError, mockRecoveryAction);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      expect(result.result?.status).toBe('degraded');
      expect(result.result?.limitations).toBeInstanceOf(Array);
    });

    test('should handle fallback recovery with network category', async () => {
      sampleError.recoveryStrategy = RecoveryStrategy.FALLBACK;
      sampleError.category = ErrorCategory.NETWORK;
      
      // Mock network fallback to return cached data
      jest.spyOn(errorHandler as any, 'getCachedData').mockResolvedValueOnce({ cached: true });

      const result = await errorHandler.attemptRecovery(sampleError, mockRecoveryAction);

      expect(result.success).toBe(true);
      expect(result.result).toEqual({ cached: true });
    });
  });

  describe('getErrorStatistics', () => {
    beforeEach(() => {
      // Generate some test errors
      errorHandler.handleError('agent1', new Error('Error 1'), {}, ErrorCategory.NETWORK, ErrorSeverity.HIGH);
      errorHandler.handleError('agent1', new Error('Error 2'), {}, ErrorCategory.PROCESSING, ErrorSeverity.MEDIUM);
      errorHandler.handleError('agent2', new Error('Error 3'), {}, ErrorCategory.VALIDATION, ErrorSeverity.LOW);
      errorHandler.handleError('agent2', new Error('Error 4'), {}, ErrorCategory.SYSTEM, ErrorSeverity.CRITICAL);
    });

    test('should return comprehensive error statistics', () => {
      const stats = errorHandler.getErrorStatistics();

      expect(stats.totalErrors).toBe(4);
      expect(stats.errorsByCategory[ErrorCategory.NETWORK]).toBe(1);
      expect(stats.errorsByCategory[ErrorCategory.PROCESSING]).toBe(1);
      expect(stats.errorsBySeverity[ErrorSeverity.CRITICAL]).toBe(1);
      expect(stats.errorsBySeverity[ErrorSeverity.HIGH]).toBe(1);
      expect(stats.errorsByAgent['agent1']).toBe(2);
      expect(stats.errorsByAgent['agent2']).toBe(2);
    });

    test('should include recovery success rate', () => {
      const stats = errorHandler.getErrorStatistics();

      expect(stats.recoverySuccessRate).toBeGreaterThanOrEqual(0);
      expect(stats.recoverySuccessRate).toBeLessThanOrEqual(100);
    });

    test('should include trend data', () => {
      const stats = errorHandler.getErrorStatistics();

      expect(stats.errorTrends.hourly).toBeInstanceOf(Array);
      expect(stats.errorTrends.hourly.length).toBe(24);
      expect(stats.errorTrends.daily).toBeInstanceOf(Array);
      expect(stats.errorTrends.daily.length).toBe(7);
      expect(stats.errorTrends.weekly).toBeInstanceOf(Array);
      expect(stats.errorTrends.weekly.length).toBe(4);
    });
  });

  describe('Alert System', () => {
    test('should trigger alerts for high severity errors', (done) => {
      errorHandler.onAlert((error: EnhancedError) => {
        expect(error.severity).toBe(ErrorSeverity.HIGH);
        done();
      });

      errorHandler.handleError(
        'test-agent',
        testError,
        {},
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH
      );
    });

    test('should trigger alerts for critical errors', (done) => {
      errorHandler.onAlert((error: EnhancedError) => {
        expect(error.severity).toBe(ErrorSeverity.CRITICAL);
        done();
      });

      errorHandler.handleError(
        'test-agent',
        testError,
        {},
        ErrorCategory.SYSTEM,
        ErrorSeverity.CRITICAL
      );
    });

    test('should not trigger alerts for low severity errors', () => {
      const alertSpy = jest.fn();
      errorHandler.onAlert(alertSpy);

      errorHandler.handleError(
        'test-agent',
        testError,
        {},
        ErrorCategory.USER_INPUT,
        ErrorSeverity.LOW
      );

      expect(alertSpy).not.toHaveBeenCalled();
    });

    test('should trigger threshold alerts for multiple critical errors', (done) => {
      let alertCount = 0;
      errorHandler.onAlert((error: EnhancedError) => {
        alertCount++;
        if (alertCount === 6) { // 5 critical + 1 threshold alert
          expect(error.message).toContain('threshold exceeded');
          done();
        }
      });

      // Trigger 5 critical errors to exceed threshold
      for (let i = 0; i < 5; i++) {
        errorHandler.handleError(
          'test-agent',
          new Error(`Critical error ${i}`),
          {},
          ErrorCategory.SYSTEM,
          ErrorSeverity.CRITICAL
        );
      }
    });
  });

  describe('Cleanup', () => {
    test('should cleanup old resolved errors', () => {
      // Create some errors
      for (let i = 0; i < 10; i++) {
        const error = errorHandler.handleError('test-agent', new Error(`Error ${i}`));
        // Mark some as resolved
        if (i % 2 === 0) {
          (error as any).resolved = true;
          (error as any).resolutionTime = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
        }
      }

      const removedCount = errorHandler.cleanupOldErrors(24); // Cleanup errors older than 24 hours
      expect(removedCount).toBeGreaterThan(0);
    });

    test('should not cleanup recent errors', () => {
      // Create recent error
      errorHandler.handleError('test-agent', new Error('Recent error'));

      const removedCount = errorHandler.cleanupOldErrors(24);
      expect(removedCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle null error gracefully', () => {
      const enhancedError = errorHandler.handleError('test-agent', null as any);

      expect(enhancedError).toBeDefined();
      expect(enhancedError.message).toBeDefined();
    });

    test('should handle undefined error gracefully', () => {
      const enhancedError = errorHandler.handleError('test-agent', undefined as any);

      expect(enhancedError).toBeDefined();
      expect(enhancedError.message).toBeDefined();
    });

    test('should handle error without stack trace', () => {
      const errorNoStack = new Error('Error without stack');
      delete errorNoStack.stack;

      const enhancedError = errorHandler.handleError('test-agent', errorNoStack);

      expect(enhancedError.stackTrace).toBe('No stack trace available');
    });

    test('should handle very long error messages', () => {
      const longMessage = 'Error '.repeat(1000);
      const longError = new Error(longMessage);

      const enhancedError = errorHandler.handleError('test-agent', longError);

      expect(enhancedError.message).toBe(longMessage);
    });

    test('should handle errors with circular references in context', () => {
      const circularContext: any = { self: null };
      circularContext.self = circularContext;

      expect(() => {
        errorHandler.handleError('test-agent', testError, circularContext);
      }).not.toThrow();
    });
  });

  describe('Recovery Strategies', () => {
    test('should provide different graceful degradation for different categories', async () => {
      const networkError = errorHandler.handleError(
        'test-agent',
        testError,
        {},
        ErrorCategory.NETWORK
      );
      networkError.recoveryStrategy = RecoveryStrategy.GRACEFUL_DEGRADATION;

      const processingError = errorHandler.handleError(
        'test-agent',
        testError,
        {},
        ErrorCategory.PROCESSING
      );
      processingError.recoveryStrategy = RecoveryStrategy.GRACEFUL_DEGRADATION;

      const networkResult = await errorHandler.attemptRecovery(networkError, jest.fn());
      const processingResult = await errorHandler.attemptRecovery(processingError, jest.fn());

      expect(networkResult.result?.limitations).not.toEqual(processingResult.result?.limitations);
    });

    test('should implement exponential backoff in retry strategy', async () => {
      const retryError = errorHandler.handleError(
        'test-agent',
        testError,
        {},
        ErrorCategory.NETWORK
      );

      const startTime = Date.now();
      const failingOperation = jest.fn().mockRejectedValue(new Error('Always fails'));

      await errorHandler.attemptRecovery(retryError, failingOperation);
      const duration = Date.now() - startTime;

      // Should have waited for retries with exponential backoff
      expect(duration).toBeGreaterThan(1000); // At least 1 second for backoff delays
      expect(failingOperation).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Context and Tracking', () => {
    test('should capture technical details', () => {
      const enhancedError = errorHandler.handleError('test-agent', testError);

      expect(enhancedError.technicalDetails.nodeVersion).toBe(process.version);
      expect(enhancedError.technicalDetails.platform).toBe(process.platform);
      expect(enhancedError.technicalDetails.timestamp).toBeGreaterThan(0);
    });

    test('should generate unique error IDs', () => {
      const error1 = errorHandler.handleError('agent1', testError);
      const error2 = errorHandler.handleError('agent2', testError);

      expect(error1.id).not.toBe(error2.id);
      expect(error1.id).toMatch(/^err_\d+_[a-z0-9]+$/);
    });

    test('should track task ID when provided', () => {
      const enhancedError = errorHandler.handleError(
        'test-agent',
        testError,
        {},
        ErrorCategory.PROCESSING,
        ErrorSeverity.MEDIUM,
        'task-123'
      );

      expect(enhancedError.taskId).toBe('task-123');
    });
  });
});

describe('Global Error Handler', () => {
  test('should return singleton instance', () => {
    const handler1 = getErrorHandler();
    const handler2 = getErrorHandler();

    expect(handler1).toBe(handler2);
  });

  test('should accept configuration on first call', () => {
    // Reset global instance for this test
    (getErrorHandler as any).globalErrorHandler = null;

    const config = { maxRetries: 5 };
    const handler = getErrorHandler(config);

    expect(handler).toBeInstanceOf(EnhancedErrorHandler);
  });
});

describe('handleAgentError utility', () => {
  test('should handle error with minimal parameters', () => {
    const error = new Error('Agent error');
    const enhancedError = handleAgentError('test-agent', error);

    expect(enhancedError).toBeDefined();
    expect(enhancedError.agentId).toBe('test-agent');
    expect(enhancedError.message).toBe('Agent error');
    expect(enhancedError.category).toBe(ErrorCategory.SYSTEM);
    expect(enhancedError.severity).toBe(ErrorSeverity.MEDIUM);
  });

  test('should accept all optional parameters', () => {
    const error = new Error('Complex error');
    const context = { operation: 'complex-task', userId: '123' };
    const enhancedError = handleAgentError(
      'test-agent',
      error,
      context,
      ErrorCategory.PROCESSING,
      ErrorSeverity.HIGH
    );

    expect(enhancedError.context).toEqual(context);
    expect(enhancedError.category).toBe(ErrorCategory.PROCESSING);
    expect(enhancedError.severity).toBe(ErrorSeverity.HIGH);
  });
});