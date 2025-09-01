/**
 * Real-time Collaboration Engine
 * Core engine for managing real-time collaborative learning sessions
 */
/// <reference types="node" />
import { CollaborationRoom, Participant, CollaborationSession, ChatMessage, SharedResource, WhiteboardState, WhiteboardElement, RecordingInfo, SessionSummary, CollaborationEvent, CollaborationEngine as ICollaborationEngine } from './types';
import { EventEmitter } from 'events';
export declare class RealtimeCollaborationEngine extends EventEmitter implements ICollaborationEngine {
    private logger;
    private rooms;
    private sessions;
    private subscribers;
    private recordings;
    private webSocketServer;
    private webRTCSignaling;
    private messageQueue;
    private presenceManager;
    private moderationEngine;
    private aiAssistant;
    constructor();
    /**
     * Create a new collaboration room
     */
    createRoom(config: Partial<CollaborationRoom>): Promise<CollaborationRoom>;
    /**
     * Join a collaboration room
     */
    joinRoom(roomId: string, userId: string): Promise<Participant>;
    /**
     * Leave a collaboration room
     */
    leaveRoom(roomId: string, participantId: string): Promise<void>;
    /**
     * Start a collaboration session
     */
    startSession(roomId: string, config: Partial<CollaborationSession>): Promise<CollaborationSession>;
    /**
     * End a collaboration session
     */
    endSession(sessionId: string): Promise<SessionSummary>;
    /**
     * Send a chat message
     */
    sendMessage(sessionId: string, message: Partial<ChatMessage>): Promise<ChatMessage>;
    /**
     * Share a resource in the session
     */
    shareResource(sessionId: string, resource: Partial<SharedResource>): Promise<SharedResource>;
    /**
     * Update whiteboard
     */
    updateWhiteboard(sessionId: string, changes: WhiteboardElement[]): Promise<WhiteboardState>;
    /**
     * Start recording session
     */
    startRecording(sessionId: string, options: Partial<RecordingInfo>): Promise<RecordingInfo>;
    /**
     * Stop recording session
     */
    stopRecording(recordingId: string): Promise<RecordingInfo>;
    /**
     * Generate session summary
     */
    generateSummary(sessionId: string): Promise<SessionSummary>;
    /**
     * Subscribe to collaboration events
     */
    subscribeToEvents(sessionId: string, callback: (event: CollaborationEvent) => void): Promise<string>;
    private initializeWebSocketServer;
    private startHeartbeatMonitor;
    private checkParticipantConnections;
    private createInitialWhiteboardState;
    private canJoinRoom;
    private determineParticipantRole;
    private determineParticipantCapabilities;
    private setupWebRTCConnection;
    private cleanupWebRTCConnection;
    private broadcastEvent;
    private addSystemMessage;
    private isQuestion;
    private startMediaRecording;
    private stopMediaRecording;
}
