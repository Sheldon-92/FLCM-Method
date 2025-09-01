/**
 * Document Converter
 * Bidirectional conversion between v1 and v2 formats
 */
export interface ConversionResult {
    success: boolean;
    document?: any;
    errors?: string[];
    warnings?: string[];
    dataLoss?: string[];
}
export declare class DocumentConverter {
    private versionManager;
    private logger;
    constructor();
    /**
     * Convert document between versions
     */
    convert(document: any, targetVersion: '1.0' | '2.0'): Promise<ConversionResult>;
    /**
     * Convert v1 document to v2
     */
    private convertToV2;
    /**
     * Convert v2 document to v1
     */
    private convertToV1;
    /**
     * Validate conversion result
     */
    validateConversion(source: any, target: any, targetVersion: string): {
        valid: boolean;
        issues: string[];
    };
    private getAgentType;
    private getLayerType;
    private mapAgentToLayer;
    private mapLayerToAgent;
    private getNestedValue;
    private setNestedValue;
    private hasValue;
    private generateFrontmatter;
    private fillV1Defaults;
    private checkDataLoss;
    private getCriticalFields;
}
