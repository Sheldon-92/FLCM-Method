/**
 * Learning Progress Tracker Types
 */
export interface LearningMetrics {
    userId: string;
    timeRange: DateRange;
    frameworks: FrameworkUsage[];
    insights: InsightProgression;
    content: ContentQuality;
    velocity: LearningVelocity;
    milestones: Milestone[];
}
export interface DateRange {
    start: Date;
    end: Date;
}
export interface LearningSession {
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    framework: string;
    duration: number;
    insights: Insight[];
    content: Content;
    completedSteps: number;
    totalSteps: number;
    metadata: {
        layer: 'mentor' | 'creator' | 'publisher';
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        topic: string[];
        goals: string[];
    };
}
export interface FrameworkUsage {
    name: string;
    usageCount: number;
    totalTime: number;
    avgCompletionRate: number;
    avgInsightDepth: number;
    avgQualityScore: number;
    effectiveness: number;
    preferredTimes: string[];
    successRate: number;
    lastUsed: Date;
}
export interface Insight {
    id: string;
    content: string;
    created: Date;
    depth: number;
    level: InsightLevel;
    connections: string[];
    evidence: Evidence[];
    synthesis: SynthesisInfo;
    tags: string[];
    framework: string;
}
export interface InsightLevel {
    level: number;
    name: 'Surface' | 'Shallow' | 'Moderate' | 'Deep' | 'Profound';
    minScore: number;
}
export interface Evidence {
    type: 'source' | 'example' | 'data' | 'observation';
    content: string;
    reliability: number;
}
export interface SynthesisInfo {
    originalityScore: number;
    integrationScore: number;
    creativityScore: number;
}
export interface InsightProgression {
    timeline: ProgressionPoint[];
    trend: TrendData;
    breakthroughs: Breakthrough[];
    currentLevel: number;
    averageDepth: number;
    depthDistribution: Record<string, number>;
}
export interface ProgressionPoint {
    timestamp: Date;
    depth: number;
    level: InsightLevel;
    framework: string;
    topic: string[];
}
export interface Breakthrough {
    timestamp: Date;
    level: number;
    previousLevel: number;
    trigger: string;
    impact: number;
}
export interface Content {
    id: string;
    text: string;
    wordCount: number;
    structure: ContentStructure;
    sources: Source[];
    style: WritingStyle;
    created: Date;
    revised: number;
}
export interface ContentStructure {
    hasIntroduction: boolean;
    hasConclusion: boolean;
    paragraphCount: number;
    headerCount: number;
    listCount: number;
    logicalFlow: number;
}
export interface Source {
    type: 'book' | 'article' | 'video' | 'personal' | 'other';
    title: string;
    author?: string;
    reliability: number;
    relevance: number;
}
export interface WritingStyle {
    tone: 'formal' | 'casual' | 'academic' | 'conversational';
    clarity: number;
    engagement: number;
    complexity: number;
}
export interface ContentQuality {
    score: number;
    metrics: QualityMetrics;
    strengths: string[];
    improvements: string[];
    trend: TrendData;
}
export interface QualityMetrics {
    clarity: number;
    coherence: number;
    originality: number;
    evidence: number;
    engagement: number;
    completeness: number;
}
export interface TrendData {
    direction: 'improving' | 'declining' | 'stable';
    strength: number;
    rate: number;
    r2: number;
}
export interface LearningVelocity {
    current: VelocityPoint;
    historical: VelocityPoint[];
    trend: TrendData;
    acceleration: number;
    prediction: VelocityPrediction;
}
export interface VelocityPoint {
    period: Date;
    insightsPerHour: number;
    frameworksCompleted: number;
    depthProgression: number;
    contentProduced: number;
    qualityImprovement: number;
}
export interface VelocityPrediction {
    nextWeek: VelocityPoint;
    nextMonth: VelocityPoint;
    milestoneETA: Date | null;
    confidence: number;
}
export interface Milestone {
    id: string;
    name: string;
    description: string;
    category: 'depth' | 'quantity' | 'quality' | 'consistency' | 'framework';
    requirement: MilestoneRequirement;
    achieved: boolean;
    achievedDate?: Date;
    progress: number;
}
export interface MilestoneRequirement {
    type: 'threshold' | 'streak' | 'total' | 'improvement';
    metric: string;
    value: number;
    timeframe?: string;
}
export interface Dashboard {
    summary: DashboardSummary;
    frameworkStats: FrameworkUsage[];
    progressionChart: ChartData;
    velocityGauge: GaugeData;
    qualityTrend: ChartData;
    achievements: Achievement[];
    recommendations: Recommendation[];
}
export interface DashboardSummary {
    totalSessions: number;
    totalTime: number;
    averageSessionLength: number;
    insightsCreated: number;
    frameworksUsed: number;
    currentStreak: number;
    overallProgress: number;
}
export interface ChartData {
    type: 'line' | 'bar' | 'area' | 'scatter';
    data: ChartPoint[];
    labels: string[];
    title: string;
    xAxis: string;
    yAxis: string;
}
export interface ChartPoint {
    x: number | Date;
    y: number;
    label?: string;
    color?: string;
}
export interface GaugeData {
    current: number;
    min: number;
    max: number;
    target?: number;
    unit: string;
    label: string;
}
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    date: Date;
    category: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}
export interface Recommendation {
    type: 'framework' | 'timing' | 'focus' | 'improvement';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    actionable: boolean;
    estimatedImpact: number;
}
export interface Report {
    title: string;
    period: DateRange;
    generatedAt: Date;
    highlights: string[];
    metrics: ReportMetrics;
    insights: ReportInsight[];
    recommendations: Recommendation[];
    exportFormat?: 'pdf' | 'html' | 'json' | 'csv';
}
export interface ReportMetrics {
    frameworkUsage: FrameworkUsage[];
    insightProgression: ProgressionPoint[];
    contentQuality: QualityMetrics;
    timeInvested: number;
    goalsProgress: GoalProgress[];
}
export interface GoalProgress {
    goal: string;
    target: number;
    current: number;
    progress: number;
    onTrack: boolean;
}
export interface ReportInsight {
    category: string;
    finding: string;
    evidence: string;
    implication: string;
}
export interface AnalyticsExport {
    format: 'csv' | 'json' | 'xlsx';
    data: any;
    filename: string;
    generatedAt: Date;
}
export interface LearningGoal {
    id: string;
    title: string;
    description: string;
    category: 'skill' | 'knowledge' | 'habit' | 'milestone';
    target: GoalTarget;
    deadline?: Date;
    priority: 'low' | 'medium' | 'high';
    status: 'active' | 'completed' | 'paused' | 'cancelled';
    progress: number;
    milestones: GoalMilestone[];
}
export interface GoalTarget {
    metric: string;
    value: number;
    unit: string;
    timeframe: string;
}
export interface GoalMilestone {
    name: string;
    target: number;
    completed: boolean;
    completedDate?: Date;
}
