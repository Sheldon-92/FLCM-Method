"use strict";
/**
 * FLCM Init Command
 * Initialize FLCM system for a new project
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
exports.InitCommand = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class InitCommand {
    constructor() {
        this.basePath = process.cwd();
    }
    /**
     * Execute the init command
     */
    async execute(options = {}) {
        console.log('🚀 Initializing FLCM System...\n');
        try {
            // Check if already initialized
            const flcmPath = path.join(this.basePath, '.flcm-core');
            if (fs.existsSync(flcmPath) && !options.force) {
                console.log('⚠️  FLCM is already initialized in this directory');
                console.log('💡 Use --force flag to reinitialize');
                return;
            }
            // Create directory structure
            await this.createDirectoryStructure();
            // Copy configuration files
            if (!options.skipConfig) {
                await this.copyConfigurationFiles();
            }
            // Create initial templates
            await this.createInitialTemplates();
            // Display welcome message
            this.displayWelcomeMessage();
        }
        catch (error) {
            console.error('❌ Initialization failed:', error.message);
            throw error;
        }
    }
    /**
     * Create the FLCM directory structure
     */
    async createDirectoryStructure() {
        console.log('📁 Creating directory structure...');
        const directories = [
            '.flcm-core',
            '.flcm-core/agents',
            '.flcm-core/workflows',
            '.flcm-core/tasks',
            '.flcm-core/templates',
            '.flcm-core/methodologies',
            '.flcm-core/methodologies/collection',
            '.flcm-core/methodologies/learning',
            '.flcm-core/methodologies/creation',
            '.flcm-core/methodologies/adaptation',
            '.flcm-core/checklists',
            '.flcm-core/data',
            '.flcm-core/data/voice-profiles',
            '.flcm-core/utils',
            '.flcm-core/commands',
            'output',
            'logs'
        ];
        for (const dir of directories) {
            const fullPath = path.join(this.basePath, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
                console.log(`  ✓ Created ${dir}`);
            }
        }
    }
    /**
     * Copy default configuration files
     */
    async copyConfigurationFiles() {
        console.log('\n📋 Setting up configuration...');
        // Check if core-config.yaml exists
        const configPath = path.join(this.basePath, '.flcm-core', 'core-config.yaml');
        if (!fs.existsSync(configPath)) {
            console.log('  ✓ Configuration already exists');
            return;
        }
        // Check if user-config example exists
        const userConfigExample = path.join(this.basePath, '.flcm-core', 'data', 'user-config.yaml.example');
        if (fs.existsSync(userConfigExample)) {
            console.log('  ✓ User config template available');
        }
    }
    /**
     * Create initial template files
     */
    async createInitialTemplates() {
        console.log('\n📝 Creating initial templates...');
        // Create a sample content brief template
        const briefTemplate = {
            name: 'content-brief',
            version: '1.0.0',
            sections: {
                metadata: {
                    title: '{{title}}',
                    date: '{{date}}',
                    author: '{{author}}',
                    source: '{{source}}'
                },
                signals: {
                    key_insights: [],
                    relevance_scores: {},
                    extracted_patterns: []
                },
                summary: {
                    main_topic: '',
                    key_points: [],
                    target_audience: ''
                }
            }
        };
        const templatePath = path.join(this.basePath, '.flcm-core', 'templates', 'content-brief-tmpl.yaml');
        if (!fs.existsSync(templatePath)) {
            const yaml = require('js-yaml');
            fs.writeFileSync(templatePath, yaml.dump(briefTemplate));
            console.log('  ✓ Created content-brief template');
        }
    }
    /**
     * Display welcome message with next steps
     */
    displayWelcomeMessage() {
        console.log('\n' + '='.repeat(50));
        console.log('✨ FLCM Successfully Initialized!');
        console.log('='.repeat(50));
        console.log('\n📚 Next Steps:');
        console.log('  1. Configure your preferences in .flcm-core/data/user-config.yaml');
        console.log('  2. Run /flcm:help to see available commands');
        console.log('  3. Try /flcm:quick with a URL to create your first content');
        console.log('\n🎯 Quick Start Commands:');
        console.log('  /flcm:help    - Show all available commands');
        console.log('  /flcm:status  - Check system status');
        console.log('  /flcm:quick   - Quick content generation (20-30 min)');
        console.log('  /flcm:standard - Full content pipeline (45-60 min)');
        console.log('\n💡 Tip: Use /fc as a shortcut for /flcm');
    }
}
exports.InitCommand = InitCommand;
// Export for command router
async function init(options = {}) {
    const command = new InitCommand();
    await command.execute(options);
}
exports.default = init;
//# sourceMappingURL=flcm-init.js.map