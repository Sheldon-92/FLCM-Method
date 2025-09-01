/**
 * FLCM 2.0 Health Check System
 * Provides comprehensive health monitoring and system diagnostics
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message: string;
      metrics?: any;
      duration?: number;
    };
  };
  system: SystemInfo;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    score: number;
  };
}

interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  uptime: number;
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  cpu: {
    cores: number;
    model: string;
    load: number[];
  };
  disk: {
    available: number;
    used: number;
    total: number;
    percentage: number;
  };
}

export class HealthChecker {
  private readonly configPath: string;
  private readonly requiredDirectories: string[];
  private readonly requiredFiles: string[];

  constructor() {
    this.configPath = path.join(__dirname, '..', 'core-config.yaml');
    this.requiredDirectories = [
      'agents',
      'methodologies',
      'pipeline',
      'shared',
      'templates',
      'dist'
    ];
    this.requiredFiles = [
      'core-config.yaml',
      'package.json',
      'index.ts'
    ];
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const checks: { [key: string]: any } = {};

    console.log('🏥 Starting FLCM 2.0 Health Check...');

    // Run all health checks in parallel where possible
    const checkPromises = [
      this.checkFileSystem(),
      this.checkConfiguration(),
      this.checkDependencies(),
      this.checkAgents(),
      this.checkMethodologies(),
      this.checkPipeline(),
      this.checkDiskSpace(),
      this.checkMemoryUsage(),
      this.checkProcesses()
    ];

    const checkResults = await Promise.allSettled(checkPromises);
    const checkNames = [
      'filesystem',
      'configuration',
      'dependencies',
      'agents',
      'methodologies',
      'pipeline',
      'diskSpace',
      'memory',
      'processes'
    ];

    checkResults.forEach((result, index) => {
      const checkName = checkNames[index];
      if (result.status === 'fulfilled') {
        checks[checkName] = result.value;
      } else {
        checks[checkName] = {
          status: 'fail',
          message: `Health check failed: ${result.reason}`,
          duration: Date.now() - startTime
        };
      }
    });

    // Calculate summary
    const total = Object.keys(checks).length;
    const passed = Object.values(checks).filter((c: any) => c.status === 'pass').length;
    const failed = Object.values(checks).filter((c: any) => c.status === 'fail').length;
    const warnings = Object.values(checks).filter((c: any) => c.status === 'warn').length;
    const score = Math.round((passed / total) * 100);

    // Determine overall status
    let overallStatus: 'healthy' | 'warning' | 'critical';
    if (failed > 0) {
      overallStatus = 'critical';
    } else if (warnings > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'healthy';
    }

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      system: await this.getSystemInfo(),
      summary: {
        total,
        passed,
        failed,
        warnings,
        score
      }
    };

    this.printHealthReport(result);
    return result;
  }

  /**
   * Check file system structure
   */
  private async checkFileSystem(): Promise<any> {
    const startTime = Date.now();
    const issues: string[] = [];

    // Check required directories
    for (const dir of this.requiredDirectories) {
      const dirPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(dirPath)) {
        issues.push(`Missing directory: ${dir}`);
      }
    }

    // Check required files
    for (const file of this.requiredFiles) {
      const filePath = path.join(__dirname, '..', file);
      if (!fs.existsSync(filePath)) {
        issues.push(`Missing file: ${file}`);
      }
    }

    return {
      status: issues.length === 0 ? 'pass' : 'fail',
      message: issues.length === 0 ? 'All required files and directories present' : issues.join(', '),
      duration: Date.now() - startTime
    };
  }

  /**
   * Check configuration validity
   */
  private async checkConfiguration(): Promise<any> {
    const startTime = Date.now();

    try {
      if (!fs.existsSync(this.configPath)) {
        return {
          status: 'fail',
          message: 'Configuration file not found',
          duration: Date.now() - startTime
        };
      }

      const configContent = fs.readFileSync(this.configPath, 'utf8');
      
      // Basic YAML validation
      if (!configContent.includes('agents:') || !configContent.includes('methodologies:')) {
        return {
          status: 'warn',
          message: 'Configuration may be incomplete',
          duration: Date.now() - startTime
        };
      }

      return {
        status: 'pass',
        message: 'Configuration file is valid',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Configuration error: ${error}`,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Check dependencies
   */
  private async checkDependencies(): Promise<any> {
    const startTime = Date.now();

    try {
      const packagePath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
      const nodeModulesExists = fs.existsSync(nodeModulesPath);

      if (!nodeModulesExists) {
        return {
          status: 'fail',
          message: 'Dependencies not installed (node_modules missing)',
          duration: Date.now() - startTime
        };
      }

      return {
        status: 'pass',
        message: 'Dependencies are installed',
        metrics: {
          dependencies: Object.keys(packageJson.dependencies || {}).length,
          devDependencies: Object.keys(packageJson.devDependencies || {}).length
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Dependency check failed: ${error}`,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Check agent availability
   */
  private async checkAgents(): Promise<any> {
    const startTime = Date.now();
    const agentsPath = path.join(__dirname, '..', 'agents');
    const requiredAgents = ['scholar', 'creator', 'publisher'];
    const issues: string[] = [];

    for (const agent of requiredAgents) {
      const agentPath = path.join(agentsPath, agent);
      if (!fs.existsSync(agentPath)) {
        issues.push(`Missing agent: ${agent}`);
      }
    }

    return {
      status: issues.length === 0 ? 'pass' : 'warn',
      message: issues.length === 0 ? 'All agents available' : issues.join(', '),
      metrics: {
        available: requiredAgents.length - issues.length,
        total: requiredAgents.length
      },
      duration: Date.now() - startTime
    };
  }

  /**
   * Check methodologies
   */
  private async checkMethodologies(): Promise<any> {
    const startTime = Date.now();
    const methodsPath = path.join(__dirname, '..', 'methodologies');

    try {
      if (!fs.existsSync(methodsPath)) {
        return {
          status: 'fail',
          message: 'Methodologies directory missing',
          duration: Date.now() - startTime
        };
      }

      const methods = fs.readdirSync(methodsPath).filter(f => 
        fs.statSync(path.join(methodsPath, f)).isDirectory()
      );

      return {
        status: methods.length > 0 ? 'pass' : 'warn',
        message: `${methods.length} methodologies available`,
        metrics: {
          count: methods.length,
          methods: methods
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Methodology check failed: ${error}`,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Check pipeline components
   */
  private async checkPipeline(): Promise<any> {
    const startTime = Date.now();
    const pipelinePath = path.join(__dirname, '..', 'pipeline');

    try {
      if (!fs.existsSync(pipelinePath)) {
        return {
          status: 'fail',
          message: 'Pipeline directory missing',
          duration: Date.now() - startTime
        };
      }

      const components = fs.readdirSync(pipelinePath).filter(f => 
        f.endsWith('.ts') || f.endsWith('.js')
      );

      return {
        status: components.length > 0 ? 'pass' : 'warn',
        message: `${components.length} pipeline components found`,
        metrics: {
          count: components.length,
          components: components
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Pipeline check failed: ${error}`,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Check disk space
   */
  private async checkDiskSpace(): Promise<any> {
    const startTime = Date.now();

    try {
      const stats = fs.statSync(__dirname);
      const { stdout } = await execAsync(`df -k ${__dirname}`);
      const lines = stdout.trim().split('\n');
      const data = lines[1].split(/\s+/);
      
      const total = parseInt(data[1]) * 1024; // Convert from KB to bytes
      const available = parseInt(data[3]) * 1024;
      const used = total - available;
      const percentage = Math.round((used / total) * 100);

      let status: 'pass' | 'warn' | 'fail';
      let message: string;

      if (percentage > 90) {
        status = 'fail';
        message = `Disk usage critical: ${percentage}%`;
      } else if (percentage > 80) {
        status = 'warn';
        message = `Disk usage high: ${percentage}%`;
      } else {
        status = 'pass';
        message = `Disk usage normal: ${percentage}%`;
      }

      return {
        status,
        message,
        metrics: {
          total: Math.round(total / (1024 * 1024 * 1024)), // GB
          used: Math.round(used / (1024 * 1024 * 1024)), // GB
          available: Math.round(available / (1024 * 1024 * 1024)), // GB
          percentage
        },
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'warn',
        message: `Could not check disk space: ${error}`,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemoryUsage(): Promise<any> {
    const startTime = Date.now();

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const percentage = Math.round((usedMem / totalMem) * 100);

    let status: 'pass' | 'warn' | 'fail';
    let message: string;

    if (percentage > 90) {
      status = 'fail';
      message = `Memory usage critical: ${percentage}%`;
    } else if (percentage > 80) {
      status = 'warn';
      message = `Memory usage high: ${percentage}%`;
    } else {
      status = 'pass';
      message = `Memory usage normal: ${percentage}%`;
    }

    return {
      status,
      message,
      metrics: {
        total: Math.round(totalMem / (1024 * 1024 * 1024)), // GB
        used: Math.round(usedMem / (1024 * 1024 * 1024)), // GB
        free: Math.round(freeMem / (1024 * 1024 * 1024)), // GB
        percentage
      },
      duration: Date.now() - startTime
    };
  }

  /**
   * Check running processes
   */
  private async checkProcesses(): Promise<any> {
    const startTime = Date.now();

    try {
      const processInfo = {
        pid: process.pid,
        uptime: Math.round(process.uptime()),
        version: process.version,
        memoryUsage: process.memoryUsage()
      };

      return {
        status: 'pass',
        message: 'Process information collected',
        metrics: processInfo,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'warn',
        message: `Process check failed: ${error}`,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Get system information
   */
  private async getSystemInfo(): Promise<SystemInfo> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: Math.round(os.uptime()),
      memory: {
        total: totalMem,
        free: freeMem,
        used: usedMem,
        percentage: Math.round((usedMem / totalMem) * 100)
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        load: os.loadavg()
      },
      disk: {
        available: 0, // Will be populated by disk check
        used: 0,
        total: 0,
        percentage: 0
      }
    };
  }

  /**
   * Print formatted health report
   */
  private printHealthReport(result: HealthCheckResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('🏥 FLCM 2.0 HEALTH CHECK REPORT');
    console.log('='.repeat(60));
    
    // Overall status
    const statusEmoji = result.status === 'healthy' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`\n${statusEmoji} Overall Status: ${result.status.toUpperCase()}`);
    console.log(`📊 Health Score: ${result.summary.score}%`);
    console.log(`⏱️  Timestamp: ${result.timestamp}`);
    
    // Summary
    console.log('\n📋 Summary:');
    console.log(`   Total Checks: ${result.summary.total}`);
    console.log(`   ✅ Passed: ${result.summary.passed}`);
    console.log(`   ⚠️  Warnings: ${result.summary.warnings}`);
    console.log(`   ❌ Failed: ${result.summary.failed}`);

    // System Info
    console.log('\n🖥️  System Information:');
    console.log(`   Platform: ${result.system.platform} (${result.system.arch})`);
    console.log(`   Node.js: ${result.system.nodeVersion}`);
    console.log(`   CPU: ${result.system.cpu.cores} cores - ${result.system.cpu.model}`);
    console.log(`   Memory: ${result.system.memory.percentage}% used (${Math.round(result.system.memory.used / (1024**3))}GB / ${Math.round(result.system.memory.total / (1024**3))}GB)`);
    console.log(`   Uptime: ${Math.round(result.system.uptime / 3600)}h ${Math.round((result.system.uptime % 3600) / 60)}m`);

    // Individual checks
    console.log('\n🔍 Individual Checks:');
    Object.entries(result.checks).forEach(([name, check]: [string, any]) => {
      const emoji = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
      const duration = check.duration ? ` (${check.duration}ms)` : '';
      console.log(`   ${emoji} ${name}: ${check.message}${duration}`);
      
      if (check.metrics) {
        Object.entries(check.metrics).forEach(([key, value]) => {
          console.log(`      └─ ${key}: ${value}`);
        });
      }
    });

    console.log('\n' + '='.repeat(60));
    
    if (result.status !== 'healthy') {
      console.log('\n💡 Recommendations:');
      if (result.summary.failed > 0) {
        console.log('   • Address critical issues before using FLCM 2.0');
      }
      if (result.summary.warnings > 0) {
        console.log('   • Review warnings to optimize performance');
      }
      console.log('   • Run health check again after making changes');
      console.log('   • Check logs for detailed error information');
    } else {
      console.log('\n🎉 FLCM 2.0 is healthy and ready to use!');
    }
    
    console.log('');
  }
}

// CLI interface
if (require.main === module) {
  const healthChecker = new HealthChecker();
  
  healthChecker.runHealthCheck().then((result) => {
    process.exit(result.status === 'critical' ? 1 : 0);
  }).catch((error) => {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  });
}

export default HealthChecker;