/**
 * FLCM Metadata Manager
 * Handles document metadata extraction, enrichment, and persistence
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { 
  BaseMetadata, 
  DocumentStage, 
  InsightsMetadata, 
  ContentMetadata, 
  PlatformMetadata,
  Document,
  generateDocumentId,
  generateHash
} from './document-schema';
import { createLogger } from '../utils/logger';

const logger = createLogger('MetadataManager');

/**
 * Frontmatter extraction result
 */
interface FrontmatterResult {
  metadata: any;
  content: string;
  raw: string;
}

/**
 * Metadata enrichment options
 */
export interface EnrichmentOptions {
  calculateHash?: boolean;
  extractKeywords?: boolean;
  analyzeContent?: boolean;
  preserveExisting?: boolean;
}

/**
 * Metadata Manager
 * Manages document metadata throughout the pipeline
 */
export class MetadataManager {
  private metadataCache: Map<string, BaseMetadata> = new Map();
  private metadataIndex: Map<string, string> = new Map(); // id -> filepath

  /**
   * Extract frontmatter from markdown document
   */
  extractFrontmatter(content: string): FrontmatterResult {
    const lines = content.split('\n');
    
    if (lines[0] !== '---') {
      return {
        metadata: {},
        content,
        raw: '',
      };
    }

    let endIndex = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '---') {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      return {
        metadata: {},
        content,
        raw: '',
      };
    }

    const frontmatterLines = lines.slice(1, endIndex);
    const contentLines = lines.slice(endIndex + 1);
    const frontmatterRaw = frontmatterLines.join('\n');

    try {
      const metadata = yaml.load(frontmatterRaw) || {};
      return {
        metadata,
        content: contentLines.join('\n').trim(),
        raw: frontmatterRaw,
      };
    } catch (error) {
      logger.error('Error parsing frontmatter:', error);
      return {
        metadata: {},
        content,
        raw: frontmatterRaw,
      };
    }
  }

  /**
   * Create frontmatter from metadata
   */
  createFrontmatter(metadata: BaseMetadata): string {
    const cleanMetadata = this.prepareMetadataForSerialization(metadata);
    const yamlStr = yaml.dump(cleanMetadata, {
      indent: 2,
      lineWidth: 80,
      noRefs: true,
    });

    return `---\n${yamlStr}---\n`;
  }

  /**
   * Prepare metadata for YAML serialization
   */
  private prepareMetadataForSerialization(metadata: any): any {
    const clean = { ...metadata };

    // Convert dates to ISO strings
    if (clean.timestamp instanceof Date) {
      clean.timestamp = clean.timestamp.toISOString();
    }
    if (clean.scheduledTime instanceof Date) {
      clean.scheduledTime = clean.scheduledTime.toISOString();
    }

    // Remove undefined values
    Object.keys(clean).forEach(key => {
      if (clean[key] === undefined) {
        delete clean[key];
      }
    });

    return clean;
  }

  /**
   * Read document with metadata
   */
  async readDocument<T extends BaseMetadata = BaseMetadata>(
    filePath: string
  ): Promise<Document<T> | null> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const { metadata, content: body } = this.extractFrontmatter(content);

      // Enhance metadata with file info
      const stats = await fs.promises.stat(filePath);
      const enrichedMetadata = {
        ...metadata,
        timestamp: metadata.timestamp ? new Date(metadata.timestamp) : stats.mtime,
        hash: metadata.hash || generateHash(body),
      } as T;

      // Cache metadata
      this.cacheMetadata(filePath, enrichedMetadata);

      return {
        metadata: enrichedMetadata,
        content: body,
      };
    } catch (error) {
      logger.error(`Error reading document ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Write document with metadata
   */
  async writeDocument<T extends BaseMetadata = BaseMetadata>(
    filePath: string,
    document: Document<T>
  ): Promise<void> {
    try {
      // Ensure metadata has required fields
      if (!document.metadata.id) {
        document.metadata.id = generateDocumentId();
      }
      if (!document.metadata.timestamp) {
        document.metadata.timestamp = new Date();
      }
      if (!document.metadata.hash) {
        document.metadata.hash = generateHash(document.content);
      }

      // Create full document with frontmatter
      const frontmatter = this.createFrontmatter(document.metadata);
      const fullContent = frontmatter + '\n' + document.content;

      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.promises.mkdir(dir, { recursive: true });

      // Write file
      await fs.promises.writeFile(filePath, fullContent, 'utf8');

      // Update cache
      this.cacheMetadata(filePath, document.metadata);

      logger.info(`Document written: ${filePath}`);
    } catch (error) {
      logger.error(`Error writing document ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Enrich metadata with additional information
   */
  async enrichMetadata<T extends BaseMetadata>(
    metadata: T,
    content: string,
    options: EnrichmentOptions = {}
  ): Promise<T> {
    const enriched = { ...metadata };

    // Calculate hash if requested
    if (options.calculateHash && !options.preserveExisting) {
      enriched.hash = generateHash(content);
    }

    // Extract keywords if requested
    if (options.extractKeywords) {
      enriched.tags = this.extractKeywords(content);
    }

    // Analyze content if requested
    if (options.analyzeContent) {
      const analysis = this.analyzeContent(content);
      Object.assign(enriched, analysis);
    }

    return enriched;
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string): string[] {
    // Simple keyword extraction (in production, use NLP)
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4);

    const wordFreq = new Map<string, number>();
    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }

    // Get top 10 most frequent words
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Analyze content for metadata enrichment
   */
  private analyzeContent(content: string): Record<string, any> {
    const lines = content.split('\n');
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    return {
      wordCount: words.length,
      lineCount: lines.length,
      readingTime: Math.ceil(words.length / 200), // Assuming 200 words per minute
      contentLength: content.length,
    };
  }

  /**
   * Inherit metadata from parent document
   */
  inheritMetadata<T extends BaseMetadata, P extends BaseMetadata>(
    childMetadata: Partial<T>,
    parentMetadata: P,
    stage: DocumentStage
  ): T {
    const inherited: any = {
      ...childMetadata,
      stage,
      version: childMetadata.version || '1.0.0',
      timestamp: childMetadata.timestamp || new Date(),
      id: childMetadata.id || generateDocumentId(),
    };

    // Inherit tags if not present
    if (!inherited.tags && parentMetadata.tags) {
      inherited.tags = [...parentMetadata.tags];
    }

    // Add parent reference based on stage
    switch (stage) {
      case DocumentStage.INSIGHTS:
        if (parentMetadata.stage === DocumentStage.INPUT) {
          inherited.source = {
            type: 'input',
            path: parentMetadata.id,
            hash: parentMetadata.hash,
          };
        }
        break;
      case DocumentStage.CONTENT:
        if (parentMetadata.stage === DocumentStage.INSIGHTS) {
          inherited.source = {
            insights: parentMetadata.id,
          };
        }
        break;
      case DocumentStage.PUBLISHED:
        if (parentMetadata.stage === DocumentStage.CONTENT) {
          inherited.source = {
            content: parentMetadata.id,
          };
        }
        break;
    }

    return inherited as T;
  }

  /**
   * Validate metadata against stage requirements
   */
  validateMetadata(metadata: BaseMetadata, stage: DocumentStage): boolean {
    // Check required base fields
    if (!metadata.id || !metadata.timestamp || !metadata.version || !metadata.stage) {
      logger.error('Missing required base metadata fields');
      return false;
    }

    // Check stage match
    if (metadata.stage !== stage) {
      logger.error(`Metadata stage ${metadata.stage} doesn't match expected ${stage}`);
      return false;
    }

    // Stage-specific validation
    switch (stage) {
      case DocumentStage.INSIGHTS:
        const insights = metadata as InsightsMetadata;
        if (!insights.source || !insights.frameworks || insights.frameworks.length === 0) {
          logger.error('Invalid insights metadata');
          return false;
        }
        break;
      case DocumentStage.CONTENT:
        const content = metadata as ContentMetadata;
        if (!content.source?.insights || !content.voiceDNA || !content.mode) {
          logger.error('Invalid content metadata');
          return false;
        }
        break;
      case DocumentStage.PUBLISHED:
        const platform = metadata as PlatformMetadata;
        if (!platform.source?.content || !platform.platform || !platform.optimizations) {
          logger.error('Invalid platform metadata');
          return false;
        }
        break;
    }

    return true;
  }

  /**
   * Cache metadata for quick access
   */
  private cacheMetadata(filePath: string, metadata: BaseMetadata): void {
    this.metadataCache.set(filePath, metadata);
    this.metadataIndex.set(metadata.id, filePath);
  }

  /**
   * Get cached metadata
   */
  getCachedMetadata(filePath: string): BaseMetadata | undefined {
    return this.metadataCache.get(filePath);
  }

  /**
   * Get metadata by document ID
   */
  getMetadataById(id: string): BaseMetadata | undefined {
    const filePath = this.metadataIndex.get(id);
    if (!filePath) return undefined;
    return this.metadataCache.get(filePath);
  }

  /**
   * Update metadata for existing document
   */
  async updateMetadata<T extends BaseMetadata>(
    filePath: string,
    updates: Partial<T>
  ): Promise<void> {
    const document = await this.readDocument<T>(filePath);
    if (!document) {
      throw new Error(`Document not found: ${filePath}`);
    }

    // Apply updates
    document.metadata = {
      ...document.metadata,
      ...updates,
      timestamp: new Date(), // Update timestamp
    };

    // Recalculate hash if content changed
    if (updates.hash === undefined) {
      document.metadata.hash = generateHash(document.content);
    }

    // Write back
    await this.writeDocument(filePath, document);
  }

  /**
   * Search documents by metadata criteria
   */
  async searchDocuments(
    directory: string,
    criteria: Partial<BaseMetadata>
  ): Promise<string[]> {
    const results: string[] = [];

    try {
      const files = await fs.promises.readdir(directory);
      
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        
        const filePath = path.join(directory, file);
        const metadata = this.getCachedMetadata(filePath) || 
                        (await this.readDocument(filePath))?.metadata;

        if (!metadata) continue;

        // Check if metadata matches criteria
        let matches = true;
        for (const [key, value] of Object.entries(criteria)) {
          if (metadata[key as keyof BaseMetadata] !== value) {
            matches = false;
            break;
          }
        }

        if (matches) {
          results.push(filePath);
        }
      }
    } catch (error) {
      logger.error(`Error searching documents in ${directory}:`, error);
    }

    return results;
  }

  /**
   * Get metadata statistics for a directory
   */
  async getMetadataStatistics(directory: string): Promise<{
    totalDocuments: number;
    stages: Record<DocumentStage, number>;
    averageSize: number;
    oldestDocument: Date | null;
    newestDocument: Date | null;
  }> {
    const stats = {
      totalDocuments: 0,
      stages: {} as Record<DocumentStage, number>,
      averageSize: 0,
      oldestDocument: null as Date | null,
      newestDocument: null as Date | null,
    };

    try {
      const files = await fs.promises.readdir(directory);
      let totalSize = 0;

      for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(directory, file);
        const document = await this.readDocument(filePath);
        
        if (!document) continue;

        stats.totalDocuments++;
        totalSize += document.content.length;

        // Count by stage
        const stage = document.metadata.stage;
        stats.stages[stage] = (stats.stages[stage] || 0) + 1;

        // Track dates
        const timestamp = document.metadata.timestamp;
        if (!stats.oldestDocument || timestamp < stats.oldestDocument) {
          stats.oldestDocument = timestamp;
        }
        if (!stats.newestDocument || timestamp > stats.newestDocument) {
          stats.newestDocument = timestamp;
        }
      }

      if (stats.totalDocuments > 0) {
        stats.averageSize = Math.round(totalSize / stats.totalDocuments);
      }
    } catch (error) {
      logger.error(`Error getting metadata statistics for ${directory}:`, error);
    }

    return stats;
  }

  /**
   * Clear metadata cache
   */
  clearCache(): void {
    this.metadataCache.clear();
    this.metadataIndex.clear();
    logger.debug('Metadata cache cleared');
  }

  /**
   * Export metadata index
   */
  exportIndex(): Array<{ id: string; path: string; metadata: BaseMetadata }> {
    const index: Array<{ id: string; path: string; metadata: BaseMetadata }> = [];

    for (const [id, filePath] of this.metadataIndex) {
      const metadata = this.metadataCache.get(filePath);
      if (metadata) {
        index.push({ id, path: filePath, metadata });
      }
    }

    return index;
  }
}

// Export singleton instance
export const metadataManager = new MetadataManager();