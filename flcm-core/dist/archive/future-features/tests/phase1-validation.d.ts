/**
 * Phase 1 Validation Tests for FLCM
 * Validates all Phase 1 components are working correctly
 */
/**
 * Phase 1 Validation Suite
 */
declare class Phase1Validator {
    private results;
    private basePath;
    constructor();
    /**
     * Run all Phase 1 validation tests
     */
    runValidation(): Promise<void>;
    /**
     * Test 1.1: Repository Structure
     */
    private testRepositoryStructure;
    /**
     * Test 1.2: Configuration System
     */
    private testConfigurationSystem;
    /**
     * Test 1.3: Command System
     */
    private testCommandSystem;
    /**
     * Test 1.4: Agent Framework
     */
    private testAgentFramework;
    /**
     * Test 1.5: Document Pipeline
     */
    private testDocumentPipeline;
    /**
     * Parse command string (simplified)
     */
    private parseCommand;
    /**
     * Display test results
     */
    private displayResults;
}
export { Phase1Validator };
