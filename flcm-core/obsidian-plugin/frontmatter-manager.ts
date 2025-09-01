/**
 * Frontmatter Manager
 * Handles FLCM metadata in document frontmatter
 */

import { FLCMMetadata } from './types';
import { v4 as uuidv4 } from 'uuid';

export class FrontmatterManager {
  
  /**
   * Extract FLCM metadata from document content
   */
  extractMetadata(content: string): FLCMMetadata | null {
    try {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        return null;
      }
      
      const yamlContent = frontmatterMatch[1];
      const flcmMatch = yamlContent.match(/flcm:\s*\n([\s\S]*?)(?=\n\w|$)/);
      
      if (!flcmMatch) {
        return null;
      }
      
      const flcmData = flcmMatch[1];
      return this.parseFlcmYaml(flcmData);
    } catch (error) {
      console.warn('Failed to extract FLCM metadata:', error);
      return null;
    }
  }
  
  /**
   * Parse FLCM YAML data
   */
  private parseFlcmYaml(yamlData: string): FLCMMetadata {
    const metadata: Partial<FLCMMetadata> = {
      version: '2.0',
      connections: [],
      tags: []
    };
    
    // Extract scalar fields
    const extractField = (field: string): string | undefined => {
      const match = yamlData.match(new RegExp(`\\s*${field}:\\s*"?([^"\\n]*)"?`));
      return match ? match[1].trim() : undefined;
    };
    
    metadata.layer = extractField('layer') as any;
    metadata.framework = extractField('framework') || '';
    metadata.timestamp = extractField('timestamp') || new Date().toISOString();
    metadata.session_id = extractField('session_id') || uuidv4();
    
    // Extract metadata object
    const metadataMatch = yamlData.match(/metadata:\s*\n((?:\s{2,}.*\n?)*)/);
    if (metadataMatch) {
      const metaData = metadataMatch[1];
      metadata.metadata = {
        depth_level: this.extractNumber(metaData, 'depth_level'),
        voice_profile: this.extractString(metaData, 'voice_profile'),
        audience: this.extractString(metaData, 'audience'),
        core_message: this.extractString(metaData, 'core_message'),
        learning_objective: this.extractString(metaData, 'learning_objective')
      };
    } else {
      metadata.metadata = {};
    }
    
    // Extract connections (array)
    const connectionsMatch = yamlData.match(/connections:\s*\n((?:\s*-\s*.*\n?)*)/);
    if (connectionsMatch) {
      metadata.connections = connectionsMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*-\s*/, '').trim())
        .filter(conn => conn.length > 0);
    }
    
    // Extract tags (array)
    const tagsMatch = yamlData.match(/tags:\s*\n((?:\s*-\s*.*\n?)*)/);
    if (tagsMatch) {
      metadata.tags = tagsMatch[1]
        .split('\n')
        .map(line => line.replace(/^\s*-\s*/, '').trim())
        .filter(tag => tag.length > 0);
    }
    
    // Extract sync info
    const syncMatch = yamlData.match(/sync:\s*\n((?:\s{2,}.*\n?)*)/);
    if (syncMatch) {
      const syncData = syncMatch[1];
      metadata.sync = {
        last_sync: this.extractString(syncData, 'last_sync') || new Date().toISOString(),
        sync_source: this.extractString(syncData, 'sync_source') as any || 'obsidian',
        checksum: this.extractString(syncData, 'checksum') || ''
      };
    } else {
      metadata.sync = {
        last_sync: new Date().toISOString(),
        sync_source: 'obsidian',
        checksum: ''
      };
    }
    
    return metadata as FLCMMetadata;
  }
  
  /**
   * Extract string value from YAML section
   */
  private extractString(yamlSection: string, field: string): string | undefined {
    const match = yamlSection.match(new RegExp(`\\s*${field}:\\s*"?([^"\\n]*)"?`));
    return match ? match[1].trim() : undefined;
  }
  
  /**
   * Extract number value from YAML section
   */
  private extractNumber(yamlSection: string, field: string): number | undefined {
    const value = this.extractString(yamlSection, field);
    return value ? parseInt(value, 10) : undefined;
  }
  
  /**
   * Update content with FLCM metadata
   */
  updateMetadata(content: string, metadata: FLCMMetadata): string {
    const frontmatterMatch = content.match(/^(---\n[\s\S]*?\n---)([\s\S]*)/);
    
    if (frontmatterMatch) {
      // Update existing frontmatter
      const existingFrontmatter = frontmatterMatch[1];
      const bodyContent = frontmatterMatch[2];
      
      const updatedFrontmatter = this.updateExistingFrontmatter(existingFrontmatter, metadata);
      return updatedFrontmatter + bodyContent;
    } else {
      // Add new frontmatter
      const newFrontmatter = this.createFrontmatter(metadata);
      return newFrontmatter + '\n' + content;
    }
  }
  
  /**
   * Update existing frontmatter with FLCM metadata
   */
  private updateExistingFrontmatter(frontmatter: string, metadata: FLCMMetadata): string {
    // Remove existing FLCM section
    const withoutFlcm = frontmatter.replace(/flcm:\s*\n([\s\S]*?)(?=\n\w|---)/g, '');
    
    // Add new FLCM section before closing ---
    const flcmYaml = this.serializeFlcmMetadata(metadata);
    
    return withoutFlcm.replace(/\n---$/, `\nflcm:\n${flcmYaml}\n---`);
  }
  
  /**
   * Create new frontmatter with FLCM metadata
   */
  private createFrontmatter(metadata: FLCMMetadata): string {
    const flcmYaml = this.serializeFlcmMetadata(metadata);
    
    return `---
flcm:
${flcmYaml}
---`;
  }
  
  /**
   * Serialize FLCM metadata to YAML
   */
  private serializeFlcmMetadata(metadata: FLCMMetadata): string {
    const lines: string[] = [];
    
    // Basic fields
    lines.push(`  version: "${metadata.version}"`);
    if (metadata.layer) {
      lines.push(`  layer: "${metadata.layer}"`);
    }
    if (metadata.framework) {
      lines.push(`  framework: "${metadata.framework}"`);
    }
    lines.push(`  timestamp: "${metadata.timestamp}"`);
    lines.push(`  session_id: "${metadata.session_id}"`);
    
    // Metadata object
    if (metadata.metadata && Object.keys(metadata.metadata).length > 0) {
      lines.push('  metadata:');
      if (metadata.metadata.depth_level !== undefined) {
        lines.push(`    depth_level: ${metadata.metadata.depth_level}`);
      }
      if (metadata.metadata.voice_profile) {
        lines.push(`    voice_profile: "${metadata.metadata.voice_profile}"`);
      }
      if (metadata.metadata.audience) {
        lines.push(`    audience: "${metadata.metadata.audience}"`);
      }
      if (metadata.metadata.core_message) {
        lines.push(`    core_message: "${metadata.metadata.core_message}"`);
      }
      if (metadata.metadata.learning_objective) {
        lines.push(`    learning_objective: "${metadata.metadata.learning_objective}"`);
      }
    }
    
    // Connections array
    if (metadata.connections && metadata.connections.length > 0) {
      lines.push('  connections:');
      for (const conn of metadata.connections) {
        lines.push(`    - "${conn}"`);
      }
    }
    
    // Tags array
    if (metadata.tags && metadata.tags.length > 0) {
      lines.push('  tags:');
      for (const tag of metadata.tags) {
        lines.push(`    - "${tag}"`);
      }
    }
    
    // Sync info
    if (metadata.sync) {
      lines.push('  sync:');
      lines.push(`    last_sync: "${metadata.sync.last_sync}"`);
      lines.push(`    sync_source: "${metadata.sync.sync_source}"`);
      lines.push(`    checksum: "${metadata.sync.checksum}"`);
    }
    
    return lines.join('\n');
  }
  
  /**
   * Create template for new FLCM document
   */
  async createTemplate(options?: {
    layer?: string;
    framework?: string;
    audience?: string;
  }): Promise<string> {
    const metadata: FLCMMetadata = {
      version: '2.0',
      layer: options?.layer as any || 'mentor',
      framework: options?.framework || 'socratic',
      timestamp: new Date().toISOString(),
      session_id: uuidv4(),
      metadata: {
        audience: options?.audience || 'general',
        core_message: '',
        learning_objective: ''
      },
      connections: [],
      tags: ['#flcm/new'],
      sync: {
        last_sync: new Date().toISOString(),
        sync_source: 'obsidian',
        checksum: ''
      }
    };
    
    const frontmatter = this.createFrontmatter(metadata);
    
    return `${frontmatter}

# New FLCM Document

## Core Message


## Content


## Reflections


## Next Steps

`;
  }
  
  /**
   * Update content for sync
   */
  async updateForSync(
    content: string,
    syncSource: 'obsidian' | 'flcm',
    modifiedTime?: number
  ): Promise<string> {
    let metadata = this.extractMetadata(content);
    
    if (!metadata) {
      // Create minimal metadata for sync
      metadata = {
        version: '2.0',
        layer: 'mentor',
        framework: 'general',
        timestamp: new Date().toISOString(),
        session_id: uuidv4(),
        metadata: {},
        connections: [],
        tags: [],
        sync: {
          last_sync: new Date().toISOString(),
          sync_source: syncSource,
          checksum: ''
        }
      };
    } else {
      // Update sync info
      metadata.sync = {
        ...metadata.sync,
        last_sync: new Date(modifiedTime || Date.now()).toISOString(),
        sync_source: syncSource,
        checksum: ''
      };
    }
    
    // Calculate checksum after metadata update
    const updatedContent = this.updateMetadata(content, metadata);
    const checksum = require('crypto')
      .createHash('md5')
      .update(updatedContent, 'utf8')
      .digest('hex');
    
    metadata.sync.checksum = checksum;
    
    return this.updateMetadata(content, metadata);
  }
  
  /**
   * Validate FLCM metadata
   */
  validateMetadata(metadata: FLCMMetadata): boolean {
    // Check required fields
    if (!metadata.version || metadata.version !== '2.0') {
      return false;
    }
    
    if (!metadata.timestamp) {
      return false;
    }
    
    if (!metadata.session_id) {
      return false;
    }
    
    // Validate layer
    if (metadata.layer && !['mentor', 'creator', 'publisher'].includes(metadata.layer)) {
      return false;
    }
    
    // Validate sync source
    if (metadata.sync && !['obsidian', 'flcm'].includes(metadata.sync.sync_source)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get metadata summary
   */
  getMetadataSummary(content: string): any {
    const metadata = this.extractMetadata(content);
    
    if (!metadata) {
      return {
        hasFlcmMetadata: false,
        valid: false
      };
    }
    
    return {
      hasFlcmMetadata: true,
      valid: this.validateMetadata(metadata),
      layer: metadata.layer,
      framework: metadata.framework,
      tagCount: metadata.tags?.length || 0,
      connectionCount: metadata.connections?.length || 0,
      lastSync: metadata.sync?.last_sync,
      syncSource: metadata.sync?.sync_source
    };
  }
}