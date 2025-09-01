# FLCM 2.0 Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Existing Project Overview

#### Analysis Source
- IDE-based analysis of existing FLCM 1.0 codebase
- Original PRD available at: `/Users/sheldonzhao/Downloads/content-makers/docs/prd.md`
- User testing documentation at: `/Users/sheldonzhao/.flcm/docs/`

#### Current Project State
FLCM 1.0 is a functional Four-Agent content creation system (Collector, Scholar, Creator, Adapter) that helps users create multi-platform content. The system processes content through a linear pipeline where each agent performs specific tasks. Currently deployed as CLI tool with plans for VS Code extension. Real-world testing shows 55% success rate and 42% user satisfaction, revealing fundamental architectural issues with agent isolation and over-engineering.

### Available Documentation Analysis

#### Available Documentation
- [x] Original PRD (Version 1.0)
- [x] User Testing Results and Analysis
- [x] System Problem Analysis Document
- [x] Architecture Documentation (4-Agent system)
- [x] Installation Scripts
- [ ] API Documentation (partial)
- [ ] UX/UI Guidelines (not applicable for CLI)
- [x] Technical Debt Documentation (10 core issues identified)

### Enhancement Scope Definition

#### Enhancement Type
- [x] Major Feature Modification
- [x] Technology Stack Upgrade (Architecture change)
- [x] UI/UX Overhaul (Interaction paradigm shift)
- [x] Performance/Scalability Improvements

#### Enhancement Description
Transform FLCM from a 4-agent linear pipeline to a 3-layer document-driven architecture with collaborative interaction model. Replace fragmented agent system with integrated Mentor-Creator-Publisher layers, add 15+ professional methodology frameworks, and implement growth-oriented evaluation system.

#### Impact Assessment
- [x] Major Impact (architectural changes required)

The transformation requires fundamental restructuring while maintaining backward compatibility for existing users and preserving valuable components from 1.0.

### Goals and Background Context

#### Goals
- **Migrate** from 4-agent pipeline to 3-layer document-driven architecture while maintaining service continuity
- **Preserve** existing content creation capabilities while enhancing with 15+ professional frameworks
- **Transform** interaction model from command-driven to collaborative dialogue
- **Upgrade** evaluation system from judgment-based to growth-oriented feedback
- **Enhance** Obsidian integration with bidirectional sync, knowledge graph visualization, and learning progress tracking
- **Implement** persistent learning network where insights compound over time through Obsidian vault structure
- **Enable** cross-document connections and pattern recognition across all created content
- **Build** personal knowledge management system integrated with content creation workflow
- **Enable** gradual migration path for existing users without forced cutover
- **Improve** user satisfaction from 42% to 85% through better interaction design
- **Reduce** interaction rounds from 7.3 to 2-3 through framework-based guidance

#### Background Context
After extensive real-world testing revealing only 8% true user satisfaction (vs 91% claimed), fundamental issues were identified: agent context fragmentation, over-engineering for simple tasks, and misalignment with user needs for growth and learning. Users report feeling AI replaces rather than enhances their creativity. The 2.0 evolution addresses these issues through architectural transformation while preserving the valuable methodologies and frameworks from 1.0.

The enhancement leverages existing strengths (methodology-driven approach, multi-platform support) while addressing core weaknesses (agent isolation, rigid pipeline, lack of transparency).

### Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|---------|
| Initial | 2025-01-31 | 1.0 | Brownfield PRD creation | John (PM) |
| Architecture | 2025-01-31 | 1.1 | Added migration strategy | John (PM) |

## Requirements

### Functional

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

### Non Functional

- **NFR1**: Migration must not cause more than 5 seconds additional latency during transition period
- **NFR2**: System must maintain 99.9% uptime during migration (no breaking changes)
- **NFR3**: Memory usage must not exceed 1.0 baseline by more than 30%
- **NFR4**: All existing user data must be preserved with 100% integrity
- **NFR5**: Rollback to 1.0 must be possible within 30 seconds if issues detected
- **NFR6**: Performance metrics must be tracked for both 1.0 and 2.0 paths
- **NFR7**: Error messages must clearly indicate whether issue is in 1.0 or 2.0 code

### Compatibility Requirements

- **CR1**: Existing CLI API must remain functional with clear migration messages
- **CR2**: Obsidian vault structure and metadata format must remain unchanged
- **CR3**: Output file formats (Markdown, YAML) must maintain backward compatibility
- **CR4**: External tool integrations (VS Code extension plan) must work with both versions

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages**: Python 3.9+, TypeScript 4.5+  
**Frameworks**: LangChain 0.1.x, FastAPI, Click CLI  
**Database**: Local file system, Obsidian vaults  
**Infrastructure**: Local installation, npm/pip packages  
**External Dependencies**: OpenAI API, Anthropic API

### Integration Approach

**Database Integration Strategy**: Maintain file-based storage with versioned document schemas  
**API Integration Strategy**: Adapter pattern to support both agent calls and layer invocations  
**Frontend Integration Strategy**: CLI remains primary, VS Code extension uses same core  
**Testing Integration Strategy**: Parallel test suites for 1.0 and 2.0 paths

### Code Organization and Standards

**File Structure Approach**: 
```
flcm-core/
├── legacy/        # 1.0 agent code (preserved)
├── mentor/        # New 2.0 layer
├── creator/       # New 2.0 layer  
├── publisher/     # New 2.0 layer
├── migration/     # Conversion tools
└── shared/        # Common utilities
```

**Naming Conventions**: Maintain existing conventions, prefix new with `v2_`  
**Coding Standards**: Existing PEP 8 for Python, ESLint config for TypeScript  
**Documentation Standards**: Docstrings required, migration guide mandatory

### Deployment and Operations

**Build Process Integration**: Dual build targets for 1.0 and 2.0  
**Deployment Strategy**: Feature flags control version selection per user  
**Monitoring and Logging**: Separate log streams for version tracking  
**Configuration Management**: Single config with version-specific sections

### Risk Assessment and Mitigation

**Technical Risks**: 
- Agent to layer conversion may lose context → Implement comprehensive mapping
- Framework library may conflict with existing → Namespace isolation

**Integration Risks**: 
- Document format changes break Obsidian → Strict schema versioning
- Performance degradation during dual operation → Resource monitoring and limits

**Deployment Risks**: 
- Users confused by dual modes → Clear UI indicators and documentation
- Rollback complexity → Automated rollback scripts and state snapshots

**Mitigation Strategies**: 
- Comprehensive migration testing with real user data
- Phased rollout with volunteer beta users
- Automated compatibility verification for each commit

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: Single comprehensive epic for core migration with parallel operation capability. This approach minimizes risk by maintaining existing functionality while building new architecture alongside. The epic focuses on establishing dual-mode operation first, then gradually migrating features.

## Epic 1: FLCM 2.0 Architecture Migration with Backward Compatibility

**Epic Goal**: Establish 3-layer architecture alongside existing 4-agent system, implement core framework library, and enable controlled migration path while maintaining 100% backward compatibility for existing users.

**Integration Requirements**: All new components must coexist with legacy code, share data formats, and support gradual feature adoption through configuration flags.

### Story 1.1: Dual Architecture Foundation

As a developer,  
I want to establish parallel architecture paths,  
so that 1.0 and 2.0 can run simultaneously without conflicts.

#### Acceptance Criteria
1. Version router implemented to direct requests to appropriate architecture
2. Configuration system supports version selection per user
3. Shared utilities extracted and accessible to both architectures
4. Logging clearly identifies which version is processing requests
5. Health check endpoint reports status of both architectures

#### Integration Verification
- IV1: All existing 1.0 CLI commands execute successfully
- IV2: Performance monitoring shows <5% overhead from router
- IV3: Memory usage remains within 10% of baseline

### Story 1.2: Document Schema Migration System

As a system administrator,  
I want automated document conversion between formats,  
so that users can seamlessly work with both versions.

#### Acceptance Criteria
1. Bidirectional converter between agent outputs and layer documents
2. Schema versioning system implemented for document evolution
3. Validation ensures no data loss during conversion
4. Batch conversion tool for existing user vaults
5. Real-time conversion for active sessions

#### Integration Verification
- IV1: 1000+ existing documents convert without data loss
- IV2: Obsidian continues to read all document formats
- IV3: Conversion latency <100ms per document

### Story 1.3: Framework Library with Legacy Support

As a content creator,  
I want access to all existing and new frameworks,  
so that my workflow improves without losing familiar tools.

#### Acceptance Criteria
1. All 1.0 frameworks (RICE, Teaching Preparation, etc.) ported to library
2. 5 new core frameworks added (SWOT-USED, SCAMPER, etc.)
3. Framework selector supports both old and new invocation methods
4. Legacy command mappings maintained for backward compatibility
5. Framework documentation includes migration guides

#### Integration Verification
- IV1: Existing framework commands produce identical outputs
- IV2: New frameworks accessible through both CLI modes
- IV3: Framework performance meets <3s presentation requirement

### Story 1.4: Collaborative Dialogue with Command Fallback

As a user,  
I want to choose between new collaborative mode and familiar commands,  
so that I can adopt new features at my own pace.

#### Acceptance Criteria
1. Mode selector allows switching between interaction styles
2. Command mode maintains exact 1.0 behavior with deprecation notices
3. Collaborative mode provides framework-based guidance
4. Context preserved when switching between modes
5. User preference persisted across sessions

#### Integration Verification
- IV1: All 1.0 command sequences execute correctly
- IV2: Mode switching preserves conversation context
- IV3: Response time remains within 1.0 benchmarks

### Story 1.5: Feature Flag Management System

As a product manager,  
I want granular control over feature rollout,  
so that we can manage risk during migration.

#### Acceptance Criteria
1. Feature flag system controls individual 2.0 features
2. User cohort assignment for A/B testing
3. Remote flag updates without restart
4. Automatic rollback on error threshold
5. Usage metrics tracked per feature flag

#### Integration Verification
- IV1: Flags correctly route to appropriate code paths
- IV2: No performance impact when flags disabled
- IV3: Rollback completes within 30 seconds

### Story 1.6: Migration Analytics and Monitoring

As a system operator,  
I want comprehensive metrics on migration progress,  
so that we can ensure smooth transition.

#### Acceptance Criteria
1. Dashboard shows usage split between 1.0 and 2.0
2. Error rates tracked separately per version
3. Performance comparison metrics available
4. User satisfaction tracked for both versions
5. Automated alerts for migration issues

#### Integration Verification
- IV1: Metrics accurately reflect actual usage patterns
- IV2: No metric collection overhead >2%
- IV3: Alert system triggers within 1 minute of issues

## Epic 2: Obsidian Knowledge Management Integration

**Epic Goal**: Implement comprehensive Obsidian integration that transforms FLCM into a learning and knowledge management system, enabling persistent insights, pattern recognition, and growth tracking through deep vault integration.

**Integration Requirements**: Seamless bidirectional sync with Obsidian vaults, automatic linking and tagging, knowledge graph visualization, and learning progress metrics.

### Story 2.1: Obsidian Plugin Foundation

As a knowledge worker,  
I want FLCM to integrate deeply with my Obsidian vault,  
so that all my insights and content become part of my permanent knowledge base.

#### Acceptance Criteria
1. Obsidian plugin installable via community plugins or BRAT
2. Bidirectional sync between FLCM documents and vault
3. Conflict resolution for simultaneous edits
4. Custom frontmatter for FLCM metadata
5. Settings page for sync preferences and vault location
6. Real-time sync status indicator in Obsidian

#### Integration Verification
- IV1: Existing vaults remain intact during plugin installation
- IV2: Sync completes within 2 seconds for typical document
- IV3: No data loss during conflict resolution

### Story 2.2: Knowledge Graph Visualization

As a visual learner,  
I want to see connections between my insights and content,  
so that I can discover patterns and relationships in my thinking.

#### Acceptance Criteria
1. Graph view shows nodes for insights, content, and frameworks
2. Edge weights represent connection strength
3. Filtering by date, framework, or topic
4. Clickable nodes navigate to documents
5. Automatic clustering of related content
6. Export graph as image or interactive HTML

#### Integration Verification
- IV1: Graph renders within 3 seconds for 1000+ documents
- IV2: Navigation maintains Obsidian's native behavior
- IV3: Graph updates reflect vault changes in real-time

### Story 2.3: Learning Progress Tracker

As a lifelong learner,  
I want to track my growth and understanding over time,  
so that I can see how my thinking evolves.

#### Acceptance Criteria
1. Dashboard showing framework usage statistics
2. Insight depth progression over time
3. Content quality metrics trending
4. Learning velocity calculations
5. Weekly/monthly progress reports
6. Exportable learning analytics

#### Integration Verification
- IV1: Historical data preserved during tracking implementation
- IV2: Metrics calculation doesn't slow vault operations
- IV3: Reports generate within 5 seconds

### Story 2.4: Framework Templates and Automation

As a structured thinker,  
I want Obsidian templates for each framework,  
so that I can apply methodologies directly in my vault.

#### Acceptance Criteria
1. Template generated for each framework (SWOT, SCAMPER, etc.)
2. Templates include guided questions and structure
3. Auto-linking to related framework applications
4. Frontmatter tags for framework tracking
5. Quick switcher integration for framework selection
6. Bulk template application to existing notes

#### Integration Verification
- IV1: Templates compatible with Obsidian's template plugin
- IV2: Auto-linking doesn't break existing links
- IV3: Frontmatter follows Obsidian standards

### Story 2.5: Semantic Linking and Pattern Recognition

As a researcher,  
I want FLCM to automatically connect related content,  
so that I can discover non-obvious relationships.

#### Acceptance Criteria
1. Semantic analysis identifies related documents
2. Automatic backlink suggestions
3. Pattern detection across multiple documents
4. Topic clustering and tag suggestions
5. Similarity scores for document pairs
6. Manual override for auto-connections

#### Integration Verification
- IV1: Analysis completes in background without blocking
- IV2: Suggested links have >70% relevance accuracy
- IV3: Manual overrides persist across sessions

### Story 2.6: Daily Learning Summaries

As a reflective practitioner,  
I want automated summaries of my learning,  
so that I can review and consolidate my insights.

#### Acceptance Criteria
1. Daily note generation with learning summary
2. Key insights from the day highlighted
3. Progress metrics included
4. Links to all created content
5. Reflection prompts for deeper thinking
6. Weekly rollup summaries

#### Integration Verification
- IV1: Daily notes follow user's existing format
- IV2: Summary generation happens automatically at configured time
- IV3: No duplicate summaries created

## Next Steps

### Migration Timeline

**Phase 1 (Week 1)**: Foundation - Stories 1.1, 1.2, 1.3  
**Phase 2 (Week 2)**: Core Features - Stories 1.4, 1.5, 1.6  
**Phase 3 (Week 3)**: Obsidian Foundation - Stories 2.1, 2.2, 2.3  
**Phase 4 (Week 4)**: Obsidian Enhancement - Stories 2.4, 2.5, 2.6

### Success Criteria

- Zero downtime during migration
- 100% of existing users can continue using 1.0
- Obsidian integration fully functional with bidirectional sync
- Knowledge graph visualization operational for existing vaults
- Learning metrics tracking from day one of 2.0 usage
- 20% of users voluntarily adopt 2.0 features in first month
- User satisfaction improves to 60% in migration period
- Full migration complete within 3 months

### Obsidian-Specific Success Metrics

- 100% of FLCM documents accessible in Obsidian
- <2 second sync time for average document
- Knowledge graph renders 1000+ documents in <3 seconds
- Zero data loss during bidirectional sync
- 90% of auto-suggested links are relevant
- Daily summaries generate without user intervention

---

*Brownfield PRD Version: 1.2*  
*Last Updated: 2025-01-31*  
*Status: Ready for Migration Planning with Full Obsidian Integration*