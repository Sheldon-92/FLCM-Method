# API Reference

Welcome to the FLCM 2.0 API documentation. This comprehensive reference covers all public interfaces, classes, and methods available in the FLCM system.

## 📋 Table of Contents

- [Core APIs](#core-apis)
- [Agent APIs](#agent-apis)
- [Pipeline APIs](#pipeline-apis)
- [Methodology APIs](#methodology-apis)
- [Shared Utilities](#shared-utilities)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Examples](#examples)

## 🎯 Core APIs

### FLCM Main Interface

The primary entry point for all FLCM operations.

```typescript
import FLCM from 'flcm-core';

const flcm = new FLCM({
  configPath: './flcm-config.yaml',
  workspaceDir: './workspace'
});
```

#### Methods

##### `learn(input: LearningInput): Promise<LearningResult>`

Process content from various sources.

```typescript
interface LearningInput {
  url?: string;
  text?: string;
  file?: string;
  methodology?: string[];
  agents?: AgentConfig[];
  outputFormat?: OutputFormat;
}

interface LearningResult {
  id: string;
  summary: ContentSummary;
  knowledgePoints: KnowledgePoint[];
  connections: Connection[];
  metadata: ProcessingMetadata;
}

// Example
const result = await flcm.learn({
  url: 'https://example.com/article',
  methodology: ['progressive-depth'],
  outputFormat: 'markdown'
});
```

##### `create(request: CreationRequest): Promise<CreationResult>`

Generate new content based on learned materials.

```typescript
interface CreationRequest {
  type: 'blog' | 'linkedin' | 'twitter' | 'presentation' | 'summary';
  input: string | LearningResult;
  style?: StyleOptions;
  template?: string;
  voiceDNA?: string;
}

interface CreationResult {
  content: string;
  metadata: CreationMetadata;
  adaptations?: PlatformAdaptation[];
}

// Example
const post = await flcm.create({
  type: 'blog',
  input: result,
  style: { tone: 'professional', length: 'medium' },
  voiceDNA: 'my-writing-style'
});
```

##### `configure(config: Partial<FLCMConfig>): Promise<void>`

Update system configuration.

```typescript
interface FLCMConfig {
  agents: AgentConfigurations;
  methodologies: MethodologyConfigurations;
  output: OutputConfigurations;
  integrations: IntegrationConfigurations;
}

// Example
await flcm.configure({
  agents: {
    scholar: { analysisDepth: 'deep' },
    creator: { creativityLevel: 'high' }
  }
});
```

## 🤖 Agent APIs

### Scholar Agent

Responsible for content analysis and knowledge extraction.

```typescript
import { ScholarAgent } from 'flcm-core/agents';

const scholar = new ScholarAgent(config);
```

#### Methods

##### `analyze(content: ContentInput): Promise<AnalysisResult>`

Perform deep content analysis.

```typescript
interface ContentInput {
  text: string;
  metadata?: ContentMetadata;
  context?: AnalysisContext;
}

interface AnalysisResult {
  concepts: Concept[];
  keyPoints: KeyPoint[];
  structure: DocumentStructure;
  complexity: ComplexityMetrics;
  topics: TopicClassification[];
}

// Example
const analysis = await scholar.analyze({
  text: "Artificial intelligence is transforming education...",
  metadata: { source: 'academic-paper', domain: 'education' }
});
```

##### `extractKnowledge(content: string, options?: ExtractionOptions): Promise<KnowledgeExtractionResult>`

Extract structured knowledge from content.

```typescript
interface ExtractionOptions {
  depth: 'surface' | 'moderate' | 'deep';
  includeQuestions: boolean;
  generateConnections: boolean;
  minConfidence: number;
}

interface KnowledgeExtractionResult {
  facts: Fact[];
  principles: Principle[];
  questions: Question[];
  connections: KnowledgeConnection[];
}

// Example
const knowledge = await scholar.extractKnowledge(content, {
  depth: 'deep',
  includeQuestions: true,
  minConfidence: 0.8
});
```

### Creator Agent

Handles content generation and adaptation.

```typescript
import { CreatorAgent } from 'flcm-core/agents';

const creator = new CreatorAgent(config);
```

#### Methods

##### `generate(request: GenerationRequest): Promise<GenerationResult>`

Generate new content based on input materials.

```typescript
interface GenerationRequest {
  type: ContentType;
  input: ProcessedContent;
  style: StyleGuide;
  constraints?: GenerationConstraints;
}

interface GenerationResult {
  content: string;
  alternatives: string[];
  confidence: number;
  metadata: GenerationMetadata;
}

// Example
const content = await creator.generate({
  type: 'blog-post',
  input: knowledgeBase,
  style: {
    tone: 'conversational',
    audience: 'beginners',
    length: 1500
  }
});
```

##### `adaptToVoice(content: string, voiceProfile: VoiceProfile): Promise<AdaptationResult>`

Adapt content to match a specific writing voice.

```typescript
interface VoiceProfile {
  id: string;
  characteristics: VoiceCharacteristics;
  examples: WritingSample[];
  metrics: VoiceMetrics;
}

interface AdaptationResult {
  adaptedContent: string;
  changes: ContentChange[];
  voiceMatch: number; // 0-1 similarity score
}

// Example
const adapted = await creator.adaptToVoice(originalContent, myVoiceProfile);
```

### Publisher Agent

Manages multi-platform content publishing and optimization.

```typescript
import { PublisherAgent } from 'flcm-core/agents';

const publisher = new PublisherAgent(config);
```

#### Methods

##### `optimize(content: string, platform: Platform): Promise<OptimizationResult>`

Optimize content for specific platforms.

```typescript
type Platform = 'linkedin' | 'twitter' | 'medium' | 'blog' | 'email';

interface OptimizationResult {
  optimizedContent: string;
  metadata: PlatformMetadata;
  recommendations: OptimizationRecommendation[];
}

// Example
const linkedinPost = await publisher.optimize(blogPost, 'linkedin');
```

## 🔄 Pipeline APIs

### Document Transformer

Core content processing pipeline.

```typescript
import { DocumentTransformer } from 'flcm-core/pipeline';

const transformer = new DocumentTransformer();
```

#### Methods

##### `transform(document: Document, transformations: Transformation[]): Promise<TransformResult>`

Apply transformations to documents.

```typescript
interface Document {
  content: string;
  format: DocumentFormat;
  metadata: DocumentMetadata;
}

interface Transformation {
  type: TransformationType;
  parameters: TransformationParameters;
  priority: number;
}

// Example
const result = await transformer.transform(document, [
  { type: 'extract-concepts', parameters: { minConfidence: 0.7 }, priority: 1 },
  { type: 'generate-summary', parameters: { maxLength: 300 }, priority: 2 }
]);
```

### Quality Assurance

Content validation and improvement.

```typescript
import { QualityAssurance } from 'flcm-core/pipeline';

const qa = new QualityAssurance();
```

#### Methods

##### `validate(content: string, criteria: ValidationCriteria): Promise<ValidationResult>`

Validate content quality.

```typescript
interface ValidationCriteria {
  grammar: boolean;
  clarity: boolean;
  factualAccuracy: boolean;
  coherence: boolean;
  customRules?: ValidationRule[];
}

interface ValidationResult {
  score: number; // 0-100
  issues: ValidationIssue[];
  suggestions: ImprovementSuggestion[];
  passed: boolean;
}

// Example
const validation = await qa.validate(content, {
  grammar: true,
  clarity: true,
  factualAccuracy: true,
  coherence: true
});
```

## 📋 Methodology APIs

### Progressive Depth Learning

Adaptive complexity management methodology.

```typescript
import { ProgressiveDepthLearning } from 'flcm-core/methodologies';

const pdl = new ProgressiveDepthLearning();
```

#### Methods

##### `adaptComplexity(content: string, userLevel: SkillLevel): Promise<AdaptedContent>`

Adapt content complexity to user skill level.

```typescript
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface AdaptedContent {
  content: string;
  complexity: ComplexityLevel;
  prerequisites: string[];
  nextSteps: string[];
}

// Example
const adapted = await pdl.adaptComplexity(technicalContent, 'beginner');
```

### Voice DNA Extraction

Writing style analysis and application.

```typescript
import { VoiceDNAExtractor } from 'flcm-core/methodologies';

const voiceExtractor = new VoiceDNAExtractor();
```

#### Methods

##### `analyzeVoice(samples: WritingSample[]): Promise<VoiceProfile>`

Analyze writing samples to extract voice characteristics.

```typescript
interface WritingSample {
  text: string;
  context: string;
  metadata?: SampleMetadata;
}

// Example
const voiceProfile = await voiceExtractor.analyzeVoice([
  { text: blogPost1, context: 'technical-blog' },
  { text: article1, context: 'educational' }
]);
```

## 🛠️ Shared Utilities

### Health Check

System health monitoring.

```typescript
import { HealthChecker } from 'flcm-core/shared';

const healthChecker = new HealthChecker();
const health = await healthChecker.runHealthCheck();
```

### Monitoring

Real-time system monitoring.

```typescript
import { MonitoringSystem } from 'flcm-core/shared';

const monitoring = new MonitoringSystem({
  interval: 30, // seconds
  thresholds: { memory: 80, disk: 85 }
});

monitoring.start();
monitoring.on('alert', (alert) => {
  console.log('System alert:', alert);
});
```

## ⚙️ Configuration

### Config Schema

```typescript
interface FLCMConfig {
  // Agent configurations
  agents: {
    scholar: ScholarConfig;
    creator: CreatorConfig;
    publisher: PublisherConfig;
  };
  
  // Methodology settings
  methodologies: {
    progressiveDepth: ProgressiveDepthConfig;
    voiceDNA: VoiceDNAConfig;
    platformOptimization: PlatformOptimizationConfig;
  };
  
  // Output settings
  output: {
    format: OutputFormat;
    directory: string;
    naming: NamingConvention;
  };
  
  // Integration settings
  integrations: {
    obsidian: ObsidianConfig;
    apis: APIConfigurations;
  };
}
```

### Environment Variables

```bash
# Core settings
FLCM_WORKSPACE_DIR=./workspace
FLCM_CONFIG_PATH=./flcm-config.yaml
FLCM_LOG_LEVEL=info

# Agent settings
FLCM_SCHOLAR_MODEL=gpt-4
FLCM_CREATOR_CREATIVITY=balanced
FLCM_PUBLISHER_PLATFORMS=linkedin,twitter

# Performance settings
FLCM_MAX_CONCURRENT=5
FLCM_TIMEOUT=30000
FLCM_MEMORY_LIMIT=2048
```

## 🚨 Error Handling

### Error Types

```typescript
// Base error class
class FLCMError extends Error {
  code: string;
  details?: any;
  recoverable: boolean;
}

// Specific error types
class AgentError extends FLCMError {}
class PipelineError extends FLCMError {}
class ConfigurationError extends FLCMError {}
class ValidationError extends FLCMError {}
```

### Error Handling Patterns

```typescript
try {
  const result = await flcm.learn({ url: 'https://example.com' });
} catch (error) {
  if (error instanceof AgentError) {
    // Handle agent-specific errors
    console.log('Agent failed:', error.message);
    if (error.recoverable) {
      // Retry with different configuration
      const fallbackResult = await flcm.learn({ 
        url: 'https://example.com',
        agents: ['scholar'] // Use only scholar agent
      });
    }
  } else if (error instanceof ValidationError) {
    // Handle validation errors
    console.log('Validation failed:', error.details);
  }
}
```

## 💡 Examples

### Complete Learning Workflow

```typescript
import FLCM from 'flcm-core';

async function learningWorkflow() {
  const flcm = new FLCM();
  
  try {
    // 1. Learn from multiple sources
    const sources = [
      'https://example.com/article1',
      'https://example.com/article2'
    ];
    
    const learningResults = await Promise.all(
      sources.map(url => flcm.learn({ 
        url, 
        methodology: ['progressive-depth'] 
      }))
    );
    
    // 2. Create consolidated knowledge
    const knowledge = await flcm.consolidate(learningResults);
    
    // 3. Generate content for different platforms
    const blogPost = await flcm.create({
      type: 'blog',
      input: knowledge,
      style: { tone: 'educational', length: 2000 }
    });
    
    const linkedinPost = await flcm.create({
      type: 'linkedin',
      input: blogPost,
      style: { tone: 'professional', length: 500 }
    });
    
    // 4. Validate and optimize
    const validation = await flcm.validate(blogPost.content);
    if (!validation.passed) {
      const improved = await flcm.improve(blogPost.content, validation.suggestions);
      return improved;
    }
    
    return { blogPost, linkedinPost };
    
  } catch (error) {
    console.error('Learning workflow failed:', error);
    throw error;
  }
}
```

### Custom Agent Integration

```typescript
import { BaseAgent } from 'flcm-core/agents';

class CustomAnalysisAgent extends BaseAgent {
  async process(input: string): Promise<any> {
    // Custom analysis logic
    return {
      customMetrics: this.calculateCustomMetrics(input),
      insights: this.generateInsights(input)
    };
  }
  
  private calculateCustomMetrics(text: string) {
    // Implementation
  }
  
  private generateInsights(text: string) {
    // Implementation
  }
}

// Register custom agent
const flcm = new FLCM();
flcm.registerAgent('custom-analysis', CustomAnalysisAgent);

// Use in workflow
const result = await flcm.learn({
  url: 'https://example.com',
  agents: ['scholar', 'custom-analysis']
});
```

### Monitoring and Health Checks

```typescript
import { MonitoringSystem, HealthChecker } from 'flcm-core/shared';

// Set up monitoring
const monitoring = new MonitoringSystem({
  interval: 60,
  thresholds: {
    memory: 85,
    disk: 90,
    cpu: 80
  }
});

monitoring.on('alert', async (alert) => {
  console.log(`🚨 Alert: ${alert.message}`);
  
  if (alert.level === 'critical') {
    // Run health check for detailed diagnosis
    const health = await new HealthChecker().runHealthCheck();
    console.log('Health check results:', health);
    
    // Take corrective action
    if (health.status === 'critical') {
      await flcm.gracefulShutdown();
    }
  }
});

monitoring.start();
```

## 📚 Additional Resources

- **[TypeDoc Generated API Docs](/api/typedoc/)** - Auto-generated from source code
- **[Examples Repository](/examples/)** - Real-world usage examples  
- **[Integration Guides](/guide/integrations/)** - Third-party service integrations
- **[Testing Guide](/contributing/#testing)** - How to test your implementations

---

**Need more help?** Check our [User Guide](/guide/) or ask in [GitHub Discussions](https://github.com/Sheldon-92/FLCM-Method/discussions).