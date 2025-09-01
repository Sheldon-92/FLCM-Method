/**
 * FLCM 2.0 End-to-End Integration Test Suite
 * Comprehensive testing of the complete Scholar → Creator → Publisher pipeline
 */
export declare class IntegrationTestRunner {
    static runFullTestSuite(): Promise<{
        passed: number;
        failed: number;
        total: number;
        coverage: number;
        performance: {
            avgExecutionTime: number;
            maxExecutionTime: number;
            minExecutionTime: number;
        };
    }>;
    static generateTestReport(): Promise<string>;
}
