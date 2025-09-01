# Write Content Task

## Task ID: write-content
**Version**: 2.0.0  
**Agent**: Creator  
**Category**: Content Generation  

## Description
Transforms synthesized insights into engaging, authentic content while preserving the user's unique voice DNA and maximizing audience engagement.

## Purpose
Create compelling content that maintains voice authenticity at 91%+ consistency while delivering value and engagement through proven content structures.

## Input Requirements
```yaml
input:
  insights_brief: object     # Synthesized knowledge from Scholar
  voice_profile: object      # User's voice DNA characteristics
  creation_mode: string      # quick, standard, custom
  target_audience: string    # specific audience profile
  content_type: string       # article, post, thread, newsletter
  length_target: number      # approximate word count
```

## Processing Steps
1. **Voice Analysis**: Load and apply user's voice DNA profile
2. **Structure Selection**: Choose optimal content framework
3. **Hook Creation**: Generate attention-grabbing opening
4. **Body Development**: Expand insights into engaging narrative
5. **Voice Verification**: Ensure consistency throughout
6. **Engagement Optimization**: Add interaction triggers
7. **Call-to-Action Design**: Create natural, effective CTAs

## Content Generation Framework
```typescript
interface ContentCreation {
  voice_application: {
    profile: VoiceDNAProfile;
    consistency_score: number;
    style_elements: StyleElement[];
  };
  structure: {
    framework: ContentFramework;
    sections: Section[];
    transitions: Transition[];
  };
  engagement: {
    hooks: Hook[];
    emotional_arc: EmotionPoint[];
    interaction_triggers: Trigger[];
  };
}
```

## Output Format
```yaml
content_creation:
  metadata:
    creation_mode: string
    processing_time: number
    voice_consistency: number
    target_audience: string
    content_type: string
  content:
    headline:
      primary: string
      alternatives: array
      hook_type: string
    opening:
      hook: string
      context_bridge: string
      value_promise: string
    body:
      main_sections:
        - title: string
          content: string
          supporting_points: array
          examples: array
      storytelling_elements:
        - element: string
          position: string
          content: string
      transition_phrases: array
    conclusion:
      key_takeaway: string
      summary_points: array
      future_implications: string
    call_to_action:
      primary_cta: string
      secondary_cta: string
      engagement_trigger: string
  voice_application:
    consistency_score: number
    applied_elements:
      vocabulary: array
      sentence_structure: array
      tone_markers: array
      personality_traits: array
    deviations:
      - element: string
        reason: string
        adjustment: string
  engagement_optimization:
    emotional_journey:
      - stage: string
        emotion: string
        technique: string
    interaction_points:
      - type: string
        position: string
        purpose: string
    retention_techniques:
      - technique: string
        implementation: string
        expected_impact: string
  quality_metrics:
    readability_score: number
    engagement_potential: number
    value_density: number
    authenticity_score: number
```

## Content Structures Available
- **Hook Types**: Question, Story, Statistic, Contradiction, Promise
- **Frameworks**: PAS, AIDA, Star-Chain-Hook, Before-After-Bridge
- **Engagement**: Bucket brigades, Pattern interrupts, Curiosity gaps
- **Emotional**: Aspiration, FOMO, Social proof, Authority

## Voice DNA Integration
- **Vocabulary Matching**: Use signature words and phrases
- **Sentence Patterns**: Mirror user's structural preferences
- **Tone Consistency**: Maintain emotional temperature
- **Personality Reflection**: Include characteristic expressions

## Quality Standards
- **Voice Preservation**: 91%+ consistency with user's profile
- **Engagement Score**: >75% for hook effectiveness
- **Value Density**: Every paragraph provides clear value
- **Flow Rating**: Smooth narrative progression
- **Authenticity**: Feels genuinely from the user

## Integration Points
- **Input**: Receives synthesis from Scholar agent
- **Voice Profile**: Loads from Creator's voice DNA system
- **Output**: Provides content to Publisher for adaptation
- **Feedback Loop**: Learns from performance data

## Example Usage
```javascript
const content = await creator.executeTask('write-content', {
  insights_brief: scholarSynthesis,
  voice_profile: userVoiceDNA,
  creation_mode: 'standard',
  target_audience: 'tech professionals',
  content_type: 'article',
  length_target: 1200
});
```

## Performance Targets
- **Processing Time**: <5 seconds standard mode, <3 seconds quick mode
- **Voice Consistency**: >91% match with user profile
- **Engagement Rate**: >75% hook effectiveness prediction
- **Value Density**: >3 insights per 100 words

---
*Generated for FLCM 2.0 Creator Agent - Task Implementation*