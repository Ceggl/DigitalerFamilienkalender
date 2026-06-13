// Client-side real-time event listener
// Uses EventSource (SSE) to listen for server updates

export type RealtimeCallback = (event: {
  type: string;
  data: Record<string, unknown>;
}) => void;

export class RealtimeClient {
  private eventSource: EventSource | null = null;
  private listeners: Set<RealtimeCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(onError?: (error: Error) => void) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource('/api/realtime/events');

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notify(data);
        this.reconnectAttempts = 0; // Reset on successful message
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
        console.log(`Reconnecting in ${delay}ms...`);
        setTimeout(() => this.connect(onError), delay);
      } else {
        onError?.(new Error('Failed to connect to real-time events'));
        this.disconnect();
      }
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  subscribe(callback: RealtimeCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(event: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in realtime listener:', error);
      }
    });
  }
}

// Global singleton
let client: RealtimeClient | null = null;

export function getRealtimeClient(): RealtimeClient {
  if (!client) {
    client = new RealtimeClient();
  }
  return client;
}
