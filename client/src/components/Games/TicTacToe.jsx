import React, { useState } from "react";

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const winner = calculateWinner(board);
  const current = xIsNext ? "X" : "O";

  const handleClick = (i) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = current;
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  function calculateWinner(sq) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let [a,b,c] of lines) {
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a];
    }
    return null;
  }

  const reset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="text-center">
      <h3 className="mb-2 font-bold">{winner ? `🎉 Winner: ${winner}` : `Next: ${current}`}</h3>
      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="w-16 h-16 text-2xl border border-gray-400"
          >
            {cell}
          </button>
        ))}
      </div>
      <button onClick={reset} className="mt-4 bg-green-500 text-white px-3 py-1 rounded">
        Restart
      </button>
    </div>
  );
};

export default TicTacToe;
