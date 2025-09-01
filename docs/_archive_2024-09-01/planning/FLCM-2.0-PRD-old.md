# FLCM 2.0 Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Transform FLCM from an efficiency-focused tool to a growth-enabling partner that helps users deepen thinking and create meaningful content
- Implement a transparent 3-layer document-driven architecture replacing the fragmented 4-agent system
- Provide 15+ professional methodology frameworks to support structured thinking and exploration
- Achieve 100% automation of mechanical tasks while maintaining 100% user control of creative work
- Enable collaborative content creation that preserves user voice and builds ownership
- Implement growth-oriented evaluation that focuses on strengths and improvement rather than judgment
- Support seamless multi-platform content adaptation for Chinese social media ecosystem

### Background Context

Based on extensive user testing revealing only 8% actual satisfaction (vs 91% claimed), FLCM requires fundamental redesign. Current system suffers from agent context fragmentation, over-engineering for simple tasks, and misalignment with user needs. Users report feeling AI replaces rather than enhances their creativity. Real usage shows 7.3 interaction rounds average (vs 3-4 expected) and 55% success rate (vs 92% projected).

The solution shifts from speed metrics to growth metrics, implementing a 3-layer document-driven system (Mentor→Creator→Publisher) with professional frameworks like SWOT, SCAMPER, and Socratic questioning. This addresses the core insight: users don't want AI to replace their thinking but to enhance it. Every content creation session should be a learning experience where users develop deeper understanding and produce content they feel ownership of.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-01-31 | 1.0 | Initial PRD creation based on Project Brief | John (PM) |
| 2025-01-31 | 1.1 | Added detailed technical architecture and epic breakdown | John (PM) |

## Requirements

### Functional

- **FR1**: The system shall implement a 3-layer architecture (Mentor, Creator, Publisher) with transparent document flow between layers
- **FR2**: The Mentor layer shall provide at least 5 core professional frameworks (SWOT-USED, SCAMPER, Socratic Questioning, 5W2H, Pyramid Principle) for MVP
- **FR3**: The system shall present complete frameworks to users allowing selective response to questions of interest
- **FR4**: The AI shall supplement user inputs to create complete analyses while preserving user's original ideas as primary
- **FR5**: The Creator layer shall enable collaborative content creation with user maintaining control over structure, style, and content
- **FR6**: The system shall generate image prompts (not images) for users to use in external tools
- **FR7**: The Publisher layer shall automatically adapt content to 4 platforms (XiaoHongShu, Zhihu, WeChat, LinkedIn) with zero user interaction
- **FR8**: The evaluation system shall provide growth-oriented feedback focusing on strengths and potential rather than deficiencies
- **FR9**: Document flow shall be visible and editable: insights.md → content.md → platform files
- **FR10**: The system shall implement intelligent routing to select appropriate workflow based on task complexity (simple/medium/complex)
- **FR11**: Each layer shall produce specific documents (Mentor: insights.md, knowledge.md; Creator: content.md, prompts.md; Publisher: platform files)
- **FR12**: The framework library shall be expandable to support 15+ methodologies post-MVP

### Non Functional

- **NFR1**: Framework presentation response time shall be under 3 seconds
- **NFR2**: Content generation shall complete within 10 seconds per section
- **NFR3**: Platform adaptation shall require exactly 0 user interactions (100% automation)
- **NFR4**: The system shall maintain user voice consistency with >90% accuracy based on user feedback
- **NFR5**: Document format shall be standard Markdown for all intermediate files enabling user editing
- **NFR6**: The system shall support both Chinese and English content creation
- **NFR7**: Framework interactions shall complete within 2-3 conversation rounds for optimal user experience
- **NFR8**: Growth evaluation scores shall use positive framing (strengths and opportunities) exclusively
- **NFR9**: All mechanical tasks (formatting, adaptation, optimization) shall be 100% automated
- **NFR10**: System shall work with existing LLM APIs (OpenAI, Anthropic) without custom model training

## User Interface Design Goals

### Overall UX Vision

The interface emphasizes collaborative exploration over command execution. Users engage with professional frameworks through natural conversation, with AI acting as a knowledgeable mentor rather than a task executor. The experience should feel like working with a thoughtful colleague who provides structure and depth while respecting user autonomy.

### Key Interaction Paradigms

- **Framework-based dialogue**: Complete frameworks presented upfront, users choose focus areas
- **Progressive disclosure**: Start with overview, dive deeper based on user interest
- **Document transparency**: Every stage produces visible, editable documents
- **Growth feedback**: Emphasis on strengths and potential, never criticism
- **Selective engagement**: Users can answer 1-2 questions or explore comprehensively

### Core Screens and Views

- **Framework Presentation View**: Display complete methodology with all questions and guidance
- **Collaborative Creation View**: Side-by-side user input and AI suggestions
- **Document Pipeline View**: Visual flow of insights.md → content.md → platforms
- **Evaluation Dashboard**: Growth metrics visualization with strengths highlighted
- **Platform Preview**: Show adapted content for each platform before publishing

### Accessibility: WCAG AA

Ensure all text interfaces are screen-reader compatible, provide clear navigation structure, support keyboard-only interaction.

### Branding

Maintain professional yet approachable tone. Visual metaphors should emphasize growth (plants, paths, levels) rather than speed (rockets, lightning). Use calm, focused color schemes avoiding aggressive or urgent design patterns.

### Target Device and Platforms: Web Responsive

Initial deployment as CLI tool and VS Code extension. Future GUI should be web-responsive supporting desktop and tablet usage. Mobile optimization is secondary priority.

## Technical Assumptions

### Repository Structure: Monorepo

Single repository containing all three layers with clear separation:
```
flcm-core/
├── mentor/     # Framework library and dialogue engine
├── creator/    # Content building and evaluation
├── publisher/  # Platform adapters and automation
└── shared/     # Document schemas and utilities
```

### Service Architecture

**Three-layer microservices architecture within monorepo:**
- Each layer operates as independent service
- Document-based communication between layers
- Message queue for asynchronous processing
- Shared document store for intermediate files

### Testing Requirements

**Full Testing Pyramid approach:**
- Unit tests for all framework implementations
- Integration tests for document flow between layers
- E2E tests for complete user journeys
- Manual testing scenarios for framework effectiveness

### Additional Technical Assumptions and Requests

- **Language**: Python for AI orchestration, TypeScript for CLI/extension
- **Frameworks**: LangChain for LLM orchestration, FastAPI for services
- **Database**: PostgreSQL for user data, Redis for session management
- **Document Storage**: Local filesystem for development, S3-compatible for production
- **LLM Integration**: Abstract interface supporting OpenAI and Anthropic APIs
- **Deployment**: Containerized with Docker, orchestrated with Kubernetes
- **Monitoring**: OpenTelemetry for observability, Prometheus for metrics
- **Security**: JWT for authentication, encryption for sensitive documents

## Epic List

Based on the 3-week implementation timeline, the project is organized into three major epics:

- **Epic 1: Core Architecture & Mentor Layer**: Establish 3-layer architecture, implement framework library with 5 core methodologies, create collaborative dialogue engine
- **Epic 2: Creator & Evaluation System**: Build collaborative content creation, implement growth evaluation, add prompt generation
- **Epic 3: Publisher & Polish**: Implement platform automation, optimize user experience, prepare for deployment

## Epic 1: Core Architecture & Mentor Layer

**Goal**: Establish the foundational 3-layer architecture with document flow, implement the Mentor layer with 5 core professional frameworks, and create the collaborative dialogue engine that enables framework-based exploration.

### Story 1.1: Project Foundation & Architecture Setup

**As a** developer,  
**I want** to establish the 3-layer architecture with basic document flow,  
**so that** we have a solid foundation for implementing all features.

#### Acceptance Criteria
1. Monorepo structure created with mentor/, creator/, publisher/ directories
2. Basic document flow pipeline implemented (can pass documents between layers)
3. Document schemas defined for insights.md, knowledge.md, content.md
4. Health check endpoint confirms all layers are operational
5. CI/CD pipeline configured for automated testing and deployment
6. Development environment setup documented in README

### Story 1.2: Framework Library Core Implementation

**As a** content creator,  
**I want** access to professional thinking frameworks,  
**so that** I can structure my exploration systematically.

#### Acceptance Criteria
1. FrameworkLibrary class implemented with plugin architecture
2. SWOT-USED framework fully implemented with question sets
3. SCAMPER framework fully implemented with all 7 dimensions
4. Socratic Questioning framework implemented with 6 levels
5. 5W2H framework implemented with complete analysis structure
6. Pyramid Principle framework implemented for structured thinking
7. Framework selection logic returns appropriate framework based on context

### Story 1.3: Collaborative Dialogue Engine

**As a** user,  
**I want** to see complete frameworks and choose what to explore,  
**so that** I maintain control while getting guidance.

#### Acceptance Criteria
1. Complete framework presented to user with all questions visible
2. User can select specific questions to answer or provide free-form input
3. System extracts key points from partial user responses
4. AI supplements user input to create complete analysis
5. Original user ideas remain primary in final output
6. Dialogue completes within 2-3 interaction rounds

### Story 1.4: Insight Document Generation

**As a** user,  
**I want** my exploration to produce readable insight documents,  
**so that** I can review and refine my thinking.

#### Acceptance Criteria
1. insights.md generated with structured format (core insights, evidence, connections)
2. knowledge.md created showing concept relationships and knowledge graph
3. questions.md produced with deeper exploration prompts
4. Documents use standard Markdown for easy editing
5. User contributions clearly distinguished from AI supplements
6. Documents accessible via file system for external editing

## Epic 2: Creator & Evaluation System

**Goal**: Implement collaborative content creation that preserves user voice, build the growth-oriented evaluation system, and add image prompt generation capabilities.

### Story 2.1: Collaborative Content Structure Design

**As a** content creator,  
**I want** to choose or customize content structure,  
**so that** my content follows my preferred organization.

#### Acceptance Criteria
1. System suggests 3+ structure options based on insights
2. User can select predefined structure or create custom
3. Structure templates include: Problem-Solution, Story Arc, Pyramid, PREP
4. Selected structure guides content generation process
5. Structure decision documented in metadata.yaml

### Story 2.2: Voice-Preserving Content Builder

**As a** user,  
**I want** the AI to help write while maintaining my voice,  
**so that** the content feels authentically mine.

#### Acceptance Criteria
1. User leads paragraph/section creation with AI assistance
2. AI suggestions clearly marked as options, not replacements
3. User voice characteristics extracted and preserved
4. Style consistency maintained across entire document
5. User can accept, modify, or reject any AI suggestion
6. Final content.md shows >90% user voice retention

### Story 2.3: Growth-Oriented Evaluation System

**As a** user,  
**I want** constructive feedback on my content,  
**so that** I can improve without feeling judged.

#### Acceptance Criteria
1. Evaluation covers 4 dimensions: uniqueness, depth, usefulness, expression
2. Each dimension scored 1-10 with positive framing
3. Strengths identified with specific examples
4. Growth opportunities presented as "could be even better if..."
5. Actionable suggestions provided for each growth area
6. evaluation.md generated with complete assessment

### Story 2.4: Image Prompt Generator

**As a** content creator,  
**I want** AI-generated prompts for images,  
**so that** I can create visuals in my preferred tools.

#### Acceptance Criteria
1. Prompts generated for cover image and section images
2. Each prompt includes detailed description, style, and mood
3. Prompts compatible with major AI image generators
4. prompts.md created with all image generation instructions
5. Style preferences customizable by user
6. Cultural considerations for Chinese social media platforms

## Epic 3: Publisher & Polish

**Goal**: Implement fully automated platform adaptation, optimize the complete user experience, and prepare the system for production deployment.

### Story 3.1: Multi-Platform Auto-Adaptation

**As a** user,  
**I want** my content automatically adapted to all platforms,  
**so that** I can focus on creation not formatting.

#### Acceptance Criteria
1. XiaoHongShu adapter handles emoji style and image-heavy format
2. Zhihu adapter manages long-form with proper citations
3. WeChat adapter ensures compliance with platform rules
4. LinkedIn adapter creates professional tone version
5. All adaptations require exactly 0 user interactions
6. Platform files generated as xiaohongshu.md, zhihu.md, etc.

### Story 3.2: Intelligent Routing System

**As a** user,  
**I want** the system to automatically choose the right workflow,  
**so that** simple tasks stay simple.

#### Acceptance Criteria
1. Task complexity analyzed based on user input
2. Simple tasks route directly to Creator (skip Mentor)
3. Medium tasks use streamlined 2-layer flow
4. Complex tasks engage full 3-layer pipeline
5. Routing decision transparent to user with override option
6. Routing logic reduces average interaction rounds by 50%

### Story 3.3: End-to-End Integration Testing

**As a** developer,  
**I want** comprehensive testing of the complete system,  
**so that** we ensure quality before deployment.

#### Acceptance Criteria
1. 10+ complete user journeys tested end-to-end
2. Document flow verified for data integrity
3. Framework effectiveness validated with test users
4. Platform adaptations checked for accuracy
5. Performance benchmarks met (<3s framework, <10s generation)
6. Error handling graceful for all failure modes

### Story 3.4: Documentation & Deployment Preparation

**As a** user,  
**I want** clear documentation and easy installation,  
**so that** I can start using FLCM 2.0 immediately.

#### Acceptance Criteria
1. User guide covers all frameworks with examples
2. Installation script works on macOS/Linux/Windows
3. VS Code extension packaged and tested
4. Framework methodology documentation complete
5. Migration guide from FLCM 1.0 provided
6. Video tutorials created for key workflows

## Checklist Results Report

[To be completed after PM checklist execution]

## Next Steps

### UX Expert Prompt

Please review the FLCM 2.0 PRD focusing on the framework presentation and collaborative creation interfaces. Design an experience that emphasizes exploration and growth over efficiency, with clear visual hierarchy for framework questions and transparent document flow visualization.

### Architect Prompt

Please create the technical architecture for FLCM 2.0 based on this PRD. Focus on the 3-layer microservices design with document-based communication, framework plugin system, and platform adapter architecture. Ensure the system supports the required <3s framework response and 100% automation goals.

---

*PRD Version: 1.1*  
*Last Updated: 2025-01-31*  
*Status: Ready for Architecture Design*