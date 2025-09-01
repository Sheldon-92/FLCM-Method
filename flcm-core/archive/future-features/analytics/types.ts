/**
 * Analytics System Types
 */

export interface MetricPoint {
  timestamp: Date;
  value: number;
  labels?: Record<string, string>;
}

export interface TimeSeries {
  name: string;
  points: MetricPoint[];
  tags?: Record<string, string>;
}

export interface UsageMetrics {
  version: '1.0' | '2.0';
  requests: number;
  unique_users: Set<string>;
  operations: Map<string, number>;
  timestamp: Date;
}

export interface ErrorMetrics {
  version: '1.0' | '2.0';
  total_errors: number;
  error_rate: number;
  errors_by_category: Map<string, number>;
  error_patterns: ErrorPattern[];
  timestamp: Date;
}

export interface ErrorPattern {
  pattern: string;
  count: number;
  first_seen: Date;
  last_seen: Date;
  affected_users: Set<string>;
}

export interface PerformanceMetrics {
  version: '1.0' | '2.0';
  operation: string;
  p50: number;
  p95: number;
  p99: number;
  avg: number;
  min: number;
  max: number;
  sample_count: number;
  timestamp: Date;
}

export interface SatisfactionMetrics {
  version: '1.0' | '2.0';
  nps_score: number;
  satisfaction_rating: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  feedback_count: number;
  timestamp: Date;
}

export interface MigrationMetrics {
  total_users: number;
  v1_users: number;
  v2_users: number;
  adoption_rate: number;
  migration_velocity: number; // users/day moving to v2
  estimated_completion: Date | null;
  timestamp: Date;
}

export interface DashboardPanel {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'heatmap' | 'table';
  title: string;
  metrics: string[];
  refresh_interval?: number;
  options?: Record<string, any>;
}

export interface Alert {
  id: string;
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  channels: string[];
  cooldown?: number;
  enabled: boolean;
}

export interface AlertEvent {
  alert: Alert;
  triggered_at: Date;
  resolved_at?: Date;
  value: number;
  message: string;
}

export interface MetricCollector {
  name: string;
  collect(): Promise<Record<string, any>>;
  reset(): void;
}