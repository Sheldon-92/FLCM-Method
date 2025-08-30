#!/usr/bin/env node

/**
 * Collector Agent Demo
 * Demonstrates the Collector Agent processing different types of content
 */

const fs = require('fs');
const path = require('path');

// Demo content samples
const demoContent = {
  article: {
    type: 'text',
    source: `
# The Future of AI in Content Creation

Recent studies from Stanford's AI Lab reveal that content creation is undergoing a fundamental transformation. According to Dr. Emily Watson, lead researcher, "We're seeing a 73% improvement in content quality when AI and human creativity work in tandem."

## Key Insights from the Research

1. **Augmentation, Not Replacement**: AI tools enhance human creativity rather than replacing it. Data shows that writers using AI assistance produce 2.5x more content while maintaining quality.

2. **Personalization at Scale**: Machine learning algorithms can now adapt content to individual reader preferences with 89% accuracy, creating truly personalized experiences.

3. **Efficiency Gains**: Content teams report saving an average of 15 hours per week on routine tasks, allowing more time for strategic thinking and creativity.

## Practical Applications

Companies implementing AI-powered content strategies are seeing remarkable results:
- Netflix: 35% increase in engagement through AI-curated content recommendations
- HubSpot: 67% improvement in lead generation with AI-optimized blog posts
- The New York Times: 4x increase in reader retention using AI-driven personalization

## Looking Ahead

The convergence of natural language processing, computer vision, and predictive analytics is creating unprecedented opportunities for content creators. However, success requires a thoughtful approach that balances automation with authentic human voice.

"The future belongs to creators who can effectively collaborate with AI systems," concludes Dr. Watson. "It's not about choosing between human or machine – it's about finding the optimal synthesis."
`,
    label: 'Research Article'
  },
  
  tutorial: {
    type: 'text',
    source: `
# How to Build a Content Strategy in 5 Steps

Creating an effective content strategy doesn't have to be overwhelming. Follow this proven framework to build a strategy that delivers results.

## Step 1: Define Your Audience

Before creating any content, understand who you're speaking to:
- Demographics: Age, location, profession
- Psychographics: Values, interests, pain points
- Behavior: Content consumption habits, preferred platforms

## Step 2: Set Clear Objectives

What do you want to achieve?
- Brand awareness: Reach new audiences
- Lead generation: Convert visitors to prospects
- Customer retention: Keep existing customers engaged
- Thought leadership: Establish authority in your industry

## Step 3: Audit Existing Content

Evaluate what you already have:
- High performers: What content drives the most engagement?
- Gaps: What topics haven't you covered?
- Outdated content: What needs updating or removal?

## Step 4: Create a Content Calendar

Plan your content production:
- Frequency: How often will you publish?
- Themes: What topics will you cover each month?
- Formats: Blog posts, videos, podcasts, infographics
- Distribution: Which channels will you use?

## Step 5: Measure and Optimize

Track your performance:
- Traffic metrics: Page views, unique visitors, time on page
- Engagement: Comments, shares, likes
- Conversions: Email signups, downloads, purchases
- ROI: Revenue attributed to content efforts

Remember: A successful content strategy is iterative. Continuously refine based on data and feedback.
`,
    label: 'How-To Guide'
  },
  
  social: {
    type: 'text',
    source: `
🚀 Just discovered an AMAZING productivity hack!

Been testing this for 2 weeks and my output has literally DOUBLED! 

Here's the secret:

Time-boxing + AI tools = MAGIC ✨

Instead of spending hours on research, I use AI to:
• Summarize key points in seconds
• Generate initial drafts
• Find relevant data instantly

But here's the KEY: I still add my personal touch, stories, and expertise.

AI handles the heavy lifting. I focus on creativity and connection.

Results? 
📈 2x more content published
⏰ 50% less time spent
💡 Higher quality output
😊 Way less stress

Who else is leveraging AI for content creation? Drop your favorite tools below! 👇

#ContentCreation #AI #Productivity #ContentStrategy #DigitalMarketing
`,
    label: 'Social Media Post'
  }
};

/**
 * Simulate Collector Agent processing
 */
function processContent(input) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📥 Processing ${input.label}`);
  console.log('='.repeat(70));
  
  const content = input.source;
  const wordCount = content.split(/\s+/).length;
  
  // Simulate RICE scoring
  console.log('\n📊 RICE Analysis:');
  const rice = calculateRICE(content);
  console.log(`   Relevance: ${rice.relevance}/100 - ${getRating(rice.relevance)}`);
  console.log(`   Impact: ${rice.impact}/100 - ${getRating(rice.impact)}`);
  console.log(`   Confidence: ${rice.confidence}/100 - ${getRating(rice.confidence)}`);
  console.log(`   Effort: ${rice.effort}/100 - ${rice.effort < 40 ? '✅ Low' : rice.effort < 70 ? '⚠️ Medium' : '❌ High'}`);
  console.log(`   📈 Total Score: ${rice.total}/100`);
  
  // Simulate Signal-to-Noise
  console.log('\n📡 Signal Analysis:');
  const signals = extractSignals(content);
  console.log(`   Key Signals: ${signals.count}`);
  console.log(`   Noise Level: ${signals.noise}%`);
  console.log(`   S/N Ratio: ${signals.ratio.toFixed(2)}`);
  console.log(`   Quality: ${signals.quality}`);
  
  // Extract insights
  console.log('\n💡 Key Insights:');
  const insights = extractInsights(content);
  insights.forEach((insight, i) => {
    console.log(`   ${i + 1}. ${insight}`);
  });
  
  // Content patterns
  console.log('\n🔍 Content Patterns:');
  const patterns = identifyPatterns(content);
  patterns.forEach(pattern => {
    console.log(`   • ${pattern}`);
  });
  
  // Summary
  console.log('\n📋 Content Brief Summary:');
  console.log(`   Topic: ${extractTopic(content)}`);
  console.log(`   Word Count: ${wordCount}`);
  console.log(`   Reading Time: ~${Math.ceil(wordCount / 200)} minutes`);
  console.log(`   Target Audience: ${identifyAudience(content)}`);
  console.log(`   Recommended Action: ${getRecommendation(rice.total, signals.quality)}`);
}

function calculateRICE(content) {
  const hasData = /\d+%|\d+x|\$\d+/.test(content);
  const hasCitations = /according to|research|study|data/gi.test(content);
  const hasStructure = /^#{1,6}\s+|^\d+\.|^[•\-\*]/gm.test(content);
  const hasAction = /how to|step|guide|tutorial|framework/gi.test(content);
  
  const relevance = Math.min(100, 50 + (hasStructure ? 20 : 0) + (hasAction ? 20 : 0) + (hasData ? 10 : 0));
  const impact = Math.min(100, 40 + (hasData ? 25 : 0) + (hasAction ? 25 : 0) + (hasCitations ? 10 : 0));
  const confidence = Math.min(100, 60 + (hasCitations ? 20 : 0) + (hasData ? 20 : 0));
  const effort = Math.max(10, 30 + (content.length > 3000 ? 20 : 0) - (hasStructure ? 15 : 0));
  
  const total = Math.round((relevance * impact * confidence * ((100 - effort) / 100)) / 10000);
  
  return { relevance, impact, confidence, effort, total };
}

function extractSignals(content) {
  const signalWords = content.match(/insight|key|important|critical|essential|data|research|study/gi) || [];
  const noiseWords = content.match(/amazing|literally|actually|basically|obviously/gi) || [];
  
  const count = signalWords.length;
  const noise = Math.min(100, Math.round((noiseWords.length / (content.split(/\s+/).length)) * 1000));
  const ratio = count / Math.max(1, noiseWords.length);
  const quality = ratio > 3 ? '⭐ Excellent' : ratio > 1.5 ? '✅ Good' : ratio > 0.5 ? '⚠️ Fair' : '❌ Poor';
  
  return { count, noise, ratio, quality };
}

function extractInsights(content) {
  const insights = [];
  
  // Look for numbered points
  const numbered = content.match(/\d+\.\s*\*\*[^*]+\*\*:[^\.]+\./g) || [];
  numbered.forEach(point => {
    const clean = point.replace(/\d+\.\s*\*\*|\*\*|:/g, '').trim();
    if (clean.length > 20) insights.push(clean);
  });
  
  // Look for key statements
  if (insights.length < 3) {
    const keyStatements = content.match(/[^.]*\b(shows?|reveals?|demonstrates?|indicates?)\b[^.]+\./gi) || [];
    keyStatements.forEach(statement => {
      if (insights.length < 5) insights.push(statement.trim());
    });
  }
  
  return insights.slice(0, 5);
}

function identifyPatterns(content) {
  const patterns = [];
  
  if (/^#{1,6}\s+/gm.test(content)) patterns.push('Hierarchical structure with headers');
  if (/^\d+\./gm.test(content)) patterns.push('Sequential numbered steps');
  if (/^[•\-\*]\s+/gm.test(content)) patterns.push('Bulleted list format');
  if (/\bstep\s+\d+\b/gi.test(content)) patterns.push('Step-by-step instructions');
  if (/"[^"]{30,}"/g.test(content)) patterns.push('Expert quotes and citations');
  if (/\d+%|\$[\d,]+|\d+x/g.test(content)) patterns.push('Data-driven arguments');
  if (/\?[^?]{20,}/g.test(content)) patterns.push('Question-based engagement');
  if (/example|case study/gi.test(content)) patterns.push('Example-based learning');
  
  return patterns.length > 0 ? patterns : ['No distinct patterns identified'];
}

function extractTopic(content) {
  const h1 = content.match(/^#\s+([^\n]+)/m);
  if (h1) return h1[1].trim();
  
  const firstLine = content.trim().split('\n')[0];
  return firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');
}

function identifyAudience(content) {
  const audiences = {
    'developer|code|api|programming': 'Developers',
    'marketing|content|brand|engagement': 'Marketers',
    'research|study|data|analysis': 'Researchers',
    'how to|guide|tutorial|step': 'Learners',
    'business|strategy|roi|revenue': 'Business Leaders'
  };
  
  for (const [pattern, audience] of Object.entries(audiences)) {
    if (new RegExp(pattern, 'gi').test(content)) {
      return audience;
    }
  }
  
  return 'General Audience';
}

function getRating(score) {
  if (score >= 80) return '⭐ Excellent';
  if (score >= 60) return '✅ Good';
  if (score >= 40) return '⚠️ Fair';
  return '❌ Poor';
}

function getRecommendation(riceScore, signalQuality) {
  if (riceScore >= 70 && signalQuality.includes('Excellent')) {
    return '🚀 High priority - Process immediately';
  } else if (riceScore >= 50 || signalQuality.includes('Good')) {
    return '✅ Good candidate - Process normally';
  } else if (riceScore >= 30) {
    return '⚠️ Consider improving before processing';
  } else {
    return '❌ Low value - May not be worth processing';
  }
}

/**
 * Main demo execution
 */
function runDemo() {
  console.log('\n');
  console.log('🤖 FLCM Collector Agent Demo');
  console.log('=' .repeat(70));
  console.log('Demonstrating content analysis and signal extraction');
  
  // Process each demo content
  processContent(demoContent.article);
  processContent(demoContent.tutorial);
  processContent(demoContent.social);
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Demo Complete!');
  console.log('='.repeat(70));
  console.log('\nThe Collector Agent has analyzed the content and created content briefs.');
  console.log('These briefs would normally be passed to the Scholar Agent for knowledge synthesis.');
  console.log('');
}

// Run demo if executed directly
if (require.main === module) {
  runDemo();
}

module.exports = { runDemo };