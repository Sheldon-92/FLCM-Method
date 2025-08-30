# Document Templates

This directory contains YAML templates for documents generated throughout the content creation pipeline.

## Template Types

- **content-brief-tmpl.yaml** - Structure for initial content briefs from Collector
- **knowledge-synthesis-tmpl.yaml** - Format for Scholar's knowledge synthesis
- **content-draft-tmpl.yaml** - Template for Creator's content drafts
- **platform-adaptation-tmpl.yaml** - Format for Adapter's platform-specific versions

## Template Structure

Each template defines:
- Required frontmatter fields
- Document sections
- Placeholder variables
- Validation rules
- Obsidian-compatible metadata

## Usage

Templates are used by agents to ensure consistent document structure throughout the pipeline. They support variable substitution and can be customized per user preferences.