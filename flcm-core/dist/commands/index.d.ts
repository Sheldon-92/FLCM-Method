/**
 * FLCM Command System Main Export
 * Central entry point for all FLCM command functionality
 */
export { CommandRouter, router, default as executeCommand } from './command-router';
export { ScholarHandler } from './scholar-handler';
export { CreatorHandler } from './creator-handler';
export { PublisherHandler } from './publisher-handler';
export { WorkflowHandler } from './workflow-handler';
export { CommandContext, CommandResult, CommandHandler, CommandDefinition, CommandParameter, ProgressCallback, FLCMCommandError } from './types';
import { CommandResult } from './types';
/**
 * Execute FLCM command from Claude interface
 * This is the main entry point called by Claude Code
 */
export declare function executeFLCMCommand(command: string, args?: string[], options?: Record<string, any>, user?: any): Promise<CommandResult>;
/**
 * Get available FLCM commands
 */
export declare function getAvailableCommands(): string[];
/**
 * Get command suggestions for autocomplete
 */
export declare function getCommandSuggestions(partial: string): string[];
/**
 * Get command history
 */
export declare function getCommandHistory(): any[];
