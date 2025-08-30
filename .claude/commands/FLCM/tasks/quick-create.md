# Quick Create Task

## Task Definition

```yaml
task:
  name: Quick Content Creation
  id: quick-create
  duration: 20-30 minutes
  description: Fast content generation using streamlined 4-agent pipeline

workflow:
  phase1_research:
    agent: collector
    duration: 5-7 minutes
    actions:
      - Gather key information on topic
      - Apply RICE scoring to top 5 insights
      - Identify 2-3 trending angles
      - Extract key statistics and quotes
    output: Research brief with scored insights
    
  phase2_learning:
    agent: scholar
    duration: 3-5 minutes
    mode: lite
    actions:
      - Quick 3-level understanding (skip deep levels)
      - Create simple analogies
      - Identify core message
      - Prepare teaching points
    output: Simplified knowledge framework
    
  phase3_creation:
    agent: creator
    duration: 8-10 minutes
    actions:
      - Generate 3 hook options
      - Write main content (500-800 words)
      - Maintain voice consistency
      - Add emotional touchpoints
      - Create call-to-action
    output: Complete content draft
    
  phase4_optimization:
    agent: adapter
    duration: 5-8 minutes
    actions:
      - Optimize for primary platform
      - Add hashtags and formatting
      - Predict engagement metrics
      - Create publishing checklist
    output: Platform-ready content

execution:
  steps:
    1:
      prompt: "What topic would you like to create content about?"
      validation: Ensure topic is specific enough
      
    2:
      prompt: "Which platform is your primary target? (LinkedIn/Twitter/WeChat/XiaoHongShu)"
      default: LinkedIn
      
    3:
      prompt: "Any specific angle or perspective you want to emphasize?"
      optional: true
      
    4:
      action: "Starting Quick Mode pipeline..."
      sequence:
        - Activate Collector Agent
        - Perform rapid research (5-7 min)
        - Handoff to Scholar Agent
        - Quick learning synthesis (3-5 min)
        - Handoff to Creator Agent
        - Generate content (8-10 min)
        - Handoff to Adapter Agent
        - Platform optimization (5-8 min)
        
    5:
      action: "Review and finalize"
      options:
        - Preview content
        - Make quick edits
        - Export final version
        - Start new creation

quality_checks:
  minimum_requirements:
    - Voice consistency: 85%+
    - Platform fit: Good or better
    - Engagement hooks: At least 1 strong
    - Value delivery: Clear and present
    
  optional_enhancements:
    - Additional platform versions
    - Alternative hooks
    - Extended research
    - Deeper learning phase

success_metrics:
  time: Under 30 minutes
  quality: 85%+ score
  voice: Maintained
  platform: Optimized
  engagement: Predicted medium-high

tips:
  - Pre-gather any specific data or quotes you want included
  - Have 2-3 of your previous posts ready for voice analysis
  - Know your target platform before starting
  - Quick mode works best for timely, trending topics
```