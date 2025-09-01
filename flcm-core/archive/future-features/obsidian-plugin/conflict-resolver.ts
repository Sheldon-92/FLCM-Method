/**
 * Conflict Resolver
 * Handles merge conflicts between Obsidian and FLCM documents
 */

import { FLCMSettings, Resolution, MergeResult, ConflictMarker } from './types';

export class ConflictResolver {
  private settings: FLCMSettings;
  
  constructor(settings: FLCMSettings) {
    this.settings = settings;
  }
  
  /**
   * Resolve conflict between base, local, and remote content
   */
  async resolve(base: string, local: string, remote: string): Promise<Resolution> {
    // Try automatic three-way merge
    const merged = this.threeWayMerge(base, local, remote);
    
    if (merged.conflicts.length === 0) {
      return {
        type: 'auto',
        content: merged.result
      };
    }
    
    // Apply resolution rules based on settings
    const ruleBasedResolution = this.applyResolutionRules(merged);
    if (ruleBasedResolution) {
      return {
        type: 'auto',
        content: ruleBasedResolution
      };
    }
    
    // Generate suggestions for manual resolution
    const suggestions = this.generateSuggestions(merged.conflicts, local, remote);
    
    return {
      type: 'manual',
      conflicts: merged.conflicts,
      suggestions
    };
  }
  
  /**
   * Three-way merge algorithm
   */
  private threeWayMerge(base: string, local: string, remote: string): MergeResult {
    const baseLines = base.split('\n');
    const localLines = local.split('\n');
    const remoteLines = remote.split('\n');
    
    const result: string[] = [];
    const conflicts: ConflictMarker[] = [];
    
    // Simple line-by-line comparison
    const maxLines = Math.max(baseLines.length, localLines.length, remoteLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const baseLine = baseLines[i] || '';
      const localLine = localLines[i] || '';
      const remoteLine = remoteLines[i] || '';
      
      if (localLine === remoteLine) {
        // No conflict - both sides have same content
        result.push(localLine);
      } else if (localLine === baseLine) {
        // Local unchanged, remote changed - use remote
        result.push(remoteLine);
      } else if (remoteLine === baseLine) {
        // Remote unchanged, local changed - use local
        result.push(localLine);
      } else {
        // Both changed differently - conflict
        const conflictStart = result.length;
        
        result.push(`<<<<<<< Local (Obsidian)`);
        result.push(localLine);
        result.push(`=======`);
        result.push(remoteLine);
        result.push(`>>>>>>> Remote (FLCM)`);
        
        conflicts.push({
          startLine: conflictStart,
          endLine: result.length - 1,
          type: 'both',
          description: `Line ${i + 1}: Both local and remote have changes`
        });
      }
    }
    
    return {
      result: result.join('\n'),
      conflicts,
      success: conflicts.length === 0
    };
  }
  
  /**
   * Apply automatic resolution rules
   */
  private applyResolutionRules(mergeResult: MergeResult): string | null {
    if (mergeResult.conflicts.length === 0) {
      return mergeResult.result;
    }
    
    switch (this.settings.conflictResolution) {
      case 'local':
        return this.resolveWithPreference(mergeResult, 'local');
      
      case 'remote':
        return this.resolveWithPreference(mergeResult, 'remote');
      
      case 'newest':
        // This would require timestamp comparison
        // For now, fall back to manual resolution
        return null;
      
      case 'ask':
      default:
        return null;
    }
  }
  
  /**
   * Resolve conflicts with preference
   */
  private resolveWithPreference(mergeResult: MergeResult, preference: 'local' | 'remote'): string {
    const lines = mergeResult.result.split('\n');
    const resolved: string[] = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      if (line.startsWith('<<<<<<< Local')) {
        // Found conflict marker - resolve based on preference
        i++; // Skip conflict marker
        
        const localLines: string[] = [];
        const remoteLines: string[] = [];
        
        // Collect local lines
        while (i < lines.length && !lines[i].startsWith('=======')) {
          localLines.push(lines[i]);
          i++;
        }
        
        i++; // Skip separator
        
        // Collect remote lines
        while (i < lines.length && !lines[i].startsWith('>>>>>>> Remote')) {
          remoteLines.push(lines[i]);
          i++;
        }
        
        // Add preferred version
        if (preference === 'local') {
          resolved.push(...localLines);
        } else {
          resolved.push(...remoteLines);
        }
        
        i++; // Skip closing marker
      } else {
        resolved.push(line);
        i++;
      }
    }
    
    return resolved.join('\n');
  }
  
  /**
   * Generate suggestions for manual resolution
   */
  private generateSuggestions(
    conflicts: ConflictMarker[],
    local: string,
    remote: string
  ): string[] {
    const suggestions: string[] = [];
    
    // Analyze conflict types
    const contentConflicts = conflicts.filter(c => c.type === 'both');
    const localOnlyChanges = conflicts.filter(c => c.type === 'local');
    const remoteOnlyChanges = conflicts.filter(c => c.type === 'remote');
    
    if (contentConflicts.length > 0) {
      suggestions.push('Multiple sections have conflicting changes');
      suggestions.push('Review each conflict marker carefully');
      
      // Check if one side has more comprehensive changes
      const localLineCount = local.split('\n').length;
      const remoteLineCount = remote.split('\n').length;
      
      if (Math.abs(localLineCount - remoteLineCount) > 5) {
        const longerSide = localLineCount > remoteLineCount ? 'local' : 'remote';
        suggestions.push(`${longerSide} version has significantly more content`);
      }
    }
    
    // Check for metadata conflicts
    if (this.hasMetadataConflicts(local, remote)) {
      suggestions.push('FLCM metadata conflicts detected');
      suggestions.push('Consider merging metadata manually');
    }
    
    // Check for link conflicts
    const localLinks = this.extractLinks(local);
    const remoteLinks = this.extractLinks(remote);
    
    if (localLinks.length !== remoteLinks.length) {
      suggestions.push('Different number of internal links');
      suggestions.push('Verify all important connections are preserved');
    }
    
    return suggestions;
  }
  
  /**
   * Check for metadata conflicts
   */
  private hasMetadataConflicts(local: string, remote: string): boolean {
    const localMeta = this.extractMetadata(local);
    const remoteMeta = this.extractMetadata(remote);
    
    if (!localMeta || !remoteMeta) {
      return false;
    }
    
    // Check key fields
    const keyFields = ['layer', 'framework', 'core_message'];
    
    for (const field of keyFields) {
      if (localMeta[field] && remoteMeta[field] && localMeta[field] !== remoteMeta[field]) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Extract Obsidian links from content
   */
  private extractLinks(content: string): string[] {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const links: string[] = [];
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[1]);
    }
    
    return links;
  }
  
  /**
   * Extract basic metadata from content
   */
  private extractMetadata(content: string): any {
    try {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const yamlContent = frontmatterMatch[1];
        
        // Simple key-value extraction
        const metadata: any = {};
        const lines = yamlContent.split('\n');
        
        for (const line of lines) {
          const match = line.match(/^\s*(\w+):\s*(.*)$/);
          if (match) {
            metadata[match[1]] = match[2].replace(/^["']|["']$/g, '');
          }
        }
        
        return metadata;
      }
    } catch (error) {
      console.warn('Failed to extract metadata for conflict resolution:', error);
    }
    
    return null;
  }
  
  /**
   * Create conflict markers for content sections
   */
  createConflictMarkers(
    localContent: string,
    remoteContent: string,
    conflictType: string
  ): string {
    return `<<<<<<< Local (Obsidian) - ${conflictType}
${localContent}
=======
${remoteContent}
>>>>>>> Remote (FLCM) - ${conflictType}`;
  }
  
  /**
   * Validate resolved content
   */
  validateResolution(content: string): boolean {
    // Check that all conflict markers are resolved
    const hasConflictMarkers = /<<<<<<< |>>>>>>> |=======/g.test(content);
    
    if (hasConflictMarkers) {
      return false;
    }
    
    // Check that frontmatter is valid
    try {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        // Basic YAML validation
        const yamlContent = frontmatterMatch[1];
        if (yamlContent.includes('<<<<<<') || yamlContent.includes('>>>>>>')) {
          return false;
        }
      }
    } catch (error) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get conflict statistics
   */
  getConflictStats(conflicts: ConflictMarker[]): any {
    return {
      totalConflicts: conflicts.length,
      localOnlyConflicts: conflicts.filter(c => c.type === 'local').length,
      remoteOnlyConflicts: conflicts.filter(c => c.type === 'remote').length,
      bothSidesConflicts: conflicts.filter(c => c.type === 'both').length
    };
  }
}