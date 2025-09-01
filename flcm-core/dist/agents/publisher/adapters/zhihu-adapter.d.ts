/**
 * Zhihu (�N) Platform Adapter
 * Knowledge-focused, professional, in-depth content
 */
import { ContentDocument } from '../../../shared/pipeline/document-schema';
import { PlatformAdapter, PlatformContent } from '../index';
export declare class ZhihuAdapter implements PlatformAdapter {
    readonly platform: "zhihu";
    private readonly maxLength;
    adapt(content: ContentDocument): Promise<PlatformContent>;
    optimize(content: PlatformContent): Promise<PlatformContent>;
    generateHashtags(content: string): string[];
    ', ': any;
    ', ': any;
    ό: any;
    '];: any;
}
