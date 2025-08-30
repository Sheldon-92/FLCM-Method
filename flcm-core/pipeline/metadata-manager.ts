/**
 * Metadata Manager for FLCM Pipeline
 * Manages document metadata and frontmatter
 */

import * as yaml from 'js-yaml';
import { BaseDocument, DocumentType, DocumentStatus } from './document-schemas';

/**
 * Frontmatter structure
 */
export interface Frontmatter {
  flcm_type: string;
  flcm_id: string;
  agent: string;
  status: string;
  created: string;
  modified: string;
  version: number;
  [key: string]: any;
}

/**
 * Metadata index entry
 */
export interface MetadataIndex {
  id: string;
  type: DocumentType;
  path: string;
  created: Date;
  modified: Date;
  agent: string;
  status: DocumentStatus;
  tags: string[];
  references: string[];
}

/**
 * Metadata Manager Class
 */
export class MetadataManager {
  private index: Map<string, MetadataIndex>;
  
  constructor() {
    this.index = new Map();
  }

  /**
   * Extract frontmatter from markdown content
   */
  extractFrontmatter(content: string): { frontmatter: Frontmatter | null; body: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: null, body: content };
    }
    
    try {
      const frontmatter = yaml.load(match[1]) as Frontmatter;
      const body = match[2];
      return { frontmatter, body };
    } catch (error) {
      console.error('Failed to parse frontmatter:', error);
      return { frontmatter: null, body: content };
    }
  }

  /**
   * Generate frontmatter from document
   */
  generateFrontmatter(document: BaseDocument): Frontmatter {
    const frontmatter: Frontmatter = {
      flcm_type: document.type,
      flcm_id: document.id,
      agent: document.metadata.agent,
      status: document.metadata.status,
      created: document.created.toISOString(),
      modified: document.modified.toISOString(),
      version: document.version
    };
    
    // Add type-specific fields
    this.addTypeSpecificFields(document, frontmatter);
    
    // Add metadata fields
    if (document.metadata.methodologies?.length > 0) {
      frontmatter.methodologies_used = document.metadata.methodologies;
    }
    
    if (document.metadata.tags?.length > 0) {
      frontmatter.tags = document.metadata.tags;
    }
    
    if (document.metadata.wordCount) {
      frontmatter.word_count = document.metadata.wordCount;
    }
    
    if (document.metadata.confidence !== undefined) {
      frontmatter.confidence = document.metadata.confidence;
    }
    
    return frontmatter;
  }

  /**
   * Add type-specific fields to frontmatter
   */
  private addTypeSpecificFields(document: BaseDocument, frontmatter: Frontmatter): void {
    switch (document.type) {
      case DocumentType.CONTENT_BRIEF:
        const brief = document as any;
        frontmatter.sources = brief.sources?.map((s: any) => s.location);
        frontmatter.signal_score = brief.signalScore;
        frontmatter.concepts = brief.concepts;
        break;
        
      case DocumentType.KNOWLEDGE_SYNTHESIS:
        const synthesis = document as any;
        frontmatter.brief_id = synthesis.briefId;
        frontmatter.concept = synthesis.concept;
        frontmatter.depth_level = synthesis.depthLevel;
        frontmatter.teaching_ready = synthesis.teachingReady;
        break;
        
      case DocumentType.CONTENT_DRAFT:
        const draft = document as any;
        frontmatter.synthesis_id = synthesis.synthesisId;
        frontmatter.title = draft.title;
        frontmatter.reading_time = draft.readingTime;
        frontmatter.revisions = draft.revisions?.length || 0;
        break;
        
      case DocumentType.PLATFORM_ADAPTATION:
        const adaptation = document as any;
        frontmatter.draft_id = adaptation.draftId;
        frontmatter.platform = adaptation.platform;
        frontmatter.character_count = adaptation.characterCount;
        frontmatter.hashtags = adaptation.hashtags;
        break;
    }
  }

  /**
   * Serialize document with frontmatter
   */
  serializeDocument(document: BaseDocument, content: string): string {
    const frontmatter = this.generateFrontmatter(document);
    const yamlStr = yaml.dump(frontmatter, {
      sortKeys: false,
      lineWidth: -1
    });
    
    return `---\n${yamlStr}---\n\n${content}`;
  }

  /**
   * Parse document from markdown with frontmatter
   */
  parseDocument(markdown: string): { document: Partial<BaseDocument>; content: string } {
    const { frontmatter, body } = this.extractFrontmatter(markdown);
    
    if (!frontmatter) {
      throw new Error('No frontmatter found in document');
    }
    
    const document: Partial<BaseDocument> = {
      id: frontmatter.flcm_id,
      type: frontmatter.flcm_type as DocumentType,
      created: new Date(frontmatter.created),
      modified: new Date(frontmatter.modified),
      version: frontmatter.version,
      metadata: {
        agent: frontmatter.agent as any,
        status: frontmatter.status as DocumentStatus,
        methodologies: frontmatter.methodologies_used || [],
        tags: frontmatter.tags || [],
        wordCount: frontmatter.word_count,
        confidence: frontmatter.confidence
      }
    };
    
    return { document, content: body };
  }

  /**
   * Merge metadata from multiple sources
   */
  mergeMetadata(
    base: Partial<BaseDocument>,
    ...updates: Partial<BaseDocument>[]
  ): BaseDocument {
    let merged = { ...base };
    
    for (const update of updates) {
      // Merge top-level fields
      merged = { ...merged, ...update };
      
      // Merge metadata
      if (update.metadata) {
        merged.metadata = {
          ...merged.metadata,
          ...update.metadata
        };
        
        // Merge arrays
        if (update.metadata.methodologies) {
          merged.metadata.methodologies = [
            ...(merged.metadata?.methodologies || []),
            ...update.metadata.methodologies
          ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
        }
        
        if (update.metadata.tags) {
          merged.metadata.tags = [
            ...(merged.metadata?.tags || []),
            ...update.metadata.tags
          ].filter((v, i, a) => a.indexOf(v) === i);
        }
      }
    }
    
    // Update modified timestamp
    merged.modified = new Date();
    
    return merged as BaseDocument;
  }

  /**
   * Add document to index
   */
  addToIndex(document: BaseDocument, path: string): void {
    const entry: MetadataIndex = {
      id: document.id,
      type: document.type,
      path,
      created: document.created,
      modified: document.modified,
      agent: document.metadata.agent,
      status: document.metadata.status,
      tags: document.metadata.tags || [],
      references: this.extractReferences(document)
    };
    
    this.index.set(document.id, entry);
  }

  /**
   * Get document from index
   */
  getFromIndex(id: string): MetadataIndex | undefined {
    return this.index.get(id);
  }

  /**
   * Search index
   */
  searchIndex(criteria: Partial<MetadataIndex>): MetadataIndex[] {
    const results: MetadataIndex[] = [];
    
    this.index.forEach(entry => {
      let matches = true;
      
      if (criteria.type && entry.type !== criteria.type) {
        matches = false;
      }
      
      if (criteria.agent && entry.agent !== criteria.agent) {
        matches = false;
      }
      
      if (criteria.status && entry.status !== criteria.status) {
        matches = false;
      }
      
      if (criteria.tags && criteria.tags.length > 0) {
        const hasAllTags = criteria.tags.every(tag => entry.tags.includes(tag));
        if (!hasAllTags) {
          matches = false;
        }
      }
      
      if (matches) {
        results.push(entry);
      }
    });
    
    return results;
  }

  /**
   * Extract references from document
   */
  private extractReferences(document: BaseDocument): string[] {
    const references: string[] = [];
    
    // Extract based on document type
    switch (document.type) {
      case DocumentType.KNOWLEDGE_SYNTHESIS:
        const synthesis = document as any;
        if (synthesis.briefId) references.push(synthesis.briefId);
        break;
        
      case DocumentType.CONTENT_DRAFT:
        const draft = document as any;
        if (draft.synthesisId) references.push(draft.synthesisId);
        break;
        
      case DocumentType.PLATFORM_ADAPTATION:
        const adaptation = document as any;
        if (adaptation.draftId) references.push(adaptation.draftId);
        break;
    }
    
    return references;
  }

  /**
   * Generate Obsidian-compatible wiki links
   */
  generateWikiLinks(document: BaseDocument): string[] {
    const links: string[] = [];
    
    // Link to referenced documents
    const references = this.extractReferences(document);
    for (const ref of references) {
      const refDoc = this.index.get(ref);
      if (refDoc) {
        links.push(`[[${refDoc.path}|${ref}]]`);
      }
    }
    
    // Link to related concepts
    if (document.metadata.tags) {
      for (const tag of document.metadata.tags) {
        links.push(`[[${tag}]]`);
      }
    }
    
    return links;
  }

  /**
   * Export index to JSON
   */
  exportIndex(): string {
    const entries = Array.from(this.index.values());
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Import index from JSON
   */
  importIndex(json: string): void {
    try {
      const entries = JSON.parse(json) as MetadataIndex[];
      this.index.clear();
      
      for (const entry of entries) {
        // Convert date strings back to Date objects
        entry.created = new Date(entry.created);
        entry.modified = new Date(entry.modified);
        this.index.set(entry.id, entry);
      }
    } catch (error) {
      throw new Error(`Failed to import index: ${error}`);
    }
  }

  /**
   * Get index statistics
   */
  getStatistics(): Record<string, any> {
    const stats = {
      totalDocuments: this.index.size,
      byType: {} as Record<string, number>,
      byAgent: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      oldestDocument: null as Date | null,
      newestDocument: null as Date | null,
      mostUsedTags: [] as Array<{ tag: string; count: number }>
    };
    
    const tagCounts = new Map<string, number>();
    
    this.index.forEach(entry => {
      // Count by type
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
      
      // Count by agent
      stats.byAgent[entry.agent] = (stats.byAgent[entry.agent] || 0) + 1;
      
      // Count by status
      stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
      
      // Track oldest/newest
      if (!stats.oldestDocument || entry.created < stats.oldestDocument) {
        stats.oldestDocument = entry.created;
      }
      if (!stats.newestDocument || entry.created > stats.newestDocument) {
        stats.newestDocument = entry.created;
      }
      
      // Count tags
      for (const tag of entry.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    });
    
    // Sort tags by count
    stats.mostUsedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return stats;
  }
}