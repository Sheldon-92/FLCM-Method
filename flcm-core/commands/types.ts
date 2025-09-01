/**
 * FLCM Command System Types
 * Core type definitions for the FLCM command system
 */

export interface CommandContext {
  command: string;
  args: string[];
  options: Record<string, any>;
  user?: any;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  processingTime?: number;
}

export interface CommandHandler {
  execute(context: CommandContext): Promise<CommandResult>;
}

export interface CommandDefinition {
  name: string;
  description: string;
  usage: string;
  parameters: CommandParameter[];
  handler: CommandHandler;
}

export interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  description: string;
  default?: any;
  choices?: string[];
}

export interface ProgressCallback {
  (step: string, progress: number, message?: string): void;
}

export class FLCMCommandError extends Error {
  constructor(
    public code: string,
    message: string,
    public suggestions?: string[],
    public examples?: string[]
  ) {
    super(message);
    this.name = 'FLCMCommandError';
  }
}