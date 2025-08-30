# Quality Validation Checklists

This directory contains checklists for validating the quality and completeness of FLCM outputs.

## Checklist Types

- **content-quality.yaml** - Validates content meets quality standards
- **voice-consistency.yaml** - Ensures voice DNA preservation
- **platform-optimization.yaml** - Verifies platform-specific requirements
- **methodology-transparency.yaml** - Confirms methodology disclosure

## Checklist Format

Each checklist includes:
- Validation criteria
- Pass/fail conditions
- Scoring rubrics
- Remediation steps
- Auto-validation rules where applicable

## Usage

Checklists are executed:
- Automatically after each agent completes its task
- Manually via `/flcm:validate` command
- As part of workflow completion criteria

Results are logged for continuous improvement and quality tracking.