"use strict";
/**
 * FLCM Main Agent Tests
 * Comprehensive unit tests for the main FLCM agent
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
const flcm_main_1 = require("../flcm-main");
const base_agent_1 = require("../base-agent");
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
// Mock dependencies
jest.mock('fs');
jest.mock('winston', () => ({
    createLogger: jest.fn(() => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        setLevel: jest.fn(),
        end: jest.fn()
    })),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        errors: jest.fn(),
        printf: jest.fn(),
        colorize: jest.fn()
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn()
    }
}));
const mockFs = fs;
// Mock agent for testing
class MockAgent extends base_agent_1.BaseAgent {
    isHealthy() {
        return this.state.status === 'ready';
    }
    async process(request) {
        return {
            id: request.id,
            success: true,
            data: { processed: true },
            timestamp: new Date(),
            processingTime: 100
        };
    }
    async onInit() {
        // Mock initialization
    }
    async onExecute(input) {
        return { ...input, metadata: { ...input.metadata, processed: true } };
    }
    async onCleanup() {
        // Mock cleanup
    }
    validateInput(input) {
        if (!input.id)
            throw new Error('ID required');
    }
}
describe('FLCMAgent', () => {
    let flcmAgent;
    let mockAgent;
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock file system
        mockFs.existsSync.mockImplementation((path) => {
            if (path.includes('core-config.yaml'))
                return true;
            return false;
        });
        mockFs.readFileSync.mockImplementation((path) => {
            if (path.includes('core-config.yaml')) {
                return yaml.dump({
                    flcm: {
                        version: "2.0",
                        logLevel: "info",
                        timeout: 30000,
                        retryAttempts: 3,
                        agents: {
                            scholar: { enabled: true, priority: 1, timeout: 5000, retryAttempts: 3 },
                            creator: { enabled: true, priority: 2, timeout: 10000, retryAttempts: 3 },
                            publisher: { enabled: true, priority: 3, timeout: 15000, retryAttempts: 2 }
                        }
                    }
                });
            }
            return '';
        });
        mockFs.mkdirSync.mockImplementation(() => { });
        mockFs.writeFileSync.mockImplementation(() => { });
        flcmAgent = new flcm_main_1.FLCMAgent();
        mockAgent = new MockAgent({
            id: 'scholar',
            name: 'Test Scholar',
            title: 'Test Scholar Agent',
            icon: '🔍',
            whenToUse: 'testing',
            enabled: true,
            priority: 1,
            timeout: 5000,
            retryAttempts: 3
        });
    });
    describe('Initialization', () => {
        test('should initialize with default configuration', async () => {
            await flcmAgent.init();
            expect(flcmAgent.getState().status).toBe('ready');
        });
        test('should create necessary directories on init', async () => {
            await flcmAgent.init();
            expect(mockFs.mkdirSync).toHaveBeenCalled();
        });
        test('should load FLCM configuration from file', () => {
            expect(mockFs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('core-config.yaml'), 'utf8');
        });
        test('should create default config if file does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            new flcm_main_1.FLCMAgent();
            expect(mockFs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('core-config.yaml'), expect.any(String));
        });
    });
    describe('Agent Registration', () => {
        test('should register agents correctly', async () => {
            await flcmAgent.init();
            flcmAgent.registerAgent(mockAgent);
            const metrics = flcmAgent.getMetrics();
            expect(metrics.main.registeredAgents).toBe(1);
        });
        test('should track multiple registered agents', async () => {
            await flcmAgent.init();
            const agent1 = new MockAgent({ id: 'scholar', name: 'Scholar', title: 'Scholar', icon: '🔍', whenToUse: 'analysis', enabled: true, priority: 1, timeout: 5000, retryAttempts: 3 });
            const agent2 = new MockAgent({ id: 'creator', name: 'Creator', title: 'Creator', icon: '✍️', whenToUse: 'content', enabled: true, priority: 2, timeout: 10000, retryAttempts: 3 });
            flcmAgent.registerAgent(agent1);
            flcmAgent.registerAgent(agent2);
            const metrics = flcmAgent.getMetrics();
            expect(metrics.main.registeredAgents).toBe(2);
        });
    });
    describe('Request Routing', () => {
        beforeEach(async () => {
            await flcmAgent.init();
            await mockAgent.init();
            flcmAgent.registerAgent(mockAgent);
        });
        test('should route analyze requests to scholar', async () => {
            const request = {
                id: 'test-request-1',
                type: 'analyze_document',
                payload: { content: 'test content' },
                timestamp: new Date(),
                priority: 'normal'
            };
            const response = await flcmAgent.route(request);
            expect(response.success).toBe(true);
            expect(response.id).toBe(request.id);
        });
        test('should handle routing to non-existent agent', async () => {
            const request = {
                id: 'test-request-2',
                type: 'nonexistent_action',
                payload: {},
                timestamp: new Date(),
                priority: 'normal'
            };
            // Should default to scholar, but scholar is registered
            const response = await flcmAgent.route(request);
            expect(response.success).toBe(true);
        });
        test('should throw error when target agent not registered', async () => {
            // Remove the registered agent
            flcmAgent = new flcm_main_1.FLCMAgent();
            await flcmAgent.init();
            const request = {
                id: 'test-request-3',
                type: 'analyze_document',
                payload: {},
                timestamp: new Date(),
                priority: 'normal'
            };
            await expect(flcmAgent.route(request)).rejects.toThrow('Agent not found: scholar');
        });
    });
    describe('Error Handling and Retry Logic', () => {
        let failingAgent;
        beforeEach(async () => {
            await flcmAgent.init();
            failingAgent = new MockAgent({
                id: 'failing-agent',
                name: 'Failing Agent',
                title: 'Failing Agent',
                icon: '❌',
                whenToUse: 'testing',
                enabled: true,
                priority: 1,
                timeout: 5000,
                retryAttempts: 3
            });
            // Make agent fail on first call
            let callCount = 0;
            jest.spyOn(failingAgent, 'process').mockImplementation(async (request) => {
                callCount++;
                if (callCount === 1) {
                    throw new Error('NETWORK_ERROR: Connection failed');
                }
                return {
                    id: request.id,
                    success: true,
                    data: { processed: true },
                    timestamp: new Date(),
                    processingTime: 100
                };
            });
            await failingAgent.init();
            flcmAgent.registerAgent(failingAgent);
        });
        test('should retry on retryable errors', async () => {
            const request = {
                id: 'retry-test',
                type: 'analyze_document',
                payload: {},
                timestamp: new Date(),
                priority: 'normal'
            };
            const response = await flcmAgent.route(request);
            expect(response.success).toBe(true);
            expect(failingAgent.process).toHaveBeenCalledTimes(2); // First failure, then success
        });
        test('should implement exponential backoff', async () => {
            jest.spyOn(global, 'setTimeout').mockImplementation(((callback) => {
                callback();
                return {};
            }));
            const request = {
                id: 'backoff-test',
                type: 'analyze_document',
                payload: {},
                timestamp: new Date(),
                priority: 'normal'
            };
            await flcmAgent.route(request);
            expect(setTimeout).toHaveBeenCalled();
        });
    });
    describe('Circuit Breaker', () => {
        let alwaysFailingAgent;
        beforeEach(async () => {
            await flcmAgent.init();
            alwaysFailingAgent = new MockAgent({
                id: 'always-failing',
                name: 'Always Failing Agent',
                title: 'Always Failing Agent',
                icon: '💥',
                whenToUse: 'testing',
                enabled: true,
                priority: 1,
                timeout: 5000,
                retryAttempts: 3
            });
            // Make agent always fail
            jest.spyOn(alwaysFailingAgent, 'process').mockImplementation(async () => {
                throw new Error('SYSTEM_ERROR: Always fails');
            });
            await alwaysFailingAgent.init();
            flcmAgent.registerAgent(alwaysFailingAgent);
        });
        test('should open circuit breaker after threshold failures', async () => {
            const request = {
                id: 'circuit-test',
                type: 'analyze_document',
                payload: {},
                timestamp: new Date(),
                priority: 'normal'
            };
            // Trigger failures to open circuit breaker
            for (let i = 0; i < 6; i++) {
                try {
                    await flcmAgent.route(request);
                }
                catch (error) {
                    // Expected to fail
                }
            }
            const metrics = flcmAgent.getMetrics();
            expect(metrics.main.circuitBreakers['always-failing'].state).toBe('open');
        });
    });
    describe('Fallback Strategies', () => {
        test('should generate basic insights for scholar failure', async () => {
            await flcmAgent.init();
            const request = {
                id: 'fallback-test',
                type: 'analyze_document',
                payload: {},
                timestamp: new Date(),
                priority: 'normal'
            };
            // No agent registered, should use fallback
            const response = await flcmAgent.route(request);
            expect(response.data.fallback).toBe(true);
            expect(response.data.type).toBe('fallback_insights');
        });
    });
    describe('Health Check', () => {
        test('should report health status of all agents', async () => {
            await flcmAgent.init();
            await mockAgent.init();
            flcmAgent.registerAgent(mockAgent);
            const health = await flcmAgent.health, Check;
            ();
            expect(health['scholar']).toBe(true);
        });
        test('should report unhealthy agents', async () => {
            await flcmAgent.init();
            // Create unhealthy agent
            const unhealthyAgent = new MockAgent({
                id: 'unhealthy',
                name: 'Unhealthy Agent',
                title: 'Unhealthy Agent',
                icon: '🤒',
                whenToUse: 'testing',
                enabled: true,
                priority: 1,
                timeout: 5000,
                retryAttempts: 3
            });
            jest.spyOn(unhealthyAgent, 'isHealthy').mockReturnValue(false);
            flcmAgent.registerAgent(unhealthyAgent);
            const health = await flcmAgent.healthCheck();
            expect(health['unhealthy']).toBe(false);
        });
    });
    describe('Metrics', () => {
        test('should provide comprehensive metrics', async () => {
            await flcmAgent.init();
            await mockAgent.init();
            flcmAgent.registerAgent(mockAgent);
            const metrics = flcmAgent.getMetrics();
            expect(metrics.main).toBeDefined();
            expect(metrics.main.registeredAgents).toBe(1);
            expect(metrics.main.circuitBreakers).toBeDefined();
            expect(metrics.agents).toBeDefined();
            expect(metrics.agents['scholar']).toBeDefined();
        });
    });
    describe('Cleanup', () => {
        test('should cleanup all registered agents', async () => {
            await flcmAgent.init();
            await mockAgent.init();
            flcmAgent.registerAgent(mockAgent);
            const cleanupSpy = jest.spyOn(mockAgent, 'cleanup');
            await flcmAgent.cleanup();
            expect(cleanupSpy).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=flcm-main.test.js.map