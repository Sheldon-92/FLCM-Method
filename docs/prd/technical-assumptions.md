# **Technical Assumptions**

## **Repository Structure: Monorepo**

Following BMAD's successful pattern, FLCM will use a monorepo with a `.flcm-core` directory structure:

```
content-makers/
├── .flcm-core/
│   ├── agents/           # Individual agent definitions (like BMAD)
│   ├── workflows/        # Content creation workflows
│   ├── tasks/           # Reusable task definitions
│   ├── templates/       # Document templates (content-brief, knowledge-doc, etc.)
│   ├── methodologies/   # Thinking tools and frameworks
│   ├── checklists/      # Quality validation checklists
│   ├── data/           # User preferences and configurations
│   ├── core-config.yaml # Project configuration
│   └── install-manifest.yaml # Version tracking
├── .claude/
│   └── commands/        # Claude Code command definitions
├── docs/
│   ├── content/        # Generated content documents
│   ├── knowledge/      # Knowledge synthesis documents
│   └── publish/        # Publishing packages
```

## **Service Architecture**

**MVP Architecture**: Modular agent system within Claude Code (inspired by BMAD's agent architecture)
- Each agent as a YAML definition in `.flcm-core/agents/`
- Shared utilities in `.flcm-core/utils/`
- Workflow orchestration via `.flcm-core/workflows/`
- Task execution through `.flcm-core/tasks/`
- Document generation using `.flcm-core/templates/`

## **Testing Requirements**

**CRITICAL DECISION** - Adopting BMAD's comprehensive testing approach:
- **Task Validation**: Each task in `.flcm-core/tasks/` includes success criteria
- **Workflow Testing**: Complete workflows tested end-to-end
- **Checklist Integration**: Quality checklists run automatically
- **Document Validation**: Schema validation for all document types
- **Methodology Testing**: Each thinking tool validated independently
- **Voice Consistency**: Automated fingerprint matching

## **Additional Technical Assumptions and Requests**

**Following BMAD's Architecture Patterns:**
- **Configuration Management**: YAML-based like BMAD's `core-config.yaml` for all settings
- **Task Structure**: Markdown files with embedded instructions (like BMAD's tasks)
- **Template System**: YAML templates defining document structures and sections
- **Command System**: `.claude/commands/` for Claude Code integration
- **Workflow Engine**: YAML workflows orchestrating agent collaboration
- **Install Manifest**: Track versions and modifications like BMAD
- **Agent Communication**: Event-driven message passing between agents
- **Document Pipeline**: Clear input→process→output for each agent
- **Checklist System**: Automated quality gates between phases
- **Data Storage**: `.flcm-core/data/` for user preferences and learned patterns

**FLCM-Specific Extensions:**
- **Methodology Engine**: `.flcm-core/methodologies/` containing thinking tools
- **Knowledge Graph Integration**: Obsidian vault structure for knowledge persistence
- **Voice Preservation System**: Voice DNA profiles in `.flcm-core/data/voice-profiles/`
- **Platform Adapters**: `.flcm-core/adapters/` with platform-specific rules

---
