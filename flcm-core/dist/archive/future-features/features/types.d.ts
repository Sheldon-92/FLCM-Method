/**
 * Feature Flag System Types
 */
export interface FeatureFlag {
    name: string;
    description: string;
    default: boolean;
    enabled?: boolean;
    rollout?: RolloutConfig;
    conditions?: FlagCondition[];
    dependencies?: string[];
    variants?: FlagVariant[];
    error_threshold?: ErrorThreshold;
    metadata?: Record<string, any>;
}
export interface RolloutConfig {
    percentage: number;
    cohorts?: Record<string, boolean>;
    start_date?: Date;
    end_date?: Date;
}
export interface FlagCondition {
    attribute: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
    value: any;
    negate?: boolean;
}
export interface FlagVariant {
    name: string;
    weight: number;
    payload?: any;
}
export interface ErrorThreshold {
    rate: number;
    window: number;
    min_samples?: number;
}
export interface UserContext {
    user_id: string;
    cohorts?: string[];
    attributes?: Record<string, any>;
    session_id?: string;
    timestamp?: Date;
}
export interface EvaluationResult {
    enabled: boolean;
    variant?: string;
    reason: string;
    flag_name: string;
    user_id: string;
    timestamp: Date;
}
export interface Cohort {
    name: string;
    description?: string;
    members: Set<string>;
    rules?: CohortRule[];
    created_at: Date;
    updated_at: Date;
}
export interface CohortRule {
    attribute: string;
    operator: string;
    value: any;
}
export interface FeatureMetrics {
    flag_name: string;
    usage_count: number;
    enabled_count: number;
    disabled_count: number;
    error_count: number;
    unique_users: Set<string>;
    performance_samples: PerformanceSample[];
    error_rate: number;
    last_updated: Date;
}
export interface PerformanceSample {
    timestamp: Date;
    duration: number;
    user_id: string;
    success: boolean;
}
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export interface CircuitBreakerConfig {
    error_threshold: number;
    success_threshold: number;
    timeout: number;
    half_open_requests: number;
}
export interface RemoteConfig {
    flags: Record<string, FeatureFlag>;
    cohorts?: Record<string, string[]>;
    last_modified: string;
    version: string;
}
