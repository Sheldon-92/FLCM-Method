/**
 * FLCM Command System Entry Point
 * Main interface for Claude Code command integration
 */

import executeCommand, { router } from './utils/command-router';
import { handleError } from './utils/error-handler';

/**
 * Parse command string into components
 */
function parseCommand(commandString: string): {
  command: string;
  args: string[];
  options: Record<string, any>;
} {
  const parts = commandString.trim().split(/\s+/);
  const command = parts[0];
  const args: string[] = [];
  const options: Record<string, any> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.startsWith('--')) {
      // Long option
      const [key, value] = part.substring(2).split('=');
      options[key] = value || true;
    } else if (part.startsWith('-')) {
      // Short option
      const key = part.substring(1);
      options[key] = true;
    } else {
      // Argument
      args.push(part);
    }
  }

  return { command, args, options };
}

/**
 * Main command handler for Claude Code
 * This is the entry point for all FLCM commands
 */
export async function flcm(input: string = 'help'): Promise<void> {
  try {
    // Parse the input
    const { command, args, options } = parseCommand(input);
    
    // Build full command name if not provided
    let fullCommand = command;
    if (!command.includes(':')) {
      fullCommand = `flcm:${command}`;
    }
    if (!fullCommand.startsWith('/')) {
      fullCommand = '/' + fullCommand;
    }

    // Execute the command
    await executeCommand(fullCommand, args, options);
    
  } catch (error: any) {
    await handleError(error);
  }
}

/**
 * Shortcut commands for common operations
 */
export const commands = {
  // System commands
  init: async (options?: any) => flcm(`init ${options || ''}`),
  help: async (command?: string) => flcm(`help ${command || ''}`),
  status: async (verbose?: boolean) => flcm(`status ${verbose ? '--verbose' : ''}`),
  
  // Workflow commands (to be implemented)
  quick: async (source: string) => flcm(`quick "${source}"`),
  standard: async (source: string) => flcm(`standard "${source}"`),
  
  // Agent commands (to be implemented)
  collect: async (source: string) => flcm(`collect "${source}"`),
  scholar: async (brief: string) => flcm(`scholar "${brief}"`),
  create: async (synthesis: string) => flcm(`create "${synthesis}"`),
  adapt: async (draft: string, platform?: string) => 
    flcm(`adapt "${draft}" ${platform ? `--platform=${platform}` : ''}`),
  
  // Configuration command
  config: async (action?: string, key?: string, value?: string) => {
    const parts = ['config'];
    if (action) parts.push(action);
    if (key) parts.push(key);
    if (value) parts.push(value);
    return flcm(parts.join(' '));
  }
};

/**
 * Get command suggestions for autocomplete
 */
export function getSuggestions(partial: string): string[] {
  return router.getSuggestions(partial);
}

/**
 * Get command history
 */
export function getHistory(): Array<any> {
  return router.getHistory();
}

// Export default handler
export default flcm;

/**
 * Command registration for Claude Code
 * These would be registered with Claude Code's command system
 */
export const FLCM_COMMANDS = {
  '/flcm': flcm,
  '/flcm:init': () => commands.init(),
  '/flcm:help': () => commands.help(),
  '/flcm:status': () => commands.status(),
  '/flcm:quick': (source: string) => commands.quick(source),
  '/flcm:standard': (source: string) => commands.standard(source),
  '/flcm:collect': (source: string) => commands.collect(source),
  '/flcm:scholar': (brief: string) => commands.scholar(brief),
  '/flcm:create': (synthesis: string) => commands.create(synthesis),
  '/flcm:adapt': (draft: string, platform?: string) => commands.adapt(draft, platform),
  '/flcm:config': () => commands.config(),
  
  // Aliases
  '/fc': flcm,
  '/fc:init': () => commands.init(),
  '/fc:help': () => commands.help(),
  '/fc:status': () => commands.status(),
  '/fc:q': (source: string) => commands.quick(source),
  '/fc:s': (source: string) => commands.standard(source),
  '/fc:c': (source: string) => commands.collect(source),
  '/fc:?': () => commands.help(),
};

/**
 * CLI Usage Examples:
 * 
 * Initialize system:
 *   await flcm('init')
 *   await commands.init()
 * 
 * Get help:
 *   await flcm('help')
 *   await flcm('help quick')
 *   await commands.help('quick')
 * 
 * Check status:
 *   await flcm('status')
 *   await flcm('status --verbose')
 *   await commands.status(true)
 * 
 * Quick content generation:
 *   await flcm('quick "https://example.com/article"')
 *   await commands.quick('https://example.com/article')
 * 
 * Standard content pipeline:
 *   await flcm('standard "path/to/notes.md"')
 *   await commands.standard('path/to/notes.md')
 */