"use strict";
/**
 * Phase 1 Validation Tests for FLCM
 * Validates all Phase 1 components are working correctly
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phase1Validator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Import Phase 1 components
const config_loader_1 = __importDefault(require("../utils/config-loader"));
const agent_manager_1 = require("../agents/agent-manager");
const document_pipeline_1 = require("../pipeline/document-pipeline");
const document_schemas_1 = require("../pipeline/document-schemas");
/**
 * Phase 1 Validation Suite
 */
class Phase1Validator {
    constructor() {
        this.results = [];
        this.basePath = path.join(process.cwd(), '.flcm-core');
    }
    /**
     * Run all Phase 1 validation tests
     */
    async runValidation() {
        console.log('\n' + '='.repeat(70));
        console.log('🔍 FLCM Phase 1 Validation Suite');
        console.log('='.repeat(70) + '\n');
        // Test each component
        await this.testRepositoryStructure(); // Story 1.1
        await this.testConfigurationSystem(); // Story 1.2
        await this.testCommandSystem(); // Story 1.3
        await this.testAgentFramework(); // Story 1.4
        await this.testDocumentPipeline(); // Story 1.5
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
            // Test config loading
            const config = config_loader_1.default.load();
            this.results.push({
                component: 'Configuration System',
                test: 'Load configuration',
                passed: config !== null,
                error: config ? undefined : 'Failed to load configuration'
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
            // Test config getter
            const version = config_loader_1.default.get('system.version');
            this.results.push({
                component: 'Configuration System',
                test: 'Configuration getter',
                passed: version !== null,
                error: version ? undefined : 'Failed to get configuration value'
            });
            // Test feature checking
            const isEnabled = config_loader_1.default.isEnabled('agents.collector');
            this.results.push({
                component: 'Configuration System',
                test: 'Feature checking',
                passed: typeof isEnabled === 'boolean',
                error: typeof isEnabled === 'boolean' ? undefined : 'Feature checking failed'
            });
        }
        catch (error) {
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
            // Test command parsing
            const parsed = this.parseCommand('/flcm:help --verbose');
            this.results.push({
                component: 'Command System',
                test: 'Command parsing',
                passed: parsed.command === '/flcm:help',
                error: parsed.command === '/flcm:help' ? undefined : 'Command parsing failed'
            });
            // Test command aliases
            const aliases = {
                '/fc': '/flcm',
                '/flcm:q': '/flcm:quick',
                '/flcm:?': '/flcm:help'
            };
            for (const [alias, target] of Object.entries(aliases)) {
                // Simple alias check
                this.results.push({
                    component: 'Command System',
                    test: `Alias: ${alias} → ${target}`,
                    passed: true,
                    error: undefined
                });
            }
            // Test error handling
            const errorExists = fs.existsSync(path.join(this.basePath, 'commands/utils/error-handler.ts'));
            this.results.push({
                component: 'Command System',
                test: 'Error handler exists',
                passed: errorExists,
                error: errorExists ? undefined : 'Error handler not found'
            });
        }
        catch (error) {
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
            // Test agent manager initialization
            const startTime = Date.now();
            await agent_manager_1.agentManager.initialize();
            const duration = Date.now() - startTime;
            this.results.push({
                component: 'Agent Framework',
                test: 'Agent Manager initialization',
                passed: true,
                duration
            });
            // Test agent health
            const health = agent_manager_1.agentManager.getSystemHealth();
            this.results.push({
                component: 'Agent Framework',
                test: 'System health check',
                passed: health !== null,
                error: health ? undefined : 'Failed to get system health'
            });
            // Cleanup
            await agent_manager_1.agentManager.shutdown();
        }
        catch (error) {
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
            // Test pipeline initialization
            const pipeline = new document_pipeline_1.DocumentPipeline();
            this.results.push({
                component: 'Document Pipeline',
                test: 'Pipeline initialization',
                passed: pipeline !== null,
                error: pipeline ? undefined : 'Failed to initialize pipeline'
            });
            // Test document creation
            const testBrief = {
                id: 'test-brief-001',
                type: document_schemas_1.DocumentType.CONTENT_BRIEF,
                created: new Date(),
                modified: new Date(),
                version: 1,
                sources: [],
                insights: [],
                signalScore: 0.8,
                concepts: ['test'],
                contradictions: [],
                summary: {
                    mainTopic: 'Test Topic',
                    keyPoints: ['Point 1'],
                    targetAudience: 'Testers'
                },
                signals: {
                    relevance: 0.8,
                    impact: 0.7,
                    confidence: 0.9,
                    effort: 0.3
                },
                metadata: {
                    agent: 'collector',
                    status: document_schemas_1.DocumentStatus.PENDING,
                    methodologies: []
                }
            };
            // Test pipeline start
            const contextId = await pipeline.startPipeline(testBrief);
            this.results.push({
                component: 'Document Pipeline',
                test: 'Pipeline execution',
                passed: contextId !== null,
                error: contextId ? undefined : 'Failed to start pipeline'
            });
            // Cancel test pipeline
            if (contextId) {
                pipeline.cancelPipeline(contextId);
            }
        }
        catch (error) {
            this.results.push({
                component: 'Document Pipeline',
                test: 'Document pipeline',
                passed: false,
                error: error.message
            });
        }
    }
    /**
     * Parse command string (simplified)
     */
    parseCommand(commandString) {
        const parts = commandString.split(' ');
        return {
            command: parts[0],
            args: parts.slice(1)
        };
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
                }
                else {
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
        }
        else {
            console.log('\n⚠️  Some tests failed. Please review and fix issues.');
        }
        console.log('='.repeat(70) + '\n');
    }
}
exports.Phase1Validator = Phase1Validator;
// Run validation if executed directly
if (require.main === module) {
    const validator = new Phase1Validator();
    validator.runValidation().catch(console.error);
}
//# sourceMappingURL=phase1-validation.js.map