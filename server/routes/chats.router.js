const express = require('express');
const router = express.Router();
const passport = require("passport");


// Import controllers
const { 
  createChatRoom, 
  getChatRooms, 
  getChatRoomById, 
  updateChatRoom, 
  deleteChatRoom,
  getChatMembers,
  addChatMember,
  removeChatMember,
  clearChatMessages 
} = require('../controllers/ChatRoom');

const { 
  sendMessage, 
  getMessages, 
  markAsRead, 
  deleteMessage 
} = require('../controllers/ChatMessage');

// Chat Room routes
router.post('/rooms', passport.authenticate("jwt", { session: false }), createChatRoom);
router.get('/rooms', passport.authenticate("jwt", { session: false }) , getChatRooms);
router.get('/rooms/:roomId', passport.authenticate("jwt", { session: false }), getChatRoomById);
router.put('/rooms/:roomId',  passport.authenticate("jwt", { session: false }), updateChatRoom);
router.delete('/rooms/:roomId', passport.authenticate("jwt", { session: false }), deleteChatRoom);

// Chat Members routes
router.get('/rooms/:roomId/members', passport.authenticate("jwt", { session: false }), getChatMembers);
router.post('/rooms/:roomId/members', passport.authenticate("jwt", { session: false }), addChatMember);
router.delete('/rooms/:roomId/members/:memberId', passport.authenticate("jwt", { session: false }), removeChatMember);

// Chat Message routes
router.post('/messages',  passport.authenticate("jwt", { session: false }), sendMessage);
router.get('/messages/:chatRoomId',  passport.authenticate("jwt", { session: false }), getMessages);
router.put('/messages/:chatRoomId/read',  passport.authenticate("jwt", { session: false }), markAsRead);
router.delete('/messages/:messageId',  passport.authenticate("jwt", { session: false }), deleteMessage);

// Clear all messages in a chat
router.delete('/messages/:chatRoomId/all', passport.authenticate("jwt", { session: false }), clearChatMessages);

module.exports = router;