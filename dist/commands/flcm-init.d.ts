/**
 * FLCM Init Command
 * Initialize FLCM system for a new project
 */
export interface InitOptions {
    force?: boolean;
    skipConfig?: boolean;
}
export declare class InitCommand {
    private basePath;
    constructor();
    /**
     * Execute the init command
     */
    execute(options?: InitOptions): Promise<void>;
    /**
     * Create the FLCM directory structure
     */
    private createDirectoryStructure;
    /**
     * Copy default configuration files
     */
    private copyConfigurationFiles;
    /**
     * Create initial template files
     */
    private createInitialTemplates;
    /**
     * Display welcome message with next steps
     */
    private displayWelcomeMessage;
}
export default function init(options?: InitOptions): Promise<void>;
//# sourceMappingURL=flcm-init.d.ts.map