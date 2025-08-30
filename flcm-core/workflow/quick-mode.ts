/**
 * Quick Mode Workflow
 * 20-30 minute content creation with essential processing
 */

import { PipelineOrchestrator, WorkflowConfig, WorkflowResult } from './pipeline-orchestrator';
import { EventEmitter } from 'events';

export interface QuickModeOptions {
  topic: string;
  platforms?: string[];
  voiceProfile?: 'casual' | 'professional' | 'academic';
  maxDuration?: number; // in minutes
}

export class QuickModeWorkflow extends EventEmitter {
  private orchestrator: PipelineOrchestrator;
  private startTime: Date | null = null;
  private config: WorkflowConfig;
  
  constructor() {
    super();
    this.orchestrator = new PipelineOrchestrator();
    this.setupEventListeners();
    
    // Default Quick Mode configuration
    this.config = {
      mode: 'quick',
      agents: [
        {
          name: 'collector',
          enabled: true,
          config: {
            maxSources: 3,
            depth: 'basic',
            timeout: 300, // 5 minutes
            prioritize: 'relevance'
          }
        },
        {
          name: 'scholar',
          enabled: true,
          config: {
            maxDepth: 3, // Only go to Level 3 (Principle Understanding)
            analogies: 2,
            skipLevel5: true,
            timeout: 300 // 5 minutes
          }
        },
        {
          name: 'creator',
          enabled: true,
          config: {
            iterations: 1, // Single pass for speed
            voiceAnalysis: 'basic',
            hookVariations: 1,
            targetLength: 400, // Shorter content
            timeout: 600 // 10 minutes
          }
        },
        {
          name: 'adapter',
          enabled: true,
          config: {
            platforms: ['linkedin', 'twitter'], // Focus on 2 platforms
            hashtags: 'auto',
            visuals: 'skip', // Skip visual suggestions for speed
            timeout: 300 // 5 minutes
          }
        }
      ],
      options: {
        saveCheckpoints: false, // Skip for speed
        parallel: false,
        timeout: 1800000, // 30 minutes total
        qualityGates: false // Skip quality gates for speed
      }
    };
  }

  /**
   * Execute Quick Mode workflow
   */
  async execute(options: QuickModeOptions): Promise<WorkflowResult> {
    this.startTime = new Date();
    
    console.log('\n⚡ Quick Mode Workflow Started');
    console.log('=' .repeat(60));
    console.log(`Topic: ${options.topic}`);
    console.log(`Target Duration: ${options.maxDuration || 30} minutes`);
    console.log(`Platforms: ${options.platforms?.join(', ') || 'LinkedIn, Twitter'}`);
    console.log('=' .repeat(60));
    
    // Customize configuration based on options
    this.customizeConfig(options);
    
    // Start progress tracking
    this.emit('quickmode:start', { options, startTime: this.startTime });
    
    try {
      // Execute workflow
      const result = await this.orchestrator.execute(options.topic, this.config);
      
      // Calculate total time
      const endTime = new Date();
      const duration = (endTime.getTime() - this.startTime.getTime()) / 1000 / 60; // minutes
      
      // Emit completion
      this.emit('quickmode:complete', {
        result,
        duration,
        withinTarget: duration <= (options.maxDuration || 30)
      });
      
      // Display summary
      this.displaySummary(result, duration);
      
      return result;
      
    } catch (error) {
      this.emit('quickmode:error', { error });
      throw error;
    }
  }

  /**
   * Customize configuration based on options
   */
  private customizeConfig(options: QuickModeOptions): void {
    // Update platforms if specified
    if (options.platforms && options.platforms.length > 0) {
      const adapterConfig = this.config.agents.find(a => a.name === 'adapter');
      if (adapterConfig) {
        adapterConfig.config!.platforms = options.platforms.slice(0, 2); // Max 2 for quick mode
      }
    }
    
    // Adjust voice profile
    if (options.voiceProfile) {
      const creatorConfig = this.config.agents.find(a => a.name === 'creator');
      if (creatorConfig) {
        creatorConfig.config!.voiceProfile = options.voiceProfile;
      }
    }
    
    // Set max duration
    if (options.maxDuration) {
      this.config.options!.timeout = options.maxDuration * 60 * 1000; // Convert to ms
    }
  }

  /**
   * Setup event listeners for progress tracking
   */
  private setupEventListeners(): void {
    this.orchestrator.on('agent:start', (data) => {
      const elapsed = this.getElapsedTime();
      console.log(`\n⏱️  [${elapsed}] Starting ${data.agent} agent...`);
      this.emit('progress', { agent: data.agent, status: 'start', elapsed });
    });
    
    this.orchestrator.on('agent:complete', (data) => {
      const elapsed = this.getElapsedTime();
      console.log(`✅ [${elapsed}] ${data.agent} completed (${(data.duration / 1000).toFixed(1)}s)`);
      this.emit('progress', { agent: data.agent, status: 'complete', elapsed });
    });
    
    this.orchestrator.on('agent:error', (data) => {
      const elapsed = this.getElapsedTime();
      console.log(`❌ [${elapsed}] ${data.agent} failed: ${data.error.message}`);
      this.emit('progress', { agent: data.agent, status: 'error', elapsed });
    });
  }

  /**
   * Get elapsed time in minutes:seconds format
   */
  private getElapsedTime(): string {
    if (!this.startTime) return '00:00';
    
    const elapsed = Date.now() - this.startTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Display workflow summary
   */
  private displaySummary(result: WorkflowResult, duration: number): void {
    console.log('\n' + '='.repeat(60));
    console.log('⚡ Quick Mode Workflow Complete!');
    console.log('=' .repeat(60));
    
    if (result.success) {
      console.log('\n📊 Performance Metrics:');
      console.log(`  ⏱️  Total Duration: ${duration.toFixed(1)} minutes`);
      console.log(`  ✅ Status: ${duration <= 30 ? 'Within Target' : 'Exceeded Target'}`);
      
      // Agent durations
      console.log('\n⏱️  Agent Timings:');
      result.state.metrics.agentDurations.forEach((time, agent) => {
        console.log(`  ${agent}: ${(time / 1000).toFixed(1)}s`);
      });
      
      // Quality scores
      if (result.state.metrics.qualityScores.size > 0) {
        console.log('\n📈 Quality Scores:');
        result.state.metrics.qualityScores.forEach((score, agent) => {
          console.log(`  ${agent}: ${score}%`);
        });
      }
      
      // Final content preview
      if (result.finalContent) {
        const content = Array.isArray(result.finalContent) ? 
          result.finalContent[0] : result.finalContent;
        
        console.log('\n📝 Content Generated:');
        console.log(`  Platform: ${content.platform}`);
        console.log(`  Title: ${content.optimizedTitle}`);
        console.log(`  Length: ${content.characterCount} characters`);
        console.log(`  Hashtags: ${content.hashtags.slice(0, 3).join(', ')}`);
        console.log(`  Engagement Score: ${content.metadata.platformFitScore}%`);
      }
      
      console.log('\n✨ Content is ready for publishing!');
      
    } else {
      console.log('\n❌ Workflow failed:');
      console.log(`  Error: ${result.error?.message}`);
      console.log(`  Failed at: ${result.state.currentAgent}`);
    }
    
    console.log('=' .repeat(60));
  }

  /**
   * Estimate time remaining
   */
  estimateTimeRemaining(): number {
    if (!this.startTime) return 30;
    
    const elapsed = (Date.now() - this.startTime.getTime()) / 1000 / 60;
    const progress = this.orchestrator.getState().progress;
    
    if (progress === 0) return 30;
    
    const totalEstimate = (elapsed / progress) * 100;
    return Math.max(0, totalEstimate - elapsed);
  }

  /**
   * Get current progress percentage
   */
  getProgress(): number {
    return this.orchestrator.getState().progress;
  }

  /**
   * Pause workflow
   */
  pause(): void {
    this.orchestrator.pause();
    console.log('\n⏸️  Workflow paused');
  }

  /**
   * Resume workflow
   */
  resume(): void {
    this.orchestrator.resume();
    console.log('\n▶️  Workflow resumed');
  }

  /**
   * Cancel workflow
   */
  cancel(): void {
    this.orchestrator.cancel();
    console.log('\n🛑 Workflow cancelled');
  }
}

// Quick Mode presets for common use cases
export const QuickModePresets = {
  blogPost: {
    topic: '',
    platforms: ['linkedin', 'twitter'],
    voiceProfile: 'professional' as const,
    maxDuration: 25
  },
  
  socialUpdate: {
    topic: '',
    platforms: ['twitter', 'linkedin'],
    voiceProfile: 'casual' as const,
    maxDuration: 20
  },
  
  thoughtLeadership: {
    topic: '',
    platforms: ['linkedin'],
    voiceProfile: 'professional' as const,
    maxDuration: 30
  },
  
  viralContent: {
    topic: '',
    platforms: ['twitter', 'xiaohongshu'],
    voiceProfile: 'casual' as const,
    maxDuration: 25
  }
};

export default QuickModeWorkflow;