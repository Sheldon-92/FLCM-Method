"use strict";
/**
 * FLCM Command Router
 * Routes and executes FLCM commands with proper integration to agents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.CommandRouter = void 0;
const types_1 = require("./types");
const scholar_handler_1 = require("./scholar-handler");
const creator_handler_1 = require("./creator-handler");
const publisher_handler_1 = require("./publisher-handler");
const workflow_handler_1 = require("./workflow-handler");
class CommandRouter {
    constructor() {
        this.handlers = new Map();
        this.aliases = new Map();
        this.history = [];
        this.registerHandlers();
        this.registerAliases();
    }
    /**
     * Register all available command handlers
     */
    registerHandlers() {
        // Agent-specific handlers
        this.handlers.set('flcm:scholar', new scholar_handler_1.ScholarHandler());
        this.handlers.set('flcm:create', new creator_handler_1.CreatorHandler());
        this.handlers.set('flcm:creator', new creator_handler_1.CreatorHandler());
        this.handlers.set('flcm:publish', new publisher_handler_1.PublisherHandler());
        this.handlers.set('flcm:publisher', new publisher_handler_1.PublisherHandler());
        this.handlers.set('flcm:adapter', new publisher_handler_1.PublisherHandler()); // Adapter is part of Publisher workflow
        // Workflow handlers
        this.handlers.set('flcm:flow', new workflow_handler_1.WorkflowHandler());
        this.handlers.set('flcm:quick', new workflow_handler_1.WorkflowHandler('quick'));
        this.handlers.set('flcm:standard', new workflow_handler_1.WorkflowHandler('standard'));
        // System commands
        this.handlers.set('flcm:help', {
            execute: async () => this.showHelp()
        });
        this.handlers.set('flcm:status', {
            execute: async () => this.showStatus()
        });
        this.handlers.set('flcm:history', {
            execute: async () => this.showHistory()
        });
    }
    /**
     * Register command aliases
     */
    registerAliases() {
        // Main namespace alias
        this.aliases.set('fc', 'flcm');
        // Command shortcuts
        this.aliases.set('flcm:s', 'flcm:scholar');
        this.aliases.set('flcm:c', 'flcm:create');
        this.aliases.set('flcm:p', 'flcm:publish');
        this.aliases.set('flcm:f', 'flcm:flow');
        this.aliases.set('flcm:q', 'flcm:quick');
        this.aliases.set('flcm:?', 'flcm:help');
        // Support fc: prefix for all commands
        const commands = Array.from(this.handlers.keys());
        commands.forEach(cmd => {
            if (cmd.startsWith('flcm:')) {
                const fcCmd = cmd.replace('flcm:', 'fc:');
                this.aliases.set(fcCmd, cmd);
            }
        });
    }
    /**
     * Execute a command
     */
    async execute(context) {
        const startTime = Date.now();
        let status = 'success';
        let result;
        try {
            // Resolve aliases
            let commandName = this.resolveAlias(context.command);
            // Get command handler
            const handler = this.handlers.get(commandName);
            if (!handler) {
                throw new types_1.FLCMCommandError('COMMAND_NOT_FOUND', `Unknown command: ${context.command}`, [`Run /flcm:help to see available commands`], ['/flcm:help', '/flcm:scholar --help', '/flcm:create --help']);
            }
            // Execute command
            console.log(`🚀 Executing: ${commandName}`);
            result = await handler.execute(context);
            result.processingTime = Date.now() - startTime;
        }
        catch (error) {
            status = 'error';
            if (error instanceof types_1.FLCMCommandError) {
                result = {
                    success: false,
                    message: error.message,
                    error: error.code,
                    data: {
                        suggestions: error.suggestions,
                        examples: error.examples
                    }
                };
            }
            else {
                result = {
                    success: false,
                    message: 'Command execution failed',
                    error: error.message
                };
            }
            result.processingTime = Date.now() - startTime;
        }
        finally {
            // Record in history
            this.recordHistory(context.command, status, Date.now() - startTime);
        }
        return result;
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
     * Show help information
     */
    async showHelp() {
        const helpText = `
🚀 FLCM 2.0 Command System

📚 AGENT COMMANDS:
  /flcm:scholar    - Deep content analysis and learning
  /flcm:create     - Content creation with voice preservation  
  /flcm:publish    - Multi-platform content optimization

🔄 WORKFLOW COMMANDS:
  /flcm:flow       - Complete content creation pipeline
  /flcm:quick      - Quick content generation (20-30 min)
  /flcm:standard   - Standard deep content creation (45-60 min)

⚙️  SYSTEM COMMANDS:
  /flcm:help       - Show this help message
  /flcm:status     - Show system status
  /flcm:history    - Show command history

📖 EXAMPLES:
  /flcm:scholar --input "research.pdf" --framework "SWOT-USED"
  /flcm:create --mode quick --topic "AI trends"
  /flcm:publish --platform "linkedin,zhihu" --content "draft.md"
  /flcm:flow --input "data.txt" --mode standard --output-all

Use --help with any command for detailed options.
    `.trim();
        return {
            success: true,
            message: helpText,
            data: {
                commands: Array.from(this.handlers.keys()),
                aliases: Object.fromEntries(this.aliases.entries())
            }
        };
    }
    /**
     * Show system status
     */
    async showStatus() {
        const totalCommands = this.history.length;
        const successRate = totalCommands > 0
            ? (this.history.filter(h => h.status === 'success').length / totalCommands * 100).toFixed(1)
            : '0';
        const avgDuration = totalCommands > 0
            ? (this.history.reduce((sum, h) => sum + h.duration, 0) / totalCommands).toFixed(0)
            : '0';
        const statusText = `
🎯 FLCM System Status

📊 STATISTICS:
  Commands executed: ${totalCommands}
  Success rate: ${successRate}%
  Average duration: ${avgDuration}ms

✅ AVAILABLE AGENTS:
  🎓 Scholar Agent - Ready for content analysis
  ✍️  Creator Agent - Ready for content creation
  📱 Publisher Agent - Ready for content optimization

🔧 SYSTEM HEALTH: All systems operational
    `.trim();
        return {
            success: true,
            message: statusText,
            data: {
                totalCommands,
                successRate: parseFloat(successRate),
                avgDuration: parseInt(avgDuration),
                agents: ['scholar', 'creator', 'publisher'],
                health: 'operational'
            }
        };
    }
    /**
     * Show command history
     */
    async showHistory() {
        const recentHistory = this.history.slice(-10);
        let historyText = '📜 Recent Command History:\n\n';
        if (recentHistory.length === 0) {
            historyText += 'No commands executed yet.';
        }
        else {
            recentHistory.forEach((entry, index) => {
                const status = entry.status === 'success' ? '✅' : '❌';
                const time = new Date(entry.timestamp).toLocaleTimeString();
                historyText += `${index + 1}. ${status} ${entry.command} (${entry.duration}ms) - ${time}\n`;
            });
        }
        return {
            success: true,
            message: historyText,
            data: {
                history: recentHistory,
                total: this.history.length
            }
        };
    }
    /**
     * Record command in history
     */
    recordHistory(command, status, duration) {
        const entry = {
            command,
            timestamp: new Date().toISOString(),
            status,
            duration
        };
        this.history.push(entry);
        // Keep only last 100 entries
        if (this.history.length > 100) {
            this.history = this.history.slice(-100);
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
        this.handlers.forEach((_, cmd) => {
            if (cmd.toLowerCase().startsWith(query.toLowerCase())) {
                suggestions.push('/' + cmd);
            }
        });
        // Check aliases
        this.aliases.forEach((target, alias) => {
            if (alias.toLowerCase().startsWith(query.toLowerCase())) {
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
}
exports.CommandRouter = CommandRouter;
// Export singleton instance
exports.router = new CommandRouter();
// Export main execute function
async function executeCommand(command, args = [], options = {}, user) {
    const context = { command, args, options, user };
    return await exports.router.execute(context);
}
exports.default = executeCommand;
//# sourceMappingURL=command-router.js.map