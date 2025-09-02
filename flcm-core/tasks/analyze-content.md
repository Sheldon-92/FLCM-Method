# Task: Content Analysis

## Description
Analyze content from URL or text input using multiple frameworks and progressive depth learning

## Prerequisites
- Input source (URL or text)
- Analysis frameworks enabled
- Target depth level specified

## Steps

### 1. Content Extraction
- If URL: Fetch and parse content
- If text: Direct processing
- Extract metadata (title, author, date, etc.)

### 2. Initial Assessment
- Determine content type and domain
- Assess credibility and relevance
- Identify key topics and themes

### 3. Progressive Depth Analysis
- **Level 1 - Surface**: Extract facts and definitions
- **Level 2 - Mechanical**: Understand processes and methods
- **Level 3 - Principle**: Identify underlying principles
- **Level 4 - System**: Map relationships and connections

### 4. Framework Application
- Apply relevant frameworks based on content type:
  - Business content → SWOT, PESTEL
  - Creative content → SCAMPER, First Principles
  - Technical content → Systems Thinking, Root Cause

### 5. Critical Thinking
- Question assumptions
- Identify biases
- Generate alternative perspectives
- Evaluate implications

### 6. Voice DNA Extraction
- Identify writing patterns
- Extract tone and style
- Map vocabulary preferences
- Document unique expressions

### 7. Insight Generation
- Synthesize findings
- Generate key insights
- Create actionable recommendations
- Formulate questions for deeper exploration

## Configuration
```yaml
options:
  depth: 4
  frameworks: 
    - SWOT
    - SCAMPER
    - First-Principles
  voiceExtraction: true
  criticalThinking: true
  maxAnalysisTime: 300
```

## Output Format
```yaml
document:
  type: InsightsDocument
  sections:
    input_materials:
      source: [URL or text excerpt]
      metadata: [extracted metadata]
    critical_thinking:
      assumptions: [identified assumptions]
      perspectives: [alternative viewpoints]
    framework_analysis:
      framework1: [results]
      framework2: [results]
    personal_perspective:
      insights: [unique insights]
      connections: [related concepts]
    voice_profile:
      patterns: [identified patterns]
      characteristics: [voice traits]
```

## Success Criteria
- All depth levels analyzed
- At least 2 frameworks applied
- Voice profile extracted
- Minimum 3 key insights generated
- Critical thinking demonstrated
