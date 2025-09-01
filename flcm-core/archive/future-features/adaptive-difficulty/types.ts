/**
 * Adaptive Content Difficulty Engine Types
 * Type definitions for dynamic content difficulty adjustment system
 */

export interface DifficultyProfile {
  userId: string;
  domain: string; // e.g., 'mathematics', 'science', 'language'
  subdomain?: string; // e.g., 'calculus', 'physics', 'grammar'
  currentLevel: number; // 1-10 scale
  masteryLevel: number; // 0-1 scale
  confidenceLevel: number; // 0-1 scale
  learningVelocity: number; // rate of improvement per hour
  optimalChallenge: number; // 1-10 scale, sweet spot for flow state
  frustrationThreshold: number; // 1-10 scale
  comfortZoneLimit: number; // 1-10 scale
  skillMap: SkillAssessment[];
  adaptationHistory: DifficultyAdjustment[];
  lastAssessment: Date;
  nextRecommendedAssessment: Date;
  created: Date;
  lastUpdated: Date;
}

export interface SkillAssessment {
  skill: string;
  level: number; // 1-10 scale
  confidence: number; // 0-1 scale
  lastTested: Date;
  evidence: AssessmentEvidence[];
  prerequisites: string[]; // Other skills required
  dependents: string[]; // Skills that depend on this one
  trends: SkillTrend[];
}

export interface AssessmentEvidence {
  type: 'performance' | 'time_taken' | 'help_requests' | 'errors' | 'self_report';
  value: number;
  context: string;
  timestamp: Date;
  weight: number; // How much this evidence contributes to assessment
}

export interface SkillTrend {
  direction: 'improving' | 'declining' | 'stable';
  rate: number; // units per time period
  confidence: number; // 0-1 scale
  timeWindow: number; // days
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
  effectiveness: number; // 0-1 scale, measured after adjustment
  userFeedback?: UserFeedback;
  automaticAdjustment: boolean;
  contextFactors: ContextFactor[];
}

export interface AdjustmentReason {
  primary: string;
  secondary?: string[];
  confidence: number; // 0-1 scale
  evidence: string[];
  algorithm: string; // Which algorithm made the decision
}

export interface AdjustmentTrigger {
  type: 'performance_based' | 'time_based' | 'frustration_detected' | 'mastery_achieved' | 'user_request' | 'context_change';
  threshold?: number;
  duration?: number; // time in current state before trigger
  conditions: TriggerCondition[];
}

export interface TriggerCondition {
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'between' | 'trending';
  value: number | number[];
  timeWindow?: number; // minutes
}

export interface UserFeedback {
  rating: number; // 1-5 scale
  tooEasy: boolean;
  tooHard: boolean;
  justRight: boolean;
  comments?: string;
  timestamp: Date;
}

export interface ContextFactor {
  name: string;
  value: any;
  impact: number; // -1 to 1, negative means makes content seem harder
  confidence: number; // 0-1 scale
}

export interface ContentDifficulty {
  contentId: string;
  baseDifficulty: number; // 1-10 intrinsic difficulty
  adaptedDifficulty: number; // 1-10 adjusted for user
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
  value: number; // 1-10 scale
  weight: number; // 0-1, how much this contributes to overall difficulty
  adjustable: boolean; // Can this factor be modified dynamically
  description: string;
}

export interface ScalabilityOption {
  name: string;
  type: 'content_modification' | 'scaffolding' | 'complexity_reduction' | 'pacing_adjustment' | 'support_addition';
  difficultyRange: [number, number]; // min and max difficulty this option supports
  implementation: ScalabilityImplementation;
  effectiveness: number; // 0-1 historical effectiveness
  cost: number; // 0-1 computational/preparation cost
}

export interface ScalabilityImplementation {
  method: string;
  parameters: Record<string, any>;
  resources: string[]; // Additional resources needed
  limitations: string[]; // What this method cannot handle
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
  condition: string; // JavaScript-like condition
  priority: number; // 1-10
  cooldownPeriod: number; // minutes before this trigger can fire again
  confidence: number; // 0-1 required confidence to trigger
}

export interface AdaptationAlgorithm {
  name: string;
  type: 'rule_based' | 'ml_model' | 'collaborative_filtering' | 'optimization' | 'hybrid';
  implementation: string;
  parameters: Record<string, any>;
  accuracy: number; // 0-1 historical accuracy
  speed: number; // 0-1 relative speed (1 = fastest)
  explainability: number; // 0-1 how well decisions can be explained
}

export interface AdaptationConstraint {
  type: 'min_difficulty' | 'max_difficulty' | 'change_rate' | 'stability_period' | 'user_preference';
  value: any;
  hard: boolean; // Hard constraint (must not violate) vs soft constraint (prefer not to violate)
  reason: string;
}

export interface PrerequisiteCheck {
  skill: string;
  required: boolean;
  level: number; // 1-10 minimum level required
  alternatives: string[]; // Alternative skills that could satisfy this requirement
  assessmentMethod: string;
  bypassable: boolean; // Can user override if they believe they're ready
}

export interface LearningObjective {
  id: string;
  description: string;
  difficulty: number; // 1-10
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  estimatedTime: number; // minutes
  prerequisites: string[];
  successCriteria: SuccessCriterion[];
  adaptable: boolean; // Can this objective be modified based on difficulty
}

export interface SuccessCriterion {
  description: string;
  measurable: boolean;
  threshold: number; // What constitutes success (0-1 scale)
  weight: number; // 0-1 importance in overall objective assessment
  assessmentMethod: string;
}

export interface AssessmentCriterion {
  id: string;
  name: string;
  type: 'formative' | 'summative' | 'diagnostic' | 'continuous';
  metric: string;
  threshold: number;
  weight: number; // 0-1 contribution to overall assessment
  frequency: AssessmentFrequency;
  adaptationSensitivity: number; // 0-1 how quickly this affects difficulty
}

export interface AssessmentFrequency {
  type: 'continuous' | 'interval' | 'milestone' | 'on_demand';
  interval?: number; // minutes for interval type
  conditions?: string[]; // Conditions for milestone/on_demand types
}

export interface ContentMetadata {
  subject: string;
  topic: string;
  subtopic?: string;
  framework: string;
  contentType: 'exercise' | 'explanation' | 'example' | 'assessment' | 'project';
  estimatedTime: number; // minutes
  cognitiveLoad: 'low' | 'medium' | 'high';
  interactivity: 'passive' | 'active' | 'interactive';
  mediaTypes: string[]; // text, image, video, audio, simulation
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
  clarity: number; // 0-1
  accuracy: number; // 0-1
  engagement: number; // 0-1
  pedagogicalEffectiveness: number; // 0-1
  technicalQuality: number; // 0-1
  lastReviewed: Date;
  reviewerRatings: number[]; // Array of 1-5 ratings
}

export interface UsageStatistics {
  totalUsages: number;
  averageCompletionRate: number; // 0-1
  averageTimeSpent: number; // minutes
  averageDifficultyRating: number; // 1-5 from users
  successRate: number; // 0-1
  adaptationFrequency: number; // adaptations per usage
  userSatisfaction: number; // 1-5 average rating
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
  accuracyRate: number; // 0-1
  completionRate: number; // 0-1
  timeEfficiency: number; // 0-1, actual time vs expected time
  helpRequestFrequency: number; // requests per minute
  errorRate: number; // 0-1
  retryRate: number; // 0-1
  progressRate: number; // objectives completed per minute
  qualityScore: number; // 0-1 quality of work/responses
}

export interface EngagementMetrics {
  sessionDuration: number; // minutes
  activeTime: number; // minutes actually engaged
  attentionScore: number; // 0-1 based on interaction patterns
  motivationIndicators: MotivationIndicator[];
  flowStateIndicators: FlowStateIndicator[];
  frustrationLevel: number; // 0-1
  confidenceLevel: number; // 0-1
}

export interface MotivationIndicator {
  type: 'task_persistence' | 'effort_level' | 'choice_autonomy' | 'goal_orientation';
  value: number; // 0-1
  confidence: number; // 0-1
  evidence: string[];
}

export interface FlowStateIndicator {
  type: 'challenge_skill_balance' | 'clear_goals' | 'immediate_feedback' | 'deep_concentration';
  value: number; // 0-1
  duration: number; // minutes in this state
  transitions: FlowTransition[];
}

export interface FlowTransition {
  from: 'anxiety' | 'worry' | 'apathy' | 'boredom' | 'relaxation' | 'control' | 'arousal' | 'flow';
  to: 'anxiety' | 'worry' | 'apathy' | 'boredom' | 'relaxation' | 'control' | 'arousal' | 'flow';
  timestamp: Date;
  trigger: string;
}

export interface SessionFeedback {
  difficultyRating: number; // 1-5 (too easy -> too hard)
  enjoymentRating: number; // 1-5
  learningRating: number; // 1-5 (how much did you learn)
  paceRating: number; // 1-5 (too slow -> too fast)
  supportRating: number; // 1-5 (not enough help -> too much help)
  overallSatisfaction: number; // 1-5
  improvements: string[];
  wouldRecommend: boolean;
  comments?: string;
  timestamp: Date;
}

export interface SessionContext {
  timeOfDay: string;
  dayOfWeek: string;
  sessionNumber: number; // Which session in sequence
  previousSessionGap: number; // hours since last session
  deviceType: string;
  networkQuality: string;
  environmentalFactors: EnvironmentalFactor[];
  userMoodIndicators: MoodIndicator[];
  externalPressures: ExternalPressure[];
}

export interface EnvironmentalFactor {
  type: 'location' | 'noise_level' | 'interruptions' | 'lighting' | 'temperature';
  value: any;
  impact: number; // -1 to 1 impact on learning
}

export interface MoodIndicator {
  type: 'energy_level' | 'stress_level' | 'confidence' | 'motivation' | 'focus';
  value: number; // 0-1
  source: 'self_report' | 'behavioral_inference' | 'physiological_measure';
  reliability: number; // 0-1
}

export interface ExternalPressure {
  type: 'deadline' | 'performance_expectation' | 'social_pressure' | 'resource_constraint';
  severity: number; // 0-1
  description: string;
  timeframe: string;
}

export interface SessionOutcome {
  type: 'objective_achieved' | 'skill_improved' | 'insight_gained' | 'challenge_overcome' | 'support_needed';
  description: string;
  evidence: string[];
  impact: number; // 0-1
  transferable: boolean; // Can this outcome transfer to other contexts
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
  confidence: number; // 0-1
  userActionable: boolean; // Can user do something based on this explanation
  evidenceLevel: 'low' | 'medium' | 'high';
}

export interface ExplanationFactor {
  name: string;
  type: 'user_performance' | 'content_difficulty' | 'context' | 'historical_pattern' | 'algorithm_decision';
  contribution: number; // -1 to 1, how much this factor influenced the decision
  explanation: string;
  dataPoints: string[]; // Specific data that supports this factor
}

export interface AlternativeExplanation {
  decision: string;
  reason: string;
  confidence: number; // 0-1
  tradeoffs: string[];
}

export interface AssessmentResult {
  skill: string;
  level: number; // 1-10
  confidence: number; // 0-1
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
  priority: number; // 1-10
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
  domain: string; // What subject/domain this model is for
  accuracy: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  explainability: number; // 0-1
  speed: number; // ms average prediction time
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
  importance: number; // 0-1
  description: string;
  preprocessing: string; // How this feature is processed
}

export interface TrainingDataInfo {
  sampleCount: number;
  timeRange: { start: Date; end: Date };
  sources: string[];
  qualityScore: number; // 0-1
  biasAnalysis: BiasAnalysis;
  lastUpdated: Date;
}

export interface BiasAnalysis {
  demographicBias: number; // 0-1 (0 = no bias)
  performanceBias: number; // 0-1
  contentBias: number; // 0-1
  temporalBias: number; // 0-1
  mitigationStrategies: string[];
}

export interface ValidationResults {
  crossValidation: number; // 0-1 average score
  holdoutValidation: number; // 0-1
  temporalValidation: number; // 0-1 performance on future data
  diversityValidation: number; // 0-1 performance across different user groups
  adversarialTesting: number; // 0-1 robustness score
  confusionMatrix?: number[][]; // For classification models
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
  averageResponseTime: number; // ms
  resourceUsage: ResourceUsage;
  autoScaling: boolean;
}

export interface ResourceUsage {
  cpu: number; // percentage
  memory: number; // MB
  storage: number; // MB
  network: number; // MB/s
}

export interface MonitoringSetup {
  metricsTracked: string[];
  alertThresholds: Record<string, number>;
  dashboardUrl?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface RollbackPlan {
  triggerConditions: string[];
  rollbackDuration: number; // minutes
  fallbackModel: string; // Model ID to fall back to
  dataRetention: number; // days to keep rollback data
}

export interface PerformanceRequirements {
  maxLatency: number; // ms
  minThroughput: number; // requests per second
  maxErrorRate: number; // 0-1
  availabilityTarget: number; // 0-1 (e.g., 0.999 for 99.9% uptime)
}