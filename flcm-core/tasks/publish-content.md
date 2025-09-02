# Task: Content Publishing

## Description
Adapt and optimize content for multiple platforms, generating platform-specific versions with hashtags and visuals

## Prerequisites
- Completed content document
- Target platforms specified
- Publishing schedule preferences
- Visual assets (optional)

## Steps

### 1. Platform Analysis
- Identify target platforms
- Review platform requirements
- Check content length limits
- Note special features

### 2. Content Adaptation
For each platform:

#### Xiaohongshu (小红书)
- Shorten to 500-1000 characters
- Add emoji for visual appeal
- Create list format where applicable
- Focus on lifestyle angle

#### Zhihu (知乎)
- Expand to 2000-5000 characters
- Add data and citations
- Structure as Q&A or guide
- Professional tone

#### WeChat (微信)
- Format as article (1500-3000 chars)
- Add section headers
- Include images placeholders
- Newsletter style

#### LinkedIn
- Professional narrative (1000-2000 chars)
- Industry insights focus
- Add statistics
- Career development angle

### 3. Hashtag Generation
- Research trending hashtags
- Generate platform-specific tags
- Balance broad and niche tags
- Optimize for discovery

### 4. Visual Recommendations
- Suggest cover images
- Recommend infographics
- Plan carousel slides
- Specify image dimensions

### 5. Publishing Schedule
- Determine optimal timing
- Create posting calendar
- Plan cross-promotion
- Set reminders

### 6. Metadata Preparation
- Write platform descriptions
- Create alt text
- Prepare link cards
- Set categories/topics

## Configuration
```yaml
platforms:
  xiaohongshu:
    maxLength: 1000
    hashtags: 10
    visualFirst: true
    bestTime: "20:00-22:00"
  zhihu:
    maxLength: 5000
    hashtags: 5
    dataFocus: true
    bestTime: "09:00-11:00"
  wechat:
    maxLength: 3000
    hashtags: 3
    articleFormat: true
    bestTime: "08:00-09:00"
  linkedin:
    maxLength: 2000
    hashtags: 5
    professional: true
    bestTime: "07:00-09:00"

options:
  autoHashtags: true
  visualSuggestions: true
  crossPromotion: true
  scheduling: true
```

## Output Format
```yaml
publishingPackage:
  platforms:
    - platform: xiaohongshu
      content: [adapted content]
      hashtags: [#tag1, #tag2, ...]
      visuals: [suggestions]
      schedule: [datetime]
    - platform: zhihu
      content: [adapted content]
      hashtags: [#tag1, #tag2, ...]
      visuals: [suggestions]
      schedule: [datetime]
  crossPromotion:
    strategy: [cross-platform strategy]
    links: [platform links]
  analytics:
    expectedReach: [estimate]
    optimalTiming: [best times]
```

## Success Criteria
- All platforms adapted
- Hashtags optimized per platform
- Visual recommendations provided
- Publishing schedule created
- Content maintains core message
