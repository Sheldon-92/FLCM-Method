"use strict";
/**
 * Message Bus for Agent Communication
 * Handles inter-agent communication and message routing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBus = void 0;
class MessageBus {
    constructor() {
        this.messages = new Map();
        this.subscribers = new Map();
    }
    async send(from, to, data) {
        const message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            from,
            to,
            type: data.type || 'default',
            data,
            timestamp: Date.now(),
            delivered: true,
        };
        this.messages.set(message.id, message);
        // Notify subscribers
        const subscribers = this.subscribers.get(to) || [];
        subscribers.forEach(callback => {
            try {
                callback(message);
            }
            catch (error) {
                console.error('Message delivery failed:', error);
                message.delivered = false;
            }
        });
        return message;
    }
    subscribe(agentId, callback) {
        if (!this.subscribers.has(agentId)) {
            this.subscribers.set(agentId, []);
        }
        this.subscribers.get(agentId).push(callback);
    }
    unsubscribe(agentId) {
        this.subscribers.delete(agentId);
    }
}
exports.MessageBus = MessageBus;
//# sourceMappingURL=message-bus.js.map