/**
 * System Integration Types
 * Type definitions for integrating all FLCM 2.0 components
 */

export interface FLCMSystem {
  id: string;
  name: string;
  version: string;
  components: SystemComponent[];
  services: ServiceRegistry;
  configuration: SystemConfiguration;
  health: SystemHealth;
  metrics: SystemMetrics;
  dependencies: SystemDependency[];
  status: 'initializing' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  startTime: Date;
  lastHealthCheck: Date;
}

export interface SystemComponent {
  id: string;
  name: string;
  type: ComponentType;
  version: string;
  status: ComponentStatus;
  health: ComponentHealth;
  configuration: ComponentConfiguration;
  dependencies: string[]; // Component IDs
  resources: ResourceUsage;
  metrics: ComponentMetrics;
  endpoints: ComponentEndpoint[];
  capabilities: ComponentCapability[];
}

export type ComponentType = 
  | 'core_framework'
  | 'learning_tracker'
  | 'knowledge_graph'
  | 'obsidian_plugin'
  | 'analytics_dashboard'
  | 'ai_recommendations'
  | 'learning_paths'
  | 'collaboration'
  | 'adaptive_difficulty'
  | 'multimodal_learning'
  | 'semantic_linking'
  | 'daily_summaries'
  | 'migration_monitor'
  | 'feature_flags'
  | 'interaction_modes';

export interface ComponentStatus {
  state: 'offline' | 'starting' | 'online' | 'degraded' | 'error' | 'maintenance';
  message: string;
  lastUpdated: Date;
  uptime: number; // seconds
  restartCount: number;
  errorCount: number;
  lastError?: string;
}

export interface ComponentHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  checks: HealthCheck[];
  score: number; // 0-100
  lastCheck: Date;
  trends: HealthTrend[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration: number; // ms
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface HealthTrend {
  metric: string;
  direction: 'improving' | 'stable' | 'degrading';
  rate: number;
  confidence: number; // 0-1
  timeWindow: number; // hours
}

export interface ComponentConfiguration {
  settings: Record<string, any>;
  environment: 'development' | 'staging' | 'production';
  region: string;
  scaling: ScalingConfiguration;
  security: SecurityConfiguration;
  logging: LoggingConfiguration;
  monitoring: MonitoringConfiguration;
}

export interface ScalingConfiguration {
  autoScale: boolean;
  minInstances: number;
  maxInstances: number;
  targetCPU: number; // percentage
  targetMemory: number; // percentage
  scaleUpCooldown: number; // seconds
  scaleDownCooldown: number; // seconds
  metrics: ScalingMetric[];
}

export interface ScalingMetric {
  name: string;
  type: 'cpu' | 'memory' | 'requests_per_second' | 'queue_length' | 'custom';
  threshold: number;
  window: number; // seconds
  weight: number; // 0-1
}

export interface SecurityConfiguration {
  authentication: AuthConfiguration;
  authorization: AuthorizationConfiguration;
  encryption: EncryptionConfiguration;
  network: NetworkSecurityConfiguration;
  audit: AuditConfiguration;
}

export interface AuthConfiguration {
  provider: 'local' | 'oauth2' | 'saml' | 'ldap' | 'jwt';
  settings: Record<string, any>;
  sessionTimeout: number; // minutes
  mfaRequired: boolean;
  passwordPolicy: PasswordPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number; // number of previous passwords to check
  maxAge: number; // days
}

export interface AuthorizationConfiguration {
  model: 'rbac' | 'abac' | 'custom';
  defaultRole: string;
  roles: Role[];
  permissions: Permission[];
  policies: Policy[];
}

export interface Role {
  name: string;
  description: string;
  permissions: string[];
  inherits: string[]; // Other role names
  default: boolean;
}

export interface Permission {
  name: string;
  resource: string;
  action: string;
  conditions?: string[];
}

export interface Policy {
  name: string;
  rules: PolicyRule[];
  effect: 'allow' | 'deny';
  priority: number;
}

export interface PolicyRule {
  subject: string; // User/role pattern
  resource: string; // Resource pattern
  action: string; // Action pattern
  condition?: string; // Additional conditions
}

export interface EncryptionConfiguration {
  atRest: EncryptionSettings;
  inTransit: EncryptionSettings;
  keys: KeyManagement;
}

export interface EncryptionSettings {
  enabled: boolean;
  algorithm: string;
  keySize: number;
  rotationPeriod: number; // days
}

export interface KeyManagement {
  provider: 'local' | 'aws_kms' | 'azure_kv' | 'hashicorp_vault';
  settings: Record<string, any>;
  backupEnabled: boolean;
  auditEnabled: boolean;
}

export interface NetworkSecurityConfiguration {
  firewallEnabled: boolean;
  allowedIPs: string[];
  blockedIPs: string[];
  rateLimiting: RateLimitConfiguration;
  cors: CorsConfiguration;
}

export interface RateLimitConfiguration {
  enabled: boolean;
  requestsPerMinute: number;
  burstSize: number;
  whitelistIPs: string[];
  blacklistIPs: string[];
}

export interface CorsConfiguration {
  enabled: boolean;
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge: number; // seconds
}

export interface AuditConfiguration {
  enabled: boolean;
  logLevel: 'minimal' | 'standard' | 'detailed' | 'verbose';
  retention: number; // days
  encryption: boolean;
  realTimeAlerts: AuditAlert[];
}

export interface AuditAlert {
  event: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[];
  throttle: number; // minutes
}

export interface LoggingConfiguration {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text' | 'structured';
  output: LoggingOutput[];
  retention: number; // days
  compression: boolean;
  sampling: LoggingSampling;
}

export interface LoggingOutput {
  type: 'console' | 'file' | 'syslog' | 'elasticsearch' | 'cloudwatch' | 'custom';
  settings: Record<string, any>;
  filters: LoggingFilter[];
}

export interface LoggingFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'regex';
  value: string;
  action: 'include' | 'exclude';
}

export interface LoggingSampling {
  enabled: boolean;
  rate: number; // 0-1, percentage of logs to keep
  strategy: 'random' | 'deterministic' | 'adaptive';
}

export interface MonitoringConfiguration {
  enabled: boolean;
  interval: number; // seconds
  metrics: MetricConfiguration[];
  alerts: AlertConfiguration[];
  dashboards: DashboardConfiguration[];
}

export interface MetricConfiguration {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels: string[];
  collection: MetricCollection;
}

export interface MetricCollection {
  method: 'push' | 'pull';
  interval: number; // seconds
  timeout: number; // seconds
  retries: number;
}

export interface AlertConfiguration {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  threshold: number;
  duration: number; // seconds
  cooldown: number; // seconds
  notifications: NotificationChannel[];
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  settings: Record<string, any>;
  enabled: boolean;
}

export interface DashboardConfiguration {
  name: string;
  description: string;
  panels: DashboardPanel[];
  refresh: number; // seconds
  timeRange: TimeRange;
}

export interface DashboardPanel {
  title: string;
  type: 'graph' | 'stat' | 'table' | 'heatmap' | 'logs';
  queries: MetricQuery[];
  size: PanelSize;
  position: PanelPosition;
}

export interface MetricQuery {
  metric: string;
  aggregation: 'sum' | 'avg' | 'max' | 'min' | 'count';
  groupBy: string[];
  filters: QueryFilter[];
  timeRange?: TimeRange;
}

export interface QueryFilter {
  label: string;
  operator: 'equals' | 'not_equals' | 'regex' | 'not_regex';
  value: string;
}

export interface PanelSize {
  width: number; // grid units
  height: number; // grid units
}

export interface PanelPosition {
  x: number;
  y: number;
}

export interface TimeRange {
  from: string; // relative time like "1h" or absolute timestamp
  to: string;
}

export interface ResourceUsage {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  storage: ResourceMetric;
  network: NetworkUsage;
  custom: Record<string, ResourceMetric>;
}

export interface ResourceMetric {
  current: number;
  average: number;
  peak: number;
  limit: number;
  unit: string;
  utilization: number; // percentage
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface NetworkUsage {
  bytesIn: ResourceMetric;
  bytesOut: ResourceMetric;
  packetsIn: ResourceMetric;
  packetsOut: ResourceMetric;
  connections: ResourceMetric;
  errors: ResourceMetric;
}

export interface ComponentMetrics {
  requests: RequestMetrics;
  responses: ResponseMetrics;
  errors: ErrorMetrics;
  latency: LatencyMetrics;
  throughput: ThroughputMetrics;
  availability: AvailabilityMetrics;
  custom: Record<string, any>;
}

export interface RequestMetrics {
  total: number;
  rate: number; // per second
  failed: number;
  retried: number;
  queued: number;
}

export interface ResponseMetrics {
  success: number;
  clientError: number; // 4xx
  serverError: number; // 5xx
  total: number;
  averageSize: number; // bytes
}

export interface ErrorMetrics {
  count: number;
  rate: number; // per second
  types: Record<string, number>;
  severity: Record<string, number>;
  resolved: number;
}

export interface LatencyMetrics {
  p50: number; // milliseconds
  p90: number;
  p95: number;
  p99: number;
  average: number;
  max: number;
}

export interface ThroughputMetrics {
  requestsPerSecond: number;
  bytesPerSecond: number;
  operationsPerSecond: number;
  peak: number;
  sustained: number;
}

export interface AvailabilityMetrics {
  uptime: number; // percentage
  downtime: number; // minutes in last 24h
  mttr: number; // mean time to recovery in minutes
  mtbf: number; // mean time between failures in hours
}

export interface ComponentEndpoint {
  name: string;
  type: 'http' | 'grpc' | 'websocket' | 'graphql' | 'custom';
  url: string;
  method?: string;
  version: string;
  documentation: string;
  authentication: boolean;
  authorization: string[];
  rateLimit: EndpointRateLimit;
  caching: EndpointCaching;
  validation: EndpointValidation;
}

export interface EndpointRateLimit {
  enabled: boolean;
  requests: number;
  window: number; // seconds
  burst: number;
}

export interface EndpointCaching {
  enabled: boolean;
  ttl: number; // seconds
  strategy: 'memory' | 'redis' | 'cdn';
  keyPattern: string;
}

export interface EndpointValidation {
  requestValidation: boolean;
  responseValidation: boolean;
  schema: string; // JSON Schema or OpenAPI spec
  strictMode: boolean;
}

export interface ComponentCapability {
  name: string;
  description: string;
  version: string;
  interfaces: CapabilityInterface[];
  dependencies: string[];
  configuration: Record<string, any>;
  status: 'available' | 'unavailable' | 'degraded';
}

export interface CapabilityInterface {
  name: string;
  type: 'sync' | 'async' | 'event' | 'stream';
  input: string; // Schema or type definition
  output: string;
  errors: string[];
}

export interface ServiceRegistry {
  services: Map<string, ServiceDefinition>;
  discovery: ServiceDiscovery;
  loadBalancing: LoadBalancingConfiguration;
  circuitBreaker: CircuitBreakerConfiguration;
  retryPolicy: RetryPolicyConfiguration;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  version: string;
  instances: ServiceInstance[];
  contract: ServiceContract;
  health: ServiceHealth;
  metrics: ServiceMetrics;
  configuration: ServiceConfiguration;
}

export interface ServiceInstance {
  id: string;
  host: string;
  port: number;
  protocol: string;
  status: 'healthy' | 'unhealthy' | 'starting' | 'stopping';
  metadata: Record<string, any>;
  lastHeartbeat: Date;
  registeredAt: Date;
  tags: string[];
}

export interface ServiceContract {
  api: ApiContract;
  events: EventContract[];
  sla: ServiceLevelAgreement;
  compatibility: CompatibilityInfo;
}

export interface ApiContract {
  version: string;
  specification: string; // OpenAPI/Swagger URL or content
  endpoints: ContractEndpoint[];
  authentication: string[];
  dataFormats: string[];
}

export interface ContractEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: EndpointParameter[];
  responses: EndpointResponse[];
  examples: EndpointExample[];
}

export interface EndpointParameter {
  name: string;
  type: string;
  location: 'query' | 'header' | 'path' | 'body';
  required: boolean;
  description: string;
  schema: string;
}

export interface EndpointResponse {
  status: number;
  description: string;
  schema: string;
  examples: any[];
  headers: Record<string, string>;
}

export interface EndpointExample {
  name: string;
  description: string;
  request: any;
  response: any;
}

export interface EventContract {
  name: string;
  version: string;
  description: string;
  schema: string;
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  ordering: 'unordered' | 'ordered' | 'partitioned';
}

export interface ServiceLevelAgreement {
  availability: number; // percentage
  responseTime: number; // milliseconds
  throughput: number; // requests per second
  errorRate: number; // percentage
  recovery: number; // minutes
  support: SupportLevel;
}

export interface SupportLevel {
  tier: 'basic' | 'standard' | 'premium' | 'enterprise';
  hours: string;
  responseTime: number; // hours
  channels: string[];
}

export interface CompatibilityInfo {
  backward: string[]; // versions this is backward compatible with
  forward: string[]; // versions this can forward compatibility to
  breaking: BreakingChange[];
  deprecated: DeprecatedFeature[];
}

export interface BreakingChange {
  version: string;
  description: string;
  migration: string;
  timeline: Date;
}

export interface DeprecatedFeature {
  feature: string;
  deprecatedIn: string;
  removedIn: string;
  alternative: string;
  reason: string;
}

export interface ServiceHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: ServiceHealthCheck[];
  dependencies: DependencyHealth[];
  lastCheck: Date;
  checkInterval: number; // seconds
}

export interface ServiceHealthCheck {
  name: string;
  type: 'http' | 'tcp' | 'custom';
  endpoint: string;
  timeout: number; // seconds
  interval: number; // seconds
  threshold: HealthThreshold;
  status: 'pass' | 'fail' | 'warn';
  lastCheck: Date;
  consecutiveFailures: number;
}

export interface HealthThreshold {
  healthy: number; // consecutive successes needed
  unhealthy: number; // consecutive failures needed
  timeout: number; // seconds
}

export interface DependencyHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  impact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  fallback: string; // fallback strategy
  lastCheck: Date;
}

export interface ServiceMetrics {
  requests: ServiceRequestMetrics;
  performance: ServicePerformanceMetrics;
  errors: ServiceErrorMetrics;
  resources: ServiceResourceMetrics;
}

export interface ServiceRequestMetrics {
  total: number;
  successful: number;
  failed: number;
  rate: number; // per second
  concurrency: number;
}

export interface ServicePerformanceMetrics {
  responseTime: LatencyMetrics;
  throughput: ThroughputMetrics;
  saturation: number; // percentage
  efficiency: number; // percentage
}

export interface ServiceErrorMetrics {
  total: number;
  rate: number; // per second
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recovery: number; // average seconds to recover
}

export interface ServiceResourceMetrics {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  network: NetworkUsage;
  storage: ResourceMetric;
}

export interface ServiceConfiguration {
  environment: Record<string, string>;
  features: FeatureFlag[];
  limits: ResourceLimits;
  timeouts: TimeoutConfiguration;
  caching: CachingConfiguration;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rollout: number; // percentage
  conditions: FlagCondition[];
  expiry?: Date;
}

export interface FlagCondition {
  type: 'user' | 'region' | 'version' | 'custom';
  operator: 'equals' | 'in' | 'regex' | 'percentage';
  value: any;
}

export interface ResourceLimits {
  cpu: string; // e.g., "500m"
  memory: string; // e.g., "1Gi"
  storage: string; // e.g., "10Gi"
  connections: number;
  requests: number; // per second
}

export interface TimeoutConfiguration {
  request: number; // seconds
  response: number; // seconds
  connection: number; // seconds
  idle: number; // seconds
  total: number; // seconds
}

export interface CachingConfiguration {
  enabled: boolean;
  provider: 'memory' | 'redis' | 'memcached' | 'custom';
  settings: Record<string, any>;
  policies: CachingPolicy[];
}

export interface CachingPolicy {
  pattern: string; // URL or key pattern
  ttl: number; // seconds
  strategy: 'cache_first' | 'network_first' | 'cache_only' | 'network_only';
  invalidation: InvalidationRule[];
}

export interface InvalidationRule {
  trigger: 'time' | 'event' | 'manual' | 'dependency';
  condition: string;
  scope: 'key' | 'pattern' | 'tag' | 'all';
}

export interface ServiceDiscovery {
  provider: 'consul' | 'etcd' | 'kubernetes' | 'dns' | 'custom';
  settings: Record<string, any>;
  registration: RegistrationConfiguration;
  resolution: ResolutionConfiguration;
}

export interface RegistrationConfiguration {
  automatic: boolean;
  interval: number; // seconds
  timeout: number; // seconds
  retries: number;
  metadata: Record<string, any>;
}

export interface ResolutionConfiguration {
  strategy: 'round_robin' | 'least_connections' | 'weighted' | 'random' | 'custom';
  caching: boolean;
  cacheTtl: number; // seconds
  refresh: number; // seconds
}

export interface LoadBalancingConfiguration {
  algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash' | 'custom';
  healthCheck: boolean;
  stickySessions: boolean;
  weights: Record<string, number>; // instance weights
  failover: FailoverConfiguration;
}

export interface FailoverConfiguration {
  enabled: boolean;
  threshold: number; // consecutive failures
  timeout: number; // seconds
  backoff: BackoffStrategy;
}

export interface BackoffStrategy {
  type: 'fixed' | 'exponential' | 'linear' | 'custom';
  initial: number; // seconds
  max: number; // seconds
  multiplier?: number;
  jitter?: boolean;
}

export interface CircuitBreakerConfiguration {
  enabled: boolean;
  failureThreshold: number; // percentage
  timeWindow: number; // seconds
  halfOpenTimeout: number; // seconds
  recovery: RecoveryConfiguration;
}

export interface RecoveryConfiguration {
  testRequests: number;
  successThreshold: number; // percentage
  timeout: number; // seconds
}

export interface RetryPolicyConfiguration {
  enabled: boolean;
  maxAttempts: number;
  backoff: BackoffStrategy;
  conditions: RetryCondition[];
}

export interface RetryCondition {
  type: 'http_status' | 'timeout' | 'connection_error' | 'custom';
  pattern: string;
  action: 'retry' | 'fail' | 'fallback';
}

export interface SystemConfiguration {
  global: GlobalConfiguration;
  components: Map<string, ComponentConfiguration>;
  integrations: IntegrationConfiguration[];
  deployment: DeploymentConfiguration;
  observability: ObservabilityConfiguration;
}

export interface GlobalConfiguration {
  environment: 'development' | 'staging' | 'production';
  region: string;
  timezone: string;
  debug: boolean;
  features: GlobalFeature[];
  limits: GlobalLimits;
  security: GlobalSecurity;
}

export interface GlobalFeature {
  name: string;
  enabled: boolean;
  components: string[]; // Component IDs this affects
  settings: Record<string, any>;
}

export interface GlobalLimits {
  maxUsers: number;
  maxConcurrentSessions: number;
  maxDataRetention: number; // days
  maxFileSize: number; // bytes
  rateLimit: GlobalRateLimit;
}

export interface GlobalRateLimit {
  requests: number; // per minute
  burst: number;
  whitelistIPs: string[];
  exemptUsers: string[];
}

export interface GlobalSecurity {
  defaultAuth: string; // auth provider
  sessionTimeout: number; // minutes
  csrfProtection: boolean;
  contentSecurityPolicy: string;
  httpHeaders: Record<string, string>;
}

export interface IntegrationConfiguration {
  name: string;
  type: 'api' | 'database' | 'message_queue' | 'cache' | 'storage' | 'external_service';
  provider: string;
  settings: Record<string, any>;
  authentication: IntegrationAuth;
  connection: ConnectionConfiguration;
  fallback: FallbackConfiguration;
}

export interface IntegrationAuth {
  type: 'none' | 'api_key' | 'oauth2' | 'basic' | 'certificate' | 'custom';
  settings: Record<string, any>;
  rotation: AuthRotation;
}

export interface AuthRotation {
  enabled: boolean;
  interval: number; // days
  warning: number; // days before expiry
  automatic: boolean;
}

export interface ConnectionConfiguration {
  timeout: number; // seconds
  retries: number;
  backoff: BackoffStrategy;
  poolSize: number;
  keepAlive: boolean;
  ssl: SslConfiguration;
}

export interface SslConfiguration {
  enabled: boolean;
  verify: boolean;
  certificate: string;
  key: string;
  ca: string;
  protocols: string[];
}

export interface FallbackConfiguration {
  enabled: boolean;
  strategy: 'cache' | 'static' | 'alternative_service' | 'degraded_mode';
  settings: Record<string, any>;
  timeout: number; // seconds
}

export interface DeploymentConfiguration {
  strategy: 'rolling' | 'blue_green' | 'canary' | 'recreate';
  automation: DeploymentAutomation;
  environments: EnvironmentConfiguration[];
  rollback: RollbackConfiguration;
  validation: DeploymentValidation;
}

export interface DeploymentAutomation {
  enabled: boolean;
  triggers: DeploymentTrigger[];
  approval: ApprovalConfiguration;
  testing: TestingConfiguration;
  monitoring: DeploymentMonitoring;
}

export interface DeploymentTrigger {
  type: 'git_push' | 'tag' | 'schedule' | 'manual' | 'webhook';
  conditions: string[];
  branch?: string;
  environment?: string;
}

export interface ApprovalConfiguration {
  required: boolean;
  approvers: string[];
  timeout: number; // hours
  automatic: AutoApprovalRule[];
}

export interface AutoApprovalRule {
  condition: string;
  approver: 'system' | 'author' | 'lead';
  environment: string[];
}

export interface TestingConfiguration {
  unit: boolean;
  integration: boolean;
  e2e: boolean;
  performance: boolean;
  security: boolean;
  coverage: CoverageConfiguration;
}

export interface CoverageConfiguration {
  minimum: number; // percentage
  fail: boolean; // fail deployment if below minimum
  report: boolean;
  trends: boolean;
}

export interface DeploymentMonitoring {
  healthChecks: boolean;
  metrics: boolean;
  logs: boolean;
  alerts: boolean;
  duration: number; // minutes to monitor after deployment
}

export interface EnvironmentConfiguration {
  name: string;
  type: 'development' | 'testing' | 'staging' | 'production';
  region: string;
  resources: EnvironmentResources;
  security: EnvironmentSecurity;
  networking: NetworkingConfiguration;
}

export interface EnvironmentResources {
  compute: ComputeResources;
  storage: StorageResources;
  network: NetworkResources;
}

export interface ComputeResources {
  cpu: string;
  memory: string;
  instances: number;
  autoScaling: boolean;
}

export interface StorageResources {
  type: 'ssd' | 'hdd' | 'network';
  size: string;
  iops: number;
  backup: boolean;
}

export interface NetworkResources {
  bandwidth: string;
  connections: number;
  loadBalancer: boolean;
  cdn: boolean;
}

export interface EnvironmentSecurity {
  isolation: 'none' | 'basic' | 'strict';
  encryption: boolean;
  monitoring: boolean;
  compliance: string[];
}

export interface NetworkingConfiguration {
  vpc: VpcConfiguration;
  subnets: SubnetConfiguration[];
  security: NetworkSecurityConfiguration;
  dns: DnsConfiguration;
}

export interface VpcConfiguration {
  cidr: string;
  enableDnsHostnames: boolean;
  enableDnsSupport: boolean;
  tenancy: 'default' | 'dedicated';
}

export interface SubnetConfiguration {
  name: string;
  cidr: string;
  availabilityZone: string;
  public: boolean;
  routeTable: string;
}

export interface DnsConfiguration {
  provider: 'route53' | 'cloudflare' | 'custom';
  domain: string;
  subdomain: string;
  ttl: number;
  records: DnsRecord[];
}

export interface DnsRecord {
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  value: string;
  ttl: number;
}

export interface RollbackConfiguration {
  automatic: boolean;
  triggers: RollbackTrigger[];
  strategy: 'immediate' | 'gradual' | 'manual';
  timeout: number; // minutes
  validation: boolean;
}

export interface RollbackTrigger {
  type: 'health_check' | 'error_rate' | 'performance' | 'manual';
  threshold: number;
  duration: number; // seconds
  conditions: string[];
}

export interface DeploymentValidation {
  preDeployment: ValidationStep[];
  postDeployment: ValidationStep[];
  rollback: ValidationStep[];
}

export interface ValidationStep {
  name: string;
  type: 'health_check' | 'smoke_test' | 'integration_test' | 'performance_test' | 'security_scan';
  timeout: number; // seconds
  retries: number;
  critical: boolean; // failure blocks deployment
  command?: string;
  expected?: any;
}

export interface ObservabilityConfiguration {
  metrics: MetricsConfiguration;
  logging: GlobalLoggingConfiguration;
  tracing: TracingConfiguration;
  profiling: ProfilingConfiguration;
  alerting: AlertingConfiguration;
}

export interface MetricsConfiguration {
  provider: 'prometheus' | 'datadog' | 'newrelic' | 'custom';
  settings: Record<string, any>;
  collection: MetricCollectionConfiguration;
  retention: number; // days
  aggregation: AggregationConfiguration[];
}

export interface MetricCollectionConfiguration {
  interval: number; // seconds
  timeout: number; // seconds
  batch: boolean;
  compression: boolean;
  sampling: MetricSampling;
}

export interface MetricSampling {
  enabled: boolean;
  rate: number; // 0-1
  strategy: 'random' | 'reservoir' | 'systematic';
}

export interface AggregationConfiguration {
  metric: string;
  function: 'sum' | 'avg' | 'max' | 'min' | 'count' | 'percentile';
  window: number; // seconds
  groupBy: string[];
}

export interface GlobalLoggingConfiguration extends LoggingConfiguration {
  centralized: boolean;
  correlation: CorrelationConfiguration;
  enrichment: EnrichmentConfiguration;
}

export interface CorrelationConfiguration {
  enabled: boolean;
  traceId: string; // header name
  requestId: string; // header name
  userId: string; // header name
}

export interface EnrichmentConfiguration {
  enabled: boolean;
  fields: EnrichmentField[];
  processors: EnrichmentProcessor[];
}

export interface EnrichmentField {
  name: string;
  source: 'header' | 'environment' | 'metadata' | 'computed';
  mapping: string;
  required: boolean;
}

export interface EnrichmentProcessor {
  name: string;
  type: 'geoip' | 'user_agent' | 'timestamp' | 'hash' | 'custom';
  settings: Record<string, any>;
  fields: string[];
}

export interface TracingConfiguration {
  enabled: boolean;
  provider: 'jaeger' | 'zipkin' | 'datadog' | 'newrelic';
  settings: Record<string, any>;
  sampling: TracingSampling;
  export: TraceExport;
}

export interface TracingSampling {
  strategy: 'probabilistic' | 'adaptive' | 'rate_limiting';
  rate: number; // 0-1 for probabilistic, requests/sec for rate limiting
  rules: SamplingRule[];
}

export interface SamplingRule {
  service: string;
  operation: string;
  rate: number;
  priority: number;
}

export interface TraceExport {
  format: 'jaeger' | 'zipkin' | 'otlp';
  endpoint: string;
  headers: Record<string, string>;
  batch: boolean;
  timeout: number; // seconds
}

export interface ProfilingConfiguration {
  enabled: boolean;
  provider: 'pprof' | 'pyspy' | 'async-profiler' | 'custom';
  settings: Record<string, any>;
  collection: ProfilingCollection;
  analysis: ProfilingAnalysis;
}

export interface ProfilingCollection {
  interval: number; // seconds
  duration: number; // seconds
  types: string[]; // cpu, memory, goroutine, etc.
  overhead: number; // maximum overhead percentage
}

export interface ProfilingAnalysis {
  automatic: boolean;
  triggers: AnalysisTrigger[];
  reports: ProfilingReport[];
}

export interface AnalysisTrigger {
  type: 'threshold' | 'anomaly' | 'schedule';
  condition: string;
  action: 'collect' | 'analyze' | 'alert';
}

export interface ProfilingReport {
  name: string;
  schedule: string; // cron expression
  recipients: string[];
  format: 'html' | 'json' | 'flame_graph';
}

export interface AlertingConfiguration {
  provider: 'prometheus' | 'datadog' | 'pagerduty' | 'custom';
  settings: Record<string, any>;
  rules: AlertRule[];
  routing: AlertRouting;
  suppression: AlertSuppression;
}

export interface AlertRule {
  name: string;
  query: string;
  severity: 'info' | 'warning' | 'critical';
  threshold: number;
  duration: number; // seconds
  labels: Record<string, string>;
  annotations: Record<string, string>;
}

export interface AlertRouting {
  default: string[]; // default recipients
  rules: RoutingRule[];
  escalation: EscalationPolicy[];
}

export interface RoutingRule {
  matcher: string; // label matcher
  recipients: string[];
  priority: number;
}

export interface EscalationPolicy {
  name: string;
  steps: EscalationStep[];
}

export interface EscalationStep {
  delay: number; // minutes
  recipients: string[];
  action: 'notify' | 'escalate' | 'resolve';
}

export interface AlertSuppression {
  enabled: boolean;
  rules: SuppressionRule[];
  maintenance: MaintenanceWindow[];
}

export interface SuppressionRule {
  matcher: string; // label matcher
  duration: number; // minutes
  reason: string;
}

export interface MaintenanceWindow {
  name: string;
  start: Date;
  end: Date;
  recurring: boolean;
  pattern?: string; // cron pattern if recurring
  services: string[];
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  score: number; // 0-100
  components: ComponentHealth[];
  dependencies: DependencyHealth[];
  issues: HealthIssue[];
  trends: SystemHealthTrend[];
  lastCheck: Date;
}

export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'performance' | 'availability' | 'security' | 'data' | 'configuration';
  title: string;
  description: string;
  component: string;
  impact: string;
  recommendation: string;
  created: Date;
  resolved?: Date;
  assignee?: string;
}

export interface SystemHealthTrend {
  metric: string;
  direction: 'improving' | 'stable' | 'degrading';
  rate: number;
  confidence: number; // 0-1
  timeWindow: number; // hours
  significance: 'low' | 'medium' | 'high';
}

export interface SystemMetrics {
  performance: SystemPerformanceMetrics;
  usage: SystemUsageMetrics;
  business: BusinessMetrics;
  technical: TechnicalMetrics;
}

export interface SystemPerformanceMetrics {
  responseTime: LatencyMetrics;
  throughput: ThroughputMetrics;
  availability: AvailabilityMetrics;
  reliability: ReliabilityMetrics;
}

export interface ReliabilityMetrics {
  errorRate: number; // percentage
  mtbf: number; // hours
  mttr: number; // minutes
  failureCount: number;
  recoveryCount: number;
}

export interface SystemUsageMetrics {
  users: UserMetrics;
  sessions: SessionMetrics;
  features: FeatureUsageMetrics;
  resources: ResourceUsageMetrics;
}

export interface UserMetrics {
  active: number;
  total: number;
  new: number;
  returning: number;
  churn: number; // percentage
}

export interface SessionMetrics {
  total: number;
  concurrent: number;
  average: number; // duration in minutes
  bounceRate: number; // percentage
}

export interface FeatureUsageMetrics {
  adoption: Record<string, number>; // feature -> percentage
  engagement: Record<string, number>; // feature -> usage frequency
  performance: Record<string, LatencyMetrics>; // feature -> performance
}

export interface ResourceUsageMetrics {
  compute: ComputeUsageMetrics;
  storage: StorageUsageMetrics;
  network: NetworkUsageMetrics;
  costs: CostMetrics;
}

export interface ComputeUsageMetrics {
  cpu: ResourceMetric;
  memory: ResourceMetric;
  instances: number;
  utilization: number; // percentage
}

export interface StorageUsageMetrics {
  used: ResourceMetric;
  available: ResourceMetric;
  growth: number; // percentage per month
  iops: ResourceMetric;
}

export interface NetworkUsageMetrics {
  bandwidth: ResourceMetric;
  requests: RequestMetrics;
  cdn: CdnMetrics;
}

export interface CdnMetrics {
  hitRatio: number; // percentage
  bandwidth: ResourceMetric;
  requests: RequestMetrics;
  errors: ErrorMetrics;
}

export interface CostMetrics {
  total: number;
  breakdown: Record<string, number>; // component -> cost
  trends: CostTrend[];
  optimization: CostOptimization[];
}

export interface CostTrend {
  component: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  rate: number; // percentage change per month
  projection: number; // projected monthly cost
}

export interface CostOptimization {
  opportunity: string;
  savings: number; // potential monthly savings
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface BusinessMetrics {
  conversion: ConversionMetrics;
  engagement: EngagementMetrics;
  satisfaction: SatisfactionMetrics;
  growth: GrowthMetrics;
}

export interface ConversionMetrics {
  signups: number;
  activations: number;
  subscriptions: number;
  retention: RetentionMetrics;
  funnel: FunnelMetrics[];
}

export interface RetentionMetrics {
  day1: number; // percentage
  day7: number;
  day30: number;
  cohorts: CohortMetric[];
}

export interface CohortMetric {
  period: string;
  size: number;
  retention: number[]; // retention by week/month
}

export interface FunnelMetrics {
  step: string;
  users: number;
  conversion: number; // percentage to next step
  dropoff: number; // percentage lost at this step
}

export interface EngagementMetrics {
  dau: number; // daily active users
  mau: number; // monthly active users
  sessionTime: number; // average minutes
  pageViews: number;
  features: Record<string, number>; // feature usage
}

export interface SatisfactionMetrics {
  nps: number; // net promoter score
  csat: number; // customer satisfaction score
  support: SupportMetrics;
  feedback: FeedbackMetrics;
}

export interface SupportMetrics {
  tickets: number;
  resolution: number; // average hours
  satisfaction: number; // percentage
  escalations: number;
}

export interface FeedbackMetrics {
  volume: number;
  sentiment: number; // -1 to 1
  categories: Record<string, number>; // category -> count
  trends: FeedbackTrend[];
}

export interface FeedbackTrend {
  category: string;
  direction: 'improving' | 'stable' | 'worsening';
  rate: number;
  significance: number; // 0-1
}

export interface GrowthMetrics {
  users: GrowthMetric;
  revenue: GrowthMetric;
  usage: GrowthMetric;
  market: MarketMetrics;
}

export interface GrowthMetric {
  current: number;
  previous: number;
  rate: number; // percentage change
  projection: number;
  target: number;
}

export interface MarketMetrics {
  share: number; // percentage
  size: number;
  growth: number; // percentage
  competition: CompetitionMetric[];
}

export interface CompetitionMetric {
  competitor: string;
  share: number; // percentage
  trend: 'gaining' | 'stable' | 'losing';
}

export interface TechnicalMetrics {
  deployment: DeploymentMetrics;
  quality: QualityMetrics;
  security: SecurityMetrics;
  compliance: ComplianceMetrics;
}

export interface DeploymentMetrics {
  frequency: number; // per week
  duration: number; // average minutes
  success: number; // percentage
  rollbacks: number;
  leadTime: number; // hours from commit to production
}

export interface QualityMetrics {
  bugs: BugMetrics;
  tests: TestMetrics;
  code: CodeMetrics;
  performance: PerformanceMetrics;
}

export interface BugMetrics {
  open: number;
  closed: number;
  created: number;
  severity: Record<string, number>; // severity -> count
  age: number; // average days
}

export interface TestMetrics {
  coverage: number; // percentage
  pass: number; // percentage
  duration: number; // minutes
  flaky: number; // flaky tests count
}

export interface CodeMetrics {
  complexity: number;
  duplication: number; // percentage
  maintainability: number; // 0-100
  debt: number; // hours to fix
}

export interface PerformanceMetrics {
  web: WebPerformanceMetrics;
  api: ApiPerformanceMetrics;
  database: DatabasePerformanceMetrics;
}

export interface WebPerformanceMetrics {
  loadTime: number; // seconds
  firstPaint: number; // seconds
  interactive: number; // seconds
  lighthouse: number; // score 0-100
}

export interface ApiPerformanceMetrics {
  responseTime: LatencyMetrics;
  throughput: number; // requests per second
  errors: number; // percentage
  saturation: number; // percentage
}

export interface DatabasePerformanceMetrics {
  queryTime: LatencyMetrics;
  connections: number;
  utilization: number; // percentage
  slowQueries: number;
}

export interface SecurityMetrics {
  vulnerabilities: VulnerabilityMetrics;
  incidents: SecurityIncidentMetrics;
  compliance: SecurityComplianceMetrics;
  access: AccessMetrics;
}

export interface VulnerabilityMetrics {
  total: number;
  severity: Record<string, number>; // severity -> count
  age: number; // average days
  patched: number; // this month
}

export interface SecurityIncidentMetrics {
  total: number;
  resolved: number;
  avgResolution: number; // hours
  impact: Record<string, number>; // impact level -> count
}

export interface SecurityComplianceMetrics {
  score: number; // percentage
  violations: number;
  audits: number; // passed this year
  certifications: string[];
}

export interface AccessMetrics {
  logins: number;
  failed: number; // failed login attempts
  mfa: number; // percentage using MFA
  privileged: number; // privileged access usage
}

export interface ComplianceMetrics {
  frameworks: ComplianceFramework[];
  status: ComplianceStatus;
  audits: ComplianceAudit[];
  violations: ComplianceViolation[];
}

export interface ComplianceFramework {
  name: string; // GDPR, HIPAA, SOC2, etc.
  status: 'compliant' | 'partial' | 'non_compliant';
  score: number; // percentage
  requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  status: 'met' | 'partial' | 'not_met';
  evidence: string[];
  owner: string;
  dueDate?: Date;
}

export interface ComplianceStatus {
  overall: number; // percentage
  trend: 'improving' | 'stable' | 'declining';
  critical: number; // critical violations
  lastAssessment: Date;
}

export interface ComplianceAudit {
  id: string;
  framework: string;
  type: 'internal' | 'external' | 'regulatory';
  date: Date;
  status: 'passed' | 'failed' | 'conditional';
  findings: AuditFinding[];
}

export interface AuditFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  status: 'open' | 'addressed' | 'mitigated';
  dueDate?: Date;
}

export interface ComplianceViolation {
  id: string;
  framework: string;
  requirement: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected: Date;
  resolved?: Date;
  impact: string;
  remediation: string;
}

export interface SystemDependency {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'database' | 'api' | 'service';
  version: string;
  required: boolean;
  status: 'available' | 'unavailable' | 'degraded';
  health: DependencyHealth;
  sla: ServiceLevelAgreement;
  alternatives: DependencyAlternative[];
}

export interface DependencyAlternative {
  name: string;
  type: string;
  cost: 'lower' | 'same' | 'higher';
  effort: 'low' | 'medium' | 'high';
  compatibility: number; // 0-1
  recommendation: string;
}

export interface SystemIntegrator {
  initialize(config: SystemConfiguration): Promise<FLCMSystem>;
  start(systemId: string): Promise<void>;
  stop(systemId: string): Promise<void>;
  restart(systemId: string): Promise<void>;
  getHealth(systemId: string): Promise<SystemHealth>;
  getMetrics(systemId: string): Promise<SystemMetrics>;
  updateConfiguration(systemId: string, config: Partial<SystemConfiguration>): Promise<void>;
  scaleComponent(systemId: string, componentId: string, instances: number): Promise<void>;
  deployUpdate(systemId: string, componentId: string, version: string): Promise<void>;
  rollback(systemId: string, componentId: string): Promise<void>;
}