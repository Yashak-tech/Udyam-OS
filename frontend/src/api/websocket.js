import { WS_BASE_URL } from './client';

export class UdyamWebSocket {
  constructor(sessionId, onEvent, onStatusChange) {
    this.sessionId = sessionId;
    this.onEvent = onEvent;
    this.onStatusChange = onStatusChange;
    this.socket = null;
    this.seenEventIds = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 10000;
    this.reconnectTimeout = null;
    this.pingInterval = null;
    this.isExplicitlyClosed = false;
  }

  connect() {
    if (!this.sessionId) return;
    this.isExplicitlyClosed = false;

    const url = `${WS_BASE_URL}/ws/sessions/${this.sessionId}`;
    this.onStatusChange?.('connecting');

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.onStatusChange?.('connected');
        // Setup 25s client ping
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send('PING');
          }
        }, 25000);
      };

      this.socket.onmessage = (messageEvent) => {
        try {
          const event = JSON.parse(messageEvent.data);
          // Heartbeat pong ignore
          if (event.type === 'PONG') return;

          // Event deduplication
          if (event.id) {
            if (this.seenEventIds.has(event.id)) return;
            this.seenEventIds.add(event.id);
          }

          this.onEvent?.(event);
        } catch (e) {
          console.warn('[WS] Failed to parse event frame:', e);
        }
      };

      this.socket.onclose = () => {
        clearInterval(this.pingInterval);
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        } else {
          this.onStatusChange?.('disconnected');
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[WS] Socket error:', err);
        // onclose will trigger next
      };
    } catch (err) {
      console.error('[WS] Connection init error:', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    this.onStatusChange?.('reconnecting', delay);

    clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      if (!this.isExplicitlyClosed) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    this.isExplicitlyClosed = true;
    clearTimeout(this.reconnectTimeout);
    clearInterval(this.pingInterval);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.onStatusChange?.('disconnected');
  }
}
