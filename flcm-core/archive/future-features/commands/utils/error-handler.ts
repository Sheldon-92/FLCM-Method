/**
 * FLCM Error Handler
 * Provides user-friendly error messages and recovery suggestions
 */

export class FLCMError extends Error {
  public code: string;
  public suggestion?: string;
  public documentation?: string;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    suggestion?: string,
    documentation?: string
  ) {
    super(message);
    this.name = 'FLCMError';
    this.code = code;
    this.suggestion = suggestion;
    this.documentation = documentation;
  }

  /**
   * Display formatted error message
   */
  display(): void {
    console.error('\n' + '='.repeat(50));
    console.error('❌ Error:', this.message);
    console.error('Code:', this.code);
    
    if (this.suggestion) {
      console.error('\n💡 Suggestion:', this.suggestion);
    }
    
    if (this.documentation) {
      console.error('📚 Documentation:', this.documentation);
    }
    
    console.error('='.repeat(50) + '\n');
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      suggestion: this.suggestion,
      documentation: this.documentation,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Common error factory functions
 */
export class ErrorFactory {
  static configurationError(details: string): FLCMError {
    return new FLCMError(
      `Configuration error: ${details}`,
      'CONFIG_ERROR',
      'Check your configuration file for syntax errors',
      'See .flcm-core/CONFIG-SCHEMA.md for configuration documentation'
    );
  }

  static initializationError(details: string): FLCMError {
    return new FLCMError(
      `Initialization failed: ${details}`,
      'INIT_ERROR',
      'Run /flcm:init to initialize the system',
      'See docs/setup.md for setup instructions'
    );
  }

  static agentError(agent: string, details: string): FLCMError {
    return new FLCMError(
      `Agent '${agent}' error: ${details}`,
      'AGENT_ERROR',
      `Check if the ${agent} agent is properly configured`,
      `See docs/agents/${agent}.md for agent documentation`
    );
  }

  static workflowError(workflow: string, details: string): FLCMError {
    return new FLCMError(
      `Workflow '${workflow}' error: ${details}`,
      'WORKFLOW_ERROR',
      'Check workflow configuration and agent availability',
      `See docs/workflows/${workflow}.md for workflow documentation`
    );
  }

  static validationError(field: string, value: any, expected: string): FLCMError {
    return new FLCMError(
      `Validation failed for '${field}': got '${value}', expected ${expected}`,
      'VALIDATION_ERROR',
      'Correct the value and try again',
      'See .flcm-core/CONFIG-SCHEMA.md for valid values'
    );
  }

  static fileNotFoundError(path: string): FLCMError {
    return new FLCMError(
      `File not found: ${path}`,
      'FILE_NOT_FOUND',
      'Check the file path and ensure the file exists',
      'Use absolute paths or paths relative to the project root'
    );
  }

  static networkError(url: string, details: string): FLCMError {
    return new FLCMError(
      `Network error accessing ${url}: ${details}`,
      'NETWORK_ERROR',
      'Check your internet connection and the URL',
      'Ensure the URL is accessible and properly formatted'
    );
  }

  static methodologyError(methodology: string, details: string): FLCMError {
    return new FLCMError(
      `Methodology '${methodology}' error: ${details}`,
      'METHODOLOGY_ERROR',
      `Check if the methodology file exists in .flcm-core/methodologies/`,
      'See docs/methodologies.md for methodology documentation'
    );
  }

  static permissionError(path: string): FLCMError {
    return new FLCMError(
      `Permission denied: ${path}`,
      'PERMISSION_ERROR',
      'Check file permissions and ensure Claude Code has access',
      'You may need to adjust file permissions or run with appropriate privileges'
    );
  }

  static timeoutError(operation: string, timeout: number): FLCMError {
    return new FLCMError(
      `Operation '${operation}' timed out after ${timeout}ms`,
      'TIMEOUT_ERROR',
      'Try again or increase the timeout in configuration',
      'See .flcm-core/core-config.yaml to adjust timeouts'
    );
  }
}

/**
 * Error recovery strategies
 */
export class ErrorRecovery {
  /**
   * Attempt to recover from configuration errors
   */
  static async recoverConfiguration(): Promise<boolean> {
    console.log('🔧 Attempting to recover configuration...');
    
    try {
      // Try to load default configuration
      const fs = require('fs');
      const path = require('path');
      const defaultConfigPath = path.join(process.cwd(), '.flcm-core', 'core-config.yaml');
      
      if (!fs.existsSync(defaultConfigPath)) {
        console.log('  Creating default configuration...');
        // Would create default config here
        return false;
      }
      
      console.log('✅ Configuration recovered');
      return true;
    } catch (error) {
      console.error('❌ Recovery failed');
      return false;
    }
  }

  /**
   * Log error for debugging
   */
  static async logError(error: Error | FLCMError): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const logPath = path.join(process.cwd(), '.flcm-core', 'logs', 'errors.log');
      const logDir = path.dirname(logPath);
      
      // Ensure log directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // Format log entry
      const entry = {
        timestamp: new Date().toISOString(),
        error: error instanceof FLCMError ? error.toJSON() : {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      };
      
      // Append to log file
      const logContent = JSON.stringify(entry) + '\n';
      fs.appendFileSync(logPath, logContent);
      
    } catch (logError) {
      // Silently fail if logging fails
    }
  }
}

/**
 * Global error handler
 */
export async function handleError(error: Error | FLCMError): Promise<void> {
  // Log error
  await ErrorRecovery.logError(error);
  
  // Display error
  if (error instanceof FLCMError) {
    error.display();
  } else {
    console.error('❌ Unexpected error:', error.message);
    console.error('💡 Run /flcm:status to check system health');
  }
  
  // Attempt recovery for certain error types
  if (error instanceof FLCMError) {
    switch (error.code) {
      case 'CONFIG_ERROR':
        await ErrorRecovery.recoverConfiguration();
        break;
      // Add more recovery strategies as needed
    }
  }
}