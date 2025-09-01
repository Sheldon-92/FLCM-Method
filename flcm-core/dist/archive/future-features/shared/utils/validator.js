"use strict";
/**
 * Validator Utility
 * Common validation functions for both versions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
class Validator {
    /**
     * Validate email format
     */
    static isEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Validate URL format
     */
    static isURL(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validate JSON string
     */
    static isJSON(str) {
        try {
            JSON.parse(str);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Validate required fields in object
     */
    static hasRequiredFields(obj, requiredFields) {
        return requiredFields.every(field => obj.hasOwnProperty(field) && obj[field] !== undefined && obj[field] !== null);
    }
    /**
     * Validate string length
     */
    static isValidLength(str, min = 0, max = Infinity) {
        return str.length >= min && str.length <= max;
    }
    /**
     * Validate enum value
     */
    static isValidEnum(value, enumObj) {
        return Object.values(enumObj).includes(value);
    }
    /**
     * Validate date string
     */
    static isValidDate(dateStr) {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    }
    /**
     * Validate version format
     */
    static isValidVersion(version) {
        const versionRegex = /^\d+\.\d+(\.\d+)?$/;
        return versionRegex.test(version);
    }
    /**
     * Sanitize string for safe usage
     */
    static sanitize(str) {
        return str
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/[^\w\s\-\.@]/g, '') // Keep only safe characters
            .trim();
    }
    /**
     * Validate file path
     */
    static isValidPath(path) {
        // Prevent directory traversal
        const dangerousPatterns = ['../', '..\\', '%2e%2e'];
        return !dangerousPatterns.some(pattern => path.toLowerCase().includes(pattern));
    }
}
exports.Validator = Validator;
//# sourceMappingURL=validator.js.map