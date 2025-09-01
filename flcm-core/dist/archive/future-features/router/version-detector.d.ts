/**
 * Version Detection Logic
 * Determines which version should handle a request
 */
import { FLCMVersion, VersionRequest, RouterConfig } from './types';
export declare class VersionDetector {
    private config;
    private v2Paths;
    private v1Paths;
    constructor(config: RouterConfig);
    detectVersion(request: VersionRequest): FLCMVersion;
    private detectFromPath;
    private detectFromFeatureFlags;
    isV2Enabled(): boolean;
}
