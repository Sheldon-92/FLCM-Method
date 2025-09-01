/**
 * Message Bus for Agent Communication
 * Handles inter-agent communication and message routing
 */
export interface Message {
    id: string;
    from: string;
    to: string;
    type: string;
    data: any;
    timestamp: number;
    delivered?: boolean;
}
export declare class MessageBus {
    private messages;
    private subscribers;
    send(from: string, to: string, data: any): Promise<Message>;
    subscribe(agentId: string, callback: Function): void;
    unsubscribe(agentId: string): void;
}
