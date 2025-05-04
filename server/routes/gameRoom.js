// routes/roomRoutes.js
const express = require("express");
 const {createRoom,getAllRooms,saveScore }=require("../controllers/roomGame.js");

const Router = express.Router();

Router.post("/games/newRoom", createRoom);
Router.get("/games/", getAllRooms);
Router.post("/games/score",saveScore)
module.exports = Router;
