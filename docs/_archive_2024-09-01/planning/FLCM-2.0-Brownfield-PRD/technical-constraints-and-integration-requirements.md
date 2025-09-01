# Technical Constraints and Integration Requirements

## Existing Technology Stack

**Languages**: Python 3.9+, TypeScript 4.5+  
**Frameworks**: LangChain 0.1.x, FastAPI, Click CLI  
**Database**: Local file system, Obsidian vaults  
**Infrastructure**: Local installation, npm/pip packages  
**External Dependencies**: OpenAI API, Anthropic API

## Integration Approach

**Database Integration Strategy**: Maintain file-based storage with versioned document schemas  
**API Integration Strategy**: Adapter pattern to support both agent calls and layer invocations  
**Frontend Integration Strategy**: CLI remains primary, VS Code extension uses same core  
**Testing Integration Strategy**: Parallel test suites for 1.0 and 2.0 paths

## Code Organization and Standards

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

## Deployment and Operations

**Build Process Integration**: Dual build targets for 1.0 and 2.0  
**Deployment Strategy**: Feature flags control version selection per user  
**Monitoring and Logging**: Separate log streams for version tracking  
**Configuration Management**: Single config with version-specific sections

## Risk Assessment and Mitigation

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
