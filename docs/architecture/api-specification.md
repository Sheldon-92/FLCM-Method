# **API Specification**

## **Command API (Claude Code Integration)**

```typescript
// Command Router Definition (tRPC-style)
interface FLCMCommands {
  // System Commands
  '/flcm:init': () => Promise<void>;
  '/flcm:help': () => Promise<string>;
  '/flcm:status': () => Promise<SystemStatus>;
  
  // Agent Invocation
  '/flcm:collect': (input: CollectInput) => Promise<ContentBrief>;
  '/flcm:scholar': (brief: ContentBrief) => Promise<KnowledgeSynthesis>;
  '/flcm:create': (synthesis: KnowledgeSynthesis) => Promise<ContentDraft>;
  '/flcm:adapt': (draft: ContentDraft) => Promise<PlatformAdaptation[]>;
  
  // Workflow Commands
  '/flcm:quick': (input: string) => Promise<PublishPackage>;
  '/flcm:standard': (input: string) => Promise<PublishPackage>;
  
  // Utility Commands
  '/flcm:vault': (action: VaultAction) => Promise<void>;
  '/flcm:reflect': () => Promise<ReflectionDoc>;
}

// Agent Communication Protocol
interface AgentMessage {
  from: AgentId;
  to: AgentId;
  type: 'request' | 'response' | 'event';
  payload: Document;
  methodology: string[];
  timestamp: Date;
}
```

---
