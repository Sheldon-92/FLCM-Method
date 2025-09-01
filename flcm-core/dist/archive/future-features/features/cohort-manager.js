"use strict";
/**
 * Cohort Manager
 * Manages user segmentation for feature flags
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohortManager = void 0;
const logger_1 = require("../shared/utils/logger");
const crypto = __importStar(require("crypto"));
class CohortManager {
    constructor() {
        this.logger = new logger_1.Logger('CohortManager');
        this.cohorts = new Map();
        this.userCohortCache = new Map();
        this.initializeDefaultCohorts();
    }
    /**
     * Initialize default cohorts
     */
    initializeDefaultCohorts() {
        // Beta testers cohort
        this.createCohort({
            name: 'beta_testers',
            description: 'Users opted into beta testing',
            members: new Set(),
            rules: [
                {
                    attribute: 'beta_opt_in',
                    operator: 'equals',
                    value: true
                }
            ],
            created_at: new Date(),
            updated_at: new Date()
        });
        // Internal users cohort
        this.createCohort({
            name: 'internal_users',
            description: 'Internal team members',
            members: new Set(),
            rules: [
                {
                    attribute: 'email',
                    operator: 'contains',
                    value: '@flcm.internal'
                }
            ],
            created_at: new Date(),
            updated_at: new Date()
        });
        // Power users cohort
        this.createCohort({
            name: 'power_users',
            description: 'Highly active users',
            members: new Set(),
            rules: [
                {
                    attribute: 'sessions_per_week',
                    operator: 'greater_than',
                    value: 10
                },
                {
                    attribute: 'frameworks_used',
                    operator: 'greater_than',
                    value: 5
                }
            ],
            created_at: new Date(),
            updated_at: new Date()
        });
        // New users cohort
        this.createCohort({
            name: 'new_users',
            description: 'Recently joined users',
            members: new Set(),
            rules: [
                {
                    attribute: 'account_age_days',
                    operator: 'less_than',
                    value: 7
                }
            ],
            created_at: new Date(),
            updated_at: new Date()
        });
        // Enterprise users cohort
        this.createCohort({
            name: 'enterprise_users',
            description: 'Enterprise plan subscribers',
            members: new Set(),
            rules: [
                {
                    attribute: 'plan_type',
                    operator: 'equals',
                    value: 'enterprise'
                }
            ],
            created_at: new Date(),
            updated_at: new Date()
        });
    }
    /**
     * Create a new cohort
     */
    createCohort(cohort) {
        this.cohorts.set(cohort.name, cohort);
        this.logger.info(`Created cohort: ${cohort.name}`);
    }
    /**
     * Add user to cohort explicitly
     */
    addUserToCohort(userId, cohortName) {
        const cohort = this.cohorts.get(cohortName);
        if (!cohort) {
            this.logger.warn(`Cohort not found: ${cohortName}`);
            return false;
        }
        cohort.members.add(userId);
        cohort.updated_at = new Date();
        // Clear cache for this user
        this.userCohortCache.delete(userId);
        this.logger.debug(`Added user ${userId} to cohort ${cohortName}`);
        return true;
    }
    /**
     * Remove user from cohort
     */
    removeUserFromCohort(userId, cohortName) {
        const cohort = this.cohorts.get(cohortName);
        if (!cohort) {
            return false;
        }
        const removed = cohort.members.delete(userId);
        if (removed) {
            cohort.updated_at = new Date();
            this.userCohortCache.delete(userId);
        }
        return removed;
    }
    /**
     * Get all cohorts for a user
     */
    async getUserCohorts(userId, context) {
        // Check cache first
        const cached = this.userCohortCache.get(userId);
        if (cached) {
            return cached;
        }
        const userCohorts = [];
        // Check each cohort
        for (const [name, cohort] of this.cohorts.entries()) {
            // Check explicit membership
            if (cohort.members.has(userId)) {
                userCohorts.push(name);
                continue;
            }
            // Check rule-based membership if context provided
            if (context && cohort.rules && this.evaluateRules(cohort.rules, context)) {
                userCohorts.push(name);
            }
        }
        // Cache the result
        this.userCohortCache.set(userId, userCohorts);
        return userCohorts;
    }
    /**
     * Evaluate cohort rules
     */
    evaluateRules(rules, context) {
        if (!context.attributes)
            return false;
        for (const rule of rules) {
            const value = context.attributes[rule.attribute];
            if (!this.evaluateRule(rule, value)) {
                return false; // All rules must match (AND logic)
            }
        }
        return true;
    }
    /**
     * Evaluate a single rule
     */
    evaluateRule(rule, value) {
        switch (rule.operator) {
            case 'equals':
                return value === rule.value;
            case 'not_equals':
                return value !== rule.value;
            case 'greater_than':
                return value > rule.value;
            case 'less_than':
                return value < rule.value;
            case 'contains':
                return value?.toString().includes(rule.value);
            case 'in':
                return Array.isArray(rule.value) && rule.value.includes(value);
            case 'regex':
                return new RegExp(rule.value).test(value?.toString());
            default:
                return false;
        }
    }
    /**
     * Check if user is in specific cohort
     */
    async isUserInCohort(userId, cohortName, context) {
        const cohorts = await this.getUserCohorts(userId, context);
        return cohorts.includes(cohortName);
    }
    /**
     * Get rollout group for percentage-based rollout
     */
    isInRolloutGroup(userId, percentage) {
        // Use consistent hashing for stable assignment
        const hash = crypto.createHash('md5').update(userId).digest('hex');
        const bucket = parseInt(hash.substring(0, 8), 16) % 100;
        return bucket < percentage;
    }
    /**
     * Get all cohorts
     */
    getAllCohorts() {
        return new Map(this.cohorts);
    }
    /**
     * Get cohort by name
     */
    getCohort(name) {
        return this.cohorts.get(name);
    }
    /**
     * Update cohort
     */
    updateCohort(name, updates) {
        const cohort = this.cohorts.get(name);
        if (!cohort) {
            return false;
        }
        Object.assign(cohort, updates);
        cohort.updated_at = new Date();
        // Clear cache as cohort rules might have changed
        this.userCohortCache.clear();
        this.logger.info(`Updated cohort: ${name}`);
        return true;
    }
    /**
     * Delete cohort
     */
    deleteCohort(name) {
        const deleted = this.cohorts.delete(name);
        if (deleted) {
            this.userCohortCache.clear();
            this.logger.info(`Deleted cohort: ${name}`);
        }
        return deleted;
    }
    /**
     * Get cohort statistics
     */
    getCohortStats(name) {
        const cohort = this.cohorts.get(name);
        if (!cohort) {
            return null;
        }
        return {
            name: cohort.name,
            description: cohort.description,
            member_count: cohort.members.size,
            rule_count: cohort.rules?.length || 0,
            created_at: cohort.created_at,
            updated_at: cohort.updated_at
        };
    }
    /**
     * Get all cohort statistics
     */
    getAllStats() {
        const stats = {
            total_cohorts: this.cohorts.size,
            total_explicit_members: 0,
            cohorts: {}
        };
        for (const [name, cohort] of this.cohorts.entries()) {
            stats.total_explicit_members += cohort.members.size;
            stats.cohorts[name] = this.getCohortStats(name);
        }
        return stats;
    }
    /**
     * Import cohorts from configuration
     */
    importCohorts(config) {
        try {
            const cohorts = config.cohorts || {};
            Object.entries(cohorts).forEach(([name, data]) => {
                const cohort = {
                    name,
                    description: data.description,
                    members: new Set(data.members || []),
                    rules: data.rules || [],
                    created_at: new Date(data.created_at || Date.now()),
                    updated_at: new Date(data.updated_at || Date.now())
                };
                this.cohorts.set(name, cohort);
            });
            this.userCohortCache.clear();
            this.logger.info(`Imported ${Object.keys(cohorts).length} cohorts`);
        }
        catch (error) {
            this.logger.error('Failed to import cohorts', { error });
        }
    }
    /**
     * Export cohorts for persistence
     */
    exportCohorts() {
        const exported = {};
        for (const [name, cohort] of this.cohorts.entries()) {
            exported[name] = {
                description: cohort.description,
                members: Array.from(cohort.members),
                rules: cohort.rules,
                created_at: cohort.created_at.toISOString(),
                updated_at: cohort.updated_at.toISOString()
            };
        }
        return exported;
    }
    /**
     * Clear all cache
     */
    clearCache() {
        this.userCohortCache.clear();
        this.logger.debug('Cohort cache cleared');
    }
}
exports.CohortManager = CohortManager;
//# sourceMappingURL=cohort-manager.js.map