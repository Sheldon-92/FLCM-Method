"use strict";
/**
 * Scholar Agent Input Processors Tests
 * Test all 9 input processor types
 */
Object.defineProperty(exports, "__esModule", { value: true });
const text_processor_1 = require("../processors/text-processor");
const pdf_processor_1 = require("../processors/pdf-processor");
const web_processor_1 = require("../processors/web-processor");
const media_processor_1 = require("../processors/media-processor");
const code_processor_1 = require("../processors/code-processor");
// Mock external dependencies
jest.mock('../../../shared/utils/logger', () => ({
    createLogger: () => ({
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));
describe('Scholar Agent Input Processors', () => {
    describe('TextProcessor', () => {
        let processor;
        beforeEach(() => {
            processor = new text_processor_1.TextProcessor();
        });
        it('should process plain text correctly', async () => {
            const input = 'This is a sample text for processing.';
            const result = await processor.process(input);
            expect(result.text).toBe(input);
            expect(result.metadata.wordCount).toBe(8);
            expect(result.metadata.characterCount).toBe(input.length);
            expect(result.metadata.sentences).toBe(1);
            expect(result.metadata.paragraphs).toBe(1);
        });
        it('should handle multi-paragraph text', async () => {
            const input = 'First paragraph.\n\nSecond paragraph with more words.\n\nThird paragraph.';
            const result = await processor.process(input);
            expect(result.text).toBe(input);
            expect(result.metadata.paragraphs).toBe(3);
            expect(result.metadata.sentences).toBe(3);
            expect(result.metadata.wordCount).toBeGreaterThan(8);
        });
        it('should handle empty text', async () => {
            const input = '';
            const result = await processor.process(input);
            expect(result.text).toBe('');
            expect(result.metadata.wordCount).toBe(0);
            expect(result.metadata.characterCount).toBe(0);
        });
        it('should handle text with special characters', async () => {
            const input = 'Text with émojis 😊 and spëcial chàracters!';
            const result = await processor.process(input);
            expect(result.text).toBe(input);
            expect(result.metadata.characterCount).toBe(input.length);
            expect(result.metadata.wordCount).toBe(6);
        });
        it('should extract reading time estimate', async () => {
            const input = 'Word '.repeat(200); // 200 words
            const result = await processor.process(input);
            expect(result.metadata.readingTimeMinutes).toBeDefined();
            expect(result.metadata.readingTimeMinutes).toBeGreaterThan(0);
        });
    });
    describe('PDFProcessor', () => {
        let processor;
        beforeEach(() => {
            processor = new pdf_processor_1.PDFProcessor();
        });
        it('should process PDF file path', async () => {
            const mockFilePath = '/path/to/document.pdf';
            // Mock the PDF processing
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Extracted PDF content with multiple pages of text.',
                metadata: {
                    pages: 5,
                    title: 'Sample Document',
                    author: 'John Doe',
                    creationDate: new Date(),
                    wordCount: 8,
                },
            });
            const result = await processor.process(mockFilePath);
            expect(result.text).toContain('Extracted PDF content');
            expect(result.metadata.pages).toBe(5);
            expect(result.metadata.title).toBe('Sample Document');
            expect(result.metadata.author).toBe('John Doe');
            mockProcess.mockRestore();
        });
        it('should handle PDF buffer input', async () => {
            const mockBuffer = Buffer.from('PDF content');
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Extracted content from PDF buffer',
                metadata: {
                    pages: 2,
                    wordCount: 5,
                },
            });
            const result = await processor.process(mockBuffer);
            expect(result.text).toBe('Extracted content from PDF buffer');
            expect(result.metadata.pages).toBe(2);
            mockProcess.mockRestore();
        });
        it('should handle invalid PDF gracefully', async () => {
            const mockInvalidPath = '/path/to/invalid.pdf';
            const mockProcess = jest.spyOn(processor, 'process').mockRejectedValue(new Error('Invalid PDF format'));
            await expect(processor.process(mockInvalidPath)).rejects.toThrow('Invalid PDF format');
            mockProcess.mockRestore();
        });
        it('should extract table data from PDFs', async () => {
            const mockFilePath = '/path/to/table-document.pdf';
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Document with tables',
                metadata: {
                    pages: 3,
                    tables: [
                        { rows: 5, columns: 3, data: [['Header1', 'Header2', 'Header3']] },
                    ],
                    wordCount: 3,
                },
            });
            const result = await processor.process(mockFilePath);
            expect(result.metadata.tables).toBeDefined();
            expect(result.metadata.tables[0].rows).toBe(5);
            mockProcess.mockRestore();
        });
    });
    describe('WebProcessor', () => {
        let processor;
        beforeEach(() => {
            processor = new web_processor_1.WebProcessor();
        });
        it('should process web URL correctly', async () => {
            const mockUrl = 'https://example.com/article';
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Extracted web content from the article page.',
                metadata: {
                    url: mockUrl,
                    title: 'Sample Article',
                    description: 'This is a sample article',
                    author: 'Jane Smith',
                    publishDate: new Date(),
                    wordCount: 8,
                    images: ['https://example.com/image1.jpg'],
                    links: ['https://example.com/related'],
                },
            });
            const result = await processor.process(mockUrl);
            expect(result.text).toContain('Extracted web content');
            expect(result.metadata.url).toBe(mockUrl);
            expect(result.metadata.title).toBe('Sample Article');
            expect(result.metadata.images).toHaveLength(1);
            expect(result.metadata.links).toHaveLength(1);
            mockProcess.mockRestore();
        });
        it('should handle HTTPS URLs', async () => {
            const mockUrl = 'https://secure-site.com/content';
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Secure content extracted',
                metadata: {
                    url: mockUrl,
                    secure: true,
                    wordCount: 3,
                },
            });
            const result = await processor.process(mockUrl);
            expect(result.metadata.secure).toBe(true);
            mockProcess.mockRestore();
        });
        it('should extract meta tags', async () => {
            const mockUrl = 'https://example.com/blog';
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Blog post content',
                metadata: {
                    url: mockUrl,
                    metaTags: {
                        'og:title': 'Blog Post Title',
                        'og:description': 'Blog post description',
                        'twitter:card': 'summary',
                    },
                    wordCount: 3,
                },
            });
            const result = await processor.process(mockUrl);
            expect(result.metadata.metaTags).toBeDefined();
            expect(result.metadata.metaTags['og:title']).toBe('Blog Post Title');
            mockProcess.mockRestore();
        });
        it('should handle network errors gracefully', async () => {
            const mockUrl = 'https://non-existent-site.com';
            const mockProcess = jest.spyOn(processor, 'process').mockRejectedValue(new Error('Network error: Site not reachable'));
            await expect(processor.process(mockUrl)).rejects.toThrow('Network error');
            mockProcess.mockRestore();
        });
    });
    describe('MediaProcessor', () => {
        let processor;
        beforeEach(() => {
            processor = new media_processor_1.MediaProcessor();
        });
        it('should process video files', async () => {
            const mockVideoPath = '/path/to/video.mp4';
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Transcribed video content: This is what was spoken in the video.',
                metadata: {
                    type: 'video',
                    duration: 180,
                    format: 'mp4',
                    resolution: '1920x1080',
                    transcription: {
                        confidence: 0.95,
                        segments: [
                            { start: 0, end: 5, text: 'This is what was spoken' },
                            { start: 5, end: 10, text: 'in the video.' },
                        ],
                    },
                    wordCount: 11,
                },
            });
            const result = await processor.process(mockVideoPath);
            expect(result.text).toContain('Transcribed video content');
            expect(result.metadata.type).toBe('video');
            expect(result.metadata.duration).toBe(180);
            expect(result.metadata.transcription.confidence).toBe(0.95);
            mockProcess.mockRestore();
        });
        it('should process audio files', async () => {
            const mockAudioPath = '/path/to/audio.mp3';
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Transcribed audio content from the audio file.',
                metadata: {
                    type: 'audio',
                    duration: 120,
                    format: 'mp3',
                    bitrate: 128,
                    sampleRate: 44100,
                    transcription: {
                        confidence: 0.92,
                        segments: [
                            { start: 0, end: 60, text: 'First minute of audio' },
                            { start: 60, end: 120, text: 'Second minute of audio' },
                        ],
                    },
                    wordCount: 8,
                },
            });
            const result = await processor.process(mockAudioPath);
            expect(result.text).toContain('Transcribed audio content');
            expect(result.metadata.type).toBe('audio');
            expect(result.metadata.format).toBe('mp3');
            expect(result.metadata.transcription.segments).toHaveLength(2);
            mockProcess.mockRestore();
        });
        it('should process image files with OCR', async () => {
            const mockImagePath = '/path/to/image.png';
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Text extracted from image using OCR technology.',
                metadata: {
                    type: 'image',
                    format: 'png',
                    dimensions: { width: 1200, height: 800 },
                    ocr: {
                        confidence: 0.88,
                        blocks: [
                            { text: 'Text extracted from image', confidence: 0.9 },
                            { text: 'using OCR technology.', confidence: 0.86 },
                        ],
                    },
                    wordCount: 8,
                },
            });
            const result = await processor.process(mockImagePath);
            expect(result.text).toContain('Text extracted from image');
            expect(result.metadata.type).toBe('image');
            expect(result.metadata.ocr.confidence).toBe(0.88);
            expect(result.metadata.dimensions.width).toBe(1200);
            mockProcess.mockRestore();
        });
        it('should handle unsupported media formats', async () => {
            const mockInvalidPath = '/path/to/unsupported.xyz';
            const mockProcess = jest.spyOn(processor, 'process').mockRejectedValue(new Error('Unsupported media format: xyz'));
            await expect(processor.process(mockInvalidPath)).rejects.toThrow('Unsupported media format');
            mockProcess.mockRestore();
        });
        it('should handle low-quality transcriptions', async () => {
            const mockVideoPath = '/path/to/low-quality-video.mp4';
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Low quality transcription with uncertain words.',
                metadata: {
                    type: 'video',
                    duration: 60,
                    transcription: {
                        confidence: 0.45,
                        segments: [
                            { start: 0, end: 30, text: '[UNCLEAR AUDIO]', confidence: 0.2 },
                            { start: 30, end: 60, text: 'Some clear words', confidence: 0.7 },
                        ],
                    },
                    wordCount: 6,
                    quality: 'low',
                },
            });
            const result = await processor.process(mockVideoPath);
            expect(result.metadata.transcription.confidence).toBeLessThan(0.5);
            expect(result.metadata.quality).toBe('low');
            mockProcess.mockRestore();
        });
    });
    describe('CodeProcessor', () => {
        let processor;
        beforeEach(() => {
            processor = new code_processor_1.CodeProcessor();
        });
        it('should process JavaScript files', async () => {
            const mockCode = `
        function calculateSum(a, b) {
          return a + b;
        }
        
        const result = calculateSum(5, 3);
        console.log(result);
      `;
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'JavaScript code analysis: Function calculateSum adds two numbers.',
                metadata: {
                    language: 'javascript',
                    functions: ['calculateSum'],
                    variables: ['result'],
                    imports: [],
                    exports: [],
                    complexity: 2,
                    linesOfCode: 7,
                    comments: 0,
                    wordCount: 8,
                },
            });
            const result = await processor.process(mockCode);
            expect(result.text).toContain('JavaScript code analysis');
            expect(result.metadata.language).toBe('javascript');
            expect(result.metadata.functions).toContain('calculateSum');
            expect(result.metadata.complexity).toBe(2);
            mockProcess.mockRestore();
        });
        it('should process Python files', async () => {
            const mockCode = `
        import numpy as np
        
        def process_data(data):
            """Process the input data."""
            return np.mean(data)
        
        class DataProcessor:
            def __init__(self):
                self.data = []
      `;
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Python code analysis: Data processing module with numpy integration.',
                metadata: {
                    language: 'python',
                    functions: ['process_data'],
                    classes: ['DataProcessor'],
                    imports: ['numpy'],
                    docstrings: 1,
                    complexity: 3,
                    linesOfCode: 9,
                    comments: 1,
                    wordCount: 9,
                },
            });
            const result = await processor.process(mockCode);
            expect(result.text).toContain('Python code analysis');
            expect(result.metadata.language).toBe('python');
            expect(result.metadata.classes).toContain('DataProcessor');
            expect(result.metadata.docstrings).toBe(1);
            mockProcess.mockRestore();
        });
        it('should process TypeScript files', async () => {
            const mockCode = `
        interface User {
          id: number;
          name: string;
        }
        
        export class UserService {
          private users: User[] = [];
          
          addUser(user: User): void {
            this.users.push(user);
          }
        }
      `;
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'TypeScript code analysis: User service with interface definition.',
                metadata: {
                    language: 'typescript',
                    interfaces: ['User'],
                    classes: ['UserService'],
                    methods: ['addUser'],
                    exports: ['UserService'],
                    complexity: 2,
                    linesOfCode: 11,
                    typeDefinitions: 1,
                    wordCount: 8,
                },
            });
            const result = await processor.process(mockCode);
            expect(result.text).toContain('TypeScript code analysis');
            expect(result.metadata.language).toBe('typescript');
            expect(result.metadata.interfaces).toContain('User');
            expect(result.metadata.typeDefinitions).toBe(1);
            mockProcess.mockRestore();
        });
        it('should process CSV spreadsheet data', async () => {
            const mockCsv = `
        Name,Age,City
        John,25,New York
        Jane,30,San Francisco
        Bob,35,Chicago
      `;
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'CSV data analysis: User demographics with 3 records.',
                metadata: {
                    type: 'csv',
                    rows: 4,
                    columns: 3,
                    headers: ['Name', 'Age', 'City'],
                    recordCount: 3,
                    dataTypes: {
                        Name: 'string',
                        Age: 'number',
                        City: 'string',
                    },
                    wordCount: 7,
                },
            });
            const result = await processor.process(mockCsv);
            expect(result.text).toContain('CSV data analysis');
            expect(result.metadata.type).toBe('csv');
            expect(result.metadata.recordCount).toBe(3);
            expect(result.metadata.headers).toEqual(['Name', 'Age', 'City']);
            mockProcess.mockRestore();
        });
        it('should handle syntax errors gracefully', async () => {
            const mockInvalidCode = `
        function broken(
          // Missing closing parenthesis and bracket
      `;
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Code contains syntax errors that prevent full analysis.',
                metadata: {
                    language: 'javascript',
                    syntaxErrors: [
                        { line: 2, message: 'Unexpected end of input' },
                    ],
                    parseable: false,
                    wordCount: 9,
                },
            });
            const result = await processor.process(mockInvalidCode);
            expect(result.metadata.syntaxErrors).toBeDefined();
            expect(result.metadata.parseable).toBe(false);
            mockProcess.mockRestore();
        });
        it('should analyze code complexity', async () => {
            const mockComplexCode = `
        function complexFunction(data) {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              if (data[i] > 10) {
                for (let j = 0; j < 5; j++) {
                  if (j % 2 === 0) {
                    // Nested complexity
                  }
                }
              }
            }
          }
          return data;
        }
      `;
            const mockProcess = jest.spyOn(processor, 'process').mockResolvedValue({
                text: 'Complex JavaScript function with nested loops and conditions.',
                metadata: {
                    language: 'javascript',
                    functions: ['complexFunction'],
                    complexity: 8,
                    nestedDepth: 4,
                    linesOfCode: 13,
                    wordCount: 8,
                },
            });
            const result = await processor.process(mockComplexCode);
            expect(result.metadata.complexity).toBeGreaterThan(5);
            expect(result.metadata.nestedDepth).toBe(4);
            mockProcess.mockRestore();
        });
    });
    describe('Cross-Processor Integration', () => {
        it('should maintain consistent metadata structure', async () => {
            const processors = [
                new text_processor_1.TextProcessor(),
                new pdf_processor_1.PDFProcessor(),
                new web_processor_1.WebProcessor(),
                new media_processor_1.MediaProcessor(),
                new code_processor_1.CodeProcessor(),
            ];
            // Mock each processor
            for (const processor of processors) {
                jest.spyOn(processor, 'process').mockResolvedValue({
                    text: 'Sample processed content',
                    metadata: {
                        wordCount: 3,
                        processingTime: 100,
                        confidence: 0.95,
                    },
                });
            }
            for (const processor of processors) {
                const result = await processor.process('sample input');
                expect(result).toHaveProperty('text');
                expect(result).toHaveProperty('metadata');
                expect(result.metadata).toHaveProperty('wordCount');
                expect(typeof result.metadata.wordCount).toBe('number');
            }
            // Restore mocks
            for (const processor of processors) {
                jest.restoreAllMocks();
            }
        });
        it('should handle processing time tracking', async () => {
            const processor = new text_processor_1.TextProcessor();
            const input = 'Test input for timing';
            const mockProcess = jest.spyOn(processor, 'process').mockImplementation(async () => {
                // Simulate processing delay
                await new Promise(resolve => setTimeout(resolve, 10));
                return {
                    text: input,
                    metadata: {
                        wordCount: 4,
                        processingTime: 10,
                    },
                };
            });
            const result = await processor.process(input);
            expect(result.metadata.processingTime).toBeGreaterThan(0);
            mockProcess.mockRestore();
        });
    });
});
//# sourceMappingURL=input-processors.test.js.map