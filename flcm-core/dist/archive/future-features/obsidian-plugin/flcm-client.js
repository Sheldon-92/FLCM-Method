"use strict";
/**
 * FLCM Client
 * Interface for communicating with FLCM system
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLCMClient = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
class FLCMClient {
    constructor(flcmPath, settings) {
        this.flcmPath = flcmPath;
        this.settings = settings;
        this.documentsPath = path.join(flcmPath, 'documents');
    }
    /**
     * Test connection to FLCM
     */
    async testConnection() {
        if (!this.flcmPath) {
            return false;
        }
        try {
            // Check if FLCM directory exists
            const stats = await fs.stat(this.flcmPath);
            if (!stats.isDirectory()) {
                return false;
            }
            // Check for key FLCM files/directories
            const requiredPaths = [
                path.join(this.flcmPath, 'config'),
                path.join(this.flcmPath, 'documents')
            ];
            for (const requiredPath of requiredPaths) {
                try {
                    await fs.access(requiredPath);
                }
                catch {
                    // Create documents directory if it doesn't exist
                    if (requiredPath.includes('documents')) {
                        await fs.mkdir(requiredPath, { recursive: true });
                    }
                    else {
                        return false;
                    }
                }
            }
            return true;
        }
        catch (error) {
            console.error('FLCM connection test failed:', error);
            return false;
        }
    }
    /**
     * Check if document exists in FLCM
     */
    async exists(filePath) {
        try {
            const flcmPath = this.getFlcmPath(filePath);
            await fs.access(flcmPath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Read document from FLCM
     */
    async read(filePath) {
        const flcmPath = this.getFlcmPath(filePath);
        try {
            const content = await fs.readFile(flcmPath, 'utf-8');
            const stats = await fs.stat(flcmPath);
            // Extract metadata from frontmatter
            const metadata = this.extractMetadata(content);
            return {
                path: filePath,
                content,
                metadata,
                lastModified: new Date(stats.mtime),
                checksum: this.calculateChecksum(content)
            };
        }
        catch (error) {
            throw new Error(`Failed to read FLCM document ${filePath}: ${error.message}`);
        }
    }
    /**
     * Write document to FLCM
     */
    async write(filePath, content, modifiedTime) {
        const flcmPath = this.getFlcmPath(filePath);
        try {
            // Ensure directory exists
            const dir = path.dirname(flcmPath);
            await fs.mkdir(dir, { recursive: true });
            // Write content
            await fs.writeFile(flcmPath, content, 'utf-8');
            // Set modification time if provided
            if (modifiedTime) {
                const date = new Date(modifiedTime);
                await fs.utimes(flcmPath, date, date);
            }
        }
        catch (error) {
            throw new Error(`Failed to write FLCM document ${filePath}: ${error.message}`);
        }
    }
    /**
     * Delete document from FLCM
     */
    async delete(filePath) {
        const flcmPath = this.getFlcmPath(filePath);
        try {
            await fs.unlink(flcmPath);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw new Error(`Failed to delete FLCM document ${filePath}: ${error.message}`);
            }
        }
    }
    /**
     * Rename document in FLCM
     */
    async rename(oldPath, newPath) {
        const oldFlcmPath = this.getFlcmPath(oldPath);
        const newFlcmPath = this.getFlcmPath(newPath);
        try {
            // Ensure target directory exists
            const dir = path.dirname(newFlcmPath);
            await fs.mkdir(dir, { recursive: true });
            // Rename file
            await fs.rename(oldFlcmPath, newFlcmPath);
        }
        catch (error) {
            throw new Error(`Failed to rename FLCM document ${oldPath} to ${newPath}: ${error.message}`);
        }
    }
    /**
     * List all documents in FLCM
     */
    async listDocuments() {
        try {
            const documents = [];
            await this.walkDirectory(this.documentsPath, documents);
            // Return relative paths
            return documents.map(doc => path.relative(this.documentsPath, doc).replace(/\\/g, '/'));
        }
        catch (error) {
            throw new Error(`Failed to list FLCM documents: ${error.message}`);
        }
    }
    /**
     * Get document metadata without reading full content
     */
    async getMetadata(filePath) {
        const flcmPath = this.getFlcmPath(filePath);
        try {
            const stats = await fs.stat(flcmPath);
            // Read only the frontmatter section
            const content = await fs.readFile(flcmPath, 'utf-8');
            const metadata = this.extractMetadata(content);
            return {
                ...metadata,
                size: stats.size,
                lastModified: new Date(stats.mtime),
                created: new Date(stats.birthtime)
            };
        }
        catch (error) {
            throw new Error(`Failed to get metadata for ${filePath}: ${error.message}`);
        }
    }
    /**
     * Search documents by content or metadata
     */
    async search(query) {
        try {
            const allDocuments = await this.listDocuments();
            const matches = [];
            for (const docPath of allDocuments) {
                try {
                    const doc = await this.read(docPath);
                    // Check text content
                    if (query.text && !doc.content.toLowerCase().includes(query.text.toLowerCase())) {
                        continue;
                    }
                    // Check tags
                    if (query.tags && query.tags.length > 0) {
                        const docTags = doc.metadata?.tags || [];
                        const hasRequiredTag = query.tags.some(tag => docTags.includes(tag));
                        if (!hasRequiredTag) {
                            continue;
                        }
                    }
                    // Check framework
                    if (query.framework && doc.metadata?.framework !== query.framework) {
                        continue;
                    }
                    // Check layer
                    if (query.layer && doc.metadata?.layer !== query.layer) {
                        continue;
                    }
                    // Check date range
                    if (query.dateFrom && doc.lastModified < query.dateFrom) {
                        continue;
                    }
                    if (query.dateTo && doc.lastModified > query.dateTo) {
                        continue;
                    }
                    matches.push(docPath);
                }
                catch (error) {
                    console.warn(`Failed to search document ${docPath}:`, error);
                }
            }
            return matches;
        }
        catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }
    /**
     * Get FLCM file system path
     */
    getFlcmPath(obsidianPath) {
        return path.join(this.documentsPath, obsidianPath);
    }
    /**
     * Walk directory recursively
     */
    async walkDirectory(dirPath, files) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    await this.walkDirectory(fullPath, files);
                }
                else if (entry.isFile() && entry.name.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
        }
        catch (error) {
            // Directory might not exist or be accessible
            console.warn(`Failed to walk directory ${dirPath}:`, error);
        }
    }
    /**
     * Extract metadata from document content
     */
    extractMetadata(content) {
        try {
            // Simple frontmatter extraction
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (frontmatterMatch) {
                // This would use a proper YAML parser in production
                const yamlContent = frontmatterMatch[1];
                // Basic FLCM metadata extraction
                const flcmMatch = yamlContent.match(/flcm:\s*\n([\s\S]*?)(?=\n\w|$)/);
                if (flcmMatch) {
                    // Parse FLCM metadata block
                    const flcmData = flcmMatch[1];
                    const metadata = {
                        version: '2.0'
                    };
                    // Extract key fields using regex (simplified)
                    const extractField = (field) => {
                        const match = flcmData.match(new RegExp(`${field}:\\s*"?([^"\\n]*)"?`));
                        return match ? match[1].trim() : undefined;
                    };
                    metadata.layer = extractField('layer');
                    metadata.framework = extractField('framework');
                    metadata.timestamp = extractField('timestamp');
                    metadata.session_id = extractField('session_id');
                    // Extract tags
                    const tagsMatch = flcmData.match(/tags:\s*\n((?:\s*-\s*[^\n]*\n?)*)/);
                    if (tagsMatch) {
                        metadata.tags = tagsMatch[1]
                            .split('\n')
                            .map(line => line.replace(/^\s*-\s*/, '').trim())
                            .filter(tag => tag.length > 0);
                    }
                    return metadata;
                }
            }
            return null;
        }
        catch (error) {
            console.warn('Failed to extract metadata:', error);
            return null;
        }
    }
    /**
     * Calculate content checksum
     */
    calculateChecksum(content) {
        return crypto.createHash('md5').update(content, 'utf8').digest('hex');
    }
    /**
     * Get client status
     */
    getStatus() {
        return {
            flcmPath: this.flcmPath,
            documentsPath: this.documentsPath,
            connected: this.flcmPath.length > 0
        };
    }
}
exports.FLCMClient = FLCMClient;
//# sourceMappingURL=flcm-client.js.map