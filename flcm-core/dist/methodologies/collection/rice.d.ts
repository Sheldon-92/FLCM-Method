/**
 * RICE Framework Implementation
 * Evaluates content based on Relevance, Impact, Confidence, and Effort
 */
export interface RICEScore {
    relevance: number;
    impact: number;
    confidence: number;
    effort: number;
    total: number;
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
export declare class RICEFramework {
    private config;
    constructor(config?: RICEConfig);
    /**
     * Calculate RICE score for content
     */
    calculate(content: string, metadata?: Record<string, any>): RICEScore;
    /**
     * Calculate relevance score
     */
    private calculateRelevance;
    /**
     * Calculate impact score
     */
    private calculateImpact;
    /**
     * Calculate confidence score
     */
    private calculateConfidence;
    /**
     * Calculate effort score (lower is better)
     */
    private calculateEffort;
    /**
     * Get recommendations based on RICE score
     */
    getRecommendations(score: RICEScore): string[];
}
export default RICEFramework;
