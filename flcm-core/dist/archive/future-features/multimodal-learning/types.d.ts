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
    load: number;
    processing_type: 'parallel' | 'sequential' | 'integrated';
}
export interface ModalityEffectiveness {
    learningStyles: Record<string, number>;
    contentTypes: Record<string, number>;
    cognitiveLoad: Record<string, number>;
    retentionRate: number;
    transferRate: number;
    engagementLevel: number;
    comprehensionSpeed: number;
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
    size: number;
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
    canLearn: boolean;
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
    precision: number;
    naturalness: number;
    learningCurve: number;
    fatigue: number;
    contextSuitability: string[];
}
export interface MultimodalContent {
    id: string;
    title: string;
    description: string;
    learningObjectives: string[];
    difficulty: number;
    estimatedTime: number;
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
    data: any;
    format: string;
    size?: number;
    duration?: number;
    dimensions?: {
        width: number;
        height: number;
        depth?: number;
    };
    quality: QualitySettings;
    compression: CompressionSettings;
    streaming: StreamingSettings;
}
export interface SynchronizationInfo {
    synchronized: boolean;
    timing: TimingInfo[];
    dependencies: string[];
    triggers: SyncTrigger[];
}
export interface TimingInfo {
    startTime: number;
    endTime: number;
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
    condition: string;
    adaptation: ModalityAdaptation;
    priority: number;
    active: boolean;
}
export interface AdaptiveElement {
    id: string;
    type: 'difficulty_scaling' | 'pace_adjustment' | 'content_variation' | 'modality_switching' | 'support_addition';
    trigger: string;
    adaptations: ElementAdaptation[];
    userControl: boolean;
    explanation: string;
}
export interface ElementAdaptation {
    action: string;
    targetModality?: ModalityType;
    parameters: Record<string, any>;
    effect: string;
    reversible: boolean;
}
export interface InteractionPoint {
    id: string;
    timestamp: number;
    type: 'question' | 'choice' | 'input' | 'manipulation' | 'reflection' | 'collaboration';
    modalities: ModalityType[];
    required: boolean;
    timeout?: number;
    feedback: FeedbackConfiguration;
    scoring?: ScoringConfiguration;
}
export interface FeedbackConfiguration {
    immediate: boolean;
    delayed: boolean;
    adaptive: boolean;
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
    weight: number;
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
    timestamp: number;
    modalities: AssessmentModality[];
    criteria: AssessmentCriterion[];
    rubric: AssessmentRubric;
    adaptive: boolean;
}
export interface AssessmentModality {
    modality: ModalityType;
    method: 'multiple_choice' | 'free_response' | 'demonstration' | 'creation' | 'explanation' | 'application';
    content: any;
    timeLimit?: number;
    attempts: number;
}
export interface AssessmentCriterion {
    name: string;
    description: string;
    weight: number;
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
    complexity: number;
    prerequisites: string[];
    language: string;
    culturalContext: string[];
    ageAppropriate: AgeRange;
    technicalRequirements: TechnicalRequirement[];
}
export interface BloomsLevel {
    level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    weight: number;
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
    quality: number;
}
export interface AssistiveTech {
    technology: string;
    supportLevel: 'full' | 'partial' | 'basic';
    testing: boolean;
    issues: string[];
}
export interface PersonalizationOptions {
    userPreferences: PreferenceOption[];
    adaptiveSettings: AdaptiveSetting[];
    customizations: CustomizationOption[];
    profileIntegration: boolean;
}
export interface PreferenceOption {
    name: string;
    type: 'boolean' | 'choice' | 'range' | 'text';
    defaultValue: any;
    options?: any[];
    range?: {
        min: number;
        max: number;
        step: number;
    };
    description: string;
    impact: string;
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
    resolution?: string;
    bitrate?: number;
    sampleRate?: number;
    compression?: string;
    adaptive: boolean;
}
export interface CompressionSettings {
    algorithm: string;
    level: number;
    lossless: boolean;
    optimizeFor: 'size' | 'quality' | 'speed';
}
export interface StreamingSettings {
    streamable: boolean;
    bufferSize?: number;
    adaptiveBitrate: boolean;
    offlineCapable: boolean;
}
export interface LearningSession {
    id: string;
    userId: string;
    contentId: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
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
    userSatisfaction: number;
}
export interface ModalityUsage {
    startTime: Date;
    endTime?: Date;
    duration: number;
    interactions: number;
    switches: number;
    primary: boolean;
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
    duration: number;
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
    effectiveness: number;
}
export interface SessionPerformance {
    overallScore: number;
    modalityScores: Record<ModalityType, number>;
    completionRate: number;
    accuracyRate: number;
    timeEfficiency: number;
    helpRequests: number;
    errorCount: number;
    retryCount: number;
    progressRate: number;
}
export interface SessionEngagement {
    overallEngagement: number;
    modalityEngagement: Record<ModalityType, number>;
    attentionLevel: number;
    interactionFrequency: number;
    timeOnTask: number;
    flowStateIndicators: FlowIndicator[];
    distractionEvents: DistractionEvent[];
}
export interface FlowIndicator {
    type: 'challenge_skill_balance' | 'clear_goals' | 'immediate_feedback' | 'deep_concentration';
    value: number;
    duration: number;
    modality: ModalityType;
}
export interface DistractionEvent {
    timestamp: Date;
    duration: number;
    type: 'external' | 'internal' | 'technical' | 'content_related';
    severity: number;
    recovery: number;
}
export interface UserPreference {
    modality: ModalityType;
    preference: number;
    reason: string;
    context?: string;
    stability: number;
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
    cpu: number;
    memory: number;
    battery: number;
    storage: number;
    temperature: number;
    network: 'none' | 'poor' | 'good' | 'excellent';
}
export interface NetworkContext {
    connectionType: 'wifi' | 'cellular' | 'ethernet' | 'offline';
    speed: number;
    latency: number;
    stability: number;
    dataLimits: boolean;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
}
export interface TemporalContext {
    timeOfDay: string;
    dayOfWeek: string;
    sessionNumber: number;
    timeSinceLast: number;
    availableTime: number;
    timeZone: string;
}
export interface SocialContext {
    setting: 'individual' | 'small_group' | 'classroom' | 'online_group';
    participants: number;
    roles: string[];
    collaboration: boolean;
    supervision: boolean;
    peerSupport: boolean;
}
export interface LearningOutcome {
    objectiveId: string;
    achieved: boolean;
    level: number;
    evidence: OutcomeEvidence[];
    modality: ModalityType;
    transferability: number;
    retention: RetentionEstimate;
}
export interface OutcomeEvidence {
    type: 'performance' | 'demonstration' | 'explanation' | 'application' | 'creation';
    description: string;
    quality: number;
    timestamp: Date;
    modality: ModalityType;
}
export interface RetentionEstimate {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
    confidence: number;
}
export interface SessionFeedback {
    modalityRatings: Record<ModalityType, ModalityRating>;
    overallSatisfaction: number;
    difficulty: number;
    engagement: number;
    effectiveness: number;
    preferences: PreferenceFeedback[];
    suggestions: string[];
    issues: IssueFeedback[];
    wouldRecommend: boolean;
    comments?: string;
}
export interface ModalityRating {
    effectiveness: number;
    usability: number;
    enjoyment: number;
    clarity: number;
    appropriateness: number;
    technicalQuality: number;
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
    confidence: number;
    priority: number;
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
    overallEffectiveness: number;
    contextualEffectiveness: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    confidence: number;
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
    timestamp: number;
    events: SyncEvent[];
    checkpoints: SyncCheckpoint[];
}
export interface SyncEvent {
    modality: ModalityType;
    action: 'start' | 'pause' | 'resume' | 'stop' | 'transition' | 'highlight';
    parameters: Record<string, any>;
    duration?: number;
}
export interface SyncCheckpoint {
    name: string;
    description: string;
    validation: string[];
    fallback: string;
}
export interface SyncDependency {
    dependent: ModalityType;
    dependency: ModalityType;
    relationship: 'requires' | 'enhances' | 'conflicts' | 'replaces';
    strength: number;
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
    effectiveness: number;
}
export interface QualityCheck {
    checkpoint: string;
    criteria: QualityCriterion[];
    automated: boolean;
    threshold: number;
    remediation: string;
}
export interface QualityCriterion {
    name: string;
    measurement: string;
    weight: number;
    threshold: number;
    critical: boolean;
}
