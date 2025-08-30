/**
 * RICE Framework Implementation
 * Evaluates content based on Relevance, Impact, Confidence, and Effort
 */

export interface RICEScore {
  relevance: number;  // 0-100: How relevant is this to the target audience?
  impact: number;     // 0-100: How much impact will this have?
  confidence: number; // 0-100: How confident are we in the information?
  effort: number;     // 0-100: How much effort to transform (lower is better)
  total: number;      // Calculated RICE score
}

export interface RICEConfig {
  weights?: {
    relevance?: number;
    impact?: number;
    confidence?: number;
    effort?: number;
  };
  keywords?: string[];
  audience?: string;
  domain?: string;
}

/**
 * RICE Framework Calculator
 */
export class RICEFramework {
  private config: RICEConfig;
  
  constructor(config: RICEConfig = {}) {
    this.config = {
      weights: {
        relevance: 1.0,
        impact: 1.0,
        confidence: 1.0,
        effort: 1.0,
        ...config.weights
      },
      ...config
    };
  }

  /**
   * Calculate RICE score for content
   */
  calculate(content: string, metadata?: Record<string, any>): RICEScore {
    const relevance = this.calculateRelevance(content, metadata);
    const impact = this.calculateImpact(content, metadata);
    const confidence = this.calculateConfidence(content, metadata);
    const effort = this.calculateEffort(content, metadata);
    
    // RICE formula: (Relevance * Impact * Confidence) / Effort
    // Normalize effort so lower effort = higher score
    const effortMultiplier = (100 - effort) / 100;
    
    const weights = this.config.weights!;
    const total = (
      (relevance * weights.relevance!) *
      (impact * weights.impact!) *
      (confidence * weights.confidence!) *
      effortMultiplier
    ) / 100;
    
    return {
      relevance,
      impact,
      confidence,
      effort,
      total: Math.round(total)
    };
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(content: string, metadata?: Record<string, any>): number {
    let score = 50; // Base score
    
    // Check for keywords
    if (this.config.keywords && this.config.keywords.length > 0) {
      const contentLower = content.toLowerCase();
      const keywordMatches = this.config.keywords.filter(
        keyword => contentLower.includes(keyword.toLowerCase())
      );
      score += Math.min(30, keywordMatches.length * 10);
    }
    
    // Check content structure indicators
    const hasHeaders = /^#{1,6}\s+.+/gm.test(content);
    const hasList = /^[\*\-\+]\s+.+/gm.test(content) || /^\d+\.\s+.+/gm.test(content);
    const hasQuotes = /"[^"]{20,}"/.test(content) || />[^<]{20,}/.test(content);
    
    if (hasHeaders) score += 5;
    if (hasList) score += 5;
    if (hasQuotes) score += 5;
    
    // Check for technical depth
    const technicalTerms = [
      'framework', 'methodology', 'algorithm', 'architecture',
      'implementation', 'optimization', 'analysis', 'strategy'
    ];
    const techMatches = technicalTerms.filter(term => 
      content.toLowerCase().includes(term)
    );
    score += Math.min(15, techMatches.length * 3);
    
    // Check metadata signals
    if (metadata?.source === 'academic') score += 10;
    if (metadata?.source === 'industry') score += 8;
    if (metadata?.verified) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate impact score
   */
  private calculateImpact(content: string, metadata?: Record<string, any>): number {
    let score = 40; // Base score
    
    // Check for actionable content
    const actionWords = [
      'how to', 'guide', 'tutorial', 'step-by-step', 'process',
      'method', 'approach', 'technique', 'strategy', 'framework'
    ];
    const contentLower = content.toLowerCase();
    const actionMatches = actionWords.filter(word => contentLower.includes(word));
    score += Math.min(20, actionMatches.length * 5);
    
    // Check for novelty indicators
    const noveltyWords = [
      'new', 'novel', 'innovative', 'breakthrough', 'revolutionary',
      'cutting-edge', 'state-of-the-art', 'latest', 'emerging'
    ];
    const noveltyMatches = noveltyWords.filter(word => contentLower.includes(word));
    score += Math.min(15, noveltyMatches.length * 5);
    
    // Check for data/evidence
    const hasNumbers = /\d+%|\d+x|\$\d+|\d{3,}/.test(content);
    const hasData = /data|study|research|survey|analysis/.test(contentLower);
    const hasCaseStudy = /case study|example|success story/.test(contentLower);
    
    if (hasNumbers) score += 10;
    if (hasData) score += 10;
    if (hasCaseStudy) score += 5;
    
    // Length indicates depth
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 1000) score += 10;
    else if (wordCount > 500) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(content: string, metadata?: Record<string, any>): number {
    let score = 60; // Base score
    
    const contentLower = content.toLowerCase();
    
    // Check for citations/references
    const hasReferences = /\[\d+\]|\(\d{4}\)|\bet al\./.test(content);
    const hasLinks = /https?:\/\/[^\s]+/.test(content);
    const hasQuotes = /"[^"]{20,}"/.test(content);
    
    if (hasReferences) score += 15;
    if (hasLinks) score += 10;
    if (hasQuotes) score += 5;
    
    // Check for authoritative language
    const authoritativeTerms = [
      'research shows', 'studies indicate', 'evidence suggests',
      'data demonstrates', 'analysis reveals', 'experts agree'
    ];
    const authMatches = authoritativeTerms.filter(term => contentLower.includes(term));
    score += Math.min(10, authMatches.length * 5);
    
    // Check for disclaimers (reduces confidence)
    const disclaimers = [
      'may', 'might', 'could', 'possibly', 'potentially',
      'uncertain', 'unclear', 'debated', 'controversial'
    ];
    const disclaimerMatches = disclaimers.filter(term => contentLower.includes(term));
    score -= Math.min(10, disclaimerMatches.length * 2);
    
    // Metadata boosts
    if (metadata?.verified) score += 10;
    if (metadata?.authorCredentials) score += 10;
    if (metadata?.peerReviewed) score += 15;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate effort score (lower is better)
   */
  private calculateEffort(content: string, metadata?: Record<string, any>): number {
    let score = 30; // Base effort
    
    const wordCount = content.split(/\s+/).length;
    
    // Length affects effort
    if (wordCount > 2000) score += 20;
    else if (wordCount > 1000) score += 10;
    else if (wordCount < 300) score -= 10;
    
    // Complexity indicators
    const complexityIndicators = {
      technicalJargon: /[A-Z]{3,}|\w{15,}/g,
      nestedStructure: /#{3,}|^\s{8,}/gm,
      specialCharacters: /[^\w\s\.\,\!\?\-]/g,
      codeBlocks: /```[\s\S]*?```/g
    };
    
    if (content.match(complexityIndicators.technicalJargon)?.length > 10) score += 15;
    if (content.match(complexityIndicators.nestedStructure)?.length > 5) score += 10;
    if (content.match(complexityIndicators.specialCharacters)?.length > 20) score += 5;
    if (content.match(complexityIndicators.codeBlocks)?.length > 0) score += 10;
    
    // Well-structured content is easier to process
    const hasHeaders = /^#{1,6}\s+.+/gm.test(content);
    const hasList = /^[\*\-\+]\s+.+/gm.test(content);
    const hasParagraphs = content.split('\n\n').length > 3;
    
    if (hasHeaders) score -= 10;
    if (hasList) score -= 5;
    if (hasParagraphs) score -= 5;
    
    // Media and external content add effort
    if (metadata?.hasImages) score += 10;
    if (metadata?.hasVideos) score += 15;
    if (metadata?.requiresTranslation) score += 20;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get recommendations based on RICE score
   */
  getRecommendations(score: RICEScore): string[] {
    const recommendations: string[] = [];
    
    if (score.relevance < 50) {
      recommendations.push('Consider adding more domain-specific keywords and concepts');
    }
    
    if (score.impact < 50) {
      recommendations.push('Add more actionable insights and concrete examples');
    }
    
    if (score.confidence < 50) {
      recommendations.push('Include citations, data, or expert quotes to boost credibility');
    }
    
    if (score.effort > 70) {
      recommendations.push('Content may be too complex - consider breaking into smaller pieces');
    }
    
    if (score.total < 40) {
      recommendations.push('This content may not provide sufficient value for transformation');
    } else if (score.total > 70) {
      recommendations.push('High-value content identified - prioritize for processing');
    }
    
    return recommendations;
  }
}

export default RICEFramework;