"use strict";
/**
 * Schema Mapping Rules
 * Defines how to convert between v1 and v2 document formats
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMappingRules = exports.V2_TO_V1_MAPPINGS = exports.V1_TO_V2_MAPPINGS = void 0;
exports.V1_TO_V2_MAPPINGS = {
    /**
     * Collector → Insights mapping
     */
    collector_to_insights: [
        {
            source: 'insights',
            target: 'core_insights',
            transform: (insights) => insights.map((insight, index) => ({
                id: `insight_${index}`,
                insight: insight.text,
                confidence: insight.relevance,
                depth: Math.ceil(insight.relevance * 5),
                tags: []
            }))
        },
        {
            source: 'insights',
            target: 'evidence',
            transform: (insights) => insights.map((insight, index) => ({
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
            transform: (score) => Math.min(5, Math.ceil(score / 20))
        }
    ],
    /**
     * Scholar → Knowledge mapping
     */
    scholar_to_knowledge: [
        {
            source: 'understanding.key_concepts',
            target: 'concepts',
            transform: (concepts) => concepts.map((concept, index) => ({
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
            transform: (analogies) => analogies.map(analogy => ({
                concept_a: analogy.source_domain,
                concept_b: analogy.target_domain,
                type: 'relates_to',
                description: analogy.mapping
            }))
        },
        {
            source: 'level',
            target: 'learning_progression.current_understanding',
            transform: (level) => level * 20 // Convert 1-5 to 0-100
        },
        {
            source: 'questions',
            target: 'learning_progression.next_concepts',
            transform: (questions) => questions.map(q => q.question)
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
            transform: (voice) => ({
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
            transform: (platforms) => Object.entries(platforms).map(([platform, data]) => ({
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
exports.V2_TO_V1_MAPPINGS = {
    /**
     * Insights → Collector mapping
     */
    insights_to_collector: [
        {
            source: 'core_insights',
            target: 'insights',
            transform: (insights) => insights.map(insight => ({
                id: insight.id,
                text: insight.insight,
                relevance: insight.confidence,
                evidence: ''
            }))
        },
        {
            source: 'metadata.depth_level',
            target: 'rice_scores',
            transform: (depth) => ({
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
            transform: (understanding) => Math.ceil(understanding / 20)
        },
        {
            source: 'concepts',
            target: 'understanding.key_concepts',
            transform: (concepts) => concepts.map(c => c.name)
        },
        {
            source: 'relationships',
            target: 'analogies',
            transform: (relationships) => relationships
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
            transform: (targets) => {
                const platforms = {};
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
function getMappingRules(fromVersion, documentType) {
    if (fromVersion === '1.0') {
        switch (documentType) {
            case 'collector':
                return exports.V1_TO_V2_MAPPINGS.collector_to_insights;
            case 'scholar':
                return exports.V1_TO_V2_MAPPINGS.scholar_to_knowledge;
            case 'creator':
                return exports.V1_TO_V2_MAPPINGS.creator_to_content;
            case 'adapter':
                return exports.V1_TO_V2_MAPPINGS.adapter_to_publisher;
            default:
                return [];
        }
    }
    else {
        switch (documentType) {
            case 'insights':
                return exports.V2_TO_V1_MAPPINGS.insights_to_collector;
            case 'knowledge':
                return exports.V2_TO_V1_MAPPINGS.knowledge_to_scholar;
            case 'content':
                return exports.V2_TO_V1_MAPPINGS.content_to_creator;
            case 'publisher':
                return exports.V2_TO_V1_MAPPINGS.publisher_to_adapter;
            default:
                return [];
        }
    }
}
exports.getMappingRules = getMappingRules;
//# sourceMappingURL=mapping-rules.js.map