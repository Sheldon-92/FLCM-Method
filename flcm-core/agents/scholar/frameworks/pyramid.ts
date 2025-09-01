/**
 * Pyramid Framework
 * Hierarchical information structuring framework
 */

import { createLogger } from '../../../shared/utils/logger';

const logger = createLogger('PyramidFramework');

export interface PyramidResult {
  mainPoint: string;           // The key message at the top
  supportingIdeas: string[];   // Major supporting ideas (level 2)
  details: string[][];         // Supporting details for each idea (level 3)
  evidence: string[][];        // Evidence/examples for details (level 4)
  structure: PyramidStructure; // Visual representation of hierarchy
}

export interface PyramidStructure {
  level1: string;
  level2: PyramidNode[];
  level3: PyramidNode[];
  level4: PyramidNode[];
}

export interface PyramidNode {
  content: string;
  parent: number;
  index: number;
}

export class PyramidFramework {
  /**
   * Analyze content using Pyramid Principle
   */
  async analyze(content: string): Promise<PyramidResult> {
    try {
      logger.debug('Applying Pyramid framework analysis');

      // Extract main point
      const mainPoint = this.extractMainPoint(content);
      
      // Extract supporting ideas
      const supportingIdeas = this.extractSupportingIdeas(content);
      
      // Extract details for each supporting idea
      const details = this.extractDetails(content, supportingIdeas);
      
      // Extract evidence
      const evidence = this.extractEvidence(content, details);
      
      // Build structure
      const structure = this.buildStructure(mainPoint, supportingIdeas, details, evidence);

      return {
        mainPoint,
        supportingIdeas,
        details,
        evidence,
        structure,
      };
    } catch (error) {
      logger.error('Pyramid analysis failed:', error);
      throw error;
    }
  }

  private extractMainPoint(content: string): string {
    // Look for thesis statement patterns
    const sentences = content.split(/[.!?]+/);
    
    // Check first paragraph for main point
    const firstPara = sentences.slice(0, 3).join('. ');
    
    // Look for conclusion indicators
    const conclusionPatterns = [
      /therefore|thus|in conclusion|in summary|overall/i,
      /main point|key message|central idea|thesis/i,
      /most important|critical|essential|fundamental/i,
    ];

    for (const sentence of sentences) {
      for (const pattern of conclusionPatterns) {
        if (pattern.test(sentence)) {
          return sentence.trim().substring(0, 200);
        }
      }
    }

    // Default to first substantial sentence
    return sentences.find(s => s.trim().length > 50)?.trim().substring(0, 200) || 
           'Main point to be determined from content analysis';
  }

  private extractSupportingIdeas(content: string): string[] {
    const ideas: string[] = [];
    const paragraphs = content.split(/\n\n+/);
    
    // Look for topic sentences (usually first sentence of paragraph)
    for (const para of paragraphs) {
      if (para.trim().length > 50) {
        const firstSentence = para.split(/[.!?]/)[0];
        if (firstSentence && firstSentence.trim().length > 20) {
          ideas.push(firstSentence.trim().substring(0, 150));
        }
      }
    }

    // Also look for enumeration patterns
    const enumerationPatterns = [
      /first(?:ly)?|second(?:ly)?|third(?:ly)?|finally/gi,
      /\d+\./g,
      /[a-z]\)/gi,
    ];

    const sentences = content.split(/[.!?]+/);
    for (const sentence of sentences) {
      for (const pattern of enumerationPatterns) {
        if (pattern.test(sentence) && !ideas.includes(sentence.trim())) {
          ideas.push(sentence.trim().substring(0, 150));
          break;
        }
      }
    }

    return ideas.slice(0, 4); // Maximum 4 supporting ideas
  }

  private extractDetails(content: string, supportingIdeas: string[]): string[][] {
    const details: string[][] = [];
    
    for (const idea of supportingIdeas) {
      const ideaDetails: string[] = [];
      
      // Find sentences that relate to this idea
      const ideaKeywords = this.extractKeywords(idea);
      const sentences = content.split(/[.!?]+/);
      
      for (const sentence of sentences) {
        const sentenceLower = sentence.toLowerCase();
        const matchCount = ideaKeywords.filter(kw => sentenceLower.includes(kw)).length;
        
        if (matchCount >= 2 && sentence !== idea) {
          ideaDetails.push(sentence.trim().substring(0, 100));
        }
      }
      
      details.push(ideaDetails.slice(0, 3)); // Max 3 details per idea
    }
    
    return details;
  }

  private extractEvidence(content: string, details: string[][]): string[][] {
    const evidence: string[][] = [];
    
    // Evidence patterns
    const evidencePatterns = [
      /for example|for instance|such as|including/gi,
      /study|research|data|statistics|survey/gi,
      /\d+%|\$\d+|\d+ million|\d+ billion/gi,
      /according to|source|reference|citation/gi,
    ];
    
    for (const detailGroup of details) {
      const groupEvidence: string[] = [];
      
      for (const detail of detailGroup) {
        const detailKeywords = this.extractKeywords(detail);
        const sentences = content.split(/[.!?]+/);
        
        for (const sentence of sentences) {
          // Check if sentence contains evidence patterns
          let hasEvidence = false;
          for (const pattern of evidencePatterns) {
            if (pattern.test(sentence)) {
              hasEvidence = true;
              break;
            }
          }
          
          // Check if it relates to the detail
          if (hasEvidence) {
            const sentenceLower = sentence.toLowerCase();
            const matchCount = detailKeywords.filter(kw => sentenceLower.includes(kw)).length;
            
            if (matchCount >= 1) {
              groupEvidence.push(sentence.trim().substring(0, 80));
            }
          }
        }
      }
      
      evidence.push(groupEvidence.slice(0, 2)); // Max 2 evidence per detail group
    }
    
    return evidence;
  }

  private buildStructure(
    mainPoint: string,
    supportingIdeas: string[],
    details: string[][],
    evidence: string[][]
  ): PyramidStructure {
    const structure: PyramidStructure = {
      level1: mainPoint,
      level2: [],
      level3: [],
      level4: [],
    };

    // Build level 2 (supporting ideas)
    supportingIdeas.forEach((idea, index) => {
      structure.level2.push({
        content: idea,
        parent: 0,
        index,
      });
    });

    // Build level 3 (details)
    let level3Index = 0;
    details.forEach((detailGroup, parentIndex) => {
      detailGroup.forEach(detail => {
        structure.level3.push({
          content: detail,
          parent: parentIndex,
          index: level3Index++,
        });
      });
    });

    // Build level 4 (evidence)
    let level4Index = 0;
    evidence.forEach((evidenceGroup, parentIndex) => {
      evidenceGroup.forEach(ev => {
        structure.level4.push({
          content: ev,
          parent: parentIndex,
          index: level4Index++,
        });
      });
    });

    return structure;
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4 && !this.isStopWord(word))
      .slice(0, 5);
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'these', 'those'];
    return stopWords.includes(word);
  }

  /**
   * Extract insights from Pyramid results
   */
  extractInsights(results: PyramidResult): string[] {
    const insights: string[] = [];

    // Main insight
    insights.push(`Core message: ${results.mainPoint}`);

    // Key supporting points
    if (results.supportingIdeas.length > 0) {
      insights.push(`Primary support: ${results.supportingIdeas[0]}`);
    }

    // Structure insight
    const totalNodes = 1 + results.supportingIdeas.length + 
                      results.details.flat().length + 
                      results.evidence.flat().length;
    insights.push(`Information hierarchy: ${totalNodes} connected points across 4 levels`);

    // Evidence strength
    const evidenceCount = results.evidence.flat().length;
    if (evidenceCount > 0) {
      insights.push(`Evidence strength: ${evidenceCount} supporting examples identified`);
    }

    // Completeness
    const avgDetailsPerIdea = results.details.map(d => d.length).reduce((a, b) => a + b, 0) / 
                             (results.supportingIdeas.length || 1);
    insights.push(`Structure depth: Average ${avgDetailsPerIdea.toFixed(1)} details per main idea`);

    return insights;
  }
}