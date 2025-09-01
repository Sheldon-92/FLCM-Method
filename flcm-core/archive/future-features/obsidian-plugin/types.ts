/**
 * Obsidian Plugin Types
 */

export interface FLCMSettings {
  flcmPath: string;
  syncMode: 'manual' | 'auto' | 'realtime';
  conflictResolution: 'ask' | 'local' | 'remote' | 'newest';
  autoSyncInterval: number; // minutes
  enableStatusBar: boolean;
  enableNotifications: boolean;
  syncFilter: {
    includeTags: string[];
    excludeTags: string[];
    includeDirectories: string[];
    excludeDirectories: string[];
  };
  metadata: {
    preserveObsidianMetadata: boolean;
    addCreationDate: boolean;
    addModificationDate: boolean;
    addSyncTimestamp: boolean;
  };
  advanced: {
    maxSyncRetries: number;
    syncTimeout: number; // seconds
    conflictBackupEnabled: boolean;
    debugLogging: boolean;
  };
}

export interface SyncOperation {
  id: string;
  file: string; // file path
  direction: 'to-flcm' | 'to-obsidian' | 'bidirectional';
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'conflict';
  timestamp: number;
  error?: SyncError;
  retryCount: number;
  conflictData?: ConflictData;
}

export interface SyncError {
  type: 'network' | 'file-system' | 'conflict' | 'validation' | 'permission';
  message: string;
  details?: any;
}

export interface ConflictData {
  baseContent: string;
  localContent: string;
  remoteContent: string;
  conflictMarkers: ConflictMarker[];
}

export interface ConflictMarker {
  startLine: number;
  endLine: number;
  type: 'local' | 'remote' | 'both';
  description: string;
}

export interface FLCMMetadata {
  version: '2.0';
  layer: 'mentor' | 'creator' | 'publisher';
  framework: string;
  timestamp: string; // ISO string
  session_id: string;
  metadata: {
    depth_level?: number;
    voice_profile?: string;
    audience?: string;
    core_message?: string;
    learning_objective?: string;
  };
  connections: string[]; // Obsidian links
  tags: string[];
  sync: {
    last_sync: string; // ISO string
    sync_source: 'obsidian' | 'flcm';
    checksum: string;
  };
}

export interface Resolution {
  type: 'auto' | 'manual';
  content?: string;
  conflicts?: ConflictMarker[];
  suggestions?: string[];
}

export interface MergeResult {
  result: string;
  conflicts: ConflictMarker[];
  success: boolean;
}

export type SyncStatus = 'idle' | 'syncing' | 'completed' | 'error' | 'conflict';

export interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  conflictsSyncs: number;
  lastSyncTime: Date | null;
  avgSyncTime: number; // milliseconds
}

export interface VaultWatcher {
  start(): void;
  stop(): void;
  isWatching(): boolean;
}

export interface FLCMDocument {
  path: string;
  content: string;
  metadata: FLCMMetadata;
  lastModified: Date;
  checksum: string;
}