/**
 * User Service
 * Manages user profiles, preferences, and voice DNA
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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
    formality: number; // 0-1
    emotion: number; // 0-1
    authority: number; // 0-1
    humor: number; // 0-1
    energy: number; // 0-1
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
  samples: string[]; // Sample content for training
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

export class UserService {
  private users: Map<string, UserProfile>;
  private dataDir: string;
  private currentUser: UserProfile | null = null;

  constructor(dataDir?: string) {
    this.users = new Map();
    this.dataDir = dataDir || path.join(process.cwd(), '.flcm-users');
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    // Load existing users
    this.loadUsers();
  }

  /**
   * Create new user profile
   */
  createUser(name: string, email: string): UserProfile {
    const userId = this.generateUserId(email);
    
    const profile: UserProfile = {
      id: userId,
      name,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: this.getDefaultPreferences(),
      voiceDNA: this.getDefaultVoiceDNA(),
      contentHistory: [],
      stats: this.getDefaultStats()
    };

    this.users.set(userId, profile);
    this.saveUser(profile);
    
    return profile;
  }

  /**
   * Get user profile
   */
  getUser(userId: string): UserProfile | null {
    return this.users.get(userId) || null;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): UserProfile | null {
    const userId = this.generateUserId(email);
    return this.getUser(userId);
  }

  /**
   * Update user preferences
   */
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    user.preferences = {
      ...user.preferences,
      ...preferences
    };
    user.updatedAt = new Date();

    this.saveUser(user);
  }

  /**
   * Update voice DNA from content samples
   */
  updateVoiceDNA(userId: string, contentSamples: string[]): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // Analyze content samples
    const analysis = this.analyzeVoice(contentSamples);
    
    // Merge with existing DNA (weighted average)
    user.voiceDNA = this.mergeVoiceDNA(user.voiceDNA, analysis, 0.7); // 70% weight to new
    user.voiceDNA.samples = contentSamples.slice(-10); // Keep last 10 samples
    user.updatedAt = new Date();

    this.saveUser(user);
  }

  /**
   * Add content to history
   */
  addToHistory(userId: string, entry: Omit<ContentHistoryEntry, 'id' | 'createdAt'>): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const historyEntry: ContentHistoryEntry = {
      ...entry,
      id: crypto.randomBytes(8).toString('hex'),
      createdAt: new Date()
    };

    user.contentHistory.push(historyEntry);
    
    // Keep only last 100 entries
    if (user.contentHistory.length > 100) {
      user.contentHistory = user.contentHistory.slice(-100);
    }

    // Update stats
    this.updateStats(user);
    user.updatedAt = new Date();

    this.saveUser(user);
  }

  /**
   * Get user recommendations
   */
  getRecommendations(userId: string): any {
    const user = this.users.get(userId);
    if (!user) {
      return null;
    }

    const recommendations = {
      mode: this.recommendMode(user),
      platforms: this.recommendPlatforms(user),
      topics: this.recommendTopics(user),
      improvements: this.recommendImprovements(user)
    };

    return recommendations;
  }

  /**
   * Export user data
   */
  exportUserData(userId: string): string {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const exportData = {
      profile: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      preferences: user.preferences,
      voiceDNA: user.voiceDNA,
      stats: user.stats,
      recentContent: user.contentHistory.slice(-20)
    };

    const filename = `user-export-${userId}-${Date.now()}.json`;
    const filepath = path.join(this.dataDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    return filepath;
  }

  /**
   * Import voice DNA from file
   */
  importVoiceDNA(userId: string, filepath: string): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const data = fs.readFileSync(filepath, 'utf-8');
    const voiceDNA = JSON.parse(data);
    
    user.voiceDNA = voiceDNA;
    user.updatedAt = new Date();
    
    this.saveUser(user);
  }

  /**
   * Set current user
   */
  setCurrentUser(userId: string): void {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    this.currentUser = user;
  }

  /**
   * Get current user
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  /**
   * List all users
   */
  listUsers(): UserProfile[] {
    return Array.from(this.users.values());
  }

  // Private helper methods

  private generateUserId(email: string): string {
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      defaultMode: 'standard',
      defaultPlatforms: ['linkedin', 'twitter'],
      voiceProfile: 'professional',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: false,
        webhooks: false
      },
      autoSave: true,
      qualityThreshold: 70
    };
  }

  private getDefaultVoiceDNA(): VoiceDNA {
    return {
      linguistic: {
        avgSentenceLength: 18,
        vocabularyComplexity: 0.6,
        punctuationStyle: 'balanced',
        paragraphStructure: 'medium'
      },
      tone: {
        formality: 0.5,
        emotion: 0.5,
        authority: 0.6,
        humor: 0.3,
        energy: 0.6
      },
      style: {
        conversational: true,
        dataOriented: false,
        storytelling: true,
        academic: false
      },
      patterns: {
        openingStyle: ['question', 'statement'],
        closingStyle: ['call-to-action', 'summary'],
        transitionPhrases: ['However', 'Moreover', 'In addition'],
        emphasisMarkers: ['**', '_']
      },
      samples: []
    };
  }

  private getDefaultStats(): UserStats {
    return {
      totalWorkflows: 0,
      successfulWorkflows: 0,
      totalContent: 0,
      avgQuality: 0,
      avgDuration: 0,
      favoriteTopics: [],
      favoritePlatforms: [],
      lastActive: new Date()
    };
  }

  private analyzeVoice(samples: string[]): VoiceDNA {
    // Simplified voice analysis
    const allText = samples.join(' ');
    const sentences = allText.match(/[^.!?]+[.!?]+/g) || [];
    const words = allText.split(/\s+/);
    
    const avgSentenceLength = sentences.length > 0 
      ? words.length / sentences.length 
      : 18;
    
    // Detect patterns
    const hasQuestions = allText.includes('?');
    const hasExclamations = allText.includes('!');
    const hasBold = allText.includes('**');
    
    return {
      linguistic: {
        avgSentenceLength,
        vocabularyComplexity: this.calculateComplexity(words),
        punctuationStyle: hasExclamations ? 'expressive' : 'balanced',
        paragraphStructure: 'medium'
      },
      tone: {
        formality: this.calculateFormality(allText),
        emotion: hasExclamations ? 0.7 : 0.5,
        authority: 0.6,
        humor: this.detectHumor(allText),
        energy: hasExclamations ? 0.8 : 0.6
      },
      style: {
        conversational: hasQuestions,
        dataOriented: /\d+%/.test(allText),
        storytelling: allText.includes('story') || allText.includes('once'),
        academic: this.detectAcademic(allText)
      },
      patterns: {
        openingStyle: hasQuestions ? ['question'] : ['statement'],
        closingStyle: ['call-to-action'],
        transitionPhrases: this.extractTransitions(allText),
        emphasisMarkers: hasBold ? ['**'] : ['_']
      },
      samples: samples.slice(-10)
    };
  }

  private mergeVoiceDNA(existing: VoiceDNA, newDNA: VoiceDNA, weight: number): VoiceDNA {
    const merge = (old: number, new_: number) => old * (1 - weight) + new_ * weight;
    
    return {
      linguistic: {
        avgSentenceLength: merge(existing.linguistic.avgSentenceLength, newDNA.linguistic.avgSentenceLength),
        vocabularyComplexity: merge(existing.linguistic.vocabularyComplexity, newDNA.linguistic.vocabularyComplexity),
        punctuationStyle: weight > 0.5 ? newDNA.linguistic.punctuationStyle : existing.linguistic.punctuationStyle,
        paragraphStructure: weight > 0.5 ? newDNA.linguistic.paragraphStructure : existing.linguistic.paragraphStructure
      },
      tone: {
        formality: merge(existing.tone.formality, newDNA.tone.formality),
        emotion: merge(existing.tone.emotion, newDNA.tone.emotion),
        authority: merge(existing.tone.authority, newDNA.tone.authority),
        humor: merge(existing.tone.humor, newDNA.tone.humor),
        energy: merge(existing.tone.energy, newDNA.tone.energy)
      },
      style: {
        conversational: weight > 0.5 ? newDNA.style.conversational : existing.style.conversational,
        dataOriented: weight > 0.5 ? newDNA.style.dataOriented : existing.style.dataOriented,
        storytelling: weight > 0.5 ? newDNA.style.storytelling : existing.style.storytelling,
        academic: weight > 0.5 ? newDNA.style.academic : existing.style.academic
      },
      patterns: {
        openingStyle: [...new Set([...existing.patterns.openingStyle, ...newDNA.patterns.openingStyle])],
        closingStyle: [...new Set([...existing.patterns.closingStyle, ...newDNA.patterns.closingStyle])],
        transitionPhrases: [...new Set([...existing.patterns.transitionPhrases, ...newDNA.patterns.transitionPhrases])],
        emphasisMarkers: [...new Set([...existing.patterns.emphasisMarkers, ...newDNA.patterns.emphasisMarkers])]
      },
      samples: newDNA.samples
    };
  }

  private calculateComplexity(words: string[]): number {
    const avgLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    return Math.min(1, avgLength / 10);
  }

  private calculateFormality(text: string): number {
    const informal = ['gonna', 'wanna', 'yeah', 'stuff', 'things', 'like'];
    const formal = ['therefore', 'however', 'moreover', 'furthermore', 'consequently'];
    
    let score = 0.5;
    informal.forEach(word => {
      if (text.toLowerCase().includes(word)) score -= 0.05;
    });
    formal.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 0.05;
    });
    
    return Math.max(0, Math.min(1, score));
  }

  private detectHumor(text: string): number {
    const humorIndicators = ['lol', 'haha', '😄', '😂', 'joke', 'funny'];
    let score = 0;
    humorIndicators.forEach(indicator => {
      if (text.toLowerCase().includes(indicator)) score += 0.15;
    });
    return Math.min(1, score);
  }

  private detectAcademic(text: string): boolean {
    const academicTerms = ['research', 'study', 'analysis', 'hypothesis', 'methodology', 'conclusion'];
    return academicTerms.some(term => text.toLowerCase().includes(term));
  }

  private extractTransitions(text: string): string[] {
    const commonTransitions = ['However', 'Moreover', 'Furthermore', 'In addition', 'Therefore', 'Consequently'];
    return commonTransitions.filter(t => text.includes(t));
  }

  private updateStats(user: UserProfile): void {
    const history = user.contentHistory;
    if (history.length === 0) return;
    
    user.stats.totalWorkflows = history.length;
    user.stats.successfulWorkflows = history.filter(h => h.quality > 70).length;
    user.stats.totalContent = history.reduce((sum, h) => sum + h.platforms.length, 0);
    user.stats.avgQuality = history.reduce((sum, h) => sum + h.quality, 0) / history.length;
    user.stats.lastActive = new Date();
    
    // Find favorite topics and platforms
    const topicCounts: Record<string, number> = {};
    const platformCounts: Record<string, number> = {};
    
    history.forEach(h => {
      h.platforms.forEach(p => {
        platformCounts[p] = (platformCounts[p] || 0) + 1;
      });
    });
    
    user.stats.favoritePlatforms = Object.entries(platformCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([platform]) => platform);
  }

  private recommendMode(user: UserProfile): string {
    if (user.stats.avgQuality < 75) {
      return 'standard'; // Need more quality
    }
    if (user.stats.avgDuration > 2700000) { // > 45 min
      return 'quick'; // Taking too long
    }
    return user.preferences.defaultMode;
  }

  private recommendPlatforms(user: UserProfile): string[] {
    return user.stats.favoritePlatforms.length > 0 
      ? user.stats.favoritePlatforms 
      : user.preferences.defaultPlatforms;
  }

  private recommendTopics(user: UserProfile): string[] {
    // Simplified topic recommendation
    return user.stats.favoriteTopics.slice(0, 5);
  }

  private recommendImprovements(user: UserProfile): string[] {
    const improvements: string[] = [];
    
    if (user.voiceDNA.linguistic.avgSentenceLength > 25) {
      improvements.push('Consider shorter sentences for better readability');
    }
    
    if (user.voiceDNA.tone.formality < 0.3 && user.preferences.voiceProfile === 'professional') {
      improvements.push('Increase formality to match professional profile');
    }
    
    if (user.stats.avgQuality < 70) {
      improvements.push('Use Standard Mode for higher quality content');
    }
    
    return improvements;
  }

  private loadUsers(): void {
    const files = fs.readdirSync(this.dataDir);
    files.forEach(file => {
      if (file.endsWith('.json') && !file.includes('export')) {
        const filepath = path.join(this.dataDir, file);
        try {
          const data = fs.readFileSync(filepath, 'utf-8');
          const user = JSON.parse(data);
          this.users.set(user.id, user);
        } catch (error) {
          console.error(`Failed to load user ${file}:`, error);
        }
      }
    });
  }

  private saveUser(user: UserProfile): void {
    const filepath = path.join(this.dataDir, `${user.id}.json`);
    fs.writeFileSync(filepath, JSON.stringify(user, null, 2));
  }
}

// Singleton instance
let userServiceInstance: UserService | null = null;

export function getUserService(dataDir?: string): UserService {
  if (!userServiceInstance) {
    userServiceInstance = new UserService(dataDir);
  }
  return userServiceInstance;
}

export default UserService;