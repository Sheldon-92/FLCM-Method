"use strict";
/**
 * FLCM Command Router
 * Routes and executes FLCM commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.CommandRouter = void 0;
const flcm_init_1 = __importDefault(require("../flcm-init"));
const flcm_help_1 = __importDefault(require("../flcm-help"));
const flcm_status_1 = __importDefault(require("../flcm-status"));
const error_handler_1 = require("./error-handler");
class CommandRouter {
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
    registerCommands() {
        // System commands
        this.commands.set('flcm:init', flcm_init_1.default);
        this.commands.set('flcm:help', flcm_help_1.default);
        this.commands.set('flcm:status', flcm_status_1.default);
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
    registerAliases() {
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
    async execute(context) {
        const startTime = Date.now();
        let status = 'success';
        try {
            // Resolve aliases
            let commandName = this.resolveAlias(context.command);
            // Get command handler
            const handler = this.commands.get(commandName);
            if (!handler) {
                throw new error_handler_1.FLCMError(`Unknown command: ${context.command}`, 'COMMAND_NOT_FOUND', `Run /flcm:help to see available commands`);
            }
            // Execute command
            await handler(context.options);
        }
        catch (error) {
            status = 'error';
            if (error instanceof error_handler_1.FLCMError) {
                error.display();
            }
            else {
                console.error('❌ Command failed:', error.message);
            }
            throw error;
        }
        finally {
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
    resolveAlias(command) {
        // Remove leading slash if present
        let cmd = command.startsWith('/') ? command.substring(1) : command;
        // Check direct alias
        if (this.aliases.has(cmd)) {
            return this.aliases.get(cmd);
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
    recordHistory(command, status) {
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
    async persistHistory() {
        const fs = require('fs');
        const path = require('path');
        const historyPath = path.join(process.cwd(), '.flcm-core', 'data', 'command-history.json');
        try {
            fs.writeFileSync(historyPath, JSON.stringify(this.history, null, 2));
        }
        catch (error) {
            // Ignore write errors
        }
    }
    /**
     * Get command suggestions for autocomplete
     */
    getSuggestions(partial) {
        const suggestions = [];
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
    getHistory() {
        return this.history;
    }
    /**
     * Placeholder for not yet implemented commands
     */
    notImplemented(commandName) {
        return async () => {
            throw new error_handler_1.FLCMError(`Command '${commandName}' is not yet implemented`, 'NOT_IMPLEMENTED', 'This command will be available in a future update');
        };
    }
}
exports.CommandRouter = CommandRouter;
// Export singleton instance
exports.router = new CommandRouter();
// Export main execute function
async function executeCommand(command, args = [], options = {}) {
    const context = { command, args, options };
    await exports.router.execute(context);
}
exports.default = executeCommand;
//# sourceMappingURL=command-router.js.map