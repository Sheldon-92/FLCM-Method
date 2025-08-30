# Workflow Definitions

This directory contains workflow orchestration definitions that coordinate agent interactions.

## Workflows

- **quick-mode.yaml** - Fast content generation (20-30 minutes) with simplified pipeline
- **standard-mode.yaml** - Full depth content creation (45-60 minutes) with all agents

## Workflow Components

Each workflow defines:
- Agent execution sequence
- Document handoff points
- Methodology selection rules
- Error handling strategies
- Success criteria

## Usage

Workflows are triggered via Claude Code commands:
- `/flcm:quick` - Execute Quick Mode workflow
- `/flcm:standard` - Execute Standard Mode workflow