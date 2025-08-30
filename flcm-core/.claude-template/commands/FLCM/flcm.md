# /flcm Command

When this command is used, activate the FLCM (Friction Lab Content Maker) system.

<!-- Powered by FLCM™ -->

# FLCM - Friction Lab Content Maker

## Overview

FLCM is an AI-powered content creation system that transforms input sources into platform-optimized content while preserving your unique voice. It uses a four-agent pipeline with methodology-driven processing.

## Activation Instructions

When `/flcm` is invoked:

1. **Load FLCM Core System**
   - Initialize configuration from `.flcm-core/core-config.yaml`
   - Load agent definitions from `.flcm-core/agents/`
   - Set up document pipeline from `.flcm-core/pipeline/`

2. **Display Welcome Message**
   ```
   🚀 FLCM - Friction Lab Content Maker
   Version: 1.0.0
   
   Available modes:
   • Quick Mode (20-30 min): /flcm:quick
   • Standard Mode (45-60 min): /flcm:standard
   
   Type /flcm:help for all commands
   ```

3. **Available Commands**
   - `/flcm:init` - Initialize FLCM system
   - `/flcm:help` - Show available commands
   - `/flcm:status` - Check system status
   - `/flcm:quick <source>` - Quick content generation
   - `/flcm:standard <source>` - Full pipeline processing
   - `/flcm:config` - View/edit configuration

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

## Quick Start

```bash
# Process a URL
/flcm:quick "https://example.com/article"

# Process text
/flcm:quick "Your content here..."

# Check status
/flcm:status
```

## Configuration

Configuration is stored in `.flcm-core/core-config.yaml`:
- Agent settings
- Workflow preferences
- Output paths
- Methodology options

## Methodologies

FLCM uses various thinking frameworks:
- RICE (Relevance, Impact, Confidence, Effort)
- SPARK (Structure, Purpose, Audience, Relevance, Key Message)
- Progressive Depth Learning
- Voice DNA Analysis

## Platform Support

- LinkedIn (professional optimization)
- Twitter/X (thread creation)
- WeChat (Chinese formatting)
- Xiaohongshu (visual-first)
- Medium (long-form)
- Substack (newsletter)

## File Structure

```
.flcm-core/
├── agents/          # Agent definitions
├── commands/        # Command handlers
├── pipeline/        # Document pipeline
├── methodologies/   # Thinking tools
├── templates/       # Document templates
└── data/           # User data & configs
```

## Error Handling

FLCM includes comprehensive error handling:
- Validation at each stage
- Graceful degradation
- Recovery mechanisms
- Detailed error messages

## Privacy

- All processing is local
- No data sent externally
- Voice profiles stored locally
- Full user control

## Support

- Documentation: `.flcm-core/README.md`
- Issues: Create in project repository
- Updates: Check for new versions

---

*FLCM - Transform content creation into skill-building with persistent knowledge*