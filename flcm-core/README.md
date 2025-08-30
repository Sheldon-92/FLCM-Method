# FLCM - Friction Lab Content Maker

🚀 **Transform content creation into skill-building with persistent knowledge**

## Overview

FLCM is an AI-powered content creation system that transforms input sources into platform-optimized content while preserving your unique voice. It uses a four-agent pipeline with methodology-driven processing.

## Features

- 🤖 **4-Agent Pipeline**: Collector → Scholar → Creator → Adapter
- 📚 **Methodology-Driven**: RICE, SPARK, Progressive Depth Learning
- 🎯 **Platform Optimization**: LinkedIn, Twitter/X, WeChat, Xiaohongshu
- 🔄 **Voice DNA Preservation**: Maintains your unique writing style
- 📊 **Signal Detection**: Identifies high-value content signals
- 🧠 **Knowledge Synthesis**: Progressive depth learning system

## Installation

### Quick Install (Standalone)

```bash
# From the .flcm-core directory
./install.sh [target_directory]

# Or use Node.js installer (cross-platform)
node install.js [target_directory]
```

### Manual Installation

1. Copy `.flcm-core` directory to your desired location
2. Install dependencies: `npm install js-yaml`
3. Run validation: `node tests/validate-phase1.js`

### Claude Code Integration

FLCM integrates seamlessly with Claude Code:

1. The installer automatically sets up `/flcm` command
2. Or manually copy `.claude-template/commands/FLCM/flcm.md` to `.claude/commands/FLCM/`

## Directory Structure

```
.flcm-core/
├── agents/          # Agent definitions and implementations
├── commands/        # Command handlers for CLI
├── pipeline/        # Document processing pipeline
├── methodologies/   # Thinking frameworks by agent type
│   ├── collection/  # RICE, Signal-to-Noise
│   ├── learning/    # Progressive Depth, Analogies
│   ├── creation/    # SPARK, Voice DNA
│   └── adaptation/  # Platform rules, optimization
├── templates/       # Document templates
├── workflows/       # Workflow orchestration
├── tasks/          # Task definitions
├── checklists/     # Quality validation
├── data/           # User data & voice profiles
└── utils/          # Utility functions
```

## Configuration

Main configuration in `core-config.yaml`:

```yaml
system:
  name: "FLCM"
  version: "1.0.0"
  mode: "standard"

agents:
  collector:
    enabled: true
    methodologies: ["RICE", "SignalToNoise"]
  
  scholar:
    enabled: true
    max_depth: 5
  
  creator:
    enabled: true
    iterations: 3
  
  adapter:
    enabled: true
    platforms: ["linkedin", "twitter", "wechat", "xiaohongshu"]
```

## Agent Pipeline

```
Input → Collector → Scholar → Creator → Adapter → Output
         (signals)  (learning) (voice)   (platform)
```

### Agents

1. **Collector** 📥
   - Extracts signals from sources
   - Uses RICE framework
   - Creates content briefs

2. **Scholar** 📚
   - Progressive depth learning
   - Generates analogies
   - Synthesizes knowledge

3. **Creator** ✍️
   - Preserves voice DNA
   - Iterative refinement
   - Produces drafts

4. **Adapter** 🎯
   - Platform optimization
   - Hashtag generation
   - Format adaptation

## Development Status

### Phase 1 (Complete) ✅
- Repository structure
- Configuration system
- Command system
- Base agent framework
- Document pipeline

### Phase 2 (Next) 🚧
- Full agent implementations
- Methodology tools
- Workflow engine

## Testing

```bash
# Run validation tests
node tests/validate-phase1.js
```

## Safety & Security

- ✅ No dynamic code execution
- ✅ Configuration-driven architecture
- ✅ Input validation at every stage
- ✅ Local processing only

## Version

FLCM Core System v1.0

---

*Powered by FLCM™ - Friction Lab Content Maker*