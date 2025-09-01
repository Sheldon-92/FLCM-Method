"use strict";
/**
 * Publisher Agent
 * Multi-platform content adaptation and publishing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.publisherAgent = exports.PublisherAgent = void 0;
const base_agent_1 = require("../base-agent");
const document_schema_1 = require("../../shared/pipeline/document-schema");
const logger_1 = require("../../shared/utils/logger");
// Import platform adapters
const xiaohongshu_adapter_1 = require("./adapters/xiaohongshu-adapter");
const zhihu_adapter_1 = require("./adapters/zhihu-adapter");
const wechat_adapter_1 = require("./adapters/wechat-adapter");
const linkedin_adapter_1 = require("./adapters/linkedin-adapter");
const logger = (0, logger_1.createLogger)('PublisherAgent');
/**
 * Publisher Agent Implementation
 */
class PublisherAgent extends base_agent_1.BaseAgent {
    constructor() {
        super();
        this.id = 'publisher';
        this.name = 'Publisher Agent';
        this.version = '2.0.0';
        this.adapters = new Map();
        this.publishQueue = [];
        this.publishingStats = {
            totalPublished: 0,
            platformDistribution: {},
            averageOptimizationScore: 0,
            failureRate: 0,
        };
        this.initializeAdapters();
        this.startQueueProcessor();
    }
    /**
     * Get agent capabilities
     */
    getCapabilities() {
        return [
            {
                id: 'multi-platform-publishing',
                name: 'Multi-Platform Publishing',
                description: 'Adapt and publish to multiple platforms',
                inputTypes: ['content'],
                outputTypes: ['platform-content'],
            },
            {
                id: 'content-optimization',
                name: 'Content Optimization',
                description: 'Optimize content for each platform',
                inputTypes: ['content'],
                outputTypes: ['optimized-content'],
            },
            {
                id: 'schedule-management',
                name: 'Schedule Management',
                description: 'Schedule posts for optimal times',
                inputTypes: ['schedule'],
                outputTypes: ['scheduled-posts'],
            },
        ];
    }
    /**
     * Initialize platform adapters
     */
    initializeAdapters() {
        this.adapters.set('xiaohongshu', new xiaohongshu_adapter_1.XiaohongshuAdapter());
        this.adapters.set('zhihu', new zhihu_adapter_1.ZhihuAdapter());
        this.adapters.set('wechat', new wechat_adapter_1.WechatAdapter());
        this.adapters.set('linkedin', new linkedin_adapter_1.LinkedInAdapter());
    }
    /**
     * Main publishing method
     */
    async publish(content, options) {
        const startTime = Date.now();
        try {
            logger.info(`Publishing to ${options.platforms.length} platforms`);
            const results = [];
            for (const platform of options.platforms) {
                try {
                    // Adapt content for platform
                    const platformContent = await this.adaptForPlatform(content, platform);
                    // Optimize if requested
                    if (options.optimize) {
                        await this.optimizeContent(platformContent);
                    }
                    // Generate visuals if requested
                    if (options.generateVisuals) {
                        platformContent.visualSuggestions = await this.generateVisualSuggestions(platformContent.body, platform);
                    }
                    // Schedule or publish immediately
                    if (options.schedule && !options.schedule.immediate) {
                        await this.schedulePost(content, platform, options.schedule);
                        results.push({
                            platform,
                            success: true,
                            content: platformContent,
                            metrics: {
                                optimizationScore: platformContent.metadata.optimizationScore,
                                expectedReach: this.calculateExpectedReach(platform),
                                bestTime: this.getOptimalTime(platform),
                            },
                        });
                    }
                    else {
                        // Publish immediately
                        const publishedDoc = await this.publishToPlatform(platformContent, platform);
                        results.push({
                            platform,
                            success: true,
                            content: platformContent,
                            publishedUrl: publishedDoc.metadata.publishedUrl,
                            metrics: {
                                optimizationScore: platformContent.metadata.optimizationScore,
                                expectedReach: this.calculateExpectedReach(platform),
                            },
                        });
                    }
                    // Update statistics
                    this.updateStats(platform, true, platformContent.metadata.optimizationScore);
                }
                catch (error) {
                    logger.error(`Failed to publish to ${platform}:`, error);
                    results.push({
                        platform,
                        success: false,
                        content: {},
                        error: error.message,
                    });
                    this.updateStats(platform, false, 0);
                }
            }
            logger.info(`Publishing completed in ${Date.now() - startTime}ms`);
            return results;
        }
        catch (error) {
            logger.error('Publishing failed:', error);
            throw error;
        }
    }
    /**
     * Adapt content for specific platform
     */
    async adaptForPlatform(content, platform) {
        const adapter = this.adapters.get(platform);
        if (!adapter) {
            throw new Error(`No adapter available for platform: ${platform}`);
        }
        logger.debug(`Adapting content for ${platform}`);
        return adapter.adapt(content);
    }
    /**
     * Optimize content for platform
     */
    async optimizeContent(content) {
        const adapter = this.adapters.get(content.platform);
        if (adapter) {
            const optimized = await adapter.optimize(content);
            Object.assign(content, optimized);
        }
    }
    /**
     * Generate hashtags for content
     */
    optimizeHashtags(content, platform) {
        const adapter = this.adapters.get(platform);
        if (!adapter) {
            return this.generateDefaultHashtags(content);
        }
        return adapter.generateHashtags(content);
    }
    /**
     * Optimize content length
     */
    optimizeLength(content, maxLength) {
        if (content.length <= maxLength) {
            return content;
        }
        // Smart truncation - try to end at sentence boundary
        const truncated = content.substring(0, maxLength);
        const lastSentence = truncated.lastIndexOf('') || truncated.lastIndexOf('.');
        if (lastSentence > maxLength * 0.8) {
            return truncated.substring(0, lastSentence + 1);
        }
        // Fallback to word boundary
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > maxLength * 0.8) {
            return truncated.substring(0, lastSpace) + '...';
        }
        return truncated.substring(0, maxLength - 3) + '...';
    }
    /**
     * Generate visual suggestions
     */
    async generateVisualSuggestions(content, platform) {
        const adapter = this.adapters.get(platform);
        if (!adapter) {
            return this.generateDefaultVisuals(content);
        }
        return adapter.suggestVisuals(content);
    }
    /**
     * Schedule a post
     */
    async schedule(content, schedule, platforms) {
        for (const platform of platforms) {
            await this.schedulePost(content, platform, schedule);
        }
    }
    /**
     * Schedule post for single platform
     */
    async schedulePost(content, platform, schedule) {
        const scheduledTime = schedule.optimalTime
            ? this.calculateOptimalTime(platform)
            : schedule.scheduledTime || new Date();
        const post = {
            id: this.generatePostId(),
            content,
            platforms: [platform],
            scheduledTime,
            status: 'pending',
        };
        this.publishQueue.push(post);
        logger.info(`Post scheduled for ${platform} at ${scheduledTime}`);
    }
    /**
     * Get publishing queue
     */
    getQueue() {
        return [...this.publishQueue];
    }
    /**
     * Publish to platform (simulated)
     */
    async publishToPlatform(content, platform) {
        // In production, this would call actual platform APIs
        logger.info(`Publishing to ${platform}...`);
        const doc = (0, document_schema_1.createPlatformDocument)('content-id', platform, ['optimized', 'scheduled'], this.formatPlatformContent(content), 'Publisher Agent');
        doc.title = content.title;
        doc.body = content.body;
        doc.hashtags = content.hashtags;
        doc.metadata.publishedUrl = `https://${platform}.com/post/${Date.now()}`;
        return doc;
    }
    /**
     * Format platform content as string
     */
    formatPlatformContent(content) {
        const sections = [];
        sections.push(content.title);
        sections.push('');
        sections.push(content.body);
        if (content.hashtags.length > 0) {
            sections.push('');
            sections.push(content.hashtags.map(h => `#${h}`).join(' '));
        }
        return sections.join('\n');
    }
    /**
     * Start queue processor
     */
    startQueueProcessor() {
        setInterval(() => {
            this.processQueue();
        }, 60000); // Check every minute
    }
    /**
     * Process publishing queue
     */
    async processQueue() {
        const now = new Date();
        const pending = this.publishQueue.filter(post => post.status === 'pending' && post.scheduledTime <= now);
        for (const post of pending) {
            post.status = 'publishing';
            try {
                for (const platform of post.platforms) {
                    const platformContent = await this.adaptForPlatform(post.content, platform);
                    await this.publishToPlatform(platformContent, platform);
                }
                post.status = 'published';
                logger.info(`Published scheduled post ${post.id}`);
            }
            catch (error) {
                post.status = 'failed';
                logger.error(`Failed to publish scheduled post ${post.id}:`, error);
            }
        }
        // Clean up old posts
        this.publishQueue = this.publishQueue.filter(post => post.status === 'pending' ||
            (post.status === 'published' &&
                post.scheduledTime > new Date(Date.now() - 86400000)) // Keep for 24h
        );
    }
    /**
     * Calculate optimal publishing time
     */
    calculateOptimalTime(platform) {
        const adapter = this.adapters.get(platform);
        const optimalTime = adapter?.getOptimalTime() || '09:00';
        const [hours, minutes] = optimalTime.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        // If time has passed today, schedule for tomorrow
        if (scheduledTime < new Date()) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        return scheduledTime;
    }
    /**
     * Get optimal time for platform
     */
    getOptimalTime(platform) {
        const adapter = this.adapters.get(platform);
        return adapter?.getOptimalTime() || '09:00';
    }
    /**
     * Calculate expected reach
     */
    calculateExpectedReach(platform) {
        // Simplified calculation based on platform
        const baseReach = {
            xiaohongshu: 5000,
            zhihu: 10000,
            wechat: 3000,
            linkedin: 2000,
        };
        return baseReach[platform] || 1000;
    }
    /**
     * Generate default hashtags
     */
    generateDefaultHashtags(content) {
        const words = content.toLowerCase().split(/\s+/);
        const keywords = words
            .filter(w => w.length > 5)
            .map(w => w.replace(/[^a-z0-9]/g, ''))
            .filter(w => w.length > 0);
        // Get unique keywords
        const unique = [...new Set(keywords)];
        return unique.slice(0, 5);
    }
    /**
     * Generate default visual suggestions
     */
    generateDefaultVisuals(content) {
        return [
            {
                type: 'cover',
                description: 'Eye-catching header image',
                style: 'modern',
                elements: ['title', 'subtitle', 'brand'],
            },
        ];
    }
    /**
     * Generate post ID
     */
    generatePostId() {
        return `post-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
    /**
     * Update statistics
     */
    updateStats(platform, success, score) {
        this.publishingStats.totalPublished++;
        this.publishingStats.platformDistribution[platform] =
            (this.publishingStats.platformDistribution[platform] || 0) + 1;
        if (!success) {
            this.publishingStats.failureRate =
                (this.publishingStats.failureRate * (this.publishingStats.totalPublished - 1) + 1) /
                    this.publishingStats.totalPublished;
        }
        else {
            this.publishingStats.failureRate =
                (this.publishingStats.failureRate * (this.publishingStats.totalPublished - 1)) /
                    this.publishingStats.totalPublished;
        }
        if (score > 0) {
            const n = this.publishingStats.totalPublished;
            this.publishingStats.averageOptimizationScore =
                (this.publishingStats.averageOptimizationScore * (n - 1) + score) / n;
        }
    }
    /**
     * Process agent request
     */
    async processRequest(request) {
        try {
            const content = request.data.content;
            const options = request.data.options;
            const results = await this.publish(content, options);
            return {
                success: true,
                data: results,
                metadata: {
                    processingTime: Date.now() - request.timestamp.getTime(),
                    agent: this.id,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: {
                    agent: this.id,
                },
            };
        }
    }
    /**
     * Agent lifecycle methods
     */
    async onInitialize() {
        logger.info('Publisher Agent initializing...');
    }
    async onStart() {
        logger.info('Publisher Agent started');
    }
    async onStop() {
        logger.info('Publisher Agent stopping...');
        // Save queue state
    }
    async onShutdown() {
        logger.info('Publisher Agent shutting down...');
        this.adapters.clear();
        this.publishQueue = [];
    }
}
exports.PublisherAgent = PublisherAgent;
// Export singleton instance
exports.publisherAgent = new PublisherAgent();
//# sourceMappingURL=index.js.map