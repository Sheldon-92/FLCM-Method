/**
 * Schema Mapping Rules
 * Defines how to convert between v1 and v2 document formats
 */

import { 
  V1CollectorOutput, 
  V1ScholarOutput, 
  V1CreatorOutput, 
  V1AdapterOutput 
} from './v1-schemas';
import { 
  V2InsightsDocument, 
  V2KnowledgeDocument, 
  V2ContentDocument, 
  V2PublisherDocument 
} from './v2-schemas';

export interface MappingRule {
  source: string;
  target: string;
  transform?: (value: any) => any;
  defaultValue?: any;
}

export const V1_TO_V2_MAPPINGS = {
  /**
   * Collector → Insights mapping
   */
  collector_to_insights: [
    {
      source: 'insights',
      target: 'core_insights',
      transform: (insights: any[]) => insights.map((insight, index) => ({
        id: `insight_${index}`,
        insight: insight.text,
        confidence: insight.relevance,
        depth: Math.ceil(insight.relevance * 5), // Convert to 1-5 scale
        tags: []
      }))
    },
    {
      source: 'insights',
      target: 'evidence',
      transform: (insights: any[]) => insights.map((insight, index) => ({
        insight_id: `insight_${index}`,
        source: insight.evidence,
        quote: insight.evidence,
        relevance: insight.relevance
      }))
    },
    {
      source: 'rice_scores',
      target: 'metadata.framework_used',
      transform: () => 'RICE'
    },
    {
      source: 'rice_scores.total',
      target: 'metadata.depth_level',
      transform: (score: number) => Math.min(5, Math.ceil(score / 20))
    }
  ],

  /**
   * Scholar → Knowledge mapping
   */
  scholar_to_knowledge: [
    {
      source: 'understanding.key_concepts',
      target: 'concepts',
      transform: (concepts: string[]) => concepts.map((concept, index) => ({
        id: `concept_${index}`,
        name: concept,
        definition: '',
        importance: 1,
        complexity: 1,
        prerequisites: []
      }))
    },
    {
      source: 'analogies',
      target: 'relationships',
      transform: (analogies: any[]) => analogies.map(analogy => ({
        concept_a: analogy.source_domain,
        concept_b: analogy.target_domain,
        type: 'relates_to',
        description: analogy.mapping
      }))
    },
    {
      source: 'level',
      target: 'learning_progression.current_understanding',
      transform: (level: number) => level * 20 // Convert 1-5 to 0-100
    },
    {
      source: 'questions',
      target: 'learning_progression.next_concepts',
      transform: (questions: any[]) => questions.map(q => q.question)
    }
  ],

  /**
   * Creator → Content mapping
   */
  creator_to_content: [
    {
      source: 'content.title',
      target: 'title'
    },
    {
      source: 'content.body',
      target: 'body'
    },
    {
      source: 'voice_dna',
      target: 'metadata.voice',
      transform: (voice: any) => ({
        tone: voice.tone || [],
        style: voice.style || [],
        personality: voice.personality_markers || []
      })
    },
    {
      source: 'spark_elements.core_message',
      target: 'metadata.core_message'
    },
    {
      source: 'spark_elements.call_to_action',
      target: 'metadata.call_to_action'
    },
    {
      source: 'content.word_count',
      target: 'metadata.word_count'
    }
  ],

  /**
   * Adapter → Publisher mapping
   */
  adapter_to_publisher: [
    {
      source: 'platforms',
      target: 'targets',
      transform: (platforms: any) => Object.entries(platforms).map(([platform, data]: [string, any]) => ({
        platform,
        adapted_content: data.content || data.thread?.join('\n\n'),
        format_specifics: data,
        optimization_notes: [],
        estimated_reach: data.estimated_engagement || 0
      }))
    },
    {
      source: 'adaptations.platform_optimizations',
      target: 'cross_platform_strategy.content_variations'
    }
  ]
};

export const V2_TO_V1_MAPPINGS = {
  /**
   * Insights → Collector mapping
   */
  insights_to_collector: [
    {
      source: 'core_insights',
      target: 'insights',
      transform: (insights: any[]) => insights.map(insight => ({
        id: insight.id,
        text: insight.insight,
        relevance: insight.confidence,
        evidence: ''
      }))
    },
    {
      source: 'metadata.depth_level',
      target: 'rice_scores',
      transform: (depth: number) => ({
        reach: depth * 20,
        impact: depth * 20,
        confidence: depth * 20,
        effort: 100 - (depth * 20),
        total: depth * 20
      })
    }
  ],

  /**
   * Knowledge → Scholar mapping
   */
  knowledge_to_scholar: [
    {
      source: 'learning_progression.current_understanding',
      target: 'level',
      transform: (understanding: number) => Math.ceil(understanding / 20)
    },
    {
      source: 'concepts',
      target: 'understanding.key_concepts',
      transform: (concepts: any[]) => concepts.map(c => c.name)
    },
    {
      source: 'relationships',
      target: 'analogies',
      transform: (relationships: any[]) => relationships
        .filter(r => r.type === 'relates_to')
        .map(r => ({
          source_domain: r.concept_a,
          target_domain: r.concept_b,
          mapping: r.description,
          strength: 0.5
        }))
    }
  ],

  /**
   * Content → Creator mapping
   */
  content_to_creator: [
    {
      source: 'title',
      target: 'content.title'
    },
    {
      source: 'body',
      target: 'content.body'
    },
    {
      source: 'metadata.voice',
      target: 'voice_dna'
    },
    {
      source: 'metadata.core_message',
      target: 'spark_elements.core_message'
    },
    {
      source: 'metadata.call_to_action',
      target: 'spark_elements.call_to_action'
    }
  ],

  /**
   * Publisher → Adapter mapping
   */
  publisher_to_adapter: [
    {
      source: 'targets',
      target: 'platforms',
      transform: (targets: any[]) => {
        const platforms: any = {};
        targets.forEach(target => {
          platforms[target.platform] = target.format_specifics || {
            content: target.adapted_content
          };
        });
        return platforms;
      }
    }
  ]
};

/**
 * Get mapping rules for conversion
 */
export function getMappingRules(fromVersion: '1.0' | '2.0', documentType: string): MappingRule[] {
  if (fromVersion === '1.0') {
    switch (documentType) {
      case 'collector':
        return V1_TO_V2_MAPPINGS.collector_to_insights;
      case 'scholar':
        return V1_TO_V2_MAPPINGS.scholar_to_knowledge;
      case 'creator':
        return V1_TO_V2_MAPPINGS.creator_to_content;
      case 'adapter':
        return V1_TO_V2_MAPPINGS.adapter_to_publisher;
      default:
        return [];
    }
  } else {
    switch (documentType) {
      case 'insights':
        return V2_TO_V1_MAPPINGS.insights_to_collector;
      case 'knowledge':
        return V2_TO_V1_MAPPINGS.knowledge_to_scholar;
      case 'content':
        return V2_TO_V1_MAPPINGS.content_to_creator;
      case 'publisher':
        return V2_TO_V1_MAPPINGS.publisher_to_adapter;
      default:
        return [];
    }
  }
}