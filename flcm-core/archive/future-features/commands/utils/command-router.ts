/**
 * FLCM Command Router
 * Routes and executes FLCM commands
 */

import init from '../flcm-init';
import help from '../flcm-help';
import status from '../flcm-status';
import { FLCMError } from './error-handler';

export interface CommandContext {
  command: string;
  args: string[];
  options: Record<string, any>;
}

export class CommandRouter {
  private commands: Map<string, Function>;
  private aliases: Map<string, string>;
  private history: Array<{
    command: string;
    timestamp: string;
    status: string;
  }>;

  constructor() {
    this.commands = new Map();
    this.aliases = new Map();
    this.history = [];
    this.registerCommands();
    this.registerAliases();
  }

  /**
   * Register all available commands
   */
  private registerCommands(): void {
    // System commands
    this.commands.set('flcm:init', init);
    this.commands.set('flcm:help', help);
    this.commands.set('flcm:status', status);
    
    // Workflow commands (to be implemented)
    this.commands.set('flcm:quick', this.notImplemented('quick'));
    this.commands.set('flcm:standard', this.notImplemented('standard'));
    
    // Agent commands (to be implemented)
    this.commands.set('flcm:collect', this.notImplemented('collect'));
    this.commands.set('flcm:scholar', this.notImplemented('scholar'));
    this.commands.set('flcm:create', this.notImplemented('create'));
    this.commands.set('flcm:adapt', this.notImplemented('adapt'));
    
    // Configuration commands (to be implemented)
    this.commands.set('flcm:config', this.notImplemented('config'));
  }

  /**
   * Register command aliases
   */
  private registerAliases(): void {
    // Main namespace alias
    this.aliases.set('fc', 'flcm');
    
    // Command shortcuts
    this.aliases.set('flcm:q', 'flcm:quick');
    this.aliases.set('fc:q', 'flcm:quick');
    this.aliases.set('flcm:s', 'flcm:standard');
    this.aliases.set('fc:s', 'flcm:standard');
    this.aliases.set('flcm:c', 'flcm:collect');
    this.aliases.set('fc:c', 'flcm:collect');
    this.aliases.set('flcm:?', 'flcm:help');
    this.aliases.set('fc:?', 'flcm:help');
    
    // Support fc: prefix for all commands
    const commands = Array.from(this.commands.keys());
    commands.forEach(cmd => {
      if (cmd.startsWith('flcm:')) {
        const fcCmd = cmd.replace('flcm:', 'fc:');
        if (!this.aliases.has(fcCmd)) {
          this.aliases.set(fcCmd, cmd);
        }
      }
    });
  }

  /**
   * Execute a command
   */
  async execute(context: CommandContext): Promise<void> {
    const startTime = Date.now();
    let status = 'success';

    try {
      // Resolve aliases
      let commandName = this.resolveAlias(context.command);
      
      // Get command handler
      const handler = this.commands.get(commandName);
      
      if (!handler) {
        throw new FLCMError(
          `Unknown command: ${context.command}`,
          'COMMAND_NOT_FOUND',
          `Run /flcm:help to see available commands`
        );
      }

      // Execute command
      await handler(context.options);
      
    } catch (error: any) {
      status = 'error';
      
      if (error instanceof FLCMError) {
        error.display();
      } else {
        console.error('❌ Command failed:', error.message);
      }
      
      throw error;
    } finally {
      // Record in history
      this.recordHistory(context.command, status);
      
      // Log execution time in verbose mode
      if (context.options.verbose) {
        const duration = Date.now() - startTime;
        console.log(`\n⏱️  Execution time: ${duration}ms`);
      }
    }
  }

  /**
   * Resolve command aliases
   */
  private resolveAlias(command: string): string {
    // Remove leading slash if present
    let cmd = command.startsWith('/') ? command.substring(1) : command;
    
    // Check direct alias
    if (this.aliases.has(cmd)) {
      return this.aliases.get(cmd)!;
    }
    
    // Check namespace alias (fc: -> flcm:)
    if (cmd.startsWith('fc:')) {
      cmd = cmd.replace('fc:', 'flcm:');
    }
    
    return cmd;
  }

  /**
   * Record command in history
   */
  private recordHistory(command: string, status: string): void {
    const entry = {
      command,
      timestamp: new Date().toISOString(),
      status
    };
    
    this.history.push(entry);
    
    // Keep only last 100 entries
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }
    
    // Persist history (async, don't wait)
    this.persistHistory().catch(() => {
      // Ignore history save errors
    });
  }

  /**
   * Persist command history to file
   */
  private async persistHistory(): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    
    const historyPath = path.join(
      process.cwd(),
      '.flcm-core',
      'data',
      'command-history.json'
    );
    
    try {
      fs.writeFileSync(historyPath, JSON.stringify(this.history, null, 2));
    } catch (error) {
      // Ignore write errors
    }
  }

  /**
   * Get command suggestions for autocomplete
   */
  getSuggestions(partial: string): string[] {
    const suggestions: string[] = [];
    
    // Remove leading slash if present
    const query = partial.startsWith('/') ? partial.substring(1) : partial;
    
    // Check commands
    this.commands.forEach((_, cmd) => {
      if (cmd.startsWith(query)) {
        suggestions.push('/' + cmd);
      }
    });
    
    // Check aliases
    this.aliases.forEach((target, alias) => {
      if (alias.startsWith(query)) {
        suggestions.push('/' + alias);
      }
    });
    
    return suggestions.sort();
  }

  /**
   * Get command history
   */
  getHistory(): Array<any> {
    return this.history;
  }

  /**
   * Placeholder for not yet implemented commands
   */
  private notImplemented(commandName: string): Function {
    return async () => {
      throw new FLCMError(
        `Command '${commandName}' is not yet implemented`,
        'NOT_IMPLEMENTED',
        'This command will be available in a future update'
      );
    };
  }
}

// Export singleton instance
export const router = new CommandRouter();

// Export main execute function
export default async function executeCommand(
  command: string,
  args: string[] = [],
  options: Record<string, any> = {}
): Promise<void> {
  const context: CommandContext = { command, args, options };
  await router.execute(context);
}