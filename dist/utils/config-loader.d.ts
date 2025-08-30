/**
 * Configuration Loader for FLCM System (TypeScript version)
 * Handles loading, validation, and merging of configuration files
 */
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
declare class ConfigLoader {
    private basePath;
    private coreConfigPath;
    private userConfigPath;
    private config;
    private watchers;
    constructor();
    /**
     * Load and merge configuration files
     */
    load(): FLCMConfig;
    /**
     * Load YAML file and parse it
     */
    private loadYamlFile;
    /**
     * Merge two configuration objects (deep merge)
     */
    private mergeConfigs;
    /**
     * Validate configuration against schema
     */
    private validateConfig;
    /**
     * Enable hot-reload for configuration files
     */
    enableHotReload(callback?: (newConfig: FLCMConfig, oldConfig: FLCMConfig) => void): void;
    /**
     * Watch a file for changes
     */
    private watchFile;
    /**
     * Disable hot-reload
     */
    disableHotReload(): void;
    /**
     * Get a configuration value by path
     */
    get(path: string, defaultValue?: any): any;
    /**
     * Check if a feature is enabled
     */
    isEnabled(feature: string): boolean;
    /**
     * Get the current configuration
     */
    getConfig(): FLCMConfig | null;
    /**
     * Save user configuration
     */
    saveUserConfig(userConfig: any): void;
}
declare const _default: ConfigLoader;
export default _default;
//# sourceMappingURL=config-loader.d.ts.map