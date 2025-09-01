# Preserve Voice Task

## Task ID: preserve-voice
**Version**: 2.0.0  
**Agent**: Creator  
**Category**: Voice DNA Management  

## Description
Analyzes, maintains, and validates voice consistency throughout content creation to ensure authentic expression that matches the user's unique communication style.

## Purpose
Preserve user authenticity by maintaining voice DNA characteristics at 91%+ consistency while adapting content for different purposes and audiences.

## Input Requirements
```yaml
input:
  voice_profile: object      # Established voice DNA profile
  content_draft: object      # Content to analyze/adjust
  target_consistency: number # Minimum consistency score (default: 0.91)
  adaptation_context: string # Reason for any voice adjustments
  validation_samples: array  # Reference samples for comparison
```

## Processing Steps
1. **Profile Loading**: Retrieve comprehensive voice DNA profile
2. **Content Analysis**: Assess current voice characteristics in draft
3. **Deviation Detection**: Identify inconsistencies with profile
4. **Selective Adjustment**: Modify content to improve consistency
5. **Context Adaptation**: Allow necessary adjustments for context
6. **Validation Testing**: Verify final consistency score
7. **Profile Update**: Learn from validated content

## Voice DNA Components
```typescript
interface VoicePreservation {
  profile_analysis: {
    vocabulary: VocabularyProfile;
    syntax: SentenceStructure;
    tone: ToneProfile;
    personality: PersonalityMarkers;
  };
  consistency_check: {
    current_score: number;
    element_scores: ElementScore[];
    deviations: Deviation[];
  };
  preservation_actions: {
    adjustments: Adjustment[];
    validations: Validation[];
    learning: ProfileUpdate[];
  };
}
```

## Output Format
```yaml
voice_preservation:
  analysis_results:
    current_consistency: number
    target_consistency: number
    meets_threshold: boolean
    overall_assessment: string
  element_analysis:
    vocabulary:
      signature_words_used: array
      signature_words_missing: array
      consistency_score: number
      recommendations: array
    sentence_structure:
      average_length: number
      complexity_level: string
      pattern_match: number
      structural_suggestions: array
    tone:
      emotional_temperature: string
      formality_level: string
      authority_projection: string
      tone_consistency: number
    personality:
      humor_style: string
      cultural_references: array
      personal_anecdotes: boolean
      personality_score: number
  deviations_identified:
    - element: string
      current_value: string
      expected_value: string
      severity: string
      suggested_fix: string
      justification: string
  preservation_actions:
    adjustments_made:
      - section: string
        original: string
        modified: string
        reason: string
        impact: number
    validations_performed:
      - test_type: string
        result: string
        confidence: number
    profile_updates:
      - component: string
        update_type: string
        new_data: string
        weight: number
  final_results:
    achieved_consistency: number
    improvement: number
    validation_status: string
    ready_for_publishing: boolean
  recommendations:
    immediate_actions: array
    profile_improvements: array
    monitoring_points: array
```

## Voice Elements Monitored

### Vocabulary Profile
- **Signature Words**: Frequently used unique terms
- **Technical Density**: Ratio of specialized vocabulary
- **Formality Level**: Casual vs professional language
- **Cultural References**: Industry-specific terminology

### Sentence Structure
- **Average Length**: Typical sentence word count
- **Complexity Pattern**: Simple, compound, complex ratios
- **Rhythm Flow**: Sentence length variation patterns
- **Punctuation Style**: Preference patterns

### Tone Characteristics
- **Emotional Temperature**: Warm, neutral, cool
- **Authority Level**: Confident, consultative, humble
- **Engagement Style**: Direct, storytelling, analytical
- **Emotional Range**: Consistent vs variable

### Personality Markers
- **Humor Integration**: Style and frequency
- **Personal Sharing**: Anecdote and experience level
- **Perspective Taking**: First, second, third person usage
- **Cultural Voice**: Regional, professional, generational markers

## Consistency Thresholds
- **Excellent**: 95%+ consistency (publish immediately)
- **Good**: 91-94% consistency (minor review recommended)
- **Acceptable**: 85-90% consistency (review required)
- **Poor**: <85% consistency (major revision needed)

## Adaptive Preservation
Sometimes voice needs contextual adjustment:
- **Audience Adaptation**: Professional vs casual contexts
- **Platform Requirements**: LinkedIn vs Twitter voice
- **Content Purpose**: Educational vs promotional tone
- **Cultural Sensitivity**: Audience-appropriate expression

## Integration Points
- **Profile Source**: Creator's voice DNA analysis system
- **Content Input**: From write-content task or external drafts
- **Learning Loop**: Updates voice profile with validated content
- **Quality Gate**: Prevents publication below consistency threshold

## Example Usage
```javascript
const voiceCheck = await creator.executeTask('preserve-voice', {
  voice_profile: establishedProfile,
  content_draft: generatedContent,
  target_consistency: 0.93,
  adaptation_context: 'professional LinkedIn post',
  validation_samples: recentUserPosts
});
```

## Performance Targets
- **Processing Time**: <2 seconds for standard content
- **Accuracy**: 95% correct identification of voice deviations
- **Consistency Achievement**: 91%+ final score for 90% of content
- **Profile Learning**: Continuous improvement over time

---
*Generated for FLCM 2.0 Creator Agent - Task Implementation*