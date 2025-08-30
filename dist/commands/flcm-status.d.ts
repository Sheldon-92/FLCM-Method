/**
 * FLCM Status Command
 * Display current system status and health information
 */
export interface StatusOptions {
    verbose?: boolean;
    json?: boolean;
}
export declare class StatusCommand {
    private basePath;
    constructor();
    /**
     * Execute the status command
     */
    execute(options?: StatusOptions): Promise<void>;
    /**
     * Collect system status information
     */
    private collectStatus;
    /**
     * Check if required directories exist
     */
    private checkDirectories;
    /**
     * Check if template files exist
     */
    private checkTemplates;
    /**
     * Load recent operations from history
     */
    private loadRecentOperations;
    /**
     * Display status in human-readable format
     */
    private displayStatus;
}
export default function status(options?: StatusOptions): Promise<void>;
//# sourceMappingURL=flcm-status.d.ts.map