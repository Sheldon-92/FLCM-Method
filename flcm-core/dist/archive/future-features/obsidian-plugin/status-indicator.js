"use strict";
/**
 * Sync Status Indicator
 * Shows sync status in Obsidian status bar
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncStatusIndicator = void 0;
class SyncStatusIndicator {
    constructor(statusBarItem) {
        this.currentStatus = 'idle';
        this.lastSyncTime = null;
        this.syncCount = 0;
        this.isVisible = true;
        this.statusBarItem = statusBarItem;
        this.setupStatusBar();
        this.updateDisplay();
    }
    /**
     * Setup status bar styling and interactions
     */
    setupStatusBar() {
        this.statusBarItem.addClass('flcm-status-bar');
        this.statusBarItem.style.cursor = 'pointer';
        // Add click handler for detailed status
        this.statusBarItem.addEventListener('click', () => {
            this.showDetailedStatus();
        });
        // Add styles
        this.addStyles();
    }
    /**
     * Add CSS styles for status indicator
     */
    addStyles() {
        const styleId = 'flcm-status-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
        .flcm-status-bar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.8em;
          transition: all 0.2s ease;
        }
        
        .flcm-status-bar:hover {
          background-color: var(--background-modifier-hover);
        }
        
        .flcm-status-idle {
          color: var(--text-muted);
        }
        
        .flcm-status-syncing {
          color: var(--text-accent);
          animation: flcm-pulse 1.5s ease-in-out infinite;
        }
        
        .flcm-status-completed {
          color: var(--text-success);
        }
        
        .flcm-status-error {
          color: var(--text-error);
        }
        
        .flcm-status-conflict {
          color: var(--text-warning);
        }
        
        @keyframes flcm-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .flcm-status-icon {
          font-size: 1.1em;
          line-height: 1;
        }
        
        .flcm-status-text {
          font-weight: 500;
        }
        
        .flcm-status-detail {
          font-size: 0.75em;
          opacity: 0.7;
        }
      `;
            document.head.appendChild(style);
        }
    }
    /**
     * Update status
     */
    updateStatus(status, details, count) {
        this.currentStatus = status;
        if (status === 'completed') {
            this.lastSyncTime = new Date();
            if (count !== undefined) {
                this.syncCount = count;
            }
        }
        this.updateDisplay(details);
        // Auto-hide success status after a few seconds
        if (status === 'completed') {
            setTimeout(() => {
                if (this.currentStatus === 'completed') {
                    this.updateStatus('idle');
                }
            }, 3000);
        }
    }
    /**
     * Update visual display
     */
    updateDisplay(details) {
        if (!this.isVisible) {
            this.statusBarItem.style.display = 'none';
            return;
        }
        this.statusBarItem.empty();
        // Remove old status classes
        this.statusBarItem.removeClass('flcm-status-idle', 'flcm-status-syncing', 'flcm-status-completed', 'flcm-status-error', 'flcm-status-conflict');
        // Add current status class
        this.statusBarItem.addClass(`flcm-status-${this.currentStatus}`);
        // Create icon
        const icon = this.statusBarItem.createSpan({ cls: 'flcm-status-icon' });
        icon.textContent = this.getStatusIcon();
        // Create text
        const text = this.statusBarItem.createSpan({ cls: 'flcm-status-text' });
        text.textContent = this.getStatusText();
        // Add details if provided
        if (details) {
            this.statusBarItem.title = `FLCM: ${this.getStatusText()} - ${details}`;
        }
        else {
            this.statusBarItem.title = this.getTooltipText();
        }
    }
    /**
     * Get status icon
     */
    getStatusIcon() {
        switch (this.currentStatus) {
            case 'idle':
                return '💫';
            case 'syncing':
                return '🔄';
            case 'completed':
                return '✅';
            case 'error':
                return '❌';
            case 'conflict':
                return '⚠️';
            default:
                return '💫';
        }
    }
    /**
     * Get status text
     */
    getStatusText() {
        switch (this.currentStatus) {
            case 'idle':
                return 'FLCM';
            case 'syncing':
                return 'Syncing';
            case 'completed':
                return 'Synced';
            case 'error':
                return 'Error';
            case 'conflict':
                return 'Conflict';
            default:
                return 'FLCM';
        }
    }
    /**
     * Get tooltip text
     */
    getTooltipText() {
        let tooltip = `FLCM Framework - Status: ${this.getStatusText()}`;
        if (this.lastSyncTime) {
            const timeStr = this.lastSyncTime.toLocaleTimeString();
            tooltip += `\nLast sync: ${timeStr}`;
        }
        if (this.syncCount > 0) {
            tooltip += `\nFiles synced: ${this.syncCount}`;
        }
        tooltip += '\n\nClick for details';
        return tooltip;
    }
    /**
     * Show detailed status information
     */
    showDetailedStatus() {
        // This would show a modal or notice with detailed sync information
        // For now, we'll create a simple notice
        let message = `FLCM Status: ${this.getStatusText()}`;
        if (this.lastSyncTime) {
            const elapsed = Math.round((Date.now() - this.lastSyncTime.getTime()) / 1000);
            message += `\nLast sync: ${this.formatElapsed(elapsed)} ago`;
        }
        if (this.syncCount > 0) {
            message += `\nLast sync count: ${this.syncCount} files`;
        }
        // Create a temporary notice element for detailed info
        const notice = document.createElement('div');
        notice.style.cssText = `
      position: fixed;
      top: 50px;
      right: 20px;
      background: var(--background-primary);
      border: 1px solid var(--background-modifier-border);
      border-radius: 6px;
      padding: 12px 16px;
      box-shadow: var(--shadow-s);
      z-index: 1000;
      white-space: pre-line;
      font-size: 0.9em;
      max-width: 250px;
    `;
        notice.textContent = message;
        document.body.appendChild(notice);
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notice.parentNode) {
                notice.parentNode.removeChild(notice);
            }
        }, 3000);
    }
    /**
     * Format elapsed time
     */
    formatElapsed(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        }
        else if (seconds < 3600) {
            return `${Math.round(seconds / 60)}m`;
        }
        else if (seconds < 86400) {
            return `${Math.round(seconds / 3600)}h`;
        }
        else {
            return `${Math.round(seconds / 86400)}d`;
        }
    }
    /**
     * Show sync progress
     */
    showProgress(current, total) {
        const progressText = `${current}/${total}`;
        this.updateStatus('syncing', progressText);
        // Update text to show progress
        const textEl = this.statusBarItem.querySelector('.flcm-status-text');
        if (textEl) {
            textEl.textContent = `Syncing (${progressText})`;
        }
    }
    /**
     * Hide status indicator
     */
    hide() {
        this.isVisible = false;
        this.updateDisplay();
    }
    /**
     * Show status indicator
     */
    show() {
        this.isVisible = true;
        this.updateDisplay();
    }
    /**
     * Set sync statistics
     */
    setSyncStats(stats) {
        this.syncCount = stats.successful + stats.failed + stats.conflicts;
        if (stats.failed > 0 || stats.conflicts > 0) {
            let status = 'completed';
            let details = `${stats.successful} synced`;
            if (stats.failed > 0) {
                status = 'error';
                details += `, ${stats.failed} failed`;
            }
            if (stats.conflicts > 0) {
                status = 'conflict';
                details += `, ${stats.conflicts} conflicts`;
            }
            this.updateStatus(status, details);
        }
        else {
            this.updateStatus('completed', `${stats.successful} files synced`);
        }
    }
    /**
     * Pulse animation for attention
     */
    pulse() {
        this.statusBarItem.style.animation = 'flcm-pulse 0.5s ease-in-out 3';
        setTimeout(() => {
            this.statusBarItem.style.animation = '';
        }, 1500);
    }
    /**
     * Get current status
     */
    getStatus() {
        return this.currentStatus;
    }
    /**
     * Reset to idle state
     */
    reset() {
        this.currentStatus = 'idle';
        this.updateDisplay();
    }
}
exports.SyncStatusIndicator = SyncStatusIndicator;
//# sourceMappingURL=status-indicator.js.map