import { io } from 'socket.io-client';
import { store } from '../redux/store';
import { 
  AddMessage, 
  SilentUpdateChatRooms, 
  SilentMarkMessagesRead,
  UpdateTypingStatus
} from '../redux/actions/chatActions';

// Create socket client instance
export const socketClient = io("/", {
  autoConnect: false,
  withCredentials: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000
});

// Set auth token for socket
export const setSocketAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('Setting socket auth token');
    socketClient.auth = { token };
    return true;
  }
  console.warn('No token found for socket authentication');
  return false;
};

// Silently fetch chat rooms without triggering loading state
const silentFetchChatRooms = () => {
  const token = localStorage.getItem('token');
  
  if (!token) return;
  
  fetch('/api/rooms', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data && data.chatRooms) {
        store.dispatch(SilentUpdateChatRooms(data.chatRooms));
      }
    })
    .catch(err => {
      console.error('Silent fetch chat rooms failed:', err);
    });
};

// Initialize chat socket
export const initializeChatSocket = () => {
  console.log('Initializing chat socket...');
  
  // Set auth token
  const hasToken = setSocketAuth();
  if (!hasToken) {
    console.error('Cannot initialize socket without authentication token');
    return null;
  }
  
  // Connect if not already connected
  if (!socketClient.connected) {
    socketClient.connect();
  }

  // Set up connection events
  socketClient.on('connect', () => {
    console.log('Socket connected successfully with ID:', socketClient.id);
    // Emit connected event to server with user ID
    const user = store.getState().auth.user;
    if (user && user.id) {
      socketClient.emit('connected_client', user.id);
    }
    
    // Immediately fetch updated chat rooms on connection
    silentFetchChatRooms();
  });
  
  socketClient.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    // Try to reconnect with updated auth token after a delay
    setTimeout(() => {
      setSocketAuth();
      if (!socketClient.connected) {
        socketClient.connect();
      }
    }, 3000);
  });

  // Handle new messages - improved for real-time updates
  socketClient.on('new-message', (message) => {
    console.log('New message received via socket:', message);
    
    if (!message || !message.chatRoom) {
      console.error('Invalid message received:', message);
      return;
    }
    
    // Dispatch to Redux store without loading state
    store.dispatch(AddMessage(message));
    
    // Also silently update chat rooms to ensure sidebar is updated
    silentFetchChatRooms();
  });

  // Handle typing indicators
  socketClient.on('user-typing', (data) => {
    console.log('User typing:', data);
    // Update Redux store with typing status
    store.dispatch(UpdateTypingStatus(data));
  });

  // Handle read status updates
  socketClient.on('messages-read', (data) => {
    console.log('Messages read event received:', data);
    // Update Redux store without loading state
    store.dispatch(SilentMarkMessagesRead({
      roomId: data.chatRoomId,
      userId: data.userId,
      timestamp: data.timestamp
    }));
    
    // Also silently update chat rooms for unread counts
    silentFetchChatRooms();
  });
  
  // Handle silent refresh for any updates (new messages, rooms, etc)
  socketClient.on('silent-refresh', (data) => {
    console.log('Silent refresh event:', data);
    // Silently fetch updated chat rooms without loading state
    silentFetchChatRooms();
  });
  
  socketClient.on('disconnect', (reason) => {
    console.log('Socket disconnected. Reason:', reason);
    
    // Attempt to reconnect if disconnected unexpectedly
    if (reason === 'io server disconnect' || reason === 'transport close') {
      setTimeout(() => {
        setSocketAuth();
        socketClient.connect();
      }, 3000);
    }
  });

  return socketClient;
};

// Join a chat room
export const joinChatRoom = (roomId) => {
  console.log(`Attempting to join chat room: ${roomId}`);
  
  if (!socketClient.connected) {
    console.log('Socket not connected, connecting now...');
    setSocketAuth();
    socketClient.connect();
    
    // Add a delay to ensure connection before joining
    setTimeout(() => {
      socketClient.emit('join-room', roomId);
    }, 500);
  } else {
    socketClient.emit('join-room', roomId);
  }
};

// Leave a chat room
export const leaveChatRoom = (roomId) => {
  if (socketClient.connected) {
    console.log(`Leaving chat room: ${roomId}`);
    socketClient.emit('leave-room', roomId);
  }
};

// Set typing status with user's full name
export const setTypingStatus = (chatRoomId, isTyping) => {
  if (!socketClient.connected) {
    setSocketAuth();
    socketClient.connect();
    
    // Add a delay to ensure connection
    setTimeout(() => {
      emitTypingStatus(chatRoomId, isTyping);
    }, 500);
  } else {
    emitTypingStatus(chatRoomId, isTyping);
  }
};

// Helper to emit typing status with user info
const emitTypingStatus = (chatRoomId, isTyping) => {
  const user = store.getState().auth.user;
  const fullName = user ? (user.fullName || user.email) : '';
  
  console.log(`Setting typing status for room ${chatRoomId}: ${isTyping}`);
  socketClient.emit('typing', { 
    chatRoomId, 
    isTyping,
    fullName,
    userId: user ? user.id : ''
  });
};

// Send a message through socket
export const sendSocketMessage = (messageData) => {
  console.log('Sending message via socket:', messageData);
  
  if (!socketClient.connected) {
    console.log('Socket not connected, connecting now...');
    setSocketAuth();
    socketClient.connect();
    
    // Add a delay to ensure connection
    setTimeout(() => {
      socketClient.emit('send-message', messageData);
    }, 500);
  } else {
    socketClient.emit('send-message', messageData);
  }
};

// Mark messages as read via socket
export const markMessagesReadSocket = (chatRoomId) => {
  console.log(`Marking messages as read in room: ${chatRoomId}`);
  
  if (!socketClient.connected) {
    console.log('Socket not connected, connecting now...');
    setSocketAuth();
    socketClient.connect();
    
    // Add a delay to ensure connection
    setTimeout(() => {
      socketClient.emit('mark-read', { 
        chatRoomId,
        timestamp: new Date().toISOString()
      });
    }, 500);
  } else {
    socketClient.emit('mark-read', { 
      chatRoomId,
      timestamp: new Date().toISOString()
    });
  }
};

// Update socket auth token
export const updateSocketAuth = (token) => {
  console.log('Updating socket authentication token');
  socketClient.auth = { token };
  
  // Reconnect with new token if already connected
  if (socketClient.connected) {
    socketClient.disconnect().connect();
  }
};

// Notify about new chat room creation
export const notifyNewChatRoom = (roomData) => {
  if (!socketClient.connected) {
    setSocketAuth();
    socketClient.connect();
    
    setTimeout(() => {
      socketClient.emit('silent-refresh', {
        type: 'new-chat-room',
        room: roomData
      });
    }, 500);
  } else {
    socketClient.emit('silent-refresh', {
      type: 'new-chat-room',
      room: roomData
    });
  }
};

// Default export with all methods
const chatSocketService = {
  socketClient,
  initializeChatSocket,
  joinChatRoom,
  leaveChatRoom,
  sendSocketMessage,
  setTypingStatus,
  markMessagesReadSocket,
  updateSocketAuth,
  notifyNewChatRoom
};

export default chatSocketService;