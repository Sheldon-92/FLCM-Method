/**
 * Shared Context
 * Maintains context across mode switches
 */

import {
  ConversationEntry,
  Document,
  SessionData,
  InteractionMode,
  ModeContext
} from './types';
import { Logger } from '../shared/utils/logger';

export class SharedContext {
  private conversationHistory: ConversationEntry[];
  private activeDocuments: Map<string, Document>;
  private frameworkState: Map<string, any>;
  private sessionData: SessionData;
  private logger: Logger;
  private maxHistorySize: number = 100;
  
  constructor() {
    this.logger = new Logger('SharedContext');
    this.conversationHistory = [];
    this.activeDocuments = new Map();
    this.frameworkState = new Map();
    
    // Initialize session
    this.sessionData = {
      session_id: this.generateSessionId(),
      start_time: new Date(),
      mode_switches: 0,
      commands_executed: 0,
      frameworks_used: []
    };
    
    this.logger.debug('Context initialized', { session_id: this.sessionData.session_id });
  }
  
  /**
   * Add conversation entry
   */
  addConversationEntry(entry: ConversationEntry): void {
    this.conversationHistory.push(entry);
    
    // Maintain history size limit
    if (this.conversationHistory.length > this.maxHistorySize) {
      this.conversationHistory.shift();
    }
    
    // Update session stats
    if (entry.mode === 'command') {
      this.sessionData.commands_executed++;
    }
  }
  
  /**
   * Get conversation history
   */
  getConversationHistory(limit?: number): ConversationEntry[] {
    if (limit) {
      return this.conversationHistory.slice(-limit);
    }
    return [...this.conversationHistory];
  }
  
  /**
   * Add or update active document
   */
  setActiveDocument(doc: Document): void {
    this.activeDocuments.set(doc.id, doc);
    this.logger.debug('Document activated', { id: doc.id, type: doc.type });
  }
  
  /**
   * Get active documents
   */
  getActiveDocuments(): Map<string, Document> {
    return new Map(this.activeDocuments);
  }
  
  /**
   * Get specific active document
   */
  getActiveDocument(id: string): Document | undefined {
    return this.activeDocuments.get(id);
  }
  
  /**
   * Remove active document
   */
  removeActiveDocument(id: string): boolean {
    return this.activeDocuments.delete(id);
  }
  
  /**
   * Set framework state
   */
  setFrameworkState(framework: string, state: any): void {
    this.frameworkState.set(framework, state);
    
    // Track framework usage
    if (!this.sessionData.frameworks_used.includes(framework)) {
      this.sessionData.frameworks_used.push(framework);
    }
  }
  
  /**
   * Get framework state
   */
  getFrameworkState(framework?: string): Map<string, any> | any {
    if (framework) {
      return this.frameworkState.get(framework);
    }
    return new Map(this.frameworkState);
  }
  
  /**
   * Clear framework state
   */
  clearFrameworkState(framework?: string): void {
    if (framework) {
      this.frameworkState.delete(framework);
    } else {
      this.frameworkState.clear();
    }
  }
  
  /**
   * Get session data
   */
  getSessionData(): SessionData {
    return { ...this.sessionData };
  }
  
  /**
   * Increment mode switches counter
   */
  incrementModeSwitches(): void {
    this.sessionData.mode_switches++;
  }
  
  /**
   * Migrate context between modes
   */
  async migrateContext(fromMode: InteractionMode, toMode: InteractionMode): Promise<boolean> {
    try {
      this.logger.info(`Migrating context from ${fromMode} to ${toMode}`);
      
      if (fromMode === 'command' && toMode === 'collaborative') {
        await this.transformCommandToCollaborative();
      } else if (fromMode === 'collaborative' && toMode === 'command') {
        await this.extractStructuredFromConversation();
      }
      
      this.logger.info('Context migration successful');
      return true;
      
    } catch (error) {
      this.logger.error('Context migration failed', { error });
      return false;
    }
  }
  
  /**
   * Transform command context to collaborative
   */
  private async transformCommandToCollaborative(): Promise<void> {
    // Extract intent from recent commands
    const recentCommands = this.conversationHistory
      .filter(e => e.mode === 'command')
      .slice(-5);
    
    if (recentCommands.length > 0) {
      // Analyze command patterns
      const intents = this.analyzeCommandIntents(recentCommands);
      
      // Create collaborative context
      const collaborativeContext = {
        suggested_frameworks: this.suggestFrameworksFromIntents(intents),
        current_topic: this.extractTopicFromCommands(recentCommands),
        user_goal: this.inferGoalFromCommands(recentCommands)
      };
      
      // Store in framework state for collaborative mode
      this.setFrameworkState('collaborative_context', collaborativeContext);
    }
  }
  
  /**
   * Extract structured data from conversation
   */
  private async extractStructuredFromConversation(): Promise<void> {
    // Extract structured information from natural language
    const recentConversations = this.conversationHistory
      .filter(e => e.mode === 'collaborative')
      .slice(-5);
    
    if (recentConversations.length > 0) {
      // Extract key information
      const structured = {
        files_mentioned: this.extractFilePaths(recentConversations),
        actions_requested: this.extractActions(recentConversations),
        parameters: this.extractParameters(recentConversations)
      };
      
      // Store for command mode
      this.setFrameworkState('command_context', structured);
    }
  }
  
  /**
   * Analyze command intents
   */
  private analyzeCommandIntents(commands: ConversationEntry[]): string[] {
    const intents: string[] = [];
    
    commands.forEach(cmd => {
      const input = cmd.input.toLowerCase();
      
      if (input.includes('collect') || input.includes('gather')) {
        intents.push('exploration');
      } else if (input.includes('create') || input.includes('write')) {
        intents.push('creation');
      } else if (input.includes('analyze') || input.includes('understand')) {
        intents.push('analysis');
      } else if (input.includes('publish') || input.includes('post')) {
        intents.push('publishing');
      }
    });
    
    return [...new Set(intents)];
  }
  
  /**
   * Suggest frameworks based on intents
   */
  private suggestFrameworksFromIntents(intents: string[]): string[] {
    const suggestions: string[] = [];
    
    intents.forEach(intent => {
      switch (intent) {
        case 'exploration':
          suggestions.push('rice', 'five_w2h');
          break;
        case 'creation':
          suggestions.push('voice_dna', 'pyramid');
          break;
        case 'analysis':
          suggestions.push('swot_used', 'socratic');
          break;
        case 'publishing':
          suggestions.push('pyramid', 'scamper');
          break;
      }
    });
    
    return [...new Set(suggestions)];
  }
  
  /**
   * Extract topic from commands
   */
  private extractTopicFromCommands(commands: ConversationEntry[]): string | null {
    // Look for file names or explicit topics
    for (const cmd of commands) {
      const fileMatch = cmd.input.match(/["']([^"']+)["']/);
      if (fileMatch) {
        return fileMatch[1];
      }
    }
    
    return null;
  }
  
  /**
   * Infer goal from commands
   */
  private inferGoalFromCommands(commands: ConversationEntry[]): string {
    const actions = commands.map(c => {
      const verb = c.input.split(' ')[0].toLowerCase();
      return verb;
    });
    
    if (actions.includes('create') || actions.includes('write')) {
      return 'Create content';
    } else if (actions.includes('analyze') || actions.includes('understand')) {
      return 'Analyze and understand';
    } else if (actions.includes('publish') || actions.includes('post')) {
      return 'Publish to platforms';
    }
    
    return 'Process information';
  }
  
  /**
   * Extract file paths from conversations
   */
  private extractFilePaths(conversations: ConversationEntry[]): string[] {
    const paths: string[] = [];
    
    conversations.forEach(conv => {
      // Look for file patterns
      const filePattern = /[./][\w-]+\.\w+/g;
      const matches = conv.input.match(filePattern);
      if (matches) {
        paths.push(...matches);
      }
    });
    
    return [...new Set(paths)];
  }
  
  /**
   * Extract actions from conversations
   */
  private extractActions(conversations: ConversationEntry[]): string[] {
    const actions: string[] = [];
    const actionVerbs = ['explore', 'create', 'analyze', 'publish', 'understand', 'write'];
    
    conversations.forEach(conv => {
      const words = conv.input.toLowerCase().split(' ');
      const foundActions = words.filter(w => actionVerbs.includes(w));
      actions.push(...foundActions);
    });
    
    return [...new Set(actions)];
  }
  
  /**
   * Extract parameters from conversations
   */
  private extractParameters(conversations: ConversationEntry[]): Record<string, any> {
    const params: Record<string, any> = {};
    
    conversations.forEach(conv => {
      // Extract quoted strings as values
      const quotes = conv.input.match(/"([^"]+)"/g);
      if (quotes) {
        params.values = quotes.map(q => q.replace(/"/g, ''));
      }
      
      // Extract numbers
      const numbers = conv.input.match(/\d+/g);
      if (numbers) {
        params.numbers = numbers.map(n => parseInt(n));
      }
    });
    
    return params;
  }
  
  /**
   * Serialize context for storage
   */
  serialize(): string {
    return JSON.stringify({
      conversation_history: this.conversationHistory.slice(-20),
      active_documents: Array.from(this.activeDocuments.entries()),
      framework_state: Array.from(this.frameworkState.entries()),
      session_data: this.sessionData
    });
  }
  
  /**
   * Deserialize context from storage
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data);
      
      this.conversationHistory = parsed.conversation_history || [];
      this.activeDocuments = new Map(parsed.active_documents || []);
      this.frameworkState = new Map(parsed.framework_state || []);
      this.sessionData = parsed.session_data || this.sessionData;
      
      this.logger.info('Context deserialized successfully');
    } catch (error) {
      this.logger.error('Failed to deserialize context', { error });
    }
  }
  
  /**
   * Restore from mode context
   */
  async restore(context: ModeContext): Promise<void> {
    this.conversationHistory = context.conversation_history;
    this.activeDocuments = context.active_documents;
    this.frameworkState = context.framework_state;
    this.sessionData = context.session_data;
    
    this.logger.info('Context restored from mode context');
  }
  
  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Clear all context
   */
  clear(): void {
    this.conversationHistory = [];
    this.activeDocuments.clear();
    this.frameworkState.clear();
    
    // Reset session but keep ID
    this.sessionData = {
      ...this.sessionData,
      mode_switches: 0,
      commands_executed: 0,
      frameworks_used: []
    };
    
    this.logger.info('Context cleared');
  }
}