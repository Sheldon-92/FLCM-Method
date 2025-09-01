# **Testing Strategy**

## **Testing Pyramid**

```
     E2E Workflow Tests
    /                 \
   Integration Tests   
  /                   \
 Agent Unit    Methodology Unit
```

## **Test Organization**

### **Frontend Tests**
```
.flcm-core/tests/
├── commands/
│   └── command.test.ts
└── utils/
    └── markdown.test.ts
```

### **Backend Tests**
```
.flcm-core/tests/
├── agents/
│   ├── collector.test.md
│   └── scholar.test.md
├── methodologies/
│   └── rice.test.md
└── workflows/
    └── quick-mode.test.md
```

### **E2E Tests**
```
.flcm-core/tests/e2e/
├── quick-workflow.test.md
├── standard-workflow.test.md
└── obsidian-integration.test.md
```

## **Test Examples**

### **Agent Test**
```markdown