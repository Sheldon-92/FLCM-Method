#!/usr/bin/env node
"use strict";
/**
 * FLCM Command Line Interface
 * Main entry point for the FLCM content creation system
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
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const ora_1 = __importDefault(require("ora"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const quick_mode_1 = require("../workflow/quick-mode");
const standard_mode_1 = require("../workflow/standard-mode");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const program = new commander_1.Command();
const VERSION = '1.0.0';
// ASCII Art Logo
const logo = `
███████╗██╗      ██████╗███╗   ███╗
██╔════╝██║     ██╔════╝████╗ ████║
█████╗  ██║     ██║     ██╔████╔██║
██╔══╝  ██║     ██║     ██║╚██╔╝██║
██║     ███████╗╚██████╗██║ ╚═╝ ██║
╚═╝     ╚══════╝ ╚═════╝╚═╝     ╚═╝
Friction Lab Content Maker v${VERSION}
`;
/**
 * Main CLI configuration
 */
program
    .name('flcm')
    .description('AI-powered content creation pipeline')
    .version(VERSION);
/**
 * Create command - Interactive content creation
 */
program
    .command('create')
    .description('Start interactive content creation')
    .option('-m, --mode <mode>', 'Workflow mode (quick/standard)', 'standard')
    .option('-p, --platforms <platforms...>', 'Target platforms')
    .option('-v, --voice <voice>', 'Voice profile (casual/professional/academic)')
    .action(async (options) => {
    console.clear();
    console.log(chalk_1.default.cyan(logo));
    // Interactive prompts
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'topic',
            message: 'What topic would you like to create content about?',
            validate: (input) => input.length > 0 || 'Please enter a topic'
        },
        {
            type: 'list',
            name: 'mode',
            message: 'Choose workflow mode:',
            choices: [
                { name: '⚡ Quick Mode (20-30 min) - Fast generation', value: 'quick' },
                { name: '🎯 Standard Mode (45-60 min) - Comprehensive', value: 'standard' }
            ],
            when: !options.mode
        },
        {
            type: 'checkbox',
            name: 'platforms',
            message: 'Select target platforms:',
            choices: [
                { name: '💼 LinkedIn', value: 'linkedin', checked: true },
                { name: '🐦 Twitter/X', value: 'twitter', checked: true },
                { name: '💬 WeChat', value: 'wechat' },
                { name: '🌸 Xiaohongshu', value: 'xiaohongshu' }
            ],
            when: !options.platforms
        },
        {
            type: 'list',
            name: 'voice',
            message: 'Select voice profile:',
            choices: [
                { name: '👔 Professional', value: 'professional' },
                { name: '😊 Casual', value: 'casual' },
                { name: '🎓 Academic', value: 'academic' },
                { name: '🔧 Technical', value: 'technical' }
            ],
            when: !options.voice
        }
    ]);
    const config = {
        topic: answers.topic,
        mode: options.mode || answers.mode,
        platforms: options.platforms || answers.platforms,
        voiceProfile: options.voice || answers.voice
    };
    await executeWorkflow(config);
});
/**
 * Quick command - Fast content generation
 */
program
    .command('quick <topic>')
    .description('Quick mode content generation (20-30 min)')
    .option('-p, --platforms <platforms...>', 'Target platforms', ['linkedin', 'twitter'])
    .action(async (topic, options) => {
    console.clear();
    console.log(chalk_1.default.cyan(logo));
    await executeWorkflow({
        topic,
        mode: 'quick',
        platforms: options.platforms,
        voiceProfile: 'professional'
    });
});
/**
 * Standard command - Comprehensive content creation
 */
program
    .command('standard <topic>')
    .description('Standard mode content creation (45-60 min)')
    .option('-p, --platforms <platforms...>', 'Target platforms')
    .option('-d, --depth <depth>', 'Analysis depth (standard/comprehensive/expert)')
    .action(async (topic, options) => {
    console.clear();
    console.log(chalk_1.default.cyan(logo));
    await executeWorkflow({
        topic,
        mode: 'standard',
        platforms: options.platforms || ['linkedin', 'twitter', 'wechat', 'xiaohongshu'],
        depth: options.depth || 'comprehensive'
    });
});
/**
 * Status command - Check workflow status
 */
program
    .command('status')
    .description('Check current workflow status')
    .action(() => {
    const statusFile = path.join(process.cwd(), '.flcm-status.json');
    if (fs.existsSync(statusFile)) {
        const status = JSON.parse(fs.readFileSync(statusFile, 'utf-8'));
        console.log(chalk_1.default.cyan('\n📊 Workflow Status\n'));
        const table = new cli_table3_1.default({
            head: ['Property', 'Value'],
            colWidths: [20, 50]
        });
        table.push(['Status', getStatusBadge(status.status)], ['Mode', status.mode], ['Progress', `${status.progress}%`], ['Current Agent', status.currentAgent || 'N/A'], ['Started', new Date(status.startTime).toLocaleString()], ['Duration', status.duration ? `${status.duration} minutes` : 'In progress']);
        console.log(table.toString());
    }
    else {
        console.log(chalk_1.default.yellow('\n⚠️  No active workflow found\n'));
    }
});
/**
 * History command - View creation history
 */
program
    .command('history')
    .description('View content creation history')
    .option('-n, --number <n>', 'Number of entries to show', '10')
    .action((options) => {
    const historyFile = path.join(process.cwd(), '.flcm-history.json');
    if (fs.existsSync(historyFile)) {
        const history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
        const entries = history.slice(-parseInt(options.number));
        console.log(chalk_1.default.cyan('\n📜 Creation History\n'));
        const table = new cli_table3_1.default({
            head: ['Date', 'Topic', 'Mode', 'Platforms', 'Quality'],
            colWidths: [20, 30, 10, 25, 10]
        });
        entries.forEach(entry => {
            table.push([
                new Date(entry.date).toLocaleDateString(),
                entry.topic.substring(0, 28) + '...',
                entry.mode,
                entry.platforms.join(', '),
                `${entry.quality}%`
            ]);
        });
        console.log(table.toString());
    }
    else {
        console.log(chalk_1.default.yellow('\n⚠️  No history found\n'));
    }
});
/**
 * Config command - Manage configuration
 */
program
    .command('config')
    .description('Manage FLCM configuration')
    .option('-s, --set <key=value>', 'Set configuration value')
    .option('-g, --get <key>', 'Get configuration value')
    .option('-l, --list', 'List all configuration')
    .action((options) => {
    const configFile = path.join(process.cwd(), '.flcm-config.json');
    let config = {};
    if (fs.existsSync(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    }
    if (options.set) {
        const [key, value] = options.set.split('=');
        config[key] = value;
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        console.log(chalk_1.default.green(`✅ Set ${key} = ${value}`));
    }
    else if (options.get) {
        console.log(config[options.get] || 'Not set');
    }
    else if (options.list) {
        console.log(chalk_1.default.cyan('\n⚙️  Configuration\n'));
        Object.entries(config).forEach(([key, value]) => {
            console.log(`  ${chalk_1.default.yellow(key)}: ${value}`);
        });
    }
});
/**
 * Export command - Export generated content
 */
program
    .command('export <id>')
    .description('Export generated content')
    .option('-f, --format <format>', 'Export format (json/md/txt)', 'md')
    .option('-o, --output <path>', 'Output file path')
    .action((id, options) => {
    const resultFile = path.join(process.cwd(), `.flcm-results/${id}.json`);
    if (fs.existsSync(resultFile)) {
        const result = JSON.parse(fs.readFileSync(resultFile, 'utf-8'));
        let output = '';
        const format = options.format.toLowerCase();
        switch (format) {
            case 'json':
                output = JSON.stringify(result, null, 2);
                break;
            case 'md':
                output = formatAsMarkdown(result);
                break;
            case 'txt':
                output = formatAsText(result);
                break;
            default:
                console.log(chalk_1.default.red(`❌ Unknown format: ${format}`));
                return;
        }
        const outputPath = options.output || `export-${id}.${format}`;
        fs.writeFileSync(outputPath, output);
        console.log(chalk_1.default.green(`✅ Exported to ${outputPath}`));
    }
    else {
        console.log(chalk_1.default.red(`❌ Result ${id} not found`));
    }
});
/**
 * Execute workflow
 */
async function executeWorkflow(config) {
    const spinner = (0, ora_1.default)('Initializing workflow...').start();
    try {
        // Save status
        const statusFile = path.join(process.cwd(), '.flcm-status.json');
        const status = {
            status: 'running',
            mode: config.mode,
            topic: config.topic,
            platforms: config.platforms,
            progress: 0,
            currentAgent: null,
            startTime: new Date()
        };
        fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
        // Create appropriate workflow
        let workflow;
        if (config.mode === 'quick') {
            workflow = new quick_mode_1.QuickModeWorkflow();
        }
        else {
            workflow = new standard_mode_1.StandardModeWorkflow();
        }
        // Setup progress tracking
        workflow.on('progress', (data) => {
            spinner.text = `${data.agent}: ${data.status}`;
            status.currentAgent = data.agent;
            status.progress = data.progress || 0;
            fs.writeFileSync(statusFile, JSON.stringify(status, null, 2));
        });
        workflow.on('quickmode:complete', (data) => {
            spinner.succeed('Workflow completed!');
            displayResults(data.result);
            saveResults(data.result, config);
        });
        workflow.on('standardmode:complete', (data) => {
            spinner.succeed('Workflow completed!');
            displayResults(data.result);
            saveResults(data.result, config);
        });
        // Execute workflow
        spinner.text = 'Starting content generation...';
        await workflow.execute({
            topic: config.topic,
            platforms: config.platforms,
            voiceProfile: config.voiceProfile,
            depth: config.depth,
            maxDuration: config.mode === 'quick' ? 30 : 60
        });
    }
    catch (error) {
        spinner.fail('Workflow failed');
        console.error(chalk_1.default.red(`\n❌ Error: ${error.message}`));
        process.exit(1);
    }
}
/**
 * Display workflow results
 */
function displayResults(result) {
    console.log(chalk_1.default.cyan('\n✨ Content Generation Complete!\n'));
    if (result.finalContent) {
        const contents = Array.isArray(result.finalContent) ?
            result.finalContent : [result.finalContent];
        contents.forEach(content => {
            console.log(chalk_1.default.yellow(`\n📱 ${content.platform}`));
            console.log(chalk_1.default.white(`Title: ${content.optimizedTitle}`));
            console.log(chalk_1.default.gray(`Length: ${content.characterCount} characters`));
            console.log(chalk_1.default.gray(`Fit Score: ${content.metadata.platformFitScore}%`));
            console.log(chalk_1.default.gray(`Est. Reach: ${content.metadata.estimatedReach}`));
            if (content.hashtags && content.hashtags.length > 0) {
                console.log(chalk_1.default.blue(`Hashtags: ${content.hashtags.slice(0, 5).join(' ')}`));
            }
        });
    }
    // Performance summary
    console.log(chalk_1.default.cyan('\n📊 Performance Summary\n'));
    const table = new cli_table3_1.default({
        head: ['Metric', 'Value'],
        colWidths: [25, 35]
    });
    table.push(['Total Duration', `${(result.state.metrics.totalDuration / 1000 / 60).toFixed(1)} minutes`], ['Quality Score', `${calculateAverageQuality(result)}%`], ['Platforms Optimized', result.finalContent?.length || 1], ['Workflow Status', chalk_1.default.green('Success')]);
    console.log(table.toString());
}
/**
 * Save results to file
 */
function saveResults(result, config) {
    const resultsDir = path.join(process.cwd(), '.flcm-results');
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir);
    }
    const resultId = Date.now().toString();
    const resultFile = path.join(resultsDir, `${resultId}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));
    // Update history
    const historyFile = path.join(process.cwd(), '.flcm-history.json');
    let history = [];
    if (fs.existsSync(historyFile)) {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
    }
    history.push({
        id: resultId,
        date: new Date(),
        topic: config.topic,
        mode: config.mode,
        platforms: config.platforms,
        quality: calculateAverageQuality(result)
    });
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    console.log(chalk_1.default.gray(`\n💾 Results saved with ID: ${resultId}`));
    console.log(chalk_1.default.gray(`   Use 'flcm export ${resultId}' to export content\n`));
}
/**
 * Calculate average quality score
 */
function calculateAverageQuality(result) {
    const scores = [];
    result.state.metrics.qualityScores.forEach((score) => {
        scores.push(score);
    });
    if (scores.length === 0)
        return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
/**
 * Get status badge
 */
function getStatusBadge(status) {
    const badges = {
        'idle': chalk_1.default.gray('⚪ Idle'),
        'running': chalk_1.default.blue('🔵 Running'),
        'paused': chalk_1.default.yellow('⏸️  Paused'),
        'completed': chalk_1.default.green('✅ Completed'),
        'failed': chalk_1.default.red('❌ Failed')
    };
    return badges[status] || status;
}
/**
 * Format result as Markdown
 */
function formatAsMarkdown(result) {
    let md = `# Content Generation Report\n\n`;
    md += `**Date**: ${new Date().toLocaleDateString()}\n\n`;
    if (result.finalContent) {
        const contents = Array.isArray(result.finalContent) ?
            result.finalContent : [result.finalContent];
        contents.forEach(content => {
            md += `## ${content.platform}\n\n`;
            md += `### ${content.optimizedTitle}\n\n`;
            md += `${content.optimizedContent}\n\n`;
            if (content.hashtags && content.hashtags.length > 0) {
                md += `**Hashtags**: ${content.hashtags.join(' ')}\n\n`;
            }
            md += `---\n\n`;
        });
    }
    return md;
}
/**
 * Format result as plain text
 */
function formatAsText(result) {
    let text = 'CONTENT GENERATION REPORT\n';
    text += '='.repeat(50) + '\n\n';
    if (result.finalContent) {
        const contents = Array.isArray(result.finalContent) ?
            result.finalContent : [result.finalContent];
        contents.forEach(content => {
            text += `PLATFORM: ${content.platform}\n`;
            text += `TITLE: ${content.optimizedTitle}\n\n`;
            text += `${content.optimizedContent}\n\n`;
            if (content.hashtags && content.hashtags.length > 0) {
                text += `HASHTAGS: ${content.hashtags.join(' ')}\n\n`;
            }
            text += '-'.repeat(50) + '\n\n';
        });
    }
    return text;
}
// Parse arguments
program.parse(process.argv);
// Show help if no arguments
if (!process.argv.slice(2).length) {
    console.log(chalk_1.default.cyan(logo));
    program.outputHelp();
}
//# sourceMappingURL=flcm-cli.js.map