import axios from "axios";
import swal from "sweetalert";
import chatSocketService from '../../services/chatSocketService';

import {
  _SetChatLoading,
  _ClearChatError,
  _GetChatRooms,
  _GetChatRoom,
  _CreateChatRoom,
  _UpdateChatRoom,
  _DeleteChatRoom,
  _GetMessages,
  _AddMessage,
  _MarkMessagesRead,
  _DeleteMessage,
  _ChatError,
  _SetHasMoreMessages,
  _SetCreateChatLoading,
  _ClearCurrentRoom,
  _GetAllUsers,
  _SilentUpdateChatRooms,
  _UpdateTypingStatus,
  _ClearTypingStatus,
  _ReplaceMessage,
  _RemoveMessage
} from "../reducers/chatReducer";

// Debug helper
const logAction = (action, data) => {
  console.log(`[CHAT] ${action}`, data || '');
};

// Auth check helper
const checkAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const currentHeader = axios.defaults.headers.common["Authorization"];
  
  if (token && (!currentHeader || currentHeader !== `Bearer ${token}`)) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return true;
  }
  return false;
};

// Get all chat rooms - shows loading
export const GetChatRooms = () => async (dispatch) => {
  logAction('GetChatRooms');
  dispatch(_SetChatLoading(true));

  try {
    checkAuthHeaders();
    const res = await axios.get('/api/rooms');
    logAction('GetChatRooms Success', res.data);

    dispatch(_GetChatRooms(res.data.chatRooms || []));
    return res.data;
  } catch (err) {
    logAction('GetChatRooms Error', err);
    
    const errorMsg = err.response?.data?.message || 'Failed to fetch chat rooms';
    dispatch(_ChatError(errorMsg));
    swal("Error", errorMsg, "error");
    return null;
  } finally {
    dispatch(_SetChatLoading(false));
  }
};

// Silently update chat rooms - no loading state
export const SilentUpdateChatRooms = (chatRooms) => (dispatch) => {
  logAction('SilentUpdateChatRooms', chatRooms.length);
  dispatch(_SilentUpdateChatRooms(chatRooms));
};

// Get a specific chat room
export const GetChatRoom = (roomId) => async (dispatch) => {
  logAction('GetChatRoom', { roomId });
  dispatch(_SetChatLoading(true));

  try {
    checkAuthHeaders();
    const res = await axios.get(`/api/rooms/${roomId}`);
    logAction('GetChatRoom Success', res.data);
    
    dispatch(_GetChatRoom(res.data.chatRoom || res.data));
    
    // Join the socket room
    chatSocketService.joinChatRoom(roomId);
    
    // Clear typing status when entering room
    dispatch(_ClearTypingStatus(roomId));
    
    return res.data;
  } catch (err) {
    logAction('GetChatRoom Error', err);
    
    const errorMsg = err.response?.data?.message || 'Failed to fetch chat room';
    dispatch(_ChatError(errorMsg));
    swal("Error", errorMsg, "error");
    return null;
  } finally {
    dispatch(_SetChatLoading(false));
  }
};

// Load chat messages with pagination
// Replace the GetMessages action in chatActions.js with this code:

// Load chat messages with pagination
export const GetMessages = (roomId, page = 1, limit = 20) => async (dispatch) => {
  logAction('GetMessages', { roomId, page, limit });
  dispatch(_SetChatLoading(true));

  try {
    checkAuthHeaders();
    const res = await axios.get(`/api/messages/${roomId}?page=${page}&limit=${limit}`);
    logAction('GetMessages Success', res.data);

    const messages = res.data.messages || [];
    const hasMore = res.data.totalPages > page;

    // Keep the backend's message ordering, we'll sort in the UI
    dispatch(_GetMessages({
      roomId,
      messages,
      pagination: {
        currentPage: page,
        totalPages: res.data.totalPages,
        totalMessages: res.data.totalMessages
      }
    }));

    dispatch(_SetHasMoreMessages(hasMore));
    
    // Mark messages as read when we load them
    dispatch(MarkMessagesRead(roomId));
    
    return res.data;
  } catch (err) {
    logAction('GetMessages Error', err);
    
    const errorMsg = err.response?.data?.message || 'Failed to fetch messages';
    dispatch(_ChatError(errorMsg));
    console.error('Error fetching messages:', err);
    return null;
  } finally {
    dispatch(_SetChatLoading(false));
  }
};

// Send a new message with optimistic update
export const SendMessage = (chatRoomId, content, attachments = []) => async (dispatch, getState) => {
  logAction('SendMessage', { chatRoomId, content });
  
  // Get the current user and chat room
  const { auth, chat } = getState();
  const user = auth.user;
  const room = chat.chatRooms.find(r => r._id === chatRoomId);
  
  // Create a temporary message object with a temporary ID
  const tempMessage = {
    _id: 'temp_' + Date.now(),
    content,
    attachments,
    chatRoom: chatRoomId,
    sender: {
      _id: user.id,
      fullName: user.fullName,
      email: user.email
    },
    createdAt: new Date().toISOString(),
    readBy: [{ user: user.id }]
  };
  
  // Add this message to Redux immediately (optimistic update)
  dispatch(_AddMessage(tempMessage));
  
  // Also update the chat rooms list to show this message as the last message
  if (room) {
    const updatedRoom = {
      ...room,
      lastMessage: tempMessage,
      updatedAt: new Date().toISOString()
    };
    dispatch(_UpdateChatRoom(updatedRoom));
  }

  try {
    checkAuthHeaders();
    const res = await axios.post('/api/messages', {
      chatRoomId,
      content,
      attachments
    });
    
    logAction('SendMessage Success', res.data);

    // Once we get a response, replace the temp message with the real one
    const realMessage = res.data.message;
    
    // Replace the temporary message with the real one
    dispatch(_ReplaceMessage({
      tempId: tempMessage._id,
      realMessage,
      chatRoomId
    }));
    
    // Update the chat room's last message
    if (room) {
      const updatedRoom = {
        ...room,
        lastMessage: realMessage,
        updatedAt: new Date().toISOString()
      };
      dispatch(_UpdateChatRoom(updatedRoom));
    }
    
    // Emit via socket for real-time updates
    chatSocketService.sendSocketMessage({
      ...realMessage,
      chatRoomId
    });
    
    return res.data;
  } catch (err) {
    logAction('SendMessage Error', err);
    
    // Remove the temporary message since the request failed
    dispatch(_RemoveMessage({
      messageId: tempMessage._id,
      chatRoomId
    }));
    
    const errorMsg = err.response?.data?.message || 'Failed to send message';
    dispatch(_ChatError(errorMsg));
    swal("Error", errorMsg, "error");
    return null;
  }
};

// Mark messages as read - standard version with API call
export const MarkMessagesRead = (roomId) => async (dispatch, getState) => {
  logAction('MarkMessagesRead', { roomId });
  const { auth } = getState();
  const userId = auth.user?.id;

  try {
    checkAuthHeaders();
    // API call to mark messages as read
    await axios.put(`/api/messages/${roomId}/read`);
    
    // Update local state
    dispatch(_MarkMessagesRead({ 
      roomId, 
      userId,
      timestamp: new Date().toISOString() 
    }));
    
    // Emit via socket for real-time updates
    chatSocketService.markMessagesReadSocket(roomId);
    
  } catch (err) {
    logAction('MarkMessagesRead Error', err);
    console.error('Error marking messages as read:', err);
  }
};

// Silent mark messages read - for socket events
export const SilentMarkMessagesRead = (data) => (dispatch) => {
  logAction('SilentMarkMessagesRead', data);
  dispatch(_MarkMessagesRead(data));
};

// Get all users for creating a new chat
export const GetAllUsers = () => async (dispatch) => {
  logAction('GetAllUsers');

  try {
    checkAuthHeaders();
    const res = await axios.get('/api/users');
    logAction('GetAllUsers Success', res.data);

    dispatch(_GetAllUsers(res.data.data || []));
    return res.data;
  } catch (err) {
    logAction('GetAllUsers Error', err);
    
    const errorMsg = err.response?.data?.message || 'Failed to fetch users';
    dispatch(_ChatError(errorMsg));
    swal("Error", errorMsg, "error");
    return null;
  }
};

// Create a new chat room
export const CreateNewChatRoom = (roomData) => async (dispatch) => {
  logAction('CreateChatRoom', roomData);
  dispatch(_SetCreateChatLoading(true));

  try {
    checkAuthHeaders();
    const res = await axios.post('/api/rooms', roomData);
    logAction('CreateChatRoom Success', res.data);

    const newRoom = res.data.chatRoom;
    dispatch(_CreateChatRoom(newRoom));
    
    // Notify other users about the new chat room
    chatSocketService.notifyNewChatRoom(newRoom);
    
    swal("Success", "Chat room created successfully", "success");
    
    return newRoom;
  } catch (err) {
    logAction('CreateChatRoom Error', err);
    
    const errorMsg = err.response?.data?.message || 'Failed to create chat room';
    dispatch(_ChatError(errorMsg));
    swal("Error", errorMsg, "error");
    throw err;
  } finally {
    dispatch(_SetCreateChatLoading(false));
  }
};

// Update chat room
export const UpdateChatRoom = (roomId, roomData) => async (dispatch) => {
  logAction('UpdateChatRoom', { roomId, roomData });
  dispatch(_SetChatLoading(true));

  try {
    checkAuthHeaders();
    const res = await axios.put(`/api/rooms/${roomId}`, roomData);
    logAction('UpdateChatRoom Success', res.data);

    const updatedRoom = res.data.chatRoom;
    dispatch(_UpdateChatRoom(updatedRoom));
    
    // Notify other users about the updated chat room
    chatSocketService.notifyNewChatRoom(updatedRoom);
    
    swal("Success", "Chat room updated successfully", "success");
    return res.data;
  } catch (err) {
    logAction('UpdateChatRoom Error', err);
    
    const errorMsg = err.response?.data?.message || 'Failed to update chat room';
    dispatch(_ChatError(errorMsg));
    swal("Error", errorMsg, "error");
    return null;
  } finally {
    dispatch(_SetChatLoading(false));
  }
};

// Delete chat room
export const DeleteChatRoom = (roomId) => async (dispatch) => {
  logAction('DeleteChatRoom', { roomId });
  
  if (window.confirm("Are you sure you want to delete this chat room?")) {
    dispatch(_SetChatLoading(true));

    try {
      checkAuthHeaders();
      await axios.delete(`/api/rooms/${roomId}`);
      logAction('DeleteChatRoom Success');

      dispatch(_DeleteChatRoom(roomId));
      
      // Notify other users about the deleted chat room
      chatSocketService.socketClient.emit('silent-refresh', {
        type: 'delete-chat-room',
        roomId
      });
      
      swal("Success", "Chat room deleted successfully", "success");
    } catch (err) {
      logAction('DeleteChatRoom Error', err);
      
      const errorMsg = err.response?.data?.message || 'Failed to delete chat room';
      dispatch(_ChatError(errorMsg));
      swal("Error", errorMsg, "error");
    } finally {
      dispatch(_SetChatLoading(false));
    }
  }
};

// Delete a message
export const DeleteMessage = (messageId, roomId) => async (dispatch) => {
  logAction('DeleteMessage', { messageId, roomId });
  
  if (window.confirm("Are you sure you want to delete this message?")) {
    dispatch(_SetChatLoading(true));

    try {
      checkAuthHeaders();
      await axios.delete(`/api/messages/${messageId}`);
      logAction('DeleteMessage Success');

      dispatch(_DeleteMessage({ roomId, messageId }));
      
      // Notify others about the deleted message
      chatSocketService.socketClient.emit('silent-refresh', {
        type: 'delete-message',
        roomId,
        messageId
      });
      
      swal("Success", "Message deleted successfully", "success");
    } catch (err) {
      logAction('DeleteMessage Error', err);
      
      const errorMsg = err.response?.data?.message || 'Failed to delete message';
      dispatch(_ChatError(errorMsg));
      swal("Error", errorMsg, "error");
    } finally {
      dispatch(_SetChatLoading(false));
    }
  }
};

// Clear current room data
export const ClearCurrentRoom = () => (dispatch) => {
  logAction('ClearCurrentRoom');
  dispatch(_ClearCurrentRoom());
  dispatch(_ClearTypingStatus());
};

// Clear chat errors
export const ClearChatError = () => (dispatch) => {
  dispatch(_ClearChatError());
};

// Socket action for adding a new message
export const AddMessage = (message) => (dispatch) => {
  logAction('AddMessage (Socket)', { id: message._id });
  dispatch(_AddMessage(message));
};

// Update typing status from socket event
export const UpdateTypingStatus = (data) => (dispatch) => {
  logAction('UpdateTypingStatus (Socket)', data);
  dispatch(_UpdateTypingStatus(data));
};