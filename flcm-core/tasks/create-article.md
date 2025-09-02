# Task: Article Creation

## Description
Create high-quality content based on insights document, applying voice DNA and optimizing for engagement

## Prerequisites
- Insights document from Scholar agent
- Target mode (quick/standard/deep)
- Voice profile available
- Platform requirements

## Steps

### 1. Content Planning
- Review insights document
- Identify key messages
- Select content angle
- Define target audience

### 2. Structure Design
- Choose appropriate framework:
  - AIDA for marketing content
  - PAS for problem-solving content
  - Hero's Journey for narrative content
- Create content outline
- Plan section distribution

### 3. Hook Creation
- Generate 3-5 hook options
- Test for attention-grabbing power
- Select optimal hook
- Refine for platform

### 4. Introduction Writing
- Set context and stakes
- Establish authority
- Preview value proposition
- Create reading momentum

### 5. Main Content Development
- **Section 1**: Core concept introduction
- **Section 2**: Evidence and examples
- **Section 3**: Practical applications
- **Section 4**: Advanced insights
- Apply voice DNA throughout

### 6. Story Integration
- Identify story opportunities
- Weave narratives naturally
- Use analogies and metaphors
- Create emotional connection

### 7. Conclusion & CTA
- Summarize key points
- Reinforce main message
- Provide clear next steps
- Create compelling call-to-action

### 8. Optimization
- Check readability score
- Optimize paragraph length
- Add transition phrases
- Ensure voice consistency

## Configuration
```yaml
modes:
  quick:
    time: 20
    sections: 3
    wordCount: 800-1200
    depth: 2
  standard:
    time: 45
    sections: 5
    wordCount: 1500-2500
    depth: 3
  deep:
    time: 60
    sections: 7
    wordCount: 3000-5000
    depth: 4

options:
  voiceDNA: true
  seoOptimization: true
  storyIntegration: true
  emotionalJourney: true
```

## Output Format
```yaml
document:
  type: ContentDocument
  metadata:
    title: [compelling title]
    mode: [quick/standard/deep]
    wordCount: [actual count]
    readingTime: [estimated minutes]
  content:
    hook: [attention grabber]
    introduction: [opening section]
    mainSections:
      - section1: [content]
      - section2: [content]
      - section3: [content]
    conclusion: [closing section]
    callToAction: [CTA text]
  optimization:
    seoScore: [0-100]
    readabilityScore: [0-100]
    voiceConsistency: [0-100]
```

## Success Criteria
- Word count within target range
- Voice DNA consistently applied
- All sections completed
- Readability score > 70
- Clear value delivered
