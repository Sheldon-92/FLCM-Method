# **Frontend Architecture**

## **Component Architecture**

### **Component Organization**
```
.claude/
├── commands/
│   ├── flcm-init.ts
│   ├── flcm-collect.ts
│   ├── flcm-scholar.ts
│   ├── flcm-create.ts
│   └── flcm-adapt.ts
├── prompts/
│   ├── agent-prompts/
│   └── methodology-prompts/
└── utils/
    ├── markdown-utils.ts
    └── file-utils.ts
```

### **Command Template**
```typescript
// Claude Code Command Structure
export const collectCommand = {
  name: 'flcm:collect',
  description: 'Invoke Collector Agent',
  parameters: {
    source: {
      type: 'string',
      description: 'URL or file path to collect'
    },
    methodology: {
      type: 'string[]',
      optional: true,
      description: 'Specific methodologies to apply'
    }
  },
  execute: async (params) => {
    const agent = new CollectorAgent();
    return await agent.collect(params);
  }
};
```

## **State Management Architecture**

### **State Structure**
```typescript
interface FLCMState {
  currentWorkflow: WorkflowType | null;
  activeAgent: AgentId | null;
  documents: {
    briefs: ContentBrief[];
    syntheses: KnowledgeSynthesis[];
    drafts: ContentDraft[];
    adaptations: PlatformAdaptation[];
  };
  session: {
    startTime: Date;
    mode: 'quick' | 'standard';
    status: WorkflowStatus;
  };
  methodologies: {
    active: string[];
    history: MethodologyExecution[];
  };
}
```

### **State Management Patterns**
- Document-driven state persistence
- File system as source of truth
- Memory cache for active session
- Event log for methodology transparency

## **Routing Architecture**

### **Command Route Organization**
```
/flcm                    # Root namespace
├── :init                # System initialization
├── :help                # Display help
├── :status              # Current status
├── agents/              # Agent commands
│   ├── :collect
│   ├── :scholar
│   ├── :create
│   └── :adapt
├── workflows/           # Workflow commands
│   ├── :quick
│   └── :standard
└── utils/              # Utility commands
    ├── :vault
    └── :reflect
```

### **Protected Route Pattern**
```typescript
// Not applicable - all operations are local
// No authentication required
```

## **Frontend Services Layer**

### **Agent Service Setup**
```typescript
// Agent Service Interface
interface AgentService {
  invoke(input: any): Promise<Document>;
  getMethodologies(): string[];
  explainProcess(): string;
}

class CollectorService implements AgentService {
  private agent: CollectorAgent;
  
  constructor() {
    this.agent = new CollectorAgent();
  }
  
  async invoke(sources: Source[]): Promise<ContentBrief> {
    return await this.agent.collect(sources);
  }
  
  getMethodologies(): string[] {
    return ['RICE', 'SignalToNoise', 'PatternRecognition'];
  }
  
  explainProcess(): string {
    return this.agent.explainMethodology();
  }
}
```

### **Service Example**
```typescript
// Methodology Service
class MethodologyService {
  private engine: MethodologyEngine;
  
  async executeMethodology(
    name: string,
    input: any
  ): Promise<MethodologyResult> {
    const methodology = await this.loadMethodology(name);
    const result = await this.engine.execute(methodology, input);
    this.logExecution(name, result);
    return result;
  }
  
  private async loadMethodology(name: string): Promise<Methodology> {
    const path = `.flcm-core/methodologies/${name}.yaml`;
    return await parseYAML(readFile(path));
  }
}
```

---
