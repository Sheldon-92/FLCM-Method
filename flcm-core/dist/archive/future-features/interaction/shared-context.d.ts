/**
 * Shared Context
 * Maintains context across mode switches
 */
import { ConversationEntry, Document, SessionData, InteractionMode, ModeContext } from './types';
export declare class SharedContext {
    private conversationHistory;
    private activeDocuments;
    private frameworkState;
    private sessionData;
    private logger;
    private maxHistorySize;
    constructor();
    /**
     * Add conversation entry
     */
    addConversationEntry(entry: ConversationEntry): void;
    /**
     * Get conversation history
     */
    getConversationHistory(limit?: number): ConversationEntry[];
    /**
     * Add or update active document
     */
    setActiveDocument(doc: Document): void;
    /**
     * Get active documents
     */
    getActiveDocuments(): Map<string, Document>;
    /**
     * Get specific active document
     */
    getActiveDocument(id: string): Document | undefined;
    /**
     * Remove active document
     */
    removeActiveDocument(id: string): boolean;
    /**
     * Set framework state
     */
    setFrameworkState(framework: string, state: any): void;
    /**
     * Get framework state
     */
    getFrameworkState(framework?: string): Map<string, any> | any;
    /**
     * Clear framework state
     */
    clearFrameworkState(framework?: string): void;
    /**
     * Get session data
     */
    getSessionData(): SessionData;
    /**
     * Increment mode switches counter
     */
    incrementModeSwitches(): void;
    /**
     * Migrate context between modes
     */
    migrateContext(fromMode: InteractionMode, toMode: InteractionMode): Promise<boolean>;
    /**
     * Transform command context to collaborative
     */
    private transformCommandToCollaborative;
    /**
     * Extract structured data from conversation
     */
    private extractStructuredFromConversation;
    /**
     * Analyze command intents
     */
    private analyzeCommandIntents;
    /**
     * Suggest frameworks based on intents
     */
    private suggestFrameworksFromIntents;
    /**
     * Extract topic from commands
     */
    private extractTopicFromCommands;
    /**
     * Infer goal from commands
     */
    private inferGoalFromCommands;
    /**
     * Extract file paths from conversations
     */
    private extractFilePaths;
    /**
     * Extract actions from conversations
     */
    private extractActions;
    /**
     * Extract parameters from conversations
     */
    private extractParameters;
    /**
     * Serialize context for storage
     */
    serialize(): string;
    /**
     * Deserialize context from storage
     */
    deserialize(data: string): void;
    /**
     * Restore from mode context
     */
    restore(context: ModeContext): Promise<void>;
    /**
     * Generate session ID
     */
    private generateSessionId;
    /**
     * Clear all context
     */
    clear(): void;
}
