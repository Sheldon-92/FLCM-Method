"use strict";
/**
 * Learning Profile Builder
 * Builds and maintains user learning profiles for personalized recommendations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningProfileBuilder = void 0;
const logger_1 = require("../shared/utils/logger");
const events_1 = require("events");
class LearningProfileBuilder extends events_1.EventEmitter {
    constructor() {
        super();
        this.logger = new logger_1.Logger('LearningProfileBuilder');
        this.profiles = new Map();
        this.profileSettings = new Map();
        this.learningHistory = new Map();
        this.learningStyleDetector = new LearningStyleDetector();
        this.cognitiveLoadAnalyzer = new CognitiveLoadAnalyzer();
        this.attentionSpanCalculator = new AttentionSpanCalculator();
    }
    /**
     * Build or update learning profile for user
     */
    async buildProfile(userId, data) {
        try {
            this.logger.debug(`Building profile for user: ${userId}`);
            const existingProfile = this.profiles.get(userId);
            // Analyze learning style
            const learningStyle = await this.learningStyleDetector.analyze(data.sessions, data.interactions);
            // Analyze cognitive load preferences
            const cognitiveLoad = await this.cognitiveLoadAnalyzer.analyze(data.sessions);
            // Calculate optimal complexity
            const preferredComplexity = this.calculateOptimalComplexity(data.sessions);
            // Calculate attention span
            const attentionSpan = await this.attentionSpanCalculator.calculate(data.sessions);
            // Determine optimal learning times
            const optimalLearningTime = this.analyzeOptimalTimes(data.sessions);
            // Identify strengths and challenges
            const { strengths, challenges } = this.analyzePerformancePatterns(data);
            // Process goals
            const processedGoals = await this.processGoals(data.goals, userId);
            const profile = {
                userId,
                learningStyle,
                cognitiveLoad,
                preferredComplexity,
                attentionSpan,
                optimalLearningTime,
                strengths,
                challenges,
                goals: processedGoals,
                created: existingProfile?.created || new Date(),
                lastUpdated: new Date()
            };
            this.profiles.set(userId, profile);
            // Update learning history
            await this.updateLearningHistory(userId, data);
            // Emit profile update event
            this.emit('profile_updated', {
                userId,
                profile,
                changes: this.calculateProfileChanges(existingProfile, profile)
            });
            this.logger.info(`Profile built/updated for user: ${userId}`);
            return profile;
        }
        catch (error) {
            this.logger.error('Failed to build profile:', error);
            throw error;
        }
    }
    /**
     * Get user profile
     */
    async getProfile(userId) {
        return this.profiles.get(userId) || null;
    }
    /**
     * Update profile settings
     */
    async updateSettings(userId, settings) {
        const existingSettings = this.profileSettings.get(userId) || this.getDefaultSettings(userId);
        const updatedSettings = {
            ...existingSettings,
            ...settings
        };
        this.profileSettings.set(userId, updatedSettings);
        this.emit('settings_updated', { userId, settings: updatedSettings });
        this.logger.debug(`Settings updated for user: ${userId}`);
    }
    /**
     * Get profile settings
     */
    async getSettings(userId) {
        return this.profileSettings.get(userId) || this.getDefaultSettings(userId);
    }
    /**
     * Add or update learning goal
     */
    async updateGoal(userId, goal) {
        const profile = this.profiles.get(userId);
        if (!profile) {
            throw new Error(`Profile not found for user: ${userId}`);
        }
        if (goal.id) {
            // Update existing goal
            const goalIndex = profile.goals.findIndex(g => g.id === goal.id);
            if (goalIndex !== -1) {
                profile.goals[goalIndex] = { ...profile.goals[goalIndex], ...goal };
            }
        }
        else {
            // Add new goal
            const newGoal = {
                id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: goal.title || 'Untitled Goal',
                description: goal.description || '',
                targetDate: goal.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                priority: goal.priority || 'medium',
                category: goal.category || 'general',
                progress: goal.progress || 0,
                milestones: goal.milestones || [],
                frameworks: goal.frameworks || [],
                estimatedHours: goal.estimatedHours || 10,
                actualHours: goal.actualHours,
                status: goal.status || 'active',
                created: new Date()
            };
            profile.goals.push(newGoal);
        }
        profile.lastUpdated = new Date();
        this.profiles.set(userId, profile);
        this.emit('goal_updated', { userId, goal, profile });
        this.logger.debug(`Goal updated for user: ${userId}`);
    }
    /**
     * Get learning recommendations context
     */
    async getRecommendationContext(userId) {
        const profile = this.profiles.get(userId);
        const history = this.learningHistory.get(userId) || [];
        if (!profile) {
            throw new Error(`Profile not found for user: ${userId}`);
        }
        // Get recent learning vectors
        const recentHistory = history
            .filter(v => v.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return {
            userId,
            recentHistory: {
                frameworks: recentHistory.map(v => v.framework),
                topics: recentHistory.map(v => v.topic),
                performance: recentHistory.map(v => v.performance.completionRate),
                timeSpent: recentHistory.map(v => v.context.sessionLength)
            },
            currentGoals: profile.goals
                .filter(g => g.status === 'active')
                .map(g => g.id),
            availableTime: this.estimateAvailableTime(userId),
            environment: this.detectCurrentEnvironment(userId)
        };
    }
    /**
     * Calculate optimal complexity based on performance
     */
    calculateOptimalComplexity(sessions) {
        if (!sessions || sessions.length === 0)
            return 5;
        // Analyze completion rates at different difficulty levels
        const difficultyPerformance = new Map();
        for (const session of sessions) {
            const difficulty = session.difficulty || 5;
            const completed = session.completionRate >= 0.8;
            const stats = difficultyPerformance.get(difficulty) || { completions: 0, attempts: 0 };
            stats.attempts++;
            if (completed)
                stats.completions++;
            difficultyPerformance.set(difficulty, stats);
        }
        // Find sweet spot - highest difficulty with >70% completion rate
        let optimalComplexity = 5;
        let bestScore = 0;
        for (const [difficulty, stats] of difficultyPerformance) {
            const completionRate = stats.completions / stats.attempts;
            const score = completionRate * difficulty; // Weighted by difficulty
            if (completionRate >= 0.7 && score > bestScore) {
                bestScore = score;
                optimalComplexity = difficulty;
            }
        }
        return Math.max(1, Math.min(10, optimalComplexity));
    }
    /**
     * Analyze optimal learning times
     */
    analyzeOptimalTimes(sessions) {
        if (!sessions || sessions.length === 0)
            return ['09:00', '14:00', '20:00'];
        const timeSlotPerformance = new Map();
        for (const session of sessions) {
            const hour = new Date(session.startTime).getHours();
            const timeSlot = this.getTimeSlotFromHour(hour);
            const stats = timeSlotPerformance.get(timeSlot) || { performance: [], count: 0 };
            stats.performance.push(session.completionRate || 0.5);
            stats.count++;
            timeSlotPerformance.set(timeSlot, stats);
        }
        // Calculate average performance for each time slot
        const timeSlotAverages = new Map();
        for (const [slot, stats] of timeSlotPerformance) {
            const average = stats.performance.reduce((sum, p) => sum + p, 0) / stats.performance.length;
            timeSlotAverages.set(slot, average);
        }
        // Return top 3 performing time slots
        return Array.from(timeSlotAverages.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([slot]) => slot);
    }
    /**
     * Analyze performance patterns to identify strengths and challenges
     */
    analyzePerformancePatterns(data) {
        const strengths = [];
        const challenges = [];
        // Analyze framework performance
        const frameworkPerformance = this.analyzeFrameworkPerformance(data.sessions);
        for (const [framework, avgPerformance] of frameworkPerformance) {
            if (avgPerformance > 0.8) {
                strengths.push(`${framework} framework`);
            }
            else if (avgPerformance < 0.5) {
                challenges.push(`${framework} framework`);
            }
        }
        // Analyze topic performance
        const topicPerformance = this.analyzeTopicPerformance(data.sessions);
        for (const [topic, avgPerformance] of topicPerformance) {
            if (avgPerformance > 0.8) {
                strengths.push(`${topic} topics`);
            }
            else if (avgPerformance < 0.5) {
                challenges.push(`${topic} topics`);
            }
        }
        // Analyze session length preferences
        const sessionLengthPerformance = this.analyzeSessionLengthPerformance(data.sessions);
        const bestLength = Array.from(sessionLengthPerformance.entries())
            .sort((a, b) => b[1] - a[1])[0];
        if (bestLength && bestLength[1] > 0.7) {
            if (bestLength[0] < 30) {
                strengths.push('focused short sessions');
            }
            else if (bestLength[0] > 60) {
                strengths.push('sustained long sessions');
            }
            else {
                strengths.push('moderate session lengths');
            }
        }
        return { strengths, challenges };
    }
    /**
     * Process and validate learning goals
     */
    async processGoals(goals, userId) {
        const processedGoals = [];
        for (const goal of goals || []) {
            // Validate and set defaults
            const processedGoal = {
                id: goal.id || `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: goal.title || 'Untitled Goal',
                description: goal.description || '',
                targetDate: goal.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                priority: goal.priority || 'medium',
                category: goal.category || 'general',
                progress: Math.max(0, Math.min(100, goal.progress || 0)),
                milestones: goal.milestones || [],
                frameworks: goal.frameworks || [],
                estimatedHours: goal.estimatedHours || 10,
                actualHours: goal.actualHours,
                status: goal.status || 'active',
                created: goal.created || new Date()
            };
            // Process milestones
            processedGoal.milestones = await this.processMilestones(goal.milestones || [], processedGoal);
            processedGoals.push(processedGoal);
        }
        return processedGoals;
    }
    /**
     * Process goal milestones
     */
    async processMilestones(milestones, parentGoal) {
        return milestones.map(milestone => ({
            id: milestone.id || `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: milestone.title || 'Untitled Milestone',
            description: milestone.description || '',
            targetDate: milestone.targetDate || parentGoal.targetDate,
            completed: milestone.completed || false,
            completedDate: milestone.completedDate,
            requiredSkills: milestone.requiredSkills || [],
            dependencies: milestone.dependencies || []
        }));
    }
    /**
     * Update learning history with new data
     */
    async updateLearningHistory(userId, data) {
        const existingHistory = this.learningHistory.get(userId) || [];
        // Convert sessions to learning vectors
        for (const session of data.sessions || []) {
            const vector = {
                userId,
                framework: session.framework || 'general',
                topic: session.topic || 'unspecified',
                embedding: this.generateSessionEmbedding(session),
                context: {
                    timeOfDay: new Date(session.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    dayOfWeek: new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'long' }),
                    sessionLength: session.duration || 0,
                    previousTopics: session.previousTopics || []
                },
                performance: {
                    completionRate: session.completionRate || 0.5,
                    qualityScore: session.qualityScore || 0.5,
                    retentionScore: session.retentionScore || 0.5,
                    engagementScore: session.engagementScore || 0.5
                },
                timestamp: new Date(session.startTime)
            };
            existingHistory.push(vector);
        }
        // Keep only recent history (last 90 days)
        const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const filteredHistory = existingHistory.filter(v => v.timestamp > cutoffDate);
        this.learningHistory.set(userId, filteredHistory);
    }
    /**
     * Calculate changes between profiles
     */
    calculateProfileChanges(oldProfile, newProfile) {
        if (!oldProfile)
            return ['profile_created'];
        const changes = [];
        if (oldProfile.learningStyle !== newProfile.learningStyle) {
            changes.push(`learning_style_changed_from_${oldProfile.learningStyle}_to_${newProfile.learningStyle}`);
        }
        if (oldProfile.cognitiveLoad !== newProfile.cognitiveLoad) {
            changes.push(`cognitive_load_changed_from_${oldProfile.cognitiveLoad}_to_${newProfile.cognitiveLoad}`);
        }
        if (Math.abs(oldProfile.preferredComplexity - newProfile.preferredComplexity) > 1) {
            changes.push(`preferred_complexity_changed_from_${oldProfile.preferredComplexity}_to_${newProfile.preferredComplexity}`);
        }
        if (Math.abs(oldProfile.attentionSpan - newProfile.attentionSpan) > 5) {
            changes.push(`attention_span_changed_from_${oldProfile.attentionSpan}_to_${newProfile.attentionSpan}`);
        }
        if (oldProfile.goals.length !== newProfile.goals.length) {
            changes.push(`goals_count_changed_from_${oldProfile.goals.length}_to_${newProfile.goals.length}`);
        }
        return changes;
    }
    /**
     * Get default personalization settings
     */
    getDefaultSettings(userId) {
        return {
            userId,
            adaptiveRecommendations: true,
            difficultyAdjustment: 'automatic',
            sessionLengthPreference: 'adaptive',
            notificationPreferences: {
                enabled: true,
                frequency: 'medium',
                channels: ['in_app'],
                optimalTimes: ['09:00', '14:00', '20:00']
            },
            privacySettings: {
                shareData: false,
                anonymizeData: true,
                retentionPeriod: 365
            },
            customization: {
                themes: ['default'],
                languages: ['en'],
                accessibilityNeeds: []
            }
        };
    }
    /**
     * Generate session embedding for ML analysis
     */
    generateSessionEmbedding(session) {
        const embedding = new Array(64).fill(0);
        // Encode session features
        embedding[0] = session.duration || 0;
        embedding[1] = session.completionRate || 0;
        embedding[2] = session.difficulty || 5;
        embedding[3] = session.qualityScore || 0.5;
        embedding[4] = new Date(session.startTime).getHours();
        embedding[5] = new Date(session.startTime).getDay();
        // Framework encoding (simplified)
        const frameworkHash = this.hashString(session.framework || '');
        embedding[6] = frameworkHash;
        // Topic encoding (simplified)
        const topicHash = this.hashString(session.topic || '');
        embedding[7] = topicHash;
        // Fill remaining with derived features
        for (let i = 8; i < 64; i++) {
            embedding[i] = Math.sin(i * embedding[i % 8]) * 0.1;
        }
        return embedding;
    }
    /**
     * Simple string hashing function
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) % 100; // Normalize to 0-100
    }
    /**
     * Get time slot from hour
     */
    getTimeSlotFromHour(hour) {
        if (hour < 6)
            return '02:00'; // Late night
        if (hour < 9)
            return '07:00'; // Early morning
        if (hour < 12)
            return '10:00'; // Morning
        if (hour < 15)
            return '13:00'; // Early afternoon
        if (hour < 18)
            return '16:00'; // Late afternoon
        if (hour < 21)
            return '19:00'; // Evening
        return '22:00'; // Night
    }
    /**
     * Analyze framework performance
     */
    analyzeFrameworkPerformance(sessions) {
        const frameworkStats = new Map();
        for (const session of sessions || []) {
            const framework = session.framework || 'unknown';
            const performance = session.completionRate || 0.5;
            const stats = frameworkStats.get(framework) || { total: 0, count: 0 };
            stats.total += performance;
            stats.count++;
            frameworkStats.set(framework, stats);
        }
        const averages = new Map();
        for (const [framework, stats] of frameworkStats) {
            averages.set(framework, stats.total / stats.count);
        }
        return averages;
    }
    /**
     * Analyze topic performance
     */
    analyzeTopicPerformance(sessions) {
        const topicStats = new Map();
        for (const session of sessions || []) {
            const topic = session.topic || 'unknown';
            const performance = session.completionRate || 0.5;
            const stats = topicStats.get(topic) || { total: 0, count: 0 };
            stats.total += performance;
            stats.count++;
            topicStats.set(topic, stats);
        }
        const averages = new Map();
        for (const [topic, stats] of topicStats) {
            averages.set(topic, stats.total / stats.count);
        }
        return averages;
    }
    /**
     * Analyze session length performance
     */
    analyzeSessionLengthPerformance(sessions) {
        const lengthBuckets = new Map();
        for (const session of sessions || []) {
            const length = Math.round((session.duration || 30) / 15) * 15; // Round to 15-minute buckets
            const performance = session.completionRate || 0.5;
            const stats = lengthBuckets.get(length) || { total: 0, count: 0 };
            stats.total += performance;
            stats.count++;
            lengthBuckets.set(length, stats);
        }
        const averages = new Map();
        for (const [length, stats] of lengthBuckets) {
            averages.set(length, stats.total / stats.count);
        }
        return averages;
    }
    /**
     * Estimate available time for user
     */
    estimateAvailableTime(userId) {
        // In real implementation, this would consider calendar, preferences, etc.
        const currentHour = new Date().getHours();
        if (currentHour < 9 || currentHour > 21)
            return 15; // Early/late = short session
        if (currentHour > 12 && currentHour < 14)
            return 30; // Lunch break
        return 45; // Default available time
    }
    /**
     * Detect current environment
     */
    detectCurrentEnvironment(userId) {
        // Simplified detection - in reality would use device info, location, etc.
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 17)
            return 'distracted'; // Work hours
        if (hour >= 20 && hour <= 22)
            return 'focused'; // Evening focus time
        return 'mobile'; // Default
    }
}
exports.LearningProfileBuilder = LearningProfileBuilder;
// Helper classes for analysis
class LearningStyleDetector {
    async analyze(sessions, interactions) {
        // Analyze interaction patterns, content preferences, etc.
        // Simplified implementation
        const styles = ['visual', 'auditory', 'kinesthetic', 'mixed'];
        return styles[Math.floor(Math.random() * styles.length)];
    }
}
class CognitiveLoadAnalyzer {
    async analyze(sessions) {
        if (!sessions || sessions.length === 0)
            return 'medium';
        // Analyze session complexity, multitasking, completion rates
        const avgComplexity = sessions.reduce((sum, s) => sum + (s.difficulty || 5), 0) / sessions.length;
        const avgCompletion = sessions.reduce((sum, s) => sum + (s.completionRate || 0.5), 0) / sessions.length;
        if (avgComplexity > 7 && avgCompletion > 0.8)
            return 'high';
        if (avgComplexity < 4 || avgCompletion < 0.6)
            return 'low';
        return 'medium';
    }
}
class AttentionSpanCalculator {
    async calculate(sessions) {
        if (!sessions || sessions.length === 0)
            return 30;
        // Find optimal session length based on completion rates
        const completedSessions = sessions.filter(s => s.completionRate >= 0.8);
        if (completedSessions.length === 0)
            return 30;
        const avgDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0) / completedSessions.length;
        return Math.round(avgDuration);
    }
}
//# sourceMappingURL=profile-builder.js.map