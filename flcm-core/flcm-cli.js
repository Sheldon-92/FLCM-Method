#!/usr/bin/env node

/**
 * FLCM CLI - BMad Style Architecture
 * 配置驱动、零编译依赖的内容创作平台
 */

const path = require('path');
const fs = require('fs');

// 核心配置
const FLCM_VERSION = '2.0.0';
const FLCM_HOME = process.env.FLCM_HOME || path.join(process.env.HOME, '.flcm');

// 显示Logo
function showLogo() {
  console.log(`
╔═══════════════════════════════════════╗
║      FLCM - Content Maker v${FLCM_VERSION}      ║
║   Friction Lab Content Creation AI    ║
╚═══════════════════════════════════════╝
  `);
}

// 主命令处理
class FLCMCli {
  constructor() {
    this.commands = {
      help: this.showHelp,
      status: this.showStatus,
      analyze: this.runAnalyze,
      create: this.runCreate,
      publish: this.runPublish,
      workflow: this.runWorkflow,
      agent: this.switchAgent,
      config: this.showConfig
    };
  }

  async run(args) {
    const command = args[0] || 'help';
    const params = args.slice(1);

    // 版本检查
    if (command === '--version' || command === '-v') {
      console.log(FLCM_VERSION);
      return;
    }

    // 执行命令
    const handler = this.commands[command];
    if (handler) {
      try {
        await handler.call(this, params);
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
    } else {
      console.log(`❌ Unknown command: ${command}`);
      console.log('Run "flcm help" for available commands');
    }
  }

  showHelp() {
    showLogo();
    console.log(`
📚 Available Commands:

  analyze <input>   Analyze content with Scholar agent
  create <mode>     Create content with Creator agent
  publish <platform> Publish content with Publisher agent  
  workflow <name>   Run complete workflow
  
  agent <name>      Switch to specific agent mode
  config           Show configuration
  status           Show system status
  help             Show this help message

🎯 Quick Start:

  flcm analyze "https://example.com/article"
  flcm create quick "AI trends"
  flcm publish xiaohongshu
  
💡 Modes & Options:

  Creation Modes: quick (20min), standard (45min), deep (60min+)
  Platforms: xiaohongshu, zhihu, wechat, linkedin
  
📖 Documentation: https://github.com/Sheldon-92/FLCM-Method
    `);
  }

  async showStatus() {
    console.log('✅ FLCM System Status\n');
    console.log(`📍 Version: ${FLCM_VERSION}`);
    console.log(`📁 Home: ${FLCM_HOME}`);
    
    // 检查agent配置
    const agentsDir = path.join(__dirname, 'agents');
    if (fs.existsSync(agentsDir)) {
      const agents = fs.readdirSync(agentsDir)
        .filter(f => f.endsWith('.yaml'))
        .map(f => f.replace('.yaml', ''));
      console.log(`🤖 Available Agents: ${agents.join(', ')}`);
    }
    
    // 检查任务
    const tasksDir = path.join(__dirname, 'tasks');
    if (fs.existsSync(tasksDir)) {
      const tasks = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      console.log(`📋 Loaded Tasks: ${tasks.length}`);
    }
    
    console.log('🚀 System: Ready');
  }

  async runAnalyze(params) {
    const input = params.join(' ');
    if (!input) {
      console.log('❌ Please provide content to analyze');
      console.log('Usage: flcm analyze <url or text>');
      return;
    }

    console.log('📚 Activating Scholar Agent...');
    const orchestrator = this.getOrchestrator();
    await orchestrator.execute('scholar', 'analyze', { input });
  }

  async runCreate(params) {
    const mode = params[0] || 'quick';
    const topic = params.slice(1).join(' ');
    
    console.log(`✍️ Activating Creator Agent (${mode} mode)...`);
    const orchestrator = this.getOrchestrator();
    await orchestrator.execute('creator', 'create', { mode, topic });
  }

  async runPublish(params) {
    const platform = params[0] || 'all';
    
    console.log(`📤 Activating Publisher Agent for ${platform}...`);
    const orchestrator = this.getOrchestrator();
    await orchestrator.execute('publisher', 'publish', { platform });
  }

  async runWorkflow(params) {
    const workflow = params[0] || 'standard';
    
    console.log(`🔄 Starting ${workflow} workflow...`);
    const orchestrator = this.getOrchestrator();
    await orchestrator.executeWorkflow(workflow);
  }

  async switchAgent(params) {
    const agentName = params[0];
    if (!agentName) {
      console.log('Available agents: scholar, creator, publisher');
      return;
    }
    
    console.log(`🎭 Switching to ${agentName} agent...`);
    const orchestrator = this.getOrchestrator();
    await orchestrator.activateAgent(agentName);
  }

  showConfig() {
    console.log('⚙️ FLCM Configuration\n');
    
    // 尝试加载配置文件
    const configPath = path.join(__dirname, 'config', 'core-config.yaml');
    if (fs.existsSync(configPath)) {
      console.log(`📄 Config file: ${configPath}`);
      // 这里可以解析并显示配置
    } else {
      console.log('📄 Using default configuration');
    }
    
    console.log('\n💡 Edit ~/.flcm/config/user-prefs.yaml to customize');
  }

  getOrchestrator() {
    // 延迟加载orchestrator
    const Orchestrator = require('./orchestrator');
    return new Orchestrator();
  }
}

// 主入口
if (require.main === module) {
  const cli = new FLCMCli();
  cli.run(process.argv.slice(2));
}

module.exports = FLCMCli;