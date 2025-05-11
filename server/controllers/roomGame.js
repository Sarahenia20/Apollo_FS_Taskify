const RoomGame = require("../models/RoomGame");

exports.createRoom = async (req, res) => {
  const { roomName, gameType } = req.body;
  const user = req.user; // Populated by passport-jwt

  // Log user for debugging
  console.log("CreateRoom: User:", user ? user._id : "No user");

  // Check if user is authenticated (optional, based on design)
  if (!user) {
    console.log("CreateRoom: Unauthorized request");
    return res.status(401).json({ message: "Unauthorized: No user authenticated" });
  }

  // Validate request body
  if (!roomName || !gameType) {
    return res.status(400).json({ message: "Room name and game type are required" });
  }

  try {
    const room = new RoomGame({ roomName, gameType });
    await room.save();
    console.log(`Room created: ${room._id}`);
    return res.status(201).json({ message: "Room created", room });
  } catch (err) {
    console.error("CreateRoom Error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Room name already exists" });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomGame.find();
    return res.status(200).json(rooms);
  } catch (err) {
    console.error("GetAllRooms Error:", err);
    return res.status(500).json({ message: "Error fetching rooms", error: err.message });
  }
};

exports.saveScore = async (req, res) => {
  const { roomName, username, score } = req.body;

  // Validate request body
  if (!roomName || !username || typeof score !== "number") {
    return res.status(400).json({ message: "Room name, username, and score are required" });
  }

  try {
    const room = await RoomGame.findOne({ roomName });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Add new score to leaderboard
    room.leaderboard.push({ username, score });

    // Sort by score descending and keep top 5
    room.leaderboard.sort((a, b) => b.score - a.score);
    room.leaderboard = room.leaderboard.slice(0, 5);

    await room.save();
    console.log(`Score saved for room: ${roomName}, user: ${username}`);
    return res.status(200).json({
      message: "Score saved and leaderboard updated",
      leaderboard: room.leaderboard,
    });
  } catch (error) {
    console.error("SaveScore Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};