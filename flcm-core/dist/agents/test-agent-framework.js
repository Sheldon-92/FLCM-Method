"use strict";
/**
 * Test file for FLCM Agent Framework
 * Demonstrates agent usage and capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAgentFramework = void 0;
const agent_manager_1 = require("./agent-manager");
/**
 * Test the agent framework
 */
async function testAgentFramework() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 FLCM Agent Framework Test');
    console.log('='.repeat(60) + '\n');
    try {
        // Initialize agent manager
        console.log('1. Initializing Agent Manager...');
        await agent_manager_1.agentManager.initialize();
        // Check system health
        console.log('\n2. System Health Check:');
        const health = agent_manager_1.agentManager.getSystemHealth();
        console.log(`   - Total Agents: ${health.totalAgents}`);
        console.log(`   - Active Agents: ${health.activeAgents}`);
        console.log(`   - Idle Agents: ${health.idleAgents}`);
        console.log(`   - Error Agents: ${health.errorAgents}`);
        // Get collector agent
        const collector = agent_manager_1.agentManager.getAgent('collector');
        if (!collector) {
            throw new Error('Collector agent not found');
        }
        // Test 1: Process URL
        console.log('\n3. Test URL Processing:');
        const urlInput = {
            id: 'test-url-1',
            type: 'url',
            content: '',
            metadata: {
                source: 'https://example.com/article'
            },
            timestamp: new Date()
        };
        const urlResult = await agent_manager_1.agentManager.executeAgent('collector', {
            ...urlInput,
            source: 'https://example.com/article'
        });
        console.log('   ✅ URL processed successfully');
        console.log(`   - Output type: ${urlResult.type}`);
        console.log(`   - Word count: ${urlResult.metadata.wordCount}`);
        // Test 2: Process text
        console.log('\n4. Test Text Processing:');
        const textInput = {
            id: 'test-text-1',
            type: 'text',
            content: 'This is a test content for the FLCM system. It demonstrates how agents process text input.',
            metadata: {},
            timestamp: new Date()
        };
        const textResult = await agent_manager_1.agentManager.executeAgent('collector', {
            ...textInput,
            source: textInput.content
        });
        console.log('   ✅ Text processed successfully');
        console.log(`   - Key insights: ${textResult.signals.keyInsights.length}`);
        // Test 3: Agent communication
        console.log('\n5. Test Agent Communication:');
        agent_manager_1.agentManager.sendMessage({
            from: 'test',
            to: 'collector',
            type: 'event',
            payload: { event: 'test-ping' }
        });
        console.log('   ✅ Message sent to collector');
        // Test 4: Agent states
        console.log('\n6. Agent States:');
        const states = agent_manager_1.agentManager.getAgentStates();
        states.forEach((state, id) => {
            console.log(`   - ${id}: ${state.status} (${state.executionCount} executions)`);
        });
        // Test 5: Error handling
        console.log('\n7. Test Error Handling:');
        try {
            const invalidInput = {
                id: 'test-invalid',
                type: 'invalid',
                content: '',
                metadata: {},
                timestamp: new Date()
            };
            await agent_manager_1.agentManager.executeAgent('collector', invalidInput);
        }
        catch (error) {
            console.log(`   ✅ Error caught correctly: ${error.message}`);
        }
        // Final health check
        console.log('\n8. Final System Health:');
        const finalHealth = agent_manager_1.agentManager.getSystemHealth();
        console.log(`   - Memory usage: ${Math.round(finalHealth.memoryUsage.heapUsed / 1024 / 1024)}MB`);
        console.log(`   - Uptime: ${Math.round(finalHealth.uptime)}s`);
        console.log(`   - Message queue: ${finalHealth.messageQueueSize} messages`);
        // Shutdown
        console.log('\n9. Shutting down...');
        await agent_manager_1.agentManager.shutdown();
        console.log('   ✅ Shutdown complete');
        // Test summary
        console.log('\n' + '='.repeat(60));
        console.log('✨ All tests passed successfully!');
        console.log('='.repeat(60) + '\n');
    }
    catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}
exports.testAgentFramework = testAgentFramework;
// Run tests if this file is executed directly
if (require.main === module) {
    testAgentFramework().catch(console.error);
}
//# sourceMappingURL=test-agent-framework.js.map