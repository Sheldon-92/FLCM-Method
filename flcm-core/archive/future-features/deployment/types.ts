/**
 * FLCM Deployment Pipeline Types
 * Comprehensive deployment and infrastructure management types
 */

// Core Deployment Interfaces
export interface DeploymentPipeline {
  id: string;
  name: string;
  description: string;
  version: string;
  configuration: PipelineConfiguration;
  stages: Map<string, DeploymentStage>;
  environments: Map<string, DeploymentEnvironment>;
  artifacts: Map<string, BuildArtifact>;
  triggers: PipelineTrigger[];
  hooks: PipelineHooks;
  permissions: PipelinePermissions;
  state: PipelineState;
  history: DeploymentHistory[];
  created: Date;
  lastUpdated: Date;
}

export interface PipelineConfiguration {
  type: PipelineType;
  strategy: DeploymentStrategy;
  concurrency: ConcurrencyConfiguration;
  timeout: TimeoutConfiguration;
  retry: RetryConfiguration;
  rollback: RollbackConfiguration;
  security: SecurityConfiguration;
  notifications: NotificationConfiguration;
  approval: ApprovalConfiguration;
  variables: Map<string, PipelineVariable>;
  secrets: Map<string, SecretReference>;
  conditions: PipelineCondition[];
}

export type PipelineType = 
  | 'build' 
  | 'test' 
  | 'deploy' 
  | 'release' 
  | 'hotfix' 
  | 'rollback' 
  | 'canary' 
  | 'blue-green' 
  | 'rolling' 
  | 'custom';

export type DeploymentStrategy = 
  | 'recreate' 
  | 'rolling-update' 
  | 'blue-green' 
  | 'canary' 
  | 'a-b-testing' 
  | 'shadow' 
  | 'feature-toggle';

export interface ConcurrencyConfiguration {
  maxParallel: number;
  maxConcurrency: number;
  groupBy: 'stage' | 'environment' | 'service' | 'none';
  dependencies: boolean;
  waitForDependencies: boolean;
}

export interface TimeoutConfiguration {
  global: number;
  stage: number;
  step: number;
  approval: number;
  rollback: number;
}

export interface RetryConfiguration {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  backoffMultiplier: number;
  retryableErrors: string[];
  nonRetryableErrors: string[];
}

export interface RollbackConfiguration {
  enabled: boolean;
  automatic: boolean;
  triggers: RollbackTrigger[];
  strategy: 'previous-version' | 'specific-version' | 'snapshot';
  preserveData: boolean;
  timeout: number;
}

export interface RollbackTrigger {
  type: 'health-check' | 'metric-threshold' | 'error-rate' | 'manual' | 'time-based';
  condition: string;
  threshold: any;
  duration: number;
  enabled: boolean;
}

export interface SecurityConfiguration {
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  secrets: SecretManagement;
  scanning: SecurityScanning;
  compliance: ComplianceConfig;
  audit: AuditConfig;
}

export interface AuthenticationConfig {
  required: boolean;
  providers: AuthProvider[];
  mfa: boolean;
  sessionTimeout: number;
}

export interface AuthProvider {
  type: 'oauth2' | 'saml' | 'ldap' | 'jwt' | 'api-key';
  configuration: any;
  enabled: boolean;
  priority: number;
}

export interface AuthorizationConfig {
  enabled: boolean;
  model: 'rbac' | 'abac' | 'acl';
  roles: Role[];
  permissions: Permission[];
  policies: Policy[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  inherits: string[];
  metadata: Map<string, any>;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: string[];
  conditions: string[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  subjects: string[];
  resources: string[];
  actions: string[];
  conditions: string[];
}

export interface SecretManagement {
  provider: 'kubernetes' | 'vault' | 'aws-secrets' | 'azure-keyvault' | 'gcp-secrets';
  encryption: EncryptionConfig;
  rotation: RotationConfig;
  access: AccessConfig;
}

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  provider: string;
  transitEncryption: boolean;
  atRestEncryption: boolean;
}

export interface RotationConfig {
  enabled: boolean;
  schedule: string;
  gracePeriod: number;
  notification: boolean;
}

export interface AccessConfig {
  audit: boolean;
  timeToLive: number;
  maxAccess: number;
  restrictions: AccessRestriction[];
}

export interface AccessRestriction {
  type: 'ip' | 'time' | 'location' | 'user' | 'service';
  condition: string;
  allowed: boolean;
}

export interface SecurityScanning {
  enabled: boolean;
  types: ScanType[];
  schedule: string;
  thresholds: ScanThreshold[];
  reporting: ScanReporting;
}

export type ScanType = 
  | 'sast' 
  | 'dast' 
  | 'dependency' 
  | 'container' 
  | 'infrastructure' 
  | 'secrets' 
  | 'compliance';

export interface ScanThreshold {
  severity: 'critical' | 'high' | 'medium' | 'low';
  maxCount: number;
  failPipeline: boolean;
}

export interface ScanReporting {
  formats: string[];
  destinations: string[];
  notifications: boolean;
  archival: boolean;
}

export interface ComplianceConfig {
  frameworks: ComplianceFramework[];
  controls: ComplianceControl[];
  reporting: ComplianceReporting;
  certification: CertificationConfig;
}

export interface ComplianceFramework {
  name: string;
  version: string;
  controls: string[];
  requirements: string[];
  enabled: boolean;
}

export interface ComplianceControl {
  id: string;
  framework: string;
  title: string;
  description: string;
  implementation: string;
  evidence: string;
  status: 'compliant' | 'non-compliant' | 'not-applicable' | 'unknown';
}

export interface ComplianceReporting {
  frequency: string;
  format: string;
  recipients: string[];
  storage: string;
}

export interface CertificationConfig {
  required: boolean;
  certifications: string[];
  validity: number;
  renewal: boolean;
}

export interface AuditConfig {
  enabled: boolean;
  events: string[];
  retention: number;
  storage: string;
  realtime: boolean;
  alerting: boolean;
}

export interface NotificationConfiguration {
  channels: NotificationChannel[];
  events: NotificationEvent[];
  templates: NotificationTemplate[];
  escalation: EscalationPolicy[];
}

export interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms' | 'pagerduty';
  configuration: any;
  enabled: boolean;
  priority: number;
  filters: NotificationFilter[];
}

export interface NotificationEvent {
  type: PipelineEventType;
  enabled: boolean;
  channels: string[];
  conditions: string[];
}

export type PipelineEventType = 
  | 'pipeline-started' 
  | 'pipeline-completed' 
  | 'pipeline-failed' 
  | 'stage-started' 
  | 'stage-completed' 
  | 'stage-failed' 
  | 'approval-required' 
  | 'deployment-success' 
  | 'deployment-failure' 
  | 'rollback-initiated' 
  | 'security-alert'
  | 'compliance-violation';

export interface NotificationFilter {
  field: string;
  operator: 'equals' | 'contains' | 'regex' | 'greater' | 'less';
  value: any;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  variables: Map<string, string>;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  levels: EscalationLevel[];
  timeout: number;
  repeat: boolean;
}

export interface EscalationLevel {
  level: number;
  delay: number;
  channels: string[];
  recipients: string[];
}

export interface ApprovalConfiguration {
  required: boolean;
  stages: string[];
  approvers: ApproverGroup[];
  timeout: number;
  autoApprove: AutoApprovalRule[];
}

export interface ApproverGroup {
  id: string;
  name: string;
  type: 'individual' | 'group' | 'role';
  members: string[];
  minApprovals: number;
  maxApprovals: number;
}

export interface AutoApprovalRule {
  condition: string;
  enabled: boolean;
  priority: number;
}

export interface PipelineVariable {
  name: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'secret';
  scope: 'global' | 'stage' | 'environment';
  required: boolean;
  default?: any;
  validation?: ValidationRule;
}

export interface ValidationRule {
  type: 'regex' | 'range' | 'enum' | 'custom';
  rule: string | number[] | string[] | Function;
  message: string;
}

export interface SecretReference {
  name: string;
  provider: string;
  key: string;
  version?: string;
  scope: 'global' | 'stage' | 'environment';
}

export interface PipelineCondition {
  type: 'branch' | 'tag' | 'path' | 'event' | 'schedule' | 'manual' | 'custom';
  condition: string;
  enabled: boolean;
}

// Deployment Stage Interfaces
export interface DeploymentStage {
  id: string;
  name: string;
  description: string;
  type: StageType;
  order: number;
  configuration: StageConfiguration;
  steps: DeploymentStep[];
  dependencies: StageDependency[];
  conditions: StageCondition[];
  artifacts: StageArtifact[];
  environment?: string;
  approval?: ApprovalRequirement;
  state: StageState;
  created: Date;
  lastUpdated: Date;
}

export type StageType = 
  | 'build' 
  | 'test' 
  | 'security-scan' 
  | 'quality-gate' 
  | 'package' 
  | 'deploy' 
  | 'smoke-test' 
  | 'integration-test' 
  | 'performance-test' 
  | 'approval' 
  | 'notification' 
  | 'rollback' 
  | 'cleanup';

export interface StageConfiguration {
  parallel: boolean;
  continueOnError: boolean;
  timeout: number;
  retries: number;
  environment: Map<string, string>;
  resources: ResourceRequirements;
  isolation: IsolationConfig;
}

export interface ResourceRequirements {
  cpu: string;
  memory: string;
  storage: string;
  gpu?: string;
  network?: string;
}

export interface IsolationConfig {
  enabled: boolean;
  type: 'process' | 'container' | 'vm' | 'namespace';
  cleanup: boolean;
}

export interface StageDependency {
  stageId: string;
  type: 'success' | 'completion' | 'failure' | 'always';
  condition?: string;
}

export interface StageCondition {
  type: 'always' | 'success' | 'failure' | 'custom';
  expression: string;
}

export interface StageArtifact {
  name: string;
  path: string;
  type: 'build' | 'test' | 'report' | 'package' | 'image' | 'config';
  required: boolean;
  publish: boolean;
}

export interface ApprovalRequirement {
  required: boolean;
  approvers: string[];
  minApprovals: number;
  timeout: number;
  autoApprove: boolean;
}

export interface StageState {
  status: StageStatus;
  startTime?: Date;
  endTime?: Date;
  duration: number;
  attempts: number;
  error?: DeploymentError;
  artifacts: Map<string, ArtifactInfo>;
}

export type StageStatus = 
  | 'pending' 
  | 'running' 
  | 'success' 
  | 'failure' 
  | 'cancelled' 
  | 'skipped' 
  | 'waiting-approval' 
  | 'timeout';

// Deployment Step Interfaces
export interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  type: StepType;
  order: number;
  configuration: StepConfiguration;
  script?: StepScript;
  condition?: StepCondition;
  state: StepState;
  created: Date;
  lastUpdated: Date;
}

export type StepType = 
  | 'shell' 
  | 'docker' 
  | 'kubernetes' 
  | 'terraform' 
  | 'ansible' 
  | 'helm' 
  | 'aws-cli' 
  | 'azure-cli' 
  | 'gcp-cli' 
  | 'custom' 
  | 'api-call' 
  | 'file-operation' 
  | 'database' 
  | 'notification' 
  | 'approval';

export interface StepConfiguration {
  timeout: number;
  retries: number;
  continueOnError: boolean;
  runCondition: 'always' | 'success' | 'failure';
  environment: Map<string, string>;
  workingDirectory: string;
  inputs: Map<string, any>;
  outputs: Map<string, string>;
}

export interface StepScript {
  type: 'inline' | 'file' | 'template';
  content: string;
  interpreter: string;
  arguments: string[];
}

export interface StepCondition {
  expression: string;
  variables: Map<string, any>;
}

export interface StepState {
  status: StepStatus;
  startTime?: Date;
  endTime?: Date;
  duration: number;
  exitCode?: number;
  output: string;
  error?: DeploymentError;
  logs: StepLog[];
}

export type StepStatus = 
  | 'pending' 
  | 'running' 
  | 'success' 
  | 'failure' 
  | 'cancelled' 
  | 'skipped' 
  | 'timeout';

export interface StepLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

// Environment Interfaces
export interface DeploymentEnvironment {
  id: string;
  name: string;
  description: string;
  type: EnvironmentType;
  configuration: EnvironmentConfiguration;
  infrastructure: InfrastructureConfig;
  services: ServiceConfig[];
  database: DatabaseConfig;
  monitoring: MonitoringConfig;
  security: EnvironmentSecurity;
  networking: NetworkingConfig;
  storage: StorageConfig;
  backup: BackupConfig;
  disaster: DisasterRecoveryConfig;
  state: EnvironmentState;
  created: Date;
  lastUpdated: Date;
}

export type EnvironmentType = 
  | 'development' 
  | 'testing' 
  | 'staging' 
  | 'production' 
  | 'canary' 
  | 'preview' 
  | 'sandbox' 
  | 'disaster-recovery';

export interface EnvironmentConfiguration {
  region: string;
  zone: string;
  provider: CloudProvider;
  cluster: string;
  namespace: string;
  domain: string;
  ssl: boolean;
  variables: Map<string, string>;
  secrets: Map<string, string>;
  limits: ResourceLimits;
  quotas: ResourceQuotas;
}

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'kubernetes' | 'docker' | 'bare-metal';

export interface ResourceLimits {
  cpu: string;
  memory: string;
  storage: string;
  pods: number;
  services: number;
  ingresses: number;
}

export interface ResourceQuotas {
  requests: ResourceRequirements;
  limits: ResourceRequirements;
  pods: number;
  persistentVolumeClaims: number;
  services: number;
  secrets: number;
  configMaps: number;
}

export interface InfrastructureConfig {
  type: 'kubernetes' | 'docker' | 'vm' | 'serverless' | 'hybrid';
  provider: CloudProvider;
  configuration: any;
  scaling: ScalingConfig;
  loadBalancing: LoadBalancingConfig;
  networking: NetworkingConfig;
  security: SecurityConfig;
}

export interface ScalingConfig {
  enabled: boolean;
  type: 'horizontal' | 'vertical' | 'both';
  minReplicas: number;
  maxReplicas: number;
  metrics: ScalingMetric[];
  behavior: ScalingBehavior;
}

export interface ScalingMetric {
  type: 'cpu' | 'memory' | 'custom' | 'external';
  target: number;
  averageUtilization?: number;
  averageValue?: string;
}

export interface ScalingBehavior {
  scaleUp: ScalingPolicy;
  scaleDown: ScalingPolicy;
}

export interface ScalingPolicy {
  stabilizationWindowSeconds: number;
  selectPolicy: 'max' | 'min' | 'disabled';
  policies: ScalingPolicyRule[];
}

export interface ScalingPolicyRule {
  type: 'pods' | 'percent';
  value: number;
  periodSeconds: number;
}

export interface LoadBalancingConfig {
  enabled: boolean;
  type: 'application' | 'network' | 'gateway';
  algorithm: 'round-robin' | 'least-connections' | 'ip-hash' | 'weighted';
  healthCheck: HealthCheckConfig;
  stickySession: boolean;
  timeout: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  protocol: 'http' | 'https' | 'tcp' | 'grpc';
  path: string;
  port: number;
  interval: number;
  timeout: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
}

export interface NetworkingConfig {
  vpc: VPCConfig;
  subnets: SubnetConfig[];
  securityGroups: SecurityGroupConfig[];
  ingress: IngressConfig;
  egress: EgressConfig;
  dns: DNSConfig;
}

export interface VPCConfig {
  id: string;
  cidr: string;
  region: string;
  enableDnsHostnames: boolean;
  enableDnsSupport: boolean;
  tags: Map<string, string>;
}

export interface SubnetConfig {
  id: string;
  cidr: string;
  availabilityZone: string;
  type: 'public' | 'private' | 'database';
  routeTable: string;
  natGateway?: string;
}

export interface SecurityGroupConfig {
  id: string;
  name: string;
  description: string;
  rules: SecurityRule[];
  tags: Map<string, string>;
}

export interface SecurityRule {
  type: 'ingress' | 'egress';
  protocol: 'tcp' | 'udp' | 'icmp' | 'all';
  port: number | string;
  source: string;
  description: string;
}

export interface IngressConfig {
  enabled: boolean;
  className: string;
  annotations: Map<string, string>;
  hosts: IngressHost[];
  tls: TLSConfig[];
}

export interface IngressHost {
  host: string;
  paths: IngressPath[];
}

export interface IngressPath {
  path: string;
  pathType: 'exact' | 'prefix';
  backend: IngressBackend;
}

export interface IngressBackend {
  service: string;
  port: number;
}

export interface TLSConfig {
  hosts: string[];
  secretName: string;
}

export interface EgressConfig {
  enabled: boolean;
  rules: EgressRule[];
  defaultDeny: boolean;
}

export interface EgressRule {
  hosts: string[];
  ports: EgressPort[];
  protocols: string[];
}

export interface EgressPort {
  number: number;
  name: string;
  protocol: string;
}

export interface DNSConfig {
  provider: 'route53' | 'cloudflare' | 'azure-dns' | 'gcp-dns' | 'custom';
  zone: string;
  records: DNSRecord[];
  ttl: number;
}

export interface DNSRecord {
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'SRV';
  value: string;
  ttl: number;
  priority?: number;
}

export interface ServiceConfig {
  name: string;
  type: 'web' | 'api' | 'database' | 'cache' | 'queue' | 'worker' | 'cron';
  image: ImageConfig;
  replicas: number;
  resources: ResourceRequirements;
  ports: ServicePort[];
  environment: Map<string, string>;
  volumes: VolumeMount[];
  healthCheck: HealthCheckConfig;
  lifecycle: LifecycleConfig;
}

export interface ImageConfig {
  registry: string;
  repository: string;
  tag: string;
  pullPolicy: 'always' | 'if-not-present' | 'never';
  pullSecrets: string[];
}

export interface ServicePort {
  name: string;
  port: number;
  targetPort: number;
  protocol: 'TCP' | 'UDP';
}

export interface VolumeMount {
  name: string;
  mountPath: string;
  subPath?: string;
  readOnly: boolean;
}

export interface LifecycleConfig {
  preStop?: LifecycleHook;
  postStart?: LifecycleHook;
  terminationGracePeriodSeconds: number;
}

export interface LifecycleHook {
  exec?: ExecAction;
  httpGet?: HTTPGetAction;
}

export interface ExecAction {
  command: string[];
}

export interface HTTPGetAction {
  path: string;
  port: number;
  host?: string;
  scheme: 'HTTP' | 'HTTPS';
  httpHeaders: HTTPHeader[];
}

export interface HTTPHeader {
  name: string;
  value: string;
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch';
  host: string;
  port: number;
  database: string;
  username: string;
  password: SecretReference;
  ssl: boolean;
  pooling: PoolingConfig;
  backup: DatabaseBackupConfig;
  migration: MigrationConfig;
}

export interface PoolingConfig {
  minConnections: number;
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
}

export interface DatabaseBackupConfig {
  enabled: boolean;
  schedule: string;
  retention: number;
  location: string;
  encryption: boolean;
}

export interface MigrationConfig {
  enabled: boolean;
  source: string;
  table: string;
  location: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: MetricsConfig;
  logging: LoggingConfig;
  tracing: TracingConfig;
  alerting: AlertingConfig;
  dashboards: DashboardConfig[];
}

export interface MetricsConfig {
  enabled: boolean;
  provider: 'prometheus' | 'datadog' | 'newrelic' | 'cloudwatch';
  endpoint: string;
  interval: number;
  retention: string;
  exporters: MetricsExporter[];
}

export interface MetricsExporter {
  name: string;
  type: string;
  configuration: any;
  enabled: boolean;
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text' | 'structured';
  destinations: LogDestination[];
  retention: string;
  sampling: LogSampling;
}

export interface LogDestination {
  type: 'stdout' | 'file' | 'syslog' | 'elasticsearch' | 'cloudwatch' | 'datadog';
  configuration: any;
  enabled: boolean;
}

export interface LogSampling {
  enabled: boolean;
  rate: number;
  burst: number;
}

export interface TracingConfig {
  enabled: boolean;
  provider: 'jaeger' | 'zipkin' | 'datadog' | 'aws-xray';
  endpoint: string;
  samplingRate: number;
  tags: Map<string, string>;
}

export interface AlertingConfig {
  enabled: boolean;
  rules: AlertRule[];
  channels: AlertChannel[];
  escalation: EscalationPolicy[];
}

export interface AlertRule {
  name: string;
  description: string;
  expression: string;
  duration: string;
  severity: 'critical' | 'warning' | 'info';
  labels: Map<string, string>;
  annotations: Map<string, string>;
}

export interface AlertChannel {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'pagerduty';
  configuration: any;
  enabled: boolean;
}

export interface DashboardConfig {
  name: string;
  provider: 'grafana' | 'datadog' | 'newrelic' | 'kibana';
  source: string;
  variables: Map<string, string>;
}

export interface EnvironmentSecurity {
  rbac: RBACConfig;
  networkPolicies: NetworkPolicyConfig[];
  podSecurityPolicies: PodSecurityPolicyConfig[];
  secretManagement: SecretManagementConfig;
  imageScanning: ImageScanningConfig;
}

export interface RBACConfig {
  enabled: boolean;
  serviceAccounts: ServiceAccountConfig[];
  roles: RoleConfig[];
  roleBindings: RoleBindingConfig[];
}

export interface ServiceAccountConfig {
  name: string;
  namespace: string;
  annotations: Map<string, string>;
  imagePullSecrets: string[];
}

export interface RoleConfig {
  name: string;
  namespace?: string;
  rules: PolicyRule[];
}

export interface PolicyRule {
  apiGroups: string[];
  resources: string[];
  verbs: string[];
  resourceNames?: string[];
}

export interface RoleBindingConfig {
  name: string;
  namespace?: string;
  roleRef: RoleRef;
  subjects: Subject[];
}

export interface RoleRef {
  kind: 'Role' | 'ClusterRole';
  name: string;
  apiGroup: string;
}

export interface Subject {
  kind: 'User' | 'Group' | 'ServiceAccount';
  name: string;
  namespace?: string;
}

export interface NetworkPolicyConfig {
  name: string;
  namespace: string;
  podSelector: LabelSelector;
  ingress: NetworkPolicyIngressRule[];
  egress: NetworkPolicyEgressRule[];
}

export interface LabelSelector {
  matchLabels: Map<string, string>;
  matchExpressions: LabelSelectorRequirement[];
}

export interface LabelSelectorRequirement {
  key: string;
  operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist';
  values: string[];
}

export interface NetworkPolicyIngressRule {
  from: NetworkPolicyPeer[];
  ports: NetworkPolicyPort[];
}

export interface NetworkPolicyEgressRule {
  to: NetworkPolicyPeer[];
  ports: NetworkPolicyPort[];
}

export interface NetworkPolicyPeer {
  podSelector?: LabelSelector;
  namespaceSelector?: LabelSelector;
  ipBlock?: IPBlock;
}

export interface IPBlock {
  cidr: string;
  except: string[];
}

export interface NetworkPolicyPort {
  protocol: 'TCP' | 'UDP' | 'SCTP';
  port: number | string;
  endPort?: number;
}

export interface PodSecurityPolicyConfig {
  name: string;
  privileged: boolean;
  allowPrivilegeEscalation: boolean;
  requiredDropCapabilities: string[];
  allowedCapabilities: string[];
  volumes: string[];
  runAsUser: RunAsUserStrategyOptions;
  runAsGroup: RunAsGroupStrategyOptions;
  seLinux: SELinuxStrategyOptions;
  fsGroup: FSGroupStrategyOptions;
}

export interface RunAsUserStrategyOptions {
  rule: 'MustRunAs' | 'MustRunAsNonRoot' | 'RunAsAny';
  ranges: IDRange[];
}

export interface RunAsGroupStrategyOptions {
  rule: 'MustRunAs' | 'MayRunAs' | 'RunAsAny';
  ranges: IDRange[];
}

export interface SELinuxStrategyOptions {
  rule: 'MustRunAs' | 'RunAsAny';
  seLinuxOptions: SELinuxOptions;
}

export interface SELinuxOptions {
  user: string;
  role: string;
  type: string;
  level: string;
}

export interface FSGroupStrategyOptions {
  rule: 'MustRunAs' | 'MayRunAs' | 'RunAsAny';
  ranges: IDRange[];
}

export interface IDRange {
  min: number;
  max: number;
}

export interface SecretManagementConfig {
  provider: 'kubernetes' | 'vault' | 'aws-secrets' | 'azure-keyvault';
  configuration: any;
  encryption: boolean;
  rotation: SecretRotationConfig;
}

export interface SecretRotationConfig {
  enabled: boolean;
  interval: string;
  gracePeriod: number;
}

export interface ImageScanningConfig {
  enabled: boolean;
  scanOnPush: boolean;
  scanOnDeploy: boolean;
  vulnerabilityThreshold: 'critical' | 'high' | 'medium' | 'low';
  failOnVulnerabilities: boolean;
}

export interface StorageConfig {
  classes: StorageClassConfig[];
  volumes: PersistentVolumeConfig[];
  backup: StorageBackupConfig;
}

export interface StorageClassConfig {
  name: string;
  provisioner: string;
  parameters: Map<string, string>;
  reclaimPolicy: 'Retain' | 'Delete' | 'Recycle';
  volumeBindingMode: 'Immediate' | 'WaitForFirstConsumer';
}

export interface PersistentVolumeConfig {
  name: string;
  capacity: string;
  accessModes: string[];
  storageClass: string;
  hostPath?: HostPathVolumeSource;
  nfs?: NFSVolumeSource;
  awsElasticBlockStore?: AWSElasticBlockStoreVolumeSource;
}

export interface HostPathVolumeSource {
  path: string;
  type: 'DirectoryOrCreate' | 'Directory' | 'FileOrCreate' | 'File' | 'Socket' | 'CharDevice' | 'BlockDevice';
}

export interface NFSVolumeSource {
  server: string;
  path: string;
  readOnly: boolean;
}

export interface AWSElasticBlockStoreVolumeSource {
  volumeID: string;
  fsType: string;
  partition: number;
  readOnly: boolean;
}

export interface StorageBackupConfig {
  enabled: boolean;
  schedule: string;
  retention: number;
  location: string;
  encryption: boolean;
}

export interface BackupConfig {
  enabled: boolean;
  type: 'full' | 'incremental' | 'differential';
  schedule: string;
  retention: RetentionPolicy;
  storage: BackupStorage;
  encryption: BackupEncryption;
  verification: BackupVerification;
}

export interface RetentionPolicy {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface BackupStorage {
  type: 's3' | 'gcs' | 'azure-blob' | 'nfs' | 'local';
  configuration: any;
  redundancy: 'none' | 'lrs' | 'zrs' | 'grs' | 'ra-grs';
}

export interface BackupEncryption {
  enabled: boolean;
  algorithm: string;
  keyManagement: 'customer' | 'service';
}

export interface BackupVerification {
  enabled: boolean;
  schedule: string;
  checksum: boolean;
  restoration: boolean;
}

export interface DisasterRecoveryConfig {
  enabled: boolean;
  rto: number; // Recovery Time Objective
  rpo: number; // Recovery Point Objective
  strategy: DRStrategy;
  sites: DRSite[];
  failover: FailoverConfig;
  failback: FailbackConfig;
}

export type DRStrategy = 'backup-restore' | 'pilot-light' | 'warm-standby' | 'hot-standby' | 'multi-site';

export interface DRSite {
  name: string;
  type: 'primary' | 'secondary' | 'tertiary';
  region: string;
  provider: CloudProvider;
  capacity: number; // Percentage of primary
  configuration: any;
}

export interface FailoverConfig {
  automatic: boolean;
  triggers: FailoverTrigger[];
  procedures: FailoverProcedure[];
  testing: FailoverTesting;
}

export interface FailoverTrigger {
  type: 'health-check' | 'manual' | 'external';
  threshold: any;
  cooldown: number;
}

export interface FailoverProcedure {
  order: number;
  description: string;
  script: string;
  timeout: number;
  rollback: string;
}

export interface FailoverTesting {
  enabled: boolean;
  schedule: string;
  scope: 'partial' | 'full';
  automation: boolean;
}

export interface FailbackConfig {
  automatic: boolean;
  validation: boolean;
  procedures: FailbackProcedure[];
}

export interface FailbackProcedure {
  order: number;
  description: string;
  script: string;
  timeout: number;
  validation: string;
}

// Build Artifact Interfaces
export interface BuildArtifact {
  id: string;
  name: string;
  type: ArtifactType;
  version: string;
  configuration: ArtifactConfiguration;
  metadata: ArtifactMetadata;
  dependencies: ArtifactDependency[];
  security: ArtifactSecurity;
  storage: ArtifactStorage;
  state: ArtifactState;
  created: Date;
  lastUpdated: Date;
}

export type ArtifactType = 
  | 'container-image' 
  | 'package' 
  | 'binary' 
  | 'library' 
  | 'configuration' 
  | 'documentation' 
  | 'test-results' 
  | 'security-report' 
  | 'terraform-plan' 
  | 'helm-chart';

export interface ArtifactConfiguration {
  registry: RegistryConfig;
  tags: string[];
  labels: Map<string, string>;
  annotations: Map<string, string>;
  buildArgs: Map<string, string>;
  platforms: string[];
  compression: CompressionConfig;
}

export interface RegistryConfig {
  url: string;
  namespace: string;
  credentials: CredentialReference;
  insecure: boolean;
  mirror: string[];
}

export interface CredentialReference {
  type: 'username-password' | 'token' | 'certificate' | 'aws-iam' | 'gcp-service-account';
  secretRef: SecretReference;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'bzip2' | 'xz' | 'zstd';
  level: number;
}

export interface ArtifactMetadata {
  buildId: string;
  commitSha: string;
  branch: string;
  author: string;
  buildTime: Date;
  size: number;
  checksum: ChecksumInfo;
  sbom: SBOM;
  provenance: ProvenanceInfo;
}

export interface ChecksumInfo {
  algorithm: 'sha256' | 'sha512' | 'md5';
  value: string;
}

export interface SBOM {
  format: 'spdx' | 'cyclone' | 'syft';
  version: string;
  components: SBOMComponent[];
  vulnerabilities: SBOMVulnerability[];
}

export interface SBOMComponent {
  name: string;
  version: string;
  type: 'library' | 'framework' | 'application' | 'container' | 'file';
  supplier: string;
  downloadLocation: string;
  filesAnalyzed: boolean;
  licenseConcluded: string;
  copyrightText: string;
  checksums: ChecksumInfo[];
}

export interface SBOMVulnerability {
  id: string;
  source: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvss: number;
  description: string;
  references: string[];
  affectedComponents: string[];
}

export interface ProvenanceInfo {
  builder: string;
  buildType: string;
  invocation: BuildInvocation;
  metadata: ProvenanceMetadata;
  materials: MaterialInfo[];
}

export interface BuildInvocation {
  configSource: ConfigSource;
  parameters: Map<string, any>;
  environment: Map<string, string>;
}

export interface ConfigSource {
  uri: string;
  digest: ChecksumInfo;
  entryPoint: string;
}

export interface ProvenanceMetadata {
  buildInvocationId: string;
  buildStartedOn: Date;
  buildFinishedOn: Date;
  completeness: CompletenessInfo;
  reproducible: boolean;
}

export interface CompletenessInfo {
  parameters: boolean;
  environment: boolean;
  materials: boolean;
}

export interface MaterialInfo {
  uri: string;
  digest: ChecksumInfo;
}

export interface ArtifactDependency {
  name: string;
  version: string;
  type: 'build' | 'runtime' | 'test' | 'development';
  scope: 'direct' | 'transitive';
  optional: boolean;
}

export interface ArtifactSecurity {
  signed: boolean;
  signature: SignatureInfo;
  scanResults: SecurityScanResults;
  attestations: AttestationInfo[];
}

export interface SignatureInfo {
  algorithm: string;
  keyId: string;
  signature: string;
  certificate: string;
  timestamp: Date;
}

export interface SecurityScanResults {
  scanner: string;
  version: string;
  scanTime: Date;
  vulnerabilities: VulnerabilityInfo[];
  compliance: ComplianceResults;
}

export interface VulnerabilityInfo {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  cvss: number;
  description: string;
  package: string;
  version: string;
  fixedVersion: string;
  references: string[];
}

export interface ComplianceResults {
  framework: string;
  version: string;
  passed: boolean;
  controls: ComplianceControl[];
}

export interface AttestationInfo {
  type: string;
  predicateType: string;
  subject: AttestationSubject[];
  predicate: any;
  signature: SignatureInfo;
}

export interface AttestationSubject {
  name: string;
  digest: ChecksumInfo;
}

export interface ArtifactStorage {
  location: string;
  size: number;
  compressed: boolean;
  encrypted: boolean;
  replicated: boolean;
  retention: RetentionPolicy;
}

export interface ArtifactState {
  status: ArtifactStatus;
  published: boolean;
  promoted: boolean;
  environments: string[];
  downloads: number;
  lastAccessed: Date;
}

export type ArtifactStatus = 'building' | 'built' | 'testing' | 'published' | 'promoted' | 'deprecated' | 'deleted';

// Pipeline Trigger Interfaces
export interface PipelineTrigger {
  id: string;
  name: string;
  type: TriggerType;
  configuration: TriggerConfiguration;
  conditions: TriggerCondition[];
  enabled: boolean;
  state: TriggerState;
  created: Date;
  lastUpdated: Date;
}

export type TriggerType = 
  | 'manual' 
  | 'schedule' 
  | 'webhook' 
  | 'git-push' 
  | 'git-pr' 
  | 'git-tag' 
  | 'registry-push' 
  | 'api' 
  | 'external-event';

export interface TriggerConfiguration {
  source: TriggerSource;
  filters: TriggerFilter[];
  parameters: Map<string, any>;
  timeout: number;
  concurrency: TriggerConcurrency;
}

export interface TriggerSource {
  type: string;
  url?: string;
  repository?: string;
  branch?: string;
  path?: string[];
  events?: string[];
  schedule?: string;
  webhook?: WebhookConfig;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  headers: Map<string, string>;
  ssl: boolean;
}

export interface TriggerFilter {
  type: 'branch' | 'path' | 'author' | 'message' | 'tag' | 'event';
  pattern: string;
  include: boolean;
}

export interface TriggerConcurrency {
  limit: number;
  behavior: 'queue' | 'cancel-previous' | 'skip';
}

export interface TriggerCondition {
  expression: string;
  variables: Map<string, any>;
}

export interface TriggerState {
  lastTriggered?: Date;
  triggerCount: number;
  lastResult: TriggerResult;
  active: boolean;
}

export interface TriggerResult {
  success: boolean;
  pipelineId?: string;
  message: string;
  timestamp: Date;
}

// Pipeline State and History Interfaces
export interface PipelineState {
  status: PipelineStatus;
  phase: PipelinePhase;
  currentStage?: string;
  startTime?: Date;
  endTime?: Date;
  duration: number;
  progress: PipelineProgress;
  error?: DeploymentError;
  approvals: PendingApproval[];
  notifications: NotificationStatus[];
}

export type PipelineStatus = 
  | 'created' 
  | 'queued' 
  | 'running' 
  | 'paused' 
  | 'success' 
  | 'failure' 
  | 'cancelled' 
  | 'timeout' 
  | 'waiting-approval';

export type PipelinePhase = 
  | 'initialization' 
  | 'validation' 
  | 'execution' 
  | 'cleanup' 
  | 'reporting' 
  | 'completed';

export interface PipelineProgress {
  totalStages: number;
  completedStages: number;
  failedStages: number;
  skippedStages: number;
  currentStage?: string;
  percentage: number;
  eta: number;
}

export interface PendingApproval {
  id: string;
  stage: string;
  approver: string;
  requestedAt: Date;
  timeout: Date;
  message: string;
}

export interface NotificationStatus {
  id: string;
  type: string;
  channel: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt?: Date;
  error?: string;
}

export interface DeploymentHistory {
  id: string;
  pipelineId: string;
  trigger: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: PipelineStatus;
  stages: StageHistory[];
  artifacts: string[];
  environment: string;
  version: string;
  user: string;
  commit: string;
  rollback?: RollbackInfo;
}

export interface StageHistory {
  stageId: string;
  name: string;
  status: StageStatus;
  startTime: Date;
  endTime?: Date;
  duration: number;
  logs: string;
  artifacts: string[];
  error?: DeploymentError;
}

export interface RollbackInfo {
  reason: string;
  timestamp: Date;
  user: string;
  previousVersion: string;
  success: boolean;
}

export interface DeploymentError {
  code: string;
  message: string;
  details: string;
  stage?: string;
  step?: string;
  timestamp: Date;
  recoverable: boolean;
  suggestions: string[];
}

export interface PipelineHooks {
  beforePipeline: Hook[];
  afterPipeline: Hook[];
  beforeStage: Hook[];
  afterStage: Hook[];
  onFailure: Hook[];
  onSuccess: Hook[];
  onCancel: Hook[];
  onApproval: Hook[];
}

export interface Hook {
  id: string;
  name: string;
  type: 'script' | 'webhook' | 'notification' | 'api-call';
  configuration: any;
  conditions: string[];
  enabled: boolean;
}

export interface PipelinePermissions {
  owners: string[];
  editors: string[];
  viewers: string[];
  approvers: string[];
  roles: RolePermission[];
}

export interface RolePermission {
  role: string;
  permissions: string[];
  conditions: string[];
}

export interface ArtifactInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  checksum: string;
  metadata: Map<string, any>;
}

// Manager Interface
export interface DeploymentPipelineManager {
  initialize(): Promise<void>;
  
  createPipeline(pipeline: DeploymentPipeline): Promise<void>;
  updatePipeline(pipelineId: string, pipeline: Partial<DeploymentPipeline>): Promise<void>;
  deletePipeline(pipelineId: string): Promise<void>;
  getPipeline(pipelineId: string): Promise<DeploymentPipeline | undefined>;
  listPipelines(): Promise<DeploymentPipeline[]>;
  
  triggerPipeline(pipelineId: string, trigger: string, parameters?: Map<string, any>): Promise<string>;
  cancelPipeline(executionId: string): Promise<void>;
  pausePipeline(executionId: string): Promise<void>;
  resumePipeline(executionId: string): Promise<void>;
  
  approvePipeline(approvalId: string, approved: boolean, comment?: string): Promise<void>;
  rollbackDeployment(executionId: string, targetVersion?: string): Promise<string>;
  
  getExecution(executionId: string): Promise<DeploymentHistory | undefined>;
  listExecutions(pipelineId?: string): Promise<DeploymentHistory[]>;
  
  createEnvironment(environment: DeploymentEnvironment): Promise<void>;
  updateEnvironment(envId: string, environment: Partial<DeploymentEnvironment>): Promise<void>;
  deleteEnvironment(envId: string): Promise<void>;
  getEnvironment(envId: string): Promise<DeploymentEnvironment | undefined>;
  listEnvironments(): Promise<DeploymentEnvironment[]>;
  
  createArtifact(artifact: BuildArtifact): Promise<void>;
  publishArtifact(artifactId: string): Promise<void>;
  promoteArtifact(artifactId: string, environment: string): Promise<void>;
  getArtifact(artifactId: string): Promise<BuildArtifact | undefined>;
  listArtifacts(): Promise<BuildArtifact[]>;
  
  getHealth(): Promise<any>;
  getMetrics(): Promise<any>;
  
  shutdown(): Promise<void>;
}