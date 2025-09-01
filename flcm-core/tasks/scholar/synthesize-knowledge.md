# Synthesize Knowledge Task

## Task ID: synthesize-knowledge
**Version**: 2.0.0  
**Agent**: Scholar  
**Category**: Knowledge Integration  

## Description
Combines insights from multiple analysis frameworks (SWOT-USED, SCAMPER, Socratic, 5W2H, Pyramid) into coherent, actionable understanding.

## Purpose
Transform fragmented analysis results into unified insights that reveal patterns, connections, and actionable recommendations.

## Input Requirements
```yaml
input:
  framework_results: object  # Output from all applied frameworks
  source_content: object     # Original analyzed content
  synthesis_focus: string    # practical, theoretical, strategic
  output_format: string      # brief, detailed, executive_summary
```

## Processing Steps
1. **Pattern Recognition**: Identify common themes across frameworks
2. **Insight Aggregation**: Combine complementary findings
3. **Contradiction Resolution**: Reconcile conflicting analyses
4. **Priority Ranking**: Order insights by importance and impact
5. **Connection Mapping**: Link related concepts and ideas
6. **Actionability Assessment**: Determine practical applications

## Synthesis Framework
```typescript
interface KnowledgeSynthesis {
  unified_insights: {
    core_themes: Theme[];
    key_patterns: Pattern[];
    critical_findings: Finding[];
  };
  integration: {
    framework_convergence: Convergence[];
    insight_hierarchy: Priority[];
    action_items: Action[];
  };
  quality: {
    coherence_score: number;
    completeness_score: number;
    actionability_score: number;
  };
}
```

## Output Format
```yaml
knowledge_synthesis:
  executive_summary:
    key_insight: string
    primary_theme: string
    main_conclusion: string
    confidence_level: number
  unified_insights:
    core_themes:
      - theme: string
        supporting_frameworks: array
        evidence: array
        importance: number
    key_patterns:
      - pattern: string
        manifestations: array
        implications: array
        frequency: number
    critical_findings:
      - finding: string
        source_frameworks: array
        impact_level: string
        actionability: string
  framework_integration:
    swot_used_contribution:
      strengths: array
      opportunities: array
      unique_insights: array
    scamper_contribution:
      innovation_potential: array
      adaptation_ideas: array
      improvement_suggestions: array
    socratic_contribution:
      key_questions: array
      assumption_challenges: array
      deeper_inquiries: array
    five_w_2h_contribution:
      contextual_clarity: array
      process_insights: array
      quantitative_aspects: array
    pyramid_contribution:
      logical_structure: array
      hierarchical_relationships: array
      supporting_evidence: array
  synthesis_quality:
    coherence:
      score: number
      explanation: string
      improvement_areas: array
    completeness:
      coverage_percentage: number
      missing_elements: array
      addressed_aspects: array
    actionability:
      immediate_actions: array
      strategic_recommendations: array
      implementation_priority: array
  ready_for_creation:
    content_brief: string
    target_audience: string
    key_messages: array
    supporting_points: array
    creative_hooks: array
```

## Synthesis Quality Metrics
- **Coherence**: All insights align and support each other
- **Completeness**: No major gaps in understanding
- **Actionability**: Clear next steps and recommendations
- **Originality**: Novel connections and unique insights
- **Depth**: Beyond surface-level observations

## Integration Points
- **Input**: Receives analysis results from all Scholar frameworks
- **Output**: Provides unified brief to Creator agent handoff
- **Dependencies**: Requires framework results to be complete

## Success Criteria
- **Pattern Recognition**: Identifies 3-5 major themes
- **Integration Quality**: >85% coherence score
- **Actionability**: Provides 5-10 concrete recommendations
- **Readiness**: Produces complete creative brief

## Example Usage
```javascript
const synthesis = await scholar.executeTask('synthesize-knowledge', {
  framework_results: {
    swot_used: swotResults,
    scamper: scamperResults,
    socratic: socraticResults,
    five_w_2h: fiveW2HResults,
    pyramid: pyramidResults
  },
  source_content: originalInput,
  synthesis_focus: 'practical',
  output_format: 'detailed'
});
```

## Performance Targets
- **Processing Time**: <2 seconds for standard synthesis
- **Memory Usage**: <100MB during processing
- **Insight Quality**: >90% relevance score
- **Integration Completeness**: 100% framework coverage

---
*Generated for FLCM 2.0 Scholar Agent - Task Implementation*