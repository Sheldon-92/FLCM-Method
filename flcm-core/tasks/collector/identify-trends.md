# Identify Trends Task

## Task ID: identify-trends
**Version**: 2.0.0  
**Agent**: Collector  
**Category**: Pattern Recognition  

## Description
Analyzes collected information to identify emerging trends, patterns, and shifts in industry, technology, culture, and market dynamics for strategic content planning.

## Purpose
Discover trending topics, emerging patterns, and future opportunities by analyzing large volumes of information to stay ahead of market developments and audience interests.

## Input Requirements
```yaml
input:
  information_dataset: object    # Comprehensive collected information
  trend_scope: array            # Technology, industry, culture, market
  time_horizon: string          # Short-term, medium-term, long-term
  geographic_focus: array       # Regions/markets to analyze
  confidence_threshold: number  # Minimum confidence for trend identification
  historical_context: object    # Past trends for pattern comparison
  signal_strength: string       # Weak signals vs strong indicators
```

## Processing Steps
1. **Data Preprocessing**: Clean and structure information for analysis
2. **Pattern Detection**: Identify recurring themes and emerging signals
3. **Frequency Analysis**: Measure mention patterns and growth rates
4. **Sentiment Tracking**: Monitor opinion shifts and emotional indicators
5. **Cross-Reference Validation**: Verify trends across multiple sources
6. **Momentum Assessment**: Evaluate trend acceleration and sustainability
7. **Future Projection**: Estimate trend trajectory and implications

## Trend Identification Framework
```typescript
interface TrendIdentification {
  detection_methods: {
    frequency_analysis: FrequencyPattern[];
    sentiment_tracking: SentimentTrend[];
    network_analysis: NetworkPattern[];
    temporal_analysis: TemporalPattern[];
  };
  trend_categories: {
    emerging_trends: EmergingTrend[];
    growing_trends: GrowingTrend[];
    declining_trends: DecliningTrend[];
    cyclical_patterns: CyclicalPattern[];
  };
  validation_metrics: {
    confidence_scores: number[];
    source_diversity: number;
    momentum_indicators: MomentumMetric[];
  };
}
```

## Output Format
```yaml
trend_identification:
  analysis_summary:
    dataset_size: number
    analysis_period: string
    trends_identified: number
    confidence_level: number
    geographic_coverage: array
    trend_categories_found: array
  emerging_trends:
    - trend_id: string
      title: string
      description: string
      category: string
      emergence_timeline: string
      confidence_score: number
      growth_trajectory: string
      supporting_indicators:
        mention_frequency: number
        growth_rate: number
        source_diversity: number
        expert_validation: array
        social_signals: array
      geographic_distribution:
        - region: string
          strength: number
          early_adopters: array
          market_readiness: string
      key_drivers:
        - driver: string
          impact_level: string
          evidence: array
      implications:
        opportunities: array
        threats: array
        strategic_considerations: array
      timeline_projection:
        early_stage: string
        growth_phase: string
        maturity_estimate: string
  growing_trends:
    - trend_id: string
      title: string
      current_momentum: string
      acceleration_factors: array
      market_adoption: string
      competitive_landscape: array
      growth_indicators:
        search_volume_change: number
        media_coverage_increase: number
        investment_activity: array
        adoption_metrics: array
      sustainability_assessment:
        longevity_prediction: string
        risk_factors: array
        supporting_infrastructure: array
  declining_trends:
    - trend_id: string
      title: string
      decline_indicators: array
      replacement_trends: array
      sunset_timeline: string
      legacy_considerations: array
  cyclical_patterns:
    - pattern_id: string
      cycle_description: string
      historical_occurrences: array
      cycle_length: string
      current_phase: string
      next_phase_prediction: string
  cross_cutting_themes:
    - theme: string
      trends_involved: array
      interconnections: array
      collective_impact: string
      strategic_importance: string
  weak_signals:
    - signal: string
      early_indicators: array
      potential_development: string
      monitoring_recommendations: array
      breakthrough_potential: string
  trend_intersections:
    - intersection: string
      converging_trends: array
      synergistic_effects: array
      new_opportunities: array
      innovation_potential: string
  industry_specific_analysis:
    technology_trends:
      - trend: string
        adoption_curve: string
        disruption_potential: string
        implementation_timeline: string
    market_trends:
      - trend: string
        economic_drivers: array
        consumer_behavior_shifts: array
        business_model_implications: array
    cultural_trends:
      - trend: string
        demographic_drivers: array
        value_shifts: array
        lifestyle_changes: array
    regulatory_trends:
      - trend: string
        policy_changes: array
        compliance_implications: array
        market_impact: string
  predictive_insights:
    short_term_predictions:
      - prediction: string
        timeframe: string
        confidence: number
        key_indicators_to_watch: array
    medium_term_outlook:
      - outlook: string
        timeframe: string
        driving_factors: array
        potential_scenarios: array
    long_term_vision:
      - vision: string
        timeframe: string
        transformative_potential: string
        preparation_recommendations: array
  strategic_recommendations:
    immediate_actions:
      - action: string
        rationale: string
        expected_outcome: string
        resource_requirements: string
    monitoring_priorities:
      - trend: string
        monitoring_frequency: string
        key_metrics: array
        alert_triggers: array
    content_opportunities:
      - opportunity: string
        trend_alignment: array
        audience_interest: string
        competitive_advantage: string
    innovation_directions:
      - direction: string
        supporting_trends: array
        market_potential: string
        development_approach: string
```

## Trend Categories

### Emerging Trends
- **Early Stage Indicators**: Weak signals gaining strength
- **Innovation Breakthroughs**: New technologies or approaches
- **Cultural Shifts**: Changing values and behaviors
- **Market Disruptions**: New business models emerging

### Growing Trends
- **Accelerating Adoption**: Increasing market penetration
- **Mainstream Movement**: Moving from niche to mainstream
- **Investment Influx**: Significant capital flowing into area
- **Infrastructure Development**: Supporting systems being built

### Declining Trends
- **Saturation Signals**: Market maturity indicators
- **Replacement Technologies**: Better alternatives emerging
- **Cultural Evolution**: Changing preferences and values
- **Regulatory Obsolescence**: Policy changes making trends irrelevant

### Cyclical Patterns
- **Seasonal Cycles**: Regular recurring patterns
- **Economic Cycles**: Business cycle dependent trends
- **Generational Cycles**: Demographic-driven patterns
- **Technology Cycles**: Innovation adoption patterns

## Detection Methodologies

### Frequency Analysis
- **Mention Tracking**: Count references across sources
- **Growth Rate Calculation**: Measure increase over time
- **Source Diversity**: Ensure broad-based emergence
- **Context Analysis**: Understand discussion contexts

### Sentiment Analysis
- **Opinion Evolution**: Track changing attitudes
- **Emotional Indicators**: Enthusiasm, concern, excitement
- **Expert Sentiment**: Professional opinion shifts
- **Public Perception**: General audience reactions

### Network Analysis
- **Influence Mapping**: Who's driving conversations
- **Connection Patterns**: How topics interconnect
- **Information Flow**: How trends spread
- **Authority Validation**: Expert endorsement patterns

### Temporal Analysis
- **Timeline Mapping**: When trends emerged and evolved
- **Acceleration Points**: When growth rates changed
- **Lifecycle Staging**: Current maturity phase
- **Future Trajectories**: Projected development paths

## Validation Criteria

### Signal Strength Assessment
- **Source Quality**: Credible, authoritative sources
- **Geographic Spread**: Multiple regions showing signals
- **Demographic Diversity**: Various audience segments involved
- **Expert Consensus**: Professional validation and discussion

### Momentum Indicators
- **Growth Consistency**: Sustained rather than sporadic growth
- **Investment Activity**: Financial backing and resource allocation
- **Media Coverage**: Increasing attention from major outlets
- **Academic Interest**: Research and scholarly attention

### Sustainability Factors
- **Infrastructure Development**: Supporting systems being built
- **Regulatory Support**: Favorable policy environment
- **Market Readiness**: Audience prepared for adoption
- **Economic Viability**: Business case development

## Integration Points
- **Information Collection**: Analyzes comprehensive data sets
- **Strategic Planning**: Informs long-term content and business strategy
- **Content Calendar**: Identifies topics for future content creation
- **Competitive Intelligence**: Reveals market opportunities and threats

## Example Usage
```javascript
const trendAnalysis = await collector.executeTask('identify-trends', {
  information_dataset: comprehensiveDataset,
  trend_scope: ['technology', 'marketing', 'culture'],
  time_horizon: 'medium-term',
  geographic_focus: ['north_america', 'asia_pacific'],
  confidence_threshold: 0.75,
  historical_context: pastTrends,
  signal_strength: 'medium_to_strong'
});
```

## Performance Targets
- **Trend Accuracy**: 80% of identified trends prove significant within predicted timeframes
- **Early Detection**: Identify trends 3-6 months before mainstream recognition
- **Coverage Completeness**: 95% coverage of major industry developments
- **False Positive Rate**: <20% of identified trends fail to materialize

---
*Generated for FLCM 2.0 Collector Agent - Task Implementation*