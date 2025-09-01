/**
 * Text Processor
 * Handles text and markdown content processing
 */

import * as fs from 'fs';
import { createLogger } from '../../../shared/utils/logger';

const logger = createLogger('TextProcessor');

export interface ProcessorResult {
  text: string;
  metadata: {
    wordCount: number;
    lineCount: number;
    paragraphCount: number;
    language?: string;
    encoding?: string;
    [key: string]: any;
  };
}

export class TextProcessor {
  /**
   * Process text or markdown content
   */
  async process(source: string | Buffer): Promise<ProcessorResult> {
    try {
      let text: string;

      if (typeof source === 'string') {
        // Check if it's a file path
        if (this.isFilePath(source)) {
          text = await this.readFile(source);
        } else {
          text = source;
        }
      } else if (Buffer.isBuffer(source)) {
        text = source.toString('utf8');
      } else {
        throw new Error('Invalid source type for text processor');
      }

      // Clean and normalize text
      text = this.normalizeText(text);

      // Extract metadata
      const metadata = this.extractMetadata(text);

      return {
        text,
        metadata,
      };
    } catch (error) {
      logger.error('Text processing failed:', error);
      throw error;
    }
  }

  /**
   * Check if string is a file path
   */
  private isFilePath(str: string): boolean {
    // Simple check - in production, use more robust validation
    return str.includes('/') || str.includes('\\') || str.endsWith('.txt') || str.endsWith('.md');
  }

  /**
   * Read file content
   */
  private async readFile(filePath: string): Promise<string> {
    try {
      return await fs.promises.readFile(filePath, 'utf8');
    } catch (error) {
      logger.error(`Failed to read file ${filePath}:`, error);
      throw new Error(`Cannot read file: ${filePath}`);
    }
  }

  /**
   * Normalize text content
   */
  private normalizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\t/g, '  ')     // Convert tabs to spaces
      .trim();                  // Remove leading/trailing whitespace
  }

  /**
   * Extract metadata from text
   */
  private extractMetadata(text: string): ProcessorResult['metadata'] {
    const lines = text.split('\n');
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    return {
      wordCount: words.length,
      lineCount: lines.length,
      paragraphCount: paragraphs.length,
      language: this.detectLanguage(text),
      encoding: 'utf8',
      averageWordLength: words.reduce((sum, w) => sum + w.length, 0) / words.length,
      hasMarkdown: this.detectMarkdown(text),
    };
  }

  /**
   * Simple language detection
   */
  private detectLanguage(text: string): string {
    // Check for Chinese characters
    if (/[\u4e00-\u9fa5]/.test(text)) {
      return 'zh';
    }
    // Check for Japanese characters
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
      return 'ja';
    }
    // Check for Korean characters
    if (/[\uac00-\ud7af]/.test(text)) {
      return 'ko';
    }
    // Default to English
    return 'en';
  }

  /**
   * Detect if text contains markdown
   */
  private detectMarkdown(text: string): boolean {
    const markdownPatterns = [
      /^#{1,6}\s/m,        // Headers
      /\*\*[^*]+\*\*/,     // Bold
      /\*[^*]+\*/,         // Italic
      /\[([^\]]+)\]\([^)]+\)/, // Links
      /^[-*+]\s/m,         // Lists
      /^>\s/m,             // Blockquotes
      /```[^`]+```/s,      // Code blocks
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
  }
}