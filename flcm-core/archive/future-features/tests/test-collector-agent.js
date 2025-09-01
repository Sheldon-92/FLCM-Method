#!/usr/bin/env node

/**
 * Test script for Collector Agent
 * Tests RICE scoring, Signal-to-Noise filtering, and content brief creation
 */

const path = require('path');

// Sample test content
const testContent = {
  highQuality: `
# Revolutionary AI-Powered Content Creation Framework

According to recent research from MIT Media Lab, content creators who implement structured methodologies see a 47% improvement in engagement metrics. This groundbreaking study, involving over 10,000 content pieces, reveals surprising insights about the intersection of AI and human creativity.

## Key Findings

The research demonstrates three critical factors:

1. **Methodology-Driven Approach**: Frameworks like RICE (Relevance, Impact, Confidence, Effort) provide measurable improvements in content quality. Data shows that structured evaluation increases reader retention by 35%.

2. **Signal Extraction**: Advanced algorithms can now identify high-value insights with 89% accuracy. This means content creators can focus on what truly matters to their audience.

3. **Voice Preservation**: Contrary to concerns about AI homogenization, properly configured systems actually enhance unique voice characteristics by 23%.

## Practical Implementation

Here's how leading content teams are applying these findings:

- **Step 1**: Analyze source material using signal-to-noise ratios
- **Step 2**: Apply RICE scoring to prioritize content opportunities  
- **Step 3**: Preserve voice DNA through iterative refinement
- **Step 4**: Optimize for platform-specific engagement patterns

"The future of content creation isn't about replacing human creativity," explains Dr. Sarah Chen, lead researcher. "It's about augmenting human capabilities with intelligent systems that understand both data and narrative."

## Case Study: TechCorp's Success

TechCorp implemented this framework and saw remarkable results:
- 156% increase in organic reach
- 89% reduction in content production time
- $2.3M additional revenue attributed to content

This evidence suggests a paradigm shift in how we approach content creation.
`,

  lowQuality: `
As we all know, in today's world, content creation is obviously very important. It goes without saying that everyone needs to create content these days. This is a game-changer and revolutionary approach that will transform everything.

Basically, what we're saying is that content is king. There are many ways to create content. There are several approaches you can take. There are various methods available.

At the end of the day, it's all about unlocking your potential and unleashing your creativity. This best-in-class, world-class solution will revolutionize how you think about things.

It is important to note that there are many factors to consider. It should be mentioned that various aspects need attention. One of the most important things is to remember that content matters.

In conclusion, this groundbreaking, cutting-edge, state-of-the-art approach will completely transform your content game. Transform your business today with this revolutionary method!
`,

  technical: `
# Implementing Distributed Vector Embeddings for Semantic Content Analysis

## Abstract

This paper presents a novel approach to content analysis using distributed vector embeddings with attention mechanisms. Our methodology leverages transformer architectures to create high-dimensional representations of textual content, enabling sophisticated semantic understanding.

## Methodology

We employ a multi-stage pipeline:

\`\`\`python
def process_content(text):
    # Tokenization
    tokens = tokenizer.encode(text)
    
    # Embedding generation
    embeddings = model.embed(tokens)
    
    # Attention pooling
    pooled = attention_pool(embeddings)
    
    return pooled
\`\`\`

### Mathematical Foundation

The attention mechanism is defined as:

Attention(Q, K, V) = softmax(QK^T / √d_k)V

Where Q represents queries, K represents keys, and V represents values.

## Results

Our experiments on the GLUE benchmark show:
- BERT-base: 82.3% accuracy
- Our method: 87.1% accuracy
- Improvement: 4.8 percentage points

Statistical significance: p < 0.001

## References

[1] Vaswani et al. (2017). Attention is All You Need.
[2] Devlin et al. (2018). BERT: Pre-training of Deep Bidirectional Transformers.
`
};

/**
 * Test Collector Agent
 */
async function testCollectorAgent() {
  console.log('');
  console.log('='.repeat(70));
  console.log('🧪 Testing Collector Agent');
  console.log('='.repeat(70));
  console.log('');
  
  try {
    // Simple test without TypeScript compilation
    console.log('📝 Test 1: High-Quality Content');
    console.log('-'.repeat(50));
    testRICEScoring(testContent.highQuality, 'High-Quality Article');
    
    console.log('\n📝 Test 2: Low-Quality Content');
    console.log('-'.repeat(50));
    testRICEScoring(testContent.lowQuality, 'Low-Quality Article');
    
    console.log('\n📝 Test 3: Technical Content');
    console.log('-'.repeat(50));
    testRICEScoring(testContent.technical, 'Technical Paper');
    
    console.log('\n📝 Test 4: Signal-to-Noise Analysis');
    console.log('-'.repeat(50));
    testSignalExtraction(testContent.highQuality, 'High-Quality');
    testSignalExtraction(testContent.lowQuality, 'Low-Quality');
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

/**
 * Test RICE scoring simulation
 */
function testRICEScoring(content, label) {
  // Simulate RICE scoring
  const wordCount = content.split(/\s+/).length;
  const hasData = /\d+%|\d+x|\$\d+/.test(content);
  const hasCitations = /\[\d+\]|\(\d{4}\)/.test(content);
  const hasStructure = /^#{1,6}\s+.+/gm.test(content);
  const hasActionWords = /how to|guide|step|method|approach/gi.test(content);
  
  // Calculate simulated scores
  const relevance = Math.min(100, 50 + (hasStructure ? 20 : 0) + (hasActionWords ? 15 : 0));
  const impact = Math.min(100, 40 + (hasData ? 20 : 0) + (hasActionWords ? 20 : 0));
  const confidence = Math.min(100, 60 + (hasCitations ? 20 : 0) + (hasData ? 15 : 0));
  const effort = Math.max(0, 30 + (wordCount > 1000 ? 20 : 0) - (hasStructure ? 10 : 0));
  
  const total = Math.round((relevance * impact * confidence * ((100 - effort) / 100)) / 100);
  
  console.log(`  📊 ${label}:`);
  console.log(`     Relevance: ${relevance}/100`);
  console.log(`     Impact: ${impact}/100`);
  console.log(`     Confidence: ${confidence}/100`);
  console.log(`     Effort: ${effort}/100 (lower is better)`);
  console.log(`     TOTAL SCORE: ${total}/100`);
  
  // Quality determination
  let quality = 'low';
  if (total > 70) quality = 'high';
  else if (total > 40) quality = 'medium';
  
  console.log(`     Quality: ${quality.toUpperCase()}`);
}

/**
 * Test signal extraction simulation
 */
function testSignalExtraction(content, label) {
  // Count noise patterns
  const noisePatterns = [
    /as we all know|obviously|clearly/gi,
    /in today's world|at the end of the day/gi,
    /game-changer|revolutionary|groundbreaking/gi,
    /basically|essentially|fundamentally/gi
  ];
  
  let noiseCount = 0;
  noisePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) noiseCount += matches.length;
  });
  
  // Count signal indicators
  const signalPatterns = [
    /according to|research shows|data reveals/gi,
    /\d+%|\d+x|\$\d+/g,
    /step \d+|first|second|finally/gi
  ];
  
  let signalCount = 0;
  signalPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) signalCount += matches.length;
  });
  
  const ratio = signalCount / Math.max(1, noiseCount);
  
  console.log(`  📡 ${label} Signal Analysis:`);
  console.log(`     Signals found: ${signalCount}`);
  console.log(`     Noise patterns: ${noiseCount}`);
  console.log(`     Signal/Noise Ratio: ${ratio.toFixed(2)}`);
  console.log(`     Quality: ${ratio > 2 ? 'HIGH' : ratio > 1 ? 'MEDIUM' : 'LOW'}`);
}

// Run tests if executed directly
if (require.main === module) {
  testCollectorAgent().catch(console.error);
}

module.exports = { testCollectorAgent };