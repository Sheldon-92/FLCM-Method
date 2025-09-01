/**
 * Media Processor
 * Handles video, audio, and image processing
 */
/// <reference types="node" />
/// <reference types="node" />
import { ProcessorResult } from './text-processor';
export declare class MediaProcessor {
    /**
     * Process media content (video, audio, image)
     * Note: In production, use specialized libraries for each media type
     */
    process(source: string | Buffer): Promise<ProcessorResult>;
    /**
     * Detect media type from source
     */
    private detectMediaType;
    /**
     * Process video content
     * In production: Use ffmpeg for audio extraction, then speech-to-text
     */
    private processVideo;
    /**
     * Process audio content
     * In production: Use speech-to-text service
     */
    private processAudio;
    /**
     * Process image content
     * In production: Use OCR and image analysis
     */
    private processImage;
}
