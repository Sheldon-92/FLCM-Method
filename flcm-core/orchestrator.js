/**
 * FLCM Orchestrator - BMad Style
 * 动态加载和执行agent、任务的核心调度器
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class FLCMOrchestrator {
  constructor() {
    this.baseDir = __dirname;
    this.activeAgent = null;
    this.context = {};
    this.agents = new Map();
    this.tasks = new Map();
  }

  /**
   * 执行agent的特定任务
   */
  async execute(agentName, taskName, params = {}) {
    console.log(`\n🎯 Executing: ${agentName}.${taskName}`);
    
    // 加载agent
    const agent = await this.loadAgent(agentName);
    if (!agent) {
      throw new Error(`Agent '${agentName}' not found`);
    }

    // 加载任务
    const task = await this.loadTask(taskName);
    if (!task) {
      throw new Error(`Task '${taskName}' not found`);
    }

    // 设置当前agent
    this.activeAgent = agent;
    
    // 执行任务
    return await this.runTask(task, params);
  }

  /**
   * 加载agent配置
   */
  async loadAgent(name) {
    // 检查缓存
    if (this.agents.has(name)) {
      return this.agents.get(name);
    }

    // 加载YAML配置
    const agentPath = path.join(this.baseDir, 'agents', `${name}.yaml`);
    if (!fs.existsSync(agentPath)) {
      // 如果YAML不存在，创建默认配置
      return this.createDefaultAgent(name);
    }

    try {
      const content = fs.readFileSync(agentPath, 'utf8');
      const agent = yaml.load(content);
      this.agents.set(name, agent);
      console.log(`✅ Loaded agent: ${agent.agent.name}`);
      return agent;
    } catch (error) {
      console.error(`❌ Failed to load agent ${name}:`, error.message);
      return null;
    }
  }

  /**
   * 创建默认agent配置（向后兼容）
   */
  createDefaultAgent(name) {
    const defaultAgents = {
      scholar: {
        agent: {
          name: 'Scholar',
          id: 'scholar',
          icon: '📚',
          version: '2.0'
        },
        persona: {
          role: 'Content Analysis Expert',
          style: 'Analytical, thorough, evidence-based',
          focus: 'Deep understanding and insight extraction'
        },
        capabilities: [
          'URL content extraction',
          'Framework analysis (SWOT, SCAMPER, etc)',
          'Progressive depth learning',
          'Voice DNA extraction'
        ],
        defaultTask: 'analyze-content'
      },
      creator: {
        agent: {
          name: 'Creator',
          id: 'creator',
          icon: '✍️',
          version: '2.0'
        },
        persona: {
          role: 'Content Creation Expert',
          style: 'Creative, engaging, adaptive',
          focus: 'High-quality content generation'
        },
        capabilities: [
          'Quick mode (20min)',
          'Standard mode (45min)',
          'Deep mode (60min+)',
          'Voice DNA application'
        ],
        defaultTask: 'create-article'
      },
      publisher: {
        agent: {
          name: 'Publisher',
          id: 'publisher',
          icon: '📤',
          version: '2.0'
        },
        persona: {
          role: 'Multi-platform Publishing Expert',
          style: 'Platform-aware, optimized, strategic',
          focus: 'Maximum reach and engagement'
        },
        capabilities: [
          'Platform adaptation',
          'Hashtag generation',
          'Format optimization',
          'Publishing strategy'
        ],
        defaultTask: 'publish-content'
      }
    };

    const agent = defaultAgents[name];
    if (agent) {
      this.agents.set(name, agent);
      return agent;
    }
    return null;
  }

  /**
   * 加载任务定义
   */
  async loadTask(name) {
    // 检查缓存
    if (this.tasks.has(name)) {
      return this.tasks.get(name);
    }

    // 尝试加载Markdown任务文件
    const taskPath = path.join(this.baseDir, 'tasks', `${name}.md`);
    if (fs.existsSync(taskPath)) {
      const content = fs.readFileSync(taskPath, 'utf8');
      const task = this.parseTaskMarkdown(content);
      this.tasks.set(name, task);
      return task;
    }

    // 返回默认任务结构
    return this.createDefaultTask(name);
  }

  /**
   * 解析任务Markdown文件
   */
  parseTaskMarkdown(content) {
    // 简单解析Markdown获取任务步骤
    const lines = content.split('\n');
    const task = {
      name: '',
      steps: [],
      config: {}
    };

    let currentSection = '';
    for (const line of lines) {
      if (line.startsWith('# ')) {
        task.name = line.substring(2).trim();
      } else if (line.startsWith('## ')) {
        currentSection = line.substring(3).trim().toLowerCase();
      } else if (line.startsWith('### ') && currentSection === 'steps') {
        task.steps.push(line.substring(4).trim());
      } else if (line.includes('```yaml') && currentSection === 'configuration') {
        // 解析YAML配置块
        const yamlStart = lines.indexOf(line) + 1;
        const yamlEnd = lines.indexOf('```', yamlStart);
        if (yamlEnd > yamlStart) {
          const yamlContent = lines.slice(yamlStart, yamlEnd).join('\n');
          try {
            task.config = yaml.load(yamlContent);
          } catch (e) {
            console.warn('Failed to parse task config:', e.message);
          }
        }
      }
    }

    return task;
  }

  /**
   * 创建默认任务
   */
  createDefaultTask(name) {
    const defaultTasks = {
      'analyze-content': {
        name: 'Content Analysis',
        steps: [
          'Extract content from source',
          'Apply analysis frameworks',
          'Generate insights document'
        ],
        config: {
          depth: 4,
          frameworks: ['SWOT', 'SCAMPER', 'First-Principles']
        }
      },
      'create-article': {
        name: 'Article Creation',
        steps: [
          'Analyze insights document',
          'Generate content structure',
          'Write sections',
          'Apply voice DNA',
          'Review and refine'
        ],
        config: {
          modes: {
            quick: { time: 20, depth: 2 },
            standard: { time: 45, depth: 3 },
            deep: { time: 60, depth: 4 }
          }
        }
      },
      'publish-content': {
        name: 'Content Publishing',
        steps: [
          'Load content document',
          'Adapt for platform',
          'Generate hashtags',
          'Format content',
          'Prepare publishing package'
        ],
        config: {
          platforms: ['xiaohongshu', 'zhihu', 'wechat', 'linkedin']
        }
      }
    };

    return defaultTasks[name] || {
      name: name,
      steps: ['Execute task'],
      config: {}
    };
  }

  /**
   * 执行任务
   */
  async runTask(task, params) {
    console.log(`\n📋 Running task: ${task.name}`);
    console.log(`Steps: ${task.steps.length}`);
    
    // 模拟任务执行
    for (let i = 0; i < task.steps.length; i++) {
      const step = task.steps[i];
      console.log(`  ${i + 1}. ${step}`);
      
      // 这里可以添加实际的任务执行逻辑
      await this.executeStep(step, params);
    }

    console.log(`\n✅ Task completed: ${task.name}`);
    return {
      success: true,
      task: task.name,
      agent: this.activeAgent?.agent?.name,
      params
    };
  }

  /**
   * 执行单个步骤
   */
  async executeStep(step, params) {
    // 这里实现具体的步骤执行逻辑
    // 可以调用方法论、模板等
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * 执行工作流
   */
  async executeWorkflow(workflowName) {
    console.log(`\n🔄 Starting workflow: ${workflowName}`);
    
    // 定义工作流步骤
    const workflows = {
      standard: [
        { agent: 'scholar', task: 'analyze-content' },
        { agent: 'creator', task: 'create-article' },
        { agent: 'publisher', task: 'publish-content' }
      ],
      quick: [
        { agent: 'creator', task: 'create-article' },
        { agent: 'publisher', task: 'publish-content' }
      ]
    };

    const workflow = workflows[workflowName] || workflows.standard;
    
    // 执行工作流步骤
    for (const step of workflow) {
      await this.execute(step.agent, step.task);
    }
    
    console.log(`\n✅ Workflow completed: ${workflowName}`);
  }

  /**
   * 激活agent（交互模式）
   */
  async activateAgent(agentName) {
    const agent = await this.loadAgent(agentName);
    if (!agent) {
      throw new Error(`Agent '${agentName}' not found`);
    }

    this.activeAgent = agent;
    
    console.log(`\n🎭 Agent Activated: ${agent.agent.name}`);
    console.log(`Role: ${agent.persona.role}`);
    console.log(`Style: ${agent.persona.style}`);
    
    if (agent.capabilities) {
      console.log('\n📋 Capabilities:');
      agent.capabilities.forEach((cap, i) => {
        console.log(`  ${i + 1}. ${cap}`);
      });
    }
    
    console.log('\n💡 Agent is ready for interaction');
    return agent;
  }
}

module.exports = FLCMOrchestrator;