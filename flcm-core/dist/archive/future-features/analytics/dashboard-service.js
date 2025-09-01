"use strict";
/**
 * Dashboard Service
 * Provides web-based dashboard for migration monitoring
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
exports.DashboardService = void 0;
const logger_1 = require("../shared/utils/logger");
const http = __importStar(require("http"));
class DashboardService {
    constructor(metricsStore) {
        this.port = 3001;
        this.metricsStore = metricsStore;
        this.logger = new logger_1.Logger('DashboardService');
        this.panels = this.getDefaultPanels();
    }
    /**
     * Start dashboard server
     */
    start() {
        this.server = http.createServer(this.handleRequest.bind(this));
        this.server.listen(this.port, () => {
            this.logger.info(`Dashboard started on http://localhost:${this.port}`);
        });
    }
    /**
     * Stop dashboard server
     */
    stop() {
        if (this.server) {
            this.server.close();
            this.logger.info('Dashboard stopped');
        }
    }
    /**
     * Handle HTTP requests
     */
    async handleRequest(req, res) {
        const url = req.url || '/';
        try {
            if (url === '/' || url === '/dashboard') {
                await this.serveDashboard(res);
            }
            else if (url === '/api/metrics') {
                await this.serveMetrics(res);
            }
            else if (url === '/api/panels') {
                await this.servePanels(res);
            }
            else if (url.startsWith('/api/series/')) {
                const metricName = url.replace('/api/series/', '');
                await this.serveTimeSeries(res, metricName);
            }
            else if (url === '/api/status') {
                await this.serveStatus(res);
            }
            else {
                this.send404(res);
            }
        }
        catch (error) {
            this.logger.error('Dashboard request error', { url, error });
            this.send500(res, error);
        }
    }
    /**
     * Serve main dashboard HTML
     */
    async serveDashboard(res) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>FLCM Migration Dashboard</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: #2c3e50;
            color: white;
            padding: 20px;
            margin: -20px -20px 20px -20px;
            border-radius: 0 0 10px 10px;
        }
        .header h1 {
            margin: 0;
            display: inline-block;
        }
        .status {
            float: right;
            background: #27ae60;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8em;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .panel {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .panel h3 {
            margin: 0 0 15px 0;
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ecf0f1;
        }
        .metric:last-child {
            border-bottom: none;
        }
        .metric-value {
            font-weight: bold;
            color: #27ae60;
        }
        .metric-value.warning {
            color: #f39c12;
        }
        .metric-value.danger {
            color: #e74c3c;
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3498db, #27ae60);
            transition: width 0.3s ease;
        }
        .chart-placeholder {
            height: 200px;
            background: #ecf0f1;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7f8c8d;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>FLCM Migration Dashboard</h1>
        <span class="status" id="status">Connected</span>
    </div>
    
    <div class="metrics-grid">
        <div class="panel">
            <h3>Migration Progress</h3>
            <div class="metric">
                <span>Adoption Rate</span>
                <span class="metric-value" id="adoption-rate">-</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="adoption-progress"></div>
            </div>
            <div class="metric">
                <span>V2 Users</span>
                <span class="metric-value" id="v2-users">-</span>
            </div>
            <div class="metric">
                <span>Migration Velocity</span>
                <span class="metric-value" id="velocity">-</span>
            </div>
        </div>
        
        <div class="panel">
            <h3>Usage Metrics</h3>
            <div class="metric">
                <span>V1 Requests</span>
                <span class="metric-value" id="v1-requests">-</span>
            </div>
            <div class="metric">
                <span>V2 Requests</span>
                <span class="metric-value" id="v2-requests">-</span>
            </div>
            <div class="metric">
                <span>Total Users</span>
                <span class="metric-value" id="total-users">-</span>
            </div>
        </div>
        
        <div class="panel">
            <h3>Error Rates</h3>
            <div class="metric">
                <span>V1 Error Rate</span>
                <span class="metric-value" id="v1-error-rate">-</span>
            </div>
            <div class="metric">
                <span>V2 Error Rate</span>
                <span class="metric-value" id="v2-error-rate">-</span>
            </div>
            <div class="metric">
                <span>Error Rate Difference</span>
                <span class="metric-value" id="error-diff">-</span>
            </div>
        </div>
        
        <div class="panel">
            <h3>Performance</h3>
            <div class="metric">
                <span>V1 Avg Response</span>
                <span class="metric-value" id="v1-perf">-</span>
            </div>
            <div class="metric">
                <span>V2 Avg Response</span>
                <span class="metric-value" id="v2-perf">-</span>
            </div>
            <div class="metric">
                <span>Performance Improvement</span>
                <span class="metric-value" id="perf-improvement">-</span>
            </div>
        </div>
        
        <div class="panel">
            <h3>User Satisfaction</h3>
            <div class="metric">
                <span>V1 NPS Score</span>
                <span class="metric-value" id="v1-nps">-</span>
            </div>
            <div class="metric">
                <span>V2 NPS Score</span>
                <span class="metric-value" id="v2-nps">-</span>
            </div>
            <div class="metric">
                <span>Satisfaction Trend</span>
                <span class="metric-value" id="satisfaction-trend">-</span>
            </div>
        </div>
        
        <div class="panel">
            <h3>System Status</h3>
            <div class="metric">
                <span>Last Update</span>
                <span class="metric-value" id="last-update">-</span>
            </div>
            <div class="metric">
                <span>Total Metrics</span>
                <span class="metric-value" id="total-metrics">-</span>
            </div>
            <div class="metric">
                <span>Collection Rate</span>
                <span class="metric-value" id="collection-rate">1/min</span>
            </div>
        </div>
    </div>
    
    <script>
        let ws;
        
        function updateMetrics() {
            fetch('/api/metrics')
                .then(res => res.json())
                .then(data => {
                    // Migration metrics
                    document.getElementById('adoption-rate').textContent = 
                        (data.migration?.adoption_rate * 100).toFixed(1) + '%';
                    document.getElementById('adoption-progress').style.width = 
                        (data.migration?.adoption_rate * 100) + '%';
                    document.getElementById('v2-users').textContent = 
                        data.migration?.v2_users || '0';
                    document.getElementById('velocity').textContent = 
                        (data.migration?.migration_velocity || 0).toFixed(1) + ' users/day';
                    
                    // Usage metrics
                    document.getElementById('v1-requests').textContent = 
                        data.usage?.v1_requests || '0';
                    document.getElementById('v2-requests').textContent = 
                        data.usage?.v2_requests || '0';
                    document.getElementById('total-users').textContent = 
                        data.usage?.total_unique_users || '0';
                    
                    // Error metrics
                    const v1ErrorRate = ((data.errors?.v1_error_rate || 0) * 100).toFixed(2);
                    const v2ErrorRate = ((data.errors?.v2_error_rate || 0) * 100).toFixed(2);
                    document.getElementById('v1-error-rate').textContent = v1ErrorRate + '%';
                    document.getElementById('v2-error-rate').textContent = v2ErrorRate + '%';
                    
                    const errorDiff = ((data.errors?.error_rate_diff || 0) * 100).toFixed(2);
                    const errorDiffEl = document.getElementById('error-diff');
                    errorDiffEl.textContent = errorDiff + '%';
                    errorDiffEl.className = parseFloat(errorDiff) > 0 ? 'metric-value danger' : 'metric-value';
                    
                    // Performance metrics
                    document.getElementById('v1-perf').textContent = 
                        (data.performance?.v1_avg || 0).toFixed(0) + 'ms';
                    document.getElementById('v2-perf').textContent = 
                        (data.performance?.v2_avg || 0).toFixed(0) + 'ms';
                    
                    const perfImprovement = data.performance?.improvement || 0;
                    const perfEl = document.getElementById('perf-improvement');
                    perfEl.textContent = perfImprovement.toFixed(1) + '%';
                    perfEl.className = perfImprovement > 0 ? 'metric-value' : 'metric-value warning';
                    
                    // Satisfaction metrics
                    document.getElementById('v1-nps').textContent = 
                        (data.satisfaction?.v1_nps || 0).toFixed(1);
                    document.getElementById('v2-nps').textContent = 
                        (data.satisfaction?.v2_nps || 0).toFixed(1);
                    
                    const satisfactionTrend = data.satisfaction?.trend || 'stable';
                    document.getElementById('satisfaction-trend').textContent = satisfactionTrend;
                    
                    // System status
                    document.getElementById('last-update').textContent = 
                        new Date().toLocaleTimeString();
                    document.getElementById('total-metrics').textContent = 
                        data.system?.total_metrics || '0';
                })
                .catch(err => {
                    console.error('Failed to fetch metrics:', err);
                    document.getElementById('status').textContent = 'Disconnected';
                    document.getElementById('status').style.backgroundColor = '#e74c3c';
                });
        }
        
        // Update every 5 seconds
        setInterval(updateMetrics, 5000);
        updateMetrics(); // Initial load
    </script>
</body>
</html>`;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }
    /**
     * Serve current metrics
     */
    async serveMetrics(res) {
        const metrics = {
            migration: this.metricsStore.getLatestMetrics('migration'),
            usage: this.metricsStore.getLatestMetrics('usage'),
            errors: this.metricsStore.getLatestMetrics('errors'),
            performance: this.metricsStore.getLatestMetrics('performance'),
            satisfaction: this.metricsStore.getLatestMetrics('satisfaction'),
            system: this.metricsStore.getStats()
        };
        this.sendJSON(res, metrics);
    }
    /**
     * Serve dashboard panels configuration
     */
    async servePanels(res) {
        this.sendJSON(res, { panels: this.panels });
    }
    /**
     * Serve time series data
     */
    async serveTimeSeries(res, metricName) {
        const series = this.metricsStore.getTimeSeries(metricName);
        this.sendJSON(res, { series });
    }
    /**
     * Serve system status
     */
    async serveStatus(res) {
        const status = {
            dashboard: 'running',
            port: this.port,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
        this.sendJSON(res, status);
    }
    /**
     * Send JSON response
     */
    sendJSON(res, data) {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(data));
    }
    /**
     * Send 404 response
     */
    send404(res) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
    /**
     * Send 500 response
     */
    send500(res, error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${error.message}`);
    }
    /**
     * Get default dashboard panels
     */
    getDefaultPanels() {
        return [
            {
                id: 'migration_progress',
                type: 'gauge',
                title: 'Migration Progress',
                metrics: ['migration.adoption_rate'],
                refresh_interval: 5000
            },
            {
                id: 'usage_comparison',
                type: 'bar',
                title: 'Usage Comparison',
                metrics: ['usage.v1_requests', 'usage.v2_requests'],
                refresh_interval: 5000
            },
            {
                id: 'error_rates',
                type: 'line',
                title: 'Error Rates',
                metrics: ['errors.v1_error_rate', 'errors.v2_error_rate'],
                refresh_interval: 5000
            },
            {
                id: 'performance_trends',
                type: 'line',
                title: 'Performance Trends',
                metrics: ['performance.v1_avg', 'performance.v2_avg'],
                refresh_interval: 5000
            },
            {
                id: 'satisfaction_scores',
                type: 'line',
                title: 'Satisfaction Scores',
                metrics: ['satisfaction.v1_nps', 'satisfaction.v2_nps'],
                refresh_interval: 10000
            }
        ];
    }
    /**
     * Update dashboard with new data
     */
    update(metrics) {
        // This would typically broadcast updates to connected websockets
        // For now, we'll just log the update
        this.logger.debug('Dashboard updated with new metrics', {
            timestamp: new Date(),
            metricsCount: Object.keys(metrics).length
        });
    }
    /**
     * Get dashboard URL
     */
    getUrl() {
        return `http://localhost:${this.port}`;
    }
    /**
     * Set custom port
     */
    setPort(port) {
        if (this.server) {
            throw new Error('Cannot change port while server is running');
        }
        this.port = port;
    }
    /**
     * Add custom panel
     */
    addPanel(panel) {
        this.panels.push(panel);
        this.logger.info(`Added dashboard panel: ${panel.id}`);
    }
    /**
     * Remove panel
     */
    removePanel(panelId) {
        this.panels = this.panels.filter(p => p.id !== panelId);
        this.logger.info(`Removed dashboard panel: ${panelId}`);
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard-service.js.map