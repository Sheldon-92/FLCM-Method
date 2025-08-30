/**
 * FLCM Status Command
 * Display current system status and health information
 */

import * as fs from 'fs';
import * as path from 'path';
import configLoader from '../utils/config-loader';

export interface StatusOptions {
  verbose?: boolean;
  json?: boolean;
}

interface SystemStatus {
  initialized: boolean;
  version: string;
  mode: string;
  agents: {
    [key: string]: {
      enabled: boolean;
      status: string;
    };
  };
  workflows: {
    [key: string]: {
      enabled: boolean;
      lastRun?: string;
    };
  };
  configuration: {
    valid: boolean;
    path: string;
    userConfigExists: boolean;
  };
  health: {
    directories: boolean;
    configuration: boolean;
    templates: boolean;
    overall: string;
  };
  recentOperations: Array<{
    command: string;
    timestamp: string;
    status: string;
  }>;
}

export class StatusCommand {
  private basePath: string;

  constructor() {
    this.basePath = process.cwd();
  }

  /**
   * Execute the status command
   */
  async execute(options: StatusOptions = {}): Promise<void> {
    const status = await this.collectStatus();

    if (options.json) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      this.displayStatus(status, options.verbose || false);
    }
  }

  /**
   * Collect system status information
   */
  private async collectStatus(): Promise<SystemStatus> {
    const flcmPath = path.join(this.basePath, '.flcm-core');
    const initialized = fs.existsSync(flcmPath);

    let config: any = null;
    let configValid = false;
    let userConfigExists = false;

    try {
      config = configLoader.getConfig();
      configValid = config !== null;
      userConfigExists = fs.existsSync(path.join(flcmPath, 'data', 'user-config.yaml'));
    } catch (error) {
      // Config loading failed
    }

    const status: SystemStatus = {
      initialized,
      version: config?.system?.version || 'unknown',
      mode: config?.system?.mode || 'unknown',
      agents: {},
      workflows: {},
      configuration: {
        valid: configValid,
        path: path.join(flcmPath, 'core-config.yaml'),
        userConfigExists
      },
      health: {
        directories: false,
        configuration: configValid,
        templates: false,
        overall: 'unknown'
      },
      recentOperations: []
    };

    if (initialized && config) {
      // Check agents
      const agents = ['collector', 'scholar', 'creator', 'adapter'];
      agents.forEach(agent => {
        status.agents[agent] = {
          enabled: config.agents?.[agent]?.enabled || false,
          status: config.agents?.[agent]?.enabled ? 'ready' : 'disabled'
        };
      });

      // Check workflows
      const workflows = ['quick_mode', 'standard_mode'];
      workflows.forEach(workflow => {
        status.workflows[workflow] = {
          enabled: config.workflows?.[workflow]?.enabled || false
        };
      });

      // Check directory health
      status.health.directories = this.checkDirectories();
      
      // Check templates
      status.health.templates = this.checkTemplates();

      // Calculate overall health
      const healthChecks = [
        status.health.directories,
        status.health.configuration,
        status.health.templates
      ];
      const healthScore = healthChecks.filter(h => h).length / healthChecks.length;
      
      if (healthScore === 1) {
        status.health.overall = 'healthy';
      } else if (healthScore >= 0.5) {
        status.health.overall = 'degraded';
      } else {
        status.health.overall = 'unhealthy';
      }

      // Load recent operations (if history file exists)
      status.recentOperations = this.loadRecentOperations();
    }

    return status;
  }

  /**
   * Check if required directories exist
   */
  private checkDirectories(): boolean {
    const requiredDirs = [
      '.flcm-core/agents',
      '.flcm-core/workflows',
      '.flcm-core/tasks',
      '.flcm-core/templates',
      '.flcm-core/methodologies',
      '.flcm-core/data'
    ];

    return requiredDirs.every(dir => 
      fs.existsSync(path.join(this.basePath, dir))
    );
  }

  /**
   * Check if template files exist
   */
  private checkTemplates(): boolean {
    const templatePath = path.join(this.basePath, '.flcm-core', 'templates');
    if (!fs.existsSync(templatePath)) {
      return false;
    }
    
    const files = fs.readdirSync(templatePath);
    return files.length > 0;
  }

  /**
   * Load recent operations from history
   */
  private loadRecentOperations(): Array<any> {
    const historyPath = path.join(this.basePath, '.flcm-core', 'data', 'command-history.json');
    
    if (!fs.existsSync(historyPath)) {
      return [];
    }

    try {
      const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      return history.slice(-5); // Last 5 operations
    } catch (error) {
      return [];
    }
  }

  /**
   * Display status in human-readable format
   */
  private displayStatus(status: SystemStatus, verbose: boolean): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 FLCM System Status');
    console.log('='.repeat(50));

    // System Info
    console.log('\n🖥️  System Information:');
    console.log(`  • Initialized: ${status.initialized ? '✅ Yes' : '❌ No'}`);
    console.log(`  • Version: ${status.version}`);
    console.log(`  • Mode: ${status.mode}`);

    // Health Status
    console.log('\n💚 Health Status:');
    const healthIcon = status.health.overall === 'healthy' ? '✅' : 
                       status.health.overall === 'degraded' ? '⚠️' : '❌';
    console.log(`  • Overall: ${healthIcon} ${status.health.overall.toUpperCase()}`);
    
    if (verbose) {
      console.log(`  • Directories: ${status.health.directories ? '✅' : '❌'}`);
      console.log(`  • Configuration: ${status.health.configuration ? '✅' : '❌'}`);
      console.log(`  • Templates: ${status.health.templates ? '✅' : '❌'}`);
    }

    // Configuration
    console.log('\n⚙️  Configuration:');
    console.log(`  • Config Valid: ${status.configuration.valid ? '✅' : '❌'}`);
    console.log(`  • User Config: ${status.configuration.userConfigExists ? '✅ Present' : '➖ Not configured'}`);
    
    if (verbose) {
      console.log(`  • Config Path: ${status.configuration.path}`);
    }

    // Agents
    console.log('\n🤖 Agents:');
    Object.entries(status.agents).forEach(([name, agent]) => {
      const icon = agent.enabled ? '✅' : '🔴';
      const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      console.log(`  • ${capitalizedName}: ${icon} ${agent.status}`);
    });

    // Workflows
    console.log('\n🔄 Workflows:');
    Object.entries(status.workflows).forEach(([name, workflow]) => {
      const icon = workflow.enabled ? '✅' : '🔴';
      const displayName = name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      console.log(`  • ${displayName}: ${icon} ${workflow.enabled ? 'Enabled' : 'Disabled'}`);
      
      if (verbose && workflow.lastRun) {
        console.log(`    Last run: ${workflow.lastRun}`);
      }
    });

    // Recent Operations
    if (status.recentOperations.length > 0) {
      console.log('\n📜 Recent Operations:');
      status.recentOperations.forEach(op => {
        const statusIcon = op.status === 'success' ? '✅' : '❌';
        console.log(`  ${statusIcon} ${op.command} - ${op.timestamp}`);
      });
    }

    // Next Steps
    if (!status.initialized) {
      console.log('\n💡 Next Steps:');
      console.log('  1. Run /flcm:init to initialize the system');
    } else if (status.health.overall !== 'healthy') {
      console.log('\n💡 Recommendations:');
      if (!status.health.configuration) {
        console.log('  • Check configuration file for errors');
      }
      if (!status.health.directories) {
        console.log('  • Run /flcm:init --force to repair directory structure');
      }
      if (!status.health.templates) {
        console.log('  • Create or restore template files');
      }
    } else {
      console.log('\n✨ System is ready for use!');
      console.log('  • Run /flcm:quick <source> to generate content');
      console.log('  • Run /flcm:help for available commands');
    }

    console.log('\n' + '='.repeat(50));
  }
}

// Export for command router
export default async function status(options: StatusOptions = {}): Promise<void> {
  const command = new StatusCommand();
  await command.execute(options);
}