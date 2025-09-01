/**
 * Web Processor
 * Handles webpage content extraction
 */
import { ProcessorResult } from './text-processor';
export declare class WebProcessor {
    /**
     * Process webpage content
     * Note: In production, use puppeteer or playwright for dynamic content
     */
    process(source: string): Promise<ProcessorResult>;
}
