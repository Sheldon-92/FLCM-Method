/**
 * Document Converter
 * Bidirectional conversion between v1 and v2 formats
 */

import { V1Document, V1AgentOutput } from '../schemas/v1-schemas';
import { V2LayerDocument, V2DocumentType } from '../schemas/v2-schemas';
import { getMappingRules, MappingRule } from '../schemas/mapping-rules';
import { SchemaVersionManager } from '../schemas/versioning';
import { Logger } from '../../shared/utils/logger';

export interface ConversionResult {
  success: boolean;
  document?: any;
  errors?: string[];
  warnings?: string[];
  dataLoss?: string[];
}

export class DocumentConverter {
  private versionManager: SchemaVersionManager;
  private logger: Logger;
  
  constructor() {
    this.versionManager = new SchemaVersionManager();
    this.logger = new Logger('DocumentConverter');
  }
  
  /**
   * Convert document between versions
   */
  async convert(
    document: any,
    targetVersion: '1.0' | '2.0'
  ): Promise<ConversionResult> {
    try {
      const sourceVersion = this.versionManager.detectVersion(document);
      
      if (sourceVersion === targetVersion) {
        return {
          success: true,
          document,
          warnings: ['Document already in target version']
        };
      }
      
      this.logger.info(`Converting document from v${sourceVersion} to v${targetVersion}`);
      
      if (targetVersion === '2.0') {
        return this.convertToV2(document);
      } else {
        return this.convertToV1(document);
      }
    } catch (error) {
      this.logger.error('Conversion failed', { error: error.message });
      return {
        success: false,
        errors: [error.message]
      };
    }
  }
  
  /**
   * Convert v1 document to v2
   */
  private async convertToV2(v1Doc: V1Document): Promise<ConversionResult> {
    const warnings: string[] = [];
    const dataLoss: string[] = [];
    
    try {
      // Determine target document type based on agent
      const agentType = this.getAgentType(v1Doc);
      const targetType = this.mapAgentToLayer(agentType);
      
      // Get mapping rules
      const mappingRules = getMappingRules('1.0', agentType);
      
      // Create base v2 document
      const v2Doc: any = {
        version: '2.0',
        type: targetType,
        timestamp: v1Doc.created_at || new Date().toISOString(),
        metadata: {
          session_id: v1Doc.session_id,
          converted_from: 'v1.0',
          original_agent: agentType
        }
      };
      
      // Apply mapping rules
      const sourceData = v1Doc.data as any;
      for (const rule of mappingRules) {
        const value = this.getNestedValue(sourceData, rule.source);
        
        if (value !== undefined) {
          const transformedValue = rule.transform ? rule.transform(value) : value;
          this.setNestedValue(v2Doc, rule.target, transformedValue);
        } else if (rule.defaultValue !== undefined) {
          this.setNestedValue(v2Doc, rule.target, rule.defaultValue);
          warnings.push(`Used default value for ${rule.target}`);
        }
      }
      
      // Add frontmatter for Obsidian compatibility
      v2Doc.frontmatter = this.generateFrontmatter(v2Doc, targetType);
      
      // Check for data loss
      const lostFields = this.checkDataLoss(sourceData, v2Doc, mappingRules);
      if (lostFields.length > 0) {
        dataLoss.push(...lostFields);
      }
      
      // Add version metadata
      const versionedDoc = this.versionManager.addVersionMetadata(v2Doc, '2.0.0');
      
      return {
        success: true,
        document: versionedDoc,
        warnings,
        dataLoss: dataLoss.length > 0 ? dataLoss : undefined
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Conversion to v2 failed: ${error.message}`]
      };
    }
  }
  
  /**
   * Convert v2 document to v1
   */
  private async convertToV1(v2Doc: V2LayerDocument): Promise<ConversionResult> {
    const warnings: string[] = [];
    const dataLoss: string[] = [];
    
    try {
      // Determine target agent type based on layer
      const layerType = this.getLayerType(v2Doc);
      const targetAgent = this.mapLayerToAgent(layerType);
      
      // Get mapping rules
      const mappingRules = getMappingRules('2.0', layerType);
      
      // Create base v1 document
      const v1Doc: any = {
        version: '1.0',
        agent: targetAgent,
        timestamp: v2Doc.created_at || new Date().toISOString(),
        id: v2Doc.id,
        session_id: v2Doc.session_id
      };
      
      // Apply mapping rules
      const sourceData = v2Doc.data as any;
      for (const rule of mappingRules) {
        const value = this.getNestedValue(sourceData, rule.source);
        
        if (value !== undefined) {
          const transformedValue = rule.transform ? rule.transform(value) : value;
          this.setNestedValue(v1Doc, rule.target, transformedValue);
        } else if (rule.defaultValue !== undefined) {
          this.setNestedValue(v1Doc, rule.target, rule.defaultValue);
          warnings.push(`Used default value for ${rule.target}`);
        }
      }
      
      // Fill in required v1 fields with defaults if missing
      this.fillV1Defaults(v1Doc, targetAgent);
      
      // Check for data loss
      const lostFields = this.checkDataLoss(sourceData, v1Doc, mappingRules);
      if (lostFields.length > 0) {
        dataLoss.push(...lostFields);
        warnings.push('Some v2 features cannot be represented in v1 format');
      }
      
      // Add version metadata
      const versionedDoc = this.versionManager.addVersionMetadata(v1Doc, '1.1.0');
      
      return {
        success: true,
        document: versionedDoc,
        warnings,
        dataLoss: dataLoss.length > 0 ? dataLoss : undefined
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Conversion to v1 failed: ${error.message}`]
      };
    }
  }
  
  /**
   * Validate conversion result
   */
  validateConversion(
    source: any,
    target: any,
    targetVersion: string
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Validate structure
    const validation = this.versionManager.validateDocument(target, targetVersion);
    if (!validation.valid) {
      issues.push(...validation.errors);
    }
    
    // Check critical fields preservation
    const criticalFields = this.getCriticalFields(targetVersion);
    for (const field of criticalFields) {
      if (!this.hasValue(target, field)) {
        issues.push(`Missing critical field: ${field}`);
      }
    }
    
    // Check content integrity
    if (source.content && target.body) {
      const sourceLength = source.content.length;
      const targetLength = target.body.length;
      const difference = Math.abs(sourceLength - targetLength) / sourceLength;
      
      if (difference > 0.1) {
        issues.push(`Content length difference > 10%: ${(difference * 100).toFixed(2)}%`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
  
  // Helper methods
  
  private getAgentType(v1Doc: V1Document): string {
    if ('agent' in v1Doc.data) {
      return v1Doc.data.agent;
    }
    return v1Doc.pipeline_stage || 'collector';
  }
  
  private getLayerType(v2Doc: V2LayerDocument): string {
    if ('type' in v2Doc.data) {
      return v2Doc.data.type;
    }
    return 'insights';
  }
  
  private mapAgentToLayer(agent: string): string {
    const mapping: Record<string, string> = {
      'collector': 'insights',
      'scholar': 'knowledge',
      'creator': 'content',
      'adapter': 'publisher'
    };
    return mapping[agent] || 'insights';
  }
  
  private mapLayerToAgent(layer: string): string {
    const mapping: Record<string, string> = {
      'insights': 'collector',
      'knowledge': 'scholar',
      'content': 'creator',
      'publisher': 'adapter'
    };
    return mapping[layer] || 'collector';
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
  
  private hasValue(obj: any, path: string): boolean {
    const value = this.getNestedValue(obj, path);
    return value !== undefined && value !== null && value !== '';
  }
  
  private generateFrontmatter(doc: any, type: string): any {
    return {
      title: doc.title || `${type} - ${new Date().toLocaleDateString()}`,
      created: doc.timestamp,
      modified: new Date().toISOString(),
      tags: [`flcm/${type}`, 'flcm/v2'],
      type,
      version: '2.0'
    };
  }
  
  private fillV1Defaults(v1Doc: any, agent: string): void {
    // Add default structures based on agent type
    switch (agent) {
      case 'collector':
        if (!v1Doc.rice_scores) {
          v1Doc.rice_scores = { reach: 50, impact: 50, confidence: 50, effort: 50, total: 50 };
        }
        break;
      case 'scholar':
        if (!v1Doc.level) {
          v1Doc.level = 3;
        }
        break;
      case 'creator':
        if (!v1Doc.voice_dna) {
          v1Doc.voice_dna = { tone: [], style: [], vocabulary_level: 'medium' };
        }
        break;
      case 'adapter':
        if (!v1Doc.platforms) {
          v1Doc.platforms = {};
        }
        break;
    }
  }
  
  private checkDataLoss(source: any, target: any, rules: MappingRule[]): string[] {
    const lostFields: string[] = [];
    const mappedSourceFields = new Set(rules.map(r => r.source));
    
    // Check which source fields weren't mapped
    const checkObject = (obj: any, prefix: string = '') => {
      for (const key in obj) {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          checkObject(obj[key], fullPath);
        } else if (!mappedSourceFields.has(fullPath)) {
          lostFields.push(fullPath);
        }
      }
    };
    
    checkObject(source);
    return lostFields;
  }
  
  private getCriticalFields(version: string): string[] {
    if (version.startsWith('1.')) {
      return ['version', 'agent', 'timestamp'];
    } else {
      return ['version', 'type', 'timestamp', 'metadata'];
    }
  }
}