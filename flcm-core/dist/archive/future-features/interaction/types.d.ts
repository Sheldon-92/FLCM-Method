/**
 * Interaction System Types
 */
export type InteractionMode = 'command' | 'collaborative';
export interface ModeContext {
    mode: InteractionMode;
    conversation_history: ConversationEntry[];
    active_documents: Map<string, Document>;
    framework_state: Map<string, any>;
    user_preferences: UserPreferences;
    session_data: SessionData;
}
export interface ConversationEntry {
    timestamp: Date;
    mode: InteractionMode;
    input: string;
    output: string;
    metadata?: Record<string, any>;
}
export interface Document {
    id: string;
    path: string;
    content: string;
    type: 'insights' | 'knowledge' | 'content' | 'legacy';
    version: '1.0' | '2.0';
    metadata: Record<string, any>;
}
export interface UserPreferences {
    default_mode: InteractionMode;
    auto_suggest_frameworks: boolean;
    show_deprecation_warnings: boolean;
    preserve_context_on_switch: boolean;
    command_aliases: CommandAlias[];
    collaborative_style: CollaborativeStyle;
}
export interface CommandAlias {
    old: string;
    new: string;
}
export interface CollaborativeStyle {
    verbosity: 'minimal' | 'normal' | 'detailed';
    guidance_level: 'beginner' | 'intermediate' | 'expert';
}
export interface SessionData {
    session_id: string;
    start_time: Date;
    mode_switches: number;
    commands_executed: number;
    frameworks_used: string[];
}
export interface CommandMapping {
    handler: string;
    deprecation?: string;
    replacement?: string;
    aliases?: string[];
}
export interface CollaborativePattern {
    pattern: RegExp;
    action: string;
    suggest_frameworks?: boolean;
    load_voice?: boolean;
    check_platforms?: boolean;
}
export interface ModeTransition {
    from: InteractionMode;
    to: InteractionMode;
    timestamp: Date;
    context_preserved: boolean;
    reason?: string;
}
