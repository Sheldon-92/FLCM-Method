/**
 * Multi-modal Learning Engine
 * Core engine for integrating and orchestrating multiple learning modalities
 */
/// <reference types="node" />
import { MultimodalContent, MultimodalEngine as IMultimodalEngine } from './types';
import { EventEmitter } from 'events';
export declare class MultimodalLearningEngine extends EventEmitter implements IMultimodalEngine {
    private logger;
    private modalityDefinitions;
    private userProfiles;
    private contentCache;
    private activeSessions;
    private orchestrator;
    private contentAnalyzer;
    private modalityAnalyzer;
    private synchronizationEngine;
    private adaptationEngine;
    private effectivenessTracker;
    private accessibilityChecker;
    private modalityPredictor;
    private engagementPredictor;
    private effectivenessPredictor;
    constructor();
    n: any;
    n: any; /**\n   * Analyze content to extract multimodal learning opportunities\n   */
    n: any;
    analyzeContent(content: any): Promise<MultimodalContent>;
}
