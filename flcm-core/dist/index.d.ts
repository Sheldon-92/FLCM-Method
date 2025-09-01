/**
 * FLCM 2.0 Main Entry Point
 * Dual architecture system with version routing
 */
import { VersionRouter } from './router';
import { V1Handler } from './legacy/v1-handler';
import { V2Handler } from './v2/v2-handler';
import { HealthChecker } from './shared/health/health-checker';
declare const router: any;
declare const healthChecker: any;
declare const app: any;
export { router, healthChecker, app, VersionRouter, V1Handler, V2Handler, HealthChecker };
