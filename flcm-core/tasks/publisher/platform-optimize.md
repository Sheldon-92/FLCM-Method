# Platform Optimize Task

## Task ID: platform-optimize
**Version**: 2.0.0  
**Agent**: Publisher  
**Category**: Platform Adaptation  

## Description
Optimizes content for specific social media and publishing platforms while preserving voice authenticity and maximizing platform-specific engagement.

## Purpose
Transform generic content into platform-native experiences that feel natural to each platform's culture while maintaining the user's authentic voice and message integrity.

## Input Requirements
```yaml
input:
  content: object            # Content from Creator agent
  target_platforms: array    # Platforms to optimize for
  optimization_goals: array  # engagement, reach, conversion
  voice_profile: object      # User's voice DNA for consistency
  brand_guidelines: object   # Additional constraints/requirements
  scheduling_context: string # immediate, scheduled, campaign
```

## Processing Steps
1. **Platform Analysis**: Understand each platform's unique characteristics
2. **Content Assessment**: Evaluate current content against platform requirements
3. **Format Adaptation**: Restructure for optimal platform presentation
4. **Length Optimization**: Adjust to platform-specific constraints
5. **Engagement Enhancement**: Add platform-native interaction elements
6. **Algorithm Alignment**: Optimize for platform discovery mechanisms
7. **Cultural Adaptation**: Ensure platform community fit

## Platform Specifications
```typescript
interface PlatformOptimization {
  platform_configs: {
    linkedin: LinkedInConfig;
    twitter: TwitterConfig;
    xiaohongshu: XiaoHongShuConfig;
    zhihu: ZhihuConfig;
    wechat: WeChatConfig;
  };
  optimization_results: {
    content_adaptations: Adaptation[];
    performance_predictions: Prediction[];
    compliance_checks: Compliance[];
  };
}
```

## Output Format
```yaml
platform_optimization:
  optimization_summary:
    platforms_processed: array
    total_adaptations: number
    voice_consistency_maintained: number
    estimated_performance_lift: number
  platform_results:
    linkedin:
      optimized_content:
        headline: string
        body: string
        hashtags: array
        mentions: array
      formatting:
        character_count: number
        paragraph_breaks: number
        bullet_points: array
        professional_tone_score: number
      engagement_optimization:
        hook_strength: number
        call_to_action: string
        interaction_triggers: array
        shareability_score: number
      algorithm_optimization:
        keyword_density: number
        engagement_timing: string
        content_type_classification: string
        viral_potential: number
    twitter:
      optimized_content:
        thread_structure: array
        individual_tweets: array
        hashtags: array
        mentions: array
      formatting:
        character_utilization: number
        thread_flow: array
        visual_breaks: array
        accessibility_score: number
      engagement_optimization:
        retweet_potential: number
        reply_triggers: array
        quote_tweet_hooks: array
        viral_mechanics: array
    xiaohongshu:
      optimized_content:
        title: string
        body: string
        hashtags: array
        emoji_integration: array
      formatting:
        visual_appeal: number
        lifestyle_integration: number
        tutorial_elements: array
        aesthetic_score: number
      engagement_optimization:
        save_potential: number
        share_triggers: array
        comment_prompts: array
        trend_alignment: number
    zhihu:
      optimized_content:
        title: string
        body: string
        references: array
        expert_positioning: array
      formatting:
        depth_score: number
        educational_value: number
        structure_quality: number
        credibility_markers: array
      engagement_optimization:
        upvote_potential: number
        discussion_starters: array
        knowledge_sharing_value: number
        authority_building: array
    wechat:
      optimized_content:
        headline: string
        body: string
        qr_code_placement: string
        mini_program_integration: array
      formatting:
        article_structure: number
        readability_score: number
        mobile_optimization: number
        sharing_optimization: number
      engagement_optimization:
        forward_potential: number
        discussion_triggers: array
        social_currency: number
        trust_building: array
  cross_platform_strategy:
    content_variations: array
    publishing_sequence: array
    cross_promotion_opportunities: array
    performance_tracking_plan: array
  quality_assurance:
    voice_consistency_scores:
      - platform: string
        score: number
        maintained_elements: array
    compliance_checks:
      - platform: string
        guidelines_met: array
        potential_issues: array
    performance_predictions:
      - platform: string
        engagement_forecast: number
        reach_estimate: number
        conversion_potential: number
```

## Platform-Specific Optimizations

### LinkedIn
- **Professional Tone**: Maintains authority and expertise
- **Industry Insights**: Positions user as thought leader
- **Business Value**: Clear ROI and practical applications
- **Network Engagement**: Encourages professional discussion

### Twitter
- **Conversational**: Quick, punchy, engaging
- **Thread Structure**: Logical flow across multiple tweets
- **Real-time Relevance**: Connects to current conversations
- **Viral Mechanics**: Shareable, quotable content

### XiaoHongShu (小红书)
- **Lifestyle Integration**: Personal, aspirational content
- **Visual Storytelling**: Image-first content structure
- **Trend Alignment**: Current aesthetic and cultural trends
- **Tutorial Elements**: How-to and educational components

### Zhihu (知乎)
- **Depth and Expertise**: Comprehensive, authoritative content
- **Educational Value**: Teaching and knowledge sharing
- **Reference Quality**: Credible sources and citations
- **Community Respect**: Thoughtful, respectful discourse

### WeChat
- **Trusted Communication**: Personal, reliable voice
- **Social Sharing**: Forward-worthy content
- **Mobile Optimization**: Perfect mobile reading experience
- **Community Building**: Encourages group discussion

## Algorithm Optimization Techniques

### Discovery Enhancement
- **Keyword Integration**: Natural, platform-appropriate keywords
- **Hashtag Strategy**: Optimal mix of popular and niche tags
- **Timing Optimization**: Platform-specific peak engagement times
- **Content Classification**: Algorithm-friendly content types

### Engagement Drivers
- **Interaction Triggers**: Questions, polls, challenges
- **Social Proof**: Testimonials, case studies, user examples
- **Curiosity Gaps**: Information gaps that demand completion
- **Value Delivery**: Immediate, actionable insights

### Viral Mechanics
- **Shareability Factors**: Easy to share, quote, discuss
- **Emotional Resonance**: Connection with audience values
- **Trending Topics**: Alignment with current conversations
- **Community Relevance**: Speaks to platform culture

## Quality Assurance Checks
- **Voice Consistency**: >91% alignment with user profile
- **Platform Compliance**: Meets all community guidelines
- **Message Integrity**: Core message preserved across adaptations
- **Engagement Potential**: Optimized for platform algorithms

## Integration Points
- **Content Input**: Receives finalized content from Creator
- **Voice Profile**: Maintains consistency with user's DNA
- **Performance Data**: Learns from engagement metrics
- **Publishing Queue**: Coordinates with scheduling system

## Example Usage
```javascript
const optimizedContent = await publisher.executeTask('platform-optimize', {
  content: creatorOutput,
  target_platforms: ['linkedin', 'twitter', 'zhihu'],
  optimization_goals: ['engagement', 'reach'],
  voice_profile: userVoiceDNA,
  brand_guidelines: companyGuidelines,
  scheduling_context: 'campaign'
});
```

## Performance Targets
- **Processing Time**: <3 seconds per platform
- **Voice Consistency**: >91% maintained across platforms
- **Engagement Lift**: >20% improvement over generic content
- **Algorithm Alignment**: >85% optimization score per platform

---
*Generated for FLCM 2.0 Publisher Agent - Task Implementation*