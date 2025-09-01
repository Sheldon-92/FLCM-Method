# Hashtag Research Task

## Task ID: hashtag-research
**Version**: 2.0.0  
**Agent**: Publisher  
**Category**: Discoverability Optimization  

## Description
Researches, analyzes, and recommends optimal hashtags for content across different platforms to maximize discoverability while maintaining relevance and authenticity.

## Purpose
Enhance content reach and engagement through strategic hashtag selection that balances popular discovery tags with niche community tags for optimal visibility.

## Input Requirements
```yaml
input:
  content_topic: string      # Main subject matter
  target_platforms: array    # Platforms for hashtag optimization
  audience_segments: array   # Target audience demographics
  content_type: string       # article, video, image, carousel
  industry_context: string   # Business/topic vertical
  competition_level: string  # low, medium, high
  brand_voice: object        # Voice profile for tag alignment
```

## Processing Steps
1. **Topic Analysis**: Extract key themes and concepts
2. **Platform Research**: Analyze platform-specific hashtag behaviors
3. **Competition Analysis**: Assess hashtag difficulty and opportunity
4. **Trend Identification**: Identify trending and emerging hashtags
5. **Audience Matching**: Align hashtags with audience interests
6. **Strategic Selection**: Balance reach, relevance, and competition
7. **Performance Prediction**: Estimate hashtag effectiveness

## Hashtag Research Framework
```typescript
interface HashtagResearch {
  analysis: {
    topic_themes: Theme[];
    platform_behaviors: PlatformBehavior[];
    competition_landscape: Competition[];
  };
  recommendations: {
    primary_tags: Hashtag[];
    secondary_tags: Hashtag[];
    niche_tags: Hashtag[];
  };
  strategy: {
    mix_ratio: TagMix;
    timing_considerations: Timing[];
    performance_tracking: Metrics[];
  };
}
```

## Output Format
```yaml
hashtag_research:
  analysis_summary:
    content_topic: string
    primary_themes: array
    target_platforms: array
    research_scope: string
    competitive_landscape: string
  platform_specific_research:
    linkedin:
      recommended_hashtags:
        - hashtag: string
          category: string
          usage_volume: number
          competition_level: string
          relevance_score: number
          engagement_potential: number
          audience_alignment: number
      hashtag_strategy:
        primary_tags: array      # 1-2 high-reach tags
        secondary_tags: array    # 2-3 medium-reach tags
        niche_tags: array        # 2-3 specific community tags
        branded_tags: array      # User/company specific tags
      performance_insights:
        optimal_count: number
        best_positions: array
        timing_considerations: array
    twitter:
      recommended_hashtags:
        - hashtag: string
          trend_status: string
          usage_frequency: number
          community_engagement: number
          viral_potential: number
          brand_safety: string
      hashtag_strategy:
        trending_tags: array     # Current trending topics
        evergreen_tags: array    # Consistently performing tags
        community_tags: array    # Specific audience communities
        conversation_tags: array # Discussion starters
      performance_insights:
        optimal_count: number
        character_efficiency: number
        trend_timing: array
    xiaohongshu:
      recommended_hashtags:
        - hashtag: string
          popularity_tier: string
          aesthetic_alignment: number
          lifestyle_relevance: number
          discovery_potential: number
          user_engagement: number
      hashtag_strategy:
        lifestyle_tags: array    # Lifestyle and aesthetic tags
        tutorial_tags: array     # How-to and educational tags
        trend_tags: array        # Current platform trends
        location_tags: array     # Geographic relevance
      performance_insights:
        visual_synergy: number
        demographic_alignment: number
        seasonal_considerations: array
    zhihu:
      recommended_hashtags:
        - hashtag: string
          knowledge_depth: number
          expert_usage: number
          discussion_quality: number
          learning_value: number
          authority_building: number
      hashtag_strategy:
        expertise_tags: array    # Domain expertise indicators
        question_tags: array     # Problem-solving focus
        educational_tags: array  # Learning and knowledge
        industry_tags: array     # Professional categories
      performance_insights:
        credibility_impact: number
        discussion_potential: number
        knowledge_positioning: number
  cross_platform_strategy:
    universal_tags: array        # Work well across platforms
    platform_specific: array     # Unique to each platform
    content_series_tags: array   # For ongoing content themes
    brand_consistency: array     # Maintain brand voice
  hashtag_intelligence:
    trending_opportunities:
      - hashtag: string
        platforms: array
        trend_trajectory: string
        opportunity_window: string
        risk_assessment: string
    competitive_analysis:
      - competitor: string
        hashtag_strategy: array
        performance_insights: array
        differentiation_opportunities: array
    audience_insights:
      - segment: string
        preferred_hashtags: array
        engagement_patterns: array
        discovery_behaviors: array
  implementation_guidance:
    posting_schedule:
      - platform: string
        optimal_times: array
        hashtag_timing: array
        frequency_recommendations: string
    performance_tracking:
      - metric: string
        tracking_method: string
        success_indicators: array
        optimization_triggers: array
    experimentation_plan:
      - test_type: string
        variables: array
        success_criteria: array
        duration: string
```

## Hashtag Categories

### Primary Tags (High Reach)
- **Broad Topics**: General subject matter tags
- **Popular Keywords**: Widely searched terms
- **Industry Standards**: Recognized professional tags
- **Trending Topics**: Current conversation drivers

### Secondary Tags (Medium Reach)
- **Specific Niches**: Targeted community tags
- **Problem-Solution**: Specific pain points addressed
- **Content Format**: Video, tutorial, tip, guide
- **Audience Type**: Beginner, advanced, professional

### Niche Tags (Lower Reach, Higher Relevance)
- **Micro-Communities**: Specific interest groups
- **Specialized Terms**: Industry-specific vocabulary
- **Local/Regional**: Geographic relevance
- **Brand/Personal**: User-specific or branded tags

## Platform Hashtag Strategies

### LinkedIn
- **Professional Focus**: Career, industry, business terms
- **Thought Leadership**: Expertise and insight tags
- **Business Value**: ROI, growth, strategy themes
- **Network Building**: Professional community tags

### Twitter
- **Conversation Joining**: Trending topics and discussions
- **Real-time Relevance**: News, events, current affairs
- **Community Participation**: Twitter chats and movements
- **Viral Potential**: Shareable and quotable content tags

### XiaoHongShu
- **Lifestyle Integration**: Beauty, fashion, lifestyle tags
- **Visual Appeal**: Aesthetic and design-focused tags
- **Tutorial Value**: How-to and educational tags
- **Trend Participation**: Current platform trends

### Zhihu
- **Knowledge Depth**: Educational and informative tags
- **Expertise Display**: Professional competency tags
- **Question Solving**: Problem-resolution focus
- **Community Value**: Knowledge sharing and learning

## Research Methodologies

### Trend Analysis
- **Platform Analytics**: Native trending data
- **Third-party Tools**: Hashtag research platforms
- **Competitor Monitoring**: Successful hashtag strategies
- **Audience Behavior**: Engagement pattern analysis

### Performance Prediction
- **Historical Data**: Past performance of similar tags
- **Engagement Rates**: Expected interaction levels
- **Reach Potential**: Estimated audience exposure
- **Competition Assessment**: Difficulty of discovery

### Optimization Factors
- **Timing**: When hashtags perform best
- **Quantity**: Optimal number per platform
- **Position**: Where to place hashtags
- **Variation**: Rotating vs consistent strategy

## Quality Assurance
- **Relevance Check**: All tags align with content
- **Brand Safety**: No controversial or problematic tags
- **Audience Appropriateness**: Suitable for target demographics
- **Platform Compliance**: Meets community guidelines

## Integration Points
- **Content Analysis**: Derives from optimized content
- **Audience Data**: Leverages user demographic information
- **Performance Tracking**: Connects to analytics systems
- **Strategy Evolution**: Learns from engagement results

## Example Usage
```javascript
const hashtagStrategy = await publisher.executeTask('hashtag-research', {
  content_topic: 'AI productivity tools for marketers',
  target_platforms: ['linkedin', 'twitter'],
  audience_segments: ['marketing professionals', 'tech enthusiasts'],
  content_type: 'article',
  industry_context: 'marketing technology',
  competition_level: 'high',
  brand_voice: userVoiceProfile
});
```

## Performance Targets
- **Research Depth**: 50+ hashtags analyzed per platform
- **Relevance Score**: >90% content alignment
- **Competition Analysis**: Accurate difficulty assessment
- **Performance Prediction**: 80% accuracy in engagement forecasting

---
*Generated for FLCM 2.0 Publisher Agent - Task Implementation*