"use strict";
/**
 * Scholar Agent Implementation
 * Responsible for deep learning and knowledge synthesis
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
exports.ScholarAgent = void 0;
const base_agent_1 = require("../base-agent");
const progressive_depth_1 = require("../../methodologies/learning/progressive-depth");
const analogy_generator_1 = require("../../methodologies/learning/analogy-generator");
const crypto = __importStar(require("crypto"));
/**
 * Scholar Agent Class
 */
class ScholarAgent extends base_agent_1.BaseAgent {
    constructor() {
        super('scholar.yaml');
        // Initialize methodologies
        this.progressiveDepth = new progressive_depth_1.ProgressiveDepthLearning();
        this.analogyGenerator = new analogy_generator_1.AnalogyGenerator();
    }
    /**
     * Initialize Scholar-specific resources
     */
    async onInit() {
        console.log(`🎓 Initializing ${this.config.name} (${this.config.icon})`);
        // Initialize scholar-specific state
        this.state.sessionData.set('conceptsProcessed', 0);
        this.state.sessionData.set('totalDepthAchieved', 0);
        this.state.sessionData.set('analogiesCreated', 0);
        // Load methodologies
        console.log('  ✓ Progressive Depth Learning loaded');
        console.log('  ✓ Analogy Generator loaded');
        console.log('  ✓ Socratic Questioning ready');
    }
    /**
     * Execute knowledge synthesis
     */
    async onExecute(input) {
        const startTime = Date.now();
        const brief = input;
        console.log(`📚 Processing content brief: ${brief.summary.mainTopic}`);
        console.log(`   📊 Input quality: ${brief.metadata.quality}`);
        console.log(`   🎯 RICE score: ${brief.riceScore.total}`);
        // Extract main concept from brief
        const concept = this.extractConcept(brief);
        console.log(`   🔍 Main concept: ${concept.name}`);
        // Perform progressive depth analysis
        console.log(`   🧠 Starting progressive depth learning...`);
        const depthAnalysis = this.progressiveDepth.analyze(concept, brief.content, brief.signals.keyInsights);
        console.log(`   📈 Depth achieved: Level ${depthAnalysis.currentDepth}/5`);
        depthAnalysis.levels.forEach(level => {
            if (level.complete) {
                console.log(`      ✓ Level ${level.level} (${level.name}): ${level.confidence * 100}% confidence`);
            }
        });
        // Generate analogies
        console.log(`   🔗 Generating analogies...`);
        const analogies = this.analogyGenerator.generate(concept.name, brief.content, this.config.config?.analogy_count || 3);
        if (analogies.bestAnalogy) {
            console.log(`      Best analogy: ${concept.name} is like ${analogies.bestAnalogy.target}`);
        }
        // Generate teaching questions
        const questions = this.progressiveDepth.generateQuestions(depthAnalysis);
        const totalQuestions = Array.from(questions.values()).flat().length;
        console.log(`   ❓ Generated ${totalQuestions} teaching questions`);
        // Create teaching notes
        const teachingNotes = this.createTeachingNotes(depthAnalysis, analogies, brief);
        // Identify concept connections
        const connections = this.identifyConnections(concept, brief, depthAnalysis);
        // Calculate overall confidence
        const confidence = this.calculateConfidence(depthAnalysis, analogies, brief.riceScore);
        // Create knowledge synthesis
        const synthesis = {
            id: this.generateDocumentId(),
            type: 'knowledge-synthesis',
            content: this.generateSynthesisContent(depthAnalysis, analogies),
            concept,
            depthAnalysis,
            analogies,
            questions,
            teachingNotes,
            connections,
            confidence,
            metadata: {
                depthAchieved: depthAnalysis.currentDepth,
                analogiesGenerated: analogies.analogies.length,
                questionsCreated: totalQuestions,
                processingTime: Date.now() - startTime,
                teachingReady: depthAnalysis.teachingReady
            },
            timestamp: new Date()
        };
        // Update session statistics
        this.updateStatistics(synthesis);
        console.log(`✅ Knowledge synthesis complete:`);
        console.log(`   🎓 Teaching ready: ${synthesis.metadata.teachingReady ? 'Yes' : 'No'}`);
        console.log(`   💪 Confidence: ${Math.round(confidence * 100)}%`);
        console.log(`   ⏱️ Processing time: ${synthesis.metadata.processingTime}ms`);
        if (depthAnalysis.gaps.length > 0) {
            console.log(`   ⚠️ Knowledge gaps identified:`);
            depthAnalysis.gaps.forEach(gap => console.log(`      - ${gap}`));
        }
        return synthesis;
    }
    /**
     * Cleanup Scholar resources
     */
    async onCleanup() {
        console.log(`🧹 Cleaning up ${this.config.name}`);
        // Log session statistics
        const processed = this.state.sessionData.get('conceptsProcessed') || 0;
        const totalDepth = this.state.sessionData.get('totalDepthAchieved') || 0;
        const analogies = this.state.sessionData.get('analogiesCreated') || 0;
        console.log(`  📊 Session stats:`);
        console.log(`     Concepts: ${processed}`);
        console.log(`     Avg depth: ${processed > 0 ? (totalDepth / processed).toFixed(1) : 0}`);
        console.log(`     Analogies: ${analogies}`);
    }
    /**
     * Validate Scholar input
     */
    validateInput(input) {
        const brief = input;
        if (brief.type !== 'content-brief') {
            throw new base_agent_1.AgentError(this.config.id, 'INVALID_INPUT_TYPE', 'Scholar Agent requires a content brief as input', false);
        }
        if (!brief.content || brief.content.length < 100) {
            throw new base_agent_1.AgentError(this.config.id, 'INSUFFICIENT_CONTENT', 'Content is too short for meaningful synthesis', false);
        }
        if (brief.riceScore.total < 20) {
            throw new base_agent_1.AgentError(this.config.id, 'LOW_QUALITY_INPUT', 'Content quality is too low for synthesis (RICE < 20)', false);
        }
    }
    // Private helper methods
    /**
     * Extract main concept from content brief
     */
    extractConcept(brief) {
        // Extract from main topic
        const name = brief.summary.mainTopic;
        // Build definition from key insights
        const definition = brief.signals.keyInsights.length > 0
            ? brief.signals.keyInsights[0]
            : `${name} is a concept related to ${brief.summary.targetAudience}`;
        // Extract context
        const context = brief.summary.keyPoints.join(' ');
        // Calculate importance based on RICE score
        const importance = Math.min(1, brief.riceScore.total / 100);
        return {
            name,
            definition,
            context,
            importance
        };
    }
    /**
     * Generate synthesis content
     */
    generateSynthesisContent(depthAnalysis, analogies) {
        let content = `# Knowledge Synthesis: ${depthAnalysis.concept.name}\n\n`;
        // Add definition
        content += `## Definition\n${depthAnalysis.concept.definition}\n\n`;
        // Add progressive understanding
        content += `## Progressive Understanding\n\n`;
        depthAnalysis.levels.forEach(level => {
            if (level.complete) {
                content += `### Level ${level.level}: ${level.name} (${level.focus})\n`;
                level.understanding.forEach(item => {
                    content += `- ${item}\n`;
                });
                content += `\n`;
            }
        });
        // Add analogies
        if (analogies.analogies.length > 0) {
            content += `## Analogies\n\n`;
            content += analogies.explanation + '\n\n';
            analogies.analogies.forEach(analogy => {
                content += `- **${analogy.target}** (${analogy.domain}): ${analogy.mapping}\n`;
            });
            content += `\n`;
        }
        // Add next steps
        if (depthAnalysis.nextSteps.length > 0) {
            content += `## Next Learning Steps\n\n`;
            depthAnalysis.nextSteps.forEach(step => {
                content += `- ${step}\n`;
            });
        }
        return content;
    }
    /**
     * Create teaching notes
     */
    createTeachingNotes(depthAnalysis, analogies, brief) {
        const notes = [];
        // Add explanation for each completed level
        depthAnalysis.levels.forEach(level => {
            if (level.complete) {
                notes.push({
                    level: level.level,
                    type: 'explanation',
                    content: `Focus on ${level.focus.toLowerCase()}: ${level.understanding[0] || 'Understanding established'}`,
                    importance: level.level <= 2 ? 'high' : 'medium'
                });
            }
        });
        // Add best analogy as example
        if (analogies.bestAnalogy) {
            notes.push({
                level: 1,
                type: 'example',
                content: `Think of it like a ${analogies.bestAnalogy.target}: ${analogies.bestAnalogy.mapping}`,
                importance: 'high'
            });
        }
        // Add exercises based on depth
        if (depthAnalysis.currentDepth >= 2) {
            notes.push({
                level: 2,
                type: 'exercise',
                content: `Try explaining how ${depthAnalysis.concept.name} works to someone unfamiliar with it`,
                importance: 'medium'
            });
        }
        if (depthAnalysis.currentDepth >= 3) {
            notes.push({
                level: 3,
                type: 'exercise',
                content: `Identify three real-world applications of ${depthAnalysis.concept.name}`,
                importance: 'medium'
            });
        }
        // Add warnings for gaps
        depthAnalysis.gaps.forEach(gap => {
            notes.push({
                level: 0,
                type: 'warning',
                content: gap,
                importance: 'low'
            });
        });
        return notes;
    }
    /**
     * Identify concept connections
     */
    identifyConnections(concept, brief, depthAnalysis) {
        const connections = [];
        // Extract from patterns
        brief.signals.extractedPatterns.forEach(pattern => {
            if (pattern.includes('relates to') || pattern.includes('connects')) {
                const related = pattern.replace(/.*(?:relates to|connects to)\s*/i, '').trim();
                connections.push({
                    relatedConcept: related,
                    relationshipType: 'related',
                    strength: 0.7,
                    explanation: pattern
                });
            }
        });
        // Extract from depth analysis
        depthAnalysis.levels.forEach(level => {
            if (level.level === 4 && level.complete) {
                // System level connections
                level.understanding.forEach(item => {
                    if (item.includes('Connects to:')) {
                        const concepts = item.replace('Connects to:', '').split(',');
                        concepts.forEach(related => {
                            connections.push({
                                relatedConcept: related.trim(),
                                relationshipType: 'related',
                                strength: 0.8,
                                explanation: 'System-level connection'
                            });
                        });
                    }
                    if (item.includes('Depends on:')) {
                        const deps = item.replace('Depends on:', '').split(',');
                        deps.forEach(dep => {
                            connections.push({
                                relatedConcept: dep.trim(),
                                relationshipType: 'prerequisite',
                                strength: 0.9,
                                explanation: 'Required dependency'
                            });
                        });
                    }
                });
            }
        });
        // Add contrasting concepts
        if (brief.signals.extractedPatterns.some(p => p.includes('Contrasting'))) {
            connections.push({
                relatedConcept: 'Alternative approaches',
                relationshipType: 'contrast',
                strength: 0.5,
                explanation: 'Different approach to similar problem'
            });
        }
        return connections.slice(0, 5); // Limit to top 5 connections
    }
    /**
     * Calculate overall confidence
     */
    calculateConfidence(depthAnalysis, analogies, riceScore) {
        // Weight components
        const depthWeight = 0.4;
        const analogyWeight = 0.2;
        const riceWeight = 0.2;
        const completenessWeight = 0.2;
        // Calculate depth confidence
        const depthConfidence = depthAnalysis.currentDepth / 5;
        // Calculate analogy confidence
        const analogyConfidence = analogies.bestAnalogy
            ? analogies.bestAnalogy.strength
            : 0;
        // Calculate RICE confidence
        const riceConfidence = Math.min(1, riceScore.confidence / 100);
        // Calculate completeness
        const completedLevels = depthAnalysis.levels.filter(l => l.complete).length;
        const completeness = completedLevels / Math.min(3, depthAnalysis.currentDepth + 1);
        // Weighted average
        const confidence = (depthConfidence * depthWeight) +
            (analogyConfidence * analogyWeight) +
            (riceConfidence * riceWeight) +
            (completeness * completenessWeight);
        return Math.min(1, Math.max(0, confidence));
    }
    /**
     * Update session statistics
     */
    updateStatistics(synthesis) {
        const processed = this.state.sessionData.get('conceptsProcessed') || 0;
        this.state.sessionData.set('conceptsProcessed', processed + 1);
        const totalDepth = this.state.sessionData.get('totalDepthAchieved') || 0;
        this.state.sessionData.set('totalDepthAchieved', totalDepth + synthesis.metadata.depthAchieved);
        const analogies = this.state.sessionData.get('analogiesCreated') || 0;
        this.state.sessionData.set('analogiesCreated', analogies + synthesis.metadata.analogiesGenerated);
    }
    /**
     * Generate document ID
     */
    generateDocumentId() {
        return `synthesis-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    }
    /**
     * Get Bloom's taxonomy questions for a concept
     */
    generateBloomQuestions(concept, level) {
        const bloomLevels = {
            1: [
                `What is ${concept}?`,
                `Define ${concept} in your own words.`,
                `List the key features of ${concept}.`
            ],
            2: [
                `How does ${concept} work?`,
                `Explain ${concept} with an example.`,
                `What is the purpose of ${concept}?`
            ],
            3: [
                `How would you use ${concept} to solve a problem?`,
                `Give an example of ${concept} in practice.`,
                `Demonstrate how ${concept} works.`
            ],
            4: [
                `What are the components of ${concept}?`,
                `How does ${concept} relate to other concepts?`,
                `What patterns do you see in ${concept}?`
            ],
            5: [
                `What are the strengths and weaknesses of ${concept}?`,
                `When is ${concept} most effective?`,
                `Compare ${concept} with alternatives.`
            ],
            6: [
                `How could you improve ${concept}?`,
                `Design a new application for ${concept}.`,
                `What would happen if you combined ${concept} with something else?`
            ]
        };
        return bloomLevels[Math.min(6, Math.max(1, level))] || bloomLevels[1];
    }
}
exports.ScholarAgent = ScholarAgent;
exports.default = ScholarAgent;
//# sourceMappingURL=scholar-agent.js.map