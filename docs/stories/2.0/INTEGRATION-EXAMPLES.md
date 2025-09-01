# FLCM 2.0 Cross-Story Integration Examples

## End-to-End Workflow Examples

### Example 1: Academic Paper → Multi-Platform Content
**Stories Involved**: 1.4, 2.1, 2.2, 2.3, 3.2, 3.3, 3.4

```bash
# Step 1: Scholar Analysis (Story 2.1)
/flcm scholar --input "research-paper.pdf" --framework "SWOT-USED,5W2H"
# Output: ./data/insights/research-paper-insights.md

# Step 2: Content Creation (Story 2.2) 
/flcm create --mode standard --voice-profile academic
# Input: ./data/insights/research-paper-insights.md
# Output: ./data/content/research-paper-content.md

# Step 3: Multi-Platform Publishing (Story 2.3)
/flcm publish --platforms "zhihu,linkedin" --schedule "2024-09-15 10:00"
# Output: ./data/published/zhihu-research-analysis.md
#         ./data/published/linkedin-research-summary.md
```

### Example 2: Video Transcript → Social Media Series
**Stories Involved**: 2.1, 2.2, 2.3, 3.5

```typescript
// Workflow automation example (Story 3.5)
const videoWorkflow = {
  name: "video-to-social",
  steps: [
    {
      agent: "scholar",
      task: "process-video",
      input: "{{input.video}}",
      frameworks: ["SCAMPER", "Pyramid"],
      output: "insights"
    },
    {
      agent: "creator", 
      task: "generate-series",
      mode: "custom",
      voice: "casual-engaging",
      input: "{{insights}}",
      output: "content-series"
    },
    {
      agent: "publisher",
      task: "adapt-platforms",
      platforms: ["xiaohongshu", "wechat"],
      scheduling: "daily-sequence",
      input: "{{content-series}}"
    }
  ]
};
```

## Story Dependency Resolution Examples

### Configuration Chain (Stories 1.2 → 1.3 → 1.4)
```yaml
# Story 1.2 creates structure, Story 1.3 uses it
# .flcm-core/core-config.yaml (Story 1.3)
flcm:
  scholar:
    inputPath: "./data/input"        # Story 1.2 structure
    insightsPath: "./data/insights"  # Story 1.4 pipeline
    frameworks:
      - "SWOT-USED"
      - "SCAMPER" 
  documents:  # Story 1.4 pipeline configuration
    stages:
      - name: "insights"
        path: "./data/insights"
        schema: "insights-schema.yaml"
      - name: "content" 
        path: "./data/content"
        schema: "content-schema.yaml"
```

### Agent Communication Chain (Stories 2.1 → 2.2 → 2.3 via 2.4)
```typescript
// Story 2.4: Message bus coordinates agent flow
class AgentWorkflow {
  async executeFullPipeline(input: InputDocument): Promise<PublishedContent[]> {
    // Story 2.1: Scholar processes input
    const insights = await this.messageBus.request('scholar', {
      type: 'ANALYZE',
      payload: { input, frameworks: ['SWOT-USED', 'SCAMPER'] }
    });

    // Story 2.2: Creator generates content
    const content = await this.messageBus.request('creator', {
      type: 'CREATE',
      payload: { insights, mode: 'standard', voiceProfile: 'user-profile' }
    });

    // Story 2.3: Publisher adapts for platforms
    const published = await this.messageBus.request('publisher', {
      type: 'PUBLISH',
      payload: { content, platforms: ['zhihu', 'linkedin'] }
    });

    return published;
  }
}
```

## Error Handling Across Stories

### Cascading Error Recovery (Stories 2.1 → 2.2 → 2.3)
```typescript
// Cross-story error handling example
try {
  const insights = await scholar.analyze(input);
} catch (scholarError) {
  // Fallback: Use basic analysis instead
  const basicInsights = await createBasicInsights(input);
  
  try {
    const content = await creator.create(basicInsights);
  } catch (creatorError) {
    // Fallback: Use template-based creation
    const templateContent = await useContentTemplate(basicInsights.topic);
    
    // Still attempt publishing with fallback content
    await publisher.publish(templateContent, ['linkedin']); // Safest platform
  }
}
```

## Performance Integration Testing

### End-to-End Performance Targets
```typescript
describe('Full Pipeline Performance', () => {
  test('PDF → Multi-platform publishing <30 seconds', async () => {
    const startTime = Date.now();
    
    // Story 2.1: Scholar analysis
    const insights = await scholar.analyze('./test-data/10mb-paper.pdf');
    expect(Date.now() - startTime).toBeLessThan(5000); // Story 2.1 target
    
    // Story 2.2: Content creation  
    const content = await creator.create(insights, { mode: 'quick' });
    expect(Date.now() - startTime).toBeLessThan(8000); // +3 seconds
    
    // Story 2.3: Multi-platform publishing
    const published = await publisher.publishAll(content);
    expect(Date.now() - startTime).toBeLessThan(12000); // +4 seconds
    
    expect(published.length).toBe(4); // All platforms successful
  });
});
```

## Claude Command Integration Scenarios

### Multi-Command Workflows (Story 3.5)
```bash
# Complex workflow with error handling
/flcm flow create research-workflow \
  --step "scholar --input {{input}} --frameworks SWOT-USED,SCAMPER" \
  --step "create --mode standard --voice-profile academic" \
  --step "publish --platforms zhihu,linkedin --schedule next-weekday-10am" \
  --on-error "retry-3x" \
  --notifications "claude-chat"

# Execute the workflow
/flcm flow run research-workflow --input "paper.pdf"
```

This integration guide ensures developers understand how stories work together to create the complete FLCM 2.0 system.