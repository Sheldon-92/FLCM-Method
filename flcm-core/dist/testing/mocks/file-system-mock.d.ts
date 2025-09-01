/**
 * File System Mock for Testing
 * Provides comprehensive mocking capabilities for file system operations
 */
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'events';
export interface MockFileSystemConfig {
    caseSensitive?: boolean;
    maxFileSize?: number;
    enablePermissionSimulation?: boolean;
    enableLatencySimulation?: boolean;
    averageLatency?: number;
    errorRate?: number;
}
export interface MockFileEntry {
    type: 'file' | 'directory';
    content?: string | Buffer;
    size?: number;
    mode?: number;
    uid?: number;
    gid?: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
    children?: Map<string, MockFileEntry>;
}
export interface MockStats {
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
}
/**
 * File System Mock Class
 */
export declare class FileSystemMock extends EventEmitter {
    private fileSystem;
    private config;
    private operationHistory;
    constructor(config?: Partial<MockFileSystemConfig>);
    /**
     * Mock fs.readFileSync
     */
    readFileSync(filePath: string, options?: {
        encoding?: BufferEncoding | null;
        flag?: string;
    }): string | Buffer;
    /**
     * Mock fs.writeFileSync
     */
    writeFileSync(filePath: string, data: string | Buffer, options?: {
        encoding?: BufferEncoding | null;
        mode?: number;
        flag?: string;
    }): void;
    /**
     * Mock fs.existsSync
     */
    existsSync(filePath: string): boolean;
    /**
     * Mock fs.mkdirSync
     */
    mkdirSync(dirPath: string, options?: {
        recursive?: boolean;
        mode?: number;
    }): void;
    /**
     * Mock fs.readdirSync
     */
    readdirSync(dirPath: string, options?: {
        withFileTypes?: boolean;
    }): string[] | any[];
    /**
     * Mock fs.statSync
     */
    statSync(filePath: string): MockStats;
    /**
     * Mock fs.unlinkSync
     */
    unlinkSync(filePath: string): void;
    /**
     * Mock fs.rmdirSync
     */
    rmdirSync(dirPath: string, options?: {
        recursive?: boolean;
    }): void;
    /**
     * Setup initial file system structure
     */
    setupFiles(files: Record<string, string | Buffer>): void;
    /**
     * Get file system state for debugging
     */
    getFileSystemState(): Record<string, any>;
    /**
     * Get operation history
     */
    getOperationHistory(): typeof this.operationHistory;
    /**
     * Clear operation history
     */
    clearHistory(): void;
    /**
     * Reset file system to initial state
     */
    reset(): void;
    /**
     * Simulate file system error
     */
    simulateError(errorRate?: number): void;
    private initializeFileSystem;
    private normalizePath;
    private ensureDirectoryExists;
    private createDirectory;
    private shouldSimulateError;
    private recordOperation;
}
/**
 * Get or create global file system mock
 */
export declare function getFileSystemMock(config?: Partial<MockFileSystemConfig>): FileSystemMock;
/**
 * Reset global file system mock
 */
export declare function resetFileSystemMock(): void;
/**
 * Jest setup helper for mocking fs module
 */
export declare function setupFileSystemMockForJest(mock: FileSystemMock): void;
/**
 * Mock factory for common test scenarios
 */
export declare class FileSystemMockFactory {
    /**
     * Create mock with typical FLCM file structure
     */
    static createFLCMStructure(): FileSystemMock;
    /**
     * Create mock that simulates permission errors
     */
    static createPermissionErrorMock(): FileSystemMock;
    /**
     * Create mock with high latency
     */
    static createHighLatencyMock(): FileSystemMock;
}
