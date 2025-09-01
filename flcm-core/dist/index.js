"use strict";
/**
 * FLCM 2.0 Main Entry Point
 * Dual architecture system with version routing
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
exports.HealthChecker = exports.V2Handler = exports.V1Handler = exports.VersionRouter = exports.app = exports.healthChecker = exports.router = void 0;
const router_1 = require("./router");
Object.defineProperty(exports, "VersionRouter", { enumerable: true, get: function () { return router_1.VersionRouter; } });
const v1_handler_1 = require("./legacy/v1-handler");
Object.defineProperty(exports, "V1Handler", { enumerable: true, get: function () { return v1_handler_1.V1Handler; } });
const v2_handler_1 = require("./v2/v2-handler");
Object.defineProperty(exports, "V2Handler", { enumerable: true, get: function () { return v2_handler_1.V2Handler; } });
const health_checker_1 = require("./shared/health/health-checker");
Object.defineProperty(exports, "HealthChecker", { enumerable: true, get: function () { return health_checker_1.HealthChecker; } });
const express = __importStar(require("express"));
// Initialize logger
const logger = new logger_1.Logger('FLCM-Main');
// Initialize components
const router = new router_1.VersionRouter();
exports.router = router;
const healthChecker = new health_checker_1.HealthChecker();
exports.healthChecker = healthChecker;
// Register version handlers
router.registerV1Handler(new v1_handler_1.V1Handler());
router.registerV2Handler(new v2_handler_1.V2Handler());
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
exports.app = app;
app.use(express.json());
// Version routing middleware
app.use(async (req, res, next) => {
    try {
        const versionRequest = {
            path: req.path,
            method: req.method,
            headers: req.headers,
            body: req.body,
            params: req.params,
            query: req.query,
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
    }
    catch (error) {
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
app.use((err, req, res, next) => {
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
//# sourceMappingURL=index.js.map