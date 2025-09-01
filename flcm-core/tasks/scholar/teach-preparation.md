# Teach Preparation Task

## Task ID: teach-preparation
**Version**: 2.0.0  
**Agent**: Scholar  
**Category**: Learning Methodology  

## Description
Implements the Protégé Effect methodology to prepare learners to teach others, maximizing knowledge retention and understanding depth.

## Purpose
Leverage the proven principle that we learn best when preparing to teach others. Organize knowledge systematically and anticipate student questions to deepen understanding.

## Input Requirements
```yaml
input:
  learned_content: object    # Output from progressive-learning
  target_audience: string    # who you'll be teaching
  teaching_format: string    # presentation, workshop, tutorial
  time_available: number     # minutes for teaching session
```

## Processing Steps
1. **Knowledge Organization**: Structure content for teaching
2. **Curriculum Design**: Create logical flow and sequence
3. **Question Anticipation**: Predict student difficulties
4. **Example Generation**: Create relatable illustrations
5. **Assessment Creation**: Design understanding checks
6. **Delivery Optimization**: Adapt for teaching format

## Protégé Effect Implementation
```typescript
interface TeachPreparation {
  curriculum: {
    structure: LessonPlan[];
    objectives: LearningObjective[];
    assessment: CheckPoints[];
  };
  teaching_materials: {
    examples: Example[];
    analogies: Analogy[];
    exercises: Practice[];
  };
  anticipation: {
    student_questions: Question[];
    common_mistakes: Misconception[];
    clarifications: Explanation[];
  };
}
```

## Output Format
```yaml
teach_preparation:
  teaching_plan:
    title: string
    target_audience: string
    duration: string
    objectives: array
  curriculum:
    outline:
      - section: string
        duration: string
        content: string
        activities: array
    key_points: array
    transitions: array
  teaching_materials:
    opening_hook: string
    examples: 
      - scenario: string
        explanation: string
        relevance: string
    analogies:
      - complex_concept: string
        simple_analogy: string
        connection: string
    exercises:
      - type: string
        instructions: string
        expected_outcome: string
  student_support:
    anticipated_questions:
      - question: string
        answer: string
        follow_up: array
    common_misconceptions:
      - misconception: string
        correction: string
        prevention: string
    difficulty_levels:
      beginner: array
      intermediate: array
      advanced: array
  assessment:
    knowledge_checks:
      - question: string
        correct_answer: string
        explanation: string
    practical_applications:
      - scenario: string
        solution_approach: string
    confidence_indicators:
      - behavior: string
        meaning: string
```

## Teaching Readiness Criteria
- **Content Mastery**: Can explain all concepts without notes
- **Question Handling**: Prepared for 80% of likely student questions
- **Example Bank**: Has 3+ examples for each major concept
- **Analogy Arsenal**: Can relate complex ideas to familiar concepts
- **Assessment Tools**: Can verify student understanding effectively

## Integration Points
- **Input**: Receives structured knowledge from progressive-learning task
- **Output**: Produces teaching-ready materials for Creator agent
- **Methodology**: Uses protege-effect framework from methodology library

## Success Metrics
- **Knowledge Retention**: 90% accuracy in self-testing
- **Teaching Confidence**: Self-assessment score >85%
- **Question Preparedness**: Can answer 80% of anticipated questions
- **Example Quality**: Examples are relevant and memorable

## Example Usage
```javascript
const teachPrep = await scholar.executeTask('teach-preparation', {
  learned_content: progressiveLearningOutput,
  target_audience: 'college students',
  teaching_format: 'workshop',
  time_available: 60
});
```

## Performance Targets
- **Processing Time**: <3 seconds for standard content
- **Memory Usage**: <75MB during processing
- **Completeness**: 100% coverage of input concepts

---
*Generated for FLCM 2.0 Scholar Agent - Task Implementation*