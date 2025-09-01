# Score Insights Task

## Task ID: score-insights
**Version**: 2.0.0  
**Agent**: Collector  
**Category**: Information Analysis  

## Description
Evaluates and scores collected information based on novelty, relevance, credibility, and actionability to identify the most valuable insights for content creation.

## Purpose
Prioritize information by value and potential impact, ensuring that the most meaningful and actionable insights are highlighted for further analysis and content development.

## Input Requirements
```yaml
input:
  collected_information: object  # Output from collect-information task
  scoring_criteria: object      # Customized scoring parameters
  target_audience: string       # Audience for relevance scoring
  content_goals: array          # Intended use of insights
  industry_context: string      # Domain-specific considerations
  competitive_landscape: object # Context for uniqueness scoring
  urgency_factors: array        # Time-sensitive considerations
```

## Processing Steps
1. **Criteria Definition**: Establish scoring framework parameters
2. **Multi-dimensional Analysis**: Evaluate each insight across criteria
3. **Weighted Scoring**: Apply importance weights to different factors
4. **Comparative Ranking**: Rank insights against each other
5. **Quality Filtering**: Remove low-value information
6. **Context Adjustment**: Adjust scores based on specific use cases
7. **Final Prioritization**: Generate ordered insight recommendations

## Insight Scoring Framework
```typescript
interface InsightScoring {
  scoring_dimensions: {
    novelty: NoveltyScore;
    relevance: RelevanceScore;
    credibility: CredibilityScore;
    actionability: ActionabilityScore;
    impact_potential: ImpactScore;
  };
  weighted_results: {
    scored_insights: ScoredInsight[];
    ranking_distribution: RankingDistribution;
    quality_tiers: QualityTier[];
  };
}
```

## Output Format
```yaml
insight_scoring:
  scoring_summary:
    total_insights_evaluated: number
    scoring_criteria_applied: array
    average_score: number
    score_distribution: object
    high_value_insights: number
  scoring_methodology:
    criteria_weights:
      novelty: number
      relevance: number
      credibility: number
      actionability: number
      impact_potential: number
      timeliness: number
    adjustment_factors:
      audience_specificity: number
      competitive_advantage: number
      implementation_feasibility: number
      trend_alignment: number
  scored_insights:
    - insight_id: string
      content: string
      overall_score: number
      dimension_scores:
        novelty_score: number
        relevance_score: number
        credibility_score: number
        actionability_score: number
        impact_potential_score: number
        timeliness_score: number
      supporting_evidence:
        source_count: number
        expert_validation: array
        data_strength: number
        verification_level: string
      competitive_analysis:
        uniqueness_rating: number
        market_differentiation: string
        competitive_advantage: string
        timing_advantage: string
      implementation_assessment:
        difficulty_level: string
        resource_requirements: string
        timeline_estimate: string
        success_probability: number
      audience_alignment:
        relevance_explanation: string
        interest_level: string
        knowledge_gap_addressed: string
        value_proposition: string
  quality_tiers:
    tier_1_premium:
      score_range: string
      insight_count: number
      characteristics: array
      recommended_use: array
      insights:
        - insight: string
          score: number
          key_strengths: array
          implementation_priority: string
    tier_2_high_value:
      score_range: string
      insight_count: number
      characteristics: array
      recommended_use: array
      insights:
        - insight: string
          score: number
          key_strengths: array
          implementation_priority: string
    tier_3_standard:
      score_range: string
      insight_count: number
      characteristics: array
      recommended_use: array
    tier_4_supplementary:
      score_range: string
      insight_count: number
      characteristics: array
      recommended_use: array
  dimension_analysis:
    novelty_analysis:
      highly_novel_insights: number
      innovative_perspectives: array
      breakthrough_potential: array
      knowledge_advancement: array
    relevance_analysis:
      direct_relevance: number
      audience_alignment: number
      problem_solving_value: array
      interest_matching: array
    credibility_analysis:
      high_credibility_sources: number
      expert_endorsements: array
      data_validation: array
      factual_accuracy: number
    actionability_analysis:
      immediately_actionable: number
      implementation_guidance: array
      practical_applications: array
      step_by_step_clarity: array
    impact_analysis:
      high_impact_potential: number
      transformative_insights: array
      strategic_implications: array
      measurable_outcomes: array
  competitive_intelligence:
    unique_insights: array
    market_gaps_addressed: array
    differentiation_opportunities: array
    timing_advantages: array
    competitive_blind_spots: array
  recommendation_engine:
    priority_insights:
      - rank: number
        insight: string
        reasoning: string
        next_steps: array
        expected_impact: string
    content_strategy_implications:
      - implication: string
        insights_supporting: array
        implementation_approach: string
        success_metrics: array
    research_gaps_identified:
      - gap: string
        importance: string
        research_approach: string
        resource_requirements: string
```

## Scoring Dimensions

### Novelty Scoring (0-100)
- **Information Uniqueness**: How rare or uncommon is this insight?
- **Perspective Innovation**: Does it offer a new way of thinking?
- **Market Timing**: Is this emerging or ahead of trends?
- **Knowledge Advancement**: Does it push understanding forward?

### Relevance Scoring (0-100)
- **Audience Alignment**: Direct relevance to target audience
- **Problem Solving**: Addresses specific audience pain points
- **Interest Level**: Likely to capture audience attention
- **Context Appropriateness**: Fits current market/industry context

### Credibility Scoring (0-100)
- **Source Authority**: Reputation and expertise of information source
- **Evidence Strength**: Quality and quantity of supporting data
- **Validation Level**: Expert review and fact-checking status
- **Bias Assessment**: Neutrality and balanced perspective

### Actionability Scoring (0-100)
- **Implementation Clarity**: Clear next steps and guidance
- **Feasibility**: Realistic to implement with available resources
- **Measurability**: Can track progress and outcomes
- **Time to Value**: How quickly benefits can be realized

### Impact Potential Scoring (0-100)
- **Transformation Potential**: Degree of positive change possible
- **Strategic Value**: Alignment with long-term goals
- **Competitive Advantage**: Differentiation from competitors
- **Scalability**: Can grow and expand over time

### Timeliness Scoring (0-100)
- **Urgency**: Time-sensitive nature of the insight
- **Trend Alignment**: Fits with current market trends
- **Window of Opportunity**: Limited time for optimal impact
- **Seasonal Relevance**: Timing-dependent value

## Weighting Strategies

### Content Creation Focus
- **Novelty**: 25% - Unique content stands out
- **Relevance**: 30% - Must resonate with audience
- **Credibility**: 20% - Trustworthy information essential
- **Actionability**: 15% - Practical value important
- **Impact**: 10% - Long-term value consideration

### Strategic Planning Focus
- **Impact**: 35% - Strategic value paramount
- **Credibility**: 25% - Foundation for decisions
- **Relevance**: 20% - Must align with goals
- **Actionability**: 15% - Implementation feasibility
- **Novelty**: 5% - Innovation nice but not critical

### Competitive Intelligence Focus
- **Novelty**: 40% - Unique insights provide advantage
- **Impact**: 25% - Game-changing potential
- **Timeliness**: 15% - First-mover advantages
- **Credibility**: 15% - Accurate intelligence essential
- **Actionability**: 5% - Focus on intelligence gathering

## Quality Tiers

### Tier 1 - Premium Insights (90-100 points)
- **Characteristics**: Highly novel, extremely relevant, credible, actionable
- **Recommended Use**: Featured content, strategic initiatives, thought leadership
- **Implementation**: High priority, dedicated resources

### Tier 2 - High Value Insights (75-89 points)
- **Characteristics**: Strong across multiple dimensions, clear value
- **Recommended Use**: Main content themes, tactical implementation
- **Implementation**: Medium-high priority, standard resources

### Tier 3 - Standard Insights (60-74 points)
- **Characteristics**: Solid value, good supporting evidence
- **Recommended Use**: Supporting content, background information
- **Implementation**: Medium priority, efficient execution

### Tier 4 - Supplementary Insights (40-59 points)
- **Characteristics**: Basic value, limited unique perspective
- **Recommended Use**: Context, reference material, archives
- **Implementation**: Low priority, minimal resource allocation

## Integration Points
- **Information Collection**: Analyzes output from collect-information task
- **Scholar Agent**: Provides scored insights for framework analysis
- **Content Planning**: Informs editorial calendar and content priorities
- **Competitive Intelligence**: Feeds strategic decision-making

## Example Usage
```javascript
const scoredInsights = await collector.executeTask('score-insights', {
  collected_information: collectionResults,
  scoring_criteria: customWeights,
  target_audience: 'marketing professionals',
  content_goals: ['thought_leadership', 'education'],
  industry_context: 'martech',
  competitive_landscape: competitorAnalysis,
  urgency_factors: ['product_launch', 'conference_season']
});
```

## Performance Targets
- **Scoring Accuracy**: 90% correlation with human expert evaluation
- **Processing Speed**: 1000+ insights scored per minute
- **Quality Distribution**: 20% tier 1, 30% tier 2, 35% tier 3, 15% tier 4
- **Recommendation Precision**: 85% of priority insights prove valuable in practice

---
*Generated for FLCM 2.0 Collector Agent - Task Implementation*