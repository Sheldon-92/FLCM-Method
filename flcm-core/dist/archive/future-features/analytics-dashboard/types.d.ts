/**
 * Advanced Analytics Dashboard Types
 * Type definitions for comprehensive learning analytics dashboard
 */
/// <reference types="node" />
/// <reference types="node" />
export interface DashboardConfig {
    userId: string;
    theme: 'light' | 'dark' | 'auto';
    layout: 'compact' | 'detailed' | 'executive';
    refreshInterval: number;
    timeZone: string;
    dateRange: DateRange;
    widgets: WidgetConfig[];
    filters: DashboardFilter[];
    personalizations: DashboardPersonalization[];
    exportSettings: ExportSettings;
    notifications: NotificationSettings;
    created: Date;
    lastUpdated: Date;
}
export interface DateRange {
    start: Date;
    end: Date;
    preset?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';
}
export interface WidgetConfig {
    id: string;
    type: WidgetType;
    title: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    dataSource: string;
    refreshRate: number;
    filters: WidgetFilter[];
    visualizations: VisualizationConfig[];
    interactions: InteractionConfig[];
    visible: boolean;
    minimized: boolean;
    customizations: Record<string, any>;
}
export type WidgetType = 'overview_metrics' | 'learning_progress' | 'framework_performance' | 'time_analytics' | 'goal_tracking' | 'insight_depth' | 'content_quality' | 'engagement_trends' | 'predictive_insights' | 'comparative_analysis' | 'collaboration_metrics' | 'personalization_effectiveness' | 'custom_metric';
export interface VisualizationConfig {
    type: VisualizationType;
    title?: string;
    xAxis?: AxisConfig;
    yAxis?: AxisConfig;
    series: SeriesConfig[];
    styling: ChartStyling;
    interactions: ChartInteraction[];
    annotations?: Annotation[];
}
export type VisualizationType = 'line_chart' | 'bar_chart' | 'area_chart' | 'scatter_plot' | 'bubble_chart' | 'heatmap' | 'treemap' | 'sankey_diagram' | 'radar_chart' | 'gauge' | 'progress_bar' | 'metric_card' | 'table' | 'calendar' | 'network_graph' | 'funnel_chart';
export interface AxisConfig {
    title: string;
    type: 'linear' | 'logarithmic' | 'category' | 'datetime';
    min?: number;
    max?: number;
    unit?: string;
    format?: string;
}
export interface SeriesConfig {
    name: string;
    data: DataPoint[];
    color?: string;
    type?: string;
    yAxisIndex?: number;
    stack?: string;
    smooth?: boolean;
    showSymbol?: boolean;
}
export interface DataPoint {
    x: any;
    y: any;
    z?: any;
    name?: string;
    category?: string;
    metadata?: Record<string, any>;
}
export interface ChartStyling {
    colorPalette: string[];
    backgroundColor?: string;
    gridColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    borderWidth?: number;
    borderColor?: string;
    opacity?: number;
    animation?: boolean;
}
export interface ChartInteraction {
    type: 'click' | 'hover' | 'zoom' | 'brush' | 'legend_click';
    enabled: boolean;
    action?: string;
    parameters?: Record<string, any>;
}
export interface Annotation {
    type: 'line' | 'point' | 'area' | 'text';
    content: string;
    position: {
        x: any;
        y: any;
    };
    styling?: Partial<ChartStyling>;
}
export interface WidgetFilter {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between' | 'in';
    value: any;
    active: boolean;
}
export interface InteractionConfig {
    type: 'drill_down' | 'filter' | 'highlight' | 'tooltip' | 'export';
    trigger: 'click' | 'hover' | 'double_click' | 'right_click';
    action: string;
    parameters?: Record<string, any>;
}
export interface DashboardFilter {
    id: string;
    name: string;
    type: 'date_range' | 'framework' | 'difficulty' | 'category' | 'user_segment';
    values: FilterValue[];
    multiSelect: boolean;
    global: boolean;
    visible: boolean;
}
export interface FilterValue {
    value: any;
    label: string;
    selected: boolean;
    count?: number;
}
export interface DashboardPersonalization {
    type: 'layout' | 'content' | 'styling' | 'behavior';
    key: string;
    value: any;
    confidence: number;
    source: 'user' | 'ai' | 'admin';
    timestamp: Date;
}
export interface ExportSettings {
    formats: ExportFormat[];
    defaultFormat: ExportFormat;
    includeRawData: boolean;
    includeVisualizations: boolean;
    watermark?: string;
    compression: boolean;
    encryption: boolean;
}
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'png' | 'svg' | 'html';
export interface NotificationSettings {
    enabled: boolean;
    channels: NotificationChannel[];
    triggers: NotificationTrigger[];
    frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
    quietHours?: {
        start: string;
        end: string;
    };
}
export interface NotificationChannel {
    type: 'in_app' | 'email' | 'push' | 'slack' | 'webhook';
    enabled: boolean;
    config: Record<string, any>;
}
export interface NotificationTrigger {
    id: string;
    name: string;
    condition: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    enabled: boolean;
}
export interface DashboardData {
    timestamp: Date;
    metrics: MetricData[];
    trends: TrendData[];
    comparisons: ComparisonData[];
    insights: InsightData[];
    predictions: PredictionData[];
    alerts: AlertData[];
    metadata: DashboardMetadata;
}
export interface MetricData {
    id: string;
    name: string;
    value: number;
    unit?: string;
    change?: number;
    changeDirection?: 'up' | 'down' | 'stable';
    benchmark?: number;
    target?: number;
    category: string;
    priority: number;
    context: Record<string, any>;
    historicalValues?: TimeSeriesPoint[];
}
export interface TimeSeriesPoint {
    timestamp: Date;
    value: number;
    metadata?: Record<string, any>;
}
export interface TrendData {
    id: string;
    name: string;
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    strength: number;
    confidence: number;
    duration: number;
    projection: TimeSeriesPoint[];
    breakpoints: TrendBreakpoint[];
    seasonality?: SeasonalPattern[];
}
export interface TrendBreakpoint {
    timestamp: Date;
    type: 'acceleration' | 'deceleration' | 'reversal' | 'plateau';
    magnitude: number;
    confidence: number;
    cause?: string;
}
export interface SeasonalPattern {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    strength: number;
    phase: number;
    components: number[];
}
export interface ComparisonData {
    id: string;
    name: string;
    baseline: ComparisonItem;
    comparisons: ComparisonItem[];
    type: 'cohort' | 'time_period' | 'segment' | 'goal';
    insights: string[];
}
export interface ComparisonItem {
    name: string;
    value: number;
    metadata: Record<string, any>;
    confidenceInterval?: [number, number];
}
export interface InsightData {
    id: string;
    type: 'discovery' | 'anomaly' | 'pattern' | 'correlation' | 'recommendation';
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'critical';
    confidence: number;
    impact: number;
    actionable: boolean;
    actions?: RecommendedAction[];
    evidence: InsightEvidence[];
    tags: string[];
    created: Date;
}
export interface RecommendedAction {
    title: string;
    description: string;
    priority: number;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    timeline: string;
    dependencies?: string[];
}
export interface InsightEvidence {
    type: 'statistical' | 'visual' | 'historical' | 'comparative';
    description: string;
    data: any;
    confidence: number;
}
export interface PredictionData {
    id: string;
    name: string;
    type: 'forecast' | 'classification' | 'anomaly_detection' | 'optimization';
    predictions: PredictionItem[];
    model: PredictionModel;
    accuracy: number;
    confidence: number;
    timeHorizon: number;
    updateFrequency: string;
}
export interface PredictionItem {
    timestamp: Date;
    value: number;
    confidenceInterval: [number, number];
    probability?: number;
    factors: PredictionFactor[];
}
export interface PredictionFactor {
    name: string;
    importance: number;
    direction: 'positive' | 'negative' | 'neutral';
    confidence: number;
}
export interface PredictionModel {
    name: string;
    type: string;
    version: string;
    accuracy: number;
    precision: number;
    recall: number;
    features: string[];
    hyperparameters: Record<string, any>;
    trainingDate: Date;
    lastUpdated: Date;
}
export interface AlertData {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'performance' | 'engagement' | 'system' | 'goal' | 'prediction';
    threshold: AlertThreshold;
    currentValue: number;
    trend: 'improving' | 'worsening' | 'stable';
    actions: string[];
    acknowledged: boolean;
    resolvedAt?: Date;
    created: Date;
}
export interface AlertThreshold {
    type: 'absolute' | 'percentage' | 'standard_deviation' | 'percentile';
    value: number;
    direction: 'above' | 'below';
    timeWindow?: number;
    consecutivePoints?: number;
}
export interface DashboardMetadata {
    generatedAt: Date;
    dataFreshness: Date;
    coverage: DataCoverage;
    quality: DataQuality;
    sources: DataSource[];
    processing: ProcessingInfo;
}
export interface DataCoverage {
    totalSessions: number;
    dateRange: DateRange;
    frameworks: string[];
    users: number;
    completeness: number;
}
export interface DataQuality {
    accuracy: number;
    consistency: number;
    timeliness: number;
    issues: DataQualityIssue[];
}
export interface DataQualityIssue {
    type: 'missing_data' | 'inconsistent_data' | 'outdated_data' | 'anomaly';
    description: string;
    impact: 'low' | 'medium' | 'high';
    affectedMetrics: string[];
    suggestion: string;
}
export interface DataSource {
    name: string;
    type: string;
    lastUpdated: Date;
    recordCount: number;
    health: 'healthy' | 'warning' | 'error';
}
export interface ProcessingInfo {
    totalProcessingTime: number;
    cacheHitRate: number;
    queryCount: number;
    memoryUsage: number;
    errors: string[];
}
export interface AnalyticsDashboard {
    generateDashboard(config: DashboardConfig, context?: AnalyticsContext): Promise<DashboardData>;
    updateWidget(dashboardId: string, widgetId: string, config: Partial<WidgetConfig>): Promise<WidgetData>;
    exportDashboard(dashboardId: string, format: ExportFormat, options?: ExportOptions): Promise<ExportResult>;
    subscribeToUpdates(dashboardId: string, callback: (data: DashboardData) => void): Promise<string>;
}
export interface AnalyticsContext {
    userId: string;
    role: 'learner' | 'educator' | 'admin' | 'analyst';
    permissions: string[];
    preferences: DashboardPersonalization[];
    currentSession?: {
        startTime: Date;
        context: Record<string, any>;
    };
}
export interface WidgetData {
    id: string;
    type: WidgetType;
    data: any;
    metadata: {
        lastUpdated: Date;
        dataPoints: number;
        processingTime: number;
        errors?: string[];
    };
}
export interface ExportOptions {
    includeRawData?: boolean;
    compression?: boolean;
    encryption?: boolean;
    watermark?: string;
    customization?: Record<string, any>;
}
export interface ExportResult {
    format: ExportFormat;
    url?: string;
    data?: Buffer;
    metadata: {
        size: number;
        generatedAt: Date;
        expiresAt?: Date;
    };
}
export interface RealtimeUpdate {
    type: 'metric_update' | 'alert' | 'insight' | 'prediction' | 'system';
    widgetId?: string;
    data: any;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high';
}
export interface DashboardTemplate {
    id: string;
    name: string;
    description: string;
    category: 'learner' | 'educator' | 'admin' | 'custom';
    widgets: WidgetConfig[];
    layout: string;
    targetAudience: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    usage: {
        installs: number;
        rating: number;
        reviews: number;
    };
    author: {
        name: string;
        type: 'community' | 'official';
    };
    version: string;
    created: Date;
    lastUpdated: Date;
}
export interface CustomMetric {
    id: string;
    name: string;
    description: string;
    formula: string;
    category: string;
    unit?: string;
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'distinct_count';
    timeframe: 'session' | 'day' | 'week' | 'month' | 'all_time';
    dimensions: string[];
    filters: WidgetFilter[];
    validation: MetricValidation;
    created: Date;
    createdBy: string;
}
export interface MetricValidation {
    minValue?: number;
    maxValue?: number;
    expectedRange?: [number, number];
    dataType: 'number' | 'percentage' | 'duration' | 'count' | 'rate';
    nullHandling: 'ignore' | 'zero' | 'error';
}
export interface AnalyticsQuery {
    metrics: string[];
    dimensions?: string[];
    filters?: QueryFilter[];
    dateRange: DateRange;
    groupBy?: string[];
    orderBy?: OrderBy[];
    limit?: number;
    offset?: number;
}
export interface QueryFilter {
    field: string;
    operator: string;
    value: any;
    logic?: 'AND' | 'OR';
}
export interface OrderBy {
    field: string;
    direction: 'asc' | 'desc';
}
export interface QueryResult {
    data: QueryRow[];
    metadata: {
        totalRows: number;
        processingTime: number;
        cached: boolean;
        query: AnalyticsQuery;
        generatedAt: Date;
    };
}
export interface QueryRow {
    [key: string]: any;
}
