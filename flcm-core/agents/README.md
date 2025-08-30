# Agent Definitions

This directory contains YAML definitions for the four core FLCM agents:

## Agents

1. **collector.yaml** - Gathers and processes input sources (URLs, documents, notes)
2. **scholar.yaml** - Synthesizes knowledge and creates learning progressions
3. **creator.yaml** - Generates content while preserving user's voice DNA
4. **adapter.yaml** - Optimizes content for different platforms

## Agent Structure

Each agent YAML file defines:
- Agent metadata (name, role, capabilities)
- Input/output specifications
- Methodology references
- Task assignments
- Communication protocols

## Usage

Agents are invoked through Claude Code commands and communicate via the document pipeline defined in the workflows directory.