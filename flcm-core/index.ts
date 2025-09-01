/**
 * FLCM 2.0 Main Entry Point
 * Dual architecture system with version routing
 */

import { VersionRouter } from './router';
import { V1Handler } from './legacy/v1-handler';
import { V2Handler } from './v2/v2-handler';
import { HealthChecker } from './shared/health/health-checker';
import { Logger } from './shared/utils/logger';
import * as express from 'express';

// Initialize logger
const logger = new Logger('FLCM-Main');

// Initialize components
const router = new VersionRouter();
const healthChecker = new HealthChecker();

// Register version handlers
router.registerV1Handler(new V1Handler());
router.registerV2Handler(new V2Handler());

// Register health checks
healthChecker.registerCheck('v1', async () => {
  const health = await router.healthCheck();
  return {
    service: 'FLCM-1.0',
    status: health.versions['1.0']?.status || 'unhealthy',
    responseTime: 0,
    details: health.versions['1.0']
  };
});

healthChecker.registerCheck('v2', async () => {
  const health = await router.healthCheck();
  return {
    service: 'FLCM-2.0',
    status: health.versions['2.0']?.status || 'unhealthy',
    responseTime: 0,
    details: health.versions['2.0']
  };
});

// Create Express app for HTTP interface
const app = express();
app.use(express.json());

// Version routing middleware
app.use(async (req, res, next) => {
  try {
    const versionRequest = {
      path: req.path,
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: req.body,
      params: req.params,
      query: req.query as Record<string, string>,
      user: req['user'] // If authentication middleware sets this
    };
    
    const response = await router.route(versionRequest);
    
    res.status(response.status);
    
    if (response.headers) {
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
    
    res.setHeader('X-FLCM-Version', response.version);
    res.setHeader('X-Processing-Time', `${response.processingTime}ms`);
    
    res.json(response.body);
  } catch (error) {
    next(error);
  }
});

// Health check endpoints
app.get('/health', async (req, res) => {
  const health = await healthChecker.checkHealth();
  const statusCode = health.overall === 'healthy' ? 200 : 
                     health.overall === 'degraded' ? 503 : 500;
  res.status(statusCode).json(health);
});

app.get('/health/v1', async (req, res) => {
  const health = await healthChecker.checkVersionHealth('1.0');
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.get('/health/v2', async (req, res) => {
  const health = await healthChecker.checkVersionHealth('2.0');
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server if running directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    logger.info(`FLCM dual architecture server started`, {
      port: PORT,
      defaultVersion: router.getConfig().defaultVersion,
      v2Enabled: router.getConfig().featureFlags
    });
    
    // Start health monitoring
    healthChecker.startMonitoring(60000); // Check every minute
  });
}

// Export for use as module
export {
  router,
  healthChecker,
  app,
  VersionRouter,
  V1Handler,
  V2Handler,
  HealthChecker
};