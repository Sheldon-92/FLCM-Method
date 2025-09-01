"use strict";
/**
 * FLCM Command System Entry Point
 * Main interface for Claude Code command integration
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLCM_COMMANDS = exports.getHistory = exports.getSuggestions = exports.commands = exports.flcm = void 0;
const command_router_1 = __importStar(require("./utils/command-router"));
const error_handler_1 = require("./utils/error-handler");
/**
 * Parse command string into components
 */
function parseCommand(commandString) {
    const parts = commandString.trim().split(/\s+/);
    const command = parts[0];
    const args = [];
    const options = {};
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (part.startsWith('--')) {
            // Long option
            const [key, value] = part.substring(2).split('=');
            options[key] = value || true;
        }
        else if (part.startsWith('-')) {
            // Short option
            const key = part.substring(1);
            options[key] = true;
        }
        else {
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
async function flcm(input = 'help') {
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
        await (0, command_router_1.default)(fullCommand, args, options);
    }
    catch (error) {
        await (0, error_handler_1.handleError)(error);
    }
}
exports.flcm = flcm;
/**
 * Shortcut commands for common operations
 */
exports.commands = {
    // System commands
    init: async (options) => flcm(`init ${options || ''}`),
    help: async (command) => flcm(`help ${command || ''}`),
    status: async (verbose) => flcm(`status ${verbose ? '--verbose' : ''}`),
    // Workflow commands (to be implemented)
    quick: async (source) => flcm(`quick "${source}"`),
    standard: async (source) => flcm(`standard "${source}"`),
    // Agent commands (to be implemented)
    collect: async (source) => flcm(`collect "${source}"`),
    scholar: async (brief) => flcm(`scholar "${brief}"`),
    create: async (synthesis) => flcm(`create "${synthesis}"`),
    adapt: async (draft, platform) => flcm(`adapt "${draft}" ${platform ? `--platform=${platform}` : ''}`),
    // Configuration command
    config: async (action, key, value) => {
        const parts = ['config'];
        if (action)
            parts.push(action);
        if (key)
            parts.push(key);
        if (value)
            parts.push(value);
        return flcm(parts.join(' '));
    }
};
/**
 * Get command suggestions for autocomplete
 */
function getSuggestions(partial) {
    return command_router_1.router.getSuggestions(partial);
}
exports.getSuggestions = getSuggestions;
/**
 * Get command history
 */
function getHistory() {
    return command_router_1.router.getHistory();
}
exports.getHistory = getHistory;
// Export default handler
exports.default = flcm;
/**
 * Command registration for Claude Code
 * These would be registered with Claude Code's command system
 */
exports.FLCM_COMMANDS = {
    '/flcm': flcm,
    '/flcm:init': () => exports.commands.init(),
    '/flcm:help': () => exports.commands.help(),
    '/flcm:status': () => exports.commands.status(),
    '/flcm:quick': (source) => exports.commands.quick(source),
    '/flcm:standard': (source) => exports.commands.standard(source),
    '/flcm:collect': (source) => exports.commands.collect(source),
    '/flcm:scholar': (brief) => exports.commands.scholar(brief),
    '/flcm:create': (synthesis) => exports.commands.create(synthesis),
    '/flcm:adapt': (draft, platform) => exports.commands.adapt(draft, platform),
    '/flcm:config': () => exports.commands.config(),
    // Aliases
    '/fc': flcm,
    '/fc:init': () => exports.commands.init(),
    '/fc:help': () => exports.commands.help(),
    '/fc:status': () => exports.commands.status(),
    '/fc:q': (source) => exports.commands.quick(source),
    '/fc:s': (source) => exports.commands.standard(source),
    '/fc:c': (source) => exports.commands.collect(source),
    '/fc:?': () => exports.commands.help(),
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
//# sourceMappingURL=index.js.map