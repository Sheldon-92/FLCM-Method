# Collect Information Task

## Task ID: collect-information
**Version**: 2.0.0  
**Agent**: Collector  
**Category**: Information Gathering  

## Description
Systematically gathers, validates, and organizes information from multiple sources to create comprehensive knowledge bases for content creation and analysis.

## Purpose
Efficiently collect relevant, accurate, and timely information from diverse sources while ensuring quality, credibility, and relevance to user's content goals.

## Input Requirements
```yaml
input:
  topic: string              # Primary subject for information gathering
  source_types: array        # web, academic, social, news, expert
  depth_level: string        # surface, moderate, comprehensive
  recency_requirement: string # latest, recent, historical, all
  credibility_threshold: number # Minimum source credibility score
  geographic_scope: string   # global, regional, local
  language_preferences: array # Preferred content languages
```

## Processing Steps
1. **Source Identification**: Locate relevant information sources
2. **Content Extraction**: Gather information from identified sources
3. **Quality Assessment**: Evaluate credibility and relevance
4. **Information Validation**: Cross-reference and fact-check
5. **Organization**: Structure collected information logically
6. **Metadata Enrichment**: Add source attribution and context
7. **Relevance Ranking**: Prioritize information by importance

## Information Collection Framework
```typescript
interface InformationCollection {
  sources: {
    web_sources: WebSource[];
    academic_sources: AcademicSource[];
    social_sources: SocialSource[];
    expert_sources: ExpertSource[];
  };
  content: {
    facts: Fact[];
    opinions: Opinion[];
    statistics: Statistic[];
    case_studies: CaseStudy[];
  };
  quality_metrics: {
    credibility_scores: number[];
    relevance_ratings: number[];
    recency_distribution: RecencyMetric[];
  };
}
```

## Output Format
```yaml
information_collection:
  collection_summary:
    topic: string
    sources_accessed: number
    information_items: number
    quality_score: number
    collection_completeness: number
    processing_time: string
  collected_information:
    primary_facts:
      - fact: string
        source: string
        credibility_score: number
        verification_status: string
        recency: string
        geographic_relevance: string
        supporting_sources: array
    key_statistics:
      - statistic: string
        value: string
        source: string
        date: string
        methodology: string
        margin_of_error: string
        context: string
    expert_opinions:
      - opinion: string
        expert: string
        credentials: string
        source: string
        relevance_score: number
        supporting_evidence: array
        contrasting_views: array
    case_studies:
      - title: string
        organization: string
        situation: string
        approach: string
        results: string
        lessons_learned: array
        applicability: string
    trend_insights:
      - trend: string
        direction: string
        timeframe: string
        supporting_data: array
        expert_validation: array
        implications: array
  source_analysis:
    web_sources:
      - url: string
        domain: string
        credibility_score: number
        content_type: string
        last_updated: string
        author_credentials: string
        bias_assessment: string
    academic_sources:
      - title: string
        authors: array
        journal: string
        publication_date: string
        citation_count: number
        peer_review_status: string
        relevance_score: number
    social_sources:
      - platform: string
        source: string
        follower_count: number
        engagement_rate: number
        content_type: string
        sentiment: string
        influence_score: number
    expert_sources:
      - name: string
        credentials: string
        expertise_areas: array
        organization: string
        quote: string
        contact_method: string
        validation_score: number
  quality_assessment:
    credibility_distribution:
      high_credibility: number
      medium_credibility: number
      low_credibility: number
      unverified: number
    recency_analysis:
      very_recent: number      # Within 30 days
      recent: number           # Within 6 months
      somewhat_recent: number  # Within 2 years
      older: number           # Over 2 years
    geographic_coverage:
      global_perspective: number
      regional_insights: number
      local_information: number
      geographic_gaps: array
    bias_assessment:
      neutral_sources: number
      slightly_biased: number
      highly_biased: number
      bias_directions: array
  validation_results:
    cross_referenced_facts: number
    conflicting_information: array
    verification_confidence: number
    fact_check_results: array
    source_consistency: number
  organization_structure:
    primary_themes: array
    subtopics: array
    information_hierarchy: object
    knowledge_gaps: array
    follow_up_research_needed: array
  metadata_enrichment:
    source_attribution: array
    contextual_information: array
    related_topics: array
    keyword_extraction: array
    sentiment_analysis: object
```

## Source Types and Strategies

### Web Sources
- **News Sites**: Current events and trending topics
- **Industry Publications**: Specialized knowledge and insights
- **Government Data**: Official statistics and reports
- **Company Resources**: Official statements and data

### Academic Sources
- **Peer-reviewed Journals**: Validated research findings
- **Conference Papers**: Latest research developments
- **Thesis Works**: In-depth specialized studies
- **Research Institutions**: Authoritative knowledge sources

### Social Sources
- **Expert Profiles**: Industry thought leaders
- **Community Discussions**: Public opinion and trends
- **User-generated Content**: Real-world experiences
- **Influencer Insights**: Opinion leadership content

### Expert Sources
- **Direct Interviews**: Primary source information
- **Expert Quotes**: Authoritative perspectives
- **Professional Networks**: Industry connections
- **Thought Leaders**: Recognized expertise

## Quality Assessment Criteria

### Credibility Evaluation
- **Source Authority**: Recognized expertise and reputation
- **Editorial Standards**: Publication quality and review process
- **Factual Accuracy**: Verifiable claims and data
- **Bias Assessment**: Neutrality and balanced perspective

### Relevance Scoring
- **Topic Alignment**: Direct relevance to collection focus
- **Audience Appropriateness**: Suitable for target audience
- **Actionability**: Practical application potential
- **Uniqueness**: Novel insights and perspectives

### Recency Requirements
- **Time Sensitivity**: Currency of information importance
- **Update Frequency**: How often information changes
- **Historical Context**: Background information needs
- **Trend Identification**: Temporal pattern recognition

## Information Organization

### Thematic Grouping
- **Primary Categories**: Main topic divisions
- **Subcategory Organization**: Detailed topic breakdown
- **Cross-reference Links**: Interconnected information
- **Priority Ranking**: Importance-based ordering

### Metadata Structure
- **Source Attribution**: Complete citation information
- **Quality Indicators**: Credibility and relevance scores
- **Context Information**: Background and circumstances
- **Update Tracking**: Information freshness monitoring

## Validation Processes

### Fact Verification
- **Source Cross-referencing**: Multiple source confirmation
- **Expert Validation**: Professional review and confirmation
- **Data Consistency**: Statistical and logical coherence
- **Bias Detection**: Identifying and noting perspective biases

### Completeness Assessment
- **Coverage Analysis**: Information gap identification
- **Perspective Balance**: Multiple viewpoint inclusion
- **Depth Evaluation**: Surface vs comprehensive coverage
- **Update Requirements**: Ongoing information needs

## Integration Points
- **Scholar Agent**: Provides raw material for analysis
- **Content Strategy**: Informs content planning and creation
- **Trend Analysis**: Feeds pattern recognition systems
- **Knowledge Base**: Builds organizational memory

## Example Usage
```javascript
const collectedInfo = await collector.executeTask('collect-information', {
  topic: 'AI impact on marketing automation',
  source_types: ['web', 'academic', 'expert'],
  depth_level: 'comprehensive',
  recency_requirement: 'recent',
  credibility_threshold: 0.7,
  geographic_scope: 'global',
  language_preferences: ['en', 'zh']
});
```

## Performance Targets
- **Collection Speed**: 50+ sources analyzed per minute
- **Quality Score**: >85% average credibility rating
- **Completeness**: 95% coverage of primary topic areas
- **Accuracy**: <5% misinformation detection rate

---
*Generated for FLCM 2.0 Collector Agent - Task Implementation*