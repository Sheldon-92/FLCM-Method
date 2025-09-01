/**
 * Collaborative Mode
 * Natural language interaction with framework guidance (FLCM 2.0 style)
 */
import { SharedContext } from '../shared-context';
export declare class CollaborativeMode {
    private context;
    private logger;
    private frameworkSelector;
    private patterns;
    private currentFramework;
    private dialogueState;
    constructor(context: SharedContext);
    /**
     * Initialize collaborative patterns
     */
    private initializePatterns;
    /**
     * Process natural language input
     */
    process(input: string): Promise<string>;
    /**
     * Extract framework request from input
     */
    private extractFrameworkRequest;
    /**
     * Handle framework request
     */
    private handleFrameworkRequest;
    /**
     * Match input against patterns
     */
    private matchPattern;
    /**
     * Handle pattern match
     */
    private handlePatternMatch;
    /**
     * Handle dialogue flow based on state
     */
    private handleDialogueFlow;
    /**
     * Handle idle state
     */
    private handleIdleState;
    /**
     * Handle exploring state
     */
    private handleExploringState;
    /**
     * Handle creating state
     */
    private handleCreatingState;
    /**
     * Handle publishing state
     */
    private handlePublishingState;
    /**
     * Handle specific action
     */
    private handleAction;
    /**
     * Extract topic from input
     */
    private extractTopic;
    /**
     * Extract goal from input
     */
    private extractGoal;
    /**
     * Extract audience from input
     */
    private extractAudience;
    /**
     * Get help text
     */
    getHelp(): string;
    /**
     * Initialize mode
     */
    initialize(context: SharedContext): Promise<void>;
    /**
     * Prepare for mode switch
     */
    prepareForSwitch(): Promise<void>;
}
