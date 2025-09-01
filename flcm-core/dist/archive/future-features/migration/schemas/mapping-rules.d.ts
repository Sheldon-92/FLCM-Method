/**
 * Schema Mapping Rules
 * Defines how to convert between v1 and v2 document formats
 */
export interface MappingRule {
    source: string;
    target: string;
    transform?: (value: any) => any;
    defaultValue?: any;
}
export declare const V1_TO_V2_MAPPINGS: {
    /**
     * Collector → Insights mapping
     */
    collector_to_insights: ({
        source: string;
        target: string;
        transform: (insights: any[]) => {
            id: string;
            insight: any;
            confidence: any;
            depth: number;
            tags: never[];
        }[];
    } | {
        source: string;
        target: string;
        transform: (insights: any[]) => {
            insight_id: string;
            source: any;
            quote: any;
            relevance: any;
        }[];
    } | {
        source: string;
        target: string;
        transform: () => string;
    } | {
        source: string;
        target: string;
        transform: (score: number) => number;
    })[];
    /**
     * Scholar → Knowledge mapping
     */
    scholar_to_knowledge: ({
        source: string;
        target: string;
        transform: (concepts: string[]) => {
            id: string;
            name: string;
            definition: string;
            importance: number;
            complexity: number;
            prerequisites: never[];
        }[];
    } | {
        source: string;
        target: string;
        transform: (level: number) => number;
    } | {
        source: string;
        target: string;
        transform: (questions: any[]) => any[];
    })[];
    /**
     * Creator → Content mapping
     */
    creator_to_content: ({
        source: string;
        target: string;
        transform?: undefined;
    } | {
        source: string;
        target: string;
        transform: (voice: any) => {
            tone: any;
            style: any;
            personality: any;
        };
    })[];
    /**
     * Adapter → Publisher mapping
     */
    adapter_to_publisher: ({
        source: string;
        target: string;
        transform: (platforms: any) => {
            platform: string;
            adapted_content: any;
            format_specifics: any;
            optimization_notes: never[];
            estimated_reach: any;
        }[];
    } | {
        source: string;
        target: string;
        transform?: undefined;
    })[];
};
export declare const V2_TO_V1_MAPPINGS: {
    /**
     * Insights → Collector mapping
     */
    insights_to_collector: ({
        source: string;
        target: string;
        transform: (insights: any[]) => {
            id: any;
            text: any;
            relevance: any;
            evidence: string;
        }[];
    } | {
        source: string;
        target: string;
        transform: (depth: number) => {
            reach: number;
            impact: number;
            confidence: number;
            effort: number;
            total: number;
        };
    })[];
    /**
     * Knowledge → Scholar mapping
     */
    knowledge_to_scholar: ({
        source: string;
        target: string;
        transform: (understanding: number) => number;
    } | {
        source: string;
        target: string;
        transform: (concepts: any[]) => any[];
    })[];
    /**
     * Content → Creator mapping
     */
    content_to_creator: {
        source: string;
        target: string;
    }[];
    /**
     * Publisher → Adapter mapping
     */
    publisher_to_adapter: {
        source: string;
        target: string;
        transform: (targets: any[]) => any;
    }[];
};
/**
 * Get mapping rules for conversion
 */
export declare function getMappingRules(fromVersion: '1.0' | '2.0', documentType: string): MappingRule[];
