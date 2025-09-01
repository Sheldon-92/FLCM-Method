/**
 * File System Mock for Testing
 * Provides comprehensive mocking capabilities for file system operations
 */

import { EventEmitter } from 'events';
import * as path from 'path';

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
export class FileSystemMock extends EventEmitter {
  private fileSystem: Map<string, MockFileEntry> = new Map();
  private config: Required<MockFileSystemConfig>;
  private operationHistory: Array<{
    operation: string;
    path: string;
    timestamp: Date;
    success: boolean;
    error?: Error;
  }> = [];

  constructor(config: Partial<MockFileSystemConfig> = {}) {
    super();

    this.config = {
      caseSensitive: config.caseSensitive ?? true,
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      enablePermissionSimulation: config.enablePermissionSimulation ?? false,
      enableLatencySimulation: config.enableLatencySimulation ?? false,
      averageLatency: config.averageLatency || 10,
      errorRate: config.errorRate || 0
    };

    this.initializeFileSystem();
  }

  /**
   * Mock fs.readFileSync
   */
  readFileSync(filePath: string, options?: { encoding?: BufferEncoding | null; flag?: string }): string | Buffer {
    const normalizedPath = this.normalizePath(filePath);
    this.recordOperation('readFileSync', normalizedPath);

    if (this.shouldSimulateError()) {
      const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    const entry = this.fileSystem.get(normalizedPath);
    if (!entry) {
      const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    if (entry.type !== 'file') {
      const error = new Error(`EISDIR: illegal operation on a directory, read`);
      (error as any).code = 'EISDIR';
      throw error;
    }

    const encoding = options?.encoding;
    const content = entry.content || '';

    if (encoding && encoding !== 'binary') {
      return Buffer.isBuffer(content) ? content.toString(encoding) : content.toString();
    }

    return Buffer.isBuffer(content) ? content : Buffer.from(content.toString());
  }

  /**
   * Mock fs.writeFileSync
   */
  writeFileSync(filePath: string, data: string | Buffer, options?: { encoding?: BufferEncoding | null; mode?: number; flag?: string }): void {
    const normalizedPath = this.normalizePath(filePath);
    this.recordOperation('writeFileSync', normalizedPath);

    if (this.shouldSimulateError()) {
      const error = new Error(`EACCES: permission denied, open '${filePath}'`);
      (error as any).code = 'EACCES';
      throw error;
    }

    // Check file size limit
    const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data.toString());
    if (size > this.config.maxFileSize) {
      const error = new Error(`File too large: ${size} bytes exceeds limit of ${this.config.maxFileSize} bytes`);
      throw error;
    }

    // Ensure parent directory exists
    const parentDir = path.dirname(normalizedPath);
    this.ensureDirectoryExists(parentDir);

    // Create or update file entry
    const now = new Date();
    const entry: MockFileEntry = {
      type: 'file',
      content: data,
      size: size,
      mode: options?.mode || 0o644,
      uid: 1000,
      gid: 1000,
      atime: now,
      mtime: now,
      ctime: now,
      birthtime: this.fileSystem.get(normalizedPath)?.birthtime || now
    };

    this.fileSystem.set(normalizedPath, entry);
    this.emit('fileChanged', { path: normalizedPath, operation: 'write' });
  }

  /**
   * Mock fs.existsSync
   */
  existsSync(filePath: string): boolean {
    const normalizedPath = this.normalizePath(filePath);
    this.recordOperation('existsSync', normalizedPath);
    return this.fileSystem.has(normalizedPath);
  }

  /**
   * Mock fs.mkdirSync
   */
  mkdirSync(dirPath: string, options?: { recursive?: boolean; mode?: number }): void {
    const normalizedPath = this.normalizePath(dirPath);
    this.recordOperation('mkdirSync', normalizedPath);

    if (this.shouldSimulateError()) {
      const error = new Error(`EACCES: permission denied, mkdir '${dirPath}'`);
      (error as any).code = 'EACCES';
      throw error;
    }

    if (options?.recursive) {
      this.ensureDirectoryExists(normalizedPath);
    } else {
      // Check if parent directory exists
      const parentDir = path.dirname(normalizedPath);
      if (!this.fileSystem.has(parentDir) && parentDir !== normalizedPath) {
        const error = new Error(`ENOENT: no such file or directory, mkdir '${dirPath}'`);
        (error as any).code = 'ENOENT';
        throw error;
      }

      // Check if directory already exists
      if (this.fileSystem.has(normalizedPath)) {
        const error = new Error(`EEXIST: file already exists, mkdir '${dirPath}'`);
        (error as any).code = 'EEXIST';
        throw error;
      }

      this.createDirectory(normalizedPath, options?.mode || 0o755);
    }
  }

  /**
   * Mock fs.readdirSync
   */
  readdirSync(dirPath: string, options?: { withFileTypes?: boolean }): string[] | any[] {
    const normalizedPath = this.normalizePath(dirPath);
    this.recordOperation('readdirSync', normalizedPath);

    if (this.shouldSimulateError()) {
      const error = new Error(`ENOENT: no such file or directory, scandir '${dirPath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    const entry = this.fileSystem.get(normalizedPath);
    if (!entry) {
      const error = new Error(`ENOENT: no such file or directory, scandir '${dirPath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    if (entry.type !== 'directory') {
      const error = new Error(`ENOTDIR: not a directory, scandir '${dirPath}'`);
      (error as any).code = 'ENOTDIR';
      throw error;
    }

    const children: string[] = [];
    const searchPrefix = normalizedPath === '/' ? '/' : normalizedPath + '/';

    for (const [filePath, fileEntry] of this.fileSystem.entries()) {
      if (filePath.startsWith(searchPrefix) && filePath !== normalizedPath) {
        const relativePath = filePath.substring(searchPrefix.length);
        if (!relativePath.includes('/')) {
          children.push(relativePath);
        }
      }
    }

    if (options?.withFileTypes) {
      return children.map(name => ({
        name,
        isFile: () => this.fileSystem.get(path.join(normalizedPath, name))?.type === 'file',
        isDirectory: () => this.fileSystem.get(path.join(normalizedPath, name))?.type === 'directory'
      }));
    }

    return children.sort();
  }

  /**
   * Mock fs.statSync
   */
  statSync(filePath: string): MockStats {
    const normalizedPath = this.normalizePath(filePath);
    this.recordOperation('statSync', normalizedPath);

    if (this.shouldSimulateError()) {
      const error = new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    const entry = this.fileSystem.get(normalizedPath);
    if (!entry) {
      const error = new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    return {
      dev: 2114,
      ino: 48064969,
      mode: entry.mode || (entry.type === 'file' ? 33188 : 16877),
      nlink: entry.type === 'directory' ? 2 : 1,
      uid: entry.uid || 1000,
      gid: entry.gid || 1000,
      rdev: 0,
      size: entry.size || (entry.content ? Buffer.byteLength(entry.content.toString()) : 0),
      blksize: 4096,
      blocks: Math.ceil((entry.size || 0) / 512),
      atime: entry.atime,
      mtime: entry.mtime,
      ctime: entry.ctime,
      birthtime: entry.birthtime,
      isFile: () => entry.type === 'file',
      isDirectory: () => entry.type === 'directory',
      isBlockDevice: () => false,
      isCharacterDevice: () => false,
      isSymbolicLink: () => false,
      isFIFO: () => false,
      isSocket: () => false
    };
  }

  /**
   * Mock fs.unlinkSync
   */
  unlinkSync(filePath: string): void {
    const normalizedPath = this.normalizePath(filePath);
    this.recordOperation('unlinkSync', normalizedPath);

    if (this.shouldSimulateError()) {
      const error = new Error(`ENOENT: no such file or directory, unlink '${filePath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    const entry = this.fileSystem.get(normalizedPath);
    if (!entry) {
      const error = new Error(`ENOENT: no such file or directory, unlink '${filePath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    if (entry.type !== 'file') {
      const error = new Error(`EPERM: operation not permitted, unlink '${filePath}'`);
      (error as any).code = 'EPERM';
      throw error;
    }

    this.fileSystem.delete(normalizedPath);
    this.emit('fileChanged', { path: normalizedPath, operation: 'delete' });
  }

  /**
   * Mock fs.rmdirSync
   */
  rmdirSync(dirPath: string, options?: { recursive?: boolean }): void {
    const normalizedPath = this.normalizePath(dirPath);
    this.recordOperation('rmdirSync', normalizedPath);

    if (this.shouldSimulateError()) {
      const error = new Error(`ENOENT: no such file or directory, rmdir '${dirPath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    const entry = this.fileSystem.get(normalizedPath);
    if (!entry) {
      const error = new Error(`ENOENT: no such file or directory, rmdir '${dirPath}'`);
      (error as any).code = 'ENOENT';
      throw error;
    }

    if (entry.type !== 'directory') {
      const error = new Error(`ENOTDIR: not a directory, rmdir '${dirPath}'`);
      (error as any).code = 'ENOTDIR';
      throw error;
    }

    // Check if directory is empty (unless recursive)
    if (!options?.recursive) {
      const children = this.readdirSync(dirPath);
      if (children.length > 0) {
        const error = new Error(`ENOTEMPTY: directory not empty, rmdir '${dirPath}'`);
        (error as any).code = 'ENOTEMPTY';
        throw error;
      }
    }

    // Remove directory and all children
    const toRemove: string[] = [normalizedPath];
    for (const [filePath] of this.fileSystem.entries()) {
      if (filePath.startsWith(normalizedPath + '/')) {
        toRemove.push(filePath);
      }
    }

    for (const pathToRemove of toRemove) {
      this.fileSystem.delete(pathToRemove);
    }

    this.emit('fileChanged', { path: normalizedPath, operation: 'delete' });
  }

  /**
   * Setup initial file system structure
   */
  setupFiles(files: Record<string, string | Buffer>): void {
    for (const [filePath, content] of Object.entries(files)) {
      const normalizedPath = this.normalizePath(filePath);
      this.ensureDirectoryExists(path.dirname(normalizedPath));
      
      const now = new Date();
      const entry: MockFileEntry = {
        type: 'file',
        content,
        size: Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content),
        mode: 0o644,
        uid: 1000,
        gid: 1000,
        atime: now,
        mtime: now,
        ctime: now,
        birthtime: now
      };

      this.fileSystem.set(normalizedPath, entry);
    }
  }

  /**
   * Get file system state for debugging
   */
  getFileSystemState(): Record<string, any> {
    const state: Record<string, any> = {};
    for (const [filePath, entry] of this.fileSystem.entries()) {
      state[filePath] = {
        type: entry.type,
        size: entry.size,
        content: entry.type === 'file' ? entry.content?.toString().substring(0, 100) + '...' : undefined
      };
    }
    return state;
  }

  /**
   * Get operation history
   */
  getOperationHistory(): typeof this.operationHistory {
    return [...this.operationHistory];
  }

  /**
   * Clear operation history
   */
  clearHistory(): void {
    this.operationHistory = [];
  }

  /**
   * Reset file system to initial state
   */
  reset(): void {
    this.fileSystem.clear();
    this.operationHistory = [];
    this.initializeFileSystem();
  }

  /**
   * Simulate file system error
   */
  simulateError(errorRate: number = 1.0): void {
    const originalErrorRate = this.config.errorRate;
    this.config.errorRate = errorRate;
    
    // Restore after next operation
    setTimeout(() => {
      this.config.errorRate = originalErrorRate;
    }, 100);
  }

  // Private methods

  private initializeFileSystem(): void {
    // Create root directory
    this.createDirectory('/', 0o755);
    
    // Create common directories
    this.ensureDirectoryExists('/tmp');
    this.ensureDirectoryExists('/var');
    this.ensureDirectoryExists('/usr');
    this.ensureDirectoryExists('/home');
  }

  private normalizePath(filePath: string): string {
    let normalized = path.resolve(filePath).replace(/\\/g, '/');
    if (!this.config.caseSensitive) {
      normalized = normalized.toLowerCase();
    }
    return normalized;
  }

  private ensureDirectoryExists(dirPath: string): void {
    const normalizedPath = this.normalizePath(dirPath);
    
    if (this.fileSystem.has(normalizedPath)) {
      return;
    }

    // Create parent directory first
    const parentDir = path.dirname(normalizedPath);
    if (parentDir !== normalizedPath) {
      this.ensureDirectoryExists(parentDir);
    }

    this.createDirectory(normalizedPath, 0o755);
  }

  private createDirectory(dirPath: string, mode: number): void {
    const now = new Date();
    const entry: MockFileEntry = {
      type: 'directory',
      mode: mode,
      uid: 1000,
      gid: 1000,
      atime: now,
      mtime: now,
      ctime: now,
      birthtime: now,
      children: new Map()
    };

    this.fileSystem.set(dirPath, entry);
  }

  private shouldSimulateError(): boolean {
    return Math.random() < this.config.errorRate;
  }

  private recordOperation(operation: string, filePath: string, error?: Error): void {
    this.operationHistory.push({
      operation,
      path: filePath,
      timestamp: new Date(),
      success: !error,
      error
    });
  }
}

/**
 * Global mock instance
 */
let globalFileSystemMock: FileSystemMock | null = null;

/**
 * Get or create global file system mock
 */
export function getFileSystemMock(config?: Partial<MockFileSystemConfig>): FileSystemMock {
  if (!globalFileSystemMock) {
    globalFileSystemMock = new FileSystemMock(config);
  }
  return globalFileSystemMock;
}

/**
 * Reset global file system mock
 */
export function resetFileSystemMock(): void {
  globalFileSystemMock = null;
}

/**
 * Jest setup helper for mocking fs module
 */
export function setupFileSystemMockForJest(mock: FileSystemMock) {
  jest.mock('fs', () => ({
    readFileSync: jest.fn().mockImplementation((...args) => mock.readFileSync(...args)),
    writeFileSync: jest.fn().mockImplementation((...args) => mock.writeFileSync(...args)),
    existsSync: jest.fn().mockImplementation((...args) => mock.existsSync(...args)),
    mkdirSync: jest.fn().mockImplementation((...args) => mock.mkdirSync(...args)),
    readdirSync: jest.fn().mockImplementation((...args) => mock.readdirSync(...args)),
    statSync: jest.fn().mockImplementation((...args) => mock.statSync(...args)),
    unlinkSync: jest.fn().mockImplementation((...args) => mock.unlinkSync(...args)),
    rmdirSync: jest.fn().mockImplementation((...args) => mock.rmdirSync(...args))
  }));
}

/**
 * Mock factory for common test scenarios
 */
export class FileSystemMockFactory {
  /**
   * Create mock with typical FLCM file structure
   */
  static createFLCMStructure(): FileSystemMock {
    const mock = new FileSystemMock();
    
    mock.setupFiles({
      '/Users/test/.flcm-core/core-config.yaml': `
        flcm:
          version: "2.0"
          logLevel: "info"
          agents:
            scholar:
              enabled: true
              priority: 1
            creator:
              enabled: true
              priority: 2
            publisher:
              enabled: true
              priority: 3
      `,
      '/Users/test/.flcm-core/logs/activity.log': 'Log entries...',
      '/Users/test/.flcm-core/cache/agent-cache.json': '{}',
      '/Users/test/Documents/content/output.md': '# Generated Content\n\nContent here...'
    });
    
    return mock;
  }

  /**
   * Create mock that simulates permission errors
   */
  static createPermissionErrorMock(): FileSystemMock {
    return new FileSystemMock({
      enablePermissionSimulation: true,
      errorRate: 0.3
    });
  }

  /**
   * Create mock with high latency
   */
  static createHighLatencyMock(): FileSystemMock {
    return new FileSystemMock({
      enableLatencySimulation: true,
      averageLatency: 1000
    });
  }
}