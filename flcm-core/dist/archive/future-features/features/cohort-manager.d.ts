/**
 * Cohort Manager
 * Manages user segmentation for feature flags
 */
import { Cohort, UserContext } from './types';
export declare class CohortManager {
    private cohorts;
    private userCohortCache;
    private logger;
    constructor();
    /**
     * Initialize default cohorts
     */
    private initializeDefaultCohorts;
    /**
     * Create a new cohort
     */
    createCohort(cohort: Cohort): void;
    /**
     * Add user to cohort explicitly
     */
    addUserToCohort(userId: string, cohortName: string): boolean;
    /**
     * Remove user from cohort
     */
    removeUserFromCohort(userId: string, cohortName: string): boolean;
    /**
     * Get all cohorts for a user
     */
    getUserCohorts(userId: string, context?: UserContext): Promise<string[]>;
    /**
     * Evaluate cohort rules
     */
    private evaluateRules;
    /**
     * Evaluate a single rule
     */
    private evaluateRule;
    /**
     * Check if user is in specific cohort
     */
    isUserInCohort(userId: string, cohortName: string, context?: UserContext): Promise<boolean>;
    /**
     * Get rollout group for percentage-based rollout
     */
    isInRolloutGroup(userId: string, percentage: number): boolean;
    /**
     * Get all cohorts
     */
    getAllCohorts(): Map<string, Cohort>;
    /**
     * Get cohort by name
     */
    getCohort(name: string): Cohort | undefined;
    /**
     * Update cohort
     */
    updateCohort(name: string, updates: Partial<Cohort>): boolean;
    /**
     * Delete cohort
     */
    deleteCohort(name: string): boolean;
    /**
     * Get cohort statistics
     */
    getCohortStats(name: string): any;
    /**
     * Get all cohort statistics
     */
    getAllStats(): any;
    /**
     * Import cohorts from configuration
     */
    importCohorts(config: any): void;
    /**
     * Export cohorts for persistence
     */
    exportCohorts(): any;
    /**
     * Clear all cache
     */
    clearCache(): void;
}
