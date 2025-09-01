# Requirements

## Functional

- **FR1**: System shall support parallel operation of 1.0 (4-agent) and 2.0 (3-layer) architectures during migration period
- **FR2**: Existing Obsidian vault integration must continue functioning without data loss or format changes
- **FR3**: All 1.0 methodologies (RICE, Teaching Preparation, Voice DNA) must be preserved and enhanced in 2.0
- **FR4**: New framework library shall include existing frameworks plus 10+ additional methodologies
- **FR5**: Document flow (insights.md → content.md → platforms) must be backward compatible with 1.0 outputs
- **FR6**: Migration tool shall convert existing agent outputs to new document format automatically
- **FR7**: Feature flags shall enable gradual rollout of 2.0 features to specific users
- **FR8**: Existing CLI commands must continue working with deprecation warnings
- **FR9**: New collaborative dialogue must support fallback to 1.0 command mode
- **FR10**: Platform adapters must maintain compatibility with existing format specifications
- **FR11**: Obsidian plugin shall provide bidirectional sync between FLCM and vault with conflict resolution
- **FR12**: Knowledge graph visualization shall display connections between insights, content, and frameworks
- **FR13**: Learning progress tracker shall record framework usage, insight depth, and growth metrics over time
- **FR14**: Obsidian templates shall auto-generate for each framework with proper frontmatter and structure
- **FR15**: Cross-reference system shall automatically link related content based on semantic similarity
- **FR16**: Daily/weekly learning summaries shall be generated in Obsidian with progress metrics
- **FR17**: Vault search shall support framework-specific queries and insight pattern matching

## Non Functional

- **NFR1**: Migration must not cause more than 5 seconds additional latency during transition period
- **NFR2**: System must maintain 99.9% uptime during migration (no breaking changes)
- **NFR3**: Memory usage must not exceed 1.0 baseline by more than 30%
- **NFR4**: All existing user data must be preserved with 100% integrity
- **NFR5**: Rollback to 1.0 must be possible within 30 seconds if issues detected
- **NFR6**: Performance metrics must be tracked for both 1.0 and 2.0 paths
- **NFR7**: Error messages must clearly indicate whether issue is in 1.0 or 2.0 code

## Compatibility Requirements

- **CR1**: Existing CLI API must remain functional with clear migration messages
- **CR2**: Obsidian vault structure and metadata format must remain unchanged
- **CR3**: Output file formats (Markdown, YAML) must maintain backward compatibility
- **CR4**: External tool integrations (VS Code extension plan) must work with both versions
