/**
 * Scholar Agent
 * Deep learning and multi-source analysis agent
 */

import { EventEmitter } from 'events';
import { BaseAgent } from '../base-agent';
import { AgentState, AgentCapability, AgentRequest, AgentResponse } from '../types';
import { 
  InsightsDocument, 
  InsightsMetadata, 
  DocumentStage,
  SourceType,
  createInsightsDocument 
} from '../../shared/pipeline/document-schema';
import { Framework } from '../../shared/config/config-schema';
import { createLogger } from '../../shared/utils/logger';

// Import processors
import { TextProcessor } from './processors/text-processor';
import { PDFProcessor } from './processors/pdf-processor';
import { WebProcessor } from './processors/web-processor';
import { MediaProcessor } from './processors/media-processor';
import { CodeProcessor } from './processors/code-processor';

// Import frameworks
import { SWOTUSEDFramework } from './frameworks/swot-used';
import { SCAMPERFramework } from './frameworks/scamper';
import { SocraticFramework } from './frameworks/socratic';
import { FiveW2HFramework } from './frameworks/five-w-two-h';
import { PyramidFramework } from './frameworks/pyramid';

const logger = createLogger('ScholarAgent');

/**
 * Scholar input configuration
 */
export interface ScholarInput {
  source: string | Buffer | any;
  type?: SourceType;
  frameworks?: Framework[];
  options?: AnalysisOptions;
}

/**
 * Analysis options
 */
export interface AnalysisOptions {
  maxProcessingTime?: number;
  parallelFrameworks?: boolean;
  cacheResults?: boolean;
  extractCitations?: boolean;
  generateSummary?: boolean;
}

/**
 * Framework analysis result
 */
export interface FrameworkResult {
  framework: Framework;
  results: any;
  confidence: number;
  processingTime: number;
  insights: string[];
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  totalAnalyses: number;
  averageProcessingTime: number;
  frameworkUsage: Record<Framework, number>;
  inputTypeDistribution: Record<SourceType, number>;
  errorRate: number;
}

/**
 * Scholar Agent Implementation
 */
export class ScholarAgent extends BaseAgent {
  public readonly id = 'scholar';
  public readonly name = 'Scholar Agent';
  public readonly version = '2.0.0';
  
  private processors: Map<SourceType, any> = new Map();
  private frameworks: Map<Framework, any> = new Map();
  private metrics: PerformanceMetrics;
  private processingCache: Map<string, InsightsDocument> = new Map();

  constructor() {
    super();
    this.metrics = this.initializeMetrics();
    this.initializeProcessors();
    this.initializeFrameworks();
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): AgentCapability[] {
    return [
      {
        id: 'multi-source-analysis',
        name: 'Multi-Source Analysis',
        description: 'Analyze various input types',
        inputTypes: Object.values(SourceType),
        outputTypes: ['insights'],
      },
      {
        id: 'framework-analysis',
        name: 'Framework Analysis',
        description: 'Apply professional analysis frameworks',
        inputTypes: ['text'],
        outputTypes: ['analysis'],
      },
    ];
  }

  /**
   * Initialize input processors
   */
  private initializeProcessors(): void {
    this.processors.set(SourceType.TEXT, new TextProcessor());
    this.processors.set(SourceType.MARKDOWN, new TextProcessor());
    this.processors.set(SourceType.PDF, new PDFProcessor());
    this.processors.set(SourceType.WEBPAGE, new WebProcessor());
    this.processors.set(SourceType.VIDEO, new MediaProcessor());
    this.processors.set(SourceType.AUDIO, new MediaProcessor());
    this.processors.set(SourceType.IMAGE, new MediaProcessor());
    this.processors.set(SourceType.CODE, new CodeProcessor());
    this.processors.set(SourceType.SPREADSHEET, new CodeProcessor());
  }

  /**
   * Initialize analysis frameworks
   */
  private initializeFrameworks(): void {
    this.frameworks.set('SWOT-USED', new SWOTUSEDFramework());
    this.frameworks.set('SCAMPER', new SCAMPERFramework());
    this.frameworks.set('Socratic', new SocraticFramework());
    this.frameworks.set('5W2H', new FiveW2HFramework());
    this.frameworks.set('Pyramid', new PyramidFramework());
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      totalAnalyses: 0,
      averageProcessingTime: 0,
      frameworkUsage: {} as Record<Framework, number>,
      inputTypeDistribution: {} as Record<SourceType, number>,
      errorRate: 0,
    };
  }

  /**
   * Main analysis method
   */
  async analyze(input: ScholarInput): Promise<InsightsDocument> {
    const startTime = Date.now();
    
    try {
      // Validate input
      this.validateInput(input);

      // Detect input type if not provided
      const inputType = input.type || this.detectInputType(input.source);
      
      // Check cache if enabled
      const cacheKey = this.generateCacheKey(input);
      if (input.options?.cacheResults && this.processingCache.has(cacheKey)) {
        logger.info('Returning cached analysis result');
        return this.processingCache.get(cacheKey)!;
      }

      // Extract content from source
      const extractedContent = await this.extractContent(input.source, inputType);

      // Apply frameworks
      const frameworksToApply = input.frameworks || ['SWOT-USED', 'Socratic', '5W2H'];
      const frameworkResults = await this.applyFrameworks(
        extractedContent.text,
        frameworksToApply,
        input.options?.parallelFrameworks ?? true
      );

      // Generate insights document
      const insightsDoc = this.generateInsightsDocument(
        extractedContent,
        frameworkResults,
        inputType
      );

      // Extract citations if requested
      if (input.options?.extractCitations) {
        insightsDoc.references = this.extractCitations(extractedContent.text);
      }

      // Generate summary if requested
      if (input.options?.generateSummary) {
        insightsDoc.summary = this.generateSummary(frameworkResults);
      }

      // Update metrics
      this.updateMetrics(inputType, frameworksToApply, Date.now() - startTime);

      // Cache result if enabled
      if (input.options?.cacheResults) {
        this.processingCache.set(cacheKey, insightsDoc);
      }

      logger.info(`Analysis completed in ${Date.now() - startTime}ms`);
      return insightsDoc;
    } catch (error) {
      logger.error('Analysis failed:', error);
      this.metrics.errorRate++;
      throw error;
    }
  }

  /**
   * Validate input
   */
  private validateInput(input: ScholarInput): void {
    if (!input.source) {
      throw new Error('Input source is required');
    }

    if (input.options?.maxProcessingTime && input.options.maxProcessingTime < 1000) {
      throw new Error('Max processing time must be at least 1000ms');
    }
  }

  /**
   * Detect input type from source
   */
  detectInputType(source: any): SourceType {
    if (typeof source === 'string') {
      // Check if it's a file path or URL
      if (source.startsWith('http://') || source.startsWith('https://')) {
        return SourceType.WEBPAGE;
      }
      if (source.endsWith('.pdf')) {
        return SourceType.PDF;
      }
      if (source.endsWith('.md')) {
        return SourceType.MARKDOWN;
      }
      if (source.endsWith('.mp4') || source.endsWith('.avi')) {
        return SourceType.VIDEO;
      }
      if (source.endsWith('.mp3') || source.endsWith('.wav')) {
        return SourceType.AUDIO;
      }
      if (source.endsWith('.jpg') || source.endsWith('.png')) {
        return SourceType.IMAGE;
      }
      if (source.endsWith('.js') || source.endsWith('.py') || source.endsWith('.ts')) {
        return SourceType.CODE;
      }
      if (source.endsWith('.xlsx') || source.endsWith('.csv')) {
        return SourceType.SPREADSHEET;
      }
      // Default to text
      return SourceType.TEXT;
    }

    if (Buffer.isBuffer(source)) {
      // Try to detect from buffer content
      // This is simplified - in production, use file-type library
      return SourceType.TEXT;
    }

    return SourceType.TEXT;
  }

  /**
   * Extract content from source
   */
  private async extractContent(
    source: any,
    type: SourceType
  ): Promise<{ text: string; metadata: any }> {
    const processor = this.processors.get(type);
    
    if (!processor) {
      throw new Error(`No processor available for type: ${type}`);
    }

    try {
      const result = await processor.process(source);
      return {
        text: result.text,
        metadata: result.metadata || {},
      };
    } catch (error) {
      logger.error(`Content extraction failed for type ${type}:`, error);
      throw new Error(`Failed to extract content from ${type} source`);
    }
  }

  /**
   * Apply analysis frameworks
   */
  private async applyFrameworks(
    content: string,
    frameworks: Framework[],
    parallel: boolean = true
  ): Promise<FrameworkResult[]> {
    if (parallel) {
      // Apply frameworks in parallel
      const promises = frameworks.map(fw => this.applyFramework(content, fw));
      return Promise.all(promises);
    } else {
      // Apply frameworks sequentially
      const results: FrameworkResult[] = [];
      for (const framework of frameworks) {
        const result = await this.applyFramework(content, framework);
        results.push(result);
      }
      return results;
    }
  }

  /**
   * Apply single framework
   */
  async applyFramework(content: string, framework: Framework): Promise<FrameworkResult> {
    const startTime = Date.now();
    const frameworkImpl = this.frameworks.get(framework);

    if (!frameworkImpl) {
      throw new Error(`Framework not implemented: ${framework}`);
    }

    try {
      const results = await frameworkImpl.analyze(content);
      const insights = frameworkImpl.extractInsights(results);

      return {
        framework,
        results,
        confidence: this.calculateConfidence(results),
        processingTime: Date.now() - startTime,
        insights,
      };
    } catch (error) {
      logger.error(`Framework ${framework} failed:`, error);
      throw error;
    }
  }

  /**
   * Calculate confidence score for framework results
   */
  private calculateConfidence(results: any): number {
    // Simple confidence calculation based on result completeness
    if (!results) return 0;

    let filledFields = 0;
    let totalFields = 0;

    const countFields = (obj: any) => {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          totalFields++;
          if (obj[key] && 
              ((Array.isArray(obj[key]) && obj[key].length > 0) || 
               (typeof obj[key] === 'string' && obj[key].trim() !== ''))) {
            filledFields++;
          }
        }
      }
    };

    countFields(results);
    return totalFields > 0 ? filledFields / totalFields : 0;
  }

  /**
   * Generate insights document
   */
  private generateInsightsDocument(
    extractedContent: { text: string; metadata: any },
    frameworkResults: FrameworkResult[],
    inputType: SourceType
  ): InsightsDocument {
    const doc = createInsightsDocument(
      {
        type: inputType,
        path: 'input',
        hash: this.generateHash(extractedContent.text),
      },
      frameworkResults.map(r => r.framework),
      this.formatInsightsContent(frameworkResults),
      'Scholar Agent'
    );

    // Add analysis results
    doc.analysisResults = frameworkResults.map(r => ({
      framework: r.framework,
      results: r.results,
      confidence: r.confidence,
      processingTime: r.processingTime,
    }));

    // Extract key findings
    doc.keyFindings = this.extractKeyFindings(frameworkResults);

    // Add recommendations
    doc.recommendations = this.generateRecommendations(frameworkResults);

    return doc;
  }

  /**
   * Format insights content as markdown
   */
  private formatInsightsContent(results: FrameworkResult[]): string {
    const sections: string[] = [];

    sections.push('# Insights Analysis\n');
    sections.push(`Generated: ${new Date().toISOString()}\n`);

    for (const result of results) {
      sections.push(`## ${result.framework} Analysis\n`);
      sections.push(`**Confidence**: ${(result.confidence * 100).toFixed(1)}%\n`);
      sections.push(`**Processing Time**: ${result.processingTime}ms\n`);
      
      sections.push('### Insights\n');
      for (const insight of result.insights) {
        sections.push(`- ${insight}`);
      }
      sections.push('');
    }

    return sections.join('\n');
  }

  /**
   * Extract key findings from framework results
   */
  private extractKeyFindings(results: FrameworkResult[]): string[] {
    const allInsights = results.flatMap(r => r.insights);
    
    // Simple extraction - take top insights with highest confidence
    const topResults = results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);

    return topResults.flatMap(r => r.insights.slice(0, 2));
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(results: FrameworkResult[]): string[] {
    const recommendations: string[] = [];

    // Generate recommendations based on framework results
    for (const result of results) {
      if (result.framework === 'SWOT-USED' && result.results.weaknesses) {
        recommendations.push(`Address identified weaknesses: ${result.results.weaknesses.slice(0, 2).join(', ')}`);
      }
      if (result.framework === 'SCAMPER' && result.results.adapt) {
        recommendations.push(`Consider adaptations: ${result.results.adapt.slice(0, 2).join(', ')}`);
      }
    }

    return recommendations;
  }

  /**
   * Extract citations from content
   */
  private extractCitations(content: string): string[] {
    const citations: string[] = [];
    
    // Simple citation extraction patterns
    const patterns = [
      /\[(\d+)\]/g,                    // [1] style
      /\(([^)]+, \d{4})\)/g,          // (Author, Year) style
      /https?:\/\/[^\s]+/g,           // URLs
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        citations.push(...matches);
      }
    }

    return [...new Set(citations)]; // Remove duplicates
  }

  /**
   * Generate summary from framework results
   */
  private generateSummary(results: FrameworkResult[]): string {
    const summaryParts: string[] = [];

    summaryParts.push('Analysis Summary:');
    summaryParts.push(`Applied ${results.length} frameworks with average confidence of ${
      (results.reduce((sum, r) => sum + r.confidence, 0) / results.length * 100).toFixed(1)
    }%.`);

    const topInsights = results
      .flatMap(r => r.insights)
      .slice(0, 3);

    summaryParts.push('Key insights: ' + topInsights.join('; '));

    return summaryParts.join(' ');
  }

  /**
   * Generate cache key for input
   */
  private generateCacheKey(input: ScholarInput): string {
    const source = typeof input.source === 'string' ? input.source : 'buffer';
    const frameworks = (input.frameworks || []).sort().join(',');
    return `${source}-${frameworks}`;
  }

  /**
   * Generate simple hash
   */
  private generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(
    inputType: SourceType,
    frameworks: Framework[],
    processingTime: number
  ): void {
    this.metrics.totalAnalyses++;
    
    // Update average processing time
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (this.metrics.totalAnalyses - 1) + processingTime) / 
      this.metrics.totalAnalyses;

    // Update input type distribution
    this.metrics.inputTypeDistribution[inputType] = 
      (this.metrics.inputTypeDistribution[inputType] || 0) + 1;

    // Update framework usage
    for (const framework of frameworks) {
      this.metrics.frameworkUsage[framework] = 
        (this.metrics.frameworkUsage[framework] || 0) + 1;
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Process agent request
   */
  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    try {
      const input: ScholarInput = {
        source: request.data.source,
        type: request.data.type,
        frameworks: request.data.frameworks,
        options: request.data.options,
      };

      const result = await this.analyze(input);

      return {
        success: true,
        data: result,
        metadata: {
          processingTime: Date.now() - request.timestamp.getTime(),
          agent: this.id,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        metadata: {
          agent: this.id,
        },
      };
    }
  }

  /**
   * Initialize agent
   */
  protected async onInitialize(): Promise<void> {
    logger.info('Scholar Agent initializing...');
    // Additional initialization if needed
  }

  /**
   * Start agent
   */
  protected async onStart(): Promise<void> {
    logger.info('Scholar Agent started');
  }

  /**
   * Stop agent
   */
  protected async onStop(): Promise<void> {
    logger.info('Scholar Agent stopping...');
    // Clear cache
    this.processingCache.clear();
  }

  /**
   * Clean up resources
   */
  protected async onShutdown(): Promise<void> {
    logger.info('Scholar Agent shutting down...');
    // Clean up processors and frameworks
    this.processors.clear();
    this.frameworks.clear();
  }
}

// Export singleton instance
export const scholarAgent = new ScholarAgent();