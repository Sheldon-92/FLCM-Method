/**
 * FLCM Command System Integration Tests
 * Validates the complete command-to-agent call chain
 */

import { executeFLCMCommand } from '../index';
import { CommandResult } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('FLCM Command Integration Tests', () => {
  let testOutputDir: string;
  let testContent: string;
  let testFilePath: string;

  beforeAll(async () => {
    // Create temporary test directory
    testOutputDir = path.join(os.tmpdir(), `flcm-test-${Date.now()}`);
    fs.mkdirSync(testOutputDir, { recursive: true });
    
    // Create test content file
    testContent = `
# AI in Healthcare: Transforming Patient Care

Artificial Intelligence is revolutionizing healthcare by improving diagnostic accuracy, 
personalizing treatment plans, and streamlining administrative processes. This technology 
enables faster analysis of medical data, predictive modeling for patient outcomes, and 
automated detection of anomalies in medical imaging.

Key benefits include:
- Enhanced diagnostic precision through machine learning algorithms
- Personalized medicine based on genetic and lifestyle factors  
- Reduced administrative burden on healthcare professionals
- Early disease detection and prevention strategies
- Improved patient engagement through AI-powered applications

The integration of AI in healthcare represents a paradigm shift toward more efficient, 
accurate, and accessible medical care for patients worldwide.
    `.trim();
    
    testFilePath = path.join(testOutputDir, 'test-content.txt');
    fs.writeFileSync(testFilePath, testContent, 'utf-8');
  });

  afterAll(() => {
    // Cleanup test files
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('Help and Status Commands', () => {
    test('should execute help command successfully', async () => {
      const result = await executeFLCMCommand('flcm:help');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('FLCM 2.0 Command System');
      expect(result.data?.commands).toBeInstanceOf(Array);
      expect(result.data.commands.length).toBeGreaterThan(0);
    });

    test('should execute status command successfully', async () => {
      const result = await executeFLCMCommand('flcm:status');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('FLCM System Status');
      expect(result.data?.agents).toBeInstanceOf(Array);
      expect(result.data.health).toBe('operational');
    });

    test('should show command history', async () => {
      const result = await executeFLCMCommand('flcm:history');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Recent Command History');
      expect(result.data?.history).toBeInstanceOf(Array);
    });
  });

  describe('Scholar Command Integration', () => {
    test('should execute scholar command with text input', async () => {
      const result = await executeFLCMCommand('flcm:scholar', [], {
        text: testContent,
        output: testOutputDir
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Scholar analysis complete');
      expect(result.data?.synthesis).toBeDefined();
      expect(result.data.synthesis.concept).toBeDefined();
      expect(result.data.synthesis.confidence).toBeGreaterThan(0);
      expect(result.data.outputPath).toBeDefined();
      
      // Verify output file was created
      expect(fs.existsSync(result.data.outputPath)).toBe(true);
    });

    test('should execute scholar command with file input', async () => {
      const result = await executeFLCMCommand('flcm:scholar', [], {
        input: testFilePath,
        output: testOutputDir
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.synthesis).toBeDefined();
      expect(result.data.outputPath).toBeDefined();
      expect(fs.existsSync(result.data.outputPath)).toBe(true);
    });

    test('should show scholar help', async () => {
      const result = await executeFLCMCommand('flcm:scholar', [], { help: true });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Scholar Agent');
      expect(result.data?.usage).toBeDefined();
      expect(result.data.options).toBeInstanceOf(Array);
    });

    test('should handle missing input error', async () => {
      const result = await executeFLCMCommand('flcm:scholar', [], {});
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('MISSING_INPUT');
      expect(result.data?.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('Creator Command Integration', () => {
    test('should execute creator command with topic', async () => {
      const result = await executeFLCMCommand('flcm:create', [], {
        topic: 'AI in Healthcare',
        mode: 'quick',
        output: testOutputDir
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Content created successfully');
      expect(result.data?.draft).toBeDefined();
      expect(result.data.draft.title).toBeDefined();
      expect(result.data.draft.wordCount).toBeGreaterThan(0);
      expect(result.data.outputPath).toBeDefined();
      expect(fs.existsSync(result.data.outputPath)).toBe(true);
    });

    test('should execute creator command with file input', async () => {
      const result = await executeFLCMCommand('flcm:create', [], {
        input: testFilePath,
        mode: 'quick',
        output: testOutputDir
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.draft).toBeDefined();
      expect(result.data.draft.voiceConsistency).toBeGreaterThan(0);
    });

    test('should show creator help', async () => {
      const result = await executeFLCMCommand('flcm:create', [], { help: true });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Creator Agent');
      expect(result.data?.modes).toBeInstanceOf(Array);
    });
  });

  describe('Publisher Command Integration', () => {
    let draftFile: string;

    beforeAll(() => {
      // Create a simple draft file for testing
      const draftContent = `
# AI Healthcare Revolution

## 📊 Content Metrics
- **Word Count**: 250
- **Voice Consistency**: 85%

## 🎣 Hook
Discover how AI is transforming healthcare and saving millions of lives worldwide.

## 📝 Content
Artificial Intelligence is revolutionizing healthcare by improving diagnostic accuracy and personalizing treatment plans.
      `.trim();
      
      draftFile = path.join(testOutputDir, 'test-draft.md');
      fs.writeFileSync(draftFile, draftContent, 'utf-8');
    });

    test('should execute publisher command with single platform', async () => {
      const result = await executeFLCMCommand('flcm:publish', [], {
        content: draftFile,
        platform: 'linkedin',
        output: testOutputDir
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Content optimized for 1 platform');
      expect(result.data?.platforms).toBeInstanceOf(Array);
      expect(result.data.platforms.length).toBe(1);
      expect(result.data.platforms[0].platform).toBe('linkedin');
      expect(result.data.outputPaths).toBeInstanceOf(Array);
      expect(result.data.outputPaths.length).toBeGreaterThan(0);
    });

    test('should execute publisher command with multiple platforms', async () => {
      const result = await executeFLCMCommand('flcm:publish', [], {
        content: draftFile,
        platform: 'linkedin,wechat',
        output: testOutputDir
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.platforms.length).toBe(2);
      expect(result.data.avgFitScore).toBeGreaterThan(0);
      expect(result.data.avgPreservation).toBeGreaterThan(0);
    });

    test('should show publisher help', async () => {
      const result = await executeFLCMCommand('flcm:publish', [], { help: true });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Publisher Agent');
      expect(result.data?.platforms).toBeInstanceOf(Array);
    });
  });

  describe('Workflow Command Integration', () => {
    test('should execute quick workflow with topic', async () => {
      const result = await executeFLCMCommand('flcm:quick', [], {
        topic: 'Machine Learning Basics',
        output: testOutputDir
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('quick workflow completed successfully');
      expect(result.data?.workflowId).toBeDefined();
      expect(result.data.duration).toBeGreaterThan(0);
      expect(result.data.stages).toBeDefined();
      expect(result.data.outputPaths).toBeInstanceOf(Array);
      expect(result.data.outputPaths.length).toBeGreaterThan(0);
    });

    test('should execute standard workflow with file input', async () => {
      const result = await executeFLCMCommand('flcm:standard', [], {
        input: testFilePath,
        platform: 'linkedin',
        output: testOutputDir
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('standard workflow completed successfully');
      expect(result.data?.stages.brief).toBeDefined();
      expect(result.data.stages.synthesis).toBeDefined();
      expect(result.data.stages.draft).toBeDefined();
      expect(result.data.stages.platforms).toBeInstanceOf(Array);
    });

    test('should execute full flow workflow', async () => {
      const result = await executeFLCMCommand('flcm:flow', [], {
        topic: 'Sustainable Technology',
        platform: 'linkedin,wechat',
        output: testOutputDir,
        outputAll: true
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('flow workflow completed successfully');
      expect(result.data?.stages.platforms.length).toBe(2);
      expect(result.data.outputPaths.length).toBeGreaterThan(4); // Brief, synthesis, draft, 2 platforms, summary
    });

    test('should show workflow help', async () => {
      const result = await executeFLCMCommand('flcm:flow', [], { help: true });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Workflow System');
      expect(result.data?.modes).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown command', async () => {
      const result = await executeFLCMCommand('flcm:unknown');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('COMMAND_NOT_FOUND');
      expect(result.data?.suggestions).toBeInstanceOf(Array);
    });

    test('should handle file not found error', async () => {
      const result = await executeFLCMCommand('flcm:scholar', [], {
        input: '/nonexistent/file.txt'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('FILE_NOT_FOUND');
    });

    test('should handle invalid platform error', async () => {
      const result = await executeFLCMCommand('flcm:publish', [], {
        content: testFilePath,
        platform: 'invalidplatform'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_PLATFORMS');
    });
  });

  describe('End-to-End Workflow Test', () => {
    test('should complete full content creation pipeline', async () => {
      const workflowDir = path.join(testOutputDir, 'e2e-test');
      
      // Step 1: Scholar analysis
      const scholarResult = await executeFLCMCommand('flcm:scholar', [], {
        text: testContent,
        output: workflowDir
      });
      
      expect(scholarResult.success).toBe(true);
      const analysisPath = scholarResult.data.outputPath;
      expect(fs.existsSync(analysisPath)).toBe(true);
      
      // Step 2: Content creation using Scholar output
      const creatorResult = await executeFLCMCommand('flcm:create', [], {
        input: analysisPath.replace('.md', '.json'), // Use JSON version
        mode: 'quick',
        output: workflowDir
      });
      
      expect(creatorResult.success).toBe(true);
      const draftPath = creatorResult.data.outputPath;
      expect(fs.existsSync(draftPath)).toBe(true);
      
      // Step 3: Multi-platform publishing
      const publishResult = await executeFLCMCommand('flcm:publish', [], {
        content: draftPath,
        platform: 'linkedin,wechat',
        output: workflowDir
      });
      
      expect(publishResult.success).toBe(true);
      expect(publishResult.data.platforms.length).toBe(2);
      
      // Verify all output files exist
      publishResult.data.outputPaths.forEach((filePath: string) => {
        expect(fs.existsSync(filePath)).toBe(true);
      });
      
      // Compare with integrated workflow
      const integratedResult = await executeFLCMCommand('flcm:flow', [], {
        text: testContent,
        platform: 'linkedin,wechat',
        output: path.join(workflowDir, 'integrated'),
        outputAll: true
      });
      
      expect(integratedResult.success).toBe(true);
      expect(integratedResult.data.stages.platforms.length).toBe(2);
      
      // Both approaches should produce similar results
      expect(integratedResult.data.duration).toBeGreaterThan(0);
      expect(integratedResult.data.outputPaths.length).toBeGreaterThan(4);
    });
  });
});

/**
 * Test utility functions
 */

function createTestContent(topic: string, length: 'short' | 'medium' | 'long' = 'medium'): string {
  const baseContent = `
# ${topic}

This is test content about ${topic}. It provides comprehensive information 
and analysis on the subject matter, covering key concepts and practical applications.
  `.trim();
  
  if (length === 'short') {
    return baseContent;
  } else if (length === 'long') {
    return baseContent + `

## Detailed Analysis

${topic} represents a significant development in modern technology and society. 
The implications are far-reaching and affect multiple sectors including healthcare, 
education, business, and government.

### Key Benefits
- Improved efficiency and productivity
- Enhanced decision-making capabilities  
- Better resource allocation
- Increased accessibility and reach

### Challenges and Considerations
- Implementation complexity
- Cost and resource requirements
- Privacy and security concerns
- Training and adaptation needs

### Future Outlook
The future of ${topic} looks promising with continued innovation and development. 
Organizations that embrace these changes will be better positioned for success.
    `.trim();
  }
  
  return baseContent + `

## Overview
${topic} is an important subject that deserves careful consideration and analysis. 
This content explores the various aspects and implications in detail.
  `.trim();
}