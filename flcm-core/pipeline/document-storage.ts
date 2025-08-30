/**
 * Document Storage Abstraction Layer for FLCM Pipeline
 * Provides file system storage for documents
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  BaseDocument, 
  DocumentType, 
  QueryFilter,
  DocumentReference 
} from './document-schemas';
import { MetadataManager } from './metadata-manager';
import { DocumentValidator } from './document-validator';

/**
 * Storage configuration
 */
export interface StorageConfig {
  basePath: string;
  structure: {
    briefs: string;
    syntheses: string;
    drafts: string;
    adaptations: string;
  };
  indexPath: string;
  autoBackup: boolean;
  maxVersions: number;
}

/**
 * Storage operation result
 */
export interface StorageResult {
  success: boolean;
  path?: string;
  error?: string;
}

/**
 * Document Storage Interface
 */
export interface IDocumentStorage {
  save(document: BaseDocument, content: string): Promise<StorageResult>;
  load(id: string): Promise<{ document: BaseDocument; content: string }>;
  query(filter: QueryFilter): Promise<BaseDocument[]>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  list(type?: DocumentType): Promise<DocumentReference[]>;
}

/**
 * File System Storage Implementation
 */
export class FileSystemStorage implements IDocumentStorage {
  private config: StorageConfig;
  private metadataManager: MetadataManager;
  private validator: DocumentValidator;

  constructor(config?: Partial<StorageConfig>) {
    this.config = {
      basePath: path.join(process.cwd(), 'docs'),
      structure: {
        briefs: 'content/briefs',
        syntheses: 'knowledge/syntheses',
        drafts: 'creation/drafts',
        adaptations: 'publish/adaptations'
      },
      indexPath: path.join(process.cwd(), '.flcm-core', 'data', 'document-index.json'),
      autoBackup: true,
      maxVersions: 5,
      ...config
    };
    
    this.metadataManager = new MetadataManager();
    this.validator = new DocumentValidator();
    
    // Initialize storage directories
    this.initializeDirectories();
    
    // Load existing index
    this.loadIndex();
  }

  /**
   * Initialize storage directories
   */
  private initializeDirectories(): void {
    const dirs = [
      path.join(this.config.basePath, this.config.structure.briefs),
      path.join(this.config.basePath, this.config.structure.syntheses),
      path.join(this.config.basePath, this.config.structure.drafts),
      path.join(this.config.basePath, this.config.structure.adaptations),
      path.dirname(this.config.indexPath)
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * Load document index
   */
  private loadIndex(): void {
    if (fs.existsSync(this.config.indexPath)) {
      try {
        const indexData = fs.readFileSync(this.config.indexPath, 'utf8');
        this.metadataManager.importIndex(indexData);
      } catch (error) {
        console.error('Failed to load document index:', error);
      }
    }
  }

  /**
   * Save document index
   */
  private saveIndex(): void {
    try {
      const indexData = this.metadataManager.exportIndex();
      fs.writeFileSync(this.config.indexPath, indexData);
    } catch (error) {
      console.error('Failed to save document index:', error);
    }
  }

  /**
   * Save document to storage
   */
  async save(document: BaseDocument, content: string): Promise<StorageResult> {
    try {
      // Validate document
      const validation = this.validator.validate(document);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors[0]?.message}`
        };
      }
      
      // Determine file path
      const filePath = this.getDocumentPath(document);
      const dir = path.dirname(filePath);
      
      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Backup existing file if it exists
      if (this.config.autoBackup && fs.existsSync(filePath)) {
        await this.backupDocument(filePath, document.version);
      }
      
      // Serialize document with frontmatter
      const serialized = this.metadataManager.serializeDocument(document, content);
      
      // Write to file
      fs.writeFileSync(filePath, serialized);
      
      // Update index
      this.metadataManager.addToIndex(document, filePath);
      this.saveIndex();
      
      return {
        success: true,
        path: filePath
      };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load document from storage
   */
  async load(id: string): Promise<{ document: BaseDocument; content: string }> {
    // Get path from index
    const indexEntry = this.metadataManager.getFromIndex(id);
    if (!indexEntry) {
      // Try to find by scanning directories
      const filePath = await this.findDocumentPath(id);
      if (!filePath) {
        throw new Error(`Document not found: ${id}`);
      }
      indexEntry.path = filePath;
    }
    
    // Read file
    const markdown = fs.readFileSync(indexEntry.path, 'utf8');
    
    // Parse document
    const { document: parsed, content } = this.metadataManager.parseDocument(markdown);
    
    // Reconstruct full document based on type
    const document = this.reconstructDocument(parsed, content);
    
    return { document, content };
  }

  /**
   * Query documents
   */
  async query(filter: QueryFilter): Promise<BaseDocument[]> {
    const results: BaseDocument[] = [];
    
    // Search index
    const indexResults = this.metadataManager.searchIndex({
      type: filter.type,
      agent: filter.agent,
      status: filter.status,
      tags: filter.tags
    });
    
    // Apply additional filters and load documents
    for (const entry of indexResults) {
      // Date range filter
      if (filter.dateRange) {
        if (entry.created < filter.dateRange.start || 
            entry.created > filter.dateRange.end) {
          continue;
        }
      }
      
      try {
        const { document } = await this.load(entry.id);
        results.push(document);
      } catch (error) {
        console.warn(`Failed to load document ${entry.id}:`, error);
      }
    }
    
    // Sort results
    if (filter.sortBy) {
      results.sort((a, b) => {
        const aVal = (a as any)[filter.sortBy!];
        const bVal = (b as any)[filter.sortBy!];
        
        if (filter.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }
    
    // Apply limit and offset
    const start = filter.offset || 0;
    const end = filter.limit ? start + filter.limit : results.length;
    
    return results.slice(start, end);
  }

  /**
   * Delete document
   */
  async delete(id: string): Promise<boolean> {
    try {
      const indexEntry = this.metadataManager.getFromIndex(id);
      if (!indexEntry) {
        return false;
      }
      
      // Delete file
      if (fs.existsSync(indexEntry.path)) {
        fs.unlinkSync(indexEntry.path);
      }
      
      // Remove from index
      this.metadataManager.getFromIndex(id);
      this.saveIndex();
      
      return true;
      
    } catch (error) {
      console.error(`Failed to delete document ${id}:`, error);
      return false;
    }
  }

  /**
   * Check if document exists
   */
  async exists(id: string): Promise<boolean> {
    const indexEntry = this.metadataManager.getFromIndex(id);
    if (!indexEntry) {
      return false;
    }
    
    return fs.existsSync(indexEntry.path);
  }

  /**
   * List documents
   */
  async list(type?: DocumentType): Promise<DocumentReference[]> {
    const references: DocumentReference[] = [];
    
    // Get from index
    const criteria = type ? { type } : {};
    const results = this.metadataManager.searchIndex(criteria as any);
    
    for (const entry of results) {
      references.push({
        id: entry.id,
        type: entry.type,
        path: entry.path
      });
    }
    
    return references;
  }

  /**
   * Get document path based on type and ID
   */
  private getDocumentPath(document: BaseDocument): string {
    let subdir: string;
    
    switch (document.type) {
      case DocumentType.CONTENT_BRIEF:
        subdir = this.config.structure.briefs;
        break;
      case DocumentType.KNOWLEDGE_SYNTHESIS:
        subdir = this.config.structure.syntheses;
        break;
      case DocumentType.CONTENT_DRAFT:
        subdir = this.config.structure.drafts;
        break;
      case DocumentType.PLATFORM_ADAPTATION:
        const adaptation = document as any;
        subdir = path.join(this.config.structure.adaptations, adaptation.platform || '');
        break;
      default:
        throw new Error(`Unknown document type: ${document.type}`);
    }
    
    const filename = `${document.id}.md`;
    return path.join(this.config.basePath, subdir, filename);
  }

  /**
   * Find document path by scanning directories
   */
  private async findDocumentPath(id: string): Promise<string | null> {
    const dirs = [
      path.join(this.config.basePath, this.config.structure.briefs),
      path.join(this.config.basePath, this.config.structure.syntheses),
      path.join(this.config.basePath, this.config.structure.drafts),
      path.join(this.config.basePath, this.config.structure.adaptations)
    ];
    
    for (const dir of dirs) {
      const filePath = path.join(dir, `${id}.md`);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
      
      // Check subdirectories for adaptations
      if (dir.includes('adaptations')) {
        const subdirs = fs.readdirSync(dir, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);
        
        for (const subdir of subdirs) {
          const subPath = path.join(dir, subdir, `${id}.md`);
          if (fs.existsSync(subPath)) {
            return subPath;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Backup document
   */
  private async backupDocument(filePath: string, version: number): Promise<void> {
    const backupDir = path.join(path.dirname(filePath), '.backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const filename = path.basename(filePath, '.md');
    const backupPath = path.join(backupDir, `${filename}.v${version}.md`);
    
    fs.copyFileSync(filePath, backupPath);
    
    // Clean old backups
    this.cleanOldBackups(backupDir, filename);
  }

  /**
   * Clean old backup files
   */
  private cleanOldBackups(backupDir: string, filename: string): void {
    const backups = fs.readdirSync(backupDir)
      .filter(f => f.startsWith(filename) && f.includes('.v'))
      .sort((a, b) => {
        const versionA = parseInt(a.match(/\.v(\d+)\./)?.[1] || '0');
        const versionB = parseInt(b.match(/\.v(\d+)\./)?.[1] || '0');
        return versionB - versionA;
      });
    
    // Keep only maxVersions
    if (backups.length > this.config.maxVersions) {
      for (let i = this.config.maxVersions; i < backups.length; i++) {
        fs.unlinkSync(path.join(backupDir, backups[i]));
      }
    }
  }

  /**
   * Reconstruct full document from parsed data
   */
  private reconstructDocument(
    parsed: Partial<BaseDocument>,
    content: string
  ): BaseDocument {
    // This is a simplified reconstruction
    // In a real implementation, we'd parse the content to extract
    // type-specific fields
    
    return {
      ...parsed,
      // Add any missing required fields with defaults
      id: parsed.id || '',
      type: parsed.type || DocumentType.CONTENT_BRIEF,
      created: parsed.created || new Date(),
      modified: parsed.modified || new Date(),
      version: parsed.version || 1,
      metadata: parsed.metadata || {
        agent: 'collector',
        status: 'pending' as any,
        methodologies: []
      }
    } as BaseDocument;
  }

  /**
   * Get storage statistics
   */
  async getStatistics(): Promise<Record<string, any>> {
    const stats = this.metadataManager.getStatistics();
    
    // Add storage-specific stats
    const storageSizes: Record<string, number> = {};
    
    const dirs = [
      { name: 'briefs', path: path.join(this.config.basePath, this.config.structure.briefs) },
      { name: 'syntheses', path: path.join(this.config.basePath, this.config.structure.syntheses) },
      { name: 'drafts', path: path.join(this.config.basePath, this.config.structure.drafts) },
      { name: 'adaptations', path: path.join(this.config.basePath, this.config.structure.adaptations) }
    ];
    
    for (const dir of dirs) {
      if (fs.existsSync(dir.path)) {
        const files = fs.readdirSync(dir.path, { recursive: true, withFileTypes: true })
          .filter(f => f.isFile() && f.name.endsWith('.md'));
        
        let totalSize = 0;
        for (const file of files) {
          const filePath = path.join(file.path, file.name);
          const stat = fs.statSync(filePath);
          totalSize += stat.size;
        }
        
        storageSizes[dir.name] = totalSize;
      }
    }
    
    return {
      ...stats,
      storage: {
        basePath: this.config.basePath,
        sizes: storageSizes,
        totalSize: Object.values(storageSizes).reduce((a, b) => a + b, 0)
      }
    };
  }
}