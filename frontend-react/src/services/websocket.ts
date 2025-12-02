import { WS_ENDPOINTS } from '../config/api';

export interface LiveMessage {
  type: 'subtitle' | 'status' | 'error';
  segment_id?: number;
  segment_order?: number;
  malay_text?: string;
  english_text?: string;
  confidence?: number;
  message?: string;
}

export type LiveMessageHandler = (message: LiveMessage) => void;
export type ConnectionHandler = () => void;
export type ErrorHandler = (error: Event) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Set<LiveMessageHandler> = new Set();
  private connectHandlers: Set<ConnectionHandler> = new Set();
  private disconnectHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private sermonId: number | null = null;

  connect(sermonId: number): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.sermonId = sermonId;
    this.socket = new WebSocket(WS_ENDPOINTS.LIVE_STREAM(sermonId));

    this.socket.onopen = () => {
      console.log('[WebSocket] Connected to live stream');
      this.reconnectAttempts = 0;
      this.connectHandlers.forEach(handler => handler());
    };

    this.socket.onmessage = (event) => {
      try {
        const message: LiveMessage = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(message));
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('[WebSocket] Disconnected');
      this.disconnectHandlers.forEach(handler => handler());
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      this.errorHandlers.forEach(handler => handler(error));
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.sermonId) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        if (this.sermonId) {
          this.connect(this.sermonId);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.sermonId = null;
    this.reconnectAttempts = 0;
  }

  send(message: object): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }

  onMessage(handler: LiveMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const liveStreamService = new WebSocketService();
