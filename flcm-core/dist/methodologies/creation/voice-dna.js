"use strict";
/**
 * Voice DNA Analyzer
 * Analyzes and preserves unique writing voice characteristics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceDNAAnalyzer = void 0;
/**
 * Voice DNA Analyzer Class
 */
class VoiceDNAAnalyzer {
    constructor() {
        this.DEFAULT_PROFILE = {
            linguistic: {
                avgSentenceLength: 15,
                sentenceLengthVariation: 0.3,
                vocabularyLevel: 'moderate',
                uniqueWordRatio: 0.4,
                punctuationStyle: {
                    exclamations: 0.05,
                    questions: 0.1,
                    ellipses: 0.02,
                    dashes: 0.05,
                    semicolons: 0.01
                }
            },
            tone: {
                formality: 0.5,
                emotion: 0.4,
                authority: 0.6,
                humor: 0.2,
                energy: 0.5
            },
            style: {
                metaphorUsage: 'occasional',
                storytelling: false,
                personalAnecdotes: false,
                dataOriented: true,
                conversational: true,
                academicCitations: false
            },
            structure: {
                avgParagraphLength: 4,
                openingStyle: 'statement',
                closingStyle: 'summary',
                listUsage: 'moderate',
                headerFrequency: 0.2
            },
            signatures: {
                phrases: [],
                transitions: ['however', 'therefore', 'moreover'],
                openings: [],
                closings: []
            }
        };
    }
    /**
     * Analyze voice from content samples
     */
    analyze(samples) {
        if (samples.length === 0) {
            return {
                profile: this.DEFAULT_PROFILE,
                confidence: 0,
                samples: 0,
                recommendations: ['Provide content samples to analyze voice DNA']
            };
        }
        const profile = {
            linguistic: this.analyzeLinguistic(samples),
            tone: this.analyzeTone(samples),
            style: this.analyzeStyle(samples),
            structure: this.analyzeStructure(samples),
            signatures: this.extractSignatures(samples)
        };
        const confidence = Math.min(1, samples.length / 5); // More samples = higher confidence
        const recommendations = this.generateRecommendations(profile);
        return {
            profile,
            confidence,
            samples: samples.length,
            recommendations
        };
    }
    /**
     * Analyze linguistic patterns
     */
    analyzeLinguistic(samples) {
        const allText = samples.join(' ');
        const sentences = this.extractSentences(allText);
        const words = allText.split(/\s+/);
        // Sentence length analysis
        const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
        const avgSentenceLength = sentenceLengths.length > 0
            ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
            : 15;
        const variance = this.calculateVariance(sentenceLengths);
        const sentenceLengthVariation = Math.sqrt(variance) / avgSentenceLength;
        // Vocabulary analysis
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));
        const uniqueWordRatio = uniqueWords.size / words.length;
        const vocabularyLevel = this.assessVocabularyLevel(uniqueWords);
        // Punctuation analysis
        const punctuationStyle = {
            exclamations: (allText.match(/!/g) || []).length / sentences.length,
            questions: (allText.match(/\?/g) || []).length / sentences.length,
            ellipses: (allText.match(/\.\.\./g) || []).length / sentences.length,
            dashes: (allText.match(/—|--/g) || []).length / sentences.length,
            semicolons: (allText.match(/;/g) || []).length / sentences.length
        };
        return {
            avgSentenceLength: Math.round(avgSentenceLength),
            sentenceLengthVariation: Math.round(sentenceLengthVariation * 100) / 100,
            vocabularyLevel,
            uniqueWordRatio: Math.round(uniqueWordRatio * 100) / 100,
            punctuationStyle
        };
    }
    /**
     * Analyze tone attributes
     */
    analyzeTone(samples) {
        const allText = samples.join(' ').toLowerCase();
        // Formality analysis
        const informalWords = ['gonna', 'wanna', 'yeah', 'ok', 'okay', 'stuff', 'things', 'got'];
        const formalWords = ['therefore', 'moreover', 'furthermore', 'consequently', 'pursuant'];
        const informalCount = informalWords.filter(w => allText.includes(w)).length;
        const formalCount = formalWords.filter(w => allText.includes(w)).length;
        const formality = Math.min(1, Math.max(0, 0.5 + (formalCount - informalCount) * 0.1));
        // Emotion analysis
        const emotionWords = ['love', 'hate', 'amazing', 'terrible', 'wonderful', 'awful', 'excited', 'frustrated'];
        const emotionCount = emotionWords.filter(w => allText.includes(w)).length;
        const emotion = Math.min(1, emotionCount * 0.1);
        // Authority analysis
        const authorityPhrases = ['research shows', 'studies indicate', 'evidence suggests', 'it is clear', 'definitely'];
        const tentativePhrases = ['perhaps', 'maybe', 'might', 'could be', 'possibly'];
        const authorityCount = authorityPhrases.filter(p => allText.includes(p)).length;
        const tentativeCount = tentativePhrases.filter(p => allText.includes(p)).length;
        const authority = Math.min(1, Math.max(0, 0.5 + (authorityCount - tentativeCount) * 0.1));
        // Humor analysis
        const humorIndicators = ['haha', 'lol', '😄', '😂', 'joke', 'funny', 'hilarious'];
        const humorCount = humorIndicators.filter(h => allText.includes(h)).length;
        const humor = Math.min(1, humorCount * 0.05);
        // Energy analysis
        const energyWords = ['!', 'excited', 'amazing', 'incredible', 'wow', 'awesome', 'fantastic'];
        const energyCount = energyWords.filter(w => allText.includes(w)).length;
        const energy = Math.min(1, energyCount * 0.05);
        return {
            formality,
            emotion,
            authority,
            humor,
            energy
        };
    }
    /**
     * Analyze stylistic elements
     */
    analyzeStyle(samples) {
        const allText = samples.join(' ');
        // Metaphor usage
        const metaphorIndicators = ['like', 'as if', 'resembles', 'similar to', 'metaphorically'];
        const metaphorCount = metaphorIndicators.filter(m => allText.toLowerCase().includes(m)).length;
        const metaphorUsage = metaphorCount < 2 ? 'rare' : metaphorCount < 5 ? 'occasional' : 'frequent';
        // Storytelling detection
        const storyIndicators = ['once', 'I remember', 'there was', 'let me tell you', 'story'];
        const storytelling = storyIndicators.some(s => allText.toLowerCase().includes(s));
        // Personal anecdotes
        const personalPronouns = (allText.match(/\b(I|me|my|we|our)\b/gi) || []).length;
        const personalAnecdotes = personalPronouns > 10;
        // Data orientation
        const dataIndicators = /\d+%|\d+x|\$\d+|data|statistics|research|study/gi;
        const dataOriented = (allText.match(dataIndicators) || []).length > 3;
        // Conversational style
        const conversationalIndicators = ['you', "you're", "you'll", "let's", 'we'];
        const conversational = conversationalIndicators.filter(c => allText.toLowerCase().includes(c)).length > 3;
        // Academic citations
        const academicCitations = /\[\d+\]|\(\d{4}\)|et al\./g.test(allText);
        return {
            metaphorUsage,
            storytelling,
            personalAnecdotes,
            dataOriented,
            conversational,
            academicCitations
        };
    }
    /**
     * Analyze structural patterns
     */
    analyzeStructure(samples) {
        const paragraphs = samples.flatMap(s => s.split(/\n\n+/));
        const sentences = samples.flatMap(s => this.extractSentences(s));
        // Paragraph length
        const paragraphLengths = paragraphs.map(p => this.extractSentences(p).length);
        const avgParagraphLength = paragraphLengths.length > 0
            ? Math.round(paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length)
            : 4;
        // Opening style
        const firstSentences = samples.map(s => this.extractSentences(s)[0] || '');
        const openingStyle = this.detectOpeningStyle(firstSentences);
        // Closing style
        const lastSentences = samples.map(s => {
            const sents = this.extractSentences(s);
            return sents[sents.length - 1] || '';
        });
        const closingStyle = this.detectClosingStyle(lastSentences);
        // List usage
        const listCount = samples.filter(s => /^[\*\-\+•]\s+/gm.test(s) || /^\d+\.\s+/gm.test(s)).length;
        const listUsage = listCount < 2 ? 'minimal' : listCount < 5 ? 'moderate' : 'heavy';
        // Header frequency
        const headerCount = samples.filter(s => /^#{1,6}\s+/gm.test(s)).length;
        const headerFrequency = headerCount / samples.length;
        return {
            avgParagraphLength,
            openingStyle,
            closingStyle,
            listUsage,
            headerFrequency
        };
    }
    /**
     * Extract signature phrases and patterns
     */
    extractSignatures(samples) {
        const allText = samples.join(' ');
        const sentences = this.extractSentences(allText);
        // Extract recurring phrases (3+ words that appear multiple times)
        const phrases = [];
        const phraseMap = new Map();
        sentences.forEach(sentence => {
            const words = sentence.split(/\s+/);
            for (let i = 0; i < words.length - 2; i++) {
                const phrase = words.slice(i, i + 3).join(' ').toLowerCase();
                phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
            }
        });
        phraseMap.forEach((count, phrase) => {
            if (count >= 2 && !this.isCommonPhrase(phrase)) {
                phrases.push(phrase);
            }
        });
        // Extract transition words
        const transitionWords = [
            'however', 'therefore', 'moreover', 'furthermore', 'consequently',
            'meanwhile', 'nevertheless', 'nonetheless', 'accordingly', 'thus',
            'hence', 'subsequently', 'alternatively', 'conversely'
        ];
        const usedTransitions = transitionWords.filter(t => allText.toLowerCase().includes(t));
        // Extract opening patterns
        const openings = sentences.slice(0, Math.min(5, sentences.length))
            .map(s => this.extractPattern(s))
            .filter((p, i, arr) => arr.indexOf(p) === i); // Unique only
        // Extract closing patterns
        const closings = sentences.slice(-Math.min(5, sentences.length))
            .map(s => this.extractPattern(s))
            .filter((p, i, arr) => arr.indexOf(p) === i);
        return {
            phrases: phrases.slice(0, 10),
            transitions: usedTransitions,
            openings: openings.slice(0, 5),
            closings: closings.slice(0, 5)
        };
    }
    // Helper methods
    extractSentences(text) {
        return text
            .replace(/\n+/g, ' ')
            .split(/[.!?]+/)
            .map(s => s.trim())
            .filter(s => s.length > 10);
    }
    calculateVariance(numbers) {
        if (numbers.length === 0)
            return 0;
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
    }
    assessVocabularyLevel(uniqueWords) {
        const advancedWords = [
            'paradigm', 'methodology', 'synthesis', 'correlation', 'implementation',
            'optimization', 'architecture', 'framework', 'algorithm', 'heuristic'
        ];
        const advancedCount = advancedWords.filter(w => uniqueWords.has(w)).length;
        if (advancedCount >= 5)
            return 'expert';
        if (advancedCount >= 3)
            return 'advanced';
        if (advancedCount >= 1)
            return 'moderate';
        return 'simple';
    }
    detectOpeningStyle(sentences) {
        const patterns = {
            question: sentences.filter(s => s.endsWith('?')).length,
            story: sentences.filter(s => /once|remember|was|were/i.test(s)).length,
            statistic: sentences.filter(s => /\d+%|\d+x|research|study/i.test(s)).length,
            quote: sentences.filter(s => /^["']|said|according/i.test(s)).length,
            statement: sentences.length
        };
        const max = Math.max(...Object.values(patterns));
        const style = Object.entries(patterns).find(([_, count]) => count === max)?.[0];
        return style || 'statement';
    }
    detectClosingStyle(sentences) {
        const patterns = {
            'call-to-action': sentences.filter(s => /should|must|need to|let's|join/i.test(s)).length,
            question: sentences.filter(s => s.endsWith('?')).length,
            inspiration: sentences.filter(s => /will|future|possible|dream|vision/i.test(s)).length,
            summary: sentences.filter(s => /in conclusion|to sum|overall|finally/i.test(s)).length
        };
        const max = Math.max(...Object.values(patterns));
        const style = Object.entries(patterns).find(([_, count]) => count === max)?.[0];
        return style || 'summary';
    }
    isCommonPhrase(phrase) {
        const common = [
            'in the', 'of the', 'to the', 'and the', 'on the',
            'is a', 'it is', 'this is', 'that is', 'there is'
        ];
        return common.includes(phrase);
    }
    extractPattern(sentence) {
        // Simplify sentence to pattern
        return sentence
            .replace(/\b\w{1,3}\b/g, '_') // Replace short words with _
            .replace(/\b\w+ing\b/g, 'ING') // Replace -ing words
            .replace(/\b\w+ed\b/g, 'ED') // Replace -ed words
            .replace(/\b\w+ly\b/g, 'LY') // Replace -ly words
            .substring(0, 30); // Take first 30 chars
    }
    generateRecommendations(profile) {
        const recommendations = [];
        // Sentence variation
        if (profile.linguistic.sentenceLengthVariation < 0.2) {
            recommendations.push('Vary sentence lengths more for better rhythm');
        }
        // Engagement
        if (profile.tone.energy < 0.3 && profile.tone.emotion < 0.3) {
            recommendations.push('Consider adding more energy or emotion to increase engagement');
        }
        // Structure
        if (profile.structure.avgParagraphLength > 6) {
            recommendations.push('Break up long paragraphs for better readability');
        }
        // Style consistency
        if (profile.style.conversational && profile.tone.formality > 0.7) {
            recommendations.push('Balance conversational style with formal tone');
        }
        return recommendations;
    }
    /**
     * Apply voice profile to new content
     */
    applyVoice(content, profile) {
        let modified = content;
        // Adjust sentence length
        if (profile.linguistic.avgSentenceLength < 12) {
            // Prefer shorter sentences
            modified = this.shortenSentences(modified);
        }
        else if (profile.linguistic.avgSentenceLength > 20) {
            // Prefer longer sentences
            modified = this.combineSentences(modified);
        }
        // Apply tone adjustments
        if (profile.tone.conversational) {
            modified = this.makeConversational(modified);
        }
        if (profile.tone.formality > 0.7) {
            modified = this.makeFormal(modified);
        }
        // Add signature elements
        if (profile.signatures.transitions.length > 0) {
            modified = this.addTransitions(modified, profile.signatures.transitions);
        }
        return modified;
    }
    shortenSentences(content) {
        // Split long sentences at conjunctions
        return content.replace(/,\s+(and|but|or)\s+/g, '. $1 ');
    }
    combineSentences(content) {
        // Combine short adjacent sentences
        return content.replace(/\.\s+([A-Z][^.]{10,30}\.)/g, ', $1');
    }
    makeConversational(content) {
        // Add conversational elements
        return content
            .replace(/\bOne must\b/g, 'You should')
            .replace(/\bIt is important\b/g, "It's important")
            .replace(/\bDo not\b/g, "Don't");
    }
    makeFormal(content) {
        // Remove informal elements
        return content
            .replace(/\bdon't\b/g, 'do not')
            .replace(/\bcan't\b/g, 'cannot')
            .replace(/\bwon't\b/g, 'will not');
    }
    addTransitions(content, transitions) {
        // Add transitions between paragraphs
        const paragraphs = content.split('\n\n');
        const modified = [paragraphs[0]];
        for (let i = 1; i < paragraphs.length; i++) {
            if (Math.random() > 0.5 && transitions.length > 0) {
                const transition = transitions[Math.floor(Math.random() * transitions.length)];
                modified.push(`${transition.charAt(0).toUpperCase() + transition.slice(1)}, ${paragraphs[i]}`);
            }
            else {
                modified.push(paragraphs[i]);
            }
        }
        return modified.join('\n\n');
    }
}
exports.VoiceDNAAnalyzer = VoiceDNAAnalyzer;
exports.default = VoiceDNAAnalyzer;
//# sourceMappingURL=voice-dna.js.map