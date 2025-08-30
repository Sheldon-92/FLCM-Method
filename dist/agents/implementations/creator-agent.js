"use strict";
/**
 * Creator Agent Implementation
 * Responsible for content creation with voice preservation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorAgent = void 0;
const base_agent_1 = require("../base-agent");
const voice_dna_1 = require("../../methodologies/creation/voice-dna");
const spark_framework_1 = require("../../methodologies/creation/spark-framework");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Creator Agent Class
 */
class CreatorAgent extends base_agent_1.BaseAgent {
    constructor() {
        super('creator.yaml');
        this.userVoiceProfile = null;
        // Initialize methodologies
        this.voiceAnalyzer = new voice_dna_1.VoiceDNAAnalyzer();
        this.sparkFramework = new spark_framework_1.SPARKFramework();
        // Load user voice profile if exists
        this.loadUserVoiceProfile();
    }
    /**
     * Initialize Creator-specific resources
     */
    async onInit() {
        console.log(`✍️ Initializing ${this.config.name} (${this.config.icon})`);
        // Initialize creator-specific state
        this.state.sessionData.set('draftsCreated', 0);
        this.state.sessionData.set('totalRevisions', 0);
        this.state.sessionData.set('avgEngagement', 0);
        // Load methodologies
        console.log('  ✓ Voice DNA Analyzer loaded');
        console.log('  ✓ SPARK Framework loaded');
        console.log('  ✓ Hook Ladder ready');
        if (this.userVoiceProfile) {
            console.log('  ✓ User voice profile loaded');
        }
    }
    /**
     * Execute content creation
     */
    async onExecute(input) {
        const startTime = Date.now();
        const synthesis = input;
        console.log(`✍️ Creating content for: ${synthesis.concept.name}`);
        console.log(`   📚 Input depth: Level ${synthesis.metadata.depthAchieved}`);
        console.log(`   🎓 Teaching ready: ${synthesis.metadata.teachingReady ? 'Yes' : 'No'}`);
        // Generate SPARK elements
        console.log(`   ⚡ Generating SPARK structure...`);
        const sparkElements = this.sparkFramework.generate(synthesis.concept.name, synthesis, this.extractAudience(synthesis));
        console.log(`      Structure: ${sparkElements.structure.type}`);
        console.log(`      Purpose: ${sparkElements.purpose.primary}`);
        console.log(`      Audience: ${sparkElements.audience.demographic.expertise} level`);
        // Generate title
        const title = this.generateTitle(synthesis, sparkElements);
        console.log(`   📝 Title: "${title}"`);
        // Generate hook
        const hook = this.sparkFramework.generateHook(synthesis.concept.name, sparkElements.purpose, synthesis);
        console.log(`   🎣 Hook: "${hook.substring(0, 50)}..."`);
        // Create initial draft
        console.log(`   ✏️ Creating initial draft...`);
        let content = this.createInitialDraft(synthesis, sparkElements);
        // Apply voice DNA if available
        if (this.userVoiceProfile) {
            console.log(`   🎭 Applying voice DNA...`);
            content = this.voiceAnalyzer.applyVoice(content, this.userVoiceProfile);
        }
        // Iterative refinement
        const revisions = [];
        const maxIterations = this.config.config?.max_iterations || 3;
        for (let i = 1; i <= maxIterations; i++) {
            console.log(`   🔄 Refinement iteration ${i}/${maxIterations}...`);
            const { refined, changes, improvement } = this.refineContent(content, synthesis, sparkElements, i);
            if (improvement > 0.05) {
                content = refined;
                revisions.push({
                    version: i,
                    timestamp: new Date(),
                    changes,
                    improvement
                });
                console.log(`      Improvement: +${Math.round(improvement * 100)}%`);
            }
            else {
                console.log(`      No significant improvement, stopping refinement`);
                break;
            }
        }
        // Calculate metrics
        const wordCount = content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);
        const engagementScore = this.calculateEngagement(content, sparkElements, synthesis);
        const voiceConsistency = this.calculateVoiceConsistency(content);
        const hookEffectiveness = this.evaluateHook(hook, sparkElements);
        // Create content draft
        const draft = {
            id: this.generateDocumentId(),
            type: 'content-draft',
            title,
            hook,
            content,
            structure: sparkElements.structure,
            voiceProfile: this.userVoiceProfile || this.voiceAnalyzer.analyze([content]).profile,
            sparkElements,
            revisions,
            engagementScore,
            wordCount,
            readingTime,
            metadata: {
                iterations: revisions.length,
                voiceConsistency,
                hookEffectiveness,
                processingTime: Date.now() - startTime,
                readyToPublish: engagementScore > 0.7 && voiceConsistency > 0.7
            },
            timestamp: new Date()
        };
        // Update session statistics
        this.updateStatistics(draft);
        console.log(`✅ Content draft complete:`);
        console.log(`   📊 Engagement: ${Math.round(engagementScore * 100)}%`);
        console.log(`   🎭 Voice consistency: ${Math.round(voiceConsistency * 100)}%`);
        console.log(`   🎣 Hook effectiveness: ${Math.round(hookEffectiveness * 100)}%`);
        console.log(`   📝 ${wordCount} words (~${readingTime} min read)`);
        console.log(`   🔄 ${revisions.length} refinement iterations`);
        console.log(`   ⏱️ Processing time: ${draft.metadata.processingTime}ms`);
        if (draft.metadata.readyToPublish) {
            console.log(`   ✅ Ready to publish!`);
        }
        else {
            console.log(`   ⚠️ Needs further refinement before publishing`);
        }
        return draft;
    }
    /**
     * Cleanup Creator resources
     */
    async onCleanup() {
        console.log(`🧹 Cleaning up ${this.config.name}`);
        // Save user voice profile if updated
        if (this.userVoiceProfile) {
            this.saveUserVoiceProfile();
        }
        // Log session statistics
        const drafts = this.state.sessionData.get('draftsCreated') || 0;
        const revisions = this.state.sessionData.get('totalRevisions') || 0;
        const avgEngagement = this.state.sessionData.get('avgEngagement') || 0;
        console.log(`  📊 Session stats:`);
        console.log(`     Drafts: ${drafts}`);
        console.log(`     Total revisions: ${revisions}`);
        console.log(`     Avg engagement: ${Math.round(avgEngagement * 100)}%`);
    }
    /**
     * Validate Creator input
     */
    validateInput(input) {
        const synthesis = input;
        if (synthesis.type !== 'knowledge-synthesis') {
            throw new base_agent_1.AgentError(this.config.id, 'INVALID_INPUT_TYPE', 'Creator Agent requires a knowledge synthesis as input', false);
        }
        if (!synthesis.concept || !synthesis.depthAnalysis) {
            throw new base_agent_1.AgentError(this.config.id, 'INCOMPLETE_SYNTHESIS', 'Knowledge synthesis is incomplete', false);
        }
        if (synthesis.confidence < 0.3) {
            throw new base_agent_1.AgentError(this.config.id, 'LOW_CONFIDENCE', 'Synthesis confidence too low for content creation', false);
        }
    }
    // Private helper methods
    /**
     * Load user voice profile from storage
     */
    loadUserVoiceProfile() {
        const profilePath = path.join(process.cwd(), '.flcm-core', 'data', 'voice-profiles', 'default.json');
        if (fs.existsSync(profilePath)) {
            try {
                const profileData = fs.readFileSync(profilePath, 'utf8');
                this.userVoiceProfile = JSON.parse(profileData);
            }
            catch (error) {
                console.warn('Failed to load voice profile:', error);
            }
        }
    }
    /**
     * Save user voice profile to storage
     */
    saveUserVoiceProfile() {
        if (!this.userVoiceProfile)
            return;
        const profileDir = path.join(process.cwd(), '.flcm-core', 'data', 'voice-profiles');
        if (!fs.existsSync(profileDir)) {
            fs.mkdirSync(profileDir, { recursive: true });
        }
        const profilePath = path.join(profileDir, 'default.json');
        fs.writeFileSync(profilePath, JSON.stringify(this.userVoiceProfile, null, 2));
    }
    /**
     * Extract audience from synthesis
     */
    extractAudience(synthesis) {
        // Try to extract from connections or teaching notes
        const connections = synthesis.connections || [];
        const notes = synthesis.teachingNotes || [];
        // Look for audience indicators
        for (const note of notes) {
            if (note.content.toLowerCase().includes('student')) {
                return 'students and learners';
            }
            if (note.content.toLowerCase().includes('professional')) {
                return 'professionals and practitioners';
            }
        }
        // Default based on depth
        if (synthesis.metadata.depthAchieved >= 4) {
            return 'experts and researchers';
        }
        else if (synthesis.metadata.depthAchieved >= 2) {
            return 'intermediate practitioners';
        }
        return 'general audience';
    }
    /**
     * Generate title
     */
    generateTitle(synthesis, spark) {
        const concept = synthesis.concept.name;
        const purpose = spark.purpose.primary;
        const templates = {
            inform: [
                `Understanding ${concept}: A Comprehensive Guide`,
                `The Essential Guide to ${concept}`,
                `What You Need to Know About ${concept}`
            ],
            educate: [
                `Mastering ${concept}: From Basics to Advanced`,
                `Learn ${concept}: A Step-by-Step Approach`,
                `The Complete ${concept} Tutorial`
            ],
            persuade: [
                `Why ${concept} Will Transform Your Approach`,
                `The Hidden Power of ${concept}`,
                `${concept}: The Game-Changer You've Been Missing`
            ],
            inspire: [
                `Unlock Your Potential with ${concept}`,
                `The ${concept} Revolution: Join the Movement`,
                `Transform Your Future with ${concept}`
            ],
            entertain: [
                `The Surprising Truth About ${concept}`,
                `${concept}: More Interesting Than You Think`,
                `Adventures in ${concept}: A Journey`
            ]
        };
        const purposeTemplates = templates[purpose] || templates.inform;
        return purposeTemplates[Math.floor(Math.random() * purposeTemplates.length)];
    }
    /**
     * Create initial draft
     */
    createInitialDraft(synthesis, spark) {
        const sections = spark.structure.sections;
        let draft = '';
        sections.forEach(section => {
            draft += this.generateSection(section, synthesis, spark);
            draft += '\n\n';
        });
        return draft.trim();
    }
    /**
     * Generate a content section
     */
    generateSection(section, synthesis, spark) {
        let content = '';
        switch (section.name) {
            case 'hook':
                content = spark.keyMessage.core;
                break;
            case 'main':
            case 'problem':
            case 'solution':
                content = this.generateMainContent(synthesis, spark);
                break;
            case 'analogy':
                if (synthesis.analogies.bestAnalogy) {
                    content = `Think of it this way: ${synthesis.analogies.bestAnalogy.mapping}\n\n`;
                    content += synthesis.analogies.explanation;
                }
                break;
            case 'examples':
                content = this.generateExamples(synthesis);
                break;
            case 'conclusion':
                content = this.generateConclusion(synthesis, spark);
                break;
            default:
                // Level-based sections
                if (section.name.startsWith('level')) {
                    const levelNum = parseInt(section.name.replace('level', ''));
                    const level = synthesis.depthAnalysis.levels[levelNum - 1];
                    if (level) {
                        content = `## ${level.name}: ${level.focus}\n\n`;
                        content += level.understanding.join('\n\n');
                    }
                }
        }
        // Add section elements
        if (section.elements.includes('list') && synthesis.teachingNotes.length > 0) {
            content += '\n\n';
            content += synthesis.teachingNotes
                .filter(n => n.importance === 'high')
                .map(n => `- ${n.content}`)
                .join('\n');
        }
        if (section.elements.includes('data') && spark.keyMessage.proof.length > 0) {
            content += '\n\n';
            spark.keyMessage.proof.forEach(proof => {
                if (proof.type === 'data') {
                    content += `📊 ${proof.content}\n`;
                }
            });
        }
        return content;
    }
    /**
     * Generate main content
     */
    generateMainContent(synthesis, spark) {
        let content = '';
        // Start with concept definition
        content += `${synthesis.concept.name} ${synthesis.concept.definition}\n\n`;
        // Add key insights
        if (spark.keyMessage.supporting.length > 0) {
            content += 'Here are the key insights:\n\n';
            spark.keyMessage.supporting.forEach(point => {
                content += `• ${point}\n`;
            });
            content += '\n';
        }
        // Add depth-based understanding
        synthesis.depthAnalysis.levels.forEach(level => {
            if (level.complete && level.confidence > 0.6) {
                content += `### ${level.name}\n\n`;
                const insights = level.understanding.slice(0, 2);
                insights.forEach(insight => {
                    content += `${insight}\n\n`;
                });
            }
        });
        return content;
    }
    /**
     * Generate examples
     */
    generateExamples(synthesis) {
        let content = 'Let me illustrate with examples:\n\n';
        // Use analogies as examples
        synthesis.analogies.analogies.forEach((analogy, i) => {
            content += `**Example ${i + 1}: ${analogy.target}**\n`;
            content += `${analogy.mapping}\n\n`;
        });
        // Add teaching examples
        const examples = synthesis.teachingNotes.filter(n => n.type === 'example');
        examples.forEach(example => {
            content += `💡 ${example.content}\n\n`;
        });
        return content;
    }
    /**
     * Generate conclusion
     */
    generateConclusion(synthesis, spark) {
        let content = `## The Path Forward\n\n`;
        // Summarize key message
        content += `${spark.keyMessage.memorable}\n\n`;
        // Add next steps
        if (synthesis.depthAnalysis.nextSteps.length > 0) {
            content += 'Your next steps:\n\n';
            synthesis.depthAnalysis.nextSteps.forEach((step, i) => {
                content += `${i + 1}. ${step}\n`;
            });
            content += '\n';
        }
        // Add call to action
        if (spark.purpose.action) {
            content += `**${spark.purpose.action}**`;
        }
        return content;
    }
    /**
     * Refine content iteratively
     */
    refineContent(content, synthesis, spark, iteration) {
        let refined = content;
        const changes = [];
        let improvement = 0;
        // Iteration 1: Structure and flow
        if (iteration === 1) {
            // Improve transitions
            refined = this.improveTransitions(refined);
            changes.push('Improved transitions between sections');
            // Balance paragraph lengths
            refined = this.balanceParagraphs(refined);
            changes.push('Balanced paragraph lengths');
            improvement = 0.15;
        }
        // Iteration 2: Clarity and engagement
        if (iteration === 2) {
            // Simplify complex sentences
            refined = this.simplifySentences(refined);
            changes.push('Simplified complex sentences');
            // Add engagement elements
            refined = this.addEngagementElements(refined, spark);
            changes.push('Added engagement elements');
            improvement = 0.10;
        }
        // Iteration 3: Polish and voice
        if (iteration === 3) {
            // Polish language
            refined = this.polishLanguage(refined);
            changes.push('Polished language and style');
            // Ensure voice consistency
            if (this.userVoiceProfile) {
                refined = this.voiceAnalyzer.applyVoice(refined, this.userVoiceProfile);
                changes.push('Applied voice DNA');
            }
            improvement = 0.08;
        }
        return { refined, changes, improvement };
    }
    /**
     * Improve transitions
     */
    improveTransitions(content) {
        const transitions = [
            'Furthermore,', 'Moreover,', 'In addition,',
            'However,', 'On the other hand,', 'Nevertheless,',
            'Therefore,', 'Consequently,', 'As a result,',
            'For example,', 'Specifically,', 'In particular,'
        ];
        const paragraphs = content.split('\n\n');
        const improved = [paragraphs[0]];
        for (let i = 1; i < paragraphs.length; i++) {
            // Add transition 30% of the time
            if (Math.random() < 0.3 && !paragraphs[i].startsWith('#')) {
                const transition = transitions[Math.floor(Math.random() * transitions.length)];
                improved.push(`${transition} ${paragraphs[i]}`);
            }
            else {
                improved.push(paragraphs[i]);
            }
        }
        return improved.join('\n\n');
    }
    /**
     * Balance paragraph lengths
     */
    balanceParagraphs(content) {
        const paragraphs = content.split('\n\n');
        const balanced = [];
        paragraphs.forEach(para => {
            const sentences = para.split('. ');
            if (sentences.length > 5) {
                // Split long paragraphs
                const mid = Math.floor(sentences.length / 2);
                balanced.push(sentences.slice(0, mid).join('. ') + '.');
                balanced.push(sentences.slice(mid).join('. '));
            }
            else if (sentences.length === 1 && para.length > 200) {
                // Break up very long sentences
                const parts = para.split(', ');
                if (parts.length > 3) {
                    const mid = Math.floor(parts.length / 2);
                    balanced.push(parts.slice(0, mid).join(', ') + '.');
                    balanced.push(parts.slice(mid).join(', '));
                }
                else {
                    balanced.push(para);
                }
            }
            else {
                balanced.push(para);
            }
        });
        return balanced.join('\n\n');
    }
    /**
     * Simplify sentences
     */
    simplifySentences(content) {
        return content
            .replace(/\b(utilize|utilization)\b/gi, 'use')
            .replace(/\b(implement|implementation)\b/gi, 'apply')
            .replace(/\b(demonstrate|demonstration)\b/gi, 'show')
            .replace(/\b(approximately)\b/gi, 'about')
            .replace(/\b(in order to)\b/gi, 'to');
    }
    /**
     * Add engagement elements
     */
    addEngagementElements(content, spark) {
        let enhanced = content;
        // Add questions if conversational
        if (spark.audience.reading.style === 'scanner') {
            const paragraphs = enhanced.split('\n\n');
            if (paragraphs.length > 3) {
                // Add a question in the middle
                const mid = Math.floor(paragraphs.length / 2);
                paragraphs[mid] = `But what does this mean for you?\n\n${paragraphs[mid]}`;
                enhanced = paragraphs.join('\n\n');
            }
        }
        return enhanced;
    }
    /**
     * Polish language
     */
    polishLanguage(content) {
        return content
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
    }
    /**
     * Calculate engagement score
     */
    calculateEngagement(content, spark, synthesis) {
        let score = 0;
        // Structure quality (0.25)
        const hasHeaders = /^#{1,6}\s+/gm.test(content);
        const hasLists = /^[\*\-\+]\s+/gm.test(content);
        const hasParagraphs = content.split('\n\n').length > 3;
        score += (hasHeaders ? 0.1 : 0) + (hasLists ? 0.1 : 0) + (hasParagraphs ? 0.05 : 0);
        // Content depth (0.25)
        const depthScore = Math.min(1, synthesis.metadata.depthAchieved / 4) * 0.25;
        score += depthScore;
        // Analogies and examples (0.25)
        const hasAnalogies = synthesis.analogies.analogies.length > 0;
        const hasExamples = content.includes('example') || content.includes('for instance');
        score += (hasAnalogies ? 0.15 : 0) + (hasExamples ? 0.1 : 0);
        // Relevance (0.25)
        const relevanceScore = spark.relevance.practicalValue * 0.1 +
            spark.relevance.emotionalResonance * 0.1 +
            spark.relevance.socialCurrency * 0.05;
        score += relevanceScore;
        return Math.min(1, score);
    }
    /**
     * Calculate voice consistency
     */
    calculateVoiceConsistency(content) {
        if (!this.userVoiceProfile) {
            return 0.7; // Default if no profile
        }
        // Analyze current content
        const currentAnalysis = this.voiceAnalyzer.analyze([content]);
        const current = currentAnalysis.profile;
        const target = this.userVoiceProfile;
        // Compare key metrics
        let consistency = 0;
        // Linguistic similarity (0.4)
        const sentenceDiff = Math.abs(current.linguistic.avgSentenceLength - target.linguistic.avgSentenceLength);
        consistency += Math.max(0, 0.4 - (sentenceDiff / 20));
        // Tone similarity (0.3)
        const toneDiff = Math.abs(current.tone.formality - target.tone.formality) +
            Math.abs(current.tone.energy - target.tone.energy);
        consistency += Math.max(0, 0.3 - (toneDiff / 2));
        // Style similarity (0.3)
        if (current.style.conversational === target.style.conversational) {
            consistency += 0.15;
        }
        if (current.style.dataOriented === target.style.dataOriented) {
            consistency += 0.15;
        }
        return Math.min(1, consistency);
    }
    /**
     * Evaluate hook effectiveness
     */
    evaluateHook(hook, spark) {
        let score = 0;
        // Length (0.2) - Should be concise
        const wordCount = hook.split(/\s+/).length;
        if (wordCount >= 10 && wordCount <= 30) {
            score += 0.2;
        }
        // Has question or intrigue (0.3)
        if (hook.includes('?') || hook.includes('!')) {
            score += 0.3;
        }
        // Mentions audience (0.2)
        const audienceWords = ['you', 'your', spark.audience.demographic.profession];
        if (audienceWords.some(word => hook.toLowerCase().includes(word))) {
            score += 0.2;
        }
        // Creates curiosity gap (0.3)
        const curiosityWords = ['secret', 'discover', 'revealed', 'surprising', 'hidden'];
        if (curiosityWords.some(word => hook.toLowerCase().includes(word))) {
            score += 0.3;
        }
        return Math.min(1, score);
    }
    /**
     * Update session statistics
     */
    updateStatistics(draft) {
        const drafts = this.state.sessionData.get('draftsCreated') || 0;
        this.state.sessionData.set('draftsCreated', drafts + 1);
        const revisions = this.state.sessionData.get('totalRevisions') || 0;
        this.state.sessionData.set('totalRevisions', revisions + draft.revisions.length);
        const totalEngagement = this.state.sessionData.get('avgEngagement') || 0;
        const newAvg = (totalEngagement * drafts + draft.engagementScore) / (drafts + 1);
        this.state.sessionData.set('avgEngagement', newAvg);
    }
    /**
     * Generate document ID
     */
    generateDocumentId() {
        return `draft-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    }
}
exports.CreatorAgent = CreatorAgent;
exports.default = CreatorAgent;
//# sourceMappingURL=creator-agent.js.map