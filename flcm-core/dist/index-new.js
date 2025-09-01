"use strict";
/**
 * FLCM 2.0 Main Entry Point with Command Integration
 * Updated to include Phase 3 Claude Integration functionality
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
exports.app = exports.FLCM = exports.AgentManager = exports.AgentError = exports.BaseAgent = exports.FLCMAgent = exports.AdapterAgent = exports.CreatorAgent = exports.ScholarAgent = exports.CollectorAgent = exports.FLCMCommandError = exports.WorkflowHandler = exports.PublisherHandler = exports.CreatorHandler = exports.ScholarHandler = exports.router = exports.CommandRouter = exports.getCommandHistory = exports.getCommandSuggestions = exports.getAvailableCommands = exports.executeFLCMCommand = void 0;
// Command System Exports
var commands_1 = require("./commands");
Object.defineProperty(exports, "executeFLCMCommand", { enumerable: true, get: function () { return commands_1.executeFLCMCommand; } });
Object.defineProperty(exports, "getAvailableCommands", { enumerable: true, get: function () { return commands_1.getAvailableCommands; } });
Object.defineProperty(exports, "getCommandSuggestions", { enumerable: true, get: function () { return commands_1.getCommandSuggestions; } });
Object.defineProperty(exports, "getCommandHistory", { enumerable: true, get: function () { return commands_1.getCommandHistory; } });
Object.defineProperty(exports, "CommandRouter", { enumerable: true, get: function () { return commands_1.CommandRouter; } });
Object.defineProperty(exports, "router", { enumerable: true, get: function () { return commands_1.router; } });
Object.defineProperty(exports, "ScholarHandler", { enumerable: true, get: function () { return commands_1.ScholarHandler; } });
Object.defineProperty(exports, "CreatorHandler", { enumerable: true, get: function () { return commands_1.CreatorHandler; } });
Object.defineProperty(exports, "PublisherHandler", { enumerable: true, get: function () { return commands_1.PublisherHandler; } });
Object.defineProperty(exports, "WorkflowHandler", { enumerable: true, get: function () { return commands_1.WorkflowHandler; } });
Object.defineProperty(exports, "FLCMCommandError", { enumerable: true, get: function () { return commands_1.FLCMCommandError; } });
// Agent Exports
var collector_agent_1 = require("./agents/implementations/collector-agent");
Object.defineProperty(exports, "CollectorAgent", { enumerable: true, get: function () { return collector_agent_1.CollectorAgent; } });
var scholar_agent_1 = require("./agents/implementations/scholar-agent");
Object.defineProperty(exports, "ScholarAgent", { enumerable: true, get: function () { return scholar_agent_1.ScholarAgent; } });
var creator_agent_1 = require("./agents/implementations/creator-agent");
Object.defineProperty(exports, "CreatorAgent", { enumerable: true, get: function () { return creator_agent_1.CreatorAgent; } });
var adapter_agent_1 = require("./agents/implementations/adapter-agent");
Object.defineProperty(exports, "AdapterAgent", { enumerable: true, get: function () { return adapter_agent_1.AdapterAgent; } });
var flcm_main_1 = require("./agents/flcm-main");
Object.defineProperty(exports, "FLCMAgent", { enumerable: true, get: function () { return flcm_main_1.FLCMAgent; } });
var base_agent_1 = require("./agents/base-agent");
Object.defineProperty(exports, "BaseAgent", { enumerable: true, get: function () { return base_agent_1.BaseAgent; } });
Object.defineProperty(exports, "AgentError", { enumerable: true, get: function () { return base_agent_1.AgentError; } });
// Core System Exports
var agent_manager_1 = require("./agents/agent-manager");
Object.defineProperty(exports, "AgentManager", { enumerable: true, get: function () { return agent_manager_1.AgentManager; } });
// Create main FLCM interface
const commands_2 = require("./commands");
const flcm_main_2 = require("./agents/flcm-main");
const express = __importStar(require("express"));
/**
 * Main FLCM Class - Primary Interface
 */
class FLCM {
    constructor() {
        this.initialized = false;
        this.flcmAgent = new flcm_main_2.FLCMAgent();
    }
    static getInstance() {
        if (!FLCM.instance) {
            FLCM.instance = new FLCM();
        }
        return FLCM.instance;
    }
    /**
     * Initialize FLCM system
     */
    async init() {
        if (this.initialized)
            return;
        console.log('🚀 Initializing FLCM 2.0 System...');
        // Initialize core agent
        await this.flcmAgent.init();
        this.initialized = true;
        console.log('✅ FLCM 2.0 ready for command execution');
    }
    /**
     * Execute FLCM command
     */
    async executeCommand(command, args = [], options = {}, user) {
        if (!this.initialized) {
            await this.init();
        }
        return await (0, commands_2.executeFLCMCommand)(command, args, options, user);
    }
    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            version: '2.0.0',
            agents: {
                collector: 'ready',
                scholar: 'ready',
                creator: 'ready',
                publisher: 'ready'
            },
            commands: [
                'flcm:scholar', 'flcm:create', 'flcm:publish', 'flcm:flow',
                'flcm:quick', 'flcm:standard', 'flcm:help', 'flcm:status'
            ]
        };
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const status = this.getStatus();
            return {
                healthy: this.initialized,
                timestamp: new Date().toISOString(),
                ...status
            };
        }
        catch (error) {
            return {
                healthy: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}
exports.FLCM = FLCM;
// Express Server Setup
const app = express();
exports.app = app;
app.use(express.json());
// FLCM instance
const flcm = FLCM.getInstance();
// Command execution endpoint
app.post('/flcm/execute', async (req, res) => {
    try {
        const { command, args = [], options = {} } = req.body;
        if (!command) {
            return res.status(400).json({
                success: false,
                error: 'Command is required'
            });
        }
        const result = await flcm.executeCommand(command, args, options, req.user);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code || 'INTERNAL_ERROR'
        });
    }
});
// Health check endpoint
app.get('/health', async (req, res) => {
    const health = await flcm.healthCheck();
    const statusCode = health.healthy ? 200 : 503;
    res.status(statusCode).json(health);
});
// Status endpoint
app.get('/status', (req, res) => {
    res.json(flcm.getStatus());
});
// Help endpoint
app.get('/help', async (req, res) => {
    try {
        const result = await flcm.executeCommand('flcm:help');
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Start server if running directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, async () => {
        console.log(`🌐 FLCM 2.0 Server started on port ${PORT}`);
        // Initialize FLCM system
        try {
            await flcm.init();
            console.log(`✅ Server ready at http://localhost:${PORT}`);
            console.log(`📚 Available endpoints:`);
            console.log(`   POST /flcm/execute - Execute FLCM commands`);
            console.log(`   GET  /health       - Health check`);
            console.log(`   GET  /status       - System status`);
            console.log(`   GET  /help         - Available commands`);
        }
        catch (error) {
            console.error(`❌ Failed to initialize FLCM: ${error.message}`);
            process.exit(1);
        }
    });
}
// Default export
exports.default = FLCM;
//# sourceMappingURL=index-new.js.map