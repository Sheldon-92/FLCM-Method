/**
 * Voice DNA Analyzer
 * Extracts writing style patterns from content samples
 */

import { VoiceDNAProfile } from './index';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger('VoiceDNAAnalyzer');

export class VoiceDNAAnalyzer {
  /**
   * Analyze samples to extract Voice DNA
   */
  async analyze(samples: string[]): Promise<VoiceDNAProfile> {
    logger.info(`Analyzing ${samples.length} samples for Voice DNA`);

    const profile: VoiceDNAProfile = {
      id: this.generateId(),
      userId: 'current-user',
      created: new Date(),
      updated: new Date(),
      sampleCount: samples.length,
      style: this.analyzeStyle(samples),
      patterns: this.analyzePatterns(samples),
      vocabulary: this.analyzeVocabulary(samples),
      tone: this.analyzeTone(samples),
    };

    return profile;
  }

  /**
   * Analyze a single content piece
   */
  async analyzeContent(content: string): Promise<any> {
    return {
      style: this.analyzeStyle([content]),
      patterns: this.analyzePatterns([content]),
      vocabulary: this.analyzeVocabulary([content]),
      tone: this.analyzeTone([content]),
    };
  }

  private analyzeStyle(samples: string[]): VoiceDNAProfile['style'] {
    let totalFormality = 0;
    let totalComplexity = 0;
    let totalEmotionality = 0;
    let totalTechnicality = 0;

    for (const sample of samples) {
      totalFormality += this.measureFormality(sample);
      totalComplexity += this.measureComplexity(sample);
      totalEmotionality += this.measureEmotionality(sample);
      totalTechnicality += this.measureTechnicality(sample);
    }

    const count = samples.length;
    return {
      formality: totalFormality / count,
      complexity: totalComplexity / count,
      emotionality: totalEmotionality / count,
      technicality: totalTechnicality / count,
    };
  }

  private analyzePatterns(samples: string[]): VoiceDNAProfile['patterns'] {
    const sentences: string[] = [];
    const paragraphs: string[] = [];

    for (const sample of samples) {
      sentences.push(...sample.split(/[.!?]+/).filter(s => s.trim()));
      paragraphs.push(...sample.split(/\n\n+/).filter(p => p.trim()));
    }

    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const paragraphLengths = paragraphs.map(p => p.split(/[.!?]+/).length);

    return {
      sentenceLength: {
        avg: this.average(sentenceLengths),
        std: this.standardDeviation(sentenceLengths),
      },
      paragraphLength: {
        avg: this.average(paragraphLengths),
        std: this.standardDeviation(paragraphLengths),
      },
      vocabularyRichness: this.calculateVocabularyRichness(samples),
      punctuationStyle: this.analyzePunctuation(samples),
    };
  }

  private analyzeVocabulary(samples: string[]): VoiceDNAProfile['vocabulary'] {
    const wordFreq = new Map<string, number>();
    const phraseFreq = new Map<string, number>();
    const transitions: string[] = [];

    for (const sample of samples) {
      const words = sample.toLowerCase().split(/\s+/);
      
      // Count word frequency
      for (const word of words) {
        if (word.length > 3) {
          wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        }
      }

      // Extract transitions
      const transitionPatterns = [
        /however|moreover|furthermore|additionally|consequently/gi,
        /therefore|thus|hence|accordingly/gi,
      ];

      for (const pattern of transitionPatterns) {
        const matches = sample.match(pattern);
        if (matches) {
          transitions.push(...matches);
        }
      }
    }

    // Get top words
    const commonWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);

    return {
      commonWords,
      uniquePhrases: [],
      preferredTransitions: [...new Set(transitions)].slice(0, 5),
      avoidedWords: [],
    };
  }

  private analyzeTone(samples: string[]): VoiceDNAProfile['tone'] {
    let positiveCount = 0;
    let negativeCount = 0;
    let energySum = 0;

    for (const sample of samples) {
      // Simple sentiment analysis
      const positive = (sample.match(/good|great|excellent|amazing|wonderful/gi) || []).length;
      const negative = (sample.match(/bad|poor|terrible|awful|horrible/gi) || []).length;
      
      positiveCount += positive;
      negativeCount += negative;

      // Energy level based on punctuation
      const exclamations = (sample.match(/!/g) || []).length;
      const questions = (sample.match(/\?/g) || []).length;
      energySum += (exclamations * 2 + questions) / sample.length * 100;
    }

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount * 1.5) sentiment = 'positive';
    else if (negativeCount > positiveCount * 1.5) sentiment = 'negative';

    const avgEnergy = energySum / samples.length;
    let energy: 'high' | 'medium' | 'low' = 'medium';
    if (avgEnergy > 0.5) energy = 'high';
    else if (avgEnergy < 0.2) energy = 'low';

    return {
      sentiment,
      energy,
      confidence: 0.75,
    };
  }

  private measureFormality(text: string): number {
    const informalWords = /gonna|wanna|gotta|ain't|y'all|hey|hi|yeah/gi;
    const formalWords = /therefore|however|furthermore|consequently|accordingly/gi;
    
    const informalCount = (text.match(informalWords) || []).length;
    const formalCount = (text.match(formalWords) || []).length;
    
    const total = informalCount + formalCount;
    if (total === 0) return 0.5;
    
    return formalCount / total;
  }

  private measureComplexity(text: string): number {
    const words = text.split(/\s+/);
    const longWords = words.filter(w => w.length > 8).length;
    const avgSentenceLength = text.split(/[.!?]/).map(s => s.split(/\s+/).length);
    
    const complexity = (longWords / words.length) + 
                      (this.average(avgSentenceLength) / 30);
    
    return Math.min(1, complexity);
  }

  private measureEmotionality(text: string): number {
    const emotionalWords = /love|hate|amazing|terrible|wonderful|awful|excited|sad|happy|angry/gi;
    const matches = text.match(emotionalWords) || [];
    const words = text.split(/\s+/).length;
    
    return Math.min(1, matches.length / words * 20);
  }

  private measureTechnicality(text: string): number {
    const technicalWords = /algorithm|implementation|architecture|framework|protocol|interface|configuration/gi;
    const matches = text.match(technicalWords) || [];
    const words = text.split(/\s+/).length;
    
    return Math.min(1, matches.length / words * 20);
  }

  private calculateVocabularyRichness(samples: string[]): number {
    const allWords: string[] = [];
    for (const sample of samples) {
      allWords.push(...sample.toLowerCase().split(/\s+/));
    }
    
    const uniqueWords = new Set(allWords);
    return uniqueWords.size / allWords.length;
  }

  private analyzePunctuation(samples: string[]): Record<string, number> {
    let periods = 0;
    let exclamations = 0;
    let questions = 0;
    let total = 0;

    for (const sample of samples) {
      periods += (sample.match(/\./g) || []).length;
      exclamations += (sample.match(/!/g) || []).length;
      questions += (sample.match(/\?/g) || []).length;
    }

    total = periods + exclamations + questions;
    if (total === 0) return { '.': 1, '!': 0, '?': 0 };

    return {
      '.': periods / total,
      '!': exclamations / total,
      '?': questions / total,
    };
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private standardDeviation(numbers: number[]): number {
    const avg = this.average(numbers);
    const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }

  private generateId(): string {
    return `voice-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}