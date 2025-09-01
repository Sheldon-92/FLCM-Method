/**
 * Content Generation Modes Unit Tests
 * Test all three creation modes: Quick, Standard, Custom
 */

import { CreatorAgent, CreationOptions, VoiceDNAProfile } from '../index';
import { ContentGenerator } from '../content-generator';
import { DialogueManager } from '../dialogue-manager';
import { CreationMode } from '../../../shared/config/config-schema';
import { InsightsDocument, createInsightsDocument } from '../../../shared/pipeline/document-schema';

// Mock dependencies
jest.mock('../../../shared/utils/logger', () => ({
  createLogger: () => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('../voice-dna-analyzer');
jest.mock('../dialogue-manager');

describe('Content Generation Modes', () => {
  let agent: CreatorAgent;
  let mockInsightsDocument: InsightsDocument;
  let mockVoiceProfile: VoiceDNAProfile;
  let mockContentGenerator: jest.Mocked<ContentGenerator>;
  let mockDialogueManager: jest.Mocked<DialogueManager>;

  beforeEach(() => {
    agent = new CreatorAgent();
    
    // Create mock insights document
    mockInsightsDocument = createInsightsDocument(
      { type: 'text' as any, path: 'test-source', hash: 'test-hash' },
      ['SWOT-USED', 'Socratic'],
      'Comprehensive analysis of AI implementation in business operations.',
      'Scholar Agent'
    );

    mockInsightsDocument.keyFindings = [
      'AI automation reduces manual processing time by 75%',
      'Implementation costs average $2.5M for enterprise deployment',
      'Employee training programs increase adoption success by 60%',
      'Data quality directly correlates with AI system effectiveness',
    ];

    mockInsightsDocument.recommendations = [
      'Establish dedicated AI governance committee',
      'Implement phased rollout strategy over 18 months',
      'Invest in comprehensive staff training programs',
      'Develop robust data quality assurance processes',
    ];

    mockInsightsDocument.summary = 'AI implementation requires strategic planning, significant investment, and comprehensive change management for successful adoption.';

    // Create mock voice profile
    mockVoiceProfile = {
      id: 'test-voice-profile',
      userId: 'user-123',
      created: new Date(),
      updated: new Date(),
      sampleCount: 10,
      style: {
        formality: 0.75,
        complexity: 0.65,
        emotionality: 0.35,
        technicality: 0.80,
      },
      patterns: {
        sentenceLength: { avg: 18, std: 6 },
        paragraphLength: { avg: 4, std: 2 },
        vocabularyRichness: 0.7,
        punctuationStyle: { '.': 0.8, '!': 0.1, '?': 0.1 },
      },
      vocabulary: {
        commonWords: ['analysis', 'implementation', 'strategic', 'comprehensive'],
        uniquePhrases: ['strategic implementation', 'comprehensive analysis', 'systematic approach'],
        preferredTransitions: ['Furthermore', 'Additionally', 'Moreover', 'Consequently'],
        avoidedWords: ['very', 'really', 'quite', 'totally'],
      },
      tone: {
        sentiment: 'neutral',
        energy: 'medium',
        confidence: 0.85,
      },
    };

    // Setup mocks
    mockContentGenerator = {
      generate: jest.fn(),
      generateDraft: jest.fn(),
      refine: jest.fn(),
    } as any;

    mockDialogueManager = {
      startSession: jest.fn(),
      getFeedback: jest.fn(),
    } as any;

    // Replace instances
    (agent as any).contentGenerator = mockContentGenerator;
    (agent as any).dialogueManager = mockDialogueManager;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Quick Mode (3-minute target)', () => {
    it('should complete quick creation within time limit', async () => {
      const options: CreationOptions = {
        mode: 'quick',
        voiceProfile: mockVoiceProfile,
      };

      const startTime = Date.now();
      const result = await agent.create(mockInsightsDocument, options);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(180000); // 3 minutes
      expect(result).toBeDefined();
      expect(result.metadata.mode).toBe('quick');
    });

    it('should generate structured content with key sections', async () => {
      const options: CreationOptions = {
        mode: 'quick',
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      expect(result.content).toContain('Based on recent analysis');
      expect(result.content).toContain('## ');
      expect(result.content).toContain('Conclusion');
      expect(result.sections.length).toBeGreaterThan(2);
    });

    it('should incorporate key findings effectively', async () => {
      const options: CreationOptions = {
        mode: 'quick',
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      // Should reference key findings from insights
      const contentLower = result.content.toLowerCase();
      expect(contentLower).toMatch(/automation|75%|processing/);
      expect(contentLower).toMatch(/implementation|cost|enterprise/);
      expect(contentLower).toMatch(/training|adoption|success/);
    });

    it('should generate appropriate title', async () => {
      const options: CreationOptions = {
        mode: 'quick',
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      expect(result.title).toBeDefined();
      expect(result.title.length).toBeGreaterThan(10);
      expect(result.title.length).toBeLessThan(100);
      // Title should relate to first key finding
      expect(result.title.toLowerCase()).toMatch(/ai|automation|processing/);
    });

    it('should maintain consistent structure across runs', async () => {
      const options: CreationOptions = {
        mode: 'quick',
        voiceProfile: mockVoiceProfile,
      };

      const results = await Promise.all([
        agent.create(mockInsightsDocument, options),
        agent.create(mockInsightsDocument, options),
      ]);

      // Structure should be consistent
      expect(results[0].sections.length).toBe(results[1].sections.length);
      expect(results[0].content.split('##').length).toBe(results[1].content.split('##').length);
    });

    it('should handle minimal insights gracefully', async () => {
      const minimalInsights = createInsightsDocument(
        { type: 'text' as any, path: 'minimal', hash: 'minimal' },
        ['SWOT-USED'],
        'Brief analysis',
        'Scholar Agent'
      );
      minimalInsights.keyFindings = ['Single finding'];
      minimalInsights.recommendations = ['Single recommendation'];

      const options: CreationOptions = {
        mode: 'quick',
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(minimalInsights, options);

      expect(result).toBeDefined();
      expect(result.content).toContain('Single finding');
      expect(result.content.length).toBeGreaterThan(100);
    });
  });

  describe('Standard Mode (Framework-based)', () => {
    beforeEach(() => {
      mockContentGenerator.generate.mockResolvedValue(`
        # Strategic AI Implementation Framework
        
        ## Executive Summary
        The comprehensive analysis of artificial intelligence implementation in business operations reveals significant opportunities for transformational change. Organizations must carefully balance innovation potential with implementation challenges to achieve sustainable competitive advantages.
        
        ## Current State Analysis
        Enterprise environments increasingly recognize AI's transformative potential. Automation capabilities reduce manual processing overhead by substantial margins, while data-driven insights enhance decision-making processes across organizational hierarchies.
        
        ## Strategic Considerations
        Implementation strategies require systematic approaches encompassing technical infrastructure, human capital development, and organizational change management. Investment requirements average substantial capital commitments for enterprise-grade deployments.
        
        ## Implementation Roadmap
        Phased rollout strategies optimize adoption success rates while minimizing operational disruptions. Training programs significantly enhance user acceptance and system utilization effectiveness.
        
        ## Risk Management
        Data quality assurance processes directly impact system performance and reliability. Governance frameworks ensure ethical AI deployment and regulatory compliance across operational domains.
        
        ## Success Factors
        Dedicated governance committees provide strategic oversight and tactical guidance throughout implementation cycles. Stakeholder engagement maintains organizational alignment and project momentum.
        
        ## Conclusion
        Strategic AI implementation demands comprehensive planning, significant investment, and systematic change management for successful organizational transformation.
      `);
    });

    it('should generate comprehensive framework-based content', async () => {
      const options: CreationOptions = {
        mode: 'standard',
        framework: 'analytical',
        targetWordCount: 1500,
        tone: 'professional',
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      expect(mockContentGenerator.generate).toHaveBeenCalledWith({
        insights: mockInsightsDocument,
        framework: 'analytical',
        targetWords: 1500,
        tone: 'professional',
        profile: mockVoiceProfile,
      });

      expect(result.content).toContain('Strategic AI Implementation');
      expect(result.content).toContain('Executive Summary');
      expect(result.sections.length).toBeGreaterThan(5);
    });

    it('should respect framework selection', async () => {
      const frameworks = ['narrative', 'analytical', 'instructional', 'persuasive', 'descriptive'] as const;

      for (const framework of frameworks) {
        const options: CreationOptions = {
          mode: 'standard',
          framework,
          voiceProfile: mockVoiceProfile,
        };

        await agent.create(mockInsightsDocument, options);

        expect(mockContentGenerator.generate).toHaveBeenCalledWith(
          expect.objectContaining({ framework })
        );
      }
    });

    it('should handle different tone settings', async () => {
      const tones = ['professional', 'casual', 'academic', 'creative'] as const;

      for (const tone of tones) {
        const options: CreationOptions = {
          mode: 'standard',
          tone,
          voiceProfile: mockVoiceProfile,
        };

        await agent.create(mockInsightsDocument, options);

        expect(mockContentGenerator.generate).toHaveBeenCalledWith(
          expect.objectContaining({ tone })
        );
      }

      expect(mockContentGenerator.generate).toHaveBeenCalledTimes(4);
    });

    it('should approximate target word count', async () => {
      const wordCounts = [500, 1000, 1500, 2000];

      for (const targetWordCount of wordCounts) {
        const options: CreationOptions = {
          mode: 'standard',
          targetWordCount,
          voiceProfile: mockVoiceProfile,
        };

        await agent.create(mockInsightsDocument, options);

        expect(mockContentGenerator.generate).toHaveBeenCalledWith(
          expect.objectContaining({ targetWords: targetWordCount })
        );
      }
    });

    it('should use default framework when not specified', async () => {
      const options: CreationOptions = {
        mode: 'standard',
        voiceProfile: mockVoiceProfile,
      };

      await agent.create(mockInsightsDocument, options);

      expect(mockContentGenerator.generate).toHaveBeenCalledWith(
        expect.objectContaining({ framework: 'analytical' })
      );
    });

    it('should use default word count when not specified', async () => {
      const options: CreationOptions = {
        mode: 'standard',
        voiceProfile: mockVoiceProfile,
      };

      await agent.create(mockInsightsDocument, options);

      expect(mockContentGenerator.generate).toHaveBeenCalledWith(
        expect.objectContaining({ targetWords: 1500 })
      );
    });

    it('should use default tone when not specified', async () => {
      const options: CreationOptions = {
        mode: 'standard',
        voiceProfile: mockVoiceProfile,
      };

      await agent.create(mockInsightsDocument, options);

      expect(mockContentGenerator.generate).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'professional' })
      );
    });
  });

  describe('Custom Mode (Interactive)', () => {
    beforeEach(() => {
      mockDialogueManager.startSession.mockResolvedValue({
        id: 'session-123',
        title: 'AI Strategy Deep Dive',
        interactive: true,
      });

      mockContentGenerator.generateDraft.mockResolvedValue(`
        # AI Implementation Strategy - Initial Draft
        
        ## Overview
        Initial analysis shows promising results for AI integration in business operations.
        Further refinement needed based on stakeholder feedback and detailed requirements.
        
        ## Key Considerations
        Implementation challenges require careful planning and resource allocation.
        Success factors include training, governance, and change management.
      `);

      mockContentGenerator.refine.mockImplementation(async (content, feedback) => {
        return content
          .replace('Initial analysis', 'Comprehensive analysis')
          .replace('Further refinement needed', 'Enhanced with stakeholder input')
          .replace('promising results', 'exceptional opportunities')
          .replace('Implementation challenges', 'Strategic implementation phases');
      });

      mockDialogueManager.getFeedback
        .mockResolvedValueOnce({
          satisfied: false,
          suggestions: [
            'Add more specific implementation timelines',
            'Include budget considerations',
            'Expand on risk mitigation strategies',
          ],
          score: 7,
        })
        .mockResolvedValueOnce({
          satisfied: true,
          suggestions: [],
          score: 9,
        });
    });

    it('should manage interactive dialogue sessions', async () => {
      const options: CreationOptions = {
        mode: 'custom',
        interactive: true,
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      expect(mockDialogueManager.startSession).toHaveBeenCalledWith({
        insights: mockInsightsDocument,
        profile: mockVoiceProfile,
        interactive: true,
      });

      expect(result.title).toBe('AI Strategy Deep Dive');
    });

    it('should perform iterative content refinement', async () => {
      const options: CreationOptions = {
        mode: 'custom',
        interactive: true,
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      expect(mockContentGenerator.generateDraft).toHaveBeenCalledWith(mockInsightsDocument);
      expect(mockDialogueManager.getFeedback).toHaveBeenCalledTimes(2);
      expect(mockContentGenerator.refine).toHaveBeenCalledTimes(1);

      // Content should show refinement
      expect(result.content).toContain('Comprehensive analysis');
      expect(result.content).toContain('Enhanced with stakeholder input');
      expect(result.content).toContain('exceptional opportunities');
    });

    it('should limit iteration cycles to prevent infinite loops', async () => {
      // Mock continuous dissatisfaction
      mockDialogueManager.getFeedback.mockResolvedValue({
        satisfied: false,
        suggestions: ['Never satisfied'],
        score: 5,
      });

      const options: CreationOptions = {
        mode: 'custom',
        interactive: true,
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      // Should stop after maximum iterations (5)
      expect(mockDialogueManager.getFeedback).toHaveBeenCalledTimes(5);
      expect(mockContentGenerator.refine).toHaveBeenCalledTimes(5);
      expect(result).toBeDefined();
    });

    it('should handle non-interactive custom mode', async () => {
      const options: CreationOptions = {
        mode: 'custom',
        interactive: false,
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      expect(mockDialogueManager.startSession).toHaveBeenCalledWith({
        insights: mockInsightsDocument,
        profile: mockVoiceProfile,
        interactive: false,
      });

      expect(mockContentGenerator.generateDraft).toHaveBeenCalled();
      // No refinement in non-interactive mode
      expect(mockDialogueManager.getFeedback).not.toHaveBeenCalled();
      expect(mockContentGenerator.refine).not.toHaveBeenCalled();
    });

    it('should use session title when available', async () => {
      const customTitle = 'Custom AI Implementation Guide';
      mockDialogueManager.startSession.mockResolvedValue({
        id: 'session-456',
        title: customTitle,
        interactive: true,
      });

      const options: CreationOptions = {
        mode: 'custom',
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      expect(result.title).toBe(customTitle);
    });

    it('should fall back to generated title when session title not available', async () => {
      mockDialogueManager.startSession.mockResolvedValue({
        id: 'session-789',
        title: null,
        interactive: true,
      } as any);

      const options: CreationOptions = {
        mode: 'custom',
        voiceProfile: mockVoiceProfile,
      };

      const result = await agent.create(mockInsightsDocument, options);

      expect(result.title).toBeDefined();
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.title).not.toBe(null);
    });

    it('should incorporate feedback effectively', async () => {
      mockDialogueManager.getFeedback
        .mockResolvedValueOnce({
          satisfied: false,
          suggestions: [
            'Add implementation timeline',
            'Include cost analysis',
            'Expand risk assessment',
          ],
          score: 6,
        })
        .mockResolvedValueOnce({
          satisfied: true,
          suggestions: [],
          score: 9,
        });

      const options: CreationOptions = {
        mode: 'custom',
        interactive: true,
        voiceProfile: mockVoiceProfile,
      };

      await agent.create(mockInsightsDocument, options);

      expect(mockContentGenerator.refine).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          satisfied: false,
          suggestions: [
            'Add implementation timeline',
            'Include cost analysis', 
            'Expand risk assessment',
          ],
          score: 6,
        })
      );
    });
  });

  describe('Mode Comparison and Performance', () => {
    it('should show performance differences between modes', async () => {
      const modes: CreationMode[] = ['quick', 'standard', 'custom'];
      const durations: Record<CreationMode, number> = {} as any;

      for (const mode of modes) {
        const options: CreationOptions = {
          mode,
          voiceProfile: mockVoiceProfile,
        };

        const startTime = Date.now();
        await agent.create(mockInsightsDocument, options);
        durations[mode] = Date.now() - startTime;
      }

      // Quick mode should be fastest
      expect(durations.quick).toBeLessThan(durations.standard);
      expect(durations.quick).toBeLessThan(durations.custom);

      // All modes should complete within reasonable time
      expect(durations.quick).toBeLessThan(30000);
      expect(durations.standard).toBeLessThan(45000);
      expect(durations.custom).toBeLessThan(60000);
    });

    it('should produce appropriate content length by mode', async () => {
      const results: Record<CreationMode, any> = {} as any;

      for (const mode of ['quick', 'standard', 'custom'] as CreationMode[]) {
        const options: CreationOptions = {
          mode,
          voiceProfile: mockVoiceProfile,
        };

        results[mode] = await agent.create(mockInsightsDocument, options);
      }

      const quickWords = results.quick.content.split(/\s+/).length;
      const standardWords = results.standard.content.split(/\s+/).length;
      const customWords = results.custom.content.split(/\s+/).length;

      // Standard mode typically produces longer content
      expect(standardWords).toBeGreaterThan(quickWords);
      
      // Custom mode should produce substantial content
      expect(customWords).toBeGreaterThan(100);

      // All should produce meaningful content
      expect(quickWords).toBeGreaterThan(50);
      expect(standardWords).toBeGreaterThan(200);
    });

    it('should maintain quality across all modes', async () => {
      const modes: CreationMode[] = ['quick', 'standard', 'custom'];

      for (const mode of modes) {
        const options: CreationOptions = {
          mode,
          voiceProfile: mockVoiceProfile,
        };

        const result = await agent.create(mockInsightsDocument, options);

        // Quality checks
        expect(result.title).toBeDefined();
        expect(result.content).toBeDefined();
        expect(result.sections.length).toBeGreaterThan(0);
        expect(result.metadata.voiceDNA.confidence).toBeGreaterThan(0.8);
        
        // Should reference insights
        const contentLower = result.content.toLowerCase();
        expect(contentLower).toMatch(/ai|automation|implementation/);
      }
    });

    it('should handle mode switching gracefully', async () => {
      const modeSequence: CreationMode[] = ['quick', 'standard', 'custom', 'quick'];

      for (const mode of modeSequence) {
        const options: CreationOptions = {
          mode,
          voiceProfile: mockVoiceProfile,
        };

        const result = await agent.create(mockInsightsDocument, options);

        expect(result.metadata.mode).toBe(mode);
        expect(result).toBeDefined();
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid mode gracefully', async () => {
      const options = {
        mode: 'invalid-mode' as CreationMode,
        voiceProfile: mockVoiceProfile,
      };

      await expect(agent.create(mockInsightsDocument, options)).rejects.toThrow(
        'Unknown creation mode: invalid-mode'
      );
    });

    it('should handle content generation failures', async () => {
      mockContentGenerator.generate.mockRejectedValue(new Error('Generation failed'));

      const options: CreationOptions = {
        mode: 'standard',
        voiceProfile: mockVoiceProfile,
      };

      await expect(agent.create(mockInsightsDocument, options)).rejects.toThrow('Generation failed');
    });

    it('should handle dialogue session failures', async () => {
      mockDialogueManager.startSession.mockRejectedValue(new Error('Session failed'));

      const options: CreationOptions = {
        mode: 'custom',
        voiceProfile: mockVoiceProfile,
      };

      await expect(agent.create(mockInsightsDocument, options)).rejects.toThrow('Session failed');
    });

    it('should handle missing voice profile', async () => {
      const options: CreationOptions = {
        mode: 'quick',
        // voiceProfile not provided
      };

      // Should use default voice profile
      const result = await agent.create(mockInsightsDocument, options);

      expect(result).toBeDefined();
      expect(result.metadata.voiceDNA.profileId).toBe('default');
    });
  });
});