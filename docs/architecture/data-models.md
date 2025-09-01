# **Data Models**

## **Content Brief**
**Purpose:** Captures collected sources and extracted insights

**Key Attributes:**
- sources: URL[] - Array of source URLs/files
- insights: Insight[] - Extracted key points
- signal_score: number - Signal-to-noise ratio
- concepts: string[] - Identified concepts
- contradictions: Contradiction[] - Conflicting information

**TypeScript Interface:**
```typescript
interface ContentBrief {
  id: string;
  created: Date;
  sources: Source[];
  insights: Insight[];
  signalScore: number;
  concepts: string[];
  contradictions: Contradiction[];
  metadata: {
    agent: 'collector';
    methodology: string[];
  };
}
```

**Relationships:**
- Feeds into → Knowledge Synthesis
- References → Source Documents
- Creates → Concept Pages

## **Knowledge Synthesis**
**Purpose:** Deep understanding of concepts through progressive learning

**Key Attributes:**
- concept: string - Main concept being explored
- depth_level: 1-5 - Current understanding depth
- analogies: Analogy[] - Generated analogies
- questions: Question[] - Open questions
- confidence: 1-10 - Understanding confidence

**TypeScript Interface:**
```typescript
interface KnowledgeSynthesis {
  id: string;
  concept: string;
  depthLevel: 1 | 2 | 3 | 4 | 5;
  explanation: string[];
  analogies: Analogy[];
  questions: Question[];
  confidence: number;
  teachingReady: boolean;
  metadata: {
    agent: 'scholar';
    methodology: string[];
  };
}
```

**Relationships:**
- Derives from → Content Brief
- Informs → Content Draft
- Links to → Related Concepts

## **Content Draft**
**Purpose:** Core content with voice preservation

**Key Attributes:**
- content: string - Main content body
- voice_dna: VoiceProfile - Linguistic patterns
- revisions: Revision[] - Edit history
- structure: ContentStructure - Organization
- hooks: Hook[] - Engagement points

**TypeScript Interface:**
```typescript
interface ContentDraft {
  id: string;
  title: string;
  content: string;
  voiceDNA: VoiceProfile;
  revisions: Revision[];
  structure: ContentStructure;
  hooks: Hook[];
  wordCount: number;
  metadata: {
    agent: 'creator';
    methodology: string[];
    iterations: number;
  };
}
```

**Relationships:**
- Built from → Knowledge Synthesis
- Maintains → Voice Profile
- Transforms to → Platform Adaptations

## **Platform Adaptation**
**Purpose:** Platform-optimized content versions

**Key Attributes:**
- platform: Platform - Target platform
- adapted_content: string - Platform-specific version
- optimizations: Optimization[] - Platform rules applied
- hashtags: string[] - Platform tags
- media_prompts: string[] - Visual suggestions

**TypeScript Interface:**
```typescript
interface PlatformAdaptation {
  id: string;
  platform: 'wechat' | 'xiaohongshu' | 'linkedin' | 'twitter';
  adaptedContent: string;
  optimizations: Optimization[];
  hashtags: string[];
  mediaPrompts: string[];
  characterCount: number;
  metadata: {
    agent: 'adapter';
    methodology: string[];
    platformRules: string[];
  };
}
```

**Relationships:**
- Derives from → Content Draft
- Publishes to → Platform Channels
- Tracks → Performance Metrics

---
