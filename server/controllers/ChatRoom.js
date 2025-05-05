const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/users'); // Make sure this path is correct for your project

// Create a new chat room
const createChatRoom = async (req, res) => {
  try {
    const { name, description, project, participants, isPrivate, isDirectMessage } = req.body;
    
    // For direct messages, check if there's already a chat between these users
    if (isDirectMessage && participants.length === 1) {
      const otherUserId = participants[0];
      
      // Check for existing direct message room
      const existingRoom = await ChatRoom.findOne({
        isDirectMessage: true,
        participants: { 
          $all: [req.user.id, otherUserId],
          $size: 2 
        }
      });
      
      if (existingRoom) {
        // Return existing chat room
        const chatRoom = await ChatRoom.findById(existingRoom._id)
          .populate('createdBy', 'fullName email')
          .populate('participants', 'fullName email');
        
        return res.status(200).json({
          success: true,
          chatRoom,
          message: 'Existing chat found'
        });
      }
    }
    
    // For direct messages, use a special naming convention
    let roomName = name;
    if (isDirectMessage && participants.length === 1) {
      const otherUser = await User.findById(participants[0])
        .select('fullName email');
      
      roomName = otherUser?.fullName || otherUser?.email || name;
    }
    
    // Create new chat room
    const newChatRoom = new ChatRoom({
      name: roomName,
      description,
      project,
      participants: [...participants, req.user.id], // Add current user to participants
      createdBy: req.user.id,
      isPrivate: isPrivate || false,
      isDirectMessage: isDirectMessage || false
    });
    
    await newChatRoom.save();
    
    // Populate creator details
    const chatRoom = await ChatRoom.findById(newChatRoom._id)
      .populate('createdBy', 'fullName email')
      .populate('participants', 'fullName email');
    
    res.status(201).json({
      success: true,
      chatRoom
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Could not create chat room',
      error: error.message
    });
  }
};

// Get all chat rooms where user is a participant
const getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      participants: { $in: [req.user.id] }
    })
      .populate('createdBy', 'fullName email')
      .populate('participants', 'fullName email')
      .populate('project', 'name')
      .sort({ updatedAt: -1 });
    
    // Get the last message for each chat room
    const roomsWithLastMessage = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMessage = await ChatMessage.findOne({ chatRoom: room._id })
          .populate('sender', 'fullName email')
          .sort({ createdAt: -1 })
          .limit(1);
        
        // Get unread message count for current user
        const unreadCount = await ChatMessage.countDocuments({
          chatRoom: room._id,
          'readBy.user': { $ne: req.user.id },
          sender: { $ne: req.user.id } // Don't count user's own messages
        });
        
        return {
          ...room.toObject(),
          lastMessage: lastMessage || null,
          unreadCount: { [req.user.id]: unreadCount }
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: roomsWithLastMessage.length,
      chatRooms: roomsWithLastMessage
    });
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve chat rooms',
      error: error.message
    });
  }
};

// Get chat room by ID
const getChatRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Find chat room and populate related fields
    const chatRoom = await ChatRoom.findById(roomId)
      .populate('createdBy', 'fullName email')
      .populate('participants', 'fullName email')
      .populate('project', 'name');
    
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }
    
    // Check if user is a participant
    if (!chatRoom.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this chat room'
      });
    }
    
    res.status(200).json({
      success: true,
      chatRoom
    });
  } catch (error) {
    console.error('Error getting chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve chat room',
      error: error.message
    });
  }
};

// Update chat room
const updateChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, description, participants, isPrivate } = req.body;
    
    // Find chat room
    const chatRoom = await ChatRoom.findById(roomId);
    
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }
    
    // Check if user is the creator or has admin rights
    if (chatRoom.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this chat room'
      });
    }
    
    // Update fields
    chatRoom.name = name || chatRoom.name;
    chatRoom.description = description || chatRoom.description;
    chatRoom.isPrivate = isPrivate !== undefined ? isPrivate : chatRoom.isPrivate;
    
    // Update participants if provided
    if (participants && Array.isArray(participants)) {
      // Make sure creator is still a participant
      if (!participants.includes(req.user.id)) {
        participants.push(req.user.id);
      }
      
      chatRoom.participants = participants;
    }
    
    chatRoom.updatedAt = Date.now();
    
    await chatRoom.save();
    
    // Return updated chat room with populated fields
    const updatedRoom = await ChatRoom.findById(roomId)
      .populate('createdBy', 'fullName email')
      .populate('participants', 'fullName email')
      .populate('project', 'name');
    
    res.status(200).json({
      success: true,
      chatRoom: updatedRoom
    });
  } catch (error) {
    console.error('Error updating chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Could not update chat room',
      error: error.message
    });
  }
};

// Delete chat room
const deleteChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Find chat room
    const chatRoom = await ChatRoom.findById(roomId);
    
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }
    
    // Check if user is the creator or has admin rights
    if (chatRoom.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this chat room'
      });
    }
    
    // Delete all messages in the chat room
    await ChatMessage.deleteMany({ chatRoom: roomId });
    
    // Delete the chat room
    await ChatRoom.findByIdAndDelete(roomId);
    
    res.status(200).json({
      success: true,
      message: 'Chat room and all messages deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Could not delete chat room',
      error: error.message
    });
  }
};

module.exports = {
  createChatRoom,
  getChatRooms,
  getChatRoomById,
  updateChatRoom,
  deleteChatRoom
};