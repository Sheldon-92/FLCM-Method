/**
 * FLCM Sync Engine
 * Handles bidirectional synchronization between Obsidian and FLCM
 */

import { App, TFile, Notice } from 'obsidian';
import { FLCMSettings, SyncOperation, SyncError, SyncStats } from './types';
import { FLCMClient } from './flcm-client';
import { ConflictResolver } from './conflict-resolver';
import { FrontmatterManager } from './frontmatter-manager';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export class FLCMSyncEngine {
  private app: App;
  private settings: FLCMSettings;
  private flcmClient: FLCMClient;
  private frontmatterManager: FrontmatterManager;
  private conflictResolver: ConflictResolver;
  
  private syncQueue: Map<string, SyncOperation> = new Map();
  private processingQueue: boolean = false;
  private stats: SyncStats;
  
  constructor(
    app: App,
    settings: FLCMSettings,
    flcmClient: FLCMClient,
    frontmatterManager: FrontmatterManager
  ) {
    this.app = app;
    this.settings = settings;
    this.flcmClient = flcmClient;
    this.frontmatterManager = frontmatterManager;
    this.conflictResolver = new ConflictResolver(settings);
    
    this.initializeStats();
  }
  
  /**
   * Initialize sync statistics
   */
  private initializeStats(): void {
    this.stats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsSyncs: 0,
      lastSyncTime: null,
      avgSyncTime: 0
    };
  }
  
  /**
   * Sync all eligible files
   */
  async syncAll(): Promise<{ successful: number; failed: number; conflicts: number }> {
    const startTime = Date.now();
    console.log('Starting full sync...');
    
    let successful = 0;
    let failed = 0;
    let conflicts = 0;
    
    try {
      // Get all markdown files in vault
      const files = this.app.vault.getMarkdownFiles();
      const filteredFiles = files.filter(file => this.shouldSyncFile(file));
      
      console.log(`Syncing ${filteredFiles.length} files`);
      
      // Process files in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < filteredFiles.length; i += batchSize) {
        const batch = filteredFiles.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (file) => {
          try {
            const result = await this.syncFile(file, 'bidirectional');
            if (result.status === 'completed') {
              successful++;
            } else if (result.status === 'conflict') {
              conflicts++;
            }
          } catch (error) {
            console.error(`Failed to sync ${file.path}:`, error);
            failed++;
          }
        });
        
        await Promise.all(batchPromises);
      }
      
      // Update statistics
      this.updateStats(successful, failed, conflicts, Date.now() - startTime);
      
      console.log(`Sync completed: ${successful} successful, ${failed} failed, ${conflicts} conflicts`);
      
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
    
    return { successful, failed, conflicts };
  }
  
  /**
   * Sync individual file
   */
  async syncFile(
    file: TFile,
    direction: 'to-flcm' | 'to-obsidian' | 'bidirectional' = 'bidirectional'
  ): Promise<SyncOperation> {
    const operationId = uuidv4();
    const operation: SyncOperation = {
      id: operationId,
      file: file.path,
      direction,
      status: 'pending',
      timestamp: Date.now(),
      retryCount: 0
    };
    
    // Add to queue
    this.syncQueue.set(operationId, operation);
    
    try {
      // Process the sync operation
      await this.processSyncOperation(operation);
    } catch (error) {
      operation.status = 'failed';
      operation.error = this.createSyncError('unknown', error.message, error);
    }
    
    // Remove from queue
    this.syncQueue.delete(operationId);
    
    return operation;
  }
  
  /**
   * Process sync operation
   */
  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    operation.status = 'in-progress';
    
    try {
      const file = this.app.vault.getAbstractFileByPath(operation.file) as TFile;
      if (!file) {
        throw new Error(`File not found: ${operation.file}`);
      }
      
      if (operation.direction === 'bidirectional') {
        await this.bidirectionalSync(file, operation);
      } else if (operation.direction === 'to-flcm') {
        await this.syncToFLCM(file, operation);
      } else {
        await this.syncToObsidian(file, operation);
      }
      
      operation.status = 'completed';
      
    } catch (error) {
      if (error.type === 'conflict') {
        operation.status = 'conflict';
        operation.conflictData = error.conflictData;
      } else {
        operation.status = 'failed';
        operation.error = this.createSyncError('unknown', error.message, error);
      }
      throw error;
    }
  }
  
  /**
   * Bidirectional sync
   */
  private async bidirectionalSync(file: TFile, operation: SyncOperation): Promise<void> {
    // Read local content
    const localContent = await this.app.vault.read(file);
    const localMetadata = this.frontmatterManager.extractMetadata(localContent);
    const localChecksum = this.calculateChecksum(localContent);
    
    // Check if file exists in FLCM
    const remoteExists = await this.flcmClient.exists(file.path);
    
    if (!remoteExists) {
      // File doesn't exist remotely - push to FLCM
      await this.syncToFLCM(file, operation);
      return;
    }
    
    // Read remote content
    const remoteDocument = await this.flcmClient.read(file.path);
    const remoteChecksum = remoteDocument.checksum;
    
    // Compare checksums
    if (localChecksum === remoteChecksum) {
      // Files are identical - no sync needed
      return;
    }
    
    // Determine sync direction based on timestamps
    const localModified = file.stat.mtime;
    const remoteModified = remoteDocument.lastModified.getTime();
    
    if (localModified > remoteModified) {
      // Local is newer - sync to FLCM
      await this.syncToFLCM(file, operation);
    } else if (remoteModified > localModified) {
      // Remote is newer - sync to Obsidian
      await this.syncToObsidianFromDocument(file, remoteDocument, operation);
    } else {
      // Same timestamp but different content - conflict
      await this.handleConflict(file, localContent, remoteDocument.content, operation);
    }
  }
  
  /**
   * Sync to FLCM
   */
  private async syncToFLCM(file: TFile, operation: SyncOperation): Promise<void> {
    const content = await this.app.vault.read(file);
    
    // Update FLCM metadata
    const updatedContent = await this.frontmatterManager.updateForSync(
      content,
      'obsidian',
      file.stat.mtime
    );
    
    // Write to FLCM
    await this.flcmClient.write(file.path, updatedContent, file.stat.mtime);
    
    // Update local file with sync metadata if needed
    if (updatedContent !== content) {
      await this.app.vault.modify(file, updatedContent);
    }
  }
  
  /**
   * Sync to Obsidian
   */
  private async syncToObsidian(file: TFile, operation: SyncOperation): Promise<void> {
    const remoteDocument = await this.flcmClient.read(file.path);
    await this.syncToObsidianFromDocument(file, remoteDocument, operation);
  }
  
  /**
   * Sync to Obsidian from document
   */
  private async syncToObsidianFromDocument(
    file: TFile,
    remoteDocument: any,
    operation: SyncOperation
  ): Promise<void> {
    // Update local file
    await this.app.vault.modify(file, remoteDocument.content);
    
    // Preserve file modification time if available
    if (remoteDocument.lastModified) {
      // Note: Obsidian doesn't provide direct access to set file timestamps
      // This would require platform-specific implementation
    }
  }
  
  /**
   * Handle sync conflict
   */
  private async handleConflict(
    file: TFile,
    localContent: string,
    remoteContent: string,
    operation: SyncOperation
  ): Promise<void> {
    // Get base content for three-way merge
    const baseContent = await this.getBaseContent(file);
    
    // Attempt automatic resolution
    const resolution = await this.conflictResolver.resolve(
      baseContent || localContent,
      localContent,
      remoteContent
    );
    
    if (resolution.type === 'auto') {
      // Auto-resolved - apply the resolution
      await this.app.vault.modify(file, resolution.content!);
      await this.syncToFLCM(file, operation);
    } else {
      // Manual resolution required
      await this.showConflictUI(file, resolution, operation);
    }
  }
  
  /**
   * Get base content for three-way merge
   */
  private async getBaseContent(file: TFile): Promise<string | null> {
    try {
      // This would ideally get the content from the last successful sync
      // For now, return null to fall back to two-way merge
      return null;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Show conflict resolution UI
   */
  private async showConflictUI(
    file: TFile,
    resolution: any,
    operation: SyncOperation
  ): Promise<void> {
    // Create conflict backup if enabled
    if (this.settings.advanced.conflictBackupEnabled) {
      const backupName = `${file.name}.conflict.${Date.now()}.md`;
      const localContent = await this.app.vault.read(file);
      await this.app.vault.create(backupName, localContent);
    }
    
    // Show conflict notice
    const notice = new Notice(
      `Conflict detected in ${file.name}. Backup created. Please resolve manually.`,
      10000
    );
    
    // For now, default to keeping local version
    // In a full implementation, this would show a proper conflict resolution UI
    operation.status = 'conflict';
    
    throw {
      type: 'conflict',
      message: 'Manual resolution required',
      conflictData: {
        baseContent: '',
        localContent: await this.app.vault.read(file),
        remoteContent: resolution.content || '',
        conflictMarkers: resolution.conflicts || []
      }
    };
  }
  
  /**
   * Delete from FLCM
   */
  async deleteFromFLCM(filePath: string): Promise<void> {
    try {
      await this.flcmClient.delete(filePath);
    } catch (error) {
      console.error(`Failed to delete from FLCM: ${filePath}`, error);
    }
  }
  
  /**
   * Rename in FLCM
   */
  async renameInFLCM(oldPath: string, newPath: string): Promise<void> {
    try {
      await this.flcmClient.rename(oldPath, newPath);
    } catch (error) {
      console.error(`Failed to rename in FLCM: ${oldPath} -> ${newPath}`, error);
    }
  }
  
  /**
   * Check if file should be synced
   */
  private shouldSyncFile(file: TFile): boolean {
    // Check file extension
    if (!file.path.endsWith('.md')) {
      return false;
    }
    
    // Check excluded directories
    for (const excludeDir of this.settings.syncFilter.excludeDirectories) {
      if (file.path.startsWith(excludeDir)) {
        return false;
      }
    }
    
    // Check included directories
    if (this.settings.syncFilter.includeDirectories.length > 0) {
      const isIncluded = this.settings.syncFilter.includeDirectories.some(
        includeDir => file.path.startsWith(includeDir)
      );
      if (!isIncluded) {
        return false;
      }
    }
    
    // Check tags (requires parsing frontmatter)
    // This would be implemented with proper frontmatter parsing
    
    return true;
  }
  
  /**
   * Calculate content checksum
   */
  private calculateChecksum(content: string): string {
    return crypto.createHash('md5').update(content, 'utf8').digest('hex');
  }
  
  /**
   * Create sync error
   */
  private createSyncError(type: string, message: string, details?: any): SyncError {
    return {
      type: type as any,
      message,
      details
    };
  }
  
  /**
   * Update sync statistics
   */
  private updateStats(successful: number, failed: number, conflicts: number, duration: number): void {
    this.stats.totalSyncs += successful + failed + conflicts;
    this.stats.successfulSyncs += successful;
    this.stats.failedSyncs += failed;
    this.stats.conflictsSyncs += conflicts;
    this.stats.lastSyncTime = new Date();
    
    // Update average sync time
    const totalSyncs = this.stats.totalSyncs;
    this.stats.avgSyncTime = ((this.stats.avgSyncTime * (totalSyncs - 1)) + duration) / totalSyncs;
  }
  
  /**
   * Get sync statistics
   */
  getStats(): SyncStats {
    return { ...this.stats };
  }
  
  /**
   * Get sync queue status
   */
  getSyncQueue(): SyncOperation[] {
    return Array.from(this.syncQueue.values());
  }
  
  /**
   * Stop sync engine
   */
  async stop(): Promise<void> {
    // Wait for current operations to complete
    while (this.processingQueue) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Clear queue
    this.syncQueue.clear();
    
    console.log('Sync engine stopped');
  }
}