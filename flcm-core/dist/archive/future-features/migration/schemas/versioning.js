"use strict";
/**
 * Schema Versioning System
 * Manages document schema versions and migrations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaVersionManager = void 0;
class SchemaVersionManager {
    constructor() {
        this.versions = new Map();
        this.registerVersions();
    }
    registerVersions() {
        // V1 schemas
        this.versions.set('1.0.0', {
            version: '1.0.0',
            releaseDate: '2024-01-01',
            changes: ['Initial 4-agent system'],
            breaking: false,
            migrationRequired: false
        });
        this.versions.set('1.1.0', {
            version: '1.1.0',
            releaseDate: '2024-06-01',
            changes: ['Added metadata fields', 'Enhanced RICE scoring'],
            breaking: false,
            migrationRequired: false
        });
        // V2 schemas
        this.versions.set('2.0.0', {
            version: '2.0.0',
            releaseDate: '2025-02-01',
            changes: ['Complete architecture change', '3-layer system', 'New document format'],
            breaking: true,
            migrationRequired: true
        });
        this.versions.set('2.1.0', {
            version: '2.1.0',
            releaseDate: '2025-03-01',
            changes: ['Added Obsidian frontmatter', 'Enhanced graph data'],
            breaking: false,
            migrationRequired: false
        });
    }
    /**
     * Detect document version from content
     */
    detectVersion(document) {
        // Check explicit version field
        if (document.version) {
            return document.version;
        }
        // Check document structure for v2
        if (document.type && ['insights', 'knowledge', 'content', 'publisher'].includes(document.type)) {
            return '2.0';
        }
        // Check for v1 agent fields
        if (document.agent && ['collector', 'scholar', 'creator', 'adapter'].includes(document.agent)) {
            return '1.0';
        }
        // Check for specific v2 fields
        if (document.core_insights || document.concepts || document.targets) {
            return '2.0';
        }
        // Check for specific v1 fields
        if (document.rice_scores || document.voice_dna || document.platforms) {
            return '1.0';
        }
        // Default to 1.0 if uncertain
        return '1.0';
    }
    /**
     * Add version metadata to document
     */
    addVersionMetadata(document, version) {
        const versionInfo = {
            schemaVersion: version,
            documentVersion: `${version}.${Date.now()}`,
            lastMigration: new Date().toISOString()
        };
        return {
            ...document,
            _version: versionInfo
        };
    }
    /**
     * Check if migration is needed
     */
    needsMigration(fromVersion, toVersion) {
        const from = this.parseVersion(fromVersion);
        const to = this.parseVersion(toVersion);
        // Major version change always requires migration
        if (from.major !== to.major) {
            return true;
        }
        // Check if any intermediate versions require migration
        const intermediateVersions = this.getIntermediateVersions(fromVersion, toVersion);
        return intermediateVersions.some(v => {
            const version = this.versions.get(v);
            return version?.migrationRequired || false;
        });
    }
    /**
     * Get migration path between versions
     */
    getMigrationPath(fromVersion, toVersion) {
        const from = this.parseVersion(fromVersion);
        const to = this.parseVersion(toVersion);
        if (from.major === to.major) {
            // Same major version - direct migration
            return [toVersion];
        }
        // Different major versions - need stepping stones
        const path = [];
        if (from.major === 1 && to.major === 2) {
            path.push('1.1.0'); // Latest v1
            path.push('2.0.0'); // First v2
            if (toVersion !== '2.0.0') {
                path.push(toVersion);
            }
        }
        else if (from.major === 2 && to.major === 1) {
            path.push('2.0.0'); // First v2
            path.push('1.1.0'); // Latest v1
            if (toVersion !== '1.1.0') {
                path.push(toVersion);
            }
        }
        return path;
    }
    /**
     * Validate document against schema version
     */
    validateDocument(document, version) {
        const errors = [];
        const majorVersion = version.split('.')[0];
        if (majorVersion === '1') {
            // Validate v1 document
            if (!document.agent) {
                errors.push('Missing agent field');
            }
            if (!document.timestamp) {
                errors.push('Missing timestamp field');
            }
            if (!document.version || !document.version.startsWith('1.')) {
                errors.push('Invalid version for v1 document');
            }
        }
        else if (majorVersion === '2') {
            // Validate v2 document
            if (!document.type) {
                errors.push('Missing type field');
            }
            if (!document.timestamp) {
                errors.push('Missing timestamp field');
            }
            if (!document.version || !document.version.startsWith('2.')) {
                errors.push('Invalid version for v2 document');
            }
            if (!document.metadata) {
                errors.push('Missing metadata field');
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    parseVersion(version) {
        const parts = version.split('.').map(Number);
        return {
            major: parts[0] || 0,
            minor: parts[1] || 0,
            patch: parts[2] || 0
        };
    }
    getIntermediateVersions(fromVersion, toVersion) {
        const versions = [];
        const allVersions = Array.from(this.versions.keys()).sort();
        let include = false;
        for (const version of allVersions) {
            if (version === fromVersion) {
                include = true;
                continue;
            }
            if (include && version !== toVersion) {
                versions.push(version);
            }
            if (version === toVersion) {
                break;
            }
        }
        return versions;
    }
    /**
     * Get latest version for major version
     */
    getLatestVersion(majorVersion) {
        const versions = Array.from(this.versions.keys())
            .filter(v => v.startsWith(`${majorVersion}.`))
            .sort();
        return versions[versions.length - 1] || `${majorVersion}.0.0`;
    }
}
exports.SchemaVersionManager = SchemaVersionManager;
//# sourceMappingURL=versioning.js.map