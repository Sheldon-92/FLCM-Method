/**
 * FLCM Command System Types
 * Core type definitions for the FLCM command system
 */
export interface CommandContext {
    command: string;
    args: string[];
    options: Record<string, any>;
    user?: any;
}
export interface CommandResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
    processingTime?: number;
}
export interface CommandHandler {
    execute(context: CommandContext): Promise<CommandResult>;
}
export interface CommandDefinition {
    name: string;
    description: string;
    usage: string;
    parameters: CommandParameter[];
    handler: CommandHandler;
}
export interface CommandParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    required: boolean;
    description: string;
    default?: any;
    choices?: string[];
}
export interface ProgressCallback {
    (step: string, progress: number, message?: string): void;
}
export declare class FLCMCommandError extends Error {
    code: string;
    suggestions?: string[] | undefined;
    examples?: string[] | undefined;
    constructor(code: string, message: string, suggestions?: string[] | undefined, examples?: string[] | undefined);
}
