/**
 * Validator Utility
 * Common validation functions for both versions
 */

export class Validator {
  /**
   * Validate email format
   */
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate URL format
   */
  static isURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Validate JSON string
   */
  static isJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Validate required fields in object
   */
  static hasRequiredFields<T extends object>(
    obj: T,
    requiredFields: (keyof T)[]
  ): boolean {
    return requiredFields.every(field => 
      obj.hasOwnProperty(field) && obj[field] !== undefined && obj[field] !== null
    );
  }
  
  /**
   * Validate string length
   */
  static isValidLength(
    str: string,
    min: number = 0,
    max: number = Infinity
  ): boolean {
    return str.length >= min && str.length <= max;
  }
  
  /**
   * Validate enum value
   */
  static isValidEnum<T>(value: any, enumObj: T): boolean {
    return Object.values(enumObj as any).includes(value);
  }
  
  /**
   * Validate date string
   */
  static isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
  
  /**
   * Validate version format
   */
  static isValidVersion(version: string): boolean {
    const versionRegex = /^\d+\.\d+(\.\d+)?$/;
    return versionRegex.test(version);
  }
  
  /**
   * Sanitize string for safe usage
   */
  static sanitize(str: string): string {
    return str
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[^\w\s\-\.@]/g, '') // Keep only safe characters
      .trim();
  }
  
  /**
   * Validate file path
   */
  static isValidPath(path: string): boolean {
    // Prevent directory traversal
    const dangerousPatterns = ['../', '..\\', '%2e%2e'];
    return !dangerousPatterns.some(pattern => 
      path.toLowerCase().includes(pattern)
    );
  }
}