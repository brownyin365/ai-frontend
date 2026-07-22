import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.token = null;
    this.shouldReconnect = true;
  }

  connect(token) {
    // Store token for reconnection
    this.token = token;
    this.shouldReconnect = true;

    // Don't try to connect if already connected
    if (this.socket && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    // Clean up existing socket
    if (this.socket) {
      this.disconnect();
    }

    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:5000';
      
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      this.socket = io(wsUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners('connected', { 
          message: 'Connected successfully',
          timestamp: new Date().toISOString()
        });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
        this.isConnected = false;
        this.notifyListeners('disconnected', { reason });
        
        // Try to reconnect if not intentional
        if (reason === 'io server disconnect' || reason === 'transport close') {
          console.log('🔄 Attempting to reconnect...');
          setTimeout(() => {
            if (this.shouldReconnect) {
              this.connect(this.token);
            }
          }, this.reconnectDelay);
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error.message);
        this.isConnected = false;
        this.reconnectAttempts += 1;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn('⚠️ Max reconnection attempts reached');
          this.notifyListeners('error', { 
            message: 'Unable to connect to WebSocket server. Please refresh the page.',
            error: error.message
          });
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyListeners('reconnected', { attemptNumber });
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ WebSocket reconnection failed');
        this.notifyListeners('error', { 
          message: 'WebSocket reconnection failed. Please refresh the page.'
        });
      });

      // Handle pong response
      this.socket.on('pong', () => {
        // Connection is alive
      });

      // Handle incoming messages
      this.socket.on('message-received', (data) => {
        console.log('📨 Message received:', data);
        this.notifyListeners('message-received', data);
      });

      this.socket.on('user-typing', (data) => {
        this.notifyListeners('user-typing', data);
      });

      this.socket.on('new-lead', (data) => {
        console.log('👤 New lead captured:', data);
        this.notifyListeners('new-lead', data);
      });

      this.socket.on('conversation-escalated', (data) => {
        console.log('⚠️ Conversation escalated:', data);
        this.notifyListeners('conversation-escalated', data);
      });

      this.socket.on('notification', (data) => {
        console.log('🔔 Notification:', data);
        this.notifyListeners('notification', data);
      });

      this.socket.on('joined', (data) => {
        console.log('✅ Joined conversation:', data);
        this.notifyListeners('joined', data);
      });

      this.socket.on('left', (data) => {
        console.log('👋 Left conversation:', data);
        this.notifyListeners('left', data);
      });

      this.socket.on('connected', (data) => {
        console.log('✅ Connection confirmed:', data);
        this.notifyListeners('connected', data);
      });

    } catch (error) {
      console.error('❌ WebSocket initialization error:', error);
      this.notifyListeners('error', { 
        message: 'Failed to initialize WebSocket connection',
        error: error.message 
      });
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      if (callback) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
          callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
          this.listeners.delete(event);
        }
      } else {
        this.listeners.delete(event);
      }
    }
  }

  removeAllListeners() {
    this.listeners.clear();
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit '${event}', socket not connected`);
      // Try to reconnect
      if (this.shouldReconnect && !this.isConnected) {
        setTimeout(() => {
          this.connect(this.token);
        }, this.reconnectDelay);
      }
    }
  }

  joinConversation(conversationId) {
    this.emit('join-conversation', conversationId);
  }

  leaveConversation(conversationId) {
    this.emit('leave-conversation', conversationId);
  }

  sendMessage(conversationId, message) {
    this.emit('new-message', { conversationId, message });
  }

  sendTyping(conversationId, isTyping) {
    this.emit('typing', { conversationId, isTyping });
  }

  isReady() {
    return this.socket !== null && this.isConnected;
  }

  connect(token) {
  // Don't reconnect if already connecting
  if (this.isConnecting) return;
  
  this.isConnecting = true;
  
  // Add delay before reconnecting
  if (this.reconnectAttempts > 0) {
    const delay = Math.min(1000 * this.reconnectAttempts, 10000);
    setTimeout(() => {
      this.doConnect(token);
    }, delay);
  } else {
    this.doConnect(token);
  }
}
}

// Export singleton instance
export default new WebSocketService();