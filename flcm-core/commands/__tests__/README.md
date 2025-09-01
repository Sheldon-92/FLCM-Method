# FLCM Command Integration Tests

This directory contains comprehensive integration tests for the FLCM command system, validating the complete command-to-agent call chain.

## Test Coverage

### 1. Command System Tests
- Help and status commands
- Command history and suggestions
- Error handling and validation

### 2. Agent Command Tests
- **Scholar Commands**: Text analysis, file processing, framework selection
- **Creator Commands**: Content generation, voice preservation, mode selection
- **Publisher Commands**: Multi-platform optimization, formatting, scheduling

### 3. Workflow Integration Tests
- **Quick Workflow**: Fast content generation (20-30 min)
- **Standard Workflow**: Comprehensive content creation (45-60 min)
- **Flow Workflow**: Complete 4-stage pipeline

### 4. End-to-End Tests
- Complete content creation pipeline
- Multi-stage workflow validation
- Output file verification
- Performance and quality metrics

## Running Tests

```bash
# Run all integration tests
npm test

# Run specific test file
npm test integration.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Test Structure

```
__tests__/
├── integration.test.ts    # Main integration test suite
├── README.md             # This file
└── fixtures/             # Test data and mock files
    ├── sample-content.txt
    ├── test-analysis.md
    └── mock-draft.json
```

## Test Scenarios

### Basic Command Execution
- Command parsing and validation
- Parameter handling and defaults
- Help text generation
- Status reporting

### Agent Integration
- Scholar Agent: Content analysis and synthesis
- Creator Agent: Content generation and voice matching
- Publisher Agent: Platform optimization and formatting
- Workflow Handler: End-to-end orchestration

### Error Handling
- Invalid commands and parameters
- Missing files and resources
- Agent execution failures
- Recovery and suggestions

### Performance Tests
- Execution time validation
- Memory usage monitoring
- Concurrent command execution
- Large file processing

## Mock Data

The tests use realistic mock data including:
- Sample content files (various formats)
- Predefined analysis results
- Mock API responses
- Test configuration files

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:
- No external dependencies required
- Deterministic test results
- Comprehensive error reporting
- Performance benchmarking

## Contributing

When adding new commands or features:

1. Add corresponding integration tests
2. Update test coverage requirements
3. Include error case testing
4. Add performance validation
5. Update this README

## Test Quality Standards

- **Coverage**: >90% line coverage required
- **Performance**: Commands must complete within expected time limits
- **Reliability**: Tests must pass consistently across environments
- **Documentation**: All test cases must be clearly documented