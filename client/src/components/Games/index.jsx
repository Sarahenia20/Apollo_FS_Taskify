import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import TriviaGame from "./TriviaGame";
import MemoryGame from "./MemoryGame";
import TicTacToe from "./TicTacToe";
import DefaultLayout from "../../layout/DefaultLayout";

const GameHub = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [roomCreated, setRoomCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [joinRoomName, setJoinRoomName] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const { _CURRENT } = useSelector((state) => state.users);

  const games = [
    { name: "Trivia Quiz", component: (room) => <TriviaGame room={room} onGameEnd={handleGameEnd} /> },
    { name: "Memory Match", component: (room) => <MemoryGame room={room} onGameEnd={handleGameEnd} /> },
    { name: "Tic Tac Toe", component: (room) => <TicTacToe room={room} onGameEnd={handleGameEnd} /> },
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Error loading rooms:", err.message);
    }
  };

  const handleGameSelect = async (index) => {
    const roomName = prompt("Enter a room name:");
    if (!roomName) return;

    const gameType = games[index].name;

    setLoading(true);
    try {
      const res = await fetch("/api/games/newRoom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, gameType }),
      });

      if (!res.ok) throw new Error("Failed to create room");

      const roomData = await res.json();
      setCurrentRoom(roomData.room);
      setSelectedGame(index);
      setRoomCreated(true);
      fetchRooms();
    } catch (err) {
      alert("Error creating room: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    const room = rooms.find((r) => r.roomName === joinRoomName);
    if (!room) {
      alert("Room not found");
      return;
    }

    const gameIndex = games.findIndex((g) => g.name === room.gameType);
    if (gameIndex === -1) {
      alert("Game not found for this room");
      return;
    }

    setCurrentRoom(room);
    setSelectedGame(gameIndex);
    setRoomCreated(true);
  };

  const handleGameEnd = (score) => {
    saveGameScore(score);
  };

  const saveGameScore = async (score) => {
    try {
      const res = await fetch("/api/games/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: currentRoom.roomName,
          username: _CURRENT.fullName,
          score,
        }),
      });

      if (!res.ok) throw new Error("Failed to save score");

      const data = await res.json();
      // Update currentRoom leaderboard to refresh display
      setCurrentRoom((prev) => ({ ...prev, leaderboard: data.leaderboard }));
    } catch (err) {
      console.error("Error saving score:", err.message);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">🎮 Choose or Join a Game Room</h2>

        {/* Create a Room */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {games.map((game, index) => (
            <button
              key={index}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => handleGameSelect(index)}
            >
              Create {game.name}
            </button>
          ))}
        </div>

        {/* Join a Room */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">🔑 Join an existing room</h3>
          <input
            type="text"
            placeholder="Enter room name"
            value={joinRoomName}
            onChange={(e) => setJoinRoomName(e.target.value)}
            className="border border-gray-300 px-3 py-1 rounded mr-2"
          />
          <button
            onClick={handleJoinRoom}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
          >
            Join
          </button>
        </div>

        {/* Game display */}
        <div className="mt-4">
          {loading ? (
            <p className="text-gray-600">Creating room...</p>
          ) : selectedGame !== null && roomCreated ? (
            games[selectedGame].component(currentRoom)
          ) : (
            <p className="text-gray-600">Please select or join a game to play!</p>
          )}
        </div>

        {/* Leaderboard */}
        {currentRoom?.leaderboard && currentRoom.leaderboard.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">🏆 Leaderboard</h3>
            <ul className="border border-gray-300 rounded p-4 bg-white max-w-md">
              {currentRoom.leaderboard
                .sort((a, b) => b.score - a.score)
                .map((entry, index) => (
                  <li key={index} className="flex justify-between py-1">
                    <span>{index + 1}. {entry.username}</span>
                    <span className="font-bold">{entry.score}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default GameHub;
