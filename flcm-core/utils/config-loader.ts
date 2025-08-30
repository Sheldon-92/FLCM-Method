/**
 * Configuration Loader for FLCM System (TypeScript version)
 * Handles loading, validation, and merging of configuration files
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface AgentConfig {
    enabled: boolean;
    timeout?: number;
    methodologies?: string[];
}

interface WorkflowConfig {
    enabled: boolean;
    max_duration?: number;
    agents?: string[];
}

interface FLCMConfig {
    system: {
        name: string;
        version: string;
        mode: 'development' | 'production';
    };
    agents: {
        collector?: AgentConfig;
        scholar?: AgentConfig;
        creator?: AgentConfig;
        adapter?: AgentConfig;
    };
    workflows: {
        quick_mode?: WorkflowConfig;
        standard_mode?: WorkflowConfig;
    };
    document_pipeline?: {
        format: string;
        frontmatter: boolean;
        obsidian_compatible: boolean;
        auto_save: boolean;
    };
    methodologies?: {
        transparency: boolean;
        logging: boolean;
        user_visibility: 'full' | 'summary' | 'minimal';
    };
    user_preferences?: any;
    validation?: {
        auto_validate: boolean;
        strict_mode: boolean;
        quality_threshold: number;
    };
    paths?: {
        templates: string;
        methodologies: string;
        tasks: string;
        output: string;
        logs: string;
    };
    debug?: {
        enabled: boolean;
        verbose: boolean;
        log_level: 'debug' | 'info' | 'warning' | 'error';
    };
}

class ConfigLoader {
    private basePath: string;
    private coreConfigPath: string;
    private userConfigPath: string;
    private config: FLCMConfig | null = null;
    private watchers: Map<string, fs.FSWatcher> = new Map();

    constructor() {
        this.basePath = path.join(process.cwd(), '.flcm-core');
        this.coreConfigPath = path.join(this.basePath, 'core-config.yaml');
        this.userConfigPath = path.join(this.basePath, 'data', 'user-config.yaml');
    }

    /**
     * Load and merge configuration files
     */
    public load(): FLCMConfig {
        try {
            // Load core configuration
            const coreConfig = this.loadYamlFile(this.coreConfigPath);
            
            // Load user configuration if exists
            let userConfig = {};
            if (fs.existsSync(this.userConfigPath)) {
                userConfig = this.loadYamlFile(this.userConfigPath);
            }
            
            // Merge configurations (user overrides core)
            this.config = this.mergeConfigs(coreConfig, userConfig) as FLCMConfig;
            
            // Validate merged configuration
            this.validateConfig(this.config);
            
            return this.config;
        } catch (error: any) {
            console.error('Configuration loading failed:', error.message);
            throw error;
        }
    }

    /**
     * Load YAML file and parse it
     */
    private loadYamlFile(filePath: string): any {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return yaml.load(fileContent);
        } catch (error: any) {
            throw new Error(`Failed to load ${filePath}: ${error.message}`);
        }
    }

    /**
     * Merge two configuration objects (deep merge)
     */
    private mergeConfigs(base: any, override: any): any {
        const merged = { ...base };
        
        for (const key in override) {
            if (override.hasOwnProperty(key)) {
                if (typeof override[key] === 'object' && 
                    override[key] !== null && 
                    !Array.isArray(override[key])) {
                    merged[key] = this.mergeConfigs(base[key] || {}, override[key]);
                } else {
                    merged[key] = override[key];
                }
            }
        }
        
        return merged;
    }

    /**
     * Validate configuration against schema
     */
    private validateConfig(config: FLCMConfig): void {
        // Check required fields
        if (!config.system || !config.system.version) {
            throw new Error('Configuration must include system.version');
        }
        
        // Validate mode
        const validModes = ['development', 'production'];
        if (config.system.mode && !validModes.includes(config.system.mode)) {
            throw new Error(`Invalid mode: ${config.system.mode}`);
        }
        
        // Validate agents
        if (config.agents) {
            const validAgents = ['collector', 'scholar', 'creator', 'adapter'];
            for (const agent in config.agents) {
                if (!validAgents.includes(agent)) {
                    throw new Error(`Invalid agent: ${agent}`);
                }
            }
        }
        
        // Validate workflows
        if (config.workflows) {
            const validWorkflows = ['quick_mode', 'standard_mode'];
            for (const workflow in config.workflows) {
                if (!validWorkflows.includes(workflow)) {
                    throw new Error(`Invalid workflow: ${workflow}`);
                }
            }
        }
        
        // Validate file paths
        if (config.paths) {
            for (const [key, value] of Object.entries(config.paths)) {
                if (typeof value !== 'string') {
                    throw new Error(`Path ${key} must be a string`);
                }
            }
        }
        
        // Validate debug settings
        if (config.debug) {
            const validLogLevels = ['debug', 'info', 'warning', 'error'];
            if (config.debug.log_level && !validLogLevels.includes(config.debug.log_level)) {
                throw new Error(`Invalid log level: ${config.debug.log_level}`);
            }
        }
    }

    /**
     * Enable hot-reload for configuration files
     */
    public enableHotReload(callback?: (newConfig: FLCMConfig, oldConfig: FLCMConfig) => void): void {
        // Watch core config
        this.watchFile(this.coreConfigPath, callback);
        
        // Watch user config if it exists
        if (fs.existsSync(this.userConfigPath)) {
            this.watchFile(this.userConfigPath, callback);
        }
    }

    /**
     * Watch a file for changes
     */
    private watchFile(filePath: string, callback?: (newConfig: FLCMConfig, oldConfig: FLCMConfig) => void): void {
        if (this.watchers.has(filePath)) {
            return; // Already watching
        }

        const watcher = fs.watch(filePath, (eventType) => {
            if (eventType === 'change') {
                console.log(`Configuration file changed: ${filePath}`);
                try {
                    const oldConfig = this.config;
                    this.load();
                    console.log('Configuration reloaded successfully');
                    if (callback && oldConfig) {
                        callback(this.config!, oldConfig);
                    }
                } catch (error: any) {
                    console.error('Failed to reload configuration:', error.message);
                    console.log('Keeping previous valid configuration');
                }
            }
        });

        this.watchers.set(filePath, watcher);
    }

    /**
     * Disable hot-reload
     */
    public disableHotReload(): void {
        for (const [path, watcher] of this.watchers) {
            watcher.close();
        }
        this.watchers.clear();
    }

    /**
     * Get a configuration value by path
     */
    public get(path: string, defaultValue: any = null): any {
        if (!this.config) {
            this.load();
        }
        
        const keys = path.split('.');
        let value: any = this.config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }

    /**
     * Check if a feature is enabled
     */
    public isEnabled(feature: string): boolean {
        return this.get(feature + '.enabled', false) === true;
    }

    /**
     * Get the current configuration
     */
    public getConfig(): FLCMConfig | null {
        if (!this.config) {
            this.load();
        }
        return this.config;
    }

    /**
     * Save user configuration
     */
    public saveUserConfig(userConfig: any): void {
        try {
            const yamlStr = yaml.dump(userConfig);
            fs.writeFileSync(this.userConfigPath, yamlStr, 'utf8');
            console.log('User configuration saved successfully');
            // Reload to apply changes
            this.load();
        } catch (error: any) {
            throw new Error(`Failed to save user configuration: ${error.message}`);
        }
    }
}

// Export singleton instance
export default new ConfigLoader();