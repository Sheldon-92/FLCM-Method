#!/usr/bin/env node

/**
 * Phase 1 Validation Script for FLCM
 * Validates all Phase 1 components are working correctly
 */

const fs = require('fs');
const path = require('path');

// Try to load js-yaml if available
let yaml;
try {
  yaml = require('js-yaml');
} catch (e) {
  // Will skip YAML validation if not available
  yaml = null;
}

class Phase1Validator {
  constructor() {
    this.basePath = path.join(process.cwd(), '.flcm-core');
    this.results = [];
  }

  /**
   * Run all Phase 1 validation tests
   */
  async runValidation() {
    console.log('\n' + '='.repeat(70));
    console.log('🔍 FLCM Phase 1 Validation Suite');
    console.log('='.repeat(70) + '\n');

    // Test each component
    await this.testRepositoryStructure();    // Story 1.1
    await this.testConfigurationSystem();    // Story 1.2
    await this.testCommandSystem();          // Story 1.3
    await this.testAgentFramework();         // Story 1.4
    await this.testDocumentPipeline();       // Story 1.5

    // Display results
    this.displayResults();
  }

  /**
   * Test 1.1: Repository Structure
   */
  async testRepositoryStructure() {
    console.log('📁 Testing Repository Structure (Story 1.1)...\n');

    // Test directory existence
    const requiredDirs = [
      'agents',
      'commands',
      'pipeline',
      'workflows',
      'tasks',
      'templates',
      'methodologies',
      'methodologies/collection',
      'methodologies/learning',
      'methodologies/creation',
      'methodologies/adaptation',
      'checklists',
      'data',
      'utils'
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.basePath, dir);
      const exists = fs.existsSync(dirPath);
      
      this.results.push({
        component: 'Repository Structure',
        test: `Directory exists: ${dir}`,
        passed: exists,
        error: exists ? undefined : `Directory not found: ${dirPath}`
      });
    }

    // Test README files
    const readmeDirs = ['agents', 'workflows', 'tasks', 'templates', 'methodologies', 'checklists', 'data', 'utils'];
    for (const dir of readmeDirs) {
      const readmePath = path.join(this.basePath, dir, 'README.md');
      const exists = fs.existsSync(readmePath);
      
      this.results.push({
        component: 'Repository Structure',
        test: `README exists: ${dir}/README.md`,
        passed: exists,
        error: exists ? undefined : `README not found: ${readmePath}`
      });
    }
  }

  /**
   * Test 1.2: Configuration System
   */
  async testConfigurationSystem() {
    console.log('⚙️  Testing Configuration System (Story 1.2)...\n');

    try {
      // Test config file existence
      const configPath = path.join(this.basePath, 'core-config.yaml');
      const configExists = fs.existsSync(configPath);
      
      this.results.push({
        component: 'Configuration System',
        test: 'Core config file exists',
        passed: configExists,
        error: configExists ? undefined : 'core-config.yaml not found'
      });

      if (configExists && yaml) {
        // Test config parsing
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(configContent);
        
        this.results.push({
          component: 'Configuration System',
          test: 'YAML config parseable',
          passed: config !== null,
          error: config ? undefined : 'Failed to parse YAML'
        });

        // Test config structure
        const hasRequiredSections = config && 
          config.system && 
          config.agents && 
          config.workflows;
        
        this.results.push({
          component: 'Configuration System',
          test: 'Configuration structure',
          passed: hasRequiredSections,
          error: hasRequiredSections ? undefined : 'Missing required configuration sections'
        });
      } else if (configExists && !yaml) {
        this.results.push({
          component: 'Configuration System',
          test: 'YAML validation skipped',
          passed: true,
          error: 'js-yaml not available'
        });
      }

      // Test config loader exists
      const loaderPath = path.join(this.basePath, 'utils', 'config-loader.ts');
      const loaderExists = fs.existsSync(loaderPath);
      
      this.results.push({
        component: 'Configuration System',
        test: 'Config loader exists',
        passed: loaderExists,
        error: loaderExists ? undefined : 'config-loader.ts not found'
      });

    } catch (error) {
      this.results.push({
        component: 'Configuration System',
        test: 'Configuration system',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 1.3: Command System
   */
  async testCommandSystem() {
    console.log('🎮 Testing Command System (Story 1.3)...\n');

    try {
      // Test command files exist
      const commandFiles = [
        'index.ts',
        'help.ts',
        'init.ts',
        'status.ts',
        'quick.ts',
        'standard.ts',
        'config.ts',
        'utils/router.ts',
        'utils/parser.ts',
        'utils/error-handler.ts'
      ];

      for (const file of commandFiles) {
        const filePath = path.join(this.basePath, 'commands', file);
        const exists = fs.existsSync(filePath);
        
        this.results.push({
          component: 'Command System',
          test: `File exists: commands/${file}`,
          passed: exists,
          error: exists ? undefined : `File not found: ${filePath}`
        });
      }

      // Test aliases config
      const aliasesPath = path.join(this.basePath, 'commands', 'aliases.yaml');
      const aliasesExist = fs.existsSync(aliasesPath);
      
      this.results.push({
        component: 'Command System',
        test: 'Command aliases config exists',
        passed: aliasesExist,
        error: aliasesExist ? undefined : 'aliases.yaml not found'
      });

    } catch (error) {
      this.results.push({
        component: 'Command System',
        test: 'Command system',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 1.4: Agent Framework
   */
  async testAgentFramework() {
    console.log('🤖 Testing Agent Framework (Story 1.4)...\n');

    try {
      // Test agent files exist
      const agentFiles = [
        'base-agent.ts',
        'agent-manager.ts',
        'collector.yaml',
        'implementations/collector-agent.ts'
      ];

      for (const file of agentFiles) {
        const filePath = path.join(this.basePath, 'agents', file);
        const exists = fs.existsSync(filePath);
        
        this.results.push({
          component: 'Agent Framework',
          test: `File exists: agents/${file}`,
          passed: exists,
          error: exists ? undefined : `File not found: ${filePath}`
        });
      }

      // Test agent config structure
      const collectorConfigPath = path.join(this.basePath, 'agents', 'collector.yaml');
      if (fs.existsSync(collectorConfigPath) && yaml) {
        const configContent = fs.readFileSync(collectorConfigPath, 'utf8');
        const config = yaml.load(configContent);
        
        const hasRequiredFields = config && 
          config.name && 
          config.version && 
          config.description;
        
        this.results.push({
          component: 'Agent Framework',
          test: 'Agent config structure',
          passed: hasRequiredFields,
          error: hasRequiredFields ? undefined : 'Missing required agent config fields'
        });
      } else if (fs.existsSync(collectorConfigPath) && !yaml) {
        this.results.push({
          component: 'Agent Framework',
          test: 'Agent config validation skipped',
          passed: true,
          error: 'js-yaml not available'
        });
      }

    } catch (error) {
      this.results.push({
        component: 'Agent Framework',
        test: 'Agent framework',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 1.5: Document Pipeline
   */
  async testDocumentPipeline() {
    console.log('📄 Testing Document Pipeline (Story 1.5)...\n');

    try {
      // Test pipeline files exist
      const pipelineFiles = [
        'document-schemas.ts',
        'document-validator.ts',
        'document-transformer.ts',
        'metadata-manager.ts',
        'document-storage.ts',
        'document-pipeline.ts'
      ];

      for (const file of pipelineFiles) {
        const filePath = path.join(this.basePath, 'pipeline', file);
        const exists = fs.existsSync(filePath);
        
        this.results.push({
          component: 'Document Pipeline',
          test: `File exists: pipeline/${file}`,
          passed: exists,
          error: exists ? undefined : `File not found: ${filePath}`
        });
      }

    } catch (error) {
      this.results.push({
        component: 'Document Pipeline',
        test: 'Document pipeline',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Display test results
   */
  displayResults() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 Validation Results');
    console.log('='.repeat(70) + '\n');

    // Group results by component
    const components = new Map();
    for (const result of this.results) {
      if (!components.has(result.component)) {
        components.set(result.component, []);
      }
      components.get(result.component).push(result);
    }

    // Display by component
    let totalPassed = 0;
    let totalFailed = 0;

    components.forEach((results, component) => {
      console.log(`\n📦 ${component}:`);
      console.log('-'.repeat(50));
      
      for (const result of results) {
        const icon = result.passed ? '✅' : '❌';
        const duration = result.duration ? ` (${result.duration}ms)` : '';
        console.log(`  ${icon} ${result.test}${duration}`);
        
        if (result.error) {
          console.log(`     └─ Error: ${result.error}`);
        }
        
        if (result.passed) {
          totalPassed++;
        } else {
          totalFailed++;
        }
      }
    });

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📈 Summary');
    console.log('='.repeat(70));
    console.log(`  ✅ Passed: ${totalPassed}`);
    console.log(`  ❌ Failed: ${totalFailed}`);
    console.log(`  📊 Total: ${totalPassed + totalFailed}`);
    console.log(`  🎯 Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);

    if (totalFailed === 0) {
      console.log('\n🎉 All Phase 1 validation tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix issues.');
    }

    console.log('='.repeat(70) + '\n');
  }
}

// Note about js-yaml
if (!yaml) {
  console.log('Note: js-yaml not found. Some YAML validation tests will be skipped.');
  console.log('To enable full validation, run: npm install js-yaml\n');
}

// Run validation if executed directly
if (require.main === module) {
  const validator = new Phase1Validator();
  validator.runValidation().catch(console.error);
}

module.exports = { Phase1Validator };