const express = require('express');
const router = express.Router();
const passport = require("passport");


// Import controllers
const { 
  createChatRoom, 
  getChatRooms, 
  getChatRoomById, 
  updateChatRoom, 
  deleteChatRoom 
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
router.put('/rooms/:id',  passport.authenticate("jwt", { session: false }), updateChatRoom);
router.delete('/rooms/:id', passport.authenticate("jwt", { session: false }), deleteChatRoom);

// Chat Message routes
router.post('/messages',  passport.authenticate("jwt", { session: false }), sendMessage);
router.get('/messages/:chatRoomId',  passport.authenticate("jwt", { session: false }), getMessages);
router.put('/messages/:chatRoomId/read',  passport.authenticate("jwt", { session: false }), markAsRead);
router.delete('/messages/:messageId',  passport.authenticate("jwt", { session: false }), deleteMessage);



module.exports = router;