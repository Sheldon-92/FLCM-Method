/**
 * Version Detection Logic
 * Determines which version should handle a request
 */

import { FLCMVersion, VersionRequest, RouterConfig } from './types';

export class VersionDetector {
  private config: RouterConfig;
  private v2Paths = [
    '/v2/',
    '/mentor/',
    '/creator/',
    '/publisher/',
    '/framework/',
    '/obsidian/'
  ];
  
  private v1Paths = [
    '/collector/',
    '/scholar/',
    '/agent/',
    '/v1/',
    '/legacy/'
  ];

  constructor(config: RouterConfig) {
    this.config = config;
  }

  detectVersion(request: VersionRequest): FLCMVersion {
    // 1. Check explicit version header
    const versionHeader = request.headers['x-flcm-version'];
    if (versionHeader === '1.0' || versionHeader === '2.0') {
      return versionHeader as FLCMVersion;
    }

    // 2. Check user preference
    if (this.config.userOverridesEnabled && request.user?.preferredVersion) {
      return request.user.preferredVersion;
    }

    // 3. Check path patterns
    const pathVersion = this.detectFromPath(request.path);
    if (pathVersion) {
      return pathVersion;
    }

    // 4. Check feature flags
    const flagVersion = this.detectFromFeatureFlags(request);
    if (flagVersion) {
      return flagVersion;
    }

    // 5. Return default
    return this.config.defaultVersion;
  }

  private detectFromPath(path: string): FLCMVersion | null {
    const normalizedPath = path.toLowerCase();
    
    // Check v2 paths
    if (this.v2Paths.some(p => normalizedPath.includes(p))) {
      return '2.0';
    }
    
    // Check v1 paths
    if (this.v1Paths.some(p => normalizedPath.includes(p))) {
      return '1.0';
    }
    
    return null;
  }

  private detectFromFeatureFlags(request: VersionRequest): FLCMVersion | null {
    const path = request.path.toLowerCase();
    
    // Check if specific v2 features are enabled
    if (path.includes('mentor') && this.config.featureFlags.v2_mentor) {
      return '2.0';
    }
    
    if (path.includes('creator') && this.config.featureFlags.v2_creator) {
      return '2.0';
    }
    
    if (path.includes('publisher') && this.config.featureFlags.v2_publisher) {
      return '2.0';
    }
    
    if (path.includes('obsidian') && this.config.featureFlags.v2_obsidian) {
      return '2.0';
    }
    
    return null;
  }

  isV2Enabled(): boolean {
    return Object.keys(this.config.featureFlags)
      .filter(key => key.startsWith('v2_'))
      .some(key => this.config.featureFlags[key]);
  }
}