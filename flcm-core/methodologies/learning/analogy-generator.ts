/**
 * Analogy Generator for Scholar Agent
 * Creates meaningful analogies to enhance understanding
 */

export interface Analogy {
  source: string;      // The concept being explained
  target: string;      // What it's being compared to
  mapping: string;     // How they relate
  strength: number;    // 0-1 score of analogy quality
  domain: string;      // Domain of the target (everyday, nature, technology, etc.)
}

export interface AnalogySet {
  concept: string;
  analogies: Analogy[];
  bestAnalogy: Analogy | null;
  explanation: string;
}

/**
 * Analogy Generator Class
 */
export class AnalogyGenerator {
  private readonly analogyTemplates = {
    structural: {
      templates: [
        '{source} is like {target} because both have {structure}',
        '{source} resembles {target} in how {similarity}',
        'Just as {target} has {feature}, {source} also {parallel}'
      ],
      domains: ['architecture', 'biology', 'everyday objects']
    },
    functional: {
      templates: [
        '{source} works like {target} - both {function}',
        '{source} serves the same purpose as {target}: {purpose}',
        'Like {target}, {source} helps to {action}'
      ],
      domains: ['machines', 'tools', 'systems']
    },
    behavioral: {
      templates: [
        '{source} behaves like {target} when {condition}',
        '{source} responds similarly to {target} by {response}',
        'Just as {target} {action1}, {source} {action2}'
      ],
      domains: ['nature', 'physics', 'social systems']
    },
    relational: {
      templates: [
        '{source} relates to {context} like {target} relates to {targetContext}',
        'The relationship between {source} and {element1} mirrors {target} and {element2}',
        '{source} is to {domain1} what {target} is to {domain2}'
      ],
      domains: ['relationships', 'hierarchies', 'networks']
    }
  };

  private readonly domainExamples = {
    everyday: [
      { target: 'recipe', features: ['steps', 'ingredients', 'outcome', 'instructions'] },
      { target: 'map', features: ['navigation', 'routes', 'destinations', 'guidance'] },
      { target: 'library', features: ['organization', 'storage', 'retrieval', 'categorization'] },
      { target: 'garden', features: ['growth', 'cultivation', 'maintenance', 'harvest'] },
      { target: 'orchestra', features: ['coordination', 'harmony', 'conductor', 'sections'] }
    ],
    nature: [
      { target: 'ecosystem', features: ['interdependence', 'balance', 'cycles', 'adaptation'] },
      { target: 'river', features: ['flow', 'source', 'tributaries', 'destination'] },
      { target: 'tree', features: ['roots', 'branches', 'growth', 'structure'] },
      { target: 'immune system', features: ['defense', 'recognition', 'response', 'memory'] },
      { target: 'weather system', features: ['patterns', 'cycles', 'influence', 'prediction'] }
    ],
    technology: [
      { target: 'computer', features: ['processing', 'memory', 'input/output', 'programs'] },
      { target: 'network', features: ['nodes', 'connections', 'traffic', 'protocols'] },
      { target: 'database', features: ['storage', 'queries', 'relationships', 'indexes'] },
      { target: 'assembly line', features: ['stages', 'efficiency', 'production', 'workflow'] },
      { target: 'GPS', features: ['positioning', 'navigation', 'satellites', 'accuracy'] }
    ],
    business: [
      { target: 'supply chain', features: ['links', 'flow', 'dependencies', 'optimization'] },
      { target: 'marketplace', features: ['buyers', 'sellers', 'transactions', 'competition'] },
      { target: 'investment', features: ['risk', 'return', 'growth', 'strategy'] },
      { target: 'franchise', features: ['replication', 'standards', 'brand', 'scalability'] },
      { target: 'partnership', features: ['collaboration', 'shared goals', 'synergy', 'roles'] }
    ],
    science: [
      { target: 'atom', features: ['nucleus', 'electrons', 'bonds', 'energy levels'] },
      { target: 'solar system', features: ['center', 'orbits', 'gravity', 'hierarchy'] },
      { target: 'chemical reaction', features: ['reactants', 'products', 'catalyst', 'energy'] },
      { target: 'wave', features: ['frequency', 'amplitude', 'propagation', 'interference'] },
      { target: 'cell', features: ['membrane', 'nucleus', 'organelles', 'functions'] }
    ]
  };

  /**
   * Generate analogies for a concept
   */
  generate(concept: string, context: string, count: number = 3): AnalogySet {
    const analogies: Analogy[] = [];
    
    // Extract concept features from context
    const features = this.extractFeatures(concept, context);
    const conceptType = this.identifyConceptType(concept, context);
    
    // Generate analogies from different domains
    const domains = Object.keys(this.domainExamples);
    domains.forEach(domain => {
      const domainAnalogies = this.generateDomainAnalogies(
        concept,
        features,
        conceptType,
        domain,
        context
      );
      analogies.push(...domainAnalogies);
    });

    // Sort by strength and take top N
    analogies.sort((a, b) => b.strength - a.strength);
    const topAnalogies = analogies.slice(0, count);

    // Select best analogy
    const bestAnalogy = topAnalogies.length > 0 ? topAnalogies[0] : null;

    // Generate explanation
    const explanation = this.generateExplanation(concept, topAnalogies);

    return {
      concept,
      analogies: topAnalogies,
      bestAnalogy,
      explanation
    };
  }

  /**
   * Extract features from context
   */
  private extractFeatures(concept: string, context: string): string[] {
    const features: string[] = [];
    const conceptLower = concept.toLowerCase();
    const contextLower = context.toLowerCase();

    // Look for descriptive words near the concept
    const patterns = [
      new RegExp(`${conceptLower}[^.]*(?:has|contains|includes)\\s+([^.,]+)`, 'gi'),
      new RegExp(`${conceptLower}[^.]*(?:is|are)\\s+([^.,]+)`, 'gi'),
      new RegExp(`(?:features?|characteristics?|properties?)\\s+of\\s+${conceptLower}[^:]*:?\\s*([^.]+)`, 'gi')
    ];

    patterns.forEach(pattern => {
      const matches = context.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const feature = match.replace(/.*(?:has|contains|includes|is|are|:)\s*/i, '').trim();
          if (feature.length > 3 && feature.length < 50) {
            features.push(feature);
          }
        });
      }
    });

    // Extract action words
    const actionPatterns = [
      new RegExp(`${conceptLower}\\s+(\\w+s|\\w+ing)`, 'gi'),
      new RegExp(`(\\w+s|\\w+ing)\\s+${conceptLower}`, 'gi')
    ];

    actionPatterns.forEach(pattern => {
      const matches = context.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const words = match.split(/\s+/);
          const action = words.find(w => w.endsWith('s') || w.endsWith('ing'));
          if (action && action.length > 4) {
            features.push(action);
          }
        });
      }
    });

    return [...new Set(features)];
  }

  /**
   * Identify concept type
   */
  private identifyConceptType(concept: string, context: string): 'structural' | 'functional' | 'behavioral' | 'relational' {
    const contextLower = context.toLowerCase();
    
    // Check for type indicators
    if (/structure|framework|architecture|organization|hierarchy/i.test(context)) {
      return 'structural';
    }
    
    if (/function|purpose|role|task|operation|process/i.test(context)) {
      return 'functional';
    }
    
    if (/behav|react|respond|interact|dynamic|change/i.test(context)) {
      return 'behavioral';
    }
    
    if (/relation|connect|link|associate|depend|between/i.test(context)) {
      return 'relational';
    }

    // Default based on concept name patterns
    if (/system|framework|model|structure/i.test(concept)) {
      return 'structural';
    }
    
    if (/process|method|tool|engine/i.test(concept)) {
      return 'functional';
    }

    return 'functional'; // Default
  }

  /**
   * Generate analogies for a specific domain
   */
  private generateDomainAnalogies(
    concept: string,
    features: string[],
    conceptType: string,
    domain: string,
    context: string
  ): Analogy[] {
    const analogies: Analogy[] = [];
    const examples = this.domainExamples[domain as keyof typeof this.domainExamples] || [];

    examples.forEach(example => {
      // Calculate feature overlap
      const overlap = this.calculateFeatureOverlap(features, example.features);
      
      if (overlap > 0.2) {
        // Generate mapping based on concept type
        const mapping = this.generateMapping(
          concept,
          example.target,
          features,
          example.features,
          conceptType,
          context
        );

        // Calculate analogy strength
        const strength = this.calculateStrength(
          overlap,
          conceptType,
          domain,
          mapping
        );

        analogies.push({
          source: concept,
          target: example.target,
          mapping,
          strength,
          domain
        });
      }
    });

    return analogies;
  }

  /**
   * Calculate feature overlap
   */
  private calculateFeatureOverlap(features1: string[], features2: string[]): number {
    if (features1.length === 0 || features2.length === 0) {
      return 0;
    }

    let overlapCount = 0;
    
    features1.forEach(f1 => {
      features2.forEach(f2 => {
        // Check for semantic similarity (simplified)
        if (this.areSimilar(f1, f2)) {
          overlapCount++;
        }
      });
    });

    return overlapCount / Math.max(features1.length, features2.length);
  }

  /**
   * Check if two features are similar
   */
  private areSimilar(feature1: string, feature2: string): boolean {
    const f1Lower = feature1.toLowerCase();
    const f2Lower = feature2.toLowerCase();

    // Exact match
    if (f1Lower === f2Lower) return true;

    // Partial match
    if (f1Lower.includes(f2Lower) || f2Lower.includes(f1Lower)) return true;

    // Semantic groups (simplified)
    const semanticGroups = [
      ['store', 'storage', 'memory', 'repository', 'database'],
      ['process', 'processing', 'compute', 'calculation', 'operation'],
      ['connect', 'connection', 'link', 'relationship', 'association'],
      ['flow', 'stream', 'movement', 'transfer', 'transmission'],
      ['organize', 'organization', 'structure', 'arrangement', 'order'],
      ['control', 'manage', 'coordinate', 'orchestrate', 'direct']
    ];

    for (const group of semanticGroups) {
      if (group.some(w => f1Lower.includes(w)) && group.some(w => f2Lower.includes(w))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate mapping between source and target
   */
  private generateMapping(
    source: string,
    target: string,
    sourceFeatures: string[],
    targetFeatures: string[],
    conceptType: string,
    context: string
  ): string {
    const templates = this.analogyTemplates[conceptType as keyof typeof this.analogyTemplates];
    
    if (!templates) {
      return `${source} is similar to ${target} in multiple ways`;
    }

    // Find the best matching features
    let bestSourceFeature = sourceFeatures[0] || 'its nature';
    let bestTargetFeature = targetFeatures[0] || 'its function';
    
    // Try to find matching features
    for (const sf of sourceFeatures) {
      for (const tf of targetFeatures) {
        if (this.areSimilar(sf, tf)) {
          bestSourceFeature = sf;
          bestTargetFeature = tf;
          break;
        }
      }
    }

    // Select a random template and fill it
    const template = templates.templates[Math.floor(Math.random() * templates.templates.length)];
    
    let mapping = template
      .replace('{source}', source)
      .replace('{target}', target)
      .replace('{structure}', bestSourceFeature)
      .replace('{similarity}', `they both ${bestSourceFeature}`)
      .replace('{feature}', bestTargetFeature)
      .replace('{parallel}', bestSourceFeature)
      .replace('{function}', bestSourceFeature)
      .replace('{purpose}', bestSourceFeature)
      .replace('{action}', bestSourceFeature)
      .replace('{condition}', 'processing information')
      .replace('{response}', bestSourceFeature)
      .replace('{action1}', bestTargetFeature)
      .replace('{action2}', bestSourceFeature);

    return mapping;
  }

  /**
   * Calculate analogy strength
   */
  private calculateStrength(
    featureOverlap: number,
    conceptType: string,
    domain: string,
    mapping: string
  ): number {
    let strength = featureOverlap * 0.4; // Base from feature overlap

    // Bonus for matching concept type
    const domainBonus = {
      'everyday': 0.3,   // Easy to understand
      'nature': 0.25,    // Intuitive
      'technology': 0.2, // Precise
      'business': 0.15,  // Professional
      'science': 0.15    // Accurate
    };

    strength += domainBonus[domain as keyof typeof domainBonus] || 0.1;

    // Bonus for clear mapping
    if (mapping.length > 20 && mapping.length < 100) {
      strength += 0.2;
    }

    // Penalty for overly complex mapping
    if (mapping.length > 150) {
      strength -= 0.1;
    }

    return Math.min(1, Math.max(0, strength));
  }

  /**
   * Generate explanation for the analogies
   */
  private generateExplanation(concept: string, analogies: Analogy[]): string {
    if (analogies.length === 0) {
      return `${concept} is a unique concept that's difficult to compare directly to familiar items.`;
    }

    const best = analogies[0];
    let explanation = `To understand ${concept}, think of it like a ${best.target}. `;
    explanation += `${best.mapping}. `;

    if (analogies.length > 1) {
      explanation += `\n\nAlternatively, you could think of ${concept} as a ${analogies[1].target}, `;
      explanation += `where ${analogies[1].mapping.toLowerCase()}.`;
    }

    // Add domain context
    const domains = [...new Set(analogies.map(a => a.domain))];
    if (domains.length > 1) {
      explanation += `\n\nThese analogies draw from ${domains.join(' and ')} domains to provide different perspectives on how ${concept} works.`;
    }

    return explanation;
  }

  /**
   * Refine analogy based on feedback
   */
  refineAnalogy(analogy: Analogy, feedback: 'too_simple' | 'too_complex' | 'wrong_focus'): Analogy {
    const refined = { ...analogy };

    switch (feedback) {
      case 'too_simple':
        // Add more detail to the mapping
        refined.mapping += `, with additional complexity in how ${analogy.source} handles edge cases and variations`;
        break;
      
      case 'too_complex':
        // Simplify the mapping
        refined.mapping = `${analogy.source} is like ${analogy.target} - both ${this.extractCoreSimiliarity(refined.mapping)}`;
        break;
      
      case 'wrong_focus':
        // Adjust the mapping focus
        refined.mapping = `While the comparison to ${analogy.target} captures some aspects, ${analogy.source} is more about ${this.extractAlternativeFocus(analogy.source)}`;
        refined.strength *= 0.7; // Reduce strength
        break;
    }

    return refined;
  }

  /**
   * Extract core similarity from complex mapping
   */
  private extractCoreSimiliarity(mapping: string): string {
    // Extract the main verb or action
    const match = mapping.match(/both\s+(\w+)/i) || mapping.match(/(\w+ing)/);
    return match ? match[1] : 'serve similar purposes';
  }

  /**
   * Extract alternative focus
   */
  private extractAlternativeFocus(concept: string): string {
    // Provide a generic alternative based on concept name patterns
    if (/system/i.test(concept)) {
      return 'coordinating multiple components';
    }
    if (/process/i.test(concept)) {
      return 'transforming inputs into outputs';
    }
    if (/framework/i.test(concept)) {
      return 'providing structure and guidelines';
    }
    return 'achieving specific goals efficiently';
  }
}

export default AnalogyGenerator;