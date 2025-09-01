# Create Hooks Task

## Task ID: create-hooks
**Version**: 2.0.0  
**Agent**: Creator  
**Category**: Engagement Generation  

## Description
Generates compelling opening hooks that capture attention, build curiosity, and compel audiences to continue reading while maintaining voice authenticity.

## Purpose
Create powerful first impressions that maximize content engagement by using proven hook techniques tailored to the user's voice and target audience.

## Input Requirements
```yaml
input:
  content_topic: string      # Main subject matter
  key_insights: array        # Primary takeaways to highlight
  target_audience: string    # Specific audience profile
  voice_profile: object      # User's voice DNA characteristics
  hook_types: array          # Preferred hook styles
  platform_context: string  # Publishing platform constraints
  urgency_level: string      # low, medium, high, critical
```

## Processing Steps
1. **Audience Analysis**: Understand target reader psychology
2. **Insight Prioritization**: Identify most compelling angles
3. **Hook Type Selection**: Choose optimal approach for context
4. **Voice Integration**: Apply user's communication style
5. **Multiple Generation**: Create 3-5 hook variations
6. **Effectiveness Scoring**: Rate each hook's potential impact
7. **Optimization**: Refine top performers

## Hook Framework Types
```typescript
interface HookCreation {
  hook_types: {
    question: QuestionHook;
    story: StoryHook;
    statistic: StatisticHook;
    contradiction: ContradictionHook;
    promise: PromiseHook;
  };
  optimization: {
    audience_fit: number;
    voice_consistency: number;
    engagement_potential: number;
  };
  variations: HookVariation[];
}
```

## Output Format
```yaml
hook_creation:
  analysis:
    content_topic: string
    target_audience: string
    key_angles: array
    emotional_drivers: array
    attention_triggers: array
  generated_hooks:
    - id: string
      type: string
      content: string
      technique: string
      appeal_factor: string
      estimated_engagement: number
      voice_consistency: number
      audience_fit: number
      platform_optimization: string
      reasoning: string
  hook_types_used:
    question_hooks:
      - hook: string
        question_type: string
        curiosity_level: string
        answer_promise: string
    story_hooks:
      - hook: string
        narrative_type: string
        relatability: string
        emotional_connection: string
    statistic_hooks:
      - hook: string
        data_type: string
        surprise_factor: string
        relevance_score: string
    contradiction_hooks:
      - hook: string
        assumption_challenged: string
        controversy_level: string
        intrigue_factor: string
    promise_hooks:
      - hook: string
        value_proposition: string
        credibility: string
        specificity: string
  optimization_insights:
    best_performing:
      hook_id: string
      projected_engagement: number
      strengths: array
      optimization_notes: array
    audience_resonance:
      psychological_triggers: array
      emotional_appeals: array
      curiosity_gaps: array
    voice_integration:
      authentic_elements: array
      consistency_score: number
      personality_reflection: array
  recommendations:
    primary_hook: string
    backup_options: array
    testing_suggestions: array
    improvement_areas: array
```

## Hook Type Specifications

### Question Hooks
- **Direct Questions**: "What if I told you...?"
- **Rhetorical Questions**: Challenge assumptions
- **Multiple Choice**: "Which of these..."
- **Yes/No Setups**: "Are you making this mistake?"

### Story Hooks
- **Personal Anecdotes**: User's authentic experiences
- **Case Studies**: Customer/client stories
- **Historical References**: Relevant past events
- **Scenario Painting**: "Imagine if..."

### Statistic Hooks
- **Surprising Numbers**: Counterintuitive data
- **Comparative Stats**: Before/after comparisons  
- **Trend Revelations**: Emerging patterns
- **Research Findings**: Credible study results

### Contradiction Hooks
- **Myth Busting**: Challenge common beliefs
- **Contrarian Takes**: Opposite perspectives
- **Paradox Presentation**: Apparent contradictions
- **Assumption Challenges**: Question the obvious

### Promise Hooks
- **Value Promises**: Clear benefit statements
- **Transformation Promises**: Before/after states
- **Learning Promises**: Knowledge to be gained
- **Solution Promises**: Problems to be solved

## Audience-Specific Optimization

### Professional Audiences
- Data-driven hooks with credible statistics
- Industry-specific references and terminology
- Authority-building language and credentials
- ROI and efficiency focused promises

### General Consumers
- Relatable personal stories and experiences
- Simple, clear language and concepts
- Emotional resonance and connection
- Practical benefits and outcomes

### Technical Specialists
- Detailed methodology and process hooks
- Problem-solving and optimization angles
- Innovation and breakthrough focuses
- Peer recognition and expertise validation

## Platform Adaptations
- **LinkedIn**: Professional authority and insight
- **Twitter**: Punchy, conversation-starting
- **Blog Posts**: Comprehensive value promises
- **Newsletters**: Personal connection and updates

## Effectiveness Metrics
- **Attention Capture**: Does it make you stop scrolling?
- **Curiosity Generation**: Do you need to know more?
- **Relevance**: Does it speak to target audience?
- **Authenticity**: Does it sound like the user?
- **Action Trigger**: Does it compel continued reading?

## Integration Points
- **Voice Profile**: Maintains user's communication style
- **Content Strategy**: Aligns with overall message
- **Audience Data**: Leverages known preferences
- **Performance Learning**: Improves based on engagement data

## Example Usage
```javascript
const hooks = await creator.executeTask('create-hooks', {
  content_topic: 'AI productivity tools for marketers',
  key_insights: ['90% time savings possible', 'Most tools poorly implemented'],
  target_audience: 'marketing professionals',
  voice_profile: userVoiceDNA,
  hook_types: ['question', 'statistic', 'promise'],
  platform_context: 'linkedin',
  urgency_level: 'medium'
});
```

## Performance Targets
- **Generation Speed**: <3 seconds for 5 hook variations
- **Voice Consistency**: >90% alignment with user profile
- **Engagement Prediction**: >80% accuracy in performance forecasting
- **Audience Relevance**: >95% alignment with target demographics

---
*Generated for FLCM 2.0 Creator Agent - Task Implementation*