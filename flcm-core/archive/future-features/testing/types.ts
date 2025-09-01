/**
 * FLCM Testing Framework Types
 * Comprehensive testing types for the FLCM 2.0 framework
 */

// Core Testing Interfaces
export interface TestFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  configuration: TestConfiguration;
  runners: Map<string, TestRunner>;
  suites: Map<string, TestSuite>;
  environments: Map<string, TestEnvironment>;
  reporters: TestReporter[];
  plugins: TestPlugin[];
  state: TestFrameworkState;
  created: Date;
  lastUpdated: Date;
}

export interface TestConfiguration {
  timeout: number;
  retries: number;
  parallel: boolean;
  maxConcurrency: number;
  bail: boolean;
  verbose: boolean;
  coverage: CoverageConfiguration;
  environment: EnvironmentConfiguration;
  reporting: ReportingConfiguration;
  hooks: TestHooks;
  fixtures: FixtureConfiguration;
  mocks: MockConfiguration;
  integration: IntegrationConfiguration;
}

export interface CoverageConfiguration {
  enabled: boolean;
  threshold: {
    global: number;
    functions: number;
    lines: number;
    statements: number;
    branches: number;
  };
  reporters: CoverageReporter[];
  exclude: string[];
  include: string[];
  collectFromFiles: boolean;
  skipFull: boolean;
}

export interface CoverageReporter {
  type: 'text' | 'html' | 'json' | 'lcov' | 'cobertura' | 'clover';
  outputFile?: string;
  subdir?: string;
}

export interface EnvironmentConfiguration {
  baseUrl: string;
  apiUrl: string;
  database: DatabaseConfiguration;
  redis: RedisConfiguration;
  s3: S3Configuration;
  secrets: Map<string, string>;
  variables: Map<string, any>;
  services: ServiceConfiguration[];
}

export interface DatabaseConfiguration {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
    idle: number;
  };
}

export interface RedisConfiguration {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
}

export interface S3Configuration {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
}

export interface ServiceConfiguration {
  name: string;
  url: string;
  timeout: number;
  retries: number;
  headers: Map<string, string>;
  auth: AuthConfiguration;
}

export interface AuthConfiguration {
  type: 'basic' | 'bearer' | 'api-key' | 'oauth2';
  credentials: Map<string, string>;
}

export interface ReportingConfiguration {
  formats: ReportFormat[];
  outputDir: string;
  filename: string;
  merge: boolean;
  includeConsole: boolean;
  includeHtml: boolean;
  includeJunit: boolean;
  includeJson: boolean;
  includeMochawesome: boolean;
  includeAllure: boolean;
  slack: SlackReportingConfiguration;
  email: EmailReportingConfiguration;
  webhook: WebhookReportingConfiguration;
}

export interface ReportFormat {
  type: 'console' | 'html' | 'junit' | 'json' | 'mochawesome' | 'allure' | 'tap' | 'spec';
  outputFile?: string;
  options: Map<string, any>;
}

export interface SlackReportingConfiguration {
  enabled: boolean;
  webhook: string;
  channel: string;
  onFailure: boolean;
  onSuccess: boolean;
  template: string;
}

export interface EmailReportingConfiguration {
  enabled: boolean;
  smtp: SMTPConfiguration;
  recipients: string[];
  subject: string;
  template: string;
  attachReports: boolean;
}

export interface SMTPConfiguration {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface WebhookReportingConfiguration {
  enabled: boolean;
  url: string;
  method: 'POST' | 'PUT';
  headers: Map<string, string>;
  payload: any;
}

export interface TestHooks {
  before: TestHook[];
  after: TestHook[];
  beforeEach: TestHook[];
  afterEach: TestHook[];
  beforeAll: TestHook[];
  afterAll: TestHook[];
}

export interface TestHook {
  id: string;
  name: string;
  handler: Function;
  timeout: number;
  order: number;
  enabled: boolean;
}

export interface FixtureConfiguration {
  dataDir: string;
  autoLoad: boolean;
  naming: 'camelCase' | 'snake_case' | 'kebab-case';
  formats: FixtureFormat[];
  generators: FixtureGenerator[];
}

export interface FixtureFormat {
  type: 'json' | 'yaml' | 'csv' | 'sql' | 'xml';
  loader: Function;
  validator?: Function;
}

export interface FixtureGenerator {
  name: string;
  type: 'faker' | 'random' | 'sequence' | 'custom';
  configuration: any;
  generator: Function;
}

export interface MockConfiguration {
  enabled: boolean;
  autoMock: boolean;
  clearMocks: boolean;
  resetMocks: boolean;
  restoreMocks: boolean;
  moduleNameMapper: Map<string, string>;
  setupFiles: string[];
  setupFilesAfterEnv: string[];
}

export interface IntegrationConfiguration {
  apiTesting: APITestConfiguration;
  databaseTesting: DatabaseTestConfiguration;
  messageTesting: MessageTestConfiguration;
  fileSystemTesting: FileSystemTestConfiguration;
  externalServices: ExternalServiceConfiguration[];
}

export interface APITestConfiguration {
  enabled: boolean;
  baseUrl: string;
  timeout: number;
  retries: number;
  validateSchema: boolean;
  validateResponse: boolean;
  recordRequests: boolean;
  recordResponses: boolean;
  mockMode: 'record' | 'replay' | 'live';
}

export interface DatabaseTestConfiguration {
  enabled: boolean;
  migrations: boolean;
  seeds: boolean;
  transactions: boolean;
  rollback: boolean;
  cleanup: boolean;
  isolation: 'read_uncommitted' | 'read_committed' | 'repeatable_read' | 'serializable';
}

export interface MessageTestConfiguration {
  enabled: boolean;
  brokers: MessageBrokerConfiguration[];
  topics: string[];
  consumerGroups: string[];
  timeout: number;
}

export interface MessageBrokerConfiguration {
  type: 'kafka' | 'rabbitmq' | 'redis' | 'sqs' | 'sns';
  connection: any;
  configuration: any;
}

export interface FileSystemTestConfiguration {
  enabled: boolean;
  tempDir: string;
  cleanup: boolean;
  permissions: boolean;
  symlinks: boolean;
}

export interface ExternalServiceConfiguration {
  name: string;
  type: 'http' | 'grpc' | 'websocket' | 'database' | 'cache' | 'storage';
  connection: any;
  health: HealthCheckConfiguration;
  timeout: number;
  retries: number;
}

export interface HealthCheckConfiguration {
  enabled: boolean;
  endpoint: string;
  interval: number;
  timeout: number;
  retries: number;
  expectedStatus: number;
}

// Test Runner Interfaces
export interface TestRunner {
  id: string;
  name: string;
  type: TestRunnerType;
  version: string;
  configuration: TestRunnerConfiguration;
  capabilities: TestRunnerCapabilities;
  state: TestRunnerState;
  executor: TestExecutor;
  created: Date;
  lastUpdated: Date;
}

export type TestRunnerType = 
  | 'jest' 
  | 'mocha' 
  | 'jasmine' 
  | 'vitest' 
  | 'ava' 
  | 'tap' 
  | 'cypress' 
  | 'playwright' 
  | 'webdriver' 
  | 'cucumber' 
  | 'storybook'
  | 'custom';

export interface TestRunnerConfiguration {
  rootDir: string;
  testDir: string;
  testMatch: string[];
  testIgnore: string[];
  moduleFileExtensions: string[];
  transform: Map<string, string>;
  setupFiles: string[];
  setupFilesAfterEnv: string[];
  globalSetup?: string;
  globalTeardown?: string;
  testEnvironment: string;
  testEnvironmentOptions: any;
  coverageProvider: 'v8' | 'babel' | 'c8' | 'nyc';
  collectCoverageFrom: string[];
  coverageDirectory: string;
  coverageReporters: string[];
  coverageThreshold: any;
  watchMode: boolean;
  watchIgnore: string[];
  bail: number;
  verbose: boolean;
  silent: boolean;
  errorOnDeprecated: boolean;
  forceExit: boolean;
  detectOpenHandles: boolean;
  maxWorkers: number | string;
  testTimeout: number;
  resetMocks: boolean;
  resetModules: boolean;
  restoreMocks: boolean;
}

export interface TestRunnerCapabilities {
  unitTesting: boolean;
  integrationTesting: boolean;
  e2eTesting: boolean;
  apiTesting: boolean;
  uiTesting: boolean;
  performanceTesting: boolean;
  visualTesting: boolean;
  accessibilityTesting: boolean;
  crossBrowser: boolean;
  mobile: boolean;
  parallel: boolean;
  distributed: boolean;
  watch: boolean;
  snapshot: boolean;
  mocking: boolean;
  stubbing: boolean;
  spying: boolean;
  coverage: boolean;
  reporting: boolean;
  debugging: boolean;
}

export interface TestRunnerState {
  status: TestRunnerStatus;
  currentRun?: TestRun;
  lastRun?: TestRun;
  totalRuns: number;
  uptime: number;
  version: string;
  pid?: number;
}

export type TestRunnerStatus = 
  | 'idle' 
  | 'initializing' 
  | 'running' 
  | 'paused' 
  | 'stopping' 
  | 'stopped' 
  | 'error' 
  | 'maintenance';

export interface TestExecutor {
  execute(suite: TestSuite, options?: TestExecutionOptions): Promise<TestResults>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  getStatus(): TestRunnerStatus;
  getResults(): TestResults | null;
}

// Test Suite Interfaces
export interface TestSuite {
  id: string;
  name: string;
  description: string;
  type: TestSuiteType;
  category: TestCategory;
  priority: TestPriority;
  tags: string[];
  configuration: TestSuiteConfiguration;
  tests: Map<string, TestCase>;
  hooks: TestHooks;
  fixtures: TestFixture[];
  dependencies: TestSuiteDependency[];
  metadata: TestSuiteMetadata;
  state: TestSuiteState;
  created: Date;
  lastUpdated: Date;
}

export type TestSuiteType = 
  | 'unit' 
  | 'integration' 
  | 'e2e' 
  | 'api' 
  | 'ui' 
  | 'performance' 
  | 'security' 
  | 'accessibility' 
  | 'visual' 
  | 'smoke' 
  | 'regression' 
  | 'acceptance';

export type TestCategory = 
  | 'functional' 
  | 'non-functional' 
  | 'structural' 
  | 'change-related' 
  | 'experience-based';

export type TestPriority = 'critical' | 'high' | 'medium' | 'low';

export interface TestSuiteConfiguration {
  timeout: number;
  retries: number;
  parallel: boolean;
  maxConcurrency: number;
  bail: boolean;
  skip: boolean;
  only: boolean;
  environment: string;
  browser?: BrowserConfiguration;
  device?: DeviceConfiguration;
  viewport?: ViewportConfiguration;
  network?: NetworkConfiguration;
}

export interface BrowserConfiguration {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'ie';
  version: string;
  headless: boolean;
  args: string[];
  extensions: string[];
  prefs: Map<string, any>;
}

export interface DeviceConfiguration {
  name: string;
  userAgent: string;
  viewport: ViewportConfiguration;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
  defaultBrowserType: string;
}

export interface ViewportConfiguration {
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
}

export interface NetworkConfiguration {
  offline: boolean;
  downloadThroughput: number;
  uploadThroughput: number;
  latency: number;
}

export interface TestSuiteDependency {
  suiteId: string;
  type: 'before' | 'after' | 'parallel' | 'data';
  required: boolean;
  timeout: number;
}

export interface TestSuiteMetadata {
  author: string;
  version: string;
  documentation: string;
  requirements: string[];
  testPlan: string;
  defects: TestDefect[];
  coverage: TestCoverage;
  risks: TestRisk[];
  assumptions: string[];
}

export interface TestDefect {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'trivial';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  description: string;
  steps: string[];
  expected: string;
  actual: string;
  workaround?: string;
  created: Date;
  updated: Date;
}

export interface TestCoverage {
  requirements: number;
  features: number;
  codeLines: number;
  codeBranches: number;
  codeFunctions: number;
  codeStatements: number;
}

export interface TestRisk {
  id: string;
  level: 'high' | 'medium' | 'low';
  probability: number;
  impact: number;
  description: string;
  mitigation: string;
}

export interface TestSuiteState {
  status: TestSuiteStatus;
  lastRun?: Date;
  runCount: number;
  passCount: number;
  failCount: number;
  skipCount: number;
  duration: number;
  coverage: number;
}

export type TestSuiteStatus = 
  | 'created' 
  | 'ready' 
  | 'running' 
  | 'passed' 
  | 'failed' 
  | 'skipped' 
  | 'error' 
  | 'timeout';

// Test Case Interfaces
export interface TestCase {
  id: string;
  name: string;
  description: string;
  type: TestCaseType;
  category: TestCategory;
  priority: TestPriority;
  tags: string[];
  configuration: TestCaseConfiguration;
  steps: TestStep[];
  assertions: TestAssertion[];
  preconditions: TestCondition[];
  postconditions: TestCondition[];
  testData: TestData[];
  mocks: TestMock[];
  expectations: TestExpectation[];
  metadata: TestCaseMetadata;
  state: TestCaseState;
  created: Date;
  lastUpdated: Date;
}

export type TestCaseType = 
  | 'positive' 
  | 'negative' 
  | 'boundary' 
  | 'equivalence' 
  | 'decision-table' 
  | 'state-transition' 
  | 'use-case' 
  | 'exploratory';

export interface TestCaseConfiguration {
  timeout: number;
  retries: number;
  skip: boolean;
  only: boolean;
  slow: boolean;
  flaky: boolean;
  quarantine: boolean;
  environment: string;
  requirements: string[];
}

export interface TestStep {
  id: string;
  order: number;
  action: string;
  input?: any;
  expected?: any;
  actual?: any;
  status?: TestStepStatus;
  duration?: number;
  screenshot?: string;
  error?: TestError;
  logs: TestLog[];
}

export type TestStepStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped' | 'error';

export interface TestAssertion {
  id: string;
  description: string;
  type: AssertionType;
  expected: any;
  actual?: any;
  operator: AssertionOperator;
  options: AssertionOptions;
  status?: TestStepStatus;
  message?: string;
}

export type AssertionType = 
  | 'equality' 
  | 'inequality' 
  | 'comparison' 
  | 'type' 
  | 'structure' 
  | 'regex' 
  | 'custom';

export type AssertionOperator = 
  | 'equals' 
  | 'not-equals' 
  | 'deep-equals' 
  | 'strict-equals' 
  | 'greater-than' 
  | 'less-than' 
  | 'greater-equal' 
  | 'less-equal' 
  | 'contains' 
  | 'not-contains' 
  | 'matches' 
  | 'not-matches' 
  | 'throws' 
  | 'not-throws'
  | 'resolves'
  | 'rejects';

export interface AssertionOptions {
  message?: string;
  timeout?: number;
  retries?: number;
  soft?: boolean;
  inverse?: boolean;
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
  precision?: number;
}

export interface TestCondition {
  id: string;
  description: string;
  type: 'environment' | 'data' | 'service' | 'permission' | 'state';
  validation: Function;
  required: boolean;
  timeout: number;
}

export interface TestData {
  id: string;
  name: string;
  type: 'static' | 'dynamic' | 'generated' | 'external';
  source: string;
  format: 'json' | 'yaml' | 'csv' | 'xml' | 'sql' | 'raw';
  data: any;
  schema?: any;
  validation?: Function;
  transformation?: Function;
}

export interface TestMock {
  id: string;
  target: string;
  type: 'function' | 'module' | 'service' | 'api' | 'database';
  implementation?: Function;
  returnValue?: any;
  throwError?: Error;
  callCount?: number;
  calls?: any[];
  configuration: MockConfiguration;
}

export interface TestExpectation {
  id: string;
  description: string;
  type: 'performance' | 'security' | 'accessibility' | 'usability' | 'functional';
  metric: string;
  threshold: any;
  operator: AssertionOperator;
  measurement?: any;
  status?: TestStepStatus;
}

export interface TestCaseMetadata {
  author: string;
  version: string;
  testCase: string;
  requirement: string;
  feature: string;
  epic: string;
  story: string;
  defectIds: string[];
  automationLevel: 'manual' | 'semi-automated' | 'automated';
  complexity: 'simple' | 'medium' | 'complex';
  maintenance: 'low' | 'medium' | 'high';
}

export interface TestCaseState {
  status: TestCaseStatus;
  runCount: number;
  passCount: number;
  failCount: number;
  skipCount: number;
  lastRun?: Date;
  lastPass?: Date;
  lastFail?: Date;
  duration: number;
  flaky: boolean;
  stability: number;
}

export type TestCaseStatus = 
  | 'created' 
  | 'ready' 
  | 'running' 
  | 'passed' 
  | 'failed' 
  | 'skipped' 
  | 'error' 
  | 'timeout' 
  | 'quarantined';

// Test Environment Interfaces
export interface TestEnvironment {
  id: string;
  name: string;
  type: EnvironmentType;
  configuration: EnvironmentConfiguration;
  services: EnvironmentService[];
  databases: EnvironmentDatabase[];
  infrastructure: EnvironmentInfrastructure;
  monitoring: EnvironmentMonitoring;
  state: EnvironmentState;
  created: Date;
  lastUpdated: Date;
}

export type EnvironmentType = 
  | 'local' 
  | 'development' 
  | 'testing' 
  | 'staging' 
  | 'production' 
  | 'docker' 
  | 'kubernetes' 
  | 'cloud';

export interface EnvironmentService {
  name: string;
  url: string;
  version: string;
  status: ServiceStatus;
  health: HealthCheckConfiguration;
  configuration: any;
}

export type ServiceStatus = 'running' | 'stopped' | 'error' | 'unknown';

export interface EnvironmentDatabase {
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch' | 'sqlite';
  host: string;
  port: number;
  database: string;
  status: ServiceStatus;
  configuration: DatabaseConfiguration;
}

export interface EnvironmentInfrastructure {
  provider: 'aws' | 'gcp' | 'azure' | 'docker' | 'kubernetes' | 'local';
  region?: string;
  cluster?: string;
  namespace?: string;
  resources: ResourceConfiguration;
  scaling: ScalingConfiguration;
  networking: NetworkingConfiguration;
}

export interface ResourceConfiguration {
  cpu: string;
  memory: string;
  storage: string;
  instances: number;
  limits: {
    cpu: string;
    memory: string;
    storage: string;
  };
}

export interface ScalingConfiguration {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetCPU: number;
  targetMemory: number;
}

export interface NetworkingConfiguration {
  ingress: IngressConfiguration;
  loadBalancer: LoadBalancerConfiguration;
  service: ServiceNetworkingConfiguration;
}

export interface IngressConfiguration {
  enabled: boolean;
  host: string;
  tls: boolean;
  annotations: Map<string, string>;
}

export interface LoadBalancerConfiguration {
  type: 'round-robin' | 'weighted' | 'least-connections' | 'ip-hash';
  healthCheck: HealthCheckConfiguration;
  stickySession: boolean;
}

export interface ServiceNetworkingConfiguration {
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer' | 'ExternalName';
  ports: ServicePort[];
  selector: Map<string, string>;
}

export interface ServicePort {
  name: string;
  port: number;
  targetPort: number;
  protocol: 'TCP' | 'UDP';
}

export interface EnvironmentMonitoring {
  metrics: MetricsConfiguration;
  logging: LoggingConfiguration;
  tracing: TracingConfiguration;
  alerting: AlertingConfiguration;
}

export interface MetricsConfiguration {
  enabled: boolean;
  provider: 'prometheus' | 'datadog' | 'newrelic' | 'custom';
  endpoint: string;
  interval: number;
  retention: string;
}

export interface LoggingConfiguration {
  enabled: boolean;
  provider: 'elasticsearch' | 'splunk' | 'datadog' | 'cloudwatch' | 'custom';
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  rotation: LogRotationConfiguration;
}

export interface LogRotationConfiguration {
  maxSize: string;
  maxFiles: number;
  maxAge: string;
  compress: boolean;
}

export interface TracingConfiguration {
  enabled: boolean;
  provider: 'jaeger' | 'zipkin' | 'datadog' | 'aws-xray' | 'custom';
  endpoint: string;
  samplingRate: number;
  propagation: string[];
}

export interface AlertingConfiguration {
  enabled: boolean;
  provider: 'prometheus' | 'datadog' | 'pagerduty' | 'slack' | 'custom';
  rules: AlertRule[];
  channels: AlertChannel[];
}

export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  duration: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  runbook?: string;
}

export interface AlertChannel {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'pagerduty' | 'sms';
  configuration: any;
  filters: string[];
}

export interface EnvironmentState {
  status: EnvironmentStatus;
  health: EnvironmentHealth;
  lastDeployment?: Date;
  uptime: number;
  version: string;
  issues: EnvironmentIssue[];
}

export type EnvironmentStatus = 
  | 'initializing' 
  | 'ready' 
  | 'degraded' 
  | 'down' 
  | 'maintenance' 
  | 'error';

export interface EnvironmentHealth {
  overall: HealthStatus;
  services: Map<string, HealthStatus>;
  databases: Map<string, HealthStatus>;
  infrastructure: HealthStatus;
  lastCheck: Date;
}

export type HealthStatus = 'healthy' | 'unhealthy' | 'warning' | 'unknown';

export interface EnvironmentIssue {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  type: 'service' | 'database' | 'infrastructure' | 'network' | 'security';
  component: string;
  message: string;
  details: string;
  resolved: boolean;
  created: Date;
  resolved?: Date;
}

// Test Execution Interfaces
export interface TestRun {
  id: string;
  name: string;
  type: TestRunType;
  configuration: TestRunConfiguration;
  suites: string[];
  environment: string;
  trigger: TestTrigger;
  executor: string;
  results: TestResults;
  state: TestRunState;
  created: Date;
  started?: Date;
  completed?: Date;
}

export type TestRunType = 
  | 'full' 
  | 'incremental' 
  | 'smoke' 
  | 'regression' 
  | 'performance' 
  | 'security' 
  | 'custom';

export interface TestRunConfiguration {
  timeout: number;
  retries: number;
  parallel: boolean;
  maxConcurrency: number;
  bail: boolean;
  verbose: boolean;
  dryRun: boolean;
  randomize: boolean;
  seed?: number;
  filter: TestFilter;
  coverage: boolean;
  reporting: boolean;
  notifications: NotificationConfiguration;
}

export interface TestFilter {
  suites: string[];
  tags: string[];
  categories: TestCategory[];
  priorities: TestPriority[];
  types: TestSuiteType[];
  patterns: string[];
  exclude: TestExcludeFilter;
}

export interface TestExcludeFilter {
  suites: string[];
  tags: string[];
  categories: TestCategory[];
  priorities: TestPriority[];
  types: TestSuiteType[];
  patterns: string[];
  flaky: boolean;
  quarantined: boolean;
}

export interface NotificationConfiguration {
  enabled: boolean;
  onStart: boolean;
  onComplete: boolean;
  onFailure: boolean;
  onSuccess: boolean;
  channels: NotificationChannel[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'teams';
  configuration: any;
  template: string;
  conditions: NotificationCondition[];
}

export interface NotificationCondition {
  type: 'threshold' | 'change' | 'pattern' | 'custom';
  operator: 'greater' | 'less' | 'equal' | 'contains' | 'matches';
  value: any;
  field: string;
}

export type TestTrigger = 
  | 'manual' 
  | 'scheduled' 
  | 'webhook' 
  | 'git-commit' 
  | 'git-pr' 
  | 'deployment' 
  | 'api' 
  | 'monitoring';

export interface TestResults {
  summary: TestResultSummary;
  suites: Map<string, TestSuiteResults>;
  coverage?: CoverageResults;
  performance?: PerformanceResults;
  security?: SecurityResults;
  accessibility?: AccessibilityResults;
  artifacts: TestArtifact[];
}

export interface TestResultSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  error: number;
  timeout: number;
  flaky: number;
  duration: number;
  startTime: Date;
  endTime: Date;
  success: boolean;
  passRate: number;
  failRate: number;
  skipRate: number;
  stability: number;
}

export interface TestSuiteResults {
  suiteId: string;
  name: string;
  status: TestSuiteStatus;
  summary: TestResultSummary;
  tests: Map<string, TestCaseResults>;
  duration: number;
  startTime: Date;
  endTime: Date;
  error?: TestError;
  logs: TestLog[];
  screenshots: TestScreenshot[];
  videos: TestVideo[];
}

export interface TestCaseResults {
  testId: string;
  name: string;
  status: TestCaseStatus;
  duration: number;
  startTime: Date;
  endTime: Date;
  steps: TestStepResults[];
  assertions: TestAssertionResults[];
  error?: TestError;
  logs: TestLog[];
  screenshots: TestScreenshot[];
  videos: TestVideo[];
  retries: number;
  flaky: boolean;
}

export interface TestStepResults {
  stepId: string;
  status: TestStepStatus;
  duration: number;
  input?: any;
  output?: any;
  expected?: any;
  actual?: any;
  error?: TestError;
  screenshot?: TestScreenshot;
}

export interface TestAssertionResults {
  assertionId: string;
  status: TestStepStatus;
  expected: any;
  actual: any;
  operator: AssertionOperator;
  message?: string;
  error?: TestError;
}

export interface CoverageResults {
  lines: CoverageMetric;
  functions: CoverageMetric;
  branches: CoverageMetric;
  statements: CoverageMetric;
  files: Map<string, FileCoverageResults>;
  threshold: CoverageThreshold;
  passed: boolean;
}

export interface CoverageMetric {
  total: number;
  covered: number;
  percentage: number;
  uncovered: number[];
}

export interface FileCoverageResults {
  path: string;
  lines: CoverageMetric;
  functions: CoverageMetric;
  branches: CoverageMetric;
  statements: CoverageMetric;
}

export interface CoverageThreshold {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
  global: number;
}

export interface PerformanceResults {
  metrics: PerformanceMetric[];
  thresholds: PerformanceThreshold[];
  passed: boolean;
  summary: PerformanceSummary;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  passed: boolean;
  percentile?: number;
}

export interface PerformanceThreshold {
  metric: string;
  threshold: number;
  operator: 'less' | 'greater' | 'equal';
  passed: boolean;
  actual: number;
}

export interface PerformanceSummary {
  responseTime: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: number;
  errorRate: number;
  requests: number;
  duration: number;
}

export interface SecurityResults {
  vulnerabilities: SecurityVulnerability[];
  compliance: ComplianceResults;
  passed: boolean;
  score: number;
}

export interface SecurityVulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: string;
  title: string;
  description: string;
  solution: string;
  references: string[];
  cve?: string;
  cvss?: number;
}

export interface ComplianceResults {
  framework: string;
  version: string;
  controls: ComplianceControl[];
  passed: number;
  failed: number;
  skipped: number;
  score: number;
}

export interface ComplianceControl {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'skipped' | 'not-applicable';
  evidence?: string;
  remediation?: string;
}

export interface AccessibilityResults {
  violations: AccessibilityViolation[];
  passes: AccessibilityPass[];
  incomplete: AccessibilityIncomplete[];
  inapplicable: AccessibilityInapplicable[];
  summary: AccessibilitySummary;
  passed: boolean;
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityPass {
  id: string;
  impact: string;
  tags: string[];
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityIncomplete {
  id: string;
  impact: string;
  tags: string[];
  description: string;
  nodes: AccessibilityNode[];
}

export interface AccessibilityInapplicable {
  id: string;
  impact: string;
  tags: string[];
  description: string;
}

export interface AccessibilityNode {
  any: AccessibilityCheck[];
  all: AccessibilityCheck[];
  none: AccessibilityCheck[];
  impact: string;
  html: string;
  target: string[];
}

export interface AccessibilityCheck {
  id: string;
  impact: string;
  message: string;
  data: any;
  relatedNodes: AccessibilityRelatedNode[];
}

export interface AccessibilityRelatedNode {
  target: string[];
  html: string;
}

export interface AccessibilitySummary {
  violations: number;
  passes: number;
  incomplete: number;
  inapplicable: number;
  wcagLevel: 'A' | 'AA' | 'AAA';
  score: number;
}

export interface TestRunState {
  status: TestRunStatus;
  phase: TestRunPhase;
  progress: TestRunProgress;
  startTime?: Date;
  endTime?: Date;
  duration: number;
  error?: TestError;
  cancelled: boolean;
  pausedAt?: Date;
  resumedAt?: Date;
}

export type TestRunStatus = 
  | 'created' 
  | 'queued' 
  | 'running' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'timeout' 
  | 'error';

export type TestRunPhase = 
  | 'initializing' 
  | 'setup' 
  | 'execution' 
  | 'teardown' 
  | 'reporting' 
  | 'cleanup' 
  | 'completed';

export interface TestRunProgress {
  total: number;
  completed: number;
  running: number;
  queued: number;
  failed: number;
  skipped: number;
  percentage: number;
  eta: number;
  currentSuite?: string;
  currentTest?: string;
}

export interface TestExecutionOptions {
  dryRun?: boolean;
  verbose?: boolean;
  bail?: boolean;
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  maxConcurrency?: number;
  filter?: TestFilter;
  environment?: string;
  coverage?: boolean;
  reporting?: boolean;
  notifications?: boolean;
}

// Test Framework State
export interface TestFrameworkState {
  phase: TestFrameworkPhase;
  version: string;
  uptime: number;
  runners: Map<string, TestRunnerState>;
  environments: Map<string, EnvironmentState>;
  activeRuns: Map<string, TestRun>;
  queuedRuns: TestRun[];
  completedRuns: number;
  totalTests: number;
  configuration: TestConfiguration;
  health: TestFrameworkHealth;
  metrics: TestFrameworkMetrics;
  lastUpdated: Date;
}

export type TestFrameworkPhase = 
  | 'initializing' 
  | 'ready' 
  | 'running' 
  | 'paused' 
  | 'maintenance' 
  | 'shutdown' 
  | 'error';

export interface TestFrameworkHealth {
  status: HealthStatus;
  runners: Map<string, HealthStatus>;
  environments: Map<string, HealthStatus>;
  services: Map<string, HealthStatus>;
  lastCheck: Date;
  issues: TestFrameworkIssue[];
}

export interface TestFrameworkIssue {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  component: string;
  message: string;
  details: string;
  resolved: boolean;
  created: Date;
  resolved?: Date;
}

export interface TestFrameworkMetrics {
  runs: {
    total: number;
    successful: number;
    failed: number;
    cancelled: number;
    avgDuration: number;
  };
  tests: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    passRate: number;
    stability: number;
  };
  coverage: {
    average: number;
    trend: number[];
    threshold: number;
    passed: boolean;
  };
  performance: {
    avgResponseTime: number;
    throughput: number;
    errorRate: number;
    trend: number[];
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkUsage: number;
  };
  quality: {
    bugEscapageRate: number;
    defectDensity: number;
    testEffectiveness: number;
    automationRate: number;
  };
}

// Test Reporting Interfaces
export interface TestReporter {
  id: string;
  name: string;
  type: ReporterType;
  configuration: ReporterConfiguration;
  templates: ReportTemplate[];
  outputs: ReportOutput[];
  state: ReporterState;
  created: Date;
  lastUpdated: Date;
}

export type ReporterType = 
  | 'console' 
  | 'html' 
  | 'json' 
  | 'xml' 
  | 'junit' 
  | 'allure' 
  | 'mochawesome' 
  | 'tap' 
  | 'spec' 
  | 'dot' 
  | 'nyan' 
  | 'custom';

export interface ReporterConfiguration {
  outputDir: string;
  filename: string;
  merge: boolean;
  includeSkipped: boolean;
  includeScreenshots: boolean;
  includeVideos: boolean;
  includeLogs: boolean;
  includeCoverage: boolean;
  includePerformance: boolean;
  theme: string;
  logo?: string;
  title: string;
  description: string;
  customFields: Map<string, any>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: 'html' | 'json' | 'xml' | 'pdf' | 'email';
  template: string;
  data: any;
  variables: Map<string, any>;
}

export interface ReportOutput {
  id: string;
  type: ReporterType;
  path: string;
  size: number;
  generated: Date;
  url?: string;
  metadata: Map<string, any>;
}

export interface ReporterState {
  status: 'idle' | 'generating' | 'completed' | 'error';
  lastReport?: Date;
  totalReports: number;
  error?: TestError;
}

// Test Plugin Interfaces
export interface TestPlugin {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  configuration: PluginConfiguration;
  hooks: PluginHooks;
  api: PluginAPI;
  dependencies: string[];
  state: PluginState;
  created: Date;
  lastUpdated: Date;
}

export type PluginType = 
  | 'runner' 
  | 'reporter' 
  | 'transformer' 
  | 'matcher' 
  | 'mock' 
  | 'fixture' 
  | 'environment' 
  | 'coverage' 
  | 'performance' 
  | 'security' 
  | 'accessibility' 
  | 'integration' 
  | 'utility';

export interface PluginConfiguration {
  enabled: boolean;
  autoLoad: boolean;
  priority: number;
  dependencies: string[];
  options: Map<string, any>;
  environment: Map<string, any>;
  files: string[];
  commands: PluginCommand[];
}

export interface PluginCommand {
  name: string;
  description: string;
  handler: Function;
  options: CommandOption[];
  aliases: string[];
}

export interface CommandOption {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: any;
  choices?: any[];
  validate?: Function;
}

export interface PluginHooks {
  beforeAll?: Function[];
  afterAll?: Function[];
  beforeEach?: Function[];
  afterEach?: Function[];
  beforeTest?: Function[];
  afterTest?: Function[];
  beforeSuite?: Function[];
  afterSuite?: Function[];
  beforeRun?: Function[];
  afterRun?: Function[];
  onStart?: Function[];
  onComplete?: Function[];
  onError?: Function[];
  onTimeout?: Function[];
  onCancel?: Function[];
}

export interface PluginAPI {
  getConfig(): TestConfiguration;
  setConfig(config: Partial<TestConfiguration>): void;
  getResults(): TestResults | null;
  getLogger(): any;
  getReporter(): TestReporter;
  addMatcher(name: string, matcher: Function): void;
  addCommand(name: string, command: Function): void;
  emit(event: string, data?: any): void;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}

export interface PluginState {
  status: 'loaded' | 'active' | 'inactive' | 'error';
  loadTime: Date;
  error?: TestError;
  hooks: number;
  commands: number;
  matchers: number;
}

// Test Fixture Interfaces
export interface TestFixture {
  id: string;
  name: string;
  type: FixtureType;
  scope: FixtureScope;
  data: any;
  schema?: any;
  dependencies: string[];
  setup?: Function;
  teardown?: Function;
  lifecycle: FixtureLifecycle;
  state: FixtureState;
  created: Date;
  lastUpdated: Date;
}

export type FixtureType = 
  | 'data' 
  | 'mock' 
  | 'service' 
  | 'environment' 
  | 'database' 
  | 'file' 
  | 'network' 
  | 'user' 
  | 'permission' 
  | 'configuration';

export type FixtureScope = 'global' | 'suite' | 'test' | 'step';

export type FixtureLifecycle = 'static' | 'dynamic' | 'persistent' | 'transient';

export interface FixtureState {
  status: 'created' | 'setup' | 'ready' | 'teardown' | 'destroyed' | 'error';
  setupTime?: Date;
  teardownTime?: Date;
  usageCount: number;
  error?: TestError;
}

// Common Interfaces
export interface TestError {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  type: 'assertion' | 'timeout' | 'network' | 'system' | 'runtime' | 'configuration';
  severity: 'critical' | 'major' | 'minor';
  recoverable: boolean;
  context: Map<string, any>;
  cause?: TestError;
  timestamp: Date;
}

export interface TestLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'trace';
  message: string;
  data?: any;
  timestamp: Date;
  source: string;
  category: string;
  tags: string[];
}

export interface TestScreenshot {
  id: string;
  path: string;
  name: string;
  timestamp: Date;
  size: number;
  format: 'png' | 'jpeg' | 'webp';
  metadata: ScreenshotMetadata;
}

export interface ScreenshotMetadata {
  width: number;
  height: number;
  devicePixelRatio: number;
  viewport: ViewportConfiguration;
  browser?: BrowserConfiguration;
  page?: string;
  element?: string;
}

export interface TestVideo {
  id: string;
  path: string;
  name: string;
  timestamp: Date;
  duration: number;
  size: number;
  format: 'mp4' | 'webm' | 'avi';
  metadata: VideoMetadata;
}

export interface VideoMetadata {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  browser?: BrowserConfiguration;
  pages: string[];
}

export interface TestArtifact {
  id: string;
  name: string;
  type: 'screenshot' | 'video' | 'log' | 'report' | 'coverage' | 'trace' | 'dump' | 'other';
  path: string;
  size: number;
  created: Date;
  metadata: Map<string, any>;
  tags: string[];
}

// Manager Interface
export interface TestFrameworkManager {
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
}