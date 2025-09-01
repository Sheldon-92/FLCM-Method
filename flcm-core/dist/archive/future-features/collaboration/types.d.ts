/**
 * Real-time Collaboration Types
 * Type definitions for real-time collaborative learning features
 */
export interface CollaborationRoom {
    id: string;
    name: string;
    description?: string;
    type: 'study_group' | 'peer_review' | 'discussion' | 'workshop' | 'tutoring' | 'project';
    privacy: 'public' | 'private' | 'invite_only';
    maxParticipants: number;
    currentParticipants: number;
    framework?: string;
    topic?: string;
    difficulty?: number;
    language: string;
    tags: string[];
    settings: RoomSettings;
    permissions: RoomPermissions;
    schedule?: ScheduleInfo;
    metadata: RoomMetadata;
    created: Date;
    lastActive: Date;
}
export interface RoomSettings {
    allowAnonymous: boolean;
    requireModerator: boolean;
    enableVoiceChat: boolean;
    enableVideoChat: boolean;
    enableScreenShare: boolean;
    enableWhiteboard: boolean;
    enableFileSharing: boolean;
    enableRecording: boolean;
    autoRecordSessions: boolean;
    maxSessionDuration: number;
    idleTimeout: number;
    notificationSettings: NotificationSettings;
    moderationSettings: ModerationSettings;
}
export interface RoomPermissions {
    owner: string;
    moderators: string[];
    speakers: string[];
    defaultRole: ParticipantRole;
    guestAccess: boolean;
    recordingAccess: 'owner_only' | 'moderators' | 'all_participants';
    whiteboard: 'owner_only' | 'moderators' | 'speakers' | 'all_participants';
    screenShare: 'owner_only' | 'moderators' | 'speakers' | 'all_participants';
}
export interface ScheduleInfo {
    recurring: boolean;
    startTime: Date;
    duration: number;
    timezone: string;
    recurrence?: RecurrencePattern;
    reminders: ReminderSettings[];
}
export interface RecurrencePattern {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: Date;
    maxOccurrences?: number;
}
export interface ReminderSettings {
    type: 'email' | 'push' | 'in_app';
    timing: number;
    enabled: boolean;
}
export interface RoomMetadata {
    totalSessions: number;
    totalDuration: number;
    averageParticipants: number;
    popularTimes: TimeSlot[];
    engagementMetrics: EngagementMetrics;
    learningOutcomes: LearningOutcome[];
}
export interface TimeSlot {
    hour: number;
    dayOfWeek: number;
    frequency: number;
}
export interface EngagementMetrics {
    averageSessionDuration: number;
    messageFrequency: number;
    screenShareUsage: number;
    whiteboardUsage: number;
    participantRetention: number;
}
export interface LearningOutcome {
    metric: string;
    value: number;
    improvement: number;
    confidence: number;
}
export interface Participant {
    id: string;
    userId: string;
    username: string;
    displayName: string;
    avatar?: string;
    role: ParticipantRole;
    status: ParticipantStatus;
    joinedAt: Date;
    lastActive: Date;
    connectionInfo: ConnectionInfo;
    preferences: ParticipantPreferences;
    capabilities: ParticipantCapabilities;
    statistics: ParticipantStatistics;
}
export type ParticipantRole = 'owner' | 'moderator' | 'speaker' | 'participant' | 'observer' | 'guest';
export type ParticipantStatus = 'active' | 'away' | 'busy' | 'presenting' | 'muted' | 'disconnected';
export interface ConnectionInfo {
    connectionId: string;
    ipAddress: string;
    userAgent: string;
    platform: string;
    networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
    latency: number;
    bandwidth: number;
    audioEnabled: boolean;
    videoEnabled: boolean;
    screenShareEnabled: boolean;
}
export interface ParticipantPreferences {
    notifications: boolean;
    micAutoMute: boolean;
    videoAutoOff: boolean;
    preferredAudioCodec: string;
    preferredVideoCodec: string;
    displaySettings: DisplaySettings;
}
export interface DisplaySettings {
    theme: 'light' | 'dark' | 'auto';
    fontSize: number;
    showTimestamps: boolean;
    showAvatars: boolean;
    compactMode: boolean;
}
export interface ParticipantCapabilities {
    canSpeak: boolean;
    canShareScreen: boolean;
    canUseWhiteboard: boolean;
    canManageRoom: boolean;
    canModerate: boolean;
    canRecord: boolean;
    canInvite: boolean;
}
export interface ParticipantStatistics {
    totalSessionTime: number;
    messagesPosted: number;
    questionsAsked: number;
    answersGiven: number;
    screensShared: number;
    whiteboardContributions: number;
    engagementScore: number;
    learningContribution: number;
}
export interface CollaborationSession {
    id: string;
    roomId: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    duration: number;
    framework?: string;
    topic: string;
    objectives: string[];
    participants: SessionParticipant[];
    activities: SessionActivity[];
    resources: SharedResource[];
    chat: ChatMessage[];
    whiteboard: WhiteboardState;
    recording?: RecordingInfo;
    summary: SessionSummary;
    feedback: SessionFeedback[];
    status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
    metadata: SessionMetadata;
}
export interface SessionParticipant {
    participantId: string;
    role: ParticipantRole;
    joinTime: Date;
    leaveTime?: Date;
    duration: number;
    contribution: ParticipantContribution;
    satisfaction?: number;
}
export interface ParticipantContribution {
    messagesCount: number;
    screenShareTime: number;
    whiteboardEdits: number;
    questionsAsked: number;
    helpProvided: number;
    engagementLevel: 'low' | 'medium' | 'high';
    knowledgeShared: string[];
}
export interface SessionActivity {
    id: string;
    type: 'discussion' | 'presentation' | 'exercise' | 'quiz' | 'brainstorm' | 'review';
    title: string;
    description?: string;
    startTime: Date;
    duration: number;
    facilitator: string;
    participants: string[];
    resources: string[];
    outcomes: ActivityOutcome[];
    completed: boolean;
}
export interface ActivityOutcome {
    type: 'insight' | 'question' | 'solution' | 'decision' | 'action_item';
    content: string;
    contributors: string[];
    importance: 'low' | 'medium' | 'high';
    followUp?: string;
}
export interface SharedResource {
    id: string;
    type: 'document' | 'image' | 'video' | 'audio' | 'link' | 'code' | 'whiteboard';
    name: string;
    url?: string;
    content?: any;
    size?: number;
    mimeType?: string;
    sharedBy: string;
    sharedAt: Date;
    permissions: ResourcePermissions;
    annotations: ResourceAnnotation[];
    versions: ResourceVersion[];
}
export interface ResourcePermissions {
    view: string[];
    edit: string[];
    download: string[];
    share: string[];
    public: boolean;
}
export interface ResourceAnnotation {
    id: string;
    type: 'highlight' | 'comment' | 'question' | 'suggestion';
    content: string;
    position?: {
        x: number;
        y: number;
        page?: number;
    };
    author: string;
    created: Date;
    resolved?: boolean;
    replies: AnnotationReply[];
}
export interface AnnotationReply {
    id: string;
    content: string;
    author: string;
    created: Date;
}
export interface ResourceVersion {
    version: string;
    changes: string;
    author: string;
    timestamp: Date;
    size: number;
}
export interface ChatMessage {
    id: string;
    type: 'text' | 'image' | 'file' | 'poll' | 'reaction' | 'system';
    content: string;
    author: string;
    timestamp: Date;
    edited?: boolean;
    editedAt?: Date;
    replyTo?: string;
    mentions: string[];
    reactions: MessageReaction[];
    attachments: MessageAttachment[];
    metadata?: Record<string, any>;
}
export interface MessageReaction {
    emoji: string;
    users: string[];
    count: number;
}
export interface MessageAttachment {
    id: string;
    type: 'image' | 'file' | 'link';
    name: string;
    url: string;
    size?: number;
    preview?: string;
}
export interface WhiteboardState {
    id: string;
    elements: WhiteboardElement[];
    backgroundColor: string;
    dimensions: {
        width: number;
        height: number;
    };
    currentPage: number;
    totalPages: number;
    collaborators: WhiteboardCollaborator[];
    history: WhiteboardHistoryEntry[];
    settings: WhiteboardSettings;
}
export interface WhiteboardElement {
    id: string;
    type: 'path' | 'rectangle' | 'circle' | 'text' | 'image' | 'arrow' | 'line';
    position: {
        x: number;
        y: number;
    };
    dimensions?: {
        width: number;
        height: number;
    };
    style: ElementStyle;
    content?: string;
    author: string;
    created: Date;
    lastModified: Date;
    locked?: boolean;
}
export interface ElementStyle {
    stroke: string;
    strokeWidth: number;
    fill?: string;
    opacity: number;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
}
export interface WhiteboardCollaborator {
    participantId: string;
    cursor: {
        x: number;
        y: number;
    };
    tool: string;
    color: string;
    isActive: boolean;
}
export interface WhiteboardHistoryEntry {
    id: string;
    action: 'add' | 'edit' | 'delete' | 'move' | 'resize';
    elementId: string;
    before?: any;
    after?: any;
    author: string;
    timestamp: Date;
}
export interface WhiteboardSettings {
    gridEnabled: boolean;
    snapToGrid: boolean;
    gridSize: number;
    infiniteCanvas: boolean;
    collaborativeCursors: boolean;
    realTimeSync: boolean;
}
export interface RecordingInfo {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    url?: string;
    size?: number;
    format: 'mp4' | 'webm' | 'mp3';
    quality: 'low' | 'medium' | 'high' | '4k';
    includeScreenShare: boolean;
    includeAudio: boolean;
    includeChat: boolean;
    includeWhiteboard: boolean;
    accessibility: RecordingAccessibility;
    processing: RecordingProcessing;
}
export interface RecordingAccessibility {
    captions: boolean;
    transcription: boolean;
    chapters: Chapter[];
    searchableContent: boolean;
}
export interface Chapter {
    title: string;
    startTime: number;
    duration: number;
    description?: string;
    speaker?: string;
}
export interface RecordingProcessing {
    status: 'processing' | 'ready' | 'failed';
    progress: number;
    estimatedCompletion?: Date;
    processingSteps: ProcessingStep[];
    errors?: string[];
}
export interface ProcessingStep {
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    estimatedTime: number;
}
export interface SessionSummary {
    id: string;
    sessionId: string;
    generatedAt: Date;
    keyTopics: string[];
    mainInsights: string[];
    questionsRaised: string[];
    decisionsArmed: string[];
    actionItems: ActionItem[];
    learningObjectivesMet: ObjectiveProgress[];
    participantHighlights: ParticipantHighlight[];
    recommendedFollowUp: string[];
    attachments: string[];
    aiGeneratedSummary: string;
    humanReviewStatus: 'pending' | 'approved' | 'needs_revision';
}
export interface ActionItem {
    id: string;
    description: string;
    assignee?: string;
    dueDate?: Date;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    dependencies: string[];
}
export interface ObjectiveProgress {
    objective: string;
    progress: number;
    achieved: boolean;
    evidence: string[];
    contributors: string[];
}
export interface ParticipantHighlight {
    participantId: string;
    highlights: string[];
    contributions: string[];
    learningGains: string[];
    improvementAreas: string[];
}
export interface SessionFeedback {
    id: string;
    sessionId: string;
    participantId: string;
    rating: number;
    aspects: FeedbackAspect[];
    comments?: string;
    suggestions?: string;
    wouldRecommend: boolean;
    anonymous: boolean;
    submittedAt: Date;
}
export interface FeedbackAspect {
    aspect: 'content' | 'facilitation' | 'participation' | 'technology' | 'outcomes';
    rating: number;
    comment?: string;
}
export interface SessionMetadata {
    framework?: string;
    difficulty: number;
    effectiveness: number;
    engagementLevel: number;
    learningVelocity: number;
    collaborationQuality: number;
    technicalQuality: number;
    participantSatisfaction: number;
    recordingViews?: number;
    resourceDownloads?: number;
    followUpSessions: string[];
}
export interface NotificationSettings {
    participantJoined: boolean;
    participantLeft: boolean;
    newMessage: boolean;
    directMention: boolean;
    screenShareStarted: boolean;
    recordingStarted: boolean;
    sessionStarting: boolean;
    sessionEnding: boolean;
    sound: boolean;
    desktop: boolean;
    email: boolean;
}
export interface ModerationSettings {
    profanityFilter: boolean;
    spamDetection: boolean;
    autoMuteDisruptive: boolean;
    requireApprovalToJoin: boolean;
    maxConsecutiveMessages: number;
    messageRateLimit: number;
    reportingEnabled: boolean;
    autoModActions: AutoModAction[];
}
export interface AutoModAction {
    trigger: string;
    action: 'warn' | 'mute' | 'kick' | 'ban' | 'alert_moderator';
    duration?: number;
    severity: number;
}
export interface CollaborationEngine {
    createRoom(config: Partial<CollaborationRoom>): Promise<CollaborationRoom>;
    joinRoom(roomId: string, userId: string): Promise<Participant>;
    leaveRoom(roomId: string, participantId: string): Promise<void>;
    startSession(roomId: string, config: Partial<CollaborationSession>): Promise<CollaborationSession>;
    endSession(sessionId: string): Promise<SessionSummary>;
    sendMessage(sessionId: string, message: Partial<ChatMessage>): Promise<ChatMessage>;
    shareResource(sessionId: string, resource: Partial<SharedResource>): Promise<SharedResource>;
    updateWhiteboard(sessionId: string, changes: WhiteboardElement[]): Promise<WhiteboardState>;
    startRecording(sessionId: string, options: Partial<RecordingInfo>): Promise<RecordingInfo>;
    stopRecording(recordingId: string): Promise<RecordingInfo>;
    generateSummary(sessionId: string): Promise<SessionSummary>;
    subscribeToEvents(sessionId: string, callback: (event: CollaborationEvent) => void): Promise<string>;
}
export interface CollaborationEvent {
    type: CollaborationEventType;
    sessionId: string;
    data: any;
    timestamp: Date;
    source: string;
}
export type CollaborationEventType = 'participant_joined' | 'participant_left' | 'participant_status_changed' | 'message_posted' | 'message_edited' | 'message_deleted' | 'resource_shared' | 'resource_updated' | 'whiteboard_updated' | 'screen_share_started' | 'screen_share_stopped' | 'recording_started' | 'recording_stopped' | 'session_started' | 'session_paused' | 'session_resumed' | 'session_ended' | 'activity_started' | 'activity_completed' | 'poll_created' | 'poll_voted' | 'reaction_added' | 'connection_quality_changed' | 'error_occurred';
export interface PollData {
    id: string;
    question: string;
    options: PollOption[];
    allowMultiple: boolean;
    anonymous: boolean;
    timeLimit?: number;
    createdBy: string;
    createdAt: Date;
    closedAt?: Date;
    results: PollResults;
}
export interface PollOption {
    id: string;
    text: string;
    votes: number;
    voters: string[];
}
export interface PollResults {
    totalVotes: number;
    participation: number;
    topChoice: string;
    insights: string[];
}
export interface BreakoutRoom {
    id: string;
    parentSessionId: string;
    name: string;
    participants: string[];
    topic?: string;
    duration: number;
    autoAssigned: boolean;
    facilitator?: string;
    status: 'active' | 'completed' | 'abandoned';
    chat: ChatMessage[];
    outcomes: string[];
    createdAt: Date;
    endedAt?: Date;
}
export interface LearningPath {
    id: string;
    title: string;
    description: string;
    sessions: string[];
    prerequisites: string[];
    estimatedDuration: number;
    difficulty: number;
    completionRate: number;
    collaborative: boolean;
    maxGroupSize?: number;
    frameworks: string[];
    outcomes: string[];
    certification?: CertificationInfo;
}
export interface CertificationInfo {
    id: string;
    name: string;
    issuer: string;
    criteria: CertificationCriteria[];
    validityPeriod?: number;
    renewalRequired: boolean;
}
export interface CertificationCriteria {
    type: 'attendance' | 'participation' | 'assessment' | 'project';
    description: string;
    threshold: number;
    weight: number;
}
export interface MentorshipMatch {
    id: string;
    mentor: string;
    mentee: string;
    topic: string;
    framework?: string;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    schedule: MentorshipSchedule;
    goals: string[];
    progress: MentorshipProgress[];
    feedback: MentorshipFeedback[];
}
export interface MentorshipSchedule {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    duration: number;
    preferredTimes: TimeSlot[];
    nextSession?: Date;
}
export interface MentorshipProgress {
    date: Date;
    goals: GoalProgress[];
    insights: string[];
    challenges: string[];
    nextSteps: string[];
    rating: number;
}
export interface GoalProgress {
    goal: string;
    progress: number;
    notes: string;
    evidence: string[];
}
export interface MentorshipFeedback {
    from: 'mentor' | 'mentee';
    rating: number;
    aspects: FeedbackAspect[];
    comments: string;
    improvements: string[];
    date: Date;
}
