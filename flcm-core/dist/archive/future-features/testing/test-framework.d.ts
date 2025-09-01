/**
 * FLCM Test Framework
 * Comprehensive testing framework for the FLCM 2.0 system
 */
/// <reference types="node" />
import { TestFramework as ITestFramework, TestFrameworkManager, TestConfiguration, TestSuite, TestRun, TestResults, TestEnvironment, TestReporter, TestPlugin, TestRunner, TestExecutionOptions, TestFrameworkState, TestFrameworkHealth, TestFrameworkMetrics, TestRunnerType, ReportOutput } from './types';
import { EventEmitter } from 'events';
interface TestFrameworkConfig {
    id: string;
    name: string;
    version: string;
    configuration: TestConfiguration;
    runners: TestRunnerConfig[];
    environments: TestEnvironmentConfig[];
    reporters: TestReporterConfig[];
    plugins: TestPluginConfig[];
}
interface TestRunnerConfig {
    type: TestRunnerType;
    configuration: any;
    enabled: boolean;
}
interface TestEnvironmentConfig {
    name: string;
    type: string;
    configuration: any;
    default: boolean;
}
interface TestReporterConfig {
    type: string;
    configuration: any;
    enabled: boolean;
}
interface TestPluginConfig {
    name: string;
    version: string;
    configuration: any;
    enabled: boolean;
}
export declare class FLCMTestFramework extends EventEmitter implements ITestFramework, TestFrameworkManager {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly description: string;
    configuration: TestConfiguration;
    runners: Map<string, TestRunner>;
    suites: Map<string, TestSuite>;
    environments: Map<string, TestEnvironment>;
    reporters: TestReporter[];
    plugins: TestPlugin[];
    state: TestFrameworkState;
    readonly created: Date;
    lastUpdated: Date;
    private logger;
    private config;
    private activeRuns;
    private completedRuns;
    private runQueue;
    private suiteManager;
    private runManager;
    private environmentManager;
    private reportManager;
    private pluginManager;
    private fixtureManager;
    private mockManager;
    private coverageManager;
    private performanceManager;
    private securityManager;
    private accessibilityManager;
    private healthMonitor;
    private metricsCollector;
    constructor(config: TestFrameworkConfig);
    initialize(): Promise<void>;
    createSuite(suite: TestSuite): Promise<void>;
    updateSuite(suiteId: string, suite: Partial<TestSuite>): Promise<void>;
    deleteSuite(suiteId: string): Promise<void>;
    getSuite(suiteId: string): Promise<TestSuite | undefined>;
    listSuites(): Promise<TestSuite[]>;
    runSuite(suiteId: string, options?: TestExecutionOptions): Promise<TestRun>;
    runTests(testIds: string[], options?: TestExecutionOptions): Promise<TestRun>;
    runAll(options?: TestExecutionOptions): Promise<TestRun>;
    stopRun(runId: string): Promise<void>;
    pauseRun(runId: string): Promise<void>;
    resumeRun(runId: string): Promise<void>;
    getRun(runId: string): Promise<TestRun | undefined>;
    getResults(runId: string): Promise<TestResults | undefined>;
    listRuns(): Promise<TestRun[]>;
    createEnvironment(environment: TestEnvironment): Promise<void>;
    updateEnvironment(envId: string, environment: Partial<TestEnvironment>): Promise<void>;
    deleteEnvironment(envId: string): Promise<void>;
    getEnvironment(envId: string): Promise<TestEnvironment | undefined>;
    listEnvironments(): Promise<TestEnvironment[]>;
    addReporter(reporter: TestReporter): Promise<void>;
    removeReporter(reporterId: string): Promise<void>;
    generateReport(runId: string, reporterId: string): Promise<ReportOutput>;
    installPlugin(plugin: TestPlugin): Promise<void>;
    uninstallPlugin(pluginId: string): Promise<void>;
    enablePlugin(pluginId: string): Promise<void>;
    disablePlugin(pluginId: string): Promise<void>;
    getHealth(): Promise<TestFrameworkHealth>;
    getMetrics(): Promise<TestFrameworkMetrics>;
    getState(): Promise<TestFrameworkState>;
    shutdown(): Promise<void>;
    private createTestRunner;
    private createTestEnvironment;
    private createTestReporter;
    private createTestPlugin;
    private createTestRun;
    private executeTestRun;
    private setupEventHandlers;
}
export { FLCMTestFramework };
