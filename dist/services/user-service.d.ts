/**
 * User Service
 * Manages user profiles, preferences, and voice DNA
 */
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    preferences: UserPreferences;
    voiceDNA: VoiceDNA;
    contentHistory: ContentHistoryEntry[];
    stats: UserStats;
}
export interface UserPreferences {
    defaultMode: 'quick' | 'standard';
    defaultPlatforms: string[];
    voiceProfile: 'casual' | 'professional' | 'academic' | 'technical';
    language: string;
    timezone: string;
    notifications: {
        email: boolean;
        webhooks: boolean;
    };
    autoSave: boolean;
    qualityThreshold: number;
}
export interface VoiceDNA {
    linguistic: {
        avgSentenceLength: number;
        vocabularyComplexity: number;
        punctuationStyle: string;
        paragraphStructure: string;
    };
    tone: {
        formality: number;
        emotion: number;
        authority: number;
        humor: number;
        energy: number;
    };
    style: {
        conversational: boolean;
        dataOriented: boolean;
        storytelling: boolean;
        academic: boolean;
    };
    patterns: {
        openingStyle: string[];
        closingStyle: string[];
        transitionPhrases: string[];
        emphasisMarkers: string[];
    };
    samples: string[];
}
export interface ContentHistoryEntry {
    id: string;
    topic: string;
    platforms: string[];
    mode: string;
    quality: number;
    createdAt: Date;
    wordCount: number;
    engagementScore: number;
}
export interface UserStats {
    totalWorkflows: number;
    successfulWorkflows: number;
    totalContent: number;
    avgQuality: number;
    avgDuration: number;
    favoriteTopics: string[];
    favoritePlatforms: string[];
    lastActive: Date;
}
export declare class UserService {
    private users;
    private dataDir;
    private currentUser;
    constructor(dataDir?: string);
    /**
     * Create new user profile
     */
    createUser(name: string, email: string): UserProfile;
    /**
     * Get user profile
     */
    getUser(userId: string): UserProfile | null;
    /**
     * Get user by email
     */
    getUserByEmail(email: string): UserProfile | null;
    /**
     * Update user preferences
     */
    updatePreferences(userId: string, preferences: Partial<UserPreferences>): void;
    /**
     * Update voice DNA from content samples
     */
    updateVoiceDNA(userId: string, contentSamples: string[]): void;
    /**
     * Add content to history
     */
    addToHistory(userId: string, entry: Omit<ContentHistoryEntry, 'id' | 'createdAt'>): void;
    /**
     * Get user recommendations
     */
    getRecommendations(userId: string): any;
    /**
     * Export user data
     */
    exportUserData(userId: string): string;
    /**
     * Import voice DNA from file
     */
    importVoiceDNA(userId: string, filepath: string): void;
    /**
     * Set current user
     */
    setCurrentUser(userId: string): void;
    /**
     * Get current user
     */
    getCurrentUser(): UserProfile | null;
    /**
     * List all users
     */
    listUsers(): UserProfile[];
    private generateUserId;
    private getDefaultPreferences;
    private getDefaultVoiceDNA;
    private getDefaultStats;
    private analyzeVoice;
    private mergeVoiceDNA;
    private calculateComplexity;
    private calculateFormality;
    private detectHumor;
    private detectAcademic;
    private extractTransitions;
    private updateStats;
    private recommendMode;
    private recommendPlatforms;
    private recommendTopics;
    private recommendImprovements;
    private loadUsers;
    private saveUser;
}
export declare function getUserService(dataDir?: string): UserService;
export default UserService;
//# sourceMappingURL=user-service.d.ts.map