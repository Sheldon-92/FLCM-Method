"use strict";
/**
 * FLCM Help Command
 * Display available commands and usage information
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
class HelpCommand {
    constructor() {
        this.commands = this.initializeCommands();
    }
    /**
     * Initialize command definitions
     */
    initializeCommands() {
        const commands = new Map();
        // System Commands
        commands.set('init', {
            name: '/flcm:init',
            aliases: ['/fc:init'],
            description: 'Initialize FLCM system in current directory',
            usage: '/flcm:init [--force] [--skip-config]',
            examples: [
                '/flcm:init - Initialize new FLCM project',
                '/flcm:init --force - Reinitialize existing project'
            ],
            category: 'System'
        });
        commands.set('help', {
            name: '/flcm:help',
            aliases: ['/fc:help', '/flcm:?', '/fc:?'],
            description: 'Show help information for FLCM commands',
            usage: '/flcm:help [command]',
            examples: [
                '/flcm:help - Show all commands',
                '/flcm:help quick - Show help for quick command'
            ],
            category: 'System'
        });
        commands.set('status', {
            name: '/flcm:status',
            aliases: ['/fc:status'],
            description: 'Display current FLCM system status',
            usage: '/flcm:status [--verbose]',
            examples: [
                '/flcm:status - Show basic status',
                '/flcm:status --verbose - Show detailed status'
            ],
            category: 'System'
        });
        // Workflow Commands (to be implemented)
        commands.set('quick', {
            name: '/flcm:quick',
            aliases: ['/fc:q', '/flcm:q'],
            description: 'Quick content generation (20-30 minutes)',
            usage: '/flcm:quick <source>',
            examples: [
                '/flcm:quick "https://example.com/article"',
                '/flcm:quick "My content notes here"'
            ],
            category: 'Workflow'
        });
        commands.set('standard', {
            name: '/flcm:standard',
            aliases: ['/fc:s', '/flcm:s'],
            description: 'Standard content pipeline (45-60 minutes)',
            usage: '/flcm:standard <source>',
            examples: [
                '/flcm:standard "https://example.com/article"',
                '/flcm:standard "path/to/document.md"'
            ],
            category: 'Workflow'
        });
        // Agent Commands (to be implemented)
        commands.set('collect', {
            name: '/flcm:collect',
            aliases: ['/fc:collect', '/flcm:c'],
            description: 'Run Collector agent to gather sources',
            usage: '/flcm:collect <source>',
            examples: [
                '/flcm:collect "https://example.com"',
                '/flcm:collect "local-file.md"'
            ],
            category: 'Agent'
        });
        commands.set('scholar', {
            name: '/flcm:scholar',
            aliases: ['/fc:scholar'],
            description: 'Run Scholar agent for knowledge synthesis',
            usage: '/flcm:scholar <content-brief>',
            examples: [
                '/flcm:scholar output/brief-2024-12-28.md'
            ],
            category: 'Agent'
        });
        commands.set('create', {
            name: '/flcm:create',
            aliases: ['/fc:create'],
            description: 'Run Creator agent to generate content',
            usage: '/flcm:create <knowledge-synthesis>',
            examples: [
                '/flcm:create output/synthesis-2024-12-28.md'
            ],
            category: 'Agent'
        });
        commands.set('adapt', {
            name: '/flcm:adapt',
            aliases: ['/fc:adapt'],
            description: 'Run Adapter agent for platform optimization',
            usage: '/flcm:adapt <content-draft> [--platform=<platform>]',
            examples: [
                '/flcm:adapt output/draft.md --platform=linkedin',
                '/flcm:adapt output/draft.md --platform=twitter'
            ],
            category: 'Agent'
        });
        // Configuration Commands
        commands.set('config', {
            name: '/flcm:config',
            aliases: ['/fc:config'],
            description: 'View or edit configuration',
            usage: '/flcm:config [get|set] [key] [value]',
            examples: [
                '/flcm:config - Show current config',
                '/flcm:config get user_preferences.default_mode',
                '/flcm:config set debug.verbose true'
            ],
            category: 'Configuration'
        });
        return commands;
    }
    /**
     * Execute the help command
     */
    async execute(options = {}) {
        if (options.command) {
            this.showCommandHelp(options.command);
        }
        else {
            this.showAllCommands(options.verbose || false);
        }
    }
    /**
     * Show help for a specific command
     */
    showCommandHelp(commandName) {
        const command = this.commands.get(commandName);
        if (!command) {
            console.log(`❌ Unknown command: ${commandName}`);
            console.log('💡 Run /flcm:help to see all available commands');
            return;
        }
        console.log('\n' + '='.repeat(50));
        console.log(`📘 ${command.name}`);
        console.log('='.repeat(50));
        console.log(`\n📝 Description: ${command.description}`);
        if (command.aliases.length > 0) {
            console.log(`\n🔗 Aliases: ${command.aliases.join(', ')}`);
        }
        console.log(`\n💻 Usage: ${command.usage}`);
        if (command.examples.length > 0) {
            console.log('\n📚 Examples:');
            command.examples.forEach(example => {
                console.log(`  • ${example}`);
            });
        }
    }
    /**
     * Show all available commands
     */
    showAllCommands(verbose) {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 FLCM - Friction Lab Content Maker');
        console.log('='.repeat(60));
        console.log('\n📚 Available Commands:\n');
        // Group commands by category
        const categories = new Map();
        this.commands.forEach(command => {
            if (!categories.has(command.category)) {
                categories.set(command.category, []);
            }
            categories.get(command.category).push(command);
        });
        // Display commands by category
        const categoryOrder = ['System', 'Workflow', 'Agent', 'Configuration'];
        categoryOrder.forEach(category => {
            const commands = categories.get(category);
            if (commands) {
                console.log(`\n📂 ${category} Commands:`);
                console.log('-'.repeat(40));
                commands.forEach(cmd => {
                    const aliases = cmd.aliases.length > 0 ? ` (${cmd.aliases[0]})` : '';
                    console.log(`  ${cmd.name.padEnd(20)} ${cmd.description}`);
                    if (verbose) {
                        console.log(`    Usage: ${cmd.usage}`);
                        if (cmd.examples.length > 0) {
                            console.log(`    Example: ${cmd.examples[0]}`);
                        }
                    }
                });
            }
        });
        console.log('\n' + '='.repeat(60));
        console.log('\n💡 Tips:');
        console.log('  • Use /fc as a shortcut for /flcm');
        console.log('  • Run /flcm:help <command> for detailed help');
        console.log('  • Commands support tab completion');
        if (!verbose) {
            console.log('\n📖 Run /flcm:help --verbose for detailed information');
        }
    }
}
exports.HelpCommand = HelpCommand;
// Export for command router
async function help(options = {}) {
    const command = new HelpCommand();
    await command.execute(options);
}
exports.default = help;
//# sourceMappingURL=flcm-help.js.map