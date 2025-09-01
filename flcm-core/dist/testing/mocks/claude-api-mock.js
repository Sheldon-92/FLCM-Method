"use strict";
/**
 * Claude API Mock for Testing
 * Provides comprehensive mocking capabilities for Claude API interactions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupClaudeMockForJest = exports.ClaudeMockFactory = exports.resetClaudeAPIMock = exports.getClaudeAPIMock = exports.ClaudeAPIMock = void 0;
const events_1 = require("events");
/**
 * Claude API Mock Class
 */
class ClaudeAPIMock extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.requestHistory = [];
        this.scenarios = [];
        this.usageStats = {
            totalRequests: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            errorCount: 0,
            rateLimitHits: 0
        };
        this.rateLimitTracker = [];
        this.isRecording = false;
        this.config = {
            apiKey: config.apiKey || 'mock-api-key',
            baseURL: config.baseURL || 'https://api.anthropic.com',
            defaultModel: config.defaultModel || 'claude-3-sonnet-20240229',
            rateLimitPerMinute: config.rateLimitPerMinute || 60,
            enableLatencySimulation: config.enableLatencySimulation ?? true,
            averageLatency: config.averageLatency || 2000,
            errorRate: config.errorRate || 0,
            enableUsageTracking: config.enableUsageTracking ?? true
        };
        this.setupDefaultScenarios();
    }
    /**
     * Mock a Claude API message request
     */
    async messages(request) {
        const startTime = Date.now();
        // Track request
        if (this.config.enableUsageTracking) {
            this.usageStats.totalRequests++;
        }
        // Check rate limiting
        if (this.isRateLimited()) {
            this.usageStats.rateLimitHits++;
            const error = new Error('Rate limit exceeded');
            error.status = 429;
            throw error;
        }
        // Simulate random errors based on error rate
        if (Math.random() < this.config.errorRate) {
            this.usageStats.errorCount++;
            const error = new Error('Simulated API error');
            error.status = 500;
            throw error;
        }
        // Find matching scenario
        const matchingScenario = this.findMatchingScenario(request);
        let response;
        if (matchingScenario) {
            if (matchingScenario.response instanceof Error) {
                this.usageStats.errorCount++;
                throw matchingScenario.response;
            }
            response = matchingScenario.response;
            // Apply scenario delay
            if (matchingScenario.delay) {
                await this.delay(matchingScenario.delay);
            }
        }
        else {
            // Default response generation
            response = this.generateDefaultResponse(request);
        }
        // Simulate latency
        if (this.config.enableLatencySimulation) {
            const latency = this.calculateLatency();
            await this.delay(latency);
        }
        // Track usage
        if (this.config.enableUsageTracking) {
            this.usageStats.totalInputTokens += response.usage.input_tokens;
            this.usageStats.totalOutputTokens += response.usage.output_tokens;
        }
        // Record interaction
        const latency = Date.now() - startTime;
        this.recordInteraction(request, response, latency);
        // Emit events
        this.emit('request', request);
        this.emit('response', response);
        return response;
    }
    /**
     * Add a custom scenario
     */
    addScenario(scenario) {
        this.scenarios.push(scenario);
    }
    /**
     * Add multiple scenarios
     */
    addScenarios(scenarios) {
        this.scenarios.push(...scenarios);
    }
    /**
     * Clear all custom scenarios
     */
    clearScenarios() {
        this.scenarios = [];
        this.setupDefaultScenarios();
    }
    /**
     * Start recording interactions
     */
    startRecording() {
        this.isRecording = true;
        this.requestHistory = [];
    }
    /**
     * Stop recording and return history
     */
    stopRecording() {
        this.isRecording = false;
        return [...this.requestHistory];
    }
    /**
     * Get usage statistics
     */
    getUsageStats() {
        return { ...this.usageStats };
    }
    /**
     * Get request history
     */
    getRequestHistory() {
        return [...this.requestHistory];
    }
    /**
     * Reset all statistics and history
     */
    reset() {
        this.requestHistory = [];
        this.usageStats = {
            totalRequests: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            errorCount: 0,
            rateLimitHits: 0
        };
        this.rateLimitTracker = [];
    }
    /**
     * Simulate network error
     */
    simulateNetworkError() {
        this.addScenario({
            name: 'Network Error',
            condition: () => true,
            response: new Error('Network error: Connection failed'),
            probability: 1.0
        });
    }
    /**
     * Simulate rate limiting
     */
    simulateRateLimit() {
        // Force rate limit by filling tracker
        const now = Date.now();
        for (let i = 0; i < this.config.rateLimitPerMinute; i++) {
            this.rateLimitTracker.push({ timestamp: now });
        }
    }
    /**
     * Create a mock for specific agent responses
     */
    mockAgentResponse(agentType, content) {
        this.addScenario({
            name: `${agentType} mock response`,
            condition: (request) => {
                const systemMessage = request.system || '';
                return systemMessage.toLowerCase().includes(agentType);
            },
            response: this.createMockResponse(content, request => this.estimateTokens(request.messages))
        });
    }
    /**
     * Mock methodology-specific responses
     */
    mockMethodologyResponse(methodology, analysisResult) {
        this.addScenario({
            name: `${methodology} methodology mock`,
            condition: (request) => {
                const content = JSON.stringify(request);
                return content.toLowerCase().includes(methodology.toLowerCase());
            },
            response: this.createMockResponse(JSON.stringify(analysisResult))
        });
    }
    /**
     * Create a mock response with specific structure
     */
    createMockResponse(content, tokenCounter) {
        const tokens = tokenCounter ? tokenCounter({}) : { input: 100, output: content.length / 4 };
        return {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'message',
            role: 'assistant',
            content: [{
                    type: 'text',
                    text: content
                }],
            model: this.config.defaultModel,
            stop_reason: 'end_turn',
            usage: {
                input_tokens: Math.round(tokens.input),
                output_tokens: Math.round(tokens.output)
            }
        };
    }
    /**
     * Setup default scenarios for common patterns
     */
    setupDefaultScenarios() {
        // Analysis request pattern
        this.addScenario({
            name: 'Analysis Request',
            condition: (request) => {
                const content = JSON.stringify(request).toLowerCase();
                return content.includes('analyze') || content.includes('analysis');
            },
            response: this.createMockResponse(`
        Based on the analysis request, here are the key findings:
        
        1. **Main Themes**: The content shows strong focus areas in technology and innovation
        2. **Depth Assessment**: The analysis demonstrates level 3 understanding (practical application)
        3. **Voice Characteristics**: Professional yet accessible tone with technical precision
        4. **Recommendations**: Consider expanding on implementation details for greater impact
        
        The analysis indicates high potential for content creation with suggested improvements in narrative structure.
      `)
        });
        // Content generation pattern
        this.addScenario({
            name: 'Content Generation',
            condition: (request) => {
                const content = JSON.stringify(request).toLowerCase();
                return content.includes('create') || content.includes('generate') || content.includes('write');
            },
            response: this.createMockResponse(`
        # The Future of AI in Content Creation

        Artificial intelligence is transforming how we approach content creation, offering unprecedented opportunities for efficiency and creativity.

        ## Key Benefits
        - **Efficiency**: Automated content generation reduces time-to-market
        - **Consistency**: AI maintains brand voice across all content
        - **Personalization**: Dynamic content adaptation for different audiences

        ## Implementation Strategy
        The key to successful AI integration lies in finding the right balance between automation and human creativity.

        What are your thoughts on this approach? I'd love to hear your perspective on AI-assisted content creation.
      `)
        });
        // Error scenario for testing resilience
        this.addScenario({
            name: 'Occasional Timeout',
            condition: () => Math.random() < 0.05,
            response: (() => {
                const error = new Error('Request timeout');
                error.status = 408;
                return error;
            })(),
            delay: 5000
        });
    }
    /**
     * Find matching scenario for request
     */
    findMatchingScenario(request) {
        for (const scenario of this.scenarios) {
            if (scenario.condition(request)) {
                // Check probability if specified
                if (scenario.probability && Math.random() > scenario.probability) {
                    continue;
                }
                return scenario;
            }
        }
        return null;
    }
    /**
     * Generate default response when no scenario matches
     */
    generateDefaultResponse(request) {
        const userMessage = request.messages[request.messages.length - 1]?.content || '';
        const tokens = this.estimateTokens(request.messages);
        let responseContent = 'I understand your request. ';
        // Add contextual response based on content
        if (userMessage.toLowerCase().includes('question')) {
            responseContent += 'Let me provide you with a comprehensive answer based on the information provided.';
        }
        else if (userMessage.toLowerCase().includes('analyze')) {
            responseContent += 'Here\'s my analysis of the provided content with key insights and recommendations.';
        }
        else {
            responseContent += 'I\'ve processed your request and here\'s my response based on the context provided.';
        }
        return this.createMockResponse(responseContent, () => tokens);
    }
    /**
     * Estimate token count (rough approximation)
     */
    estimateTokens(messages) {
        const totalInputLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
        return {
            input: Math.round(totalInputLength / 4),
            output: 150 // Default output token estimate
        };
    }
    /**
     * Check if rate limited
     */
    isRateLimited() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        // Clean old entries
        this.rateLimitTracker = this.rateLimitTracker.filter(entry => entry.timestamp > oneMinuteAgo);
        // Check if over limit
        if (this.rateLimitTracker.length >= this.config.rateLimitPerMinute) {
            return true;
        }
        // Add current request
        this.rateLimitTracker.push({ timestamp: now });
        return false;
    }
    /**
     * Calculate simulated latency
     */
    calculateLatency() {
        // Add some randomness to make it realistic
        const variation = this.config.averageLatency * 0.3;
        return this.config.averageLatency + (Math.random() - 0.5) * variation * 2;
    }
    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Record interaction for history
     */
    recordInteraction(request, response, latency) {
        if (this.isRecording) {
            this.requestHistory.push({
                request,
                response,
                timestamp: new Date(),
                latency
            });
        }
    }
}
exports.ClaudeAPIMock = ClaudeAPIMock;
/**
 * Global mock instance for shared use
 */
let globalMock = null;
/**
 * Get or create global Claude API mock instance
 */
function getClaudeAPIMock(config) {
    if (!globalMock) {
        globalMock = new ClaudeAPIMock(config);
    }
    return globalMock;
}
exports.getClaudeAPIMock = getClaudeAPIMock;
/**
 * Reset global mock instance
 */
function resetClaudeAPIMock() {
    globalMock = null;
}
exports.resetClaudeAPIMock = resetClaudeAPIMock;
/**
 * Mock factory for common test scenarios
 */
class ClaudeMockFactory {
    /**
     * Create mock for successful analysis
     */
    static createSuccessfulAnalysisMock() {
        const mock = new ClaudeAPIMock();
        mock.addScenario({
            name: 'Successful Analysis',
            condition: () => true,
            response: mock['createMockResponse'](`
        {
          "concept": {
            "name": "Machine Learning",
            "definition": "A subset of AI that enables systems to learn automatically",
            "context": "Computer Science",
            "importance": 9
          },
          "currentDepth": 3,
          "teachingReady": true,
          "gaps": ["Advanced algorithms", "Real-world applications"],
          "nextSteps": ["Practice with datasets", "Study neural networks"]
        }
      `)
        });
        return mock;
    }
    /**
     * Create mock for content creation
     */
    static createContentCreationMock() {
        const mock = new ClaudeAPIMock();
        mock.addScenario({
            name: 'Content Creation',
            condition: () => true,
            response: mock['createMockResponse'](`
        # Understanding Machine Learning: A Beginner's Guide
        
        Machine learning is revolutionizing how computers process information...
        
        ## Key Concepts
        - Algorithms that learn from data
        - Pattern recognition capabilities  
        - Predictive modeling applications
        
        ## Practical Applications
        From recommendation systems to autonomous vehicles, ML is everywhere.
      `)
        });
        return mock;
    }
    /**
     * Create mock that simulates network errors
     */
    static createErrorMock() {
        const mock = new ClaudeAPIMock({ errorRate: 0.5 });
        return mock;
    }
    /**
     * Create mock with high latency
     */
    static createHighLatencyMock() {
        return new ClaudeAPIMock({
            enableLatencySimulation: true,
            averageLatency: 10000 // 10 seconds
        });
    }
}
exports.ClaudeMockFactory = ClaudeMockFactory;
/**
 * Jest mock setup helper
 */
function setupClaudeMockForJest(mock) {
    // Mock the actual Claude client
    jest.mock('@anthropic-ai/sdk', () => {
        return {
            default: jest.fn().mockImplementation(() => ({
                messages: {
                    create: jest.fn().mockImplementation((request) => mock.messages(request))
                }
            }))
        };
    });
}
exports.setupClaudeMockForJest = setupClaudeMockForJest;
//# sourceMappingURL=claude-api-mock.js.map