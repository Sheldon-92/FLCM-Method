/**
 * Learning Path Optimization Types
 * Type definitions for cross-framework learning path optimization
 */
export interface LearningObjective {
    id: string;
    title: string;
    description: string;
    domain: string;
    subdomain?: string;
    difficulty: number;
    estimatedTime: number;
    prerequisites: string[];
    frameworks: FrameworkCompatibility[];
    learningStyles: ('visual' | 'auditory' | 'kinesthetic')[];
    cognitiveLoad: 'low' | 'medium' | 'high';
    skills: string[];
    concepts: string[];
    assessmentCriteria: AssessmentCriterion[];
    created: Date;
    lastUpdated: Date;
}
export interface FrameworkCompatibility {
    framework: string;
    compatibility: number;
    effectiveness: number;
    adaptationRequired: string[];
    timeMultiplier: number;
    strengths: string[];
    limitations: string[];
}
export interface AssessmentCriterion {
    id: string;
    name: string;
    description: string;
    weight: number;
    measurable: boolean;
    framework: string;
    benchmarks: {
        beginner: string;
        intermediate: string;
        advanced: string;
    };
}
export interface LearningPath {
    id: string;
    userId: string;
    title: string;
    description: string;
    objectives: string[];
    estimatedDuration: number;
    difficulty: number;
    frameworks: PathFramework[];
    adaptability: number;
    personalizations: Personalization[];
    checkpoints: Checkpoint[];
    alternatives: Alternative[];
    metadata: {
        createdBy: 'ai' | 'human' | 'hybrid';
        optimizationAlgorithm: string;
        confidenceScore: number;
        expectedSuccessRate: number;
        basedOnUsers: number;
    };
    status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
    progress: PathProgress;
    created: Date;
    lastOptimized: Date;
}
export interface PathFramework {
    framework: string;
    objectives: string[];
    transitionPoints: number[];
    transitionType: 'smooth' | 'break' | 'review' | 'assessment';
    rationale: string;
}
export interface Personalization {
    type: 'learning_style' | 'pace' | 'difficulty' | 'schedule' | 'content';
    value: any;
    confidence: number;
    impact: number;
    appliesTo: string[];
}
export interface Checkpoint {
    id: string;
    objectiveId: string;
    type: 'assessment' | 'reflection' | 'practice' | 'milestone';
    title: string;
    description: string;
    position: number;
    estimatedTime: number;
    requiredScore?: number;
    framework: string;
    activities: CheckpointActivity[];
    adaptiveRules: AdaptiveRule[];
}
export interface CheckpointActivity {
    id: string;
    type: 'quiz' | 'exercise' | 'reflection' | 'discussion' | 'project';
    title: string;
    description: string;
    estimatedTime: number;
    difficulty: number;
    framework: string;
    content: any;
    scoringCriteria: ScoringCriterion[];
}
export interface ScoringCriterion {
    name: string;
    weight: number;
    description: string;
    rubric: {
        excellent: string;
        good: string;
        satisfactory: string;
        needs_improvement: string;
    };
}
export interface AdaptiveRule {
    id: string;
    condition: string;
    action: AdaptiveAction;
    priority: number;
    confidence: number;
}
export interface AdaptiveAction {
    type: 'skip' | 'repeat' | 'adjust_difficulty' | 'change_framework' | 'add_support' | 'accelerate';
    parameters: Record<string, any>;
    explanation: string;
}
export interface Alternative {
    id: string;
    trigger: AlternativeTrigger;
    path: Partial<LearningPath>;
    confidence: number;
    description: string;
}
export interface AlternativeTrigger {
    type: 'performance' | 'time' | 'preference' | 'context';
    condition: string;
    threshold: number;
}
export interface PathProgress {
    userId: string;
    pathId: string;
    currentObjective: number;
    completedObjectives: string[];
    checkpointScores: Record<string, number>;
    timeSpent: number;
    sessionCount: number;
    averageSessionLength: number;
    completionRate: number;
    difficultyAdjustments: DifficultyAdjustment[];
    frameworkSwitches: FrameworkSwitch[];
    adaptations: PathAdaptation[];
    predictedCompletion: Date;
    actualCompletion?: Date;
    satisfactionScore?: number;
    lastSession: Date;
    created: Date;
    lastUpdated: Date;
}
export interface DifficultyAdjustment {
    objectiveId: string;
    fromDifficulty: number;
    toDifficulty: number;
    reason: string;
    timestamp: Date;
    impact: number;
}
export interface FrameworkSwitch {
    objectiveId: string;
    fromFramework: string;
    toFramework: string;
    reason: string;
    timestamp: Date;
    effectiveness: number;
}
export interface PathAdaptation {
    type: 'reorder' | 'substitute' | 'extend' | 'compress' | 'branch';
    description: string;
    affectedObjectives: string[];
    reason: string;
    timestamp: Date;
    outcome: 'pending' | 'successful' | 'failed' | 'mixed';
}
export interface OptimizationContext {
    userId: string;
    learningProfile: any;
    availableTime: number;
    deadlines: Deadline[];
    constraints: Constraint[];
    preferences: PathPreferences;
    currentProgress?: PathProgress;
    historicalData: HistoricalPathData[];
}
export interface Deadline {
    type: 'soft' | 'hard';
    date: Date;
    objectives: string[];
    penalty: number;
}
export interface Constraint {
    type: 'time' | 'prerequisite' | 'resource' | 'schedule' | 'cognitive';
    description: string;
    severity: 'flexible' | 'important' | 'critical';
    affectedObjectives: string[];
    parameters: Record<string, any>;
}
export interface PathPreferences {
    preferredFrameworks: string[];
    avoidedFrameworks: string[];
    preferredPace: 'slow' | 'moderate' | 'fast' | 'adaptive';
    preferredDifficulty: 'easy' | 'moderate' | 'challenging' | 'adaptive';
    preferredSessionLength: number;
    preferredSchedule: SchedulePreference[];
    learningContext: 'self_paced' | 'structured' | 'collaborative' | 'mixed';
    assessmentPreference: 'frequent' | 'moderate' | 'minimal';
    feedbackStyle: 'immediate' | 'periodic' | 'milestone';
}
export interface SchedulePreference {
    dayOfWeek: string;
    startTime: string;
    duration: number;
    priority: number;
}
export interface HistoricalPathData {
    pathId: string;
    userId: string;
    objectives: string[];
    frameworks: string[];
    completionRate: number;
    timeSpent: number;
    satisfactionScore: number;
    challenges: string[];
    successes: string[];
    adaptations: PathAdaptation[];
    finalOutcome: 'completed' | 'abandoned' | 'paused';
    completionDate?: Date;
}
export interface OptimizationResult {
    originalPath: LearningPath;
    optimizedPath: LearningPath;
    improvements: Improvement[];
    tradeoffs: Tradeoff[];
    confidence: number;
    expectedOutcomes: ExpectedOutcome[];
    alternatives: LearningPath[];
    reasoning: OptimizationReasoning;
}
export interface Improvement {
    aspect: string;
    description: string;
    quantifiedBenefit: number;
    confidence: number;
}
export interface Tradeoff {
    aspect: string;
    description: string;
    cost: number;
    benefit: number;
    recommendation: 'accept' | 'reject' | 'modify';
}
export interface ExpectedOutcome {
    metric: string;
    currentValue: number;
    expectedValue: number;
    confidence: number;
    timeframe: string;
}
export interface OptimizationReasoning {
    primaryStrategy: string;
    keyFactors: string[];
    assumptions: string[];
    risksAndMitigations: RiskMitigation[];
    alternativeStrategies: string[];
    decisionPoints: DecisionPoint[];
}
export interface RiskMitigation {
    risk: string;
    probability: number;
    impact: number;
    mitigation: string;
}
export interface DecisionPoint {
    decision: string;
    options: string[];
    rationale: string;
    confidence: number;
    reversible: boolean;
}
export interface PathOptimizer {
    optimizePath(objectives: LearningObjective[], context: OptimizationContext): Promise<OptimizationResult>;
    adaptPath(path: LearningPath, progress: PathProgress, context: OptimizationContext): Promise<LearningPath>;
    evaluatePathEffectiveness(path: LearningPath, outcomes: PathProgress[]): Promise<number>;
}
export interface FrameworkTransition {
    from: string;
    to: string;
    transitionType: 'complementary' | 'reinforcement' | 'contrast' | 'progression';
    difficulty: number;
    effectiveness: number;
    timeRequired: number;
    supportRequired: string[];
    bestPractices: string[];
}
export interface PathAnalytics {
    pathId: string;
    totalUsers: number;
    completionRate: number;
    averageTime: number;
    satisfactionScore: number;
    commonDropoffPoints: DropoffPoint[];
    frameworkEffectiveness: Record<string, number>;
    difficultyProgression: number[];
    adaptationFrequency: Record<string, number>;
    userSegments: UserSegment[];
    improvements: PathImprovement[];
}
export interface DropoffPoint {
    objectiveId: string;
    dropoffRate: number;
    commonReasons: string[];
    recommendations: string[];
}
export interface UserSegment {
    name: string;
    criteria: string;
    userCount: number;
    completionRate: number;
    averageTime: number;
    preferredFrameworks: string[];
    commonAdaptations: string[];
}
export interface PathImprovement {
    suggestion: string;
    expectedImpact: number;
    implementationDifficulty: number;
    affectedObjectives: string[];
    evidence: string[];
}
