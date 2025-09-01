/**
 * Standard Mode Workflow
 * 45-60 minute comprehensive content creation with full optimization
 */

import { PipelineOrchestrator, WorkflowConfig, WorkflowResult } from './pipeline-orchestrator';
import { EventEmitter } from 'events';

export interface StandardModeOptions {
  topic: string;
  platforms?: string[];
  voiceProfile?: 'casual' | 'professional' | 'academic' | 'technical';
  depth?: 'standard' | 'comprehensive' | 'expert';
  optimization?: 'balanced' | 'quality' | 'speed';
  maxDuration?: number; // in minutes
}

export class StandardModeWorkflow extends EventEmitter {
  private orchestrator: PipelineOrchestrator;
  private startTime: Date | null = null;
  private config: WorkflowConfig;
  
  constructor() {
    super();
    this.orchestrator = new PipelineOrchestrator();
    this.setupEventListeners();
    
    // Default Standard Mode configuration
    this.config = {
      mode: 'standard',
      agents: [
        {
          name: 'collector',
          enabled: true,
          config: {
            maxSources: 5,
            depth: 'comprehensive',
            timeout: 600, // 10 minutes
            prioritize: 'quality',
            extractPatterns: true,
            analyzeAudience: true
          }
        },
        {
          name: 'scholar',
          enabled: true,
          config: {
            maxDepth: 5, // Full 5-level depth analysis
            analogies: 5,
            teachingNotes: true,
            generateQuestions: true,
            identifyGaps: true,
            timeout: 900 // 15 minutes
          }
        },
        {
          name: 'creator',
          enabled: true,
          config: {
            iterations: 3, // Three refinement passes
            voiceAnalysis: 'comprehensive',
            hookVariations: 3,
            targetLength: 800, // Full-length content
            sparkFramework: 'full',
            timeout: 1200 // 20 minutes
          }
        },
        {
          name: 'adapter',
          enabled: true,
          config: {
            platforms: ['linkedin', 'twitter', 'wechat', 'xiaohongshu'], // All platforms
            hashtags: 'optimized',
            visuals: 'suggested',
            postingStrategy: true,
            crossPlatformConsistency: true,
            timeout: 900 // 15 minutes
          }
        }
      ],
      options: {
        saveCheckpoints: true, // Save progress
        parallel: false,
        timeout: 3600000, // 60 minutes total
        qualityGates: true // Enable quality checks
      }
    };
  }

  /**
   * Execute Standard Mode workflow
   */
  async execute(options: StandardModeOptions): Promise<WorkflowResult> {
    this.startTime = new Date();
    
    console.log('\n🎯 Standard Mode Workflow Started');
    console.log('=' .repeat(60));
    console.log(`Topic: ${options.topic}`);
    console.log(`Target Duration: ${options.maxDuration || 60} minutes`);
    console.log(`Depth: ${options.depth || 'standard'}`);
    console.log(`Optimization: ${options.optimization || 'balanced'}`);
    console.log(`Platforms: ${options.platforms?.join(', ') || 'All supported'}`);
    console.log('=' .repeat(60));
    
    // Customize configuration based on options
    this.customizeConfig(options);
    
    // Start progress tracking
    this.emit('standardmode:start', { options, startTime: this.startTime });
    
    try {
      // Execute workflow with quality monitoring
      const result = await this.executeWithQualityMonitoring(options.topic);
      
      // Calculate total time
      const endTime = new Date();
      const duration = (endTime.getTime() - this.startTime.getTime()) / 1000 / 60; // minutes
      
      // Emit completion
      this.emit('standardmode:complete', {
        result,
        duration,
        withinTarget: duration <= (options.maxDuration || 60)
      });
      
      // Display comprehensive summary
      this.displayComprehensiveSummary(result, duration);
      
      return result;
      
    } catch (error) {
      this.emit('standardmode:error', { error });
      
      // Attempt recovery from checkpoint
      const recovered = await this.attemptCheckpointRecovery();
      if (recovered) {
        return recovered;
      }
      
      throw error;
    }
  }

  /**
   * Execute with quality monitoring
   */
  private async executeWithQualityMonitoring(topic: string): Promise<WorkflowResult> {
    // Setup quality monitoring
    this.orchestrator.on('quality:warning', (data) => {
      console.log(`\n⚠️  Quality Warning at ${data.agent}: Below threshold`);
      this.emit('quality:warning', data);
    });
    
    // Execute main workflow
    const result = await this.orchestrator.execute(topic, this.config);
    
    // Post-execution quality analysis
    if (result.success) {
      this.performQualityAnalysis(result);
    }
    
    return result;
  }

  /**
   * Customize configuration based on options
   */
  private customizeConfig(options: StandardModeOptions): void {
    // Depth customization
    if (options.depth) {
      const depthSettings = {
        standard: { collector: 5, scholar: 5, creator: 3 },
        comprehensive: { collector: 7, scholar: 5, creator: 4 },
        expert: { collector: 10, scholar: 5, creator: 5 }
      };
      
      const settings = depthSettings[options.depth];
      
      const collectorConfig = this.config.agents.find(a => a.name === 'collector');
      if (collectorConfig) {
        collectorConfig.config!.maxSources = settings.collector;
      }
      
      const creatorConfig = this.config.agents.find(a => a.name === 'creator');
      if (creatorConfig) {
        creatorConfig.config!.iterations = settings.creator;
      }
    }
    
    // Optimization preference
    if (options.optimization) {
      switch (options.optimization) {
        case 'quality':
          // Increase iterations and analysis depth
          this.config.agents.forEach(agent => {
            if (agent.config) {
              agent.config.timeout = (agent.config.timeout || 600) * 1.5;
            }
          });
          break;
          
        case 'speed':
          // Reduce iterations but maintain core quality
          const creatorConfig = this.config.agents.find(a => a.name === 'creator');
          if (creatorConfig) {
            creatorConfig.config!.iterations = 2;
          }
          break;
          
        case 'balanced':
        default:
          // Use default settings
          break;
      }
    }
    
    // Platform customization
    if (options.platforms && options.platforms.length > 0) {
      const adapterConfig = this.config.agents.find(a => a.name === 'adapter');
      if (adapterConfig) {
        adapterConfig.config!.platforms = options.platforms;
      }
    }
    
    // Voice profile
    if (options.voiceProfile) {
      const creatorConfig = this.config.agents.find(a => a.name === 'creator');
      if (creatorConfig) {
        creatorConfig.config!.voiceProfile = options.voiceProfile;
      }
    }
    
    // Max duration
    if (options.maxDuration) {
      this.config.options!.timeout = options.maxDuration * 60 * 1000;
    }
  }

  /**
   * Setup event listeners for detailed progress tracking
   */
  private setupEventListeners(): void {
    // Agent progress
    this.orchestrator.on('agent:start', (data) => {
      const elapsed = this.getElapsedTime();
      const progress = this.orchestrator.getState().progress;
      console.log(`\n📍 [${elapsed}] ${data.agent.toUpperCase()} Agent`);
      console.log(`   Progress: ${progress}%`);
      this.emit('progress', { 
        agent: data.agent, 
        status: 'start', 
        elapsed,
        progress 
      });
    });
    
    this.orchestrator.on('agent:complete', (data) => {
      const elapsed = this.getElapsedTime();
      const duration = (data.duration / 1000).toFixed(1);
      console.log(`   ✅ Completed in ${duration}s`);
      
      // Show agent-specific metrics
      this.displayAgentMetrics(data.agent, data.output);
      
      this.emit('progress', { 
        agent: data.agent, 
        status: 'complete', 
        elapsed,
        duration: data.duration 
      });
    });
    
    // Checkpoint saves
    this.orchestrator.on('checkpoint:saved', (data) => {
      console.log(`   💾 Checkpoint saved: ${data.name}`);
    });
    
    // Error handling
    this.orchestrator.on('agent:error', (data) => {
      const elapsed = this.getElapsedTime();
      console.log(`\n❌ [${elapsed}] Error in ${data.agent}: ${data.error.message}`);
      this.emit('progress', { 
        agent: data.agent, 
        status: 'error', 
        elapsed,
        error: data.error 
      });
    });
    
    // Recovery attempts
    this.orchestrator.on('recovery:attempt', (data) => {
      console.log(`\n🔄 Attempting recovery for ${data.agent}...`);
    });
    
    this.orchestrator.on('recovery:success', (data) => {
      console.log(`   ✅ Recovery successful for ${data.agent}`);
    });
  }

  /**
   * Display agent-specific metrics
   */
  private displayAgentMetrics(agent: string, output: any): void {
    switch (agent) {
      case 'collector':
        console.log(`   📊 RICE Score: ${output.riceScore?.total || 'N/A'}`);
        console.log(`   📡 Signals: ${output.signals?.keyInsights?.length || 0}`);
        break;
        
      case 'scholar':
        console.log(`   📚 Depth: Level ${output.depthAnalysis?.currentDepth || 0}`);
        console.log(`   🎯 Confidence: ${Math.round((output.confidence || 0) * 100)}%`);
        break;
        
      case 'creator':
        console.log(`   📈 Engagement: ${output.engagementScore || 0}%`);
        console.log(`   📝 Length: ${output.content?.split(' ').length || 0} words`);
        break;
        
      case 'adapter':
        if (Array.isArray(output)) {
          console.log(`   🎯 Platforms: ${output.length} optimized`);
        } else {
          console.log(`   🎯 Platform Fit: ${output.metadata?.platformFitScore || 0}%`);
        }
        break;
    }
  }

  /**
   * Perform post-execution quality analysis
   */
  private performQualityAnalysis(result: WorkflowResult): void {
    console.log('\n📊 Quality Analysis:');
    
    const state = result.state;
    
    // Overall quality score
    let totalQuality = 0;
    let qualityCount = 0;
    
    state.metrics.qualityScores.forEach((score) => {
      totalQuality += score;
      qualityCount++;
    });
    
    if (qualityCount > 0) {
      const avgQuality = totalQuality / qualityCount;
      console.log(`   Overall Quality: ${avgQuality.toFixed(1)}%`);
      
      // Quality breakdown
      console.log('   Agent Scores:');
      state.metrics.qualityScores.forEach((score, agent) => {
        const indicator = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
        console.log(`     ${indicator} ${agent}: ${score}%`);
      });
    }
    
    // Error analysis
    if (state.errors.length > 0) {
      console.log(`   ⚠️  Errors encountered: ${state.errors.length}`);
    }
    
    // Efficiency rating
    const targetTime = 60; // minutes
    const actualTime = (state.metrics.totalDuration || 0) / 1000 / 60;
    const efficiency = Math.min(100, (targetTime / actualTime) * 100);
    console.log(`   ⏱️  Efficiency: ${efficiency.toFixed(1)}%`);
  }

  /**
   * Attempt recovery from checkpoint
   */
  private async attemptCheckpointRecovery(): Promise<WorkflowResult | null> {
    console.log('\n🔄 Attempting checkpoint recovery...');
    
    // Try to load most recent checkpoint
    const checkpoints = ['after_creator', 'after_scholar', 'after_collector'];
    
    for (const checkpoint of checkpoints) {
      const state = this.orchestrator.loadCheckpoint(checkpoint);
      if (state) {
        console.log(`   ✅ Recovered from checkpoint: ${checkpoint}`);
        
        // Return partial result
        return {
          success: false,
          state,
          error: new Error('Partial completion from checkpoint')
        };
      }
    }
    
    console.log('   ❌ No checkpoints available for recovery');
    return null;
  }

  /**
   * Get elapsed time in format MM:SS
   */
  private getElapsedTime(): string {
    if (!this.startTime) return '00:00';
    
    const elapsed = Date.now() - this.startTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Display comprehensive summary
   */
  private displayComprehensiveSummary(result: WorkflowResult, duration: number): void {
    console.log('\n' + '='.repeat(70));
    console.log('🎯 Standard Mode Workflow Complete!');
    console.log('=' .repeat(70));
    
    if (result.success) {
      console.log('\n📊 Performance Summary:');
      console.log(`  ⏱️  Total Duration: ${duration.toFixed(1)} minutes`);
      console.log(`  ✅ Status: ${duration <= 60 ? 'Within Target' : 'Exceeded Target'}`);
      console.log(`  📈 Pipeline Efficiency: ${((result.state.progress / duration) * 10).toFixed(1)}%`);
      
      // Detailed agent breakdown
      console.log('\n⏱️  Agent Performance:');
      const agentData: any[] = [];
      result.state.metrics.agentDurations.forEach((time, agent) => {
        const quality = result.state.metrics.qualityScores.get(agent) || 0;
        agentData.push({
          agent: agent.charAt(0).toUpperCase() + agent.slice(1),
          time: `${(time / 1000).toFixed(1)}s`,
          quality: `${quality}%`
        });
      });
      
      console.table(agentData);
      
      // Content statistics
      if (result.finalContent) {
        console.log('\n📝 Content Generated:');
        
        if (Array.isArray(result.finalContent)) {
          console.log(`  Platforms: ${result.finalContent.length} versions created`);
          
          result.finalContent.forEach(content => {
            console.log(`\n  ${content.platform}:`);
            console.log(`    • Title: ${content.optimizedTitle.substring(0, 50)}...`);
            console.log(`    • Length: ${content.characterCount} chars`);
            console.log(`    • Hashtags: ${content.hashtags.length}`);
            console.log(`    • Fit Score: ${content.metadata.platformFitScore}%`);
            console.log(`    • Est. Reach: ${content.metadata.estimatedReach}`);
          });
        } else {
          const content = result.finalContent;
          console.log(`  Platform: ${content.platform}`);
          console.log(`  Title: ${content.optimizedTitle}`);
          console.log(`  Length: ${content.characterCount} characters`);
          console.log(`  Engagement Score: ${content.metadata.platformFitScore}%`);
        }
      }
      
      // Recommendations
      console.log('\n💡 Recommendations:');
      console.log('  • Review generated content for brand voice alignment');
      console.log('  • Add platform-specific visuals before publishing');
      console.log('  • Schedule posts according to suggested timing');
      console.log('  • Monitor engagement metrics after publishing');
      
      console.log('\n✨ High-quality content ready for multi-platform publishing!');
      
    } else {
      console.log('\n❌ Workflow failed or partially completed:');
      console.log(`  Error: ${result.error?.message}`);
      console.log(`  Last successful agent: ${result.state.currentAgent}`);
      
      // Check for partial results
      if (result.state.documents.size > 0) {
        console.log('\n📦 Partial results available:');
        result.state.documents.forEach((doc, agent) => {
          console.log(`  • ${agent}: Document generated`);
        });
      }
    }
    
    console.log('=' .repeat(70));
  }

  /**
   * Get detailed metrics
   */
  getDetailedMetrics(): any {
    const state = this.orchestrator.getState();
    const metrics = this.orchestrator.getMetrics();
    
    return {
      progress: state.progress,
      status: state.status,
      currentAgent: state.currentAgent,
      duration: metrics.totalDuration,
      agentMetrics: Object.fromEntries(metrics.agentDurations),
      qualityScores: Object.fromEntries(metrics.qualityScores),
      errorCount: metrics.errorCount
    };
  }

  /**
   * Pause workflow
   */
  pause(): void {
    this.orchestrator.pause();
    console.log('\n⏸️  Workflow paused - checkpoints saved');
  }

  /**
   * Resume workflow
   */
  resume(): void {
    this.orchestrator.resume();
    console.log('\n▶️  Workflow resumed from checkpoint');
  }

  /**
   * Cancel workflow
   */
  cancel(): void {
    this.orchestrator.cancel();
    console.log('\n🛑 Workflow cancelled - partial results saved');
  }
}

// Standard Mode presets for different content types
export const StandardModePresets = {
  thoughtLeadership: {
    topic: '',
    platforms: ['linkedin', 'twitter'],
    voiceProfile: 'professional' as const,
    depth: 'comprehensive' as const,
    optimization: 'quality' as const,
    maxDuration: 60
  },
  
  technicalArticle: {
    topic: '',
    platforms: ['linkedin', 'wechat'],
    voiceProfile: 'technical' as const,
    depth: 'expert' as const,
    optimization: 'quality' as const,
    maxDuration: 60
  },
  
  viralCampaign: {
    topic: '',
    platforms: ['twitter', 'xiaohongshu', 'linkedin'],
    voiceProfile: 'casual' as const,
    depth: 'standard' as const,
    optimization: 'balanced' as const,
    maxDuration: 50
  },
  
  educationalContent: {
    topic: '',
    platforms: ['linkedin', 'wechat', 'twitter'],
    voiceProfile: 'academic' as const,
    depth: 'comprehensive' as const,
    optimization: 'quality' as const,
    maxDuration: 60
  }
};

export default StandardModeWorkflow;