"use strict";
/**
 * FLCM Command System Main Export
 * Central entry point for all FLCM command functionality
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommandHistory = exports.getCommandSuggestions = exports.getAvailableCommands = exports.executeFLCMCommand = exports.FLCMCommandError = exports.WorkflowHandler = exports.PublisherHandler = exports.CreatorHandler = exports.ScholarHandler = exports.executeCommand = exports.router = exports.CommandRouter = void 0;
var command_router_1 = require("./command-router");
Object.defineProperty(exports, "CommandRouter", { enumerable: true, get: function () { return command_router_1.CommandRouter; } });
Object.defineProperty(exports, "router", { enumerable: true, get: function () { return command_router_1.router; } });
Object.defineProperty(exports, "executeCommand", { enumerable: true, get: function () { return __importDefault(command_router_1).default; } });
var scholar_handler_1 = require("./scholar-handler");
Object.defineProperty(exports, "ScholarHandler", { enumerable: true, get: function () { return scholar_handler_1.ScholarHandler; } });
var creator_handler_1 = require("./creator-handler");
Object.defineProperty(exports, "CreatorHandler", { enumerable: true, get: function () { return creator_handler_1.CreatorHandler; } });
var publisher_handler_1 = require("./publisher-handler");
Object.defineProperty(exports, "PublisherHandler", { enumerable: true, get: function () { return publisher_handler_1.PublisherHandler; } });
var workflow_handler_1 = require("./workflow-handler");
Object.defineProperty(exports, "WorkflowHandler", { enumerable: true, get: function () { return workflow_handler_1.WorkflowHandler; } });
var types_1 = require("./types");
Object.defineProperty(exports, "FLCMCommandError", { enumerable: true, get: function () { return types_1.FLCMCommandError; } });
// Main command execution function
const command_router_2 = require("./command-router");
/**
 * Execute FLCM command from Claude interface
 * This is the main entry point called by Claude Code
 */
async function executeFLCMCommand(command, args = [], options = {}, user) {
    const context = { command, args, options, user };
    return await command_router_2.router.execute(context);
}
exports.executeFLCMCommand = executeFLCMCommand;
/**
 * Get available FLCM commands
 */
function getAvailableCommands() {
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
exports.getAvailableCommands = getAvailableCommands;
/**
 * Get command suggestions for autocomplete
 */
function getCommandSuggestions(partial) {
    return command_router_2.router.getSuggestions(partial);
}
exports.getCommandSuggestions = getCommandSuggestions;
/**
 * Get command history
 */
function getCommandHistory() {
    return command_router_2.router.getHistory();
}
exports.getCommandHistory = getCommandHistory;
//# sourceMappingURL=index.js.map