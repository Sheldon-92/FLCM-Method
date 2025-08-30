"use strict";
/**
 * Progressive Depth Learning Methodology
 * Implements 5-level depth understanding framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressiveDepthLearning = void 0;
/**
 * Progressive Depth Learning Class
 */
class ProgressiveDepthLearning {
    constructor() {
        this.depthDefinitions = {
            1: {
                name: 'Surface Understanding',
                focus: 'What',
                questions: [
                    'What is this?',
                    'What does it do?',
                    'What are its key features?',
                    'What category does it belong to?'
                ]
            },
            2: {
                name: 'Mechanical Understanding',
                focus: 'How',
                questions: [
                    'How does it work?',
                    'How is it implemented?',
                    'How do the parts interact?',
                    'What is the process?'
                ]
            },
            3: {
                name: 'Principle Understanding',
                focus: 'Why',
                questions: [
                    'Why does it work this way?',
                    'Why is it important?',
                    'What principles govern it?',
                    'What problems does it solve?'
                ]
            },
            4: {
                name: 'System Understanding',
                focus: 'Connections',
                questions: [
                    'How does it connect to other concepts?',
                    'What depends on it?',
                    'What does it depend on?',
                    'How does it fit in the larger system?'
                ]
            },
            5: {
                name: 'Innovation Understanding',
                focus: 'Implications',
                questions: [
                    'What new possibilities does it create?',
                    'How could it be improved?',
                    'What are the future implications?',
                    'How could it be applied differently?'
                ]
            }
        };
    }
    /**
     * Analyze concept at progressive depths
     */
    analyze(concept, content, existingKnowledge) {
        const levels = [];
        let currentDepth = 0;
        let teachingReady = false;
        // Process each depth level
        for (let level = 1; level <= 5; level++) {
            const depthLevel = this.analyzeDepthLevel(level, concept, content, existingKnowledge);
            levels.push(depthLevel);
            if (depthLevel.complete && depthLevel.confidence >= 0.7) {
                currentDepth = level;
                if (level >= 3) {
                    teachingReady = true;
                }
            }
            else {
                break; // Stop if we can't complete this level
            }
        }
        // Identify gaps and next steps
        const gaps = this.identifyGaps(levels, currentDepth);
        const nextSteps = this.suggestNextSteps(concept, currentDepth, gaps);
        return {
            concept,
            currentDepth,
            levels,
            teachingReady,
            gaps,
            nextSteps
        };
    }
    /**
     * Analyze a specific depth level
     */
    analyzeDepthLevel(level, concept, content, existingKnowledge) {
        const definition = this.depthDefinitions[level];
        const understanding = [];
        let confidence = 0;
        // Extract understanding based on depth level
        switch (level) {
            case 1: // Surface - What
                understanding.push(...this.extractSurfaceUnderstanding(concept, content));
                break;
            case 2: // Mechanical - How
                understanding.push(...this.extractMechanicalUnderstanding(concept, content));
                break;
            case 3: // Principle - Why
                understanding.push(...this.extractPrincipleUnderstanding(concept, content));
                break;
            case 4: // System - Connections
                understanding.push(...this.extractSystemUnderstanding(concept, content));
                break;
            case 5: // Innovation - Implications
                understanding.push(...this.extractInnovationUnderstanding(concept, content));
                break;
        }
        // Calculate confidence based on understanding completeness
        const expectedInsights = 4; // Expect at least 4 insights per level
        confidence = Math.min(1, understanding.length / expectedInsights);
        // Check if existing knowledge covers this level
        if (existingKnowledge) {
            const overlap = this.checkKnowledgeOverlap(understanding, existingKnowledge);
            confidence = Math.max(confidence, overlap);
        }
        return {
            level,
            name: definition.name,
            focus: definition.focus,
            understanding,
            confidence,
            complete: confidence >= 0.6 && understanding.length >= 2
        };
    }
    /**
     * Extract surface-level understanding (What)
     */
    extractSurfaceUnderstanding(concept, content) {
        const understanding = [];
        const contentLower = content.toLowerCase();
        const conceptName = concept.name.toLowerCase();
        // Definition extraction
        const defPattern = new RegExp(`${conceptName}[^.]*(?:is|are|means|refers to)[^.]+\\.`, 'gi');
        const definitions = content.match(defPattern);
        if (definitions) {
            understanding.push(`Definition: ${definitions[0].trim()}`);
        }
        // Feature extraction
        const features = this.extractFeatures(concept.name, content);
        if (features.length > 0) {
            understanding.push(`Key features: ${features.slice(0, 3).join(', ')}`);
        }
        // Category identification
        const categories = this.identifyCategories(concept.name, content);
        if (categories.length > 0) {
            understanding.push(`Category: ${categories[0]}`);
        }
        // Purpose statement
        const purpose = this.extractPurpose(concept.name, content);
        if (purpose) {
            understanding.push(`Purpose: ${purpose}`);
        }
        return understanding;
    }
    /**
     * Extract mechanical understanding (How)
     */
    extractMechanicalUnderstanding(concept, content) {
        const understanding = [];
        // Process extraction
        const processes = this.extractProcesses(content);
        processes.forEach(process => {
            understanding.push(`Process: ${process}`);
        });
        // Step-by-step procedures
        const steps = this.extractSteps(content);
        if (steps.length > 0) {
            understanding.push(`Steps: ${steps.join(' → ')}`);
        }
        // Mechanism description
        const mechanisms = this.extractMechanisms(concept.name, content);
        mechanisms.forEach(mechanism => {
            understanding.push(`Mechanism: ${mechanism}`);
        });
        // Implementation details
        const implementation = this.extractImplementation(content);
        if (implementation) {
            understanding.push(`Implementation: ${implementation}`);
        }
        return understanding;
    }
    /**
     * Extract principle understanding (Why)
     */
    extractPrincipleUnderstanding(concept, content) {
        const understanding = [];
        // Reason extraction
        const reasons = this.extractReasons(concept.name, content);
        reasons.forEach(reason => {
            understanding.push(`Reason: ${reason}`);
        });
        // Underlying principles
        const principles = this.extractPrinciples(content);
        principles.forEach(principle => {
            understanding.push(`Principle: ${principle}`);
        });
        // Problem-solution relationships
        const problems = this.extractProblems(content);
        if (problems.length > 0) {
            understanding.push(`Solves: ${problems.join(', ')}`);
        }
        // Benefits and advantages
        const benefits = this.extractBenefits(concept.name, content);
        if (benefits.length > 0) {
            understanding.push(`Benefits: ${benefits.slice(0, 3).join(', ')}`);
        }
        return understanding;
    }
    /**
     * Extract system understanding (Connections)
     */
    extractSystemUnderstanding(concept, content) {
        const understanding = [];
        // Related concepts
        const connections = this.extractConnections(concept.name, content);
        if (connections.length > 0) {
            understanding.push(`Connects to: ${connections.join(', ')}`);
        }
        // Dependencies
        const dependencies = this.extractDependencies(concept.name, content);
        if (dependencies.in.length > 0) {
            understanding.push(`Depends on: ${dependencies.in.join(', ')}`);
        }
        if (dependencies.out.length > 0) {
            understanding.push(`Required by: ${dependencies.out.join(', ')}`);
        }
        // System context
        const context = this.extractSystemContext(concept.name, content);
        if (context) {
            understanding.push(`System role: ${context}`);
        }
        // Interactions
        const interactions = this.extractInteractions(content);
        if (interactions.length > 0) {
            understanding.push(`Interactions: ${interactions.join(', ')}`);
        }
        return understanding;
    }
    /**
     * Extract innovation understanding (Implications)
     */
    extractInnovationUnderstanding(concept, content) {
        const understanding = [];
        // Future possibilities
        const possibilities = this.extractPossibilities(concept.name, content);
        possibilities.forEach(possibility => {
            understanding.push(`Possibility: ${possibility}`);
        });
        // Improvement opportunities
        const improvements = this.extractImprovements(concept.name, content);
        if (improvements.length > 0) {
            understanding.push(`Can improve: ${improvements.join(', ')}`);
        }
        // Novel applications
        const applications = this.extractApplications(concept.name, content);
        if (applications.length > 0) {
            understanding.push(`New applications: ${applications.join(', ')}`);
        }
        // Implications and impact
        const implications = this.extractImplications(content);
        implications.forEach(implication => {
            understanding.push(`Implication: ${implication}`);
        });
        return understanding;
    }
    // Helper methods for extraction
    extractFeatures(concept, content) {
        const features = [];
        const patterns = [
            `${concept}[^.]*features[^.]*:([^.]+)`,
            `characteristics of ${concept}[^:]*:([^.]+)`,
            `${concept}[^.]*includes?([^.]+)`
        ];
        patterns.forEach(pattern => {
            const regex = new RegExp(pattern, 'gi');
            const matches = content.match(regex);
            if (matches) {
                matches.forEach(match => {
                    const items = match.split(/[,;]/).map(s => s.trim());
                    features.push(...items.filter(item => item.length > 3));
                });
            }
        });
        return [...new Set(features)];
    }
    identifyCategories(concept, content) {
        const categories = [];
        const categoryWords = ['type', 'kind', 'category', 'class', 'form', 'variant'];
        categoryWords.forEach(word => {
            const pattern = new RegExp(`${concept}[^.]*(?:is a|type of|kind of|form of)\\s+([\\w\\s]+)`, 'gi');
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const category = match.replace(new RegExp(`.*(?:is a|type of|kind of|form of)\\s+`, 'i'), '').trim();
                    if (category.length < 50) {
                        categories.push(category);
                    }
                });
            }
        });
        return categories;
    }
    extractPurpose(concept, content) {
        const patterns = [
            `${concept}[^.]*(?:used for|purpose is|designed to|meant to)([^.]+)`,
            `use ${concept}[^.]*to([^.]+)`
        ];
        for (const pattern of patterns) {
            const match = content.match(new RegExp(pattern, 'i'));
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }
    extractProcesses(content) {
        const processes = [];
        const processIndicators = /(?:process|procedure|method|approach|technique)\s*:?\s*([^.]+)/gi;
        const matches = content.match(processIndicators);
        if (matches) {
            matches.forEach(match => {
                const process = match.replace(/^[^:]+:?\s*/, '').trim();
                if (process.length > 10 && process.length < 200) {
                    processes.push(process);
                }
            });
        }
        return processes.slice(0, 3);
    }
    extractSteps(content) {
        const steps = [];
        // Look for numbered steps
        const numberedSteps = content.match(/(?:step\s+)?(\d+)[\.\)]\s*([^.\n]+)/gi);
        if (numberedSteps) {
            numberedSteps.forEach(step => {
                const cleanStep = step.replace(/^(?:step\s+)?\d+[\.\)]\s*/i, '').trim();
                if (cleanStep.length > 5) {
                    steps.push(cleanStep);
                }
            });
        }
        // Look for sequential words
        const sequenceWords = ['first', 'then', 'next', 'after', 'finally'];
        sequenceWords.forEach(word => {
            const pattern = new RegExp(`${word}[^.]*?([^.,]+)`, 'gi');
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const step = match.replace(new RegExp(`^${word}\\s*,?\\s*`, 'i'), '').trim();
                    if (step.length > 5 && step.length < 100) {
                        steps.push(step);
                    }
                });
            }
        });
        return steps.slice(0, 5);
    }
    extractMechanisms(concept, content) {
        const mechanisms = [];
        const patterns = [
            `${concept}[^.]*works by([^.]+)`,
            `mechanism of ${concept}[^.]*is([^.]+)`,
            `${concept}[^.]*operates([^.]+)`
        ];
        patterns.forEach(pattern => {
            const match = content.match(new RegExp(pattern, 'i'));
            if (match) {
                mechanisms.push(match[1].trim());
            }
        });
        return mechanisms;
    }
    extractImplementation(content) {
        const patterns = [
            /implement[^.]*:([^.]+)/i,
            /implementation[^.]*(?:is|involves?)([^.]+)/i,
            /(?:built|created|developed)\s+using([^.]+)/i
        ];
        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }
    extractReasons(concept, content) {
        const reasons = [];
        const patterns = [
            `${concept}[^.]*because([^.]+)`,
            `reason[^.]*${concept}[^.]*is([^.]+)`,
            `${concept}[^.]*(?:since|as|due to)([^.]+)`
        ];
        patterns.forEach(pattern => {
            const matches = content.match(new RegExp(pattern, 'gi'));
            if (matches) {
                matches.forEach(match => {
                    const reason = match.replace(/.*(?:because|is|since|as|due to)\s*/i, '').trim();
                    if (reason.length > 10 && reason.length < 200) {
                        reasons.push(reason);
                    }
                });
            }
        });
        return reasons.slice(0, 3);
    }
    extractPrinciples(content) {
        const principles = [];
        const principleWords = ['principle', 'law', 'rule', 'theorem', 'axiom', 'foundation'];
        principleWords.forEach(word => {
            const pattern = new RegExp(`${word}[^:]*:?\\s*([^.]+)`, 'gi');
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const principle = match.replace(new RegExp(`^${word}[^:]*:?\\s*`, 'i'), '').trim();
                    if (principle.length > 10) {
                        principles.push(principle);
                    }
                });
            }
        });
        return principles.slice(0, 3);
    }
    extractProblems(content) {
        const problems = [];
        const patterns = [
            /solves?[^:]*:?\s*([^.]+)/gi,
            /problem[^:]*:?\s*([^.]+)/gi,
            /challenge[^:]*:?\s*([^.]+)/gi,
            /address(?:es)?[^:]*:?\s*([^.]+)/gi
        ];
        patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const problem = match.replace(/^[^:]+:?\s*/, '').trim();
                    if (problem.length > 5 && problem.length < 100) {
                        problems.push(problem);
                    }
                });
            }
        });
        return [...new Set(problems)].slice(0, 3);
    }
    extractBenefits(concept, content) {
        const benefits = [];
        const benefitWords = ['benefit', 'advantage', 'improve', 'enhance', 'increase', 'reduce'];
        benefitWords.forEach(word => {
            const pattern = new RegExp(`${concept}[^.]*${word}s?([^.]+)`, 'gi');
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const benefit = match.replace(new RegExp(`.*${word}s?\\s*`, 'i'), '').trim();
                    if (benefit.length > 5) {
                        benefits.push(benefit);
                    }
                });
            }
        });
        return [...new Set(benefits)];
    }
    extractConnections(concept, content) {
        const connections = [];
        const connectionWords = ['relates to', 'connects to', 'links to', 'integrates with', 'works with'];
        connectionWords.forEach(phrase => {
            const pattern = new RegExp(`${concept}[^.]*${phrase}([^.]+)`, 'gi');
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const connection = match.replace(new RegExp(`.*${phrase}\\s*`, 'i'), '').trim();
                    connections.push(connection);
                });
            }
        });
        // Also look for other concepts mentioned near our concept
        const nearbyPattern = new RegExp(`${concept}[^.]{0,50}(?:and|with|alongside)\\s+([A-Z][\\w\\s]+)`, 'g');
        const nearbyMatches = content.match(nearbyPattern);
        if (nearbyMatches) {
            nearbyMatches.forEach(match => {
                const nearby = match.replace(new RegExp(`.*(?:and|with|alongside)\\s+`, 'i'), '').trim();
                if (nearby.length < 30) {
                    connections.push(nearby);
                }
            });
        }
        return [...new Set(connections)].slice(0, 5);
    }
    extractDependencies(concept, content) {
        const dependencies = { in: [], out: [] };
        // Inbound dependencies (what this depends on)
        const inPatterns = [
            `${concept}[^.]*(?:depends on|requires|needs)([^.]+)`,
            `${concept}[^.]*(?:based on|built on)([^.]+)`
        ];
        inPatterns.forEach(pattern => {
            const matches = content.match(new RegExp(pattern, 'gi'));
            if (matches) {
                matches.forEach(match => {
                    const dep = match.replace(/.*(?:depends on|requires|needs|based on|built on)\s*/i, '').trim();
                    dependencies.in.push(dep);
                });
            }
        });
        // Outbound dependencies (what depends on this)
        const outPatterns = [
            `([^.]+)(?:depends on|requires|needs)[^.]*${concept}`,
            `([^.]+)(?:uses|leverages)[^.]*${concept}`
        ];
        outPatterns.forEach(pattern => {
            const matches = content.match(new RegExp(pattern, 'gi'));
            if (matches) {
                matches.forEach(match => {
                    const dep = match.replace(new RegExp(`\\s*(?:depends on|requires|needs|uses|leverages).*`, 'i'), '').trim();
                    dependencies.out.push(dep);
                });
            }
        });
        return {
            in: [...new Set(dependencies.in)].slice(0, 3),
            out: [...new Set(dependencies.out)].slice(0, 3)
        };
    }
    extractSystemContext(concept, content) {
        const patterns = [
            `${concept}[^.]*(?:role in|part of|component of)([^.]+)`,
            `in the[^.]*system[^.]*${concept}([^.]+)`
        ];
        for (const pattern of patterns) {
            const match = content.match(new RegExp(pattern, 'i'));
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }
    extractInteractions(content) {
        const interactions = [];
        const patterns = [
            /interact(?:s|ion)?[^:]*:?\s*([^.]+)/gi,
            /communicat(?:es?|ion)[^:]*:?\s*([^.]+)/gi,
            /exchang(?:es?|ing)[^:]*:?\s*([^.]+)/gi
        ];
        patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const interaction = match.replace(/^[^:]+:?\s*/, '').trim();
                    if (interaction.length > 10 && interaction.length < 100) {
                        interactions.push(interaction);
                    }
                });
            }
        });
        return interactions.slice(0, 3);
    }
    extractPossibilities(concept, content) {
        const possibilities = [];
        const futureWords = ['could', 'might', 'may', 'will', 'future', 'potential', 'possible'];
        futureWords.forEach(word => {
            const pattern = new RegExp(`${concept}[^.]*${word}([^.]+)`, 'gi');
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const possibility = match.replace(new RegExp(`.*${word}\\s*`, 'i'), '').trim();
                    if (possibility.length > 10) {
                        possibilities.push(possibility);
                    }
                });
            }
        });
        return [...new Set(possibilities)].slice(0, 3);
    }
    extractImprovements(concept, content) {
        const improvements = [];
        const improveWords = ['improve', 'enhance', 'optimize', 'upgrade', 'refine', 'better'];
        improveWords.forEach(word => {
            const pattern = new RegExp(`${concept}[^.]*(?:can|could|should)\\s*(?:be\\s*)?${word}[ed]*([^.]+)`, 'gi');
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const improvement = match.replace(/.*(?:can|could|should)\s*(?:be\s*)?(?:improve|enhance|optimize|upgrade|refine|better)[ed]*\s*/i, '').trim();
                    improvements.push(improvement);
                });
            }
        });
        return [...new Set(improvements)].slice(0, 3);
    }
    extractApplications(concept, content) {
        const applications = [];
        const patterns = [
            `${concept}[^.]*(?:applied to|used in|useful for)([^.]+)`,
            `applications? of ${concept}[^:]*:?([^.]+)`,
            `use ${concept}[^.]*for([^.]+)`
        ];
        patterns.forEach(pattern => {
            const matches = content.match(new RegExp(pattern, 'gi'));
            if (matches) {
                matches.forEach(match => {
                    const app = match.replace(/.*(?:applied to|used in|useful for|applications? of|use.*for)\s*/i, '').trim();
                    if (app.length > 5 && app.length < 100) {
                        applications.push(app);
                    }
                });
            }
        });
        return [...new Set(applications)].slice(0, 3);
    }
    extractImplications(content) {
        const implications = [];
        const patterns = [
            /implicat(?:es?|ions?)[^:]*:?\s*([^.]+)/gi,
            /this means[^:]*:?\s*([^.]+)/gi,
            /consequen(?:ce|tly)[^:]*:?\s*([^.]+)/gi,
            /result(?:s|ing)?[^:]*:?\s*([^.]+)/gi
        ];
        patterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const implication = match.replace(/^[^:]+:?\s*/, '').trim();
                    if (implication.length > 10 && implication.length < 150) {
                        implications.push(implication);
                    }
                });
            }
        });
        return [...new Set(implications)].slice(0, 3);
    }
    checkKnowledgeOverlap(understanding, existingKnowledge) {
        if (understanding.length === 0 || existingKnowledge.length === 0) {
            return 0;
        }
        let overlapCount = 0;
        understanding.forEach(item => {
            const itemLower = item.toLowerCase();
            existingKnowledge.forEach(knowledge => {
                const knowledgeLower = knowledge.toLowerCase();
                // Check for significant overlap (more than just a few words)
                const commonWords = this.getCommonWords(itemLower, knowledgeLower);
                if (commonWords.length >= 3) {
                    overlapCount++;
                }
            });
        });
        return Math.min(1, overlapCount / understanding.length);
    }
    getCommonWords(str1, str2) {
        const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 3));
        const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 3));
        const common = [];
        words1.forEach(word => {
            if (words2.has(word)) {
                common.push(word);
            }
        });
        return common;
    }
    /**
     * Identify knowledge gaps
     */
    identifyGaps(levels, currentDepth) {
        const gaps = [];
        levels.forEach(level => {
            if (level.level <= currentDepth && !level.complete) {
                gaps.push(`Incomplete ${level.name}: Need more ${level.focus.toLowerCase()} information`);
            }
            if (level.confidence < 0.7 && level.level <= currentDepth) {
                gaps.push(`Low confidence in ${level.name}: ${Math.round(level.confidence * 100)}%`);
            }
            if (level.understanding.length < 2) {
                gaps.push(`Insufficient ${level.focus.toLowerCase()} understanding`);
            }
        });
        // Check for specific missing elements
        if (currentDepth >= 1 && !levels[0].understanding.some(u => u.includes('Definition'))) {
            gaps.push('Missing clear definition');
        }
        if (currentDepth >= 2 && !levels[1]?.understanding.some(u => u.includes('Process') || u.includes('Steps'))) {
            gaps.push('Missing process or mechanism description');
        }
        if (currentDepth >= 3 && !levels[2]?.understanding.some(u => u.includes('Reason') || u.includes('Principle'))) {
            gaps.push('Missing underlying principles');
        }
        return gaps;
    }
    /**
     * Suggest next learning steps
     */
    suggestNextSteps(concept, currentDepth, gaps) {
        const nextSteps = [];
        // Based on current depth
        if (currentDepth < 5) {
            const nextLevel = this.depthDefinitions[(currentDepth + 1)];
            nextSteps.push(`Explore ${nextLevel.focus.toLowerCase()}: ${nextLevel.questions[0]}`);
        }
        // Based on gaps
        if (gaps.some(gap => gap.includes('definition'))) {
            nextSteps.push('Research formal definitions and academic sources');
        }
        if (gaps.some(gap => gap.includes('process'))) {
            nextSteps.push('Find step-by-step implementations or tutorials');
        }
        if (gaps.some(gap => gap.includes('principle'))) {
            nextSteps.push('Study theoretical foundations and research papers');
        }
        if (gaps.some(gap => gap.includes('confidence'))) {
            nextSteps.push('Verify understanding with additional sources');
        }
        // General recommendations
        if (currentDepth >= 3 && !gaps.includes('Missing clear definition')) {
            nextSteps.push('Create practical examples to solidify understanding');
        }
        if (currentDepth === 5) {
            nextSteps.push('Explore cross-domain applications');
            nextSteps.push('Identify innovation opportunities');
        }
        return nextSteps.slice(0, 3);
    }
    /**
     * Generate teaching questions for each depth level
     */
    generateQuestions(analysis) {
        const questions = new Map();
        analysis.levels.forEach(level => {
            const levelQuestions = [];
            const definition = this.depthDefinitions[level.level];
            // Generate questions based on the level's focus
            definition.questions.forEach(template => {
                const question = template.replace(/this|it/gi, analysis.concept.name);
                levelQuestions.push(question);
            });
            // Add specific questions based on understanding
            if (level.understanding.length > 0) {
                level.understanding.forEach(item => {
                    if (item.includes(':')) {
                        const [type, content] = item.split(':');
                        levelQuestions.push(`Explain the ${type.toLowerCase()} of ${analysis.concept.name}`);
                    }
                });
            }
            questions.set(level.level, levelQuestions.slice(0, 4));
        });
        return questions;
    }
}
exports.ProgressiveDepthLearning = ProgressiveDepthLearning;
exports.default = ProgressiveDepthLearning;
//# sourceMappingURL=progressive-depth.js.map