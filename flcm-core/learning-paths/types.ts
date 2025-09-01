/**
 * Learning Path Optimization Types
 * Type definitions for cross-framework learning path optimization
 */

export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  domain: string; // e.g., 'mathematics', 'science', 'language', 'philosophy'
  subdomain?: string;
  difficulty: number; // 1-10 scale
  estimatedTime: number; // minutes
  prerequisites: string[]; // IDs of prerequisite objectives
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
  compatibility: number; // 0-1 scale
  effectiveness: number; // 0-1 scale based on historical data
  adaptationRequired: string[]; // List of adaptations needed
  timeMultiplier: number; // How much longer/shorter this framework takes
  strengths: string[]; // What this framework is good for
  limitations: string[]; // What this framework struggles with
}

export interface AssessmentCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1, sum should equal 1
  measurable: boolean;
  framework: string; // Which framework this criterion applies to
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
  objectives: string[]; // IDs of learning objectives in order
  estimatedDuration: number; // total minutes
  difficulty: number; // 1-10 average
  frameworks: PathFramework[];
  adaptability: number; // 0-1 how easily path can be modified
  personalizations: Personalization[];
  checkpoints: Checkpoint[];
  alternatives: Alternative[];
  metadata: {
    createdBy: 'ai' | 'human' | 'hybrid';
    optimizationAlgorithm: string;
    confidenceScore: number;
    expectedSuccessRate: number;
    basedOnUsers: number; // How many similar users this is based on
  };
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  progress: PathProgress;
  created: Date;
  lastOptimized: Date;
}

export interface PathFramework {
  framework: string;
  objectives: string[]; // Which objectives use this framework
  transitionPoints: number[]; // Indices where framework changes
  transitionType: 'smooth' | 'break' | 'review' | 'assessment';
  rationale: string; // Why this framework was chosen for these objectives
}

export interface Personalization {
  type: 'learning_style' | 'pace' | 'difficulty' | 'schedule' | 'content';
  value: any;
  confidence: number; // How confident we are in this personalization
  impact: number; // Expected impact on learning outcomes
  appliesTo: string[]; // Which objectives this personalization affects
}

export interface Checkpoint {
  id: string;
  objectiveId: string;
  type: 'assessment' | 'reflection' | 'practice' | 'milestone';
  title: string;
  description: string;
  position: number; // Position in the path (0-1)
  estimatedTime: number;
  requiredScore?: number; // Minimum score to proceed
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
  content: any; // Activity-specific content
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
  condition: string; // JavaScript-like condition
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
  currentObjective: number; // Index in objectives array
  completedObjectives: string[];
  checkpointScores: Record<string, number>;
  timeSpent: number; // total minutes
  sessionCount: number;
  averageSessionLength: number;
  completionRate: number; // 0-1
  difficultyAdjustments: DifficultyAdjustment[];
  frameworkSwitches: FrameworkSwitch[];
  adaptations: PathAdaptation[];
  predictedCompletion: Date;
  actualCompletion?: Date;
  satisfactionScore?: number; // 1-5 scale
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
  impact: number; // Measured impact on performance
}

export interface FrameworkSwitch {
  objectiveId: string;
  fromFramework: string;
  toFramework: string;
  reason: string;
  timestamp: Date;
  effectiveness: number; // How well the switch worked
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
  learningProfile: any; // From profile builder
  availableTime: number; // minutes per week
  deadlines: Deadline[];
  constraints: Constraint[];
  preferences: PathPreferences;
  currentProgress?: PathProgress;
  historicalData: HistoricalPathData[];
}

export interface Deadline {
  type: 'soft' | 'hard';
  date: Date;
  objectives: string[]; // Which objectives must be completed by this date
  penalty: number; // Impact if missed (0-1)
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
  preferredSessionLength: number; // minutes
  preferredSchedule: SchedulePreference[];
  learningContext: 'self_paced' | 'structured' | 'collaborative' | 'mixed';
  assessmentPreference: 'frequent' | 'moderate' | 'minimal';
  feedbackStyle: 'immediate' | 'periodic' | 'milestone';
}

export interface SchedulePreference {
  dayOfWeek: string;
  startTime: string;
  duration: number; // minutes
  priority: number; // 1-10
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
  quantifiedBenefit: number; // Percentage improvement expected
  confidence: number;
}

export interface Tradeoff {
  aspect: string;
  description: string;
  cost: number; // Negative impact
  benefit: number; // Positive impact
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
  probability: number; // 0-1
  impact: number; // 0-1
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
  optimizePath(
    objectives: LearningObjective[],
    context: OptimizationContext
  ): Promise<OptimizationResult>;
  
  adaptPath(
    path: LearningPath,
    progress: PathProgress,
    context: OptimizationContext
  ): Promise<LearningPath>;
  
  evaluatePathEffectiveness(
    path: LearningPath,
    outcomes: PathProgress[]
  ): Promise<number>;
}

export interface FrameworkTransition {
  from: string;
  to: string;
  transitionType: 'complementary' | 'reinforcement' | 'contrast' | 'progression';
  difficulty: number; // How difficult the transition is
  effectiveness: number; // How effective the transition is
  timeRequired: number; // Additional time needed for transition
  supportRequired: string[]; // What support is needed
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