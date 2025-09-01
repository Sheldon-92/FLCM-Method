/**
 * Adaptive Content Difficulty Engine Types
 * Type definitions for dynamic content difficulty adjustment system
 */
export interface DifficultyProfile {
    userId: string;
    domain: string;
    subdomain?: string;
    currentLevel: number;
    masteryLevel: number;
    confidenceLevel: number;
    learningVelocity: number;
    optimalChallenge: number;
    frustrationThreshold: number;
    comfortZoneLimit: number;
    skillMap: SkillAssessment[];
    adaptationHistory: DifficultyAdjustment[];
    lastAssessment: Date;
    nextRecommendedAssessment: Date;
    created: Date;
    lastUpdated: Date;
}
export interface SkillAssessment {
    skill: string;
    level: number;
    confidence: number;
    lastTested: Date;
    evidence: AssessmentEvidence[];
    prerequisites: string[];
    dependents: string[];
    trends: SkillTrend[];
}
export interface AssessmentEvidence {
    type: 'performance' | 'time_taken' | 'help_requests' | 'errors' | 'self_report';
    value: number;
    context: string;
    timestamp: Date;
    weight: number;
}
export interface SkillTrend {
    direction: 'improving' | 'declining' | 'stable';
    rate: number;
    confidence: number;
    timeWindow: number;
    startDate: Date;
    endDate: Date;
}
export interface DifficultyAdjustment {
    id: string;
    contentId: string;
    fromDifficulty: number;
    toDifficulty: number;
    reason: AdjustmentReason;
    trigger: AdjustmentTrigger;
    timestamp: Date;
    effectiveness: number;
    userFeedback?: UserFeedback;
    automaticAdjustment: boolean;
    contextFactors: ContextFactor[];
}
export interface AdjustmentReason {
    primary: string;
    secondary?: string[];
    confidence: number;
    evidence: string[];
    algorithm: string;
}
export interface AdjustmentTrigger {
    type: 'performance_based' | 'time_based' | 'frustration_detected' | 'mastery_achieved' | 'user_request' | 'context_change';
    threshold?: number;
    duration?: number;
    conditions: TriggerCondition[];
}
export interface TriggerCondition {
    metric: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'between' | 'trending';
    value: number | number[];
    timeWindow?: number;
}
export interface UserFeedback {
    rating: number;
    tooEasy: boolean;
    tooHard: boolean;
    justRight: boolean;
    comments?: string;
    timestamp: Date;
}
export interface ContextFactor {
    name: string;
    value: any;
    impact: number;
    confidence: number;
}
export interface ContentDifficulty {
    contentId: string;
    baseDifficulty: number;
    adaptedDifficulty: number;
    difficultyFactors: DifficultyFactor[];
    scalabilityOptions: ScalabilityOption[];
    adaptationMethods: AdaptationMethod[];
    prerequisites: PrerequisiteCheck[];
    learningObjectives: LearningObjective[];
    assessmentCriteria: AssessmentCriterion[];
    metadata: ContentMetadata;
}
export interface DifficultyFactor {
    name: string;
    type: 'cognitive_load' | 'complexity' | 'abstraction' | 'prerequisite_depth' | 'problem_solving';
    value: number;
    weight: number;
    adjustable: boolean;
    description: string;
}
export interface ScalabilityOption {
    name: string;
    type: 'content_modification' | 'scaffolding' | 'complexity_reduction' | 'pacing_adjustment' | 'support_addition';
    difficultyRange: [number, number];
    implementation: ScalabilityImplementation;
    effectiveness: number;
    cost: number;
}
export interface ScalabilityImplementation {
    method: string;
    parameters: Record<string, any>;
    resources: string[];
    limitations: string[];
    examples: ImplementationExample[];
}
export interface ImplementationExample {
    originalContent: string;
    scaledContent: string;
    difficultyChange: number;
    description: string;
}
export interface AdaptationMethod {
    id: string;
    name: string;
    type: 'real_time' | 'between_sessions' | 'progressive' | 'immediate';
    triggers: AdaptationTrigger[];
    algorithms: AdaptationAlgorithm[];
    constraints: AdaptationConstraint[];
    rollbackCapable: boolean;
    userNotification: boolean;
}
export interface AdaptationTrigger {
    name: string;
    condition: string;
    priority: number;
    cooldownPeriod: number;
    confidence: number;
}
export interface AdaptationAlgorithm {
    name: string;
    type: 'rule_based' | 'ml_model' | 'collaborative_filtering' | 'optimization' | 'hybrid';
    implementation: string;
    parameters: Record<string, any>;
    accuracy: number;
    speed: number;
    explainability: number;
}
export interface AdaptationConstraint {
    type: 'min_difficulty' | 'max_difficulty' | 'change_rate' | 'stability_period' | 'user_preference';
    value: any;
    hard: boolean;
    reason: string;
}
export interface PrerequisiteCheck {
    skill: string;
    required: boolean;
    level: number;
    alternatives: string[];
    assessmentMethod: string;
    bypassable: boolean;
}
export interface LearningObjective {
    id: string;
    description: string;
    difficulty: number;
    bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    estimatedTime: number;
    prerequisites: string[];
    successCriteria: SuccessCriterion[];
    adaptable: boolean;
}
export interface SuccessCriterion {
    description: string;
    measurable: boolean;
    threshold: number;
    weight: number;
    assessmentMethod: string;
}
export interface AssessmentCriterion {
    id: string;
    name: string;
    type: 'formative' | 'summative' | 'diagnostic' | 'continuous';
    metric: string;
    threshold: number;
    weight: number;
    frequency: AssessmentFrequency;
    adaptationSensitivity: number;
}
export interface AssessmentFrequency {
    type: 'continuous' | 'interval' | 'milestone' | 'on_demand';
    interval?: number;
    conditions?: string[];
}
export interface ContentMetadata {
    subject: string;
    topic: string;
    subtopic?: string;
    framework: string;
    contentType: 'exercise' | 'explanation' | 'example' | 'assessment' | 'project';
    estimatedTime: number;
    cognitiveLoad: 'low' | 'medium' | 'high';
    interactivity: 'passive' | 'active' | 'interactive';
    mediaTypes: string[];
    accessibility: AccessibilityFeatures;
    qualityMetrics: QualityMetrics;
    usageStatistics: UsageStatistics;
}
export interface AccessibilityFeatures {
    visualImpaired: boolean;
    hearingImpaired: boolean;
    motorImpaired: boolean;
    cognitiveImpaired: boolean;
    alternativeFormats: string[];
    supportTools: string[];
}
export interface QualityMetrics {
    clarity: number;
    accuracy: number;
    engagement: number;
    pedagogicalEffectiveness: number;
    technicalQuality: number;
    lastReviewed: Date;
    reviewerRatings: number[];
}
export interface UsageStatistics {
    totalUsages: number;
    averageCompletionRate: number;
    averageTimeSpent: number;
    averageDifficultyRating: number;
    successRate: number;
    adaptationFrequency: number;
    userSatisfaction: number;
    lastUsed: Date;
}
export interface AdaptationSession {
    id: string;
    userId: string;
    contentId: string;
    startTime: Date;
    endTime?: Date;
    initialDifficulty: number;
    finalDifficulty: number;
    adaptations: SessionAdaptation[];
    performance: PerformanceMetrics;
    engagement: EngagementMetrics;
    feedback: SessionFeedback;
    context: SessionContext;
    outcomes: SessionOutcome[];
}
export interface SessionAdaptation {
    timestamp: Date;
    fromDifficulty: number;
    toDifficulty: number;
    trigger: string;
    method: string;
    reason: string;
    userNotified: boolean;
    userResponse?: 'accepted' | 'rejected' | 'no_response';
}
export interface PerformanceMetrics {
    accuracyRate: number;
    completionRate: number;
    timeEfficiency: number;
    helpRequestFrequency: number;
    errorRate: number;
    retryRate: number;
    progressRate: number;
    qualityScore: number;
}
export interface EngagementMetrics {
    sessionDuration: number;
    activeTime: number;
    attentionScore: number;
    motivationIndicators: MotivationIndicator[];
    flowStateIndicators: FlowStateIndicator[];
    frustrationLevel: number;
    confidenceLevel: number;
}
export interface MotivationIndicator {
    type: 'task_persistence' | 'effort_level' | 'choice_autonomy' | 'goal_orientation';
    value: number;
    confidence: number;
    evidence: string[];
}
export interface FlowStateIndicator {
    type: 'challenge_skill_balance' | 'clear_goals' | 'immediate_feedback' | 'deep_concentration';
    value: number;
    duration: number;
    transitions: FlowTransition[];
}
export interface FlowTransition {
    from: 'anxiety' | 'worry' | 'apathy' | 'boredom' | 'relaxation' | 'control' | 'arousal' | 'flow';
    to: 'anxiety' | 'worry' | 'apathy' | 'boredom' | 'relaxation' | 'control' | 'arousal' | 'flow';
    timestamp: Date;
    trigger: string;
}
export interface SessionFeedback {
    difficultyRating: number;
    enjoymentRating: number;
    learningRating: number;
    paceRating: number;
    supportRating: number;
    overallSatisfaction: number;
    improvements: string[];
    wouldRecommend: boolean;
    comments?: string;
    timestamp: Date;
}
export interface SessionContext {
    timeOfDay: string;
    dayOfWeek: string;
    sessionNumber: number;
    previousSessionGap: number;
    deviceType: string;
    networkQuality: string;
    environmentalFactors: EnvironmentalFactor[];
    userMoodIndicators: MoodIndicator[];
    externalPressures: ExternalPressure[];
}
export interface EnvironmentalFactor {
    type: 'location' | 'noise_level' | 'interruptions' | 'lighting' | 'temperature';
    value: any;
    impact: number;
}
export interface MoodIndicator {
    type: 'energy_level' | 'stress_level' | 'confidence' | 'motivation' | 'focus';
    value: number;
    source: 'self_report' | 'behavioral_inference' | 'physiological_measure';
    reliability: number;
}
export interface ExternalPressure {
    type: 'deadline' | 'performance_expectation' | 'social_pressure' | 'resource_constraint';
    severity: number;
    description: string;
    timeframe: string;
}
export interface SessionOutcome {
    type: 'objective_achieved' | 'skill_improved' | 'insight_gained' | 'challenge_overcome' | 'support_needed';
    description: string;
    evidence: string[];
    impact: number;
    transferable: boolean;
}
export interface DifficultyEngine {
    assessUserLevel(userId: string, domain: string, content?: any[]): Promise<DifficultyProfile>;
    adaptContent(contentId: string, userId: string, context?: any): Promise<ContentDifficulty>;
    trackSession(session: AdaptationSession): Promise<void>;
    predictOptimalDifficulty(userId: string, contentId: string, context?: any): Promise<number>;
    explainAdaptation(adaptationId: string): Promise<AdaptationExplanation>;
    calibrateSystem(userId: string, assessmentResults: AssessmentResult[]): Promise<DifficultyProfile>;
    generateRecommendations(userId: string, domain: string): Promise<DifficultyRecommendation[]>;
}
export interface AdaptationExplanation {
    adaptationId: string;
    decision: string;
    reasoning: string[];
    factors: ExplanationFactor[];
    alternatives: AlternativeExplanation[];
    confidence: number;
    userActionable: boolean;
    evidenceLevel: 'low' | 'medium' | 'high';
}
export interface ExplanationFactor {
    name: string;
    type: 'user_performance' | 'content_difficulty' | 'context' | 'historical_pattern' | 'algorithm_decision';
    contribution: number;
    explanation: string;
    dataPoints: string[];
}
export interface AlternativeExplanation {
    decision: string;
    reason: string;
    confidence: number;
    tradeoffs: string[];
}
export interface AssessmentResult {
    skill: string;
    level: number;
    confidence: number;
    evidence: AssessmentEvidence[];
    context: string;
    timestamp: Date;
}
export interface DifficultyRecommendation {
    type: 'content_suggestion' | 'difficulty_adjustment' | 'learning_path' | 'skill_focus' | 'pacing_change';
    title: string;
    description: string;
    rationale: string[];
    expectedBenefit: string;
    priority: number;
    effort: 'low' | 'medium' | 'high';
    timeframe: string;
    prerequisites: string[];
    successMetrics: string[];
    alternatives: string[];
}
export interface AdaptationModel {
    id: string;
    name: string;
    version: string;
    type: 'neural_network' | 'decision_tree' | 'bayesian' | 'reinforcement_learning' | 'hybrid';
    domain: string;
    accuracy: number;
    precision: number;
    recall: number;
    explainability: number;
    speed: number;
    features: ModelFeature[];
    hyperparameters: Record<string, any>;
    trainingData: TrainingDataInfo;
    validationResults: ValidationResults;
    deploymentInfo: DeploymentInfo;
    lastUpdated: Date;
}
export interface ModelFeature {
    name: string;
    type: 'numerical' | 'categorical' | 'binary' | 'text' | 'time_series';
    importance: number;
    description: string;
    preprocessing: string;
}
export interface TrainingDataInfo {
    sampleCount: number;
    timeRange: {
        start: Date;
        end: Date;
    };
    sources: string[];
    qualityScore: number;
    biasAnalysis: BiasAnalysis;
    lastUpdated: Date;
}
export interface BiasAnalysis {
    demographicBias: number;
    performanceBias: number;
    contentBias: number;
    temporalBias: number;
    mitigationStrategies: string[];
}
export interface ValidationResults {
    crossValidation: number;
    holdoutValidation: number;
    temporalValidation: number;
    diversityValidation: number;
    adversarialTesting: number;
    confusionMatrix?: number[][];
    featureImportances: Record<string, number>;
}
export interface DeploymentInfo {
    environment: 'development' | 'staging' | 'production';
    region: string;
    scalingInfo: ScalingInfo;
    monitoringSetup: MonitoringSetup;
    rollbackPlan: RollbackPlan;
    performanceRequirements: PerformanceRequirements;
}
export interface ScalingInfo {
    maxConcurrentUsers: number;
    averageResponseTime: number;
    resourceUsage: ResourceUsage;
    autoScaling: boolean;
}
export interface ResourceUsage {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
}
export interface MonitoringSetup {
    metricsTracked: string[];
    alertThresholds: Record<string, number>;
    dashboardUrl?: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export interface RollbackPlan {
    triggerConditions: string[];
    rollbackDuration: number;
    fallbackModel: string;
    dataRetention: number;
}
export interface PerformanceRequirements {
    maxLatency: number;
    minThroughput: number;
    maxErrorRate: number;
    availabilityTarget: number;
}
