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

export class MessageBus {
  private messages: Map<string, Message> = new Map();
  private subscribers: Map<string, Function[]> = new Map();

  async send(from: string, to: string, data: any): Promise<Message> {
    const message: Message = {
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
      } catch (error) {
        console.error('Message delivery failed:', error);
        message.delivered = false;
      }
    });

    return message;
  }

  subscribe(agentId: string, callback: Function): void {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, []);
    }
    this.subscribers.get(agentId)!.push(callback);
  }

  unsubscribe(agentId: string): void {
    this.subscribers.delete(agentId);
  }
}