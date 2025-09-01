/**
 * FLCM Observability and Monitoring Types
 * Comprehensive monitoring, logging, tracing, and alerting types
 */

// Core Observability Interfaces
export interface ObservabilitySystem {
  id: string;
  name: string;
  description: string;
  version: string;
  configuration: ObservabilityConfiguration;
  components: Map<string, ObservabilityComponent>;
  services: Map<string, MonitoredService>;
  dashboards: Map<string, Dashboard>;
  alerts: Map<string, AlertRule>;
  incidents: Map<string, Incident>;
  slos: Map<string, ServiceLevelObjective>;
  state: ObservabilitySystemState;
  created: Date;
  lastUpdated: Date;
}

export interface ObservabilityConfiguration {
  collection: CollectionConfiguration;
  storage: StorageConfiguration;
  processing: ProcessingConfiguration;
  alerting: AlertingConfiguration;
  visualization: VisualizationConfiguration;
  retention: RetentionConfiguration;
  security: ObservabilitySecurityConfiguration;
  performance: PerformanceConfiguration;
  compliance: ComplianceConfiguration;
}

export interface CollectionConfiguration {
  metrics: MetricsCollectionConfig;
  logs: LogsCollectionConfig;
  traces: TracesCollectionConfig;
  events: EventsCollectionConfig;
  profiles: ProfilingCollectionConfig;
  synthetic: SyntheticMonitoringConfig;
  rum: RealUserMonitoringConfig;
}

export interface MetricsCollectionConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  batchSize: number;
  compression: boolean;
  encryption: boolean;
  collectors: MetricsCollector[];
  exporters: MetricsExporter[];
  processors: MetricsProcessor[];
  samplingRate: number;
  cardinality: CardinalityConfiguration;
}

export interface MetricsCollector {
  id: string;
  type: CollectorType;
  configuration: any;
  targets: CollectionTarget[];
  labels: Map<string, string>;
  enabled: boolean;
  healthCheck: HealthCheckConfig;
}

export type CollectorType = 
  | 'prometheus' 
  | 'statsd' 
  | 'opencensus' 
  | 'opentelemetry' 
  | 'jaeger' 
  | 'zipkin' 
  | 'datadog' 
  | 'newrelic' 
  | 'custom';

export interface CollectionTarget {
  name: string;
  type: TargetType;
  endpoint: string;
  credentials?: CredentialsConfig;
  scrapeConfig?: ScrapeConfig;
  labels: Map<string, string>;
  enabled: boolean;
}

export type TargetType = 
  | 'application' 
  | 'infrastructure' 
  | 'database' 
  | 'network' 
  | 'kubernetes' 
  | 'container' 
  | 'service-mesh' 
  | 'cloud-provider' 
  | 'custom';

export interface CredentialsConfig {
  type: 'basic' | 'bearer' | 'oauth2' | 'certificate' | 'aws-iam' | 'gcp-service-account';
  configuration: any;
}

export interface ScrapeConfig {
  interval: number;
  timeout: number;
  path: string;
  scheme: 'http' | 'https';
  params: Map<string, string>;
  headers: Map<string, string>;
  bodyLimit: number;
}

export interface MetricsExporter {
  id: string;
  type: ExporterType;
  configuration: any;
  enabled: boolean;
  batchSize: number;
  timeout: number;
  retries: number;
  queue: QueueConfiguration;
}

export type ExporterType = 
  | 'prometheus' 
  | 'otlp' 
  | 'jaeger' 
  | 'zipkin' 
  | 'datadog' 
  | 'newrelic' 
  | 'cloudwatch' 
  | 'stackdriver' 
  | 'azure-monitor' 
  | 'kafka' 
  | 'custom';

export interface QueueConfiguration {
  size: number;
  workers: number;
  flushInterval: number;
  flushSize: number;
  retryOnFailure: boolean;
  deadLetterQueue: boolean;
}

export interface MetricsProcessor {
  id: string;
  type: ProcessorType;
  configuration: any;
  order: number;
  enabled: boolean;
  filters: ProcessorFilter[];
}

export type ProcessorType = 
  | 'batch' 
  | 'memory_limiter' 
  | 'resource' 
  | 'span' 
  | 'filter' 
  | 'transform' 
  | 'groupby' 
  | 'probabilistic_sampler' 
  | 'tail_sampler' 
  | 'custom';

export interface ProcessorFilter {
  type: 'include' | 'exclude';
  condition: string;
  attributes: Map<string, string>;
}

export interface CardinalityConfiguration {
  maxSeries: number;
  maxLabels: number;
  maxLabelValueLength: number;
  enforcementAction: 'drop' | 'sample' | 'alert';
}

export interface LogsCollectionConfig {
  enabled: boolean;
  level: LogLevel;
  format: LogFormat;
  structured: boolean;
  compression: boolean;
  encryption: boolean;
  collectors: LogsCollector[];
  processors: LogsProcessor[];
  exporters: LogsExporter[];
  parsing: LogParsingConfig;
  enrichment: LogEnrichmentConfig;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogFormat = 'json' | 'text' | 'structured' | 'clf' | 'apache' | 'nginx' | 'custom';

export interface LogsCollector {
  id: string;
  type: LogsCollectorType;
  configuration: any;
  sources: LogSource[];
  enabled: boolean;
}

export type LogsCollectorType = 
  | 'file' 
  | 'syslog' 
  | 'journald' 
  | 'docker' 
  | 'kubernetes' 
  | 'fluentd' 
  | 'fluent-bit' 
  | 'logstash' 
  | 'vector' 
  | 'custom';

export interface LogSource {
  path: string;
  pattern?: string;
  multiline?: MultilineConfig;
  encoding: string;
  labels: Map<string, string>;
  parser: string;
  enabled: boolean;
}

export interface MultilineConfig {
  pattern: string;
  negate: boolean;
  match: 'before' | 'after';
  maxLines: number;
  timeout: number;
}

export interface LogsProcessor {
  id: string;
  type: LogsProcessorType;
  configuration: any;
  order: number;
  enabled: boolean;
}

export type LogsProcessorType = 
  | 'parser' 
  | 'filter' 
  | 'transform' 
  | 'enricher' 
  | 'sampler' 
  | 'deduplicator' 
  | 'buffer' 
  | 'custom';

export interface LogsExporter {
  id: string;
  type: LogsExporterType;
  configuration: any;
  enabled: boolean;
  batchSize: number;
  flushInterval: number;
}

export type LogsExporterType = 
  | 'elasticsearch' 
  | 'loki' 
  | 'splunk' 
  | 'datadog' 
  | 'newrelic' 
  | 'cloudwatch' 
  | 'stackdriver' 
  | 'azure-monitor' 
  | 'kafka' 
  | 'file' 
  | 'custom';

export interface LogParsingConfig {
  enabled: boolean;
  parsers: LogParser[];
  fallback: string;
  preserveOriginal: boolean;
}

export interface LogParser {
  name: string;
  type: LogParserType;
  pattern: string;
  fields: Map<string, LogField>;
  enabled: boolean;
}

export type LogParserType = 
  | 'regex' 
  | 'grok' 
  | 'json' 
  | 'csv' 
  | 'xml' 
  | 'key-value' 
  | 'apache' 
  | 'nginx' 
  | 'custom';

export interface LogField {
  name: string;
  type: LogFieldType;
  format?: string;
  defaultValue?: any;
  required: boolean;
}

export type LogFieldType = 'string' | 'number' | 'boolean' | 'timestamp' | 'ip' | 'json' | 'object';

export interface LogEnrichmentConfig {
  enabled: boolean;
  enrichers: LogEnricher[];
  geoip: GeoIPConfig;
  userAgent: UserAgentConfig;
  kubernetes: KubernetesEnrichmentConfig;
}

export interface LogEnricher {
  name: string;
  type: LogEnricherType;
  configuration: any;
  fields: string[];
  enabled: boolean;
}

export type LogEnricherType = 
  | 'geoip' 
  | 'user-agent' 
  | 'kubernetes' 
  | 'environment' 
  | 'static' 
  | 'lookup' 
  | 'custom';

export interface GeoIPConfig {
  enabled: boolean;
  database: string;
  fields: string[];
  target: string;
}

export interface UserAgentConfig {
  enabled: boolean;
  field: string;
  target: string;
  includeOriginal: boolean;
}

export interface KubernetesEnrichmentConfig {
  enabled: boolean;
  podMetadata: boolean;
  serviceMetadata: boolean;
  namespaceMetadata: boolean;
  annotations: boolean;
  labels: boolean;
}

export interface TracesCollectionConfig {
  enabled: boolean;
  samplingRate: number;
  maxSpans: number;
  batchSize: number;
  timeout: number;
  compression: boolean;
  encryption: boolean;
  receivers: TraceReceiver[];
  processors: TraceProcessor[];
  exporters: TraceExporter[];
  sampling: SamplingConfiguration;
}

export interface TraceReceiver {
  id: string;
  type: TraceReceiverType;
  configuration: any;
  endpoint: string;
  tls?: TLSConfiguration;
  enabled: boolean;
}

export type TraceReceiverType = 
  | 'otlp' 
  | 'jaeger' 
  | 'zipkin' 
  | 'opencensus' 
  | 'datadog' 
  | 'newrelic' 
  | 'custom';

export interface TLSConfiguration {
  enabled: boolean;
  certFile: string;
  keyFile: string;
  caFile?: string;
  insecureSkipVerify: boolean;
}

export interface TraceProcessor {
  id: string;
  type: TraceProcessorType;
  configuration: any;
  order: number;
  enabled: boolean;
}

export type TraceProcessorType = 
  | 'batch' 
  | 'memory_limiter' 
  | 'resource' 
  | 'span' 
  | 'tail_sampling' 
  | 'probabilistic_sampling' 
  | 'attributes' 
  | 'filter' 
  | 'custom';

export interface TraceExporter {
  id: string;
  type: TraceExporterType;
  configuration: any;
  enabled: boolean;
  timeout: number;
  retries: number;
}

export type TraceExporterType = 
  | 'otlp' 
  | 'jaeger' 
  | 'zipkin' 
  | 'datadog' 
  | 'newrelic' 
  | 'custom';

export interface SamplingConfiguration {
  strategies: SamplingStrategy[];
  defaultStrategy: string;
  perServiceStrategies: Map<string, string>;
}

export interface SamplingStrategy {
  name: string;
  type: SamplingType;
  configuration: any;
  enabled: boolean;
}

export type SamplingType = 
  | 'const' 
  | 'probabilistic' 
  | 'rate-limiting' 
  | 'remote' 
  | 'composite' 
  | 'adaptive';

export interface EventsCollectionConfig {
  enabled: boolean;
  bufferSize: number;
  flushInterval: number;
  compression: boolean;
  encryption: boolean;
  sources: EventSource[];
  processors: EventProcessor[];
  exporters: EventExporter[];
}

export interface EventSource {
  id: string;
  type: EventSourceType;
  configuration: any;
  filters: EventFilter[];
  enabled: boolean;
}

export type EventSourceType = 
  | 'kubernetes' 
  | 'docker' 
  | 'systemd' 
  | 'cloud-events' 
  | 'webhook' 
  | 'kafka' 
  | 'custom';

export interface EventFilter {
  type: 'include' | 'exclude';
  condition: string;
  fields: Map<string, string>;
}

export interface EventProcessor {
  id: string;
  type: EventProcessorType;
  configuration: any;
  order: number;
  enabled: boolean;
}

export type EventProcessorType = 
  | 'filter' 
  | 'transform' 
  | 'enricher' 
  | 'deduplicator' 
  | 'correlator' 
  | 'custom';

export interface EventExporter {
  id: string;
  type: EventExporterType;
  configuration: any;
  enabled: boolean;
}

export type EventExporterType = 
  | 'webhook' 
  | 'kafka' 
  | 'elasticsearch' 
  | 'datadog' 
  | 'custom';

export interface ProfilingCollectionConfig {
  enabled: boolean;
  interval: number;
  duration: number;
  types: ProfilingType[];
  storage: ProfilingStorageConfig;
  analysis: ProfilingAnalysisConfig;
}

export type ProfilingType = 'cpu' | 'memory' | 'goroutine' | 'heap' | 'allocs' | 'block' | 'mutex';

export interface ProfilingStorageConfig {
  backend: 'filesystem' | 's3' | 'gcs' | 'azure-blob';
  configuration: any;
  retention: number;
  compression: boolean;
}

export interface ProfilingAnalysisConfig {
  enabled: boolean;
  algorithms: ProfilingAlgorithm[];
  thresholds: Map<string, number>;
  alerting: boolean;
}

export interface ProfilingAlgorithm {
  name: string;
  type: 'anomaly-detection' | 'trend-analysis' | 'comparative' | 'custom';
  configuration: any;
  enabled: boolean;
}

export interface SyntheticMonitoringConfig {
  enabled: boolean;
  checks: SyntheticCheck[];
  locations: SyntheticLocation[];
  alerting: boolean;
  reporting: boolean;
}

export interface SyntheticCheck {
  id: string;
  name: string;
  type: SyntheticCheckType;
  configuration: any;
  schedule: string;
  locations: string[];
  alerts: SyntheticAlert[];
  enabled: boolean;
}

export type SyntheticCheckType = 
  | 'http' 
  | 'tcp' 
  | 'icmp' 
  | 'dns' 
  | 'browser' 
  | 'api' 
  | 'ssl-certificate' 
  | 'custom';

export interface SyntheticLocation {
  id: string;
  name: string;
  region: string;
  provider: string;
  endpoint: string;
  enabled: boolean;
}

export interface SyntheticAlert {
  metric: string;
  condition: string;
  threshold: number;
  duration: number;
  channels: string[];
}

export interface RealUserMonitoringConfig {
  enabled: boolean;
  sampling: RUMSamplingConfig;
  collection: RUMCollectionConfig;
  privacy: RUMPrivacyConfig;
  performance: RUMPerformanceConfig;
  errors: RUMErrorsConfig;
}

export interface RUMSamplingConfig {
  sessionSampleRate: number;
  errorSampleRate: number;
  performanceSampleRate: number;
  replaySampleRate: number;
}

export interface RUMCollectionConfig {
  endpoint: string;
  batch: boolean;
  batchSize: number;
  flushInterval: number;
  beforeSend: boolean;
}

export interface RUMPrivacyConfig {
  maskInputs: boolean;
  maskText: boolean;
  allowedDomains: string[];
  blockedDomains: string[];
  sessionReplay: boolean;
}

export interface RUMPerformanceConfig {
  trackInteractions: boolean;
  trackFID: boolean;
  trackCLS: boolean;
  trackLCP: boolean;
  trackTTFB: boolean;
  trackCustom: boolean;
}

export interface RUMErrorsConfig {
  captureUnhandled: boolean;
  captureRejections: boolean;
  beforeCapture: boolean;
  ignoreErrors: string[];
  maxErrorsPerSession: number;
}

// Storage Configuration
export interface StorageConfiguration {
  metrics: MetricsStorageConfig;
  logs: LogsStorageConfig;
  traces: TracesStorageConfig;
  events: EventsStorageConfig;
  profiles: ProfilingStorageConfig;
  replication: ReplicationConfig;
  backup: BackupConfig;
  archival: ArchivalConfig;
}

export interface MetricsStorageConfig {
  backend: MetricsStorageBackend;
  configuration: any;
  retention: RetentionPolicy;
  compression: CompressionConfig;
  sharding: ShardingConfig;
  indexing: IndexingConfig;
}

export type MetricsStorageBackend = 
  | 'prometheus' 
  | 'thanos' 
  | 'cortex' 
  | 'influxdb' 
  | 'timescaledb' 
  | 'clickhouse' 
  | 'custom';

export interface RetentionPolicy {
  raw: string;
  '5m': string;
  '1h': string;
  '1d': string;
  global: string;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'lz4' | 'snappy' | 'zstd';
  level: number;
}

export interface ShardingConfig {
  enabled: boolean;
  strategy: 'hash' | 'range' | 'time' | 'custom';
  shards: number;
  replication: number;
}

export interface IndexingConfig {
  enabled: boolean;
  strategy: 'btree' | 'hash' | 'gin' | 'gist' | 'custom';
  fields: string[];
  partitioning: PartitioningConfig;
}

export interface PartitioningConfig {
  enabled: boolean;
  strategy: 'time' | 'hash' | 'range' | 'custom';
  interval: string;
  retention: string;
}

export interface LogsStorageConfig {
  backend: LogsStorageBackend;
  configuration: any;
  retention: string;
  compression: CompressionConfig;
  indexing: LogsIndexingConfig;
  parsing: boolean;
}

export type LogsStorageBackend = 
  | 'elasticsearch' 
  | 'opensearch' 
  | 'loki' 
  | 'splunk' 
  | 'clickhouse' 
  | 'custom';

export interface LogsIndexingConfig {
  enabled: boolean;
  fields: string[];
  fullText: boolean;
  analyzer: string;
  shards: number;
  replicas: number;
}

export interface TracesStorageConfig {
  backend: TracesStorageBackend;
  configuration: any;
  retention: string;
  sampling: TraceSamplingConfig;
  indexing: TracesIndexingConfig;
}

export type TracesStorageBackend = 
  | 'jaeger' 
  | 'zipkin' 
  | 'tempo' 
  | 'x-ray' 
  | 'datadog' 
  | 'custom';

export interface TraceSamplingConfig {
  enabled: boolean;
  rate: number;
  strategies: SamplingStrategy[];
}

export interface TracesIndexingConfig {
  enabled: boolean;
  services: boolean;
  operations: boolean;
  tags: boolean;
  duration: boolean;
}

export interface EventsStorageConfig {
  backend: EventsStorageBackend;
  configuration: any;
  retention: string;
  deduplication: boolean;
  ordering: EventOrderingConfig;
}

export type EventsStorageBackend = 
  | 'elasticsearch' 
  | 'kafka' 
  | 'rabbitmq' 
  | 'nats' 
  | 'custom';

export interface EventOrderingConfig {
  enabled: boolean;
  field: string;
  order: 'asc' | 'desc';
}

export interface ReplicationConfig {
  enabled: boolean;
  factor: number;
  strategy: 'sync' | 'async' | 'quorum';
  regions: string[];
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string;
  retention: number;
  compression: boolean;
  encryption: boolean;
  destinations: BackupDestination[];
}

export interface BackupDestination {
  type: 's3' | 'gcs' | 'azure-blob' | 'filesystem';
  configuration: any;
  enabled: boolean;
}

export interface ArchivalConfig {
  enabled: boolean;
  age: string;
  compression: boolean;
  destinations: BackupDestination[];
  indexing: boolean;
}

// Processing Configuration
export interface ProcessingConfiguration {
  realTime: RealTimeProcessingConfig;
  batch: BatchProcessingConfig;
  streaming: StreamProcessingConfig;
  analytics: AnalyticsProcessingConfig;
  ml: MachineLearningConfig;
}

export interface RealTimeProcessingConfig {
  enabled: boolean;
  latency: number;
  throughput: number;
  workers: number;
  queues: QueueConfiguration;
  processing: ProcessingPipeline[];
}

export interface ProcessingPipeline {
  name: string;
  steps: ProcessingStep[];
  parallelism: number;
  errorHandling: ErrorHandlingConfig;
  monitoring: PipelineMonitoringConfig;
}

export interface ProcessingStep {
  name: string;
  type: ProcessingStepType;
  configuration: any;
  timeout: number;
  retries: number;
}

export type ProcessingStepType = 
  | 'filter' 
  | 'transform' 
  | 'enrich' 
  | 'aggregate' 
  | 'correlate' 
  | 'classify' 
  | 'anomaly-detect' 
  | 'custom';

export interface ErrorHandlingConfig {
  strategy: 'retry' | 'skip' | 'dlq' | 'alert';
  maxRetries: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  deadLetterQueue: boolean;
}

export interface PipelineMonitoringConfig {
  enabled: boolean;
  metrics: string[];
  alerts: PipelineAlert[];
  dashboard: string;
}

export interface PipelineAlert {
  metric: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: AlertSeverity;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface BatchProcessingConfig {
  enabled: boolean;
  schedule: string;
  batchSize: number;
  timeout: number;
  jobs: BatchJob[];
  resources: ResourceConfiguration;
}

export interface BatchJob {
  name: string;
  type: BatchJobType;
  configuration: any;
  schedule: string;
  dependencies: string[];
  retries: number;
}

export type BatchJobType = 
  | 'aggregation' 
  | 'reporting' 
  | 'cleanup' 
  | 'archival' 
  | 'analytics' 
  | 'ml-training' 
  | 'custom';

export interface ResourceConfiguration {
  cpu: string;
  memory: string;
  storage: string;
  workers: number;
  timeout: number;
}

export interface StreamProcessingConfig {
  enabled: boolean;
  framework: StreamFramework;
  configuration: any;
  topology: StreamTopology;
  windowing: WindowingConfig;
  stateful: boolean;
}

export type StreamFramework = 'kafka-streams' | 'flink' | 'spark' | 'storm' | 'custom';

export interface StreamTopology {
  sources: StreamSource[];
  processors: StreamProcessor[];
  sinks: StreamSink[];
  state: StateStoreConfig[];
}

export interface StreamSource {
  name: string;
  type: string;
  configuration: any;
  partitions: number;
}

export interface StreamProcessor {
  name: string;
  type: StreamProcessorType;
  configuration: any;
  parallelism: number;
}

export type StreamProcessorType = 
  | 'map' 
  | 'filter' 
  | 'flatmap' 
  | 'aggregate' 
  | 'join' 
  | 'window' 
  | 'custom';

export interface StreamSink {
  name: string;
  type: string;
  configuration: any;
  partitioning: PartitioningStrategy;
}

export interface PartitioningStrategy {
  type: 'round-robin' | 'hash' | 'custom';
  field?: string;
  partitions: number;
}

export interface StateStoreConfig {
  name: string;
  type: 'in-memory' | 'rocks-db' | 'redis' | 'custom';
  configuration: any;
  persistent: boolean;
  replicated: boolean;
}

export interface WindowingConfig {
  enabled: boolean;
  types: WindowType[];
  defaultType: WindowType;
  retention: string;
}

export type WindowType = 'tumbling' | 'sliding' | 'session' | 'custom';

export interface AnalyticsProcessingConfig {
  enabled: boolean;
  engines: AnalyticsEngine[];
  queries: AnalyticsQuery[];
  dashboards: AnalyticsDashboard[];
  alerts: AnalyticsAlert[];
}

export interface AnalyticsEngine {
  name: string;
  type: AnalyticsEngineType;
  configuration: any;
  enabled: boolean;
}

export type AnalyticsEngineType = 
  | 'spark' 
  | 'flink' 
  | 'clickhouse' 
  | 'bigquery' 
  | 'athena' 
  | 'custom';

export interface AnalyticsQuery {
  name: string;
  description: string;
  query: string;
  schedule: string;
  parameters: Map<string, any>;
  output: AnalyticsOutput;
}

export interface AnalyticsOutput {
  type: 'table' | 'chart' | 'alert' | 'export';
  destination: string;
  format: string;
  retention: string;
}

export interface AnalyticsDashboard {
  name: string;
  description: string;
  queries: string[];
  visualizations: Visualization[];
  layout: DashboardLayout;
}

export interface AnalyticsAlert {
  name: string;
  query: string;
  condition: string;
  threshold: number;
  frequency: string;
  channels: string[];
}

export interface MachineLearningConfig {
  enabled: boolean;
  frameworks: MLFramework[];
  models: MLModel[];
  training: MLTrainingConfig;
  inference: MLInferenceConfig;
  monitoring: MLMonitoringConfig;
}

export interface MLFramework {
  name: string;
  type: MLFrameworkType;
  configuration: any;
  enabled: boolean;
}

export type MLFrameworkType = 
  | 'tensorflow' 
  | 'pytorch' 
  | 'scikit-learn' 
  | 'xgboost' 
  | 'spark-ml' 
  | 'custom';

export interface MLModel {
  name: string;
  type: MLModelType;
  version: string;
  framework: string;
  configuration: any;
  training: MLModelTraining;
  deployment: MLModelDeployment;
}

export type MLModelType = 
  | 'anomaly-detection' 
  | 'classification' 
  | 'regression' 
  | 'clustering' 
  | 'forecasting' 
  | 'recommendation' 
  | 'custom';

export interface MLModelTraining {
  dataset: MLDataset;
  features: string[];
  labels: string[];
  algorithms: MLAlgorithm[];
  validation: MLValidation;
  hyperparameters: Map<string, any>;
}

export interface MLDataset {
  source: string;
  type: 'metrics' | 'logs' | 'traces' | 'events' | 'custom';
  timeRange: string;
  filters: string[];
  preprocessing: MLPreprocessing;
}

export interface MLPreprocessing {
  normalization: boolean;
  scaling: boolean;
  featureSelection: boolean;
  dimensionalityReduction: boolean;
  steps: MLPreprocessingStep[];
}

export interface MLPreprocessingStep {
  name: string;
  type: string;
  configuration: any;
  order: number;
}

export interface MLAlgorithm {
  name: string;
  type: string;
  parameters: Map<string, any>;
  optimization: MLOptimization;
}

export interface MLOptimization {
  enabled: boolean;
  method: 'grid-search' | 'random-search' | 'bayesian' | 'custom';
  iterations: number;
  crossValidation: number;
}

export interface MLValidation {
  method: 'holdout' | 'cross-validation' | 'time-series' | 'custom';
  splitRatio: number;
  metrics: string[];
  thresholds: Map<string, number>;
}

export interface MLModelDeployment {
  strategy: 'batch' | 'real-time' | 'hybrid';
  endpoints: MLEndpoint[];
  scaling: MLScalingConfig;
  monitoring: MLModelMonitoring;
}

export interface MLEndpoint {
  name: string;
  type: 'rest' | 'grpc' | 'stream' | 'batch';
  configuration: any;
  authentication: boolean;
  rateLimit: RateLimitConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  requests: number;
  window: string;
  burst: number;
}

export interface MLScalingConfig {
  enabled: boolean;
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
  metrics: string[];
}

export interface MLModelMonitoring {
  enabled: boolean;
  metrics: MLModelMetrics;
  drift: DriftDetection;
  performance: PerformanceMonitoring;
  alerts: MLModelAlert[];
}

export interface MLModelMetrics {
  latency: boolean;
  throughput: boolean;
  accuracy: boolean;
  precision: boolean;
  recall: boolean;
  f1Score: boolean;
  custom: string[];
}

export interface DriftDetection {
  enabled: boolean;
  methods: DriftMethod[];
  thresholds: Map<string, number>;
  actions: DriftAction[];
}

export interface DriftMethod {
  name: string;
  type: 'statistical' | 'distance' | 'ml-based' | 'custom';
  configuration: any;
  schedule: string;
}

export interface DriftAction {
  trigger: string;
  action: 'alert' | 'retrain' | 'rollback' | 'custom';
  configuration: any;
}

export interface PerformanceMonitoring {
  enabled: boolean;
  metrics: string[];
  thresholds: Map<string, number>;
  dashboard: string;
}

export interface MLModelAlert {
  metric: string;
  condition: string;
  threshold: number;
  duration: string;
  channels: string[];
}

export interface MLTrainingConfig {
  enabled: boolean;
  schedule: string;
  resources: ResourceConfiguration;
  distributed: boolean;
  checkpointing: boolean;
  experiments: MLExperimentConfig;
}

export interface MLExperimentConfig {
  enabled: boolean;
  tracking: MLTrackingConfig;
  comparison: boolean;
  artifacts: boolean;
  versioning: boolean;
}

export interface MLTrackingConfig {
  backend: 'mlflow' | 'wandb' | 'tensorboard' | 'custom';
  configuration: any;
  metrics: string[];
  parameters: string[];
}

export interface MLInferenceConfig {
  enabled: boolean;
  serving: MLServingConfig;
  batching: MLBatchingConfig;
  caching: MLCachingConfig;
  optimization: MLOptimizationConfig;
}

export interface MLServingConfig {
  framework: 'torchserve' | 'tensorflow-serving' | 'seldon' | 'kserve' | 'custom';
  configuration: any;
  replicas: number;
  resources: ResourceConfiguration;
}

export interface MLBatchingConfig {
  enabled: boolean;
  maxBatchSize: number;
  maxLatency: number;
  timeout: number;
}

export interface MLCachingConfig {
  enabled: boolean;
  backend: 'redis' | 'memcached' | 'in-memory' | 'custom';
  configuration: any;
  ttl: number;
}

export interface MLOptimizationConfig {
  enabled: boolean;
  quantization: boolean;
  pruning: boolean;
  distillation: boolean;
  compilation: boolean;
}

export interface MLMonitoringConfig {
  enabled: boolean;
  modelMonitoring: boolean;
  dataMonitoring: boolean;
  pipelineMonitoring: boolean;
  alerts: MLAlert[];
}

export interface MLAlert {
  name: string;
  type: 'model' | 'data' | 'pipeline' | 'infrastructure';
  condition: string;
  threshold: number;
  channels: string[];
}

// Alerting Configuration
export interface AlertingConfiguration {
  enabled: boolean;
  rules: AlertRule[];
  channels: AlertChannel[];
  escalation: EscalationPolicy[];
  inhibition: InhibitionRule[];
  routing: AlertRouting;
  grouping: AlertGrouping;
  throttling: AlertThrottling;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  query: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  labels: Map<string, string>;
  annotations: Map<string, string>;
  enabled: boolean;
  created: Date;
  lastUpdated: Date;
}

export interface AlertCondition {
  operator: AlertOperator;
  threshold: number;
  duration: string;
  evaluationInterval: string;
  noDataState: NoDataState;
  executionErrorState: ExecutionErrorState;
}

export type AlertOperator = 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte' | 'match' | 'no_value';

export type NoDataState = 'no_data' | 'alerting' | 'keep_state' | 'ok';

export type ExecutionErrorState = 'alerting' | 'keep_state' | 'ok';

export interface AlertChannel {
  id: string;
  name: string;
  type: AlertChannelType;
  configuration: any;
  enabled: boolean;
  filters: AlertFilter[];
}

export type AlertChannelType = 
  | 'email' 
  | 'slack' 
  | 'teams' 
  | 'discord' 
  | 'pagerduty' 
  | 'opsgenie' 
  | 'webhook' 
  | 'sms' 
  | 'phone' 
  | 'custom';

export interface AlertFilter {
  type: 'include' | 'exclude';
  field: string;
  operator: string;
  value: any;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  rules: EscalationRule[];
  enabled: boolean;
}

export interface EscalationRule {
  level: number;
  delay: string;
  channels: string[];
  conditions: string[];
}

export interface InhibitionRule {
  id: string;
  sourceMatchers: AlertMatcher[];
  targetMatchers: AlertMatcher[];
  equal: string[];
  enabled: boolean;
}

export interface AlertMatcher {
  name: string;
  value: string;
  isRegex: boolean;
  isEqual: boolean;
}

export interface AlertRouting {
  defaultChannel: string;
  routes: AlertRoute[];
  groupWait: string;
  groupInterval: string;
  repeatInterval: string;
}

export interface AlertRoute {
  match: Map<string, string>;
  matchRe: Map<string, string>;
  channels: string[];
  continue: boolean;
  groupBy: string[];
  groupWait: string;
  groupInterval: string;
  repeatInterval: string;
  muteTimeIntervals: string[];
}

export interface AlertGrouping {
  enabled: boolean;
  groupBy: string[];
  groupWait: string;
  groupInterval: string;
  maxGroupSize: number;
}

export interface AlertThrottling {
  enabled: boolean;
  maxAlerts: number;
  window: string;
  action: 'drop' | 'defer' | 'summarize';
}

// Visualization Configuration
export interface VisualizationConfiguration {
  enabled: boolean;
  dashboards: DashboardConfig[];
  charts: ChartConfig[];
  reports: ReportConfig[];
  explorer: ExplorerConfig;
  sharing: SharingConfig;
  theming: ThemingConfig;
}

export interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  tags: string[];
  panels: Panel[];
  layout: DashboardLayout;
  variables: DashboardVariable[];
  timeRange: TimeRange;
  refreshInterval: string;
  permissions: DashboardPermissions;
  created: Date;
  lastUpdated: Date;
}

export interface Panel {
  id: string;
  title: string;
  type: PanelType;
  configuration: any;
  position: PanelPosition;
  queries: PanelQuery[];
  transformations: PanelTransformation[];
  thresholds: PanelThreshold[];
  alerts: PanelAlert[];
}

export type PanelType = 
  | 'graph' 
  | 'table' 
  | 'stat' 
  | 'gauge' 
  | 'bar-gauge' 
  | 'heatmap' 
  | 'logs' 
  | 'traces' 
  | 'pie-chart' 
  | 'worldmap' 
  | 'custom';

export interface PanelPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PanelQuery {
  refId: string;
  datasource: string;
  query: string;
  format: string;
  instant: boolean;
  range: boolean;
  interval: string;
  maxDataPoints: number;
}

export interface PanelTransformation {
  id: string;
  type: TransformationType;
  configuration: any;
  order: number;
}

export type TransformationType = 
  | 'reduce' 
  | 'filter' 
  | 'organize' 
  | 'rename' 
  | 'calculate' 
  | 'group' 
  | 'join' 
  | 'custom';

export interface PanelThreshold {
  value: number;
  color: string;
  op: ThresholdOperator;
}

export type ThresholdOperator = 'gt' | 'lt';

export interface PanelAlert {
  enabled: boolean;
  condition: string;
  frequency: string;
  handler: string;
  channels: string[];
}

export interface DashboardLayout {
  type: 'grid' | 'absolute' | 'flow';
  configuration: any;
}

export interface DashboardVariable {
  name: string;
  type: VariableType;
  query: string;
  options: VariableOption[];
  current: any;
  multi: boolean;
  includeAll: boolean;
  refresh: VariableRefresh;
}

export type VariableType = 'query' | 'custom' | 'constant' | 'datasource' | 'interval' | 'textbox';

export interface VariableOption {
  text: string;
  value: any;
  selected: boolean;
}

export type VariableRefresh = 'never' | 'on-dashboard-load' | 'on-time-range-change';

export interface TimeRange {
  from: string;
  to: string;
}

export interface DashboardPermissions {
  viewers: string[];
  editors: string[];
  admins: string[];
  public: boolean;
}

export interface ChartConfig {
  id: string;
  name: string;
  type: ChartType;
  configuration: any;
  query: string;
  datasource: string;
  created: Date;
  lastUpdated: Date;
}

export type ChartType = 
  | 'line' 
  | 'area' 
  | 'bar' 
  | 'pie' 
  | 'scatter' 
  | 'bubble' 
  | 'histogram' 
  | 'candlestick' 
  | 'custom';

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  schedule: string;
  format: ReportFormat;
  recipients: string[];
  dashboards: string[];
  charts: string[];
  enabled: boolean;
  created: Date;
  lastUpdated: Date;
}

export type ReportFormat = 'pdf' | 'png' | 'csv' | 'json' | 'html';

export interface ExplorerConfig {
  enabled: boolean;
  datasources: string[];
  features: ExplorerFeature[];
  limits: ExplorerLimits;
}

export interface ExplorerFeature {
  name: string;
  enabled: boolean;
  configuration: any;
}

export interface ExplorerLimits {
  maxQueries: number;
  maxTimeRange: string;
  maxDataPoints: number;
  timeout: number;
}

export interface SharingConfig {
  enabled: boolean;
  publicDashboards: boolean;
  embedPanels: boolean;
  snapshots: boolean;
  exports: boolean;
}

export interface ThemingConfig {
  default: string;
  themes: Theme[];
  customization: boolean;
}

export interface Theme {
  name: string;
  colors: Map<string, string>;
  fonts: Map<string, string>;
  layout: any;
}

// Retention and Compliance
export interface RetentionConfiguration {
  policies: RetentionPolicyConfig[];
  enforcement: RetentionEnforcement;
  monitoring: RetentionMonitoring;
  compliance: RetentionCompliance;
}

export interface RetentionPolicyConfig {
  name: string;
  dataType: DataType;
  retention: string;
  conditions: RetentionCondition[];
  actions: RetentionAction[];
  enabled: boolean;
}

export type DataType = 'metrics' | 'logs' | 'traces' | 'events' | 'profiles' | 'all';

export interface RetentionCondition {
  field: string;
  operator: string;
  value: any;
}

export interface RetentionAction {
  type: RetentionActionType;
  configuration: any;
}

export type RetentionActionType = 'delete' | 'archive' | 'compress' | 'anonymize' | 'export';

export interface RetentionEnforcement {
  enabled: boolean;
  schedule: string;
  dryRun: boolean;
  notifications: boolean;
  audit: boolean;
}

export interface RetentionMonitoring {
  enabled: boolean;
  metrics: string[];
  alerts: RetentionAlert[];
  dashboard: string;
}

export interface RetentionAlert {
  name: string;
  condition: string;
  threshold: number;
  channels: string[];
}

export interface RetentionCompliance {
  frameworks: ComplianceFramework[];
  auditing: ComplianceAuditing;
  reporting: ComplianceReporting;
}

export interface ComplianceFramework {
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  enabled: boolean;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  controls: string[];
  evidence: string[];
  status: ComplianceStatus;
}

export type ComplianceStatus = 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';

export interface ComplianceAuditing {
  enabled: boolean;
  events: string[];
  retention: string;
  encryption: boolean;
}

export interface ComplianceReporting {
  enabled: boolean;
  schedule: string;
  recipients: string[];
  formats: string[];
}

// Security Configuration
export interface ObservabilitySecurityConfiguration {
  authentication: SecurityAuthentication;
  authorization: SecurityAuthorization;
  encryption: SecurityEncryption;
  audit: SecurityAudit;
  network: SecurityNetwork;
  compliance: SecurityCompliance;
}

export interface SecurityAuthentication {
  enabled: boolean;
  providers: AuthProvider[];
  mfa: boolean;
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
}

export interface AuthProvider {
  type: AuthProviderType;
  configuration: any;
  enabled: boolean;
  priority: number;
}

export type AuthProviderType = 
  | 'local' 
  | 'ldap' 
  | 'oauth2' 
  | 'saml' 
  | 'oidc' 
  | 'jwt' 
  | 'api-key' 
  | 'certificate';

export interface PasswordPolicy {
  minLength: number;
  requireUpper: boolean;
  requireLower: boolean;
  requireNumbers: boolean;
  requireSpecial: boolean;
  maxAge: number;
  history: number;
}

export interface SecurityAuthorization {
  enabled: boolean;
  model: AuthorizationModel;
  roles: SecurityRole[];
  permissions: SecurityPermission[];
  policies: SecurityPolicy[];
}

export type AuthorizationModel = 'rbac' | 'abac' | 'acl';

export interface SecurityRole {
  name: string;
  description: string;
  permissions: string[];
  inherits: string[];
  conditions: string[];
}

export interface SecurityPermission {
  name: string;
  description: string;
  resource: string;
  actions: string[];
  conditions: string[];
}

export interface SecurityPolicy {
  name: string;
  description: string;
  rules: PolicyRule[];
  effect: PolicyEffect;
}

export interface PolicyRule {
  subjects: string[];
  actions: string[];
  resources: string[];
  conditions: string[];
}

export type PolicyEffect = 'allow' | 'deny';

export interface SecurityEncryption {
  inTransit: EncryptionInTransit;
  atRest: EncryptionAtRest;
  keyManagement: KeyManagement;
}

export interface EncryptionInTransit {
  enabled: boolean;
  protocols: string[];
  ciphers: string[];
  certificates: CertificateConfig[];
  mtls: boolean;
}

export interface CertificateConfig {
  type: 'self-signed' | 'ca-signed' | 'lets-encrypt' | 'external';
  configuration: any;
  autoRotation: boolean;
  validity: number;
}

export interface EncryptionAtRest {
  enabled: boolean;
  algorithm: string;
  keyProvider: string;
  configuration: any;
}

export interface KeyManagement {
  provider: KeyProvider;
  configuration: any;
  rotation: KeyRotation;
  escrow: boolean;
}

export type KeyProvider = 'internal' | 'vault' | 'aws-kms' | 'azure-keyvault' | 'gcp-kms';

export interface KeyRotation {
  enabled: boolean;
  schedule: string;
  gracePeriod: number;
  automatic: boolean;
}

export interface SecurityAudit {
  enabled: boolean;
  events: AuditEvent[];
  retention: string;
  storage: AuditStorage;
  alerting: boolean;
}

export interface AuditEvent {
  type: AuditEventType;
  enabled: boolean;
  includePayload: boolean;
  sensitiveFields: string[];
}

export type AuditEventType = 
  | 'authentication' 
  | 'authorization' 
  | 'data-access' 
  | 'configuration' 
  | 'system' 
  | 'custom';

export interface AuditStorage {
  backend: AuditStorageBackend;
  configuration: any;
  encryption: boolean;
  integrity: boolean;
}

export type AuditStorageBackend = 'database' | 'file' | 'syslog' | 'elasticsearch' | 'custom';

export interface SecurityNetwork {
  firewalls: FirewallRule[];
  allowlists: string[];
  blocklists: string[];
  rateLimiting: RateLimiting;
  ddosProtection: DDoSProtection;
}

export interface FirewallRule {
  name: string;
  source: string;
  destination: string;
  port: number;
  protocol: string;
  action: 'allow' | 'deny';
}

export interface RateLimiting {
  enabled: boolean;
  global: RateLimitRule;
  perUser: RateLimitRule;
  perIP: RateLimitRule;
}

export interface RateLimitRule {
  requests: number;
  window: string;
  burst: number;
  action: 'throttle' | 'block';
}

export interface DDoSProtection {
  enabled: boolean;
  thresholds: DDoSThreshold[];
  mitigation: DDoSMitigation[];
}

export interface DDoSThreshold {
  metric: string;
  value: number;
  window: string;
}

export interface DDoSMitigation {
  action: 'rate-limit' | 'block' | 'challenge';
  configuration: any;
  duration: string;
}

export interface SecurityCompliance {
  frameworks: string[];
  scanning: SecurityScanning;
  reporting: SecurityReporting;
  certification: SecurityCertification;
}

export interface SecurityScanning {
  enabled: boolean;
  vulnerability: VulnerabilityScanning;
  configuration: ConfigurationScanning;
  dependency: DependencyScanning;
}

export interface VulnerabilityScanning {
  enabled: boolean;
  schedule: string;
  databases: string[];
  severity: string[];
  reporting: boolean;
}

export interface ConfigurationScanning {
  enabled: boolean;
  rules: ConfigurationRule[];
  schedule: string;
  reporting: boolean;
}

export interface ConfigurationRule {
  name: string;
  description: string;
  rule: string;
  severity: string;
  remediation: string;
}

export interface DependencyScanning {
  enabled: boolean;
  schedule: string;
  sources: string[];
  severity: string[];
  reporting: boolean;
}

export interface SecurityReporting {
  enabled: boolean;
  schedule: string;
  recipients: string[];
  formats: string[];
  dashboards: string[];
}

export interface SecurityCertification {
  required: string[];
  current: SecurityCertificate[];
  monitoring: boolean;
}

export interface SecurityCertificate {
  name: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  status: CertificateStatus;
}

export type CertificateStatus = 'valid' | 'expired' | 'revoked' | 'pending';

// Performance Configuration
export interface PerformanceConfiguration {
  collection: PerformanceCollectionConfig;
  analysis: PerformanceAnalysisConfig;
  optimization: PerformanceOptimizationConfig;
  reporting: PerformanceReportingConfig;
}

export interface PerformanceCollectionConfig {
  enabled: boolean;
  metrics: PerformanceMetricConfig[];
  profiling: ProfilingConfig;
  tracing: PerformanceTracingConfig;
  benchmarking: BenchmarkingConfig;
}

export interface PerformanceMetricConfig {
  name: string;
  type: PerformanceMetricType;
  configuration: any;
  collection: CollectionSchedule;
  enabled: boolean;
}

export type PerformanceMetricType = 
  | 'latency' 
  | 'throughput' 
  | 'cpu' 
  | 'memory' 
  | 'disk' 
  | 'network' 
  | 'error-rate' 
  | 'custom';

export interface CollectionSchedule {
  interval: number;
  duration: number;
  conditions: string[];
}

export interface ProfilingConfig {
  enabled: boolean;
  continuous: boolean;
  onDemand: boolean;
  types: ProfilingType[];
  storage: ProfilingStorageConfig;
  retention: string;
}

export interface PerformanceTracingConfig {
  enabled: boolean;
  sampling: TraceSampling;
  instrumentation: InstrumentationConfig;
  analysis: TraceAnalysisConfig;
}

export interface TraceSampling {
  rate: number;
  strategies: SamplingStrategy[];
  adaptive: boolean;
}

export interface InstrumentationConfig {
  automatic: boolean;
  manual: boolean;
  frameworks: string[];
  libraries: string[];
}

export interface TraceAnalysisConfig {
  enabled: boolean;
  algorithms: TraceAnalysisAlgorithm[];
  thresholds: Map<string, number>;
}

export interface TraceAnalysisAlgorithm {
  name: string;
  type: 'bottleneck' | 'anomaly' | 'pattern' | 'custom';
  configuration: any;
}

export interface BenchmarkingConfig {
  enabled: boolean;
  suites: BenchmarkSuite[];
  schedule: string;
  comparison: BenchmarkComparison;
}

export interface BenchmarkSuite {
  name: string;
  description: string;
  tests: BenchmarkTest[];
  environment: BenchmarkEnvironment;
}

export interface BenchmarkTest {
  name: string;
  type: string;
  configuration: any;
  expected: BenchmarkExpectation;
}

export interface BenchmarkExpectation {
  metric: string;
  value: number;
  operator: string;
  tolerance: number;
}

export interface BenchmarkEnvironment {
  resources: ResourceConfiguration;
  dependencies: string[];
  setup: string[];
  teardown: string[];
}

export interface BenchmarkComparison {
  enabled: boolean;
  baselines: string[];
  analysis: ComparisonAnalysis;
  reporting: boolean;
}

export interface ComparisonAnalysis {
  statistical: boolean;
  regression: boolean;
  trends: boolean;
  alerts: boolean;
}

export interface PerformanceAnalysisConfig {
  enabled: boolean;
  realTime: RealTimeAnalysisConfig;
  historical: HistoricalAnalysisConfig;
  predictive: PredictiveAnalysisConfig;
  comparative: ComparativeAnalysisConfig;
}

export interface RealTimeAnalysisConfig {
  enabled: boolean;
  algorithms: AnalysisAlgorithm[];
  thresholds: AnalysisThreshold[];
  actions: AnalysisAction[];
}

export interface AnalysisAlgorithm {
  name: string;
  type: AnalysisAlgorithmType;
  configuration: any;
  enabled: boolean;
}

export type AnalysisAlgorithmType = 
  | 'statistical' 
  | 'ml-based' 
  | 'rule-based' 
  | 'pattern-matching' 
  | 'custom';

export interface AnalysisThreshold {
  metric: string;
  warning: number;
  critical: number;
  duration: string;
}

export interface AnalysisAction {
  trigger: string;
  action: AnalysisActionType;
  configuration: any;
}

export type AnalysisActionType = 'alert' | 'scale' | 'restart' | 'optimize' | 'custom';

export interface HistoricalAnalysisConfig {
  enabled: boolean;
  timeRange: string;
  granularity: string;
  analysis: HistoricalAnalysisType[];
  reporting: boolean;
}

export type HistoricalAnalysisType = 'trend' | 'seasonal' | 'correlation' | 'regression' | 'custom';

export interface PredictiveAnalysisConfig {
  enabled: boolean;
  models: PredictiveModel[];
  horizon: string;
  confidence: number;
  validation: ModelValidation;
}

export interface PredictiveModel {
  name: string;
  type: PredictiveModelType;
  configuration: any;
  training: ModelTrainingConfig;
}

export type PredictiveModelType = 
  | 'arima' 
  | 'lstm' 
  | 'prophet' 
  | 'linear-regression' 
  | 'random-forest' 
  | 'custom';

export interface ModelTrainingConfig {
  schedule: string;
  dataRange: string;
  features: string[];
  validation: ValidationConfig;
}

export interface ValidationConfig {
  method: string;
  split: number;
  metrics: string[];
  threshold: number;
}

export interface ModelValidation {
  enabled: boolean;
  continuous: boolean;
  metrics: string[];
  thresholds: Map<string, number>;
}

export interface ComparativeAnalysisConfig {
  enabled: boolean;
  comparisons: ComparisonConfig[];
  reporting: boolean;
  alerting: boolean;
}

export interface ComparisonConfig {
  name: string;
  baseline: string;
  current: string;
  metrics: string[];
  thresholds: Map<string, number>;
}

export interface PerformanceOptimizationConfig {
  enabled: boolean;
  automatic: AutoOptimizationConfig;
  recommendations: RecommendationConfig;
  tuning: TuningConfig;
}

export interface AutoOptimizationConfig {
  enabled: boolean;
  scope: OptimizationScope[];
  constraints: OptimizationConstraint[];
  validation: OptimizationValidation;
}

export type OptimizationScope = 'configuration' | 'resources' | 'algorithms' | 'caching' | 'custom';

export interface OptimizationConstraint {
  type: string;
  value: any;
  priority: number;
}

export interface OptimizationValidation {
  enabled: boolean;
  rollback: boolean;
  criteria: ValidationCriteria[];
}

export interface ValidationCriteria {
  metric: string;
  threshold: number;
  duration: string;
}

export interface RecommendationConfig {
  enabled: boolean;
  engines: RecommendationEngine[];
  scoring: ScoringConfig;
  filtering: FilteringConfig;
}

export interface RecommendationEngine {
  name: string;
  type: RecommendationEngineType;
  configuration: any;
  weight: number;
}

export type RecommendationEngineType = 
  | 'rule-based' 
  | 'ml-based' 
  | 'statistical' 
  | 'heuristic' 
  | 'custom';

export interface ScoringConfig {
  algorithm: string;
  weights: Map<string, number>;
  normalization: boolean;
}

export interface FilteringConfig {
  enabled: boolean;
  rules: FilteringRule[];
  ranking: RankingConfig;
}

export interface FilteringRule {
  condition: string;
  action: 'include' | 'exclude' | 'boost' | 'penalize';
  weight: number;
}

export interface RankingConfig {
  algorithm: string;
  factors: Map<string, number>;
  diversity: boolean;
}

export interface TuningConfig {
  enabled: boolean;
  parameters: TuningParameter[];
  strategies: TuningStrategy[];
  evaluation: TuningEvaluation;
}

export interface TuningParameter {
  name: string;
  type: string;
  range: any;
  step?: any;
  importance: number;
}

export interface TuningStrategy {
  name: string;
  type: TuningStrategyType;
  configuration: any;
  budget: TuningBudget;
}

export type TuningStrategyType = 
  | 'grid-search' 
  | 'random-search' 
  | 'bayesian' 
  | 'genetic' 
  | 'gradient-based' 
  | 'custom';

export interface TuningBudget {
  iterations: number;
  time: string;
  resources: ResourceConfiguration;
}

export interface TuningEvaluation {
  metrics: string[];
  objectives: TuningObjective[];
  constraints: TuningConstraint[];
}

export interface TuningObjective {
  metric: string;
  goal: 'minimize' | 'maximize';
  weight: number;
}

export interface TuningConstraint {
  metric: string;
  operator: string;
  value: number;
}

export interface PerformanceReportingConfig {
  enabled: boolean;
  dashboards: PerformanceDashboard[];
  reports: PerformanceReport[];
  alerts: PerformanceAlert[];
  exports: PerformanceExport[];
}

export interface PerformanceDashboard {
  name: string;
  description: string;
  metrics: string[];
  views: DashboardView[];
  refresh: string;
}

export interface DashboardView {
  name: string;
  type: string;
  configuration: any;
  position: ViewPosition;
}

export interface ViewPosition {
  row: number;
  col: number;
  width: number;
  height: number;
}

export interface PerformanceReport {
  name: string;
  description: string;
  schedule: string;
  format: string;
  recipients: string[];
  content: ReportContent[];
}

export interface ReportContent {
  type: 'summary' | 'detailed' | 'trend' | 'comparison' | 'recommendation';
  configuration: any;
}

export interface PerformanceAlert {
  name: string;
  description: string;
  condition: string;
  severity: string;
  channels: string[];
  throttling: AlertThrottling;
}

export interface PerformanceExport {
  name: string;
  format: string;
  destination: string;
  schedule: string;
  filters: ExportFilter[];
}

export interface ExportFilter {
  field: string;
  operator: string;
  value: any;
}

// Core System State and Health
export interface ObservabilitySystemState {
  status: SystemStatus;
  version: string;
  uptime: number;
  components: Map<string, ComponentState>;
  health: SystemHealth;
  metrics: SystemMetrics;
  performance: SystemPerformance;
  capacity: SystemCapacity;
  lastUpdated: Date;
}

export type SystemStatus = 'initializing' | 'healthy' | 'degraded' | 'unhealthy' | 'maintenance' | 'error';

export interface ComponentState {
  status: ComponentStatus;
  version: string;
  uptime: number;
  health: ComponentHealth;
  metrics: ComponentMetrics;
  errors: ComponentError[];
  lastUpdated: Date;
}

export type ComponentStatus = 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

export interface ComponentHealth {
  status: HealthStatus;
  checks: Map<string, HealthCheck>;
  score: number;
  lastCheck: Date;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
  duration: number;
  timestamp: Date;
}

export interface ComponentMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  availability: number;
  utilization: ResourceUtilization;
}

export interface ResourceUtilization {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface ComponentError {
  id: string;
  type: ErrorType;
  message: string;
  stack?: string;
  timestamp: Date;
  count: number;
  resolved: boolean;
}

export type ErrorType = 'system' | 'network' | 'configuration' | 'data' | 'security' | 'performance';

export interface SystemHealth {
  overall: HealthStatus;
  components: Map<string, HealthStatus>;
  services: Map<string, HealthStatus>;
  dependencies: Map<string, HealthStatus>;
  score: number;
  issues: SystemIssue[];
  lastAssessment: Date;
}

export interface SystemIssue {
  id: string;
  severity: IssueSeverity;
  type: IssueType;
  component: string;
  description: string;
  impact: string;
  recommendation: string;
  status: IssueStatus;
  created: Date;
  updated: Date;
}

export type IssueSeverity = 'critical' | 'major' | 'minor' | 'warning' | 'info';

export type IssueType = 
  | 'performance' 
  | 'availability' 
  | 'capacity' 
  | 'security' 
  | 'configuration' 
  | 'data-quality' 
  | 'compliance';

export type IssueStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed';

export interface SystemMetrics {
  ingestion: IngestionMetrics;
  processing: ProcessingMetrics;
  storage: StorageMetrics;
  querying: QueryingMetrics;
  alerting: AlertingMetrics;
  overall: OverallMetrics;
}

export interface IngestionMetrics {
  rate: number;
  volume: number;
  latency: LatencyMetrics;
  errors: ErrorMetrics;
  backpressure: number;
}

export interface LatencyMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  avg: number;
  max: number;
}

export interface ErrorMetrics {
  rate: number;
  count: number;
  types: Map<string, number>;
}

export interface ProcessingMetrics {
  throughput: number;
  latency: LatencyMetrics;
  errors: ErrorMetrics;
  queues: QueueMetrics;
  workers: WorkerMetrics;
}

export interface QueueMetrics {
  depth: number;
  rate: number;
  backlog: number;
  processing: number;
}

export interface WorkerMetrics {
  active: number;
  idle: number;
  busy: number;
  utilization: number;
}

export interface StorageMetrics {
  size: number;
  growth: number;
  utilization: number;
  operations: OperationMetrics;
  performance: StoragePerformance;
}

export interface OperationMetrics {
  reads: number;
  writes: number;
  deletes: number;
  latency: LatencyMetrics;
}

export interface StoragePerformance {
  iops: number;
  bandwidth: number;
  latency: LatencyMetrics;
  cache: CacheMetrics;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictions: number;
  size: number;
}

export interface QueryingMetrics {
  rate: number;
  latency: LatencyMetrics;
  errors: ErrorMetrics;
  complexity: QueryComplexity;
}

export interface QueryComplexity {
  simple: number;
  moderate: number;
  complex: number;
  avg: number;
}

export interface AlertingMetrics {
  active: number;
  fired: number;
  resolved: number;
  suppressed: number;
  latency: LatencyMetrics;
}

export interface OverallMetrics {
  availability: number;
  reliability: number;
  performance: number;
  efficiency: number;
  quality: number;
}

export interface SystemPerformance {
  current: PerformanceSnapshot;
  trends: PerformanceTrend[];
  benchmarks: BenchmarkResult[];
  optimization: OptimizationResult[];
}

export interface PerformanceSnapshot {
  timestamp: Date;
  metrics: Map<string, number>;
  scores: Map<string, number>;
  grade: PerformanceGrade;
}

export type PerformanceGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface PerformanceTrend {
  metric: string;
  timeRange: string;
  trend: TrendDirection;
  change: number;
  significance: number;
}

export type TrendDirection = 'improving' | 'degrading' | 'stable' | 'volatile';

export interface BenchmarkResult {
  name: string;
  timestamp: Date;
  results: Map<string, number>;
  comparison: BenchmarkComparison;
  passed: boolean;
}

export interface OptimizationResult {
  name: string;
  timestamp: Date;
  before: Map<string, number>;
  after: Map<string, number>;
  improvement: Map<string, number>;
  success: boolean;
}

export interface SystemCapacity {
  current: CapacitySnapshot;
  forecasts: CapacityForecast[];
  limits: CapacityLimit[];
  recommendations: CapacityRecommendation[];
}

export interface CapacitySnapshot {
  timestamp: Date;
  utilization: Map<string, number>;
  available: Map<string, number>;
  reserved: Map<string, number>;
}

export interface CapacityForecast {
  metric: string;
  horizon: string;
  prediction: number;
  confidence: number;
  exhaustion?: Date;
}

export interface CapacityLimit {
  resource: string;
  soft: number;
  hard: number;
  current: number;
  utilization: number;
}

export interface CapacityRecommendation {
  resource: string;
  action: CapacityAction;
  value: number;
  reason: string;
  priority: number;
}

export type CapacityAction = 'scale-up' | 'scale-down' | 'optimize' | 'monitor' | 'alert';

// Additional Supporting Interfaces

export interface ObservabilityComponent {
  id: string;
  name: string;
  type: ComponentType;
  version: string;
  configuration: any;
  dependencies: string[];
  state: ComponentState;
  created: Date;
  lastUpdated: Date;
}

export type ComponentType = 
  | 'collector' 
  | 'processor' 
  | 'exporter' 
  | 'storage' 
  | 'query' 
  | 'alert' 
  | 'dashboard' 
  | 'api';

export interface MonitoredService {
  id: string;
  name: string;
  type: ServiceType;
  endpoints: ServiceEndpoint[];
  health: ServiceHealth;
  metrics: ServiceMetrics;
  slos: ServiceLevelObjective[];
  alerts: AlertRule[];
  dashboards: string[];
  created: Date;
  lastUpdated: Date;
}

export type ServiceType = 'web' | 'api' | 'database' | 'cache' | 'queue' | 'worker' | 'custom';

export interface ServiceEndpoint {
  url: string;
  method: string;
  timeout: number;
  expectedStatus: number;
  healthCheck: boolean;
}

export interface ServiceHealth {
  status: HealthStatus;
  uptime: number;
  availability: number;
  lastFailure?: Date;
  checks: HealthCheck[];
}

export interface ServiceMetrics {
  requests: RequestMetrics;
  errors: ErrorMetrics;
  latency: LatencyMetrics;
  throughput: ThroughputMetrics;
  dependencies: DependencyMetrics;
}

export interface RequestMetrics {
  total: number;
  rate: number;
  successful: number;
  failed: number;
}

export interface ThroughputMetrics {
  requestsPerSecond: number;
  bytesPerSecond: number;
  messagesPerSecond: number;
}

export interface DependencyMetrics {
  calls: number;
  latency: LatencyMetrics;
  errors: ErrorMetrics;
  availability: number;
}

export interface ServiceLevelObjective {
  id: string;
  name: string;
  description: string;
  service: string;
  metric: string;
  target: number;
  timeWindow: string;
  errorBudget: number;
  status: SLOStatus;
  compliance: number;
  alerts: SLOAlert[];
  created: Date;
  lastUpdated: Date;
}

export type SLOStatus = 'healthy' | 'at-risk' | 'violated';

export interface SLOAlert {
  threshold: number;
  severity: AlertSeverity;
  channels: string[];
}

export interface Dashboard {
  id: string;
  title: string;
  description: string;
  tags: string[];
  panels: Panel[];
  variables: DashboardVariable[];
  layout: DashboardLayout;
  permissions: DashboardPermissions;
  created: Date;
  lastUpdated: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assignee: string;
  reporter: string;
  services: string[];
  timeline: IncidentEvent[];
  metrics: IncidentMetrics;
  postmortem?: Postmortem;
  created: Date;
  resolved?: Date;
}

export type IncidentSeverity = 'sev1' | 'sev2' | 'sev3' | 'sev4';

export type IncidentStatus = 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'closed';

export interface IncidentEvent {
  id: string;
  type: EventType;
  description: string;
  timestamp: Date;
  user: string;
  data?: any;
}

export type EventType = 
  | 'created' 
  | 'assigned' 
  | 'updated' 
  | 'escalated' 
  | 'commented' 
  | 'resolved' 
  | 'closed' 
  | 'reopened';

export interface IncidentMetrics {
  detectionTime: number;
  responseTime: number;
  resolutionTime: number;
  mttr: number;
  impact: ImpactMetrics;
}

export interface ImpactMetrics {
  users: number;
  revenue: number;
  services: string[];
  duration: number;
}

export interface Postmortem {
  summary: string;
  timeline: PostmortemTimeline[];
  rootCause: string;
  contributing: string[];
  resolution: string;
  lessons: string[];
  actionItems: ActionItem[];
  created: Date;
  author: string;
}

export interface PostmortemTimeline {
  timestamp: Date;
  event: string;
  impact: string;
  response: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: Date;
  priority: ActionPriority;
  status: ActionStatus;
}

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

export type ActionStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';

export interface Visualization {
  id: string;
  type: VisualizationType;
  configuration: any;
  data: any;
  interactions: VisualizationInteraction[];
}

export type VisualizationType = 
  | 'line-chart' 
  | 'area-chart' 
  | 'bar-chart' 
  | 'histogram' 
  | 'heatmap' 
  | 'scatter-plot' 
  | 'pie-chart' 
  | 'gauge' 
  | 'table' 
  | 'text';

export interface VisualizationInteraction {
  type: InteractionType;
  configuration: any;
  handler: Function;
}

export type InteractionType = 'click' | 'hover' | 'brush' | 'zoom' | 'drill-down';

// Manager Interface
export interface ObservabilityManager {
  initialize(): Promise<void>;
  
  // Component Management
  registerComponent(component: ObservabilityComponent): Promise<void>;
  unregisterComponent(componentId: string): Promise<void>;
  getComponent(componentId: string): Promise<ObservabilityComponent | undefined>;
  listComponents(): Promise<ObservabilityComponent[]>;
  
  // Service Monitoring
  addService(service: MonitoredService): Promise<void>;
  removeService(serviceId: string): Promise<void>;
  getService(serviceId: string): Promise<MonitoredService | undefined>;
  listServices(): Promise<MonitoredService[]>;
  
  // Metrics
  recordMetric(name: string, value: number, labels?: Map<string, string>): Promise<void>;
  queryMetrics(query: string, timeRange?: TimeRange): Promise<any>;
  getMetrics(serviceId?: string): Promise<ServiceMetrics>;
  
  // Logs
  recordLog(level: LogLevel, message: string, metadata?: any): Promise<void>;
  queryLogs(query: string, timeRange?: TimeRange): Promise<any>;
  
  // Traces
  recordTrace(trace: any): Promise<void>;
  queryTraces(query: string, timeRange?: TimeRange): Promise<any>;
  
  // Alerts
  createAlert(rule: AlertRule): Promise<void>;
  updateAlert(alertId: string, rule: Partial<AlertRule>): Promise<void>;
  deleteAlert(alertId: string): Promise<void>;
  getAlert(alertId: string): Promise<AlertRule | undefined>;
  listAlerts(): Promise<AlertRule[]>;
  
  // Incidents
  createIncident(incident: Incident): Promise<void>;
  updateIncident(incidentId: string, incident: Partial<Incident>): Promise<void>;
  getIncident(incidentId: string): Promise<Incident | undefined>;
  listIncidents(status?: IncidentStatus): Promise<Incident[]>;
  
  // SLOs
  createSLO(slo: ServiceLevelObjective): Promise<void>;
  updateSLO(sloId: string, slo: Partial<ServiceLevelObjective>): Promise<void>;
  deleteSLO(sloId: string): Promise<void>;
  getSLO(sloId: string): Promise<ServiceLevelObjective | undefined>;
  listSLOs(): Promise<ServiceLevelObjective[]>;
  
  // Dashboards
  createDashboard(dashboard: Dashboard): Promise<void>;
  updateDashboard(dashboardId: string, dashboard: Partial<Dashboard>): Promise<void>;
  deleteDashboard(dashboardId: string): Promise<void>;
  getDashboard(dashboardId: string): Promise<Dashboard | undefined>;
  listDashboards(): Promise<Dashboard[]>;
  
  // Health and Status
  getSystemHealth(): Promise<SystemHealth>;
  getSystemMetrics(): Promise<SystemMetrics>;
  getSystemState(): Promise<ObservabilitySystemState>;
  
  // Configuration
  updateConfiguration(config: Partial<ObservabilityConfiguration>): Promise<void>;
  getConfiguration(): Promise<ObservabilityConfiguration>;
  
  shutdown(): Promise<void>;
}