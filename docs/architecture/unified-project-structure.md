# **Unified Project Structure**

```plaintext
content-makers/
├── .github/                        # Optional CI/CD
│   └── workflows/
│       └── test.yaml
├── .flcm-core/                     # Core FLCM System (mirrors .bmad-core/)
│   ├── agents/                     # Agent definitions (YAML)
│   │   ├── collector.yaml
│   │   ├── scholar.yaml
│   │   ├── creator.yaml
│   │   └── adapter.yaml
│   ├── workflows/                  # Workflow definitions
│   │   ├── quick-mode.yaml
│   │   └── standard-mode.yaml
│   ├── tasks/                      # Executable tasks (Markdown)
│   │   ├── collect-sources.md
│   │   ├── synthesize-knowledge.md
│   │   ├── create-content.md
│   │   ├── adapt-platform.md
│   │   └── execute-checklist.md
│   ├── templates/                  # Document templates (YAML)
│   │   ├── content-brief-tmpl.yaml
│   │   ├── knowledge-synthesis-tmpl.yaml
│   │   ├── content-draft-tmpl.yaml
│   │   ├── platform-adaptation-tmpl.yaml
│   │   └── reflection-tmpl.yaml
│   ├── methodologies/              # Thinking tools and frameworks
│   │   ├── collection/
│   │   │   ├── rice-framework.yaml
│   │   │   ├── signal-to-noise.yaml
│   │   │   └── pattern-recognition.yaml
│   │   ├── learning/
│   │   │   ├── feynman-technique.yaml
│   │   │   ├── progressive-depth.yaml
│   │   │   └── socratic-method.yaml
│   │   ├── creation/
│   │   │   ├── spark-method.yaml
│   │   │   ├── voice-dna.yaml
│   │   │   └── prep-framework.yaml
│   │   └── adaptation/
│   │       ├── platform-rules/
│   │       └── engagement-models/
│   ├── checklists/                 # Quality validation
│   │   ├── content-quality.md
│   │   ├── voice-consistency.md
│   │   └── platform-optimization.md
│   ├── data/                       # User preferences and configs
│   │   ├── voice-profiles/
│   │   ├── user-preferences.yaml
│   │   └── platform-accounts.yaml
│   ├── core-config.yaml           # FLCM configuration
│   └── install-manifest.yaml      # Version tracking
├── .claude/                        # Claude Code integration
│   └── commands/
│       ├── flcm-init.ts
│       ├── flcm-collect.ts
│       ├── flcm-scholar.ts
│       ├── flcm-create.ts
│       ├── flcm-adapt.ts
│       └── flcm-help.ts
├── docs/                           # Generated content
│   ├── content/                    # Content briefs
│   │   └── briefs/
│   ├── knowledge/                  # Knowledge syntheses
│   │   ├── concepts/
│   │   └── syntheses/
│   ├── creation/                   # Content drafts
│   │   ├── drafts/
│   │   └── revisions/
│   ├── publish/                    # Publishing packages
│   │   └── [date]-[title]/
│   ├── prd.md                     # Product Requirements
│   └── architecture.md            # This document
├── obsidian-vault/                # Obsidian integration (optional)
│   └── [Obsidian structure]
├── .env.example                   # Environment template
├── package.json                   # Dependencies (if needed)
├── LICENSE.md
└── README.md
```

---
