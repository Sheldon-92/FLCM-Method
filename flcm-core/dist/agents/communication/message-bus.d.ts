/**
 * Agent Message Bus
 * Handles inter-agent communication and coordination
 */
/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Message types for inter-agent communication
 */
export declare enum MessageType {
    REQUEST = "request",
    RESPONSE = "response",
    BROADCAST = "broadcast",
    STATUS = "status",
    ERROR = "error"
}
/**
 * Agent message structure
 */
export interface AgentMessage {
    id: string;
    type: MessageType;
    from: string;
    to: string | '*';
    timestamp: Date;
    payload: any;
    correlationId?: string;
    priority?: 'low' | 'normal' | 'high';
}
/**
 * Message handler function
 */
export type MessageHandler = (message: AgentMessage) => void | Promise<void>;
/**
 * Message Bus for agent communication
 */
export declare class MessageBus extends EventEmitter {
    private handlers;
    private messageQueue;
    private processing;
    private messageHistory;
    private maxHistorySize;
    /**
     * Send a message
     */
    send(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<void>;
    /**
     * Send request and wait for response
     */
    request(from: string, to: string, payload: any, timeout?: number): Promise<any>;
    /**
     * Respond to a request
     */
    respond(originalMessage: AgentMessage, payload: any, error?: string): Promise<void>;
    /**
     * Broadcast message to all agents
     */
    broadcast(from: string, payload: any): Promise<void>;
    /**
     * Subscribe to messages for an agent
     */
    subscribe(agentId: string, handler: MessageHandler): void;
    /**
     * Unsubscribe from messages
     */
    unsubscribe(agentId: string, handler?: MessageHandler): void;
    /**
     * Enqueue message with priority
     */
    private enqueueMessage;
    /**
     * Process message queue
     */
    private processQueue;
    /**
     * Deliver message to recipients
     */
    private deliverMessage;
    /**
     * Add message to history
     */
    private addToHistory;
    /**
     * Get message history
     */
    getHistory(filter?: {
        from?: string;
        to?: string;
        type?: MessageType;
        since?: Date;
    }): AgentMessage[];
    /**
     * Get queue status
     */
    getQueueStatus(): {
        size: number;
        processing: boolean;
        byPriority: Record<string, number>;
    };
    /**
     * Clear queue
     */
    clearQueue(): void;
    /**
     * Generate unique message ID
     */
    private generateMessageId;
}
export declare const messageBus: MessageBus;
