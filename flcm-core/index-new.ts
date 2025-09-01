/**
 * FLCM 2.0 Main Entry Point with Command Integration
 * Updated to include Phase 3 Claude Integration functionality
 */

// Command System Exports
export {
  executeFLCMCommand,
  getAvailableCommands,
  getCommandSuggestions,
  getCommandHistory,
  CommandRouter,
  router,
  ScholarHandler,
  CreatorHandler,
  PublisherHandler,
  WorkflowHandler,
  CommandResult,
  FLCMCommandError
} from './commands';

// Agent Exports
export { CollectorAgent } from './agents/implementations/collector-agent';
export { ScholarAgent } from './agents/implementations/scholar-agent';
export { CreatorAgent } from './agents/implementations/creator-agent';
export { AdapterAgent } from './agents/implementations/adapter-agent';
export { FLCMAgent } from './agents/flcm-main';
export { BaseAgent, Document, AgentError } from './agents/base-agent';

// Core System Exports
export { AgentManager } from './agents/agent-manager';

// Create main FLCM interface
import { executeFLCMCommand } from './commands';
import { FLCMAgent } from './agents/flcm-main';
import * as express from 'express';

/**
 * Main FLCM Class - Primary Interface
 */
export class FLCM {
  private static instance: FLCM;
  private flcmAgent: FLCMAgent;
  private initialized = false;

  private constructor() {
    this.flcmAgent = new FLCMAgent();
  }

  static getInstance(): FLCM {
    if (!FLCM.instance) {
      FLCM.instance = new FLCM();
    }
    return FLCM.instance;
  }

  /**
   * Initialize FLCM system
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    
    console.log('🚀 Initializing FLCM 2.0 System...');
    
    // Initialize core agent
    await this.flcmAgent.init();
    
    this.initialized = true;
    console.log('✅ FLCM 2.0 ready for command execution');
  }

  /**
   * Execute FLCM command
   */
  async executeCommand(
    command: string,
    args: string[] = [],
    options: Record<string, any> = {},
    user?: any
  ) {
    if (!this.initialized) {
      await this.init();
    }
    
    return await executeFLCMCommand(command, args, options, user);
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
    } catch (error: any) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Express Server Setup
const app = express();
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
    
  } catch (error: any) {
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
  } catch (error: any) {
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
    } catch (error: any) {
      console.error(`❌ Failed to initialize FLCM: ${error.message}`);
      process.exit(1);
    }
  });
}

// Export app and main class
export { app, FLCM };

// Default export
export default FLCM;