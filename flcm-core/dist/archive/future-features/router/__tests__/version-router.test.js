"use strict";
/**
 * Version Router Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const version_detector_1 = require("../version-detector");
// Mock handlers
class MockV1Handler {
    async handle(request) {
        return {
            status: 200,
            body: { message: 'V1 response', path: request.path },
            version: '1.0'
        };
    }
    async healthCheck() {
        return {
            version: '1.0',
            status: 'healthy',
            uptime: 1000,
            lastCheck: new Date()
        };
    }
}
class MockV2Handler {
    async handle(request) {
        return {
            status: 200,
            body: { message: 'V2 response', path: request.path },
            version: '2.0'
        };
    }
    async healthCheck() {
        return {
            version: '2.0',
            status: 'healthy',
            uptime: 500,
            lastCheck: new Date()
        };
    }
}
describe('VersionRouter', () => {
    let router;
    beforeEach(() => {
        router = new index_1.VersionRouter();
        router.registerV1Handler(new MockV1Handler());
        router.registerV2Handler(new MockV2Handler());
    });
    describe('Version Detection', () => {
        it('should route to v1 by default', async () => {
            const request = {
                path: '/api/process',
                method: 'POST',
                headers: {}
            };
            const response = await router.route(request);
            expect(response.version).toBe('1.0');
            expect(response.body.message).toBe('V1 response');
        });
        it('should route to v2 with explicit header', async () => {
            const request = {
                path: '/api/process',
                method: 'POST',
                headers: { 'x-flcm-version': '2.0' }
            };
            const response = await router.route(request);
            expect(response.version).toBe('2.0');
            expect(response.body.message).toBe('V2 response');
        });
        it('should detect v2 from path', async () => {
            const request = {
                path: '/v2/mentor/analyze',
                method: 'POST',
                headers: {}
            };
            const response = await router.route(request);
            expect(response.version).toBe('2.0');
        });
        it('should detect v1 from legacy path', async () => {
            const request = {
                path: '/collector/process',
                method: 'POST',
                headers: {}
            };
            const response = await router.route(request);
            expect(response.version).toBe('1.0');
        });
    });
    describe('Health Check', () => {
        it('should return health status for both versions', async () => {
            const health = await router.healthCheck();
            expect(health.overall).toBe('healthy');
            expect(health.versions['1.0'].status).toBe('healthy');
            expect(health.versions['2.0'].status).toBe('healthy');
        });
    });
    describe('Error Handling', () => {
        it('should handle invalid version header', async () => {
            const request = {
                path: '/api/process',
                method: 'POST',
                headers: { 'x-flcm-version': '3.0' }
            };
            const response = await router.route(request);
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('Invalid version');
        });
    });
    describe('Configuration', () => {
        it('should update configuration dynamically', () => {
            const initialConfig = router.getConfig();
            expect(initialConfig.defaultVersion).toBe('1.0');
            router.updateConfig({ defaultVersion: '2.0' });
            const updatedConfig = router.getConfig();
            expect(updatedConfig.defaultVersion).toBe('2.0');
        });
    });
});
describe('VersionDetector', () => {
    let detector;
    beforeEach(() => {
        detector = new version_detector_1.VersionDetector({
            defaultVersion: '1.0',
            userOverridesEnabled: true,
            featureFlags: {
                v2_mentor: true,
                v2_creator: false,
                v2_publisher: false,
                v2_obsidian: false
            }
        });
    });
    it('should respect user preferences when enabled', () => {
        const request = {
            path: '/api/process',
            method: 'POST',
            headers: {},
            user: { id: 'user1', preferredVersion: '2.0' }
        };
        const version = detector.detectVersion(request);
        expect(version).toBe('2.0');
    });
    it('should use feature flags for routing', () => {
        const request = {
            path: '/mentor/analyze',
            method: 'POST',
            headers: {}
        };
        const version = detector.detectVersion(request);
        expect(version).toBe('2.0'); // v2_mentor is enabled
    });
    it('should detect v2 is enabled when any flag is true', () => {
        expect(detector.isV2Enabled()).toBe(true);
    });
});
//# sourceMappingURL=version-router.test.js.map