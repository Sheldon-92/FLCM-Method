# Progressive Learning Task

## Task ID: progressive-learning
**Version**: 2.0.0  
**Agent**: Scholar  
**Category**: Learning Methodology  

## Description
Implements the 5-level progressive learning framework to build understanding systematically from basic concepts to expert-level comprehension.

## Purpose
Transform complex information into structured learning paths that build understanding incrementally, ensuring knowledge retention and deep comprehension.

## Input Requirements
```yaml
input:
  topic: string           # The subject to learn
  complexity: string      # initial, moderate, advanced
  prior_knowledge: array  # user's existing knowledge
  learning_goals: array   # specific objectives
```

## Processing Steps
1. **Level Assessment**: Determine starting complexity level
2. **Content Breakdown**: Decompose topic into progressive layers
3. **Level 1 - Child (Age 5)**: Simplest explanation with analogies
4. **Level 2 - Teenager**: Basic concepts with practical examples  
5. **Level 3 - College**: Academic framework with theories
6. **Level 4 - Graduate**: Advanced concepts with research
7. **Level 5 - Expert**: Cutting-edge insights and debates

## Framework Implementation
```typescript
interface ProgressiveLearning {
  levels: {
    level1: SimpleExplanation;
    level2: BasicConcepts;
    level3: AcademicFramework;
    level4: AdvancedConcepts;
    level5: ExpertInsights;
  };
  progression: {
    currentLevel: number;
    readinessCheck: boolean;
    gapAnalysis: string[];
  };
}
```

## Output Format
```yaml
progressive_learning:
  topic: string
  levels:
    1:
      audience: "5-year-old child"
      explanation: string
      analogies: array
      key_concepts: array
    2:
      audience: "Smart teenager"
      explanation: string
      examples: array
      practical_applications: array
    3:
      audience: "College student"
      explanation: string
      theories: array
      academic_context: array
    4:
      audience: "Graduate student"
      explanation: string
      research: array
      debates: array
    5:
      audience: "Fellow expert"
      explanation: string
      cutting_edge: array
      future_directions: array
  progression_path:
    recommended_start: number
    estimated_time: string
    checkpoints: array
```

## Success Metrics
- **Comprehension**: Each level builds on previous understanding
- **Retention**: Knowledge persists across learning sessions
- **Application**: Learner can teach others at completed levels
- **Confidence**: Self-assessment scores improve with each level

## Integration Points
- **Input**: Receives raw content from Scholar's input processors
- **Output**: Feeds structured learning path to teach-preparation task
- **Methodology**: Uses five-levels framework from methodology library

## Example Usage
```javascript
const progressiveLearning = await scholar.executeTask('progressive-learning', {
  topic: 'Machine Learning Fundamentals',
  complexity: 'moderate',
  prior_knowledge: ['basic statistics', 'programming'],
  learning_goals: ['understand algorithms', 'apply to real problems']
});
```

## Performance Targets
- **Processing Time**: <2 seconds for standard topics
- **Memory Usage**: <50MB during processing
- **Accuracy**: 95% concept coverage across all levels

---
*Generated for FLCM 2.0 Scholar Agent - Task Implementation*