"use strict";
/**
 * Unit Tests for Feedback Collector
 */
Object.defineProperty(exports, "__esModule", { value: true });
const feedback_collector_1 = require("../feedback-collector");
describe('FeedbackCollector', () => {
    let feedbackCollector;
    beforeEach(() => {
        feedbackCollector = new feedback_collector_1.FeedbackCollector();
    });
    describe('Constructor', () => {
        test('should initialize properly', () => {
            expect(feedbackCollector).toBeDefined();
            expect(feedbackCollector).toBeInstanceOf(feedback_collector_1.FeedbackCollector);
        });
        test('should accept configuration options', () => {
            const config = {
                enableAutoAnalysis: false,
                maxFeedbackEntries: 500,
                enableNotifications: false
            };
            const customCollector = new feedback_collector_1.FeedbackCollector(config);
            expect(customCollector).toBeInstanceOf(feedback_collector_1.FeedbackCollector);
        });
    });
    describe('collectFeedback', () => {
        test('should collect basic user feedback', async () => {
            const feedback = await feedbackCollector.collectFeedback('user123', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'The generated content was excellent!', 5);
            expect(feedback).toBeDefined();
            expect(feedback.id).toBeDefined();
            expect(feedback.userId).toBe('user123');
            expect(feedback.category).toBe(feedback_collector_1.FeedbackCategory.CONTENT_QUALITY);
            expect(feedback.rating).toBe(5);
            expect(feedback.timestamp).toBeInstanceOf(Date);
        });
        test('should validate rating range', async () => {
            await expect(feedbackCollector.collectFeedback('user123', feedback_collector_1.FeedbackCategory.USABILITY, 'Test feedback', 6 // Invalid rating > 5
            )).rejects.toThrow('Rating must be between 1 and 5');
            await expect(feedbackCollector.collectFeedback('user123', feedback_collector_1.FeedbackCategory.USABILITY, 'Test feedback', 0 // Invalid rating < 1
            )).rejects.toThrow('Rating must be between 1 and 5');
        });
        test('should handle feedback with context', async () => {
            const context = {
                agentId: 'scholar',
                taskId: 'task-123',
                workflow: 'analysis',
                platform: 'linkedin'
            };
            const feedback = await feedbackCollector.collectFeedback('user123', feedback_collector_1.FeedbackCategory.PERFORMANCE, 'Agent performed well but could be faster', 4, context);
            expect(feedback.context).toEqual(context);
        });
        test('should auto-categorize feedback based on content', async () => {
            const performanceFeedback = await feedbackCollector.collectFeedback('user123', feedback_collector_1.FeedbackCategory.GENERAL, 'The system is running very slowly today', 2);
            const contentFeedback = await feedbackCollector.collectFeedback('user123', feedback_collector_1.FeedbackCategory.GENERAL, 'The generated article was well-written and engaging', 5);
            // Should auto-categorize based on keywords
            expect(performanceFeedback.suggestedCategory).toBe(feedback_collector_1.FeedbackCategory.PERFORMANCE);
            expect(contentFeedback.suggestedCategory).toBe(feedback_collector_1.FeedbackCategory.CONTENT_QUALITY);
        });
    });
    describe('getFeedback', () => {
        beforeEach(async () => {
            // Add test feedback entries
            await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'Great content!', 5);
            await feedbackCollector.collectFeedback('user2', feedback_collector_1.FeedbackCategory.PERFORMANCE, 'Too slow', 2);
            await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.USABILITY, 'Easy to use', 4);
        });
        test('should return all feedback when no filters applied', () => {
            const allFeedback = feedbackCollector.getFeedback();
            expect(allFeedback).toHaveLength(3);
        });
        test('should filter feedback by user ID', () => {
            const user1Feedback = feedbackCollector.getFeedback({ userId: 'user1' });
            expect(user1Feedback).toHaveLength(2);
            expect(user1Feedback.every(f => f.userId === 'user1')).toBe(true);
        });
        test('should filter feedback by category', () => {
            const contentFeedback = feedbackCollector.getFeedback({
                category: feedback_collector_1.FeedbackCategory.CONTENT_QUALITY
            });
            expect(contentFeedback).toHaveLength(1);
            expect(contentFeedback[0].category).toBe(feedback_collector_1.FeedbackCategory.CONTENT_QUALITY);
        });
        test('should filter feedback by rating range', () => {
            const highRatedFeedback = feedbackCollector.getFeedback({
                minRating: 4
            });
            expect(highRatedFeedback).toHaveLength(2);
            expect(highRatedFeedback.every(f => f.rating >= 4)).toBe(true);
            const lowRatedFeedback = feedbackCollector.getFeedback({
                maxRating: 3
            });
            expect(lowRatedFeedback).toHaveLength(1);
            expect(lowRatedFeedback.every(f => f.rating <= 3)).toBe(true);
        });
        test('should filter feedback by date range', () => {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const recentFeedback = feedbackCollector.getFeedback({
                startDate: yesterday,
                endDate: tomorrow
            });
            expect(recentFeedback).toHaveLength(3); // All feedback is recent
        });
        test('should limit results when specified', () => {
            const limitedFeedback = feedbackCollector.getFeedback({ limit: 2 });
            expect(limitedFeedback).toHaveLength(2);
        });
    });
    describe('analyzeFeedback', () => {
        beforeEach(async () => {
            // Add diverse feedback for analysis
            await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'Amazing results!', 5);
            await feedbackCollector.collectFeedback('user2', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'Very good quality', 4);
            await feedbackCollector.collectFeedback('user3', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'Content is okay', 3);
            await feedbackCollector.collectFeedback('user4', feedback_collector_1.FeedbackCategory.PERFORMANCE, 'Fast execution', 5);
            await feedbackCollector.collectFeedback('user5', feedback_collector_1.FeedbackCategory.PERFORMANCE, 'Too slow!', 2);
            await feedbackCollector.collectFeedback('user6', feedback_collector_1.FeedbackCategory.USABILITY, 'Hard to understand', 2);
        });
        test('should analyze overall feedback trends', () => {
            const analysis = feedbackCollector.analyzeFeedback();
            expect(analysis.totalFeedback).toBe(6);
            expect(analysis.averageRating).toBeCloseTo(3.5, 1);
            expect(analysis.categoryDistribution).toBeDefined();
            expect(analysis.ratingDistribution).toBeDefined();
            expect(analysis.trends).toBeDefined();
        });
        test('should identify category-specific insights', () => {
            const contentAnalysis = feedbackCollector.analyzeFeedback({
                category: feedback_collector_1.FeedbackCategory.CONTENT_QUALITY
            });
            expect(contentAnalysis.totalFeedback).toBe(3);
            expect(contentAnalysis.averageRating).toBeCloseTo(4, 1);
        });
        test('should identify top issues and strengths', () => {
            const analysis = feedbackCollector.analyzeFeedback();
            expect(analysis.topIssues).toBeInstanceOf(Array);
            expect(analysis.topStrengths).toBeInstanceOf(Array);
            expect(analysis.recommendations).toBeInstanceOf(Array);
        });
        test('should calculate satisfaction scores', () => {
            const analysis = feedbackCollector.analyzeFeedback();
            expect(analysis.satisfactionScore).toBeGreaterThanOrEqual(0);
            expect(analysis.satisfactionScore).toBeLessThanOrEqual(100);
            expect(typeof analysis.npsScore).toBe('number');
        });
    });
    describe('generateInsights', () => {
        beforeEach(async () => {
            // Add feedback with temporal patterns
            const baseTime = Date.now();
            for (let i = 0; i < 30; i++) {
                const timestamp = new Date(baseTime - i * 24 * 60 * 60 * 1000); // 30 days back
                const rating = 3 + Math.sin(i / 5) * 2; // Sine wave pattern for trends
                await feedbackCollector.collectFeedback(`user${i}`, feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'Test feedback', Math.round(Math.max(1, Math.min(5, rating))), {}, timestamp);
            }
        });
        test('should generate trend insights', () => {
            const insights = feedbackCollector.generateInsights();
            expect(insights.trends).toBeDefined();
            expect(insights.trends.ratingTrend).toMatch(/improving|declining|stable/);
            expect(insights.trends.volumeTrend).toMatch(/increasing|decreasing|stable/);
        });
        test('should identify seasonal patterns', () => {
            const insights = feedbackCollector.generateInsights();
            expect(insights.patterns).toBeDefined();
            expect(Array.isArray(insights.patterns.dailyPatterns)).toBe(true);
            expect(Array.isArray(insights.patterns.weeklyPatterns)).toBe(true);
        });
        test('should provide actionable recommendations', () => {
            const insights = feedbackCollector.generateInsights();
            expect(insights.recommendations).toBeInstanceOf(Array);
            expect(insights.recommendations.length).toBeGreaterThan(0);
            expect(insights.recommendations[0]).toHaveProperty('priority');
            expect(insights.recommendations[0]).toHaveProperty('action');
        });
    });
    describe('exportFeedback', () => {
        beforeEach(async () => {
            await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'Test 1', 5);
            await feedbackCollector.collectFeedback('user2', feedback_collector_1.FeedbackCategory.PERFORMANCE, 'Test 2', 3);
        });
        test('should export feedback as JSON', () => {
            const jsonExport = feedbackCollector.exportFeedback('json');
            expect(typeof jsonExport).toBe('string');
            expect(() => JSON.parse(jsonExport)).not.toThrow();
            const parsed = JSON.parse(jsonExport);
            expect(parsed.feedback).toHaveLength(2);
            expect(parsed.exportedAt).toBeDefined();
        });
        test('should export feedback as CSV', () => {
            const csvExport = feedbackCollector.exportFeedback('csv');
            expect(typeof csvExport).toBe('string');
            expect(csvExport).toContain('id,userId,category,rating');
            expect(csvExport.split('\n')).toHaveLength(4); // Header + 2 data rows + empty line
        });
        test('should export with filters applied', () => {
            const filteredExport = feedbackCollector.exportFeedback('json', {
                category: feedback_collector_1.FeedbackCategory.CONTENT_QUALITY
            });
            const parsed = JSON.parse(filteredExport);
            expect(parsed.feedback).toHaveLength(1);
            expect(parsed.feedback[0].category).toBe(feedback_collector_1.FeedbackCategory.CONTENT_QUALITY);
        });
    });
    describe('Feedback Notifications', () => {
        test('should trigger notifications for critical feedback', async () => {
            const notificationSpy = jest.fn();
            feedbackCollector.onCriticalFeedback(notificationSpy);
            await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.BUG_REPORT, 'Critical system failure!', 1);
            expect(notificationSpy).toHaveBeenCalledWith(expect.objectContaining({
                rating: 1,
                category: feedback_collector_1.FeedbackCategory.BUG_REPORT
            }));
        });
        test('should not trigger notifications for normal feedback', async () => {
            const notificationSpy = jest.fn();
            feedbackCollector.onCriticalFeedback(notificationSpy);
            await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'Good job!', 4);
            expect(notificationSpy).not.toHaveBeenCalled();
        });
    });
    describe('Sentiment Analysis', () => {
        test('should analyze sentiment in feedback text', async () => {
            const positiveFeedback = await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'I absolutely love this amazing feature! It works perfectly and exceeds expectations.', 5);
            const negativeFeedback = await feedbackCollector.collectFeedback('user2', feedback_collector_1.FeedbackCategory.USABILITY, 'This is terrible and frustrating. Nothing works as expected.', 1);
            expect(positiveFeedback.sentiment).toBeDefined();
            expect(positiveFeedback.sentiment?.polarity).toBeGreaterThan(0);
            expect(positiveFeedback.sentiment?.magnitude).toBeGreaterThan(0);
            expect(negativeFeedback.sentiment).toBeDefined();
            expect(negativeFeedback.sentiment?.polarity).toBeLessThan(0);
        });
        test('should identify emotional keywords', async () => {
            const feedback = await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.GENERAL, 'I am extremely disappointed with the slow performance and buggy interface', 2);
            expect(feedback.keywords).toContain('disappointed');
            expect(feedback.keywords).toContain('slow');
            expect(feedback.keywords).toContain('buggy');
        });
    });
    describe('User Satisfaction Tracking', () => {
        test('should track user satisfaction over time', async () => {
            // Add feedback for same user over time
            for (let i = 0; i < 5; i++) {
                await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, `Feedback ${i}`, 3 + i % 3 // Ratings: 3, 4, 5, 3, 4
                );
            }
            const userSatisfaction = feedbackCollector.getUserSatisfactionHistory('user1');
            expect(userSatisfaction).toBeDefined();
            expect(userSatisfaction.ratings).toHaveLength(5);
            expect(userSatisfaction.averageRating).toBeCloseTo(3.8, 1);
            expect(userSatisfaction.trend).toMatch(/improving|declining|stable/);
        });
        test('should calculate Net Promoter Score', () => {
            // Add feedback to calculate NPS
            const feedbackData = [
                { rating: 5, category: feedback_collector_1.FeedbackCategory.GENERAL },
                { rating: 5, category: feedback_collector_1.FeedbackCategory.GENERAL },
                { rating: 4, category: feedback_collector_1.FeedbackCategory.GENERAL },
                { rating: 3, category: feedback_collector_1.FeedbackCategory.GENERAL },
                { rating: 2, category: feedback_collector_1.FeedbackCategory.GENERAL },
                { rating: 1, category: feedback_collector_1.FeedbackCategory.GENERAL }
            ];
            feedbackData.forEach(async (data, index) => {
                await feedbackCollector.collectFeedback(`user${index}`, data.category, 'Test feedback', data.rating);
            });
            const nps = feedbackCollector.calculateNPS();
            expect(typeof nps).toBe('number');
            expect(nps).toBeGreaterThanOrEqual(-100);
            expect(nps).toBeLessThanOrEqual(100);
        });
    });
    describe('Edge Cases and Error Handling', () => {
        test('should handle empty feedback text', async () => {
            const feedback = await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.GENERAL, '', 3);
            expect(feedback).toBeDefined();
            expect(feedback.text).toBe('');
        });
        test('should handle very long feedback text', async () => {
            const longText = 'a'.repeat(10000);
            const feedback = await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.GENERAL, longText, 3);
            expect(feedback.text.length).toBeLessThanOrEqual(5000); // Should be truncated
        });
        test('should handle invalid user IDs gracefully', async () => {
            await expect(feedbackCollector.collectFeedback('', feedback_collector_1.FeedbackCategory.GENERAL, 'Test', 3)).rejects.toThrow('User ID cannot be empty');
            await expect(feedbackCollector.collectFeedback(null, feedback_collector_1.FeedbackCategory.GENERAL, 'Test', 3)).rejects.toThrow('User ID is required');
        });
        test('should handle concurrent feedback collection', async () => {
            const promises = [];
            for (let i = 0; i < 100; i++) {
                promises.push(feedbackCollector.collectFeedback(`user${i}`, feedback_collector_1.FeedbackCategory.GENERAL, `Feedback ${i}`, (i % 5) + 1));
            }
            const results = await Promise.all(promises);
            expect(results).toHaveLength(100);
            expect(results.every(r => r.id)).toBe(true);
        });
    });
    describe('Data Persistence', () => {
        test('should persist feedback to storage', async () => {
            const feedback = await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.CONTENT_QUALITY, 'Test feedback', 4);
            // Simulate restart
            const newCollector = new feedback_collector_1.FeedbackCollector();
            const retrieved = newCollector.getFeedback({ id: feedback.id });
            expect(retrieved).toHaveLength(1);
            expect(retrieved[0].id).toBe(feedback.id);
        });
        test('should handle storage errors gracefully', async () => {
            // Mock storage failure
            jest.spyOn(feedbackCollector, 'saveFeedback').mockRejectedValueOnce(new Error('Storage unavailable'));
            // Should still return feedback object even if save fails
            const feedback = await feedbackCollector.collectFeedback('user1', feedback_collector_1.FeedbackCategory.GENERAL, 'Test', 3);
            expect(feedback).toBeDefined();
            expect(feedback.id).toBeDefined();
        });
    });
});
//# sourceMappingURL=feedback-collector.test.js.map