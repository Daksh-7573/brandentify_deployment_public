/**
 * Message Queue Service
 * Handles asynchronous task processing and inter-service communication
 */

import EventEmitter from 'events';
import { cacheService } from './cache-service';

interface QueueMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  priority: number;
}

interface QueueConfig {
  maxConcurrency: number;
  retryDelay: number;
  maxRetries: number;
  deadLetterQueue: boolean;
}

interface TaskHandler {
  (payload: any): Promise<void>;
}

export class MessageQueue extends EventEmitter {
  private static instance: MessageQueue;
  private queues: Map<string, QueueMessage[]> = new Map();
  private handlers: Map<string, TaskHandler> = new Map();
  private processing: Map<string, boolean> = new Map();
  private workers: Map<string, number> = new Map();
  private config: QueueConfig;

  static getInstance(): MessageQueue {
    if (!MessageQueue.instance) {
      MessageQueue.instance = new MessageQueue();
    }
    return MessageQueue.instance;
  }

  constructor() {
    super();
    this.config = {
      maxConcurrency: parseInt(process.env.QUEUE_MAX_CONCURRENCY || '5'),
      retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY || '5000'),
      maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3'),
      deadLetterQueue: process.env.QUEUE_DEAD_LETTER === 'true'
    };
    this.startWorkers();
  }

  /**
   * Register a task handler for a specific message type
   */
  registerHandler(messageType: string, handler: TaskHandler): void {
    this.handlers.set(messageType, handler);
    if (!this.queues.has(messageType)) {
      this.queues.set(messageType, []);
      this.processing.set(messageType, false);
      this.workers.set(messageType, 0);
    }
    console.log(`[Message Queue] Registered handler for ${messageType}`);
  }

  /**
   * Add a message to the queue
   */
  async enqueue(messageType: string, payload: any, options: {
    priority?: number;
    delay?: number;
    maxAttempts?: number;
  } = {}): Promise<string> {
    const messageId = this.generateMessageId();
    const message: QueueMessage = {
      id: messageId,
      type: messageType,
      payload,
      timestamp: Date.now() + (options.delay || 0),
      attempts: 0,
      maxAttempts: options.maxAttempts || this.config.maxRetries,
      delay: options.delay,
      priority: options.priority || 0
    };

    const queue = this.queues.get(messageType);
    if (!queue) {
      throw new Error(`No queue registered for message type: ${messageType}`);
    }

    // Insert message in priority order
    this.insertByPriority(queue, message);
    
    // Persist to cache for durability
    await this.persistMessage(message);
    
    // Trigger processing
    this.processQueue(messageType);
    
    console.log(`[Message Queue] Enqueued ${messageType} message ${messageId}`);
    return messageId;
  }

  /**
   * Process messages in a specific queue
   */
  private async processQueue(messageType: string): Promise<void> {
    if (this.processing.get(messageType)) {
      return; // Already processing
    }

    const queue = this.queues.get(messageType);
    const handler = this.handlers.get(messageType);
    
    if (!queue || !handler || queue.length === 0) {
      return;
    }

    const activeWorkers = this.workers.get(messageType) || 0;
    if (activeWorkers >= this.config.maxConcurrency) {
      return; // Max concurrency reached
    }

    this.processing.set(messageType, true);
    this.workers.set(messageType, activeWorkers + 1);

    try {
      const message = queue.shift();
      if (!message) {
        this.processing.set(messageType, false);
        this.workers.set(messageType, activeWorkers);
        return;
      }

      // Check if message should be delayed
      if (message.timestamp > Date.now()) {
        // Put message back and wait
        this.insertByPriority(queue, message);
        setTimeout(() => this.processQueue(messageType), message.timestamp - Date.now());
        this.processing.set(messageType, false);
        this.workers.set(messageType, activeWorkers);
        return;
      }

      await this.processMessage(message, handler);
    } catch (error) {
      console.error(`[Message Queue] Error processing queue ${messageType}:`, error);
    } finally {
      this.processing.set(messageType, false);
      this.workers.set(messageType, Math.max(0, activeWorkers));
      
      // Continue processing if there are more messages
      if (queue && queue.length > 0) {
        setImmediate(() => this.processQueue(messageType));
      }
    }
  }

  /**
   * Process a single message
   */
  private async processMessage(message: QueueMessage, handler: TaskHandler): Promise<void> {
    message.attempts++;
    
    try {
      await handler(message.payload);
      
      // Remove from persistence on success
      await this.removePersistedMessage(message.id);
      
      this.emit('messageProcessed', {
        messageId: message.id,
        type: message.type,
        attempts: message.attempts
      });
      
      console.log(`[Message Queue] Successfully processed ${message.type} message ${message.id}`);
    } catch (error) {
      console.error(`[Message Queue] Failed to process ${message.type} message ${message.id}:`, error);
      
      if (message.attempts < message.maxAttempts) {
        // Retry with exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, message.attempts - 1);
        message.timestamp = Date.now() + delay;
        
        const queue = this.queues.get(message.type);
        if (queue) {
          this.insertByPriority(queue, message);
          await this.persistMessage(message);
        }
        
        console.log(`[Message Queue] Retrying ${message.type} message ${message.id} in ${delay}ms (attempt ${message.attempts}/${message.maxAttempts})`);
      } else {
        // Move to dead letter queue
        if (this.config.deadLetterQueue) {
          await this.moveToDeadLetterQueue(message);
        }
        
        this.emit('messageFailed', {
          messageId: message.id,
          type: message.type,
          attempts: message.attempts,
          error: error instanceof Error ? error.message : String(error)
        });
        
        console.error(`[Message Queue] Message ${message.id} failed after ${message.attempts} attempts`);
      }
    }
  }

  /**
   * Insert message into queue by priority
   */
  private insertByPriority(queue: QueueMessage[], message: QueueMessage): void {
    let inserted = false;
    for (let i = 0; i < queue.length; i++) {
      if (message.priority > queue[i].priority) {
        queue.splice(i, 0, message);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      queue.push(message);
    }
  }

  /**
   * Start background workers
   */
  private startWorkers(): void {
    // Process all queues periodically
    setInterval(() => {
      for (const messageType of this.queues.keys()) {
        this.processQueue(messageType);
      }
    }, 1000);

    // Restore persisted messages on startup
    this.restorePersistedMessages();
  }

  /**
   * Persist message for durability
   */
  private async persistMessage(message: QueueMessage): Promise<void> {
    try {
      const key = `queue:${message.type}:${message.id}`;
      await cacheService.set(key, JSON.stringify(message), 86400); // 24 hours TTL
    } catch (error) {
      console.warn(`[Message Queue] Failed to persist message ${message.id}:`, error);
    }
  }

  /**
   * Remove persisted message
   */
  private async removePersistedMessage(messageId: string): Promise<void> {
    try {
      // We don't know the type here, so we'll let it expire naturally
      // In a real implementation, we'd store a mapping or use a pattern-based delete
    } catch (error) {
      console.warn(`[Message Queue] Failed to remove persisted message ${messageId}:`, error);
    }
  }

  /**
   * Restore persisted messages on startup
   */
  private async restorePersistedMessages(): Promise<void> {
    // In a real implementation, this would scan for persisted messages
    // and restore them to the appropriate queues
    console.log('[Message Queue] Message restoration would happen here in production');
  }

  /**
   * Move failed message to dead letter queue
   */
  private async moveToDeadLetterQueue(message: QueueMessage): Promise<void> {
    try {
      const dlqKey = `dlq:${message.type}:${message.id}`;
      await cacheService.set(dlqKey, JSON.stringify({
        ...message,
        failedAt: Date.now(),
        originalQueue: message.type
      }), 604800); // 7 days TTL
      
      console.log(`[Message Queue] Moved message ${message.id} to dead letter queue`);
    } catch (error) {
      console.error(`[Message Queue] Failed to move message to DLQ:`, error);
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [messageType, queue] of this.queues) {
      stats[messageType] = {
        pending: queue.length,
        processing: this.processing.get(messageType) || false,
        activeWorkers: this.workers.get(messageType) || 0
      };
    }
    
    return stats;
  }

  /**
   * Clear all queues (for testing/debugging)
   */
  async clearAll(): Promise<void> {
    for (const queue of this.queues.values()) {
      queue.length = 0;
    }
    console.log('[Message Queue] All queues cleared');
  }
}

// Common task types
export const TaskTypes = {
  EMAIL_NOTIFICATION: 'email_notification',
  AI_PROCESSING: 'ai_processing',
  FILE_PROCESSING: 'file_processing',
  USER_ACTIVITY_LOG: 'user_activity_log',
  CACHE_INVALIDATION: 'cache_invalidation',
  ANALYTICS_EVENT: 'analytics_event',
  WEBHOOK_DELIVERY: 'webhook_delivery'
} as const;

export const messageQueue = MessageQueue.getInstance();