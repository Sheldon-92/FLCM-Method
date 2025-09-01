/**
 * Unit Tests for Voice DNA Analyzer
 */

import { VoiceDNAAnalyzer, VoiceProfile, VoiceAnalysis } from '../voice-dna';

describe('VoiceDNAAnalyzer', () => {
  let voiceDNA: VoiceDNAAnalyzer;
  let sampleText: string;

  beforeEach(() => {
    voiceDNA = new VoiceDNAAnalyzer();
    sampleText = `
      Writing is an art form that requires both technical skill and creative vision. I believe that every writer has a unique voice, 
      much like a fingerprint. When crafting content, I often start with a question: "What story am I trying to tell?"
      
      The process involves several key steps: research, outlining, drafting, and revision. Each phase serves a specific purpose.
      Research provides the foundation - data, insights, and context that inform the narrative. Without solid research, 
      even the most eloquent prose falls flat.
      
      Here's what I've learned after years of writing:
      1. Authenticity resonates more than perfection
      2. Simple language often conveys complex ideas better
      3. Stories connect with readers on an emotional level
      
      Remember: good writing isn't about impressing people with big words. It's about communicating clearly and connecting genuinely.
      That's the real magic! 🎭
    `;
  });

  describe('Constructor', () => {
    test('should initialize properly', () => {
      expect(voiceDNA).toBeDefined();
      expect(voiceDNA).toBeInstanceOf(VoiceDNAAnalyzer);
    });
  });

  describe('analyzeVoice', () => {
    test('should analyze text and return complete voice profile', async () => {
      const analysis = await voiceDNA.analyzeVoice(sampleText);
      
      expect(analysis).toBeDefined();
      expect(analysis.profile).toBeDefined();
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(100);
      expect(analysis.sampleSize).toBeGreaterThan(0);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    test('should handle short text with appropriate confidence', async () => {
      const shortText = 'This is a short sentence.';
      const analysis = await voiceDNA.analyzeVoice(shortText);
      
      expect(analysis.confidence).toBeLessThan(80);
      expect(analysis.recommendations).toContain(expect.stringMatching(/more.*sample/i));
    });

    test('should handle empty or very short text', async () => {
      const analysis = await voiceDNA.analyzeVoice('');
      
      expect(analysis).toBeDefined();
      expect(analysis.confidence).toBe(0);
      expect(analysis.profile).toBeDefined();
    });
  });

  describe('analyzeLinguistic', () => {
    test('should correctly calculate average sentence length', () => {
      const testText = 'Short sentence. This is a longer sentence with more words. Medium length sentence here.';
      const linguistic = voiceDNA.analyzeLinguistic(testText);
      
      expect(linguistic.avgSentenceLength).toBeGreaterThan(0);
      expect(linguistic.avgSentenceLength).toBeLessThan(50);
    });

    test('should calculate sentence length variation', () => {
      const varyingText = 'Short. This is a much longer sentence with many more words and details. Medium.';
      const linguistic = voiceDNA.analyzeLinguistic(varyingText);
      
      expect(linguistic.sentenceLengthVariation).toBeGreaterThan(0);
    });

    test('should determine vocabulary level correctly', () => {
      const simpleText = 'I like cats. They are nice. Cats play with toys.';
      const expertText = 'The implementation necessitates comprehensive architectural considerations and sophisticated algorithmic approaches.';
      
      const simpleLinguistic = voiceDNA.analyzeLinguistic(simpleText);
      const expertLinguistic = voiceDNA.analyzeLinguistic(expertText);
      
      expect(['simple', 'moderate']).toContain(simpleLinguistic.vocabularyLevel);
      expect(['advanced', 'expert']).toContain(expertLinguistic.vocabularyLevel);
    });

    test('should count punctuation patterns correctly', () => {
      const punctuationText = 'Really exciting! Are you sure? Well... maybe—but I think; it depends.';
      const linguistic = voiceDNA.analyzeLinguistic(punctuationText);
      
      expect(linguistic.punctuationStyle.exclamations).toBe(1);
      expect(linguistic.punctuationStyle.questions).toBe(1);
      expect(linguistic.punctuationStyle.ellipses).toBe(1);
      expect(linguistic.punctuationStyle.dashes).toBe(1);
      expect(linguistic.punctuationStyle.semicolons).toBe(1);
    });

    test('should calculate unique word ratio', () => {
      const repetitiveText = 'cat cat dog cat dog dog cat';
      const uniqueText = 'elephant giraffe zebra lion tiger';
      
      const repetitiveLinguistic = voiceDNA.analyzeLinguistic(repetitiveText);
      const uniqueLinguistic = voiceDNA.analyzeLinguistic(uniqueText);
      
      expect(repetitiveLinguistic.uniqueWordRatio).toBeLessThan(uniqueLinguistic.uniqueWordRatio);
    });
  });

  describe('analyzeTone', () => {
    test('should assess formality correctly', () => {
      const formalText = 'The aforementioned analysis demonstrates significant implications for future research endeavors.';
      const casualText = "Hey there! So here's the thing - it's pretty cool stuff, you know?";
      
      const formalTone = voiceDNA.analyzeTone(formalText);
      const casualTone = voiceDNA.analyzeTone(casualText);
      
      expect(formalTone.formality).toBeGreaterThan(casualTone.formality);
      expect(formalTone.formality).toBeGreaterThan(0.6);
      expect(casualTone.formality).toBeLessThan(0.5);
    });

    test('should detect emotional content', () => {
      const emotionalText = 'I absolutely love this amazing opportunity! It makes me so incredibly happy and excited!';
      const neutralText = 'The report indicates a 15% increase in quarterly revenue compared to last year.';
      
      const emotionalTone = voiceDNA.analyzeTone(emotionalText);
      const neutralTone = voiceDNA.analyzeTone(neutralText);
      
      expect(emotionalTone.emotion).toBeGreaterThan(neutralTone.emotion);
    });

    test('should assess authority level', () => {
      const authoritativeText = 'Based on extensive research, I can definitively state that this approach will succeed.';
      const tentativeText = 'I think maybe this might work, but I could be wrong about this approach.';
      
      const authoritativeTone = voiceDNA.analyzeTone(authoritativeText);
      const tentativeTone = voiceDNA.analyzeTone(tentativeText);
      
      expect(authoritativeTone.authority).toBeGreaterThan(tentativeTone.authority);
    });

    test('should detect humor appropriately', () => {
      const humorousText = 'Why did the programmer quit his job? He didn\'t get arrays! 😂';
      const seriousText = 'The financial implications of this decision require careful consideration.';
      
      const humorousTone = voiceDNA.analyzeTone(humorousText);
      const seriousTone = voiceDNA.analyzeTone(seriousText);
      
      expect(humorousTone.humor).toBeGreaterThan(seriousTone.humor);
    });

    test('should assess energy level', () => {
      const energeticText = 'WOW! This is absolutely fantastic! Let\'s dive right in and explore all the possibilities!';
      const calmText = 'We will proceed methodically through each step of the process.';
      
      const energeticTone = voiceDNA.analyzeTone(energeticText);
      const calmTone = voiceDNA.analyzeTone(calmText);
      
      expect(energeticTone.energy).toBeGreaterThan(calmTone.energy);
    });
  });

  describe('analyzeStyle', () => {
    test('should detect metaphor usage', () => {
      const metaphorText = 'Life is a journey, and writing is the compass that guides us through the wilderness of ideas.';
      const plainText = 'Writing helps organize and communicate ideas effectively.';
      
      const metaphorStyle = voiceDNA.analyzeStyle(metaphorText);
      const plainStyle = voiceDNA.analyzeStyle(plainText);
      
      expect(['occasional', 'frequent']).toContain(metaphorStyle.metaphorUsage);
      expect(plainStyle.metaphorUsage).toBe('rare');
    });

    test('should detect storytelling elements', () => {
      const storyText = 'Once, when I was working on a project, something unexpected happened that changed everything...';
      const factualText = 'The data shows a clear trend in user engagement metrics.';
      
      const storyStyle = voiceDNA.analyzeStyle(storyText);
      const factualStyle = voiceDNA.analyzeStyle(factualText);
      
      expect(storyStyle.storytelling).toBe(true);
      expect(factualStyle.storytelling).toBe(false);
    });

    test('should detect personal anecdotes', () => {
      const personalText = 'In my experience, I have found that... When I first encountered this...';
      const impersonalText = 'Research indicates that this approach is effective.';
      
      const personalStyle = voiceDNA.analyzeStyle(personalText);
      const impersonalStyle = voiceDNA.analyzeStyle(impersonalText);
      
      expect(personalStyle.personalAnecdotes).toBe(true);
      expect(impersonalStyle.personalAnecdotes).toBe(false);
    });

    test('should detect data orientation', () => {
      const dataText = 'The statistics show 75% improvement, with a confidence interval of 95% and p-value < 0.001.';
      const narrativeText = 'It was a beautiful day when everything changed for the better.';
      
      const dataStyle = voiceDNA.analyzeStyle(dataText);
      const narrativeStyle = voiceDNA.analyzeStyle(narrativeText);
      
      expect(dataStyle.dataOriented).toBe(true);
      expect(narrativeStyle.dataOriented).toBe(false);
    });

    test('should detect conversational style', () => {
      const conversationalText = 'You know what? Here\'s the thing - we need to think about this differently.';
      const formalText = 'It is necessary to reconsider the current approach to this matter.';
      
      const conversationalStyle = voiceDNA.analyzeStyle(conversationalText);
      const formalStyle = voiceDNA.analyzeStyle(formalText);
      
      expect(conversationalStyle.conversational).toBe(true);
      expect(formalStyle.conversational).toBe(false);
    });

    test('should detect academic citations', () => {
      const academicText = 'According to Smith et al. (2023), the findings suggest... (Johnson, 2022).';
      const casualText = 'I read somewhere that this might work pretty well.';
      
      const academicStyle = voiceDNA.analyzeStyle(academicText);
      const casualStyle = voiceDNA.analyzeStyle(casualText);
      
      expect(academicStyle.academicCitations).toBe(true);
      expect(casualStyle.academicCitations).toBe(false);
    });
  });

  describe('analyzeStructure', () => {
    test('should calculate average paragraph length', () => {
      const multiParagraphText = `
        This is paragraph one with several sentences. It has enough content to be meaningful.
        
        This is paragraph two. It is shorter.
        
        This is paragraph three which is longer than the others and contains more detailed information about the topic.
      `;
      
      const structure = voiceDNA.analyzeStructure(multiParagraphText);
      
      expect(structure.avgParagraphLength).toBeGreaterThan(0);
    });

    test('should identify opening styles', () => {
      const questionOpening = 'Have you ever wondered why...';
      const statementOpening = 'The analysis demonstrates...';
      const storyOpening = 'Once upon a time...';
      const statisticOpening = '75% of people believe...';
      const quoteOpening = 'As Einstein once said...';
      
      expect(voiceDNA.analyzeStructure(questionOpening).openingStyle).toBe('question');
      expect(voiceDNA.analyzeStructure(statementOpening).openingStyle).toBe('statement');
      expect(voiceDNA.analyzeStructure(storyOpening).openingStyle).toBe('story');
      expect(voiceDNA.analyzeStructure(statisticOpening).openingStyle).toBe('statistic');
      expect(voiceDNA.analyzeStructure(quoteOpening).openingStyle).toBe('quote');
    });

    test('should identify closing styles', () => {
      const summaryClosing = 'In conclusion, we can see that...';
      const ctaClosing = 'Take action now by...';
      const questionClosing = 'What do you think about this?';
      const inspirationClosing = 'Together, we can achieve greatness!';
      
      expect(voiceDNA.analyzeStructure(summaryClosing).closingStyle).toBe('summary');
      expect(voiceDNA.analyzeStructure(ctaClosing).closingStyle).toBe('call-to-action');
      expect(voiceDNA.analyzeStructure(questionClosing).closingStyle).toBe('question');
      expect(voiceDNA.analyzeStructure(inspirationClosing).closingStyle).toBe('inspiration');
    });

    test('should assess list usage', () => {
      const heavyListText = `
        Here are the steps: 1. First step 2. Second step 3. Third step
        And also: • Point A • Point B • Point C
        Finally: - Item 1 - Item 2 - Item 3
      `;
      const noListText = 'This text has no lists at all just regular sentences.';
      
      const heavyListStructure = voiceDNA.analyzeStructure(heavyListText);
      const noListStructure = voiceDNA.analyzeStructure(noListText);
      
      expect(heavyListStructure.listUsage).toBe('heavy');
      expect(noListStructure.listUsage).toBe('minimal');
    });

    test('should count header frequency', () => {
      const headerText = `
        # Main Header
        Some content here.
        ## Subheader
        More content.
        ### Another Header
        Final content.
      `;
      const noHeaderText = 'Just plain text with no headers at all.';
      
      const headerStructure = voiceDNA.analyzeStructure(headerText);
      const noHeaderStructure = voiceDNA.analyzeStructure(noHeaderText);
      
      expect(headerStructure.headerFrequency).toBeGreaterThan(noHeaderStructure.headerFrequency);
    });
  });

  describe('extractSignaturePhrases', () => {
    test('should extract common phrases and patterns', () => {
      const repetitiveText = `
        I believe that this approach works. I believe in taking action.
        Here's what I think: we should move forward. Here's what matters.
        The key point is clarity. The key to success is persistence.
      `;
      
      const phrases = voiceDNA.extractSignaturePhrases(repetitiveText);
      
      expect(phrases).toBeInstanceOf(Array);
      expect(phrases.length).toBeGreaterThan(0);
      expect(phrases).toContain(expect.stringMatching(/i believe/i));
      expect(phrases).toContain(expect.stringMatching(/here's what/i));
    });

    test('should handle text with no repetitive patterns', () => {
      const uniqueText = 'Every sentence uses completely different words and structures without any repetition.';
      
      const phrases = voiceDNA.extractSignaturePhrases(uniqueText);
      
      expect(phrases).toBeInstanceOf(Array);
    });
  });

  describe('generateRecommendations', () => {
    test('should provide recommendations for low confidence analysis', () => {
      const lowConfidenceAnalysis: VoiceAnalysis = {
        profile: voiceDNA.analyzeVoice('Short text.').profile,
        confidence: 30,
        sampleSize: 10,
        recommendations: []
      };
      
      const recommendations = voiceDNA.generateRecommendations(lowConfidenceAnalysis);
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations).toContain(expect.stringMatching(/more.*sample|additional.*text/i));
    });

    test('should provide different recommendations based on profile characteristics', () => {
      const analysis = await voiceDNA.analyzeVoice(sampleText);
      const recommendations = voiceDNA.generateRecommendations(analysis);
      
      expect(recommendations).toBeInstanceOf(Array);
      // Should provide constructive suggestions based on the voice profile
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle text with only punctuation', async () => {
      const punctuationOnlyText = '!!! ??? ... --- ;;;';
      const analysis = await voiceDNA.analyzeVoice(punctuationOnlyText);
      
      expect(analysis).toBeDefined();
      expect(analysis.confidence).toBeLessThan(20);
    });

    test('should handle text with unicode characters', async () => {
      const unicodeText = 'Hello 世界! This contains émojis 🎉 and spëcial chàracters.';
      const analysis = await voiceDNA.analyzeVoice(unicodeText);
      
      expect(analysis).toBeDefined();
      expect(analysis.profile).toBeDefined();
    });

    test('should handle extremely long text', async () => {
      const longText = 'This is a sentence. '.repeat(10000);
      const analysis = await voiceDNA.analyzeVoice(longText);
      
      expect(analysis).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(80);
    });

    test('should handle malformed input gracefully', async () => {
      const malformedInputs = [null, undefined, 123, {}, []];
      
      for (const input of malformedInputs) {
        const analysis = await voiceDNA.analyzeVoice(input as any);
        expect(analysis).toBeDefined();
        expect(analysis.confidence).toBe(0);
      }
    });
  });

  describe('Voice Profile Comparison', () => {
    test('should calculate similarity between voice profiles', async () => {
      const text1 = 'I love writing! It\'s so exciting and fun. Here\'s what I think: creativity rocks!';
      const text2 = 'I enjoy writing! It\'s quite interesting and engaging. Here\'s my view: innovation matters!';
      const text3 = 'The research methodology demonstrates significant statistical correlation coefficients.';
      
      const analysis1 = await voiceDNA.analyzeVoice(text1);
      const analysis2 = await voiceDNA.analyzeVoice(text2);
      const analysis3 = await voiceDNA.analyzeVoice(text3);
      
      const similarity1to2 = voiceDNA.calculateSimilarity(analysis1.profile, analysis2.profile);
      const similarity1to3 = voiceDNA.calculateSimilarity(analysis1.profile, analysis3.profile);
      
      expect(similarity1to2).toBeGreaterThan(similarity1to3);
      expect(similarity1to2).toBeGreaterThanOrEqual(0);
      expect(similarity1to2).toBeLessThanOrEqual(100);
    });
  });

  describe('Voice Adaptation', () => {
    test('should generate adaptation suggestions for different platforms', async () => {
      const analysis = await voiceDNA.analyzeVoice(sampleText);
      
      const linkedinAdaptation = voiceDNA.adaptForPlatform(analysis.profile, 'linkedin');
      const twitterAdaptation = voiceDNA.adaptForPlatform(analysis.profile, 'twitter');
      
      expect(linkedinAdaptation).toBeDefined();
      expect(twitterAdaptation).toBeDefined();
      expect(linkedinAdaptation).not.toEqual(twitterAdaptation);
    });
  });
});