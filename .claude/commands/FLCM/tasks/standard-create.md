# Standard Create Task

## Task Definition

```yaml
task:
  name: Standard Content Creation
  id: standard-create
  duration: 45-60 minutes
  description: Comprehensive content creation using full 4-agent pipeline with iterations

workflow:
  phase1_deep_research:
    agent: collector
    duration: 10-15 minutes
    actions:
      - Comprehensive multi-source research
      - RICE scoring on 10+ insights
      - Trend analysis and pattern identification
      - Competitive content analysis
      - Expert quote gathering
      - Controversy and debate points
    output: Detailed research dossier with scored insights
    
  phase2_progressive_learning:
    agent: scholar
    duration: 10-12 minutes
    mode: full
    actions:
      - Complete 5-level progressive understanding
      - Teaching preparation (Protégé Effect)
      - Complex analogy creation
      - Knowledge gap identification
      - Confidence scoring (aim for 90%+)
      - Synthesis of interconnected concepts
    output: Comprehensive knowledge framework
    
  phase3_content_creation:
    agent: creator
    duration: 15-18 minutes
    actions:
      - Generate 5+ hook variations
      - Write long-form content (1000-1500 words)
      - Deep voice DNA preservation
      - Multi-layer story architecture
      - Emotional journey mapping
      - Strategic CTA placement
      - Iteration and refinement
    output: Polished content masterpiece
    
  phase4_multi_platform:
    agent: adapter
    duration: 10-15 minutes
    actions:
      - Optimize for ALL platforms
      - Platform-specific adaptations
      - Cultural nuance adjustments
      - Hashtag research and optimization
      - Timing strategy development
      - Visual content recommendations
      - Cross-promotion planning
    output: Complete multi-platform content suite

execution:
  steps:
    1:
      prompt: "What is your content topic or theme?"
      validation: Ensure sufficient depth for standard mode
      follow_up: "What's your main goal with this content?"
      
    2:
      prompt: "Who is your target audience?"
      details:
        - Demographics
        - Pain points
        - Aspirations
        - Platform preferences
      
    3:
      prompt: "Provide 2-3 samples of your previous writing for voice analysis"
      action: Analyze voice DNA patterns
      output: Voice profile created
      
    4:
      prompt: "Select target platforms (you can choose multiple):"
      options:
        - LinkedIn (Professional)
        - Twitter/X (Viral threads)
        - WeChat (Chinese article)
        - XiaoHongShu (Lifestyle)
        - All platforms
      
    5:
      action: "Initiating Standard Mode pipeline..."
      sequence:
        - Activate Collector Agent
        - Deep research phase (10-15 min)
        - Handoff to Scholar Agent
        - Progressive learning (10-12 min)
        - Knowledge validation checkpoint
        - Handoff to Creator Agent
        - Content creation (15-18 min)
        - Voice consistency check
        - Handoff to Adapter Agent
        - Multi-platform optimization (10-15 min)
        
    6:
      action: "Quality review and iterations"
      checks:
        - Voice preservation: 91%+
        - Engagement potential: High
        - Platform fit: Excellent
        - Value density: Superior
      iterations:
        - Refine weak sections
        - Enhance hooks if needed
        - Adjust platform versions
        
    7:
      action: "Final delivery"
      deliverables:
        - Master content version
        - Platform-specific versions
        - Publishing schedule
        - Hashtag sets
        - Visual recommendations
        - Performance predictions

advanced_features:
  voice_dna_analysis:
    - Vocabulary patterns
    - Sentence structures
    - Emotional temperature
    - Signature phrases
    - Storytelling style
    
  content_architecture:
    - Hook variations (5+)
    - Progressive disclosure
    - Emotional peaks and valleys
    - Value escalation
    - Strategic CTAs
    
  platform_mastery:
    - Algorithm optimization
    - Cultural adaptation
    - Timing strategies
    - Viral mechanics
    - Cross-promotion tactics

quality_assurance:
  mandatory_criteria:
    - Voice consistency: 91%+
    - Platform fit: Excellent
    - Engagement hooks: Multiple strong options
    - Value delivery: Superior
    - Emotional resonance: High
    
  excellence_markers:
    - Originality score: 85%+
    - Shareability factor: High
    - Conversation starter: Yes
    - Authority demonstration: Clear
    - Transformation promise: Compelling

success_metrics:
  time: 45-60 minutes
  quality: 92%+ score
  voice: 91%+ preservation
  platforms: All optimized
  engagement: Predicted high-viral
  value: Exceptional

best_practices:
  preparation:
    - Gather 3-5 writing samples for voice analysis
    - Research competitor content beforehand
    - Know your audience deeply
    - Have supporting data ready
    
  execution:
    - Don't rush the research phase
    - Let Scholar Agent achieve 90%+ confidence
    - Review Creator's first draft carefully
    - Test multiple platform versions
    
  optimization:
    - A/B test different hooks
    - Schedule for optimal times
    - Prepare visual content
    - Plan follow-up engagement
```