/**
 * FLCM Command System Entry Point
 * Main interface for Claude Code command integration
 */
/**
 * Main command handler for Claude Code
 * This is the entry point for all FLCM commands
 */
export declare function flcm(input?: string): Promise<void>;
/**
 * Shortcut commands for common operations
 */
export declare const commands: {
    init: (options?: any) => Promise<void>;
    help: (command?: string) => Promise<void>;
    status: (verbose?: boolean) => Promise<void>;
    quick: (source: string) => Promise<void>;
    standard: (source: string) => Promise<void>;
    collect: (source: string) => Promise<void>;
    scholar: (brief: string) => Promise<void>;
    create: (synthesis: string) => Promise<void>;
    adapt: (draft: string, platform?: string) => Promise<void>;
    config: (action?: string, key?: string, value?: string) => Promise<void>;
};
/**
 * Get command suggestions for autocomplete
 */
export declare function getSuggestions(partial: string): string[];
/**
 * Get command history
 */
export declare function getHistory(): Array<any>;
export default flcm;
/**
 * Command registration for Claude Code
 * These would be registered with Claude Code's command system
 */
export declare const FLCM_COMMANDS: {
    '/flcm': typeof flcm;
    '/flcm:init': () => Promise<void>;
    '/flcm:help': () => Promise<void>;
    '/flcm:status': () => Promise<void>;
    '/flcm:quick': (source: string) => Promise<void>;
    '/flcm:standard': (source: string) => Promise<void>;
    '/flcm:collect': (source: string) => Promise<void>;
    '/flcm:scholar': (brief: string) => Promise<void>;
    '/flcm:create': (synthesis: string) => Promise<void>;
    '/flcm:adapt': (draft: string, platform?: string) => Promise<void>;
    '/flcm:config': () => Promise<void>;
    '/fc': typeof flcm;
    '/fc:init': () => Promise<void>;
    '/fc:help': () => Promise<void>;
    '/fc:status': () => Promise<void>;
    '/fc:q': (source: string) => Promise<void>;
    '/fc:s': (source: string) => Promise<void>;
    '/fc:c': (source: string) => Promise<void>;
    '/fc:?': () => Promise<void>;
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
