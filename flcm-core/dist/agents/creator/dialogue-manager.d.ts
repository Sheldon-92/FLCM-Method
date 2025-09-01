/**
 * Dialogue Manager
 * Manages interactive content creation sessions
 */
import { InsightsDocument } from '../../shared/pipeline/document-schema';
import { VoiceDNAProfile } from './index';
import { Feedback } from './content-generator';
export interface DialogueSession {
    id: string;
    startTime: Date;
    insights: InsightsDocument;
    profile: VoiceDNAProfile;
    title?: string;
    context: DialogueContext;
    history: DialogueExchange[];
    currentState: DialogueState;
}
export interface DialogueContext {
    topic: string;
    goals: string[];
    constraints: string[];
    preferences: Record<string, any>;
}
export interface DialogueExchange {
    timestamp: Date;
    question: string;
    response?: string;
    feedback?: Feedback;
}
export declare enum DialogueState {
    INITIALIZING = "initializing",
    QUESTIONING = "questioning",
    REFINING = "refining",
    FINALIZING = "finalizing",
    COMPLETE = "complete"
}
export declare class DialogueManager {
    private sessions;
    /**
     * Start a new dialogue session
     */
    startSession(options: {
        insights: InsightsDocument;
        profile: VoiceDNAProfile;
        interactive: boolean;
    }): Promise<DialogueSession>;
    /**
     * Get feedback on content
     */
    getFeedback(session: DialogueSession, content: string): Promise<Feedback>;
    /**
     * Initialize interactive session
     */
    private initializeInteractive;
    /**
     * Extract context from insights
     */
    private extractContext;
    /**
     * Generate questions based on content
     */
    private generateQuestions;
    /**
     * Simulate user responses (placeholder for actual user input)
     */
    private simulateResponses;
    /**
     * Get simulated response for a question
     */
    private getSimulatedResponse;
    /**
     * Process responses into feedback
     */
    private processResponses;
    /**
     * Update session state based on feedback
     */
    private updateSessionState;
    /**
     * Extract title from dialogue history
     */
    private extractTitle;
    /**
     * Generate session ID
     */
    private generateSessionId;
    /**
     * End a session
     */
    endSession(sessionId: string): void;
    /**
     * Get session by ID
     */
    getSession(sessionId: string): DialogueSession | undefined;
}
