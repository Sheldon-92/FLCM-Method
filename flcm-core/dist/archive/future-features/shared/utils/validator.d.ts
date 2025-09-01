/**
 * Validator Utility
 * Common validation functions for both versions
 */
export declare class Validator {
    /**
     * Validate email format
     */
    static isEmail(email: string): boolean;
    /**
     * Validate URL format
     */
    static isURL(url: string): boolean;
    /**
     * Validate JSON string
     */
    static isJSON(str: string): boolean;
    /**
     * Validate required fields in object
     */
    static hasRequiredFields<T extends object>(obj: T, requiredFields: (keyof T)[]): boolean;
    /**
     * Validate string length
     */
    static isValidLength(str: string, min?: number, max?: number): boolean;
    /**
     * Validate enum value
     */
    static isValidEnum<T>(value: any, enumObj: T): boolean;
    /**
     * Validate date string
     */
    static isValidDate(dateStr: string): boolean;
    /**
     * Validate version format
     */
    static isValidVersion(version: string): boolean;
    /**
     * Sanitize string for safe usage
     */
    static sanitize(str: string): string;
    /**
     * Validate file path
     */
    static isValidPath(path: string): boolean;
}
