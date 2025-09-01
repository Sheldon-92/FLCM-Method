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
  framework?: string; // Optional framework focus
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
  maxSessionDuration: number; // minutes
  idleTimeout: number; // minutes
  notificationSettings: NotificationSettings;
  moderationSettings: ModerationSettings;
}

export interface RoomPermissions {
  owner: string; // User ID of room owner
  moderators: string[]; // User IDs of moderators
  speakers: string[]; // Users who can speak/present
  defaultRole: ParticipantRole;
  guestAccess: boolean;
  recordingAccess: 'owner_only' | 'moderators' | 'all_participants';
  whiteboard: 'owner_only' | 'moderators' | 'speakers' | 'all_participants';
  screenShare: 'owner_only' | 'moderators' | 'speakers' | 'all_participants';
}

export interface ScheduleInfo {
  recurring: boolean;
  startTime: Date;
  duration: number; // minutes
  timezone: string;
  recurrence?: RecurrencePattern;
  reminders: ReminderSettings[];
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // Every N days/weeks/months
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  endDate?: Date;
  maxOccurrences?: number;
}

export interface ReminderSettings {
  type: 'email' | 'push' | 'in_app';
  timing: number; // minutes before session
  enabled: boolean;
}

export interface RoomMetadata {
  totalSessions: number;
  totalDuration: number; // minutes
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
  participantRetention: number; // 0-1 scale
}

export interface LearningOutcome {
  metric: string;
  value: number;
  improvement: number; // percentage change
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
  latency: number; // milliseconds
  bandwidth: number; // mbps
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
  totalSessionTime: number; // minutes
  messagesPosted: number;
  questionsAsked: number;
  answersGiven: number;
  screensShared: number;
  whiteboardContributions: number;
  engagementScore: number; // 0-100
  learningContribution: number; // 0-100
}

export interface CollaborationSession {
  id: string;
  roomId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
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
  duration: number; // minutes
  contribution: ParticipantContribution;
  satisfaction?: number; // 1-5 scale
}

export interface ParticipantContribution {
  messagesCount: number;
  screenShareTime: number; // minutes
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
  duration: number; // minutes
  facilitator: string; // Participant ID
  participants: string[]; // Participant IDs
  resources: string[]; // Resource IDs
  outcomes: ActivityOutcome[];
  completed: boolean;
}

export interface ActivityOutcome {
  type: 'insight' | 'question' | 'solution' | 'decision' | 'action_item';
  content: string;
  contributors: string[]; // Participant IDs
  importance: 'low' | 'medium' | 'high';
  followUp?: string;
}

export interface SharedResource {
  id: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'link' | 'code' | 'whiteboard';
  name: string;
  url?: string;
  content?: any;
  size?: number; // bytes
  mimeType?: string;
  sharedBy: string; // Participant ID
  sharedAt: Date;
  permissions: ResourcePermissions;
  annotations: ResourceAnnotation[];
  versions: ResourceVersion[];
}

export interface ResourcePermissions {
  view: string[]; // Participant IDs who can view
  edit: string[]; // Participant IDs who can edit
  download: string[]; // Participant IDs who can download
  share: string[]; // Participant IDs who can share further
  public: boolean; // Available after session
}

export interface ResourceAnnotation {
  id: string;
  type: 'highlight' | 'comment' | 'question' | 'suggestion';
  content: string;
  position?: { x: number; y: number; page?: number };
  author: string; // Participant ID
  created: Date;
  resolved?: boolean;
  replies: AnnotationReply[];
}

export interface AnnotationReply {
  id: string;
  content: string;
  author: string; // Participant ID
  created: Date;
}

export interface ResourceVersion {
  version: string;
  changes: string;
  author: string; // Participant ID
  timestamp: Date;
  size: number;
}

export interface ChatMessage {
  id: string;
  type: 'text' | 'image' | 'file' | 'poll' | 'reaction' | 'system';
  content: string;
  author: string; // Participant ID
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  replyTo?: string; // Message ID
  mentions: string[]; // Participant IDs
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  emoji: string;
  users: string[]; // Participant IDs
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
  dimensions: { width: number; height: number };
  currentPage: number;
  totalPages: number;
  collaborators: WhiteboardCollaborator[];
  history: WhiteboardHistoryEntry[];
  settings: WhiteboardSettings;
}

export interface WhiteboardElement {
  id: string;
  type: 'path' | 'rectangle' | 'circle' | 'text' | 'image' | 'arrow' | 'line';
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  style: ElementStyle;
  content?: string;
  author: string; // Participant ID
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
  cursor: { x: number; y: number };
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
  author: string; // Participant ID
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
  duration: number; // minutes
  url?: string;
  size?: number; // bytes
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
  startTime: number; // seconds
  duration: number; // seconds
  description?: string;
  speaker?: string;
}

export interface RecordingProcessing {
  status: 'processing' | 'ready' | 'failed';
  progress: number; // 0-100
  estimatedCompletion?: Date;
  processingSteps: ProcessingStep[];
  errors?: string[];
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime: number; // seconds
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
  attachments: string[]; // Resource IDs
  aiGeneratedSummary: string;
  humanReviewStatus: 'pending' | 'approved' | 'needs_revision';
}

export interface ActionItem {
  id: string;
  description: string;
  assignee?: string; // Participant ID
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dependencies: string[]; // Other action item IDs
}

export interface ObjectiveProgress {
  objective: string;
  progress: number; // 0-100
  achieved: boolean;
  evidence: string[];
  contributors: string[]; // Participant IDs
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
  rating: number; // 1-5 scale
  aspects: FeedbackAspect[];
  comments?: string;
  suggestions?: string;
  wouldRecommend: boolean;
  anonymous: boolean;
  submittedAt: Date;
}

export interface FeedbackAspect {
  aspect: 'content' | 'facilitation' | 'participation' | 'technology' | 'outcomes';
  rating: number; // 1-5 scale
  comment?: string;
}

export interface SessionMetadata {
  framework?: string;
  difficulty: number;
  effectiveness: number; // 0-1 scale
  engagementLevel: number; // 0-1 scale
  learningVelocity: number; // objectives per hour
  collaborationQuality: number; // 0-1 scale
  technicalQuality: number; // 0-1 scale
  participantSatisfaction: number; // 1-5 scale
  recordingViews?: number;
  resourceDownloads?: number;
  followUpSessions: string[]; // Session IDs
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
  messageRateLimit: number; // messages per minute
  reportingEnabled: boolean;
  autoModActions: AutoModAction[];
}

export interface AutoModAction {
  trigger: string;
  action: 'warn' | 'mute' | 'kick' | 'ban' | 'alert_moderator';
  duration?: number; // minutes, for temporary actions
  severity: number; // 1-10 scale
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
  source: string; // Participant ID or 'system'
}

export type CollaborationEventType =
  | 'participant_joined'
  | 'participant_left'
  | 'participant_status_changed'
  | 'message_posted'
  | 'message_edited'
  | 'message_deleted'
  | 'resource_shared'
  | 'resource_updated'
  | 'whiteboard_updated'
  | 'screen_share_started'
  | 'screen_share_stopped'
  | 'recording_started'
  | 'recording_stopped'
  | 'session_started'
  | 'session_paused'
  | 'session_resumed'
  | 'session_ended'
  | 'activity_started'
  | 'activity_completed'
  | 'poll_created'
  | 'poll_voted'
  | 'reaction_added'
  | 'connection_quality_changed'
  | 'error_occurred';

export interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  anonymous: boolean;
  timeLimit?: number; // seconds
  createdBy: string; // Participant ID
  createdAt: Date;
  closedAt?: Date;
  results: PollResults;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // Participant IDs if not anonymous
}

export interface PollResults {
  totalVotes: number;
  participation: number; // percentage of eligible participants
  topChoice: string; // Option ID
  insights: string[];
}

export interface BreakoutRoom {
  id: string;
  parentSessionId: string;
  name: string;
  participants: string[]; // Participant IDs
  topic?: string;
  duration: number; // minutes
  autoAssigned: boolean;
  facilitator?: string; // Participant ID
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
  sessions: string[]; // Session IDs in order
  prerequisites: string[];
  estimatedDuration: number; // hours
  difficulty: number; // 1-10
  completionRate: number; // 0-1
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
  validityPeriod?: number; // months
  renewalRequired: boolean;
}

export interface CertificationCriteria {
  type: 'attendance' | 'participation' | 'assessment' | 'project';
  description: string;
  threshold: number;
  weight: number; // 0-1, sum should equal 1
}

export interface MentorshipMatch {
  id: string;
  mentor: string; // User ID
  mentee: string; // User ID
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
  duration: number; // minutes per session
  preferredTimes: TimeSlot[];
  nextSession?: Date;
}

export interface MentorshipProgress {
  date: Date;
  goals: GoalProgress[];
  insights: string[];
  challenges: string[];
  nextSteps: string[];
  rating: number; // 1-5 scale
}

export interface GoalProgress {
  goal: string;
  progress: number; // 0-100
  notes: string;
  evidence: string[];
}

export interface MentorshipFeedback {
  from: 'mentor' | 'mentee';
  rating: number; // 1-5 scale
  aspects: FeedbackAspect[];
  comments: string;
  improvements: string[];
  date: Date;
}