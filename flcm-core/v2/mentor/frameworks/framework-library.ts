/**
 * Framework Library
 * Central registry and selector for all frameworks
 */

import { BaseFramework, FrameworkContext } from './base';

// Import legacy frameworks
import { RICEFramework } from './legacy/rice-framework';
import { TeachingPreparationFramework } from './legacy/teaching-prep-framework';
import { VoiceDNAFramework } from './legacy/voice-dna-framework';

// Import core frameworks
import { SWOTUSEDFramework } from './core/swot-used-framework';
import { SCAMPERFramework } from './core/scamper-framework';
import { SocraticQuestioningFramework } from './core/socratic-questioning-framework';
import { FiveW2HFramework } from './core/five-w2h-framework';
import { PyramidPrincipleFramework } from './core/pyramid-principle-framework';

export interface FrameworkRecommendation {
  framework: BaseFramework;
  score: number;
  reason: string;
}

export class FrameworkLibrary {
  private frameworks: Map<string, BaseFramework>;
  private legacyMappings: Map<string, string>;
  
  constructor() {
    this.frameworks = new Map();
    this.legacyMappings = new Map();
    this.initializeFrameworks();
    this.setupLegacyMappings();
  }
  
  /**
   * Initialize all available frameworks
   */
  private initializeFrameworks(): void {
    // Legacy frameworks (1.0)
    this.registerFramework('rice', new RICEFramework());
    this.registerFramework('teaching_prep', new TeachingPreparationFramework());
    this.registerFramework('voice_dna', new VoiceDNAFramework());
    
    // New core frameworks (2.0)
    this.registerFramework('swot_used', new SWOTUSEDFramework());
    this.registerFramework('scamper', new SCAMPERFramework());
    this.registerFramework('socratic', new SocraticQuestioningFramework());
    this.registerFramework('five_w2h', new FiveW2HFramework());
    this.registerFramework('pyramid', new PyramidPrincipleFramework());
  }
  
  /**
   * Setup legacy command mappings for backward compatibility
   */
  private setupLegacyMappings(): void {
    // Map old commands to framework names
    this.legacyMappings.set('collect with rice', 'rice');
    this.legacyMappings.set('teach mode', 'teaching_prep');
    this.legacyMappings.set('analyze voice', 'voice_dna');
    this.legacyMappings.set('deep dive', 'socratic');
    this.legacyMappings.set('prioritize ideas', 'rice');
    this.legacyMappings.set('structure thoughts', 'pyramid');
    this.legacyMappings.set('innovate', 'scamper');
    this.legacyMappings.set('analyze strategy', 'swot_used');
    this.legacyMappings.set('comprehensive analysis', 'five_w2h');
  }
  
  /**
   * Register a framework in the library
   */
  private registerFramework(id: string, framework: BaseFramework): void {
    this.frameworks.set(id, framework);
  }
  
  /**
   * Get a specific framework by ID
   */
  getFramework(id: string): BaseFramework | undefined {
    return this.frameworks.get(id);
  }
  
  /**
   * Get all available frameworks
   */
  getAllFrameworks(): BaseFramework[] {
    return Array.from(this.frameworks.values());
  }
  
  /**
   * Get frameworks by category
   */
  getFrameworksByCategory(category: string): BaseFramework[] {
    return this.getAllFrameworks().filter(f => f.category === category);
  }
  
  /**
   * Get frameworks by tag
   */
  getFrameworksByTag(tag: string): BaseFramework[] {
    return this.getAllFrameworks().filter(f => f.tags.includes(tag));
  }
  
  /**
   * Select best framework based on context
   */
  selectFramework(context: FrameworkContext): FrameworkRecommendation[] {
    const recommendations: FrameworkRecommendation[] = [];
    
    // Analyze context for keywords and intent
    const intent = this.analyzeIntent(context);
    
    // Score each framework
    this.frameworks.forEach((framework, id) => {
      const score = this.scoreFramework(framework, context, intent);
      if (score > 0) {
        recommendations.push({
          framework,
          score,
          reason: this.generateReason(framework, context, intent)
        });
      }
    });
    
    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);
    
    // Return top 3 recommendations
    return recommendations.slice(0, 3);
  }
  
  /**
   * Handle legacy command
   */
  handleLegacyCommand(command: string): BaseFramework | undefined {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Check direct mappings
    if (this.legacyMappings.has(normalizedCommand)) {
      const frameworkId = this.legacyMappings.get(normalizedCommand)!;
      console.log(`[Legacy Command] Mapping "${command}" to framework: ${frameworkId}`);
      return this.frameworks.get(frameworkId);
    }
    
    // Check partial matches
    for (const [legacyCmd, frameworkId] of this.legacyMappings.entries()) {
      if (normalizedCommand.includes(legacyCmd) || legacyCmd.includes(normalizedCommand)) {
        console.log(`[Legacy Command] Partial match "${command}" to framework: ${frameworkId}`);
        return this.frameworks.get(frameworkId);
      }
    }
    
    return undefined;
  }
  
  /**
   * Analyze user intent from context
   */
  private analyzeIntent(context: FrameworkContext): string {
    if (!context.topic && !context.goal) return 'general';
    
    const text = `${context.topic || ''} ${context.goal || ''}`.toLowerCase();
    
    // Identify primary intent
    if (text.includes('prioritize') || text.includes('decide') || text.includes('choose')) {
      return 'prioritization';
    } else if (text.includes('understand') || text.includes('learn') || text.includes('teach')) {
      return 'learning';
    } else if (text.includes('innovate') || text.includes('create') || text.includes('new')) {
      return 'innovation';
    } else if (text.includes('analyze') || text.includes('evaluate') || text.includes('assess')) {
      return 'analysis';
    } else if (text.includes('structure') || text.includes('organize') || text.includes('communicate')) {
      return 'communication';
    } else if (text.includes('strategy') || text.includes('plan') || text.includes('approach')) {
      return 'strategy';
    } else if (text.includes('voice') || text.includes('style') || text.includes('brand')) {
      return 'branding';
    } else if (text.includes('question') || text.includes('deep') || text.includes('critical')) {
      return 'critical-thinking';
    }
    
    return 'general';
  }
  
  /**
   * Score a framework for given context
   */
  private scoreFramework(
    framework: BaseFramework,
    context: FrameworkContext,
    intent: string
  ): number {
    let score = 0;
    
    // Check if framework is applicable
    if (!framework.isApplicable(context)) {
      return 0;
    }
    
    // Category match
    if (framework.category === intent) {
      score += 0.5;
    }
    
    // Tag matches
    const contextKeywords = this.extractKeywords(context);
    const tagMatches = framework.tags.filter(tag => 
      contextKeywords.some(keyword => tag.includes(keyword) || keyword.includes(tag))
    );
    score += tagMatches.length * 0.1;
    
    // Intent-specific scoring
    score += this.getIntentScore(framework, intent);
    
    // Complexity matching
    if (context.audience) {
      const audienceLevel = this.assessAudienceLevel(context.audience);
      const frameworkDifficulty = framework.getDifficulty();
      
      if (audienceLevel === frameworkDifficulty) {
        score += 0.2;
      } else if (
        (audienceLevel === 'beginner' && frameworkDifficulty === 'intermediate') ||
        (audienceLevel === 'intermediate' && frameworkDifficulty === 'advanced')
      ) {
        score -= 0.1; // Slight penalty for mismatch
      }
    }
    
    // Time constraints
    const estimatedTime = framework.getEstimatedTime();
    if (context.sessionData?.timeAvailable) {
      const available = parseInt(context.sessionData.timeAvailable);
      if (available >= estimatedTime) {
        score += 0.1;
      } else {
        score -= 0.2; // Penalty if not enough time
      }
    }
    
    return Math.min(score, 1);
  }
  
  /**
   * Get intent-specific score
   */
  private getIntentScore(framework: BaseFramework, intent: string): number {
    const intentScores: Record<string, Record<string, number>> = {
      'prioritization': {
        'RICE Framework': 0.5,
        '5W2H Analysis Framework': 0.2,
        'SWOT-USED Analysis': 0.3
      },
      'learning': {
        'Teaching Preparation Framework': 0.5,
        'Socratic Questioning Framework': 0.4,
        '5W2H Analysis Framework': 0.2
      },
      'innovation': {
        'SCAMPER Innovation Framework': 0.5,
        'SWOT-USED Analysis': 0.2
      },
      'analysis': {
        'SWOT-USED Analysis': 0.4,
        '5W2H Analysis Framework': 0.5,
        'Socratic Questioning Framework': 0.3
      },
      'communication': {
        'Pyramid Principle Framework': 0.5,
        'Voice DNA Framework': 0.3,
        '5W2H Analysis Framework': 0.2
      },
      'strategy': {
        'SWOT-USED Analysis': 0.5,
        'Pyramid Principle Framework': 0.3,
        '5W2H Analysis Framework': 0.3
      },
      'branding': {
        'Voice DNA Framework': 0.5,
        'Pyramid Principle Framework': 0.2
      },
      'critical-thinking': {
        'Socratic Questioning Framework': 0.5,
        '5W2H Analysis Framework': 0.3,
        'SWOT-USED Analysis': 0.2
      }
    };
    
    return intentScores[intent]?.[framework.name] || 0;
  }
  
  /**
   * Generate reason for recommendation
   */
  private generateReason(
    framework: BaseFramework,
    context: FrameworkContext,
    intent: string
  ): string {
    const reasons: string[] = [];
    
    // Intent-based reason
    if (framework.category === intent) {
      reasons.push(`Perfect for ${intent}`);
    }
    
    // Specific framework strengths
    const frameworkStrengths: Record<string, string> = {
      'RICE Framework': 'Excellent for data-driven prioritization',
      'Teaching Preparation Framework': 'Deepens understanding through teaching preparation',
      'Voice DNA Framework': 'Defines authentic content voice',
      'SWOT-USED Analysis': 'Comprehensive strategic analysis with actionable outcomes',
      'SCAMPER Innovation Framework': 'Systematic creative thinking for innovation',
      'Socratic Questioning Framework': 'Deep understanding through progressive questioning',
      '5W2H Analysis Framework': 'Ensures comprehensive coverage of all aspects',
      'Pyramid Principle Framework': 'Creates clear, logical communication structure'
    };
    
    if (frameworkStrengths[framework.name]) {
      reasons.push(frameworkStrengths[framework.name]);
    }
    
    // Time consideration
    const time = framework.getEstimatedTime();
    if (time <= 10) {
      reasons.push('Quick to complete');
    }
    
    // Difficulty consideration
    const difficulty = framework.getDifficulty();
    if (difficulty === 'beginner') {
      reasons.push('Easy to use');
    }
    
    return reasons.join('. ');
  }
  
  /**
   * Extract keywords from context
   */
  private extractKeywords(context: FrameworkContext): string[] {
    const text = `${context.topic || ''} ${context.goal || ''} ${context.audience || ''}`.toLowerCase();
    
    // Simple keyword extraction
    const words = text.split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'have'].includes(word));
    
    return words;
  }
  
  /**
   * Assess audience level
   */
  private assessAudienceLevel(audience: string): 'beginner' | 'intermediate' | 'advanced' {
    const lower = audience.toLowerCase();
    
    if (lower.includes('beginner') || lower.includes('new') || lower.includes('basic')) {
      return 'beginner';
    } else if (lower.includes('advanced') || lower.includes('expert') || lower.includes('senior')) {
      return 'advanced';
    }
    
    return 'intermediate';
  }
  
  /**
   * Get framework statistics
   */
  getStatistics(): any {
    const stats = {
      totalFrameworks: this.frameworks.size,
      byCategory: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
      byVersion: {
        legacy: 0,
        core: 0
      }
    };
    
    this.frameworks.forEach(framework => {
      // Category stats
      stats.byCategory[framework.category] = (stats.byCategory[framework.category] || 0) + 1;
      
      // Difficulty stats
      const difficulty = framework.getDifficulty();
      stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
      
      // Version stats
      if (framework.version === '1.0') {
        stats.byVersion.legacy++;
      } else {
        stats.byVersion.core++;
      }
    });
    
    return stats;
  }
}