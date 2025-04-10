const app = require("express")();
const server = require("http").createServer(app, (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
});

const clients = [];

// Créer un faux io pour éviter les erreurs
const io = {
  on: () => {},
  emit: () => {},
  to: () => ({ emit: () => {} })
};

// Ne pas démarrer le serveur socket.io pour éviter les conflits de port
console.log("Socket.IO server disabled temporarily");

module.exports = {
  io,
  clients,
  methods:{
    getUserSockets: userId => []
  }
};
