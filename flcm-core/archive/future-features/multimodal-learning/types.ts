/**
 * Multi-modal Learning Integration Types
 * Type definitions for integrating multiple learning modalities (text, audio, visual, kinesthetic)
 */

export interface LearningModality {
  type: ModalityType;
  name: string;
  description: string;
  cognitiveChannels: CognitiveChannel[];
  effectiveness: ModalityEffectiveness;
  requirements: ModalityRequirements;
  adaptations: ModalityAdaptation[];
  accessibility: AccessibilitySupport;
  supportedContent: ContentType[];
  interactionMethods: InteractionMethod[];
}

export type ModalityType = 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'multimodal' | 'virtual_reality' | 'augmented_reality';

export interface CognitiveChannel {
  channel: 'visual_spatial' | 'auditory_phonological' | 'episodic_buffer' | 'central_executive' | 'working_memory' | 'long_term_memory';
  load: number; // 0-1 scale, how much this modality uses this channel
  processing_type: 'parallel' | 'sequential' | 'integrated';
}

export interface ModalityEffectiveness {
  learningStyles: Record<string, number>; // effectiveness for each learning style (0-1)
  contentTypes: Record<string, number>; // effectiveness for each content type (0-1)
  cognitiveLoad: Record<string, number>; // low/medium/high cognitive load scenarios
  retentionRate: number; // 0-1 scale
  transferRate: number; // 0-1 scale, how well learning transfers to other contexts
  engagementLevel: number; // 0-1 scale
  comprehensionSpeed: number; // relative speed of comprehension
}

export interface ModalityRequirements {
  hardware: HardwareRequirement[];
  software: SoftwareRequirement[];
  environment: EnvironmentRequirement[];
  skills: SkillRequirement[];
  accessibility: AccessibilityRequirement[];
}

export interface HardwareRequirement {
  device: string;
  specifications: Record<string, any>;
  optional: boolean;
  alternatives: string[];
}

export interface SoftwareRequirement {
  name: string;
  version: string;
  platform: string[];
  license: string;
  size: number; // MB
}

export interface EnvironmentRequirement {
  type: 'lighting' | 'sound' | 'space' | 'privacy' | 'connectivity';
  requirement: string;
  criticality: 'required' | 'recommended' | 'optional';
}

export interface SkillRequirement {
  skill: string;
  level: 'basic' | 'intermediate' | 'advanced';
  description: string;
  canLearn: boolean; // Can be learned as part of the experience
}

export interface AccessibilityRequirement {
  impairment: 'visual' | 'auditory' | 'motor' | 'cognitive' | 'speech';
  support: 'full' | 'partial' | 'none';
  alternatives: string[];
}

export interface ModalityAdaptation {
  trigger: AdaptationTrigger;
  adaptation: AdaptationAction;
  priority: number;
  reversible: boolean;
}

export interface AdaptationTrigger {
  type: 'performance' | 'preference' | 'accessibility' | 'context' | 'technology';
  condition: string;
  threshold?: number;
  duration?: number;
}

export interface AdaptationAction {
  type: 'switch_modality' | 'combine_modalities' | 'enhance_modality' | 'simplify_modality' | 'add_support';
  target: ModalityType | ModalityType[];
  parameters: Record<string, any>;
  explanation: string;
}

export interface AccessibilitySupport {
  visualImpairment: VisualSupport;
  hearingImpairment: AudioSupport;
  motorImpairment: MotorSupport;
  cognitiveImpairment: CognitiveSupport;
}

export interface VisualSupport {
  screenReader: boolean;
  highContrast: boolean;
  magnification: boolean;
  colorBlindSupport: boolean;
  textToSpeech: boolean;
  tactileFeedback: boolean;
  alternativeFormats: string[];
}

export interface AudioSupport {
  captions: boolean;
  transcription: boolean;
  signLanguage: boolean;
  visualIndicators: boolean;
  vibrationFeedback: boolean;
  alternativeFormats: string[];
}

export interface MotorSupport {
  voiceControl: boolean;
  eyeTracking: boolean;
  switchControl: boolean;
  gestureControl: boolean;
  alternativeInputs: string[];
  customizableInterface: boolean;
}

export interface CognitiveSupport {
  simplifiedInterface: boolean;
  progressIndicators: boolean;
  memoryAids: boolean;
  attentionSupport: boolean;
  processingTimeAdjustment: boolean;
  cognitiveLoadManagement: boolean;
}

export type ContentType = 'text' | 'image' | 'audio' | 'video' | 'interactive' | 'simulation' | '3d_model' | 'animation' | 'game' | 'assessment';

export interface InteractionMethod {
  name: string;
  type: 'touch' | 'gesture' | 'voice' | 'eye_tracking' | 'brain_computer' | 'haptic' | 'traditional_input';
  description: string;
  precision: number; // 0-1 scale
  naturalness: number; // 0-1 scale, how natural it feels
  learningCurve: number; // 0-1 scale, how easy to learn
  fatigue: number; // 0-1 scale, how tiring it is
  contextSuitability: string[]; // contexts where this method works well
}

export interface MultimodalContent {
  id: string;
  title: string;
  description: string;
  learningObjectives: string[];
  difficulty: number; // 1-10 scale
  estimatedTime: number; // minutes
  modalities: ContentModality[];
  primaryModality: ModalityType;
  fallbackModalities: ModalityType[];
  adaptiveElements: AdaptiveElement[];
  interactionPoints: InteractionPoint[];
  assessmentPoints: AssessmentPoint[];
  metadata: ContentMetadata;
  accessibility: ContentAccessibility;
  personalization: PersonalizationOptions;
  created: Date;
  lastUpdated: Date;
}

export interface ContentModality {
  modality: ModalityType;
  content: ModalityContent;
  role: 'primary' | 'supporting' | 'alternative' | 'enhancement';
  synchronization: SynchronizationInfo;
  adaptationRules: ContentAdaptationRule[];
}

export interface ModalityContent {
  type: ContentType;
  data: any; // Content data (text, URLs, binary data, etc.)
  format: string; // MIME type or format specification
  size?: number; // bytes
  duration?: number; // seconds for time-based content
  dimensions?: { width: number; height: number; depth?: number };
  quality: QualitySettings;
  compression: CompressionSettings;
  streaming: StreamingSettings;
}

export interface SynchronizationInfo {
  synchronized: boolean;
  timing: TimingInfo[];
  dependencies: string[]; // IDs of other modalities this depends on
  triggers: SyncTrigger[];
}

export interface TimingInfo {
  startTime: number; // seconds
  endTime: number; // seconds
  event: string;
  description: string;
}

export interface SyncTrigger {
  type: 'time_based' | 'event_based' | 'user_action' | 'performance_based';
  condition: string;
  action: 'start' | 'pause' | 'resume' | 'stop' | 'sync' | 'adjust_timing';
  parameters: Record<string, any>;
}

export interface ContentAdaptationRule {
  id: string;
  condition: string; // JavaScript-like condition
  adaptation: ModalityAdaptation;
  priority: number;
  active: boolean;
}

export interface AdaptiveElement {
  id: string;
  type: 'difficulty_scaling' | 'pace_adjustment' | 'content_variation' | 'modality_switching' | 'support_addition';
  trigger: string; // Condition that triggers adaptation
  adaptations: ElementAdaptation[];
  userControl: boolean; // Can user override/control this adaptation
  explanation: string; // Why this adaptation exists
}

export interface ElementAdaptation {
  action: string;
  targetModality?: ModalityType;
  parameters: Record<string, any>;
  effect: string; // Expected effect of this adaptation
  reversible: boolean;
}

export interface InteractionPoint {
  id: string;
  timestamp: number; // seconds into content
  type: 'question' | 'choice' | 'input' | 'manipulation' | 'reflection' | 'collaboration';
  modalities: ModalityType[]; // Which modalities support this interaction
  required: boolean;
  timeout?: number; // seconds
  feedback: FeedbackConfiguration;
  scoring?: ScoringConfiguration;
}

export interface FeedbackConfiguration {
  immediate: boolean;
  delayed: boolean;
  adaptive: boolean; // Adapts based on user performance
  modalities: FeedbackModality[];
}

export interface FeedbackModality {
  modality: ModalityType;
  type: 'correct' | 'incorrect' | 'hint' | 'explanation' | 'encouragement';
  content: any;
  timing: 'immediate' | 'after_attempt' | 'end_of_section';
}

export interface ScoringConfiguration {
  points: number;
  criteria: ScoringCriterion[];
  rubric?: string;
  weight: number; // 0-1, weight in overall assessment
}

export interface ScoringCriterion {
  name: string;
  description: string;
  points: number;
  required: boolean;
}

export interface AssessmentPoint {
  id: string;
  type: 'formative' | 'summative' | 'diagnostic' | 'self_assessment' | 'peer_assessment';
  timestamp: number; // seconds into content
  modalities: AssessmentModality[];
  criteria: AssessmentCriterion[];
  rubric: AssessmentRubric;
  adaptive: boolean; // Adapts difficulty based on performance
}

export interface AssessmentModality {
  modality: ModalityType;
  method: 'multiple_choice' | 'free_response' | 'demonstration' | 'creation' | 'explanation' | 'application';
  content: any;
  timeLimit?: number; // seconds
  attempts: number; // allowed attempts
}

export interface AssessmentCriterion {
  name: string;
  description: string;
  weight: number; // 0-1
  levels: ProficiencyLevel[];
  measurementMethod: string;
}

export interface ProficiencyLevel {
  level: number;
  name: string;
  description: string;
  indicators: string[];
}

export interface AssessmentRubric {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriterion[];
  scoringMethod: 'holistic' | 'analytic' | 'primary_trait';
  scale: RubricScale;
}

export interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  score: number;
  label: string;
  description: string;
  indicators: string[];
}

export interface RubricScale {
  min: number;
  max: number;
  increment: number;
  labels: Record<number, string>;
}

export interface ContentMetadata {
  subject: string;
  topic: string[];
  keywords: string[];
  framework: string;
  bloomsTaxonomy: BloomsLevel[];
  cognitiveLoad: 'low' | 'medium' | 'high';
  complexity: number; // 1-10
  prerequisites: string[];
  language: string;
  culturalContext: string[];
  ageAppropriate: AgeRange;
  technicalRequirements: TechnicalRequirement[];
}

export interface BloomsLevel {
  level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  weight: number; // 0-1, how much of the content focuses on this level
}

export interface AgeRange {
  min: number;
  max: number;
  recommended: number;
}

export interface TechnicalRequirement {
  component: string;
  specification: string;
  required: boolean;
  alternative?: string;
}

export interface ContentAccessibility {
  wcagLevel: 'A' | 'AA' | 'AAA';
  supportedImpairments: string[];
  alternativeFormats: AlternativeFormat[];
  assistiveTechnologySupport: AssistiveTech[];
  universalDesign: boolean;
}

export interface AlternativeFormat {
  impairment: string;
  format: string;
  description: string;
  automaticallyGenerated: boolean;
  quality: number; // 0-1 scale
}

export interface AssistiveTech {
  technology: string;
  supportLevel: 'full' | 'partial' | 'basic';
  testing: boolean; // Has been tested with this technology
  issues: string[]; // Known issues
}

export interface PersonalizationOptions {
  userPreferences: PreferenceOption[];
  adaptiveSettings: AdaptiveSetting[];
  customizations: CustomizationOption[];
  profileIntegration: boolean; // Integrates with user learning profile
}

export interface PreferenceOption {
  name: string;
  type: 'boolean' | 'choice' | 'range' | 'text';
  defaultValue: any;
  options?: any[];
  range?: { min: number; max: number; step: number };
  description: string;
  impact: string; // What this preference affects
}

export interface AdaptiveSetting {
  name: string;
  algorithm: string;
  parameters: Record<string, any>;
  userControl: 'none' | 'override' | 'configure' | 'full';
  transparency: 'hidden' | 'notification' | 'explanation' | 'full_detail';
}

export interface CustomizationOption {
  element: string;
  properties: CustomizableProperty[];
  presets: CustomizationPreset[];
  userDefined: boolean;
}

export interface CustomizableProperty {
  property: string;
  type: 'color' | 'size' | 'position' | 'timing' | 'text' | 'audio' | 'behavior';
  range?: any;
  options?: any[];
  default: any;
}

export interface CustomizationPreset {
  name: string;
  description: string;
  settings: Record<string, any>;
  targetAudience: string;
}

export interface QualitySettings {
  resolution?: string; // for visual content
  bitrate?: number; // for audio/video
  sampleRate?: number; // for audio
  compression?: string; // compression format
  adaptive: boolean; // Can quality adapt to conditions
}

export interface CompressionSettings {
  algorithm: string;
  level: number; // 0-10 scale
  lossless: boolean;
  optimizeFor: 'size' | 'quality' | 'speed';
}

export interface StreamingSettings {
  streamable: boolean;
  bufferSize?: number; // seconds
  adaptiveBitrate: boolean;
  offlineCapable: boolean;
}

export interface LearningSession {
  id: string;
  userId: string;
  contentId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  modalities: SessionModality[];
  interactions: SessionInteraction[];
  adaptations: SessionAdaptation[];
  performance: SessionPerformance;
  engagement: SessionEngagement;
  preferences: UserPreference[];
  context: SessionContext;
  outcomes: LearningOutcome[];
  feedback: SessionFeedback;
}

export interface SessionModality {
  modality: ModalityType;
  usage: ModalityUsage;
  effectiveness: ModalityEffectiveness;
  issues: ModalityIssue[];
  userSatisfaction: number; // 1-5 scale
}

export interface ModalityUsage {
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  interactions: number;
  switches: number; // times switched to/from this modality
  primary: boolean; // was this the primary modality used
}

export interface ModalityIssue {
  type: 'technical' | 'usability' | 'accessibility' | 'content' | 'user_preference';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  workaround?: string;
}

export interface SessionInteraction {
  id: string;
  type: string;
  modality: ModalityType;
  timestamp: Date;
  duration: number; // seconds
  success: boolean;
  attempts: number;
  response: any;
  feedback: any;
  context: Record<string, any>;
}

export interface SessionAdaptation {
  id: string;
  timestamp: Date;
  trigger: string;
  fromModality?: ModalityType;
  toModality?: ModalityType;
  reason: string;
  userInitiated: boolean;
  userAccepted: boolean;
  effectiveness: number; // 0-1 scale, measured after adaptation
}

export interface SessionPerformance {
  overallScore: number; // 0-100
  modalityScores: Record<ModalityType, number>;
  completionRate: number; // 0-1
  accuracyRate: number; // 0-1
  timeEfficiency: number; // 0-1, compared to expected time
  helpRequests: number;
  errorCount: number;
  retryCount: number;
  progressRate: number; // objectives completed per minute
}

export interface SessionEngagement {
  overallEngagement: number; // 0-1 scale
  modalityEngagement: Record<ModalityType, number>;
  attentionLevel: number; // 0-1 scale
  interactionFrequency: number; // interactions per minute
  timeOnTask: number; // percentage of session time actively engaged
  flowStateIndicators: FlowIndicator[];
  distractionEvents: DistractionEvent[];
}

export interface FlowIndicator {
  type: 'challenge_skill_balance' | 'clear_goals' | 'immediate_feedback' | 'deep_concentration';
  value: number; // 0-1 scale
  duration: number; // minutes
  modality: ModalityType;
}

export interface DistractionEvent {
  timestamp: Date;
  duration: number; // seconds
  type: 'external' | 'internal' | 'technical' | 'content_related';
  severity: number; // 0-1 scale
  recovery: number; // seconds to recover focus
}

export interface UserPreference {
  modality: ModalityType;
  preference: number; // 0-1 scale, how much user prefers this modality
  reason: string;
  context?: string; // when this preference applies
  stability: number; // 0-1 scale, how stable this preference is
}

export interface SessionContext {
  environment: EnvironmentContext;
  device: DeviceContext;
  network: NetworkContext;
  temporal: TemporalContext;
  social: SocialContext;
}

export interface EnvironmentContext {
  location: string;
  lighting: 'dim' | 'normal' | 'bright';
  noise: 'quiet' | 'moderate' | 'noisy';
  privacy: 'private' | 'semi_private' | 'public';
  distractions: string[];
}

export interface DeviceContext {
  type: 'desktop' | 'laptop' | 'tablet' | 'smartphone' | 'vr_headset' | 'ar_device';
  capabilities: DeviceCapability[];
  performance: DevicePerformance;
  inputMethods: string[];
  outputMethods: string[];
}

export interface DeviceCapability {
  capability: string;
  available: boolean;
  quality: 'low' | 'medium' | 'high';
  limitations: string[];
}

export interface DevicePerformance {
  cpu: number; // 0-100 usage
  memory: number; // 0-100 usage
  battery: number; // 0-100 level
  storage: number; // 0-100 usage
  temperature: number; // celsius
  network: 'none' | 'poor' | 'good' | 'excellent';
}

export interface NetworkContext {
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'offline';
  speed: number; // Mbps
  latency: number; // ms
  stability: number; // 0-1 scale
  dataLimits: boolean;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

export interface TemporalContext {
  timeOfDay: string;
  dayOfWeek: string;
  sessionNumber: number; // which session in sequence
  timeSinceLast: number; // hours since last session
  availableTime: number; // minutes available for this session
  timeZone: string;
}

export interface SocialContext {
  setting: 'individual' | 'small_group' | 'classroom' | 'online_group';
  participants: number;
  roles: string[]; // roles of other participants
  collaboration: boolean;
  supervision: boolean;
  peerSupport: boolean;
}

export interface LearningOutcome {
  objectiveId: string;
  achieved: boolean;
  level: number; // 1-10 scale of achievement
  evidence: OutcomeEvidence[];
  modality: ModalityType; // primary modality that led to this outcome
  transferability: number; // 0-1 scale, how well this transfers to other contexts
  retention: RetentionEstimate;
}

export interface OutcomeEvidence {
  type: 'performance' | 'demonstration' | 'explanation' | 'application' | 'creation';
  description: string;
  quality: number; // 0-1 scale
  timestamp: Date;
  modality: ModalityType;
}

export interface RetentionEstimate {
  shortTerm: number; // 0-1 probability of retention after 1 day
  mediumTerm: number; // 0-1 probability of retention after 1 week
  longTerm: number; // 0-1 probability of retention after 1 month
  confidence: number; // 0-1 confidence in these estimates
}

export interface SessionFeedback {
  modalityRatings: Record<ModalityType, ModalityRating>;
  overallSatisfaction: number; // 1-5 scale
  difficulty: number; // 1-5 scale
  engagement: number; // 1-5 scale
  effectiveness: number; // 1-5 scale
  preferences: PreferenceFeedback[];
  suggestions: string[];
  issues: IssueFeedback[];
  wouldRecommend: boolean;
  comments?: string;
}

export interface ModalityRating {
  effectiveness: number; // 1-5 scale
  usability: number; // 1-5 scale
  enjoyment: number; // 1-5 scale
  clarity: number; // 1-5 scale
  appropriateness: number; // 1-5 scale
  technicalQuality: number; // 1-5 scale
  comments?: string;
}

export interface PreferenceFeedback {
  modality: ModalityType;
  preference: 'strongly_prefer' | 'prefer' | 'neutral' | 'avoid' | 'strongly_avoid';
  reason: string;
  context?: string;
}

export interface IssueFeedback {
  modality: ModalityType;
  issue: string;
  severity: 'minor' | 'moderate' | 'major' | 'blocking';
  frequency: 'once' | 'occasional' | 'frequent' | 'constant';
  workaroundFound: boolean;
  suggestions?: string;
}

export interface MultimodalEngine {
  analyzeContent(content: any): Promise<MultimodalContent>;
  optimizeForUser(contentId: string, userId: string, context?: any): Promise<MultimodalContent>;
  trackSession(session: LearningSession): Promise<void>;
  adaptDuringSession(sessionId: string, trigger: string): Promise<SessionAdaptation[]>;
  generateRecommendations(userId: string, context?: any): Promise<ModalityRecommendation[]>;
  assessModalityEffectiveness(userId: string, modality: ModalityType): Promise<EffectivenessAssessment>;
  synchronizeModalities(contentId: string, modalities: ModalityType[]): Promise<SynchronizationPlan>;
}

export interface ModalityRecommendation {
  type: 'add_modality' | 'remove_modality' | 'switch_modality' | 'combine_modalities' | 'enhance_modality';
  modality: ModalityType | ModalityType[];
  reason: string;
  expectedBenefit: string;
  implementation: ImplementationPlan;
  confidence: number; // 0-1 scale
  priority: number; // 1-10 scale
}

export interface ImplementationPlan {
  steps: ImplementationStep[];
  resources: string[];
  timeline: string;
  challenges: string[];
  alternatives: string[];
  successMetrics: string[];
}

export interface ImplementationStep {
  step: string;
  description: string;
  duration: string;
  prerequisites: string[];
  deliverables: string[];
}

export interface EffectivenessAssessment {
  modality: ModalityType;
  overallEffectiveness: number; // 0-1 scale
  contextualEffectiveness: Record<string, number>; // effectiveness in different contexts
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidence: number; // 0-1 scale
  dataQuality: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export interface SynchronizationPlan {
  contentId: string;
  modalities: ModalityType[];
  timeline: SyncTimeline[];
  dependencies: SyncDependency[];
  conflicts: SyncConflict[];
  resolution: ConflictResolution[];
  qualityAssurance: QualityCheck[];
}

export interface SyncTimeline {
  timestamp: number; // seconds
  events: SyncEvent[];
  checkpoints: SyncCheckpoint[];
}

export interface SyncEvent {
  modality: ModalityType;
  action: 'start' | 'pause' | 'resume' | 'stop' | 'transition' | 'highlight';
  parameters: Record<string, any>;
  duration?: number; // seconds
}

export interface SyncCheckpoint {
  name: string;
  description: string;
  validation: string[]; // what to validate at this point
  fallback: string; // what to do if validation fails
}

export interface SyncDependency {
  dependent: ModalityType;
  dependency: ModalityType;
  relationship: 'requires' | 'enhances' | 'conflicts' | 'replaces';
  strength: number; // 0-1 scale
  timing: 'before' | 'during' | 'after' | 'simultaneous';
}

export interface SyncConflict {
  modalities: ModalityType[];
  type: 'attention_competition' | 'resource_conflict' | 'timing_conflict' | 'cognitive_overload';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
}

export interface ConflictResolution {
  conflict: SyncConflict;
  strategy: 'sequential' | 'prioritization' | 'modification' | 'elimination' | 'timing_adjustment';
  implementation: string;
  tradeoffs: string[];
  effectiveness: number; // 0-1 estimated effectiveness
}

export interface QualityCheck {
  checkpoint: string;
  criteria: QualityCriterion[];
  automated: boolean;
  threshold: number; // minimum quality score to pass
  remediation: string; // what to do if quality check fails
}

export interface QualityCriterion {
  name: string;
  measurement: string;
  weight: number; // 0-1
  threshold: number;
  critical: boolean; // failure results in overall failure
}