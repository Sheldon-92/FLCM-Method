/**
 * Signal-to-Noise Filter
 * Identifies high-value signals and filters out noise from content
 */

export interface Signal {
  type: 'insight' | 'fact' | 'trend' | 'pattern' | 'anomaly';
  content: string;
  strength: number; // 0-100
  context?: string;
}

export interface NoisePattern {
  pattern: RegExp | string;
  type: 'filler' | 'redundant' | 'promotional' | 'generic';
  impact: number; // How much this reduces signal quality
}

export interface SignalAnalysis {
  signals: Signal[];
  noiseLevel: number; // 0-100 (lower is better)
  signalToNoiseRatio: number;
  summary: string;
}

/**
 * Signal-to-Noise Filter Class
 */
export class SignalToNoiseFilter {
  private noisePatterns: NoisePattern[] = [
    // Filler phrases
    { pattern: /as we all know|obviously|clearly|it goes without saying/gi, type: 'filler', impact: 5 },
    { pattern: /in today's world|in this day and age|now more than ever/gi, type: 'filler', impact: 5 },
    { pattern: /at the end of the day|when all is said and done/gi, type: 'filler', impact: 5 },
    
    // Redundant expressions
    { pattern: /basically|essentially|fundamentally|literally/gi, type: 'redundant', impact: 3 },
    { pattern: /very unique|absolutely essential|completely revolutionary/gi, type: 'redundant', impact: 4 },
    
    // Promotional language
    { pattern: /game-changer|revolutionary|groundbreaking|paradigm shift/gi, type: 'promotional', impact: 7 },
    { pattern: /best-in-class|world-class|cutting-edge|state-of-the-art/gi, type: 'promotional', impact: 6 },
    { pattern: /unlock|unleash|transform|revolutionize/gi, type: 'promotional', impact: 5 },
    
    // Generic statements
    { pattern: /it is important to note that|it should be mentioned that/gi, type: 'generic', impact: 4 },
    { pattern: /there are many|there are several|there are various/gi, type: 'generic', impact: 3 },
    { pattern: /one of the most|one of the best|one of the key/gi, type: 'generic', impact: 4 }
  ];

  private signalIndicators = {
    insight: [
      /this means that|this suggests that|this indicates/gi,
      /the implication is|the result is|the outcome/gi,
      /interestingly|surprisingly|unexpectedly/gi
    ],
    fact: [
      /\d+%|\d+x|\$\d+M?B?/g,
      /according to|research shows|studies indicate/gi,
      /data reveals|analysis shows|evidence suggests/gi
    ],
    trend: [
      /increasing|decreasing|growing|declining/gi,
      /trend|pattern|shift|movement/gi,
      /emerging|evolving|developing/gi
    ],
    pattern: [
      /consistently|repeatedly|frequently|regularly/gi,
      /correlation|relationship|connection|link/gi,
      /framework|model|structure|system/gi
    ],
    anomaly: [
      /however|but|despite|although/gi,
      /exception|outlier|unusual|unique/gi,
      /contrary to|different from|unlike/gi
    ]
  };

  /**
   * Analyze content for signals and noise
   */
  analyze(content: string): SignalAnalysis {
    const signals = this.extractSignals(content);
    const noiseLevel = this.calculateNoiseLevel(content);
    const signalStrength = this.calculateSignalStrength(signals);
    
    const signalToNoiseRatio = signalStrength / Math.max(1, noiseLevel);
    
    return {
      signals,
      noiseLevel,
      signalToNoiseRatio,
      summary: this.generateSummary(signals, noiseLevel, signalToNoiseRatio)
    };
  }

  /**
   * Extract high-value signals from content
   */
  private extractSignals(content: string): Signal[] {
    const signals: Signal[] = [];
    const sentences = this.splitIntoSentences(content);
    
    for (const sentence of sentences) {
      // Check for each signal type
      for (const [type, patterns] of Object.entries(this.signalIndicators)) {
        let matchCount = 0;
        
        for (const pattern of patterns) {
          const matches = sentence.match(pattern);
          if (matches) {
            matchCount += matches.length;
          }
        }
        
        if (matchCount > 0) {
          const strength = this.calculateSignalStrength([{ 
            type: type as Signal['type'], 
            content: sentence,
            strength: 0 
          }]);
          
          // Only include strong signals
          if (strength > 30) {
            signals.push({
              type: type as Signal['type'],
              content: this.cleanSentence(sentence),
              strength,
              context: this.extractContext(sentence, content)
            });
          }
        }
      }
    }
    
    // Deduplicate and sort by strength
    return this.deduplicateSignals(signals)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 20); // Keep top 20 signals
  }

  /**
   * Calculate noise level in content
   */
  private calculateNoiseLevel(content: string): number {
    let noiseScore = 0;
    let patternMatches = 0;
    
    for (const noisePattern of this.noisePatterns) {
      const pattern = typeof noisePattern.pattern === 'string' 
        ? new RegExp(noisePattern.pattern, 'gi')
        : noisePattern.pattern;
      
      const matches = content.match(pattern);
      if (matches) {
        patternMatches += matches.length;
        noiseScore += matches.length * noisePattern.impact;
      }
    }
    
    // Calculate noise density
    const wordCount = content.split(/\s+/).length;
    const noiseDensity = (patternMatches / wordCount) * 100;
    
    // Combine noise score with density
    const totalNoise = Math.min(100, noiseScore + noiseDensity * 10);
    
    return Math.round(totalNoise);
  }

  /**
   * Calculate overall signal strength
   */
  private calculateSignalStrength(signals: Signal[]): number {
    if (signals.length === 0) return 0;
    
    const totalStrength = signals.reduce((sum, signal) => sum + signal.strength, 0);
    const averageStrength = totalStrength / signals.length;
    
    // Bonus for signal diversity
    const uniqueTypes = new Set(signals.map(s => s.type)).size;
    const diversityBonus = uniqueTypes * 5;
    
    return Math.min(100, averageStrength + diversityBonus);
  }

  /**
   * Split content into sentences
   */
  private splitIntoSentences(content: string): string[] {
    // Simple sentence splitter (could be improved with NLP)
    return content
      .replace(/\n+/g, ' ')
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);
  }

  /**
   * Clean sentence for signal extraction
   */
  private cleanSentence(sentence: string): string {
    return sentence
      .replace(/\s+/g, ' ')
      .replace(/^\W+|\W+$/g, '')
      .trim();
  }

  /**
   * Extract context around a signal
   */
  private extractContext(sentence: string, content: string): string {
    const sentenceIndex = content.indexOf(sentence);
    if (sentenceIndex === -1) return '';
    
    const contextStart = Math.max(0, sentenceIndex - 100);
    const contextEnd = Math.min(content.length, sentenceIndex + sentence.length + 100);
    
    return content
      .substring(contextStart, contextEnd)
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Deduplicate similar signals
   */
  private deduplicateSignals(signals: Signal[]): Signal[] {
    const unique: Signal[] = [];
    const seen = new Set<string>();
    
    for (const signal of signals) {
      // Create a simple hash of the signal content
      const hash = signal.content
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .slice(0, 5)
        .join(' ');
      
      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(signal);
      }
    }
    
    return unique;
  }

  /**
   * Generate summary of signal analysis
   */
  private generateSummary(
    signals: Signal[], 
    noiseLevel: number, 
    ratio: number
  ): string {
    const quality = ratio > 2 ? 'High' : ratio > 1 ? 'Medium' : 'Low';
    const signalTypes = [...new Set(signals.map(s => s.type))].join(', ');
    
    return `Signal Quality: ${quality} (Ratio: ${ratio.toFixed(2)}) | ` +
           `Signals: ${signals.length} (${signalTypes}) | ` +
           `Noise Level: ${noiseLevel}%`;
  }

  /**
   * Get clean content with noise removed
   */
  getCleanContent(content: string, analysis: SignalAnalysis): string {
    let cleanContent = content;
    
    // Remove noise patterns
    for (const noisePattern of this.noisePatterns) {
      const pattern = typeof noisePattern.pattern === 'string'
        ? new RegExp(noisePattern.pattern, 'gi')
        : noisePattern.pattern;
      
      cleanContent = cleanContent.replace(pattern, '');
    }
    
    // Clean up extra whitespace
    cleanContent = cleanContent
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return cleanContent;
  }

  /**
   * Extract key insights from signals
   */
  extractKeyInsights(signals: Signal[]): string[] {
    return signals
      .filter(s => s.type === 'insight' || s.strength > 70)
      .slice(0, 5)
      .map(s => s.content);
  }
}

export default SignalToNoiseFilter;