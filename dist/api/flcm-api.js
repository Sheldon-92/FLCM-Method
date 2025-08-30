"use strict";
/**
 * FLCM REST API Server
 * Provides HTTP endpoints for content creation workflows
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const uuid_1 = require("uuid");
const quick_mode_1 = require("../workflow/quick-mode");
const standard_mode_1 = require("../workflow/standard-mode");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
// In-memory storage (replace with database in production)
const workflows = new Map();
const results = new Map();
/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
/**
 * API documentation endpoint
 */
app.get('/api', (req, res) => {
    res.json({
        name: 'FLCM API',
        version: '1.0.0',
        description: 'AI-powered content creation pipeline API',
        endpoints: {
            workflows: {
                start: 'POST /api/workflows/start',
                status: 'GET /api/workflows/:id/status',
                result: 'GET /api/workflows/:id/result',
                cancel: 'POST /api/workflows/:id/cancel',
                list: 'GET /api/workflows'
            },
            agents: {
                list: 'GET /api/agents',
                execute: 'POST /api/agents/:name/execute',
                info: 'GET /api/agents/:name'
            },
            content: {
                preview: 'POST /api/content/preview',
                optimize: 'POST /api/content/optimize',
                export: 'POST /api/content/export'
            }
        }
    });
});
/**
 * Start a new workflow
 */
app.post('/api/workflows/start', async (req, res, next) => {
    try {
        const { topic, mode = 'standard', platforms = ['linkedin', 'twitter'], voiceProfile = 'professional', depth = 'standard', options = {} } = req.body;
        // Validate input
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }
        const workflowId = (0, uuid_1.v4)();
        let workflow;
        // Create appropriate workflow
        if (mode === 'quick') {
            workflow = new quick_mode_1.QuickModeWorkflow();
        }
        else {
            workflow = new standard_mode_1.StandardModeWorkflow();
        }
        // Store workflow
        workflows.set(workflowId, {
            id: workflowId,
            status: 'running',
            mode,
            topic,
            platforms,
            startTime: new Date(),
            progress: 0,
            currentAgent: null
        });
        // Setup event handlers
        workflow.on('progress', (data) => {
            const wf = workflows.get(workflowId);
            if (wf) {
                wf.progress = data.progress || 0;
                wf.currentAgent = data.agent;
                workflows.set(workflowId, wf);
            }
        });
        workflow.on('quickmode:complete', (data) => {
            const wf = workflows.get(workflowId);
            if (wf) {
                wf.status = 'completed';
                wf.endTime = new Date();
                wf.duration = data.duration;
                workflows.set(workflowId, wf);
                results.set(workflowId, data.result);
            }
        });
        workflow.on('standardmode:complete', (data) => {
            const wf = workflows.get(workflowId);
            if (wf) {
                wf.status = 'completed';
                wf.endTime = new Date();
                wf.duration = data.duration;
                workflows.set(workflowId, wf);
                results.set(workflowId, data.result);
            }
        });
        workflow.on('quickmode:error', (data) => {
            const wf = workflows.get(workflowId);
            if (wf) {
                wf.status = 'failed';
                wf.error = data.error.message;
                workflows.set(workflowId, wf);
            }
        });
        workflow.on('standardmode:error', (data) => {
            const wf = workflows.get(workflowId);
            if (wf) {
                wf.status = 'failed';
                wf.error = data.error.message;
                workflows.set(workflowId, wf);
            }
        });
        // Start workflow asynchronously
        workflow.execute({
            topic,
            platforms,
            voiceProfile,
            depth,
            ...options
        }).catch((error) => {
            const wf = workflows.get(workflowId);
            if (wf) {
                wf.status = 'failed';
                wf.error = error.message;
                workflows.set(workflowId, wf);
            }
        });
        res.status(202).json({
            workflowId,
            status: 'started',
            message: 'Workflow started successfully',
            links: {
                status: `/api/workflows/${workflowId}/status`,
                result: `/api/workflows/${workflowId}/result`,
                cancel: `/api/workflows/${workflowId}/cancel`
            }
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Get workflow status
 */
app.get('/api/workflows/:id/status', (req, res) => {
    const workflowId = req.params.id;
    const workflow = workflows.get(workflowId);
    if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json({
        id: workflow.id,
        status: workflow.status,
        progress: workflow.progress,
        currentAgent: workflow.currentAgent,
        mode: workflow.mode,
        topic: workflow.topic,
        platforms: workflow.platforms,
        startTime: workflow.startTime,
        endTime: workflow.endTime,
        duration: workflow.duration,
        error: workflow.error
    });
});
/**
 * Get workflow result
 */
app.get('/api/workflows/:id/result', (req, res) => {
    const workflowId = req.params.id;
    const workflow = workflows.get(workflowId);
    if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
    }
    if (workflow.status !== 'completed') {
        return res.status(202).json({
            message: 'Workflow still in progress',
            status: workflow.status,
            progress: workflow.progress
        });
    }
    const result = results.get(workflowId);
    if (!result) {
        return res.status(404).json({ error: 'Results not found' });
    }
    res.json({
        workflowId,
        success: result.success,
        content: result.finalContent,
        metrics: {
            totalDuration: result.state.metrics.totalDuration,
            agentDurations: Object.fromEntries(result.state.metrics.agentDurations),
            qualityScores: Object.fromEntries(result.state.metrics.qualityScores),
            errorCount: result.state.metrics.errorCount
        }
    });
});
/**
 * Cancel workflow
 */
app.post('/api/workflows/:id/cancel', (req, res) => {
    const workflowId = req.params.id;
    const workflow = workflows.get(workflowId);
    if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
    }
    if (workflow.status !== 'running') {
        return res.status(400).json({
            error: 'Cannot cancel workflow',
            currentStatus: workflow.status
        });
    }
    // Update status
    workflow.status = 'cancelled';
    workflow.endTime = new Date();
    workflows.set(workflowId, workflow);
    res.json({
        workflowId,
        status: 'cancelled',
        message: 'Workflow cancelled successfully'
    });
});
/**
 * List all workflows
 */
app.get('/api/workflows', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const status = req.query.status;
    let workflowList = Array.from(workflows.values());
    // Filter by status if provided
    if (status) {
        workflowList = workflowList.filter(w => w.status === status);
    }
    // Sort by start time (newest first)
    workflowList.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    // Paginate
    const paginatedList = workflowList.slice(offset, offset + limit);
    res.json({
        total: workflowList.length,
        limit,
        offset,
        workflows: paginatedList.map(w => ({
            id: w.id,
            status: w.status,
            mode: w.mode,
            topic: w.topic,
            platforms: w.platforms,
            startTime: w.startTime,
            endTime: w.endTime,
            progress: w.progress
        }))
    });
});
/**
 * List available agents
 */
app.get('/api/agents', (req, res) => {
    res.json({
        agents: [
            {
                name: 'collector',
                description: 'Collects and analyzes content from various sources',
                capabilities: ['rice_scoring', 'signal_extraction', 'content_analysis']
            },
            {
                name: 'scholar',
                description: 'Performs deep learning and knowledge synthesis',
                capabilities: ['progressive_depth', 'analogy_generation', 'teaching_notes']
            },
            {
                name: 'creator',
                description: 'Creates engaging content with voice preservation',
                capabilities: ['voice_dna', 'spark_framework', 'iterative_refinement']
            },
            {
                name: 'adapter',
                description: 'Optimizes content for multiple platforms',
                capabilities: ['platform_optimization', 'hashtag_generation', 'format_adaptation']
            }
        ]
    });
});
/**
 * Get agent information
 */
app.get('/api/agents/:name', (req, res) => {
    const agentName = req.params.name;
    const agents = {
        collector: {
            name: 'collector',
            version: '1.0.0',
            description: 'Content collection and analysis agent',
            input: 'URL, text, or file',
            output: 'Content brief with signals and RICE score',
            methodologies: ['RICE Framework', 'Signal-to-Noise Filter'],
            config: {
                maxSources: 5,
                depth: 'comprehensive',
                timeout: 600
            }
        },
        scholar: {
            name: 'scholar',
            version: '1.0.0',
            description: 'Knowledge synthesis and deep learning agent',
            input: 'Content brief',
            output: 'Knowledge synthesis with analogies',
            methodologies: ['Progressive Depth Learning', 'Analogy Generator'],
            config: {
                maxDepth: 5,
                analogies: 5,
                teachingNotes: true
            }
        },
        creator: {
            name: 'creator',
            version: '1.0.0',
            description: 'Content creation and voice preservation agent',
            input: 'Knowledge synthesis',
            output: 'Content draft with engagement metrics',
            methodologies: ['Voice DNA', 'SPARK Framework'],
            config: {
                iterations: 3,
                voiceAnalysis: 'comprehensive',
                hookVariations: 3
            }
        },
        adapter: {
            name: 'adapter',
            version: '1.0.0',
            description: 'Platform optimization and adaptation agent',
            input: 'Content draft',
            output: 'Platform-optimized content',
            methodologies: ['Platform Optimizer', 'Hashtag Generator'],
            config: {
                platforms: ['linkedin', 'twitter', 'wechat', 'xiaohongshu'],
                hashtags: 'optimized',
                visuals: 'suggested'
            }
        }
    };
    const agent = agents[agentName];
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
});
/**
 * Execute single agent
 */
app.post('/api/agents/:name/execute', async (req, res, next) => {
    try {
        const agentName = req.params.name;
        const { input, config = {} } = req.body;
        if (!input) {
            return res.status(400).json({ error: 'Input is required' });
        }
        // This would execute the specific agent
        // For demo purposes, returning mock response
        res.json({
            agent: agentName,
            status: 'completed',
            output: {
                type: `${agentName}-output`,
                content: `Processed by ${agentName} agent`,
                metadata: {
                    processingTime: 1500,
                    confidence: 0.85
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * Preview content for platform
 */
app.post('/api/content/preview', (req, res) => {
    const { content, platform } = req.body;
    if (!content || !platform) {
        return res.status(400).json({ error: 'Content and platform are required' });
    }
    // Generate preview based on platform
    const previews = {
        linkedin: {
            maxLength: 3000,
            preview: content.substring(0, 3000),
            formatting: ['bold headers', 'bullet points'],
            hashtagLimit: 5
        },
        twitter: {
            maxLength: 280,
            preview: content.substring(0, 280),
            formatting: ['thread structure'],
            hashtagLimit: 2
        },
        wechat: {
            maxLength: 2000,
            preview: content.substring(0, 2000),
            formatting: ['article format', 'visual breaks'],
            hashtagLimit: 0
        },
        xiaohongshu: {
            maxLength: 1000,
            preview: content.substring(0, 1000),
            formatting: ['emoji sections', 'lifestyle focus'],
            hashtagLimit: 10
        }
    };
    const preview = previews[platform];
    if (!preview) {
        return res.status(400).json({ error: 'Unsupported platform' });
    }
    res.json({
        platform,
        preview: preview.preview,
        constraints: {
            maxLength: preview.maxLength,
            formatting: preview.formatting,
            hashtagLimit: preview.hashtagLimit
        }
    });
});
/**
 * Export content
 */
app.post('/api/content/export', (req, res) => {
    const { content, format = 'json' } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }
    let exportedContent;
    switch (format) {
        case 'json':
            exportedContent = content;
            res.json(exportedContent);
            break;
        case 'markdown':
            exportedContent = `# ${content.title || 'Content'}\n\n${content.body || content}`;
            res.type('text/markdown').send(exportedContent);
            break;
        case 'text':
            exportedContent = `${content.title || 'Content'}\n\n${content.body || content}`;
            res.type('text/plain').send(exportedContent);
            break;
        default:
            return res.status(400).json({ error: 'Unsupported format' });
    }
});
/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});
/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
});
/**
 * Start server
 */
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 FLCM API Server running on port ${PORT}`);
        console.log(`   Health check: http://localhost:${PORT}/health`);
        console.log(`   API docs: http://localhost:${PORT}/api`);
    });
}
exports.default = app;
//# sourceMappingURL=flcm-api.js.map