/**
 * Command Mode
 * Legacy command-based interaction (FLCM 1.0 style)
 */

import { SharedContext } from '../shared-context';
import { CommandMapping } from '../types';
import { Logger } from '../../shared/utils/logger';

export class CommandMode {
  private context: SharedContext;
  private logger: Logger;
  private commandMappings: Map<string, CommandMapping>;
  private deprecationWarnings: boolean = true;
  
  constructor(context: SharedContext) {
    this.context = context;
    this.logger = new Logger('CommandMode');
    this.commandMappings = new Map();
    
    this.initializeCommandMappings();
  }
  
  /**
   * Initialize legacy command mappings
   */
  private initializeCommandMappings(): void {
    // Collector commands
    this.commandMappings.set('collect', {
      handler: 'legacy.collector.run',
      deprecation: "Consider using 'explore with RICE' in collaborative mode",
      replacement: 'mentor.explore(framework="rice")',
      aliases: ['gather', 'fetch']
    });
    
    this.commandMappings.set('collect-web', {
      handler: 'legacy.collector.web',
      deprecation: "Try 'explore this webpage' in collaborative mode",
      replacement: 'mentor.explore(source="web")'
    });
    
    // Scholar commands
    this.commandMappings.set('deep-dive', {
      handler: 'legacy.scholar.deep_dive',
      deprecation: "Try 'let's understand deeply' in collaborative mode",
      replacement: 'mentor.explore(framework="socratic", level=3)',
      aliases: ['dive', 'understand']
    });
    
    this.commandMappings.set('teach', {
      handler: 'legacy.scholar.teach',
      deprecation: "Use 'prepare to teach this' in collaborative mode",
      replacement: 'mentor.explore(framework="teaching_prep")'
    });
    
    // Creator commands
    this.commandMappings.set('create', {
      handler: 'legacy.creator.create',
      deprecation: "Try 'let's create content about...' in collaborative mode",
      replacement: 'creator.cocreate()',
      aliases: ['write', 'draft']
    });
    
    this.commandMappings.set('voice-analyze', {
      handler: 'legacy.creator.voice',
      deprecation: "Use 'define my voice' in collaborative mode",
      replacement: 'creator.voice_dna()'
    });
    
    // Adapter commands
    this.commandMappings.set('adapt', {
      handler: 'legacy.adapter.adapt',
      deprecation: "Try 'adapt for LinkedIn' in collaborative mode",
      replacement: 'publisher.adapt(platform="linkedin")',
      aliases: ['format', 'convert']
    });
    
    this.commandMappings.set('publish', {
      handler: 'legacy.adapter.publish',
      deprecation: "Use 'publish to Twitter' in collaborative mode",
      replacement: 'publisher.publish()',
      aliases: ['post', 'share']
    });
    
    // Utility commands
    this.commandMappings.set('help', {
      handler: 'command.help',
      aliases: ['?', 'h']
    });
    
    this.commandMappings.set('status', {
      handler: 'command.status',
      aliases: ['info', 'stats']
    });
    
    this.commandMappings.set('clear', {
      handler: 'command.clear',
      aliases: ['reset', 'cls']
    });
  }
  
  /**
   * Process command input
   */
  async process(input: string): Promise<string> {
    const { command, args } = this.parseCommand(input);
    
    // Check for command alias
    const actualCommand = this.resolveCommand(command);
    
    if (!actualCommand) {
      return this.handleUnknownCommand(command);
    }
    
    // Get command mapping
    const mapping = this.commandMappings.get(actualCommand);
    if (!mapping) {
      return this.handleUnknownCommand(command);
    }
    
    // Show deprecation warning if applicable
    if (mapping.deprecation && this.deprecationWarnings) {
      console.warn(this.formatDeprecationWarning(actualCommand, mapping));
    }
    
    // Execute command
    try {
      const result = await this.executeCommand(actualCommand, mapping, args);
      return result;
    } catch (error) {
      this.logger.error(`Command execution failed: ${actualCommand}`, { error });
      return `Error executing command '${actualCommand}': ${error.message}`;
    }
  }
  
  /**
   * Parse command and arguments
   */
  private parseCommand(input: string): { command: string; args: string[] } {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    return { command, args };
  }
  
  /**
   * Resolve command considering aliases
   */
  private resolveCommand(command: string): string | null {
    // Direct match
    if (this.commandMappings.has(command)) {
      return command;
    }
    
    // Check aliases
    for (const [cmd, mapping] of this.commandMappings.entries()) {
      if (mapping.aliases?.includes(command)) {
        return cmd;
      }
    }
    
    return null;
  }
  
  /**
   * Execute command
   */
  private async executeCommand(
    command: string,
    mapping: CommandMapping,
    args: string[]
  ): Promise<string> {
    // Handle built-in commands
    if (mapping.handler.startsWith('command.')) {
      return this.executeBuiltinCommand(command, args);
    }
    
    // Handle legacy commands
    if (mapping.handler.startsWith('legacy.')) {
      return this.executeLegacyCommand(mapping.handler, args);
    }
    
    return `Command handler not implemented: ${mapping.handler}`;
  }
  
  /**
   * Execute built-in command
   */
  private async executeBuiltinCommand(command: string, args: string[]): Promise<string> {
    switch (command) {
      case 'help':
        return this.getHelp();
        
      case 'status':
        return this.getStatus();
        
      case 'clear':
        this.context.clear();
        return 'Context cleared. Ready for new session.';
        
      default:
        return `Unknown built-in command: ${command}`;
    }
  }
  
  /**
   * Execute legacy command
   */
  private async executeLegacyCommand(handler: string, args: string[]): Promise<string> {
    // Parse handler path
    const [, agent, method] = handler.split('.');
    
    // Simulate legacy command execution
    // In real implementation, this would call actual legacy handlers
    const response = `[Legacy Mode] Executing ${agent}.${method} with args: ${args.join(' ')}
    
Processing with FLCM 1.0 ${agent} agent...
[Output would appear here]

Note: This command is deprecated and will be removed in FLCM 3.0.`;
    
    return response;
  }
  
  /**
   * Handle unknown command
   */
  private handleUnknownCommand(command: string): string {
    const suggestions = this.getSuggestions(command);
    
    let response = `Unknown command: '${command}'`;
    
    if (suggestions.length > 0) {
      response += `\n\nDid you mean:\n${suggestions.map(s => `  - ${s}`).join('\n')}`;
    }
    
    response += `\n\nType 'help' for available commands or switch to collaborative mode with '/mode collaborative'`;
    
    return response;
  }
  
  /**
   * Get command suggestions
   */
  private getSuggestions(input: string): string[] {
    const suggestions: string[] = [];
    const inputLower = input.toLowerCase();
    
    // Find similar commands
    for (const [command] of this.commandMappings.entries()) {
      if (command.startsWith(inputLower) || 
          command.includes(inputLower) ||
          this.levenshteinDistance(inputLower, command) <= 2) {
        suggestions.push(command);
      }
    }
    
    return suggestions.slice(0, 3);
  }
  
  /**
   * Calculate Levenshtein distance for suggestions
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
  
  /**
   * Format deprecation warning
   */
  private formatDeprecationWarning(command: string, mapping: CommandMapping): string {
    let warning = `\n[DEPRECATION WARNING] Command '${command}' is deprecated.`;
    
    if (mapping.deprecation) {
      warning += `\n${mapping.deprecation}`;
    }
    
    if (mapping.replacement) {
      warning += `\nReplacement: ${mapping.replacement}`;
    }
    
    warning += `\nThis command will be removed in FLCM 3.0.\n`;
    
    return warning;
  }
  
  /**
   * Get help text
   */
  getHelp(): string {
    const help = `
FLCM Command Mode - Legacy Commands

COLLECTOR COMMANDS:
  collect [source]     - Gather insights from source
  collect-web [url]    - Collect from webpage

SCHOLAR COMMANDS:
  deep-dive [topic]    - Deep understanding of topic
  teach [subject]      - Prepare to teach subject

CREATOR COMMANDS:
  create [type]        - Create content
  voice-analyze        - Analyze writing voice

ADAPTER COMMANDS:
  adapt [platform]     - Adapt content for platform
  publish [target]     - Publish to target platform

UTILITY COMMANDS:
  help                 - Show this help
  status              - Show current status
  clear               - Clear context

MODE COMMANDS:
  /mode collaborative  - Switch to collaborative mode
  /mode               - Toggle between modes

Note: Commands marked with [DEPRECATION] will be removed in FLCM 3.0.
Consider switching to collaborative mode for a guided experience.
`;
    
    return help;
  }
  
  /**
   * Get status
   */
  private getStatus(): string {
    const sessionData = this.context.getSessionData();
    const docs = this.context.getActiveDocuments();
    
    return `
FLCM Command Mode Status

Session: ${sessionData.session_id}
Started: ${sessionData.start_time.toLocaleString()}
Commands Executed: ${sessionData.commands_executed}
Mode Switches: ${sessionData.mode_switches}
Active Documents: ${docs.size}
Frameworks Used: ${sessionData.frameworks_used.join(', ') || 'None'}

Type 'help' for commands or '/mode collaborative' for guided mode.
`;
  }
  
  /**
   * Initialize mode
   */
  async initialize(context: SharedContext): Promise<void> {
    this.context = context;
    this.logger.info('Command mode initialized');
  }
  
  /**
   * Prepare for mode switch
   */
  async prepareForSwitch(): Promise<void> {
    // Save any pending state
    this.logger.info('Preparing command mode for switch');
  }
  
  /**
   * Set deprecation warnings
   */
  setDeprecationWarnings(enabled: boolean): void {
    this.deprecationWarnings = enabled;
  }
}