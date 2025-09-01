"use strict";
/**
 * Agent Message Bus
 * Handles inter-agent communication and coordination
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageBus = exports.MessageBus = exports.MessageType = void 0;
const events_1 = require("events");
const logger_1 = require("../../shared/utils/logger");
const logger = (0, logger_1.createLogger)('MessageBus');
/**
 * Message types for inter-agent communication
 */
var MessageType;
(function (MessageType) {
    MessageType["REQUEST"] = "request";
    MessageType["RESPONSE"] = "response";
    MessageType["BROADCAST"] = "broadcast";
    MessageType["STATUS"] = "status";
    MessageType["ERROR"] = "error";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
/**
 * Message Bus for agent communication
 */
class MessageBus extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.handlers = new Map();
        this.messageQueue = [];
        this.processing = false;
        this.messageHistory = [];
        this.maxHistorySize = 1000;
    }
    /**
     * Send a message
     */
    async send(message) {
        const fullMessage = {
            ...message,
            id: this.generateMessageId(),
            timestamp: new Date(),
        };
        logger.debug(`Sending message from ${fullMessage.from} to ${fullMessage.to}`);
        // Add to queue
        this.enqueueMessage(fullMessage);
        // Process queue
        await this.processQueue();
    }
    /**
     * Send request and wait for response
     */
    async request(from, to, payload, timeout = 30000) {
        const correlationId = this.generateMessageId();
        return new Promise((resolve, reject) => {
            // Set up timeout
            const timer = setTimeout(() => {
                this.off(`response:${correlationId}`, responseHandler);
                reject(new Error(`Request timeout: ${from} -> ${to}`));
            }, timeout);
            // Set up response handler
            const responseHandler = (response) => {
                clearTimeout(timer);
                if (response.type === MessageType.ERROR) {
                    reject(new Error(response.payload.error));
                }
                else {
                    resolve(response.payload);
                }
            };
            this.once(`response:${correlationId}`, responseHandler);
            // Send request
            this.send({
                type: MessageType.REQUEST,
                from,
                to,
                payload,
                correlationId,
                priority: 'normal',
            });
        });
    }
    /**
     * Respond to a request
     */
    async respond(originalMessage, payload, error) {
        await this.send({
            type: error ? MessageType.ERROR : MessageType.RESPONSE,
            from: originalMessage.to,
            to: originalMessage.from,
            payload: error ? { error } : payload,
            correlationId: originalMessage.correlationId,
            priority: originalMessage.priority,
        });
        if (originalMessage.correlationId) {
            this.emit(`response:${originalMessage.correlationId}`, {
                type: error ? MessageType.ERROR : MessageType.RESPONSE,
                payload: error ? { error } : payload,
            });
        }
    }
    /**
     * Broadcast message to all agents
     */
    async broadcast(from, payload) {
        await this.send({
            type: MessageType.BROADCAST,
            from,
            to: '*',
            payload,
            priority: 'low',
        });
    }
    /**
     * Subscribe to messages for an agent
     */
    subscribe(agentId, handler) {
        if (!this.handlers.has(agentId)) {
            this.handlers.set(agentId, new Set());
        }
        this.handlers.get(agentId).add(handler);
        logger.debug(`Agent ${agentId} subscribed to message bus`);
    }
    /**
     * Unsubscribe from messages
     */
    unsubscribe(agentId, handler) {
        if (handler) {
            this.handlers.get(agentId)?.delete(handler);
        }
        else {
            this.handlers.delete(agentId);
        }
        logger.debug(`Agent ${agentId} unsubscribed from message bus`);
    }
    /**
     * Enqueue message with priority
     */
    enqueueMessage(message) {
        const priority = message.priority || 'normal';
        if (priority === 'high') {
            // Add to front of queue
            this.messageQueue.unshift(message);
        }
        else if (priority === 'low') {
            // Add to end of queue
            this.messageQueue.push(message);
        }
        else {
            // Add after high priority messages
            const highPriorityCount = this.messageQueue.filter(m => m.priority === 'high').length;
            this.messageQueue.splice(highPriorityCount, 0, message);
        }
    }
    /**
     * Process message queue
     */
    async processQueue() {
        if (this.processing || this.messageQueue.length === 0) {
            return;
        }
        this.processing = true;
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            try {
                await this.deliverMessage(message);
                this.addToHistory(message);
            }
            catch (error) {
                logger.error(`Failed to deliver message ${message.id}:`, error);
                // Send error response if it was a request
                if (message.type === MessageType.REQUEST && message.correlationId) {
                    await this.respond(message, null, `Delivery failed: ${error}`);
                }
            }
        }
        this.processing = false;
    }
    /**
     * Deliver message to recipients
     */
    async deliverMessage(message) {
        const recipients = message.to === '*'
            ? Array.from(this.handlers.keys())
            : [message.to];
        for (const recipient of recipients) {
            const handlers = this.handlers.get(recipient);
            if (handlers && handlers.size > 0) {
                for (const handler of handlers) {
                    try {
                        await handler(message);
                    }
                    catch (error) {
                        logger.error(`Handler error for ${recipient}:`, error);
                    }
                }
            }
            else if (message.to !== '*') {
                logger.warn(`No handlers for recipient: ${recipient}`);
            }
        }
        // Emit event for monitoring
        this.emit('message-delivered', message);
    }
    /**
     * Add message to history
     */
    addToHistory(message) {
        this.messageHistory.push(message);
        // Trim history if too large
        if (this.messageHistory.length > this.maxHistorySize) {
            this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
        }
    }
    /**
     * Get message history
     */
    getHistory(filter) {
        let history = [...this.messageHistory];
        if (filter) {
            if (filter.from) {
                history = history.filter(m => m.from === filter.from);
            }
            if (filter.to) {
                history = history.filter(m => m.to === filter.to);
            }
            if (filter.type) {
                history = history.filter(m => m.type === filter.type);
            }
            if (filter.since) {
                history = history.filter(m => m.timestamp >= filter.since);
            }
        }
        return history;
    }
    /**
     * Get queue status
     */
    getQueueStatus() {
        const byPriority = {
            high: 0,
            normal: 0,
            low: 0,
        };
        for (const message of this.messageQueue) {
            const priority = message.priority || 'normal';
            byPriority[priority]++;
        }
        return {
            size: this.messageQueue.length,
            processing: this.processing,
            byPriority,
        };
    }
    /**
     * Clear queue
     */
    clearQueue() {
        this.messageQueue = [];
        logger.info('Message queue cleared');
    }
    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
}
exports.MessageBus = MessageBus;
// Export singleton instance
exports.messageBus = new MessageBus();
//# sourceMappingURL=message-bus.js.map