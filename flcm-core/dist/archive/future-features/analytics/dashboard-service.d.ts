/**
 * Dashboard Service
 * Provides web-based dashboard for migration monitoring
 */
import { DashboardPanel } from './types';
import { MetricsStore } from './metrics-store';
export declare class DashboardService {
    private metricsStore;
    private server?;
    private port;
    private logger;
    private panels;
    constructor(metricsStore: MetricsStore);
    /**
     * Start dashboard server
     */
    start(): void;
    /**
     * Stop dashboard server
     */
    stop(): void;
    /**
     * Handle HTTP requests
     */
    private handleRequest;
    /**
     * Serve main dashboard HTML
     */
    private serveDashboard;
    /**
     * Serve current metrics
     */
    private serveMetrics;
    /**
     * Serve dashboard panels configuration
     */
    private servePanels;
    /**
     * Serve time series data
     */
    private serveTimeSeries;
    /**
     * Serve system status
     */
    private serveStatus;
    /**
     * Send JSON response
     */
    private sendJSON;
    /**
     * Send 404 response
     */
    private send404;
    /**
     * Send 500 response
     */
    private send500;
    /**
     * Get default dashboard panels
     */
    private getDefaultPanels;
    /**
     * Update dashboard with new data
     */
    update(metrics: Record<string, any>): void;
    /**
     * Get dashboard URL
     */
    getUrl(): string;
    /**
     * Set custom port
     */
    setPort(port: number): void;
    /**
     * Add custom panel
     */
    addPanel(panel: DashboardPanel): void;
    /**
     * Remove panel
     */
    removePanel(panelId: string): void;
}
