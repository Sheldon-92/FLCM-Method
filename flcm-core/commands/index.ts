/**
 * FLCM Command System Main Export
 * Central entry point for all FLCM command functionality
 */

export { CommandRouter, router, default as executeCommand } from './command-router';
export { ScholarHandler } from './scholar-handler';
export { CreatorHandler } from './creator-handler';
export { PublisherHandler } from './publisher-handler';
export { WorkflowHandler } from './workflow-handler';
export {
  CommandContext,
  CommandResult,
  CommandHandler,
  CommandDefinition,
  CommandParameter,
  ProgressCallback,
  FLCMCommandError
} from './types';

// Main command execution function
import { router } from './command-router';
import { CommandResult } from './types';

/**
 * Execute FLCM command from Claude interface
 * This is the main entry point called by Claude Code
 */
export async function executeFLCMCommand(
  command: string,
  args: string[] = [],
  options: Record<string, any> = {},
  user?: any
): Promise<CommandResult> {
  const context = { command, args, options, user };
  return await router.execute(context);
}

/**
 * Get available FLCM commands
 */
export function getAvailableCommands(): string[] {
  return [
    'flcm:help',
    'flcm:status', 
    'flcm:history',
    'flcm:scholar',
    'flcm:create',
    'flcm:creator',
    'flcm:publish',
    'flcm:publisher',
    'flcm:adapter',
    'flcm:flow',
    'flcm:quick',
    'flcm:standard'
  ];
}

/**
 * Get command suggestions for autocomplete
 */
export function getCommandSuggestions(partial: string): string[] {
  return router.getSuggestions(partial);
}

/**
 * Get command history
 */
export function getCommandHistory() {
  return router.getHistory();
}