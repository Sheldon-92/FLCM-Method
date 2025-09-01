/**
 * Integration tests for dual architecture
 */

import { VersionRouter } from '../../router';
import { V1Handler } from '../../legacy/v1-handler';
import { V2Handler } from '../../v2/v2-handler';
import { HealthChecker } from '../../shared/health/health-checker';
import { ConfigManager } from '../../shared/config/config-manager';

describe('Dual Architecture Integration', () => {
  let router: VersionRouter;
  let healthChecker: HealthChecker;
  
  beforeAll(() => {
    // Initialize router with both handlers
    router = new VersionRouter();
    router.registerV1Handler(new V1Handler());
    router.registerV2Handler(new V2Handler());
    
    // Initialize health checker
    healthChecker = new HealthChecker();
    healthChecker.registerCheck('v1', async () => {
      const health = await router.healthCheck();
      return {
        service: 'v1',
        status: health.versions['1.0']?.status || 'unhealthy',
        responseTime: 0
      };
    });
    
    healthChecker.registerCheck('v2', async () => {
      const health = await router.healthCheck();
      return {
        service: 'v2',
        status: health.versions['2.0']?.status || 'unhealthy',
        responseTime: 0
      };
    });
  });
  
  describe('Parallel Execution', () => {
    it('should handle v1 and v2 requests simultaneously', async () => {
      const v1Request = {
        path: '/collector/process',
        method: 'POST',
        headers: {}
      };
      
      const v2Request = {
        path: '/mentor/analyze',
        method: 'POST',
        headers: {}
      };
      
      // Execute requests in parallel
      const [v1Response, v2Response] = await Promise.all([
        router.route(v1Request),
        router.route(v2Request)
      ]);
      
      expect(v1Response.version).toBe('1.0');
      expect(v2Response.version).toBe('2.0');
      expect(v1Response.status).toBe(200);
      expect(v2Response.status).toBe(200);
    });
    
    it('should maintain isolation between versions', async () => {
      const request1 = {
        path: '/api/test',
        method: 'GET',
        headers: { 'x-flcm-version': '1.0' }
      };
      
      const request2 = {
        path: '/api/test',
        method: 'GET',
        headers: { 'x-flcm-version': '2.0' }
      };
      
      const [response1, response2] = await Promise.all([
        router.route(request1),
        router.route(request2)
      ]);
      
      // Verify responses are from different versions
      expect(response1.version).toBe('1.0');
      expect(response2.version).toBe('2.0');
      expect(response1.body).not.toEqual(response2.body);
    });
  });
  
  describe('Configuration Switching', () => {
    it('should respect user preferences', async () => {
      const request = {
        path: '/api/process',
        method: 'POST',
        headers: {},
        user: {
          id: 'test-user',
          preferredVersion: '2.0' as const
        }
      };
      
      const response = await router.route(request);
      expect(response.version).toBe('2.0');
    });
    
    it('should handle feature flag changes', async () => {
      // Enable v2_mentor feature
      router.updateConfig({
        defaultVersion: '1.0',
        userOverridesEnabled: true,
        featureFlags: { v2_mentor: true }
      });
      
      const request = {
        path: '/mentor/analyze',
        method: 'POST',
        headers: {}
      };
      
      const response = await router.route(request);
      expect(response.version).toBe('2.0');
    });
  });
  
  describe('Performance', () => {
    it('should maintain performance within 5% overhead', async () => {
      const iterations = 100;
      const requests = Array(iterations).fill({
        path: '/api/test',
        method: 'GET',
        headers: {}
      });
      
      // Measure v1 performance
      const v1Start = Date.now();
      for (const req of requests) {
        await router.route({ ...req, headers: { 'x-flcm-version': '1.0' } });
      }
      const v1Time = Date.now() - v1Start;
      
      // Measure v2 performance
      const v2Start = Date.now();
      for (const req of requests) {
        await router.route({ ...req, headers: { 'x-flcm-version': '2.0' } });
      }
      const v2Time = Date.now() - v2Start;
      
      // Measure routing overhead
      const routingStart = Date.now();
      for (const req of requests) {
        await router.route(req);
      }
      const routingTime = Date.now() - routingStart;
      
      // Calculate overhead
      const baselineTime = Math.min(v1Time, v2Time);
      const overhead = ((routingTime - baselineTime) / baselineTime) * 100;
      
      console.log(`Performance overhead: ${overhead.toFixed(2)}%`);
      expect(overhead).toBeLessThan(5);
    });
  });
  
  describe('Health Monitoring', () => {
    it('should report health for both versions', async () => {
      const health = await healthChecker.checkHealth();
      
      expect(health.overall).toBe('healthy');
      expect(health.versions['1.0']).toBeDefined();
      expect(health.versions['2.0']).toBeDefined();
    });
    
    it('should detect degraded state', async () => {
      // Simulate v2 unhealthy
      healthChecker.registerCheck('v2-failing', async () => ({
        service: 'v2-failing',
        status: 'unhealthy',
        responseTime: 0,
        error: 'Simulated failure'
      }));
      
      const health = await healthChecker.checkHealth();
      expect(['degraded', 'unhealthy']).toContain(health.overall);
    });
  });
});