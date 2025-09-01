# Contributing to FLCM 2.0

Welcome to the FLCM 2.0 development community! We're excited to have you contribute to the future of AI-powered learning content management.

## 🌟 Ways to Contribute

- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Propose new functionality
- 📝 **Documentation**: Improve guides and examples
- 🔧 **Code Contributions**: Submit bug fixes and features
- 🧪 **Testing**: Help test new features and releases
- 🎨 **Design**: Improve UX/UI and visual elements
- 🌍 **Translation**: Help make FLCM accessible worldwide

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **Git** for version control
- **TypeScript** knowledge (preferred)
- **Familiarity** with AI/ML concepts (helpful)

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/FLCM-Method.git
   cd FLCM-Method
   git remote add upstream https://github.com/Sheldon-92/FLCM-Method.git
   ```

2. **Set Up Development Environment**
   ```bash
   cd .flcm-core
   npm install
   npm run dev
   ```

3. **Verify Setup**
   ```bash
   # Run tests
   npm test
   
   # Check code quality
   npm run quality:check
   
   # Build project
   npm run build
   ```

## 🏗️ Architecture Overview

FLCM 2.0 follows a modular, agent-based architecture:

```
.flcm-core/
├── agents/           # AI agents (Scholar, Creator, Publisher)
├── methodologies/    # Learning methodologies
├── pipeline/         # Content processing pipeline
├── shared/          # Utilities and common code
├── templates/       # Content templates
└── workflows/       # Orchestration logic
```

### Key Components

#### 🤖 Agents (`/agents`)
- **Scholar Agent**: Content analysis and knowledge extraction
- **Creator Agent**: Content generation with voice DNA
- **Publisher Agent**: Multi-platform content adaptation

#### 📋 Methodologies (`/methodologies`)
- **Progressive Depth Learning**: Adaptive complexity management
- **Voice DNA Extraction**: Writing style analysis
- **Platform Optimization**: Content adaptation strategies

#### 🔄 Pipeline (`/pipeline`)
- **Document Transformer**: Content processing and transformation
- **Quality Assurance**: Validation and improvement
- **Output Generation**: Final content creation

## 📝 Development Workflow

### 1. Choose an Issue

- Browse [open issues](https://github.com/Sheldon-92/FLCM-Method/issues)
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to claim it

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-number
```

### 3. Make Changes

- Follow our [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 4. Commit Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat(agents): add new methodology for visual learning"

# Bug fix
git commit -m "fix(pipeline): resolve memory leak in document processing"

# Documentation
git commit -m "docs(api): add examples for agent configuration"

# Test
git commit -m "test(scholar): add unit tests for content extraction"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear description of changes
- Link to related issues
- Screenshots (if UI changes)
- Test results

## 🧪 Testing Guidelines

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# Performance tests
npm run test:performance

# All tests
npm run test:all

# With coverage
npm run test:coverage
```

### Writing Tests

#### Unit Tests
```typescript
// agents/__tests__/scholar.test.ts
import { ScholarAgent } from '../scholar/scholar-agent';

describe('ScholarAgent', () => {
  let agent: ScholarAgent;
  
  beforeEach(() => {
    agent = new ScholarAgent();
  });
  
  it('should extract key concepts from text', async () => {
    const text = "Artificial intelligence is transforming education...";
    const result = await agent.extractConcepts(text);
    
    expect(result.concepts).toContain('artificial intelligence');
    expect(result.concepts).toContain('education');
  });
});
```

#### Integration Tests
```typescript
// tests/integration/pipeline.test.ts
import { Pipeline } from '../../pipeline/pipeline';

describe('Pipeline Integration', () => {
  it('should process content end-to-end', async () => {
    const pipeline = new Pipeline();
    const result = await pipeline.process({
      url: 'https://example.com/article',
      methodology: 'progressive-depth'
    });
    
    expect(result.summary).toBeDefined();
    expect(result.knowledgePoints).toHaveLength.greaterThan(0);
  });
});
```

### Performance Testing

```typescript
// tests/performance/load.test.ts
describe('Load Testing', () => {
  it('should handle concurrent requests', async () => {
    const requests = Array(10).fill(null).map(() => 
      pipeline.process({ url: 'test-url' })
    );
    
    const results = await Promise.all(requests);
    expect(results).toHaveLength(10);
  });
});
```

## 🎯 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good
interface AgentConfig {
  name: string;
  version: string;
  capabilities: string[];
}

class BaseAgent {
  private config: AgentConfig;
  
  constructor(config: AgentConfig) {
    this.config = config;
  }
  
  public async process(input: string): Promise<ProcessResult> {
    // Implementation
  }
}

// ❌ Avoid
var agent = {
  process: function(input) {
    // No types, unclear structure
  }
};
```

### Code Organization

```
agents/scholar/
├── index.ts          # Public exports
├── scholar-agent.ts  # Main implementation
├── types.ts          # Type definitions
├── config.ts         # Configuration
├── utils/            # Helper functions
│   ├── text-analyzer.ts
│   └── concept-extractor.ts
└── __tests__/        # Tests
    ├── scholar-agent.test.ts
    └── utils.test.ts
```

### Naming Conventions

- **Classes**: PascalCase (`ScholarAgent`)
- **Functions/Variables**: camelCase (`extractConcepts`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- **Files**: kebab-case (`scholar-agent.ts`)
- **Interfaces**: PascalCase with 'I' prefix optional (`AgentConfig`)

### Documentation Standards

```typescript
/**
 * Extracts key concepts from text content
 * 
 * @param text - The input text to analyze
 * @param options - Configuration options for extraction
 * @returns Promise resolving to extracted concepts and metadata
 * 
 * @example
 * ```typescript
 * const result = await agent.extractConcepts(
 *   "AI is revolutionizing education",
 *   { minConfidence: 0.8 }
 * );
 * console.log(result.concepts); // ['AI', 'education']
 * ```
 */
async extractConcepts(
  text: string, 
  options: ExtractionOptions = {}
): Promise<ConceptExtractionResult> {
  // Implementation
}
```

## 🔧 Development Tools

### Pre-commit Hooks

We use Husky for automated quality checks:

```bash
# Automatically set up when you run npm install
npm install

# Manual setup if needed
npm run prepare
```

Hooks run:
- ESLint for code quality
- Prettier for formatting
- Type checking
- Unit tests

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check

# Run all quality checks
npm run quality:check
```

### Debugging

```bash
# Development mode with debugging
npm run dev

# Debug specific agent
DEBUG=flcm:scholar npm run dev

# Debug with Node.js inspector
node --inspect-brk dist/index.js
```

## 🎨 Design Guidelines

### User Experience Principles

1. **Simplicity First**: Make complex AI accessible
2. **Progressive Disclosure**: Show advanced features when needed
3. **Consistent Patterns**: Maintain familiar interactions
4. **Clear Feedback**: Always show what's happening
5. **Error Recovery**: Provide helpful error messages and solutions

### CLI Design

```bash
# ✅ Good: Clear, descriptive commands
flcm learn <url> --methodology progressive-depth
flcm create blog --input output/latest/

# ❌ Avoid: Cryptic abbreviations
flcm l <url> -m pd
flcm c b -i o/l/
```

## 📋 Issue Guidelines

### Reporting Bugs

Use our bug report template:

```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Run `flcm learn https://example.com`
2. Check output directory
3. See error

## Expected Behavior
What should have happened

## Actual Behavior
What actually happened

## Environment
- OS: macOS 13.0
- Node.js: 18.17.0
- FLCM: 2.0.1

## Additional Context
Screenshots, logs, etc.
```

### Feature Requests

Use our feature request template:

```markdown
## Feature Description
What feature would you like to see?

## Use Case
Why is this feature important?

## Proposed Solution
How might this be implemented?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Mockups, examples, etc.
```

## 📦 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Release Workflow

1. **Feature Complete**: All planned features implemented
2. **Testing**: Comprehensive testing phase
3. **Documentation**: Update docs and examples
4. **Release Notes**: Document changes and improvements
5. **Tag Release**: Create Git tag with version
6. **Publish**: Automated publishing via GitHub Actions

## 🌍 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different perspectives and experiences
- Report inappropriate behavior to maintainers

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord** (coming soon): Real-time chat and support
- **Twitter**: [@FLCMMethod](https://twitter.com/FLCMMethod) for updates

## 🏆 Recognition

We believe in recognizing our contributors:

- **All Contributors**: Listed in README.md
- **Major Contributors**: Special recognition in releases
- **Core Team**: Invitation to join core team
- **Swag**: FLCM merchandise for significant contributions

## 📚 Additional Resources

### Learning Resources

- **TypeScript**: [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- **Node.js**: [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- **AI/ML**: [Hugging Face Transformers](https://huggingface.co/docs/transformers/index)
- **Testing**: [Jest Documentation](https://jestjs.io/docs/getting-started)

### Development Tools

- **VS Code Extensions**:
  - TypeScript Hero
  - ESLint
  - Prettier
  - Jest Runner
  - GitLens

- **Recommended Setup**:
  ```json
  // .vscode/settings.json
  {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true,
      "source.fixAll.eslint": true
    },
    "typescript.preferences.importModuleSpecifier": "relative"
  }
  ```

## 🤝 Getting Help

### For Contributors

- **Development Questions**: [GitHub Discussions](https://github.com/Sheldon-92/FLCM-Method/discussions)
- **Code Review**: Tag maintainers in PR comments
- **Design Feedback**: Open RFC (Request for Comments) issue

### For Maintainers

- **Review Guidelines**: See `REVIEWING.md`
- **Release Process**: See `RELEASING.md`  
- **Triage Process**: See `TRIAGE.md`

---

## Thank You! 🎉

Thank you for contributing to FLCM 2.0! Your efforts help make AI-powered learning accessible to everyone.

**Questions?** Reach out in our [discussions](https://github.com/Sheldon-92/FLCM-Method/discussions) or create an [issue](https://github.com/Sheldon-92/FLCM-Method/issues).

**Happy coding!** 🚀