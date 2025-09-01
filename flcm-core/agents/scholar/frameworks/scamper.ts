/**
 * SCAMPER Framework
 * Creative thinking and innovation framework
 */

import { createLogger } from '../../../shared/utils/logger';

const logger = createLogger('SCAMPERFramework');

export interface SCAMPERResult {
  substitute: string[];     // What can be substituted?
  combine: string[];        // What can be combined?
  adapt: string[];          // What can be adapted?
  modify: string[];         // What can be modified/magnified?
  putToOtherUses: string[]; // What other uses are there?
  eliminate: string[];      // What can be eliminated?
  reverse: string[];        // What can be reversed/rearranged?
}

export class SCAMPERFramework {
  /**
   * Analyze content using SCAMPER framework
   */
  async analyze(content: string): Promise<SCAMPERResult> {
    try {
      logger.debug('Applying SCAMPER framework analysis');

      return {
        substitute: this.findSubstitutions(content),
        combine: this.findCombinations(content),
        adapt: this.findAdaptations(content),
        modify: this.findModifications(content),
        putToOtherUses: this.findOtherUses(content),
        eliminate: this.findEliminations(content),
        reverse: this.findReversals(content),
      };
    } catch (error) {
      logger.error('SCAMPER analysis failed:', error);
      throw error;
    }
  }

  private findSubstitutions(content: string): string[] {
    const patterns = [
      /replace|substitute|switch|swap|exchange|alternative/gi,
      /instead of|rather than|in place of/gi,
    ];
    return this.extractMatches(content, patterns, 'Consider substituting');
  }

  private findCombinations(content: string): string[] {
    const patterns = [
      /combine|merge|integrate|unify|consolidate|blend/gi,
      /together|joint|unified|combined/gi,
    ];
    return this.extractMatches(content, patterns, 'Potential combination');
  }

  private findAdaptations(content: string): string[] {
    const patterns = [
      /adapt|adjust|modify|customize|tailor|fit/gi,
      /flexible|adaptable|versatile/gi,
    ];
    return this.extractMatches(content, patterns, 'Could be adapted');
  }

  private findModifications(content: string): string[] {
    const patterns = [
      /modify|enhance|improve|amplify|magnify|strengthen/gi,
      /increase|expand|extend|enlarge/gi,
    ];
    return this.extractMatches(content, patterns, 'Modification opportunity');
  }

  private findOtherUses(content: string): string[] {
    const patterns = [
      /other use|repurpose|reuse|recycle|multipurpose/gi,
      /additional|secondary|alternative use/gi,
    ];
    return this.extractMatches(content, patterns, 'Alternative use');
  }

  private findEliminations(content: string): string[] {
    const patterns = [
      /eliminate|remove|delete|reduce|simplify|streamline/gi,
      /unnecessary|redundant|excess|surplus/gi,
    ];
    return this.extractMatches(content, patterns, 'Could eliminate');
  }

  private findReversals(content: string): string[] {
    const patterns = [
      /reverse|invert|flip|opposite|contrary|backwards/gi,
      /rearrange|reorder|reorganize|restructure/gi,
    ];
    return this.extractMatches(content, patterns, 'Consider reversing');
  }

  private extractMatches(content: string, patterns: RegExp[], prefix: string): string[] {
    const matches = new Set<string>();
    const sentences = content.split(/[.!?]+/);

    for (const sentence of sentences) {
      for (const pattern of patterns) {
        if (pattern.test(sentence)) {
          const cleaned = sentence.trim().substring(0, 100);
          matches.add(`${prefix}: ${cleaned}`);
          break;
        }
      }
    }

    return Array.from(matches).slice(0, 3);
  }

  /**
   * Extract insights from SCAMPER results
   */
  extractInsights(results: SCAMPERResult): string[] {
    const insights: string[] = [];

    const categories = [
      { key: 'substitute', label: 'Substitution opportunity' },
      { key: 'combine', label: 'Combination potential' },
      { key: 'adapt', label: 'Adaptation possibility' },
      { key: 'modify', label: 'Modification suggestion' },
      { key: 'putToOtherUses', label: 'Alternative application' },
      { key: 'eliminate', label: 'Simplification opportunity' },
      { key: 'reverse', label: 'Reversal concept' },
    ];

    for (const { key, label } of categories) {
      const items = results[key as keyof SCAMPERResult];
      if (items && items.length > 0) {
        insights.push(`${label}: ${items[0]}`);
      }
    }

    return insights.slice(0, 5);
  }
}