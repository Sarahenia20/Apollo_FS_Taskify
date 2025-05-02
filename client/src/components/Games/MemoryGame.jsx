import React, { useState, useEffect } from "react";

const createCards = () => {
  const icons = ["🍎", "🍌", "🍓", "🍒", "🍇", "🍑"];
  const cards = [...icons, ...icons].map((icon, i) => ({
    id: i,
    icon,
    flipped: false,
    matched: false,
  }));
  return cards.sort(() => 0.5 - Math.random());
};

const MemoryGame = ({ room, onGameEnd }) => {
  const [cards, setCards] = useState(createCards());
  const [flipped, setFlipped] = useState([]);
  const [score, setScore] = useState(0);
  const [revealTime, setRevealTime] = useState(true);

  // Révélation initiale des cartes
  useEffect(() => {
    const revealAll = cards.map(card => ({ ...card, flipped: true }));
    setCards(revealAll);
    const timer = setTimeout(() => {
      const hideAll = revealAll.map(card => ({ ...card, flipped: false }));
      setCards(hideAll);
      setRevealTime(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Comparaison des deux cartes retournées
  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      const firstCard = cards[a];
      const secondCard = cards[b];

      const isMatch = firstCard.icon === secondCard.icon;

      if (isMatch) {
        setCards(prevCards =>
          prevCards.map((card, index) =>
            index === a || index === b ? { ...card, matched: true } : card
          )
        );
        setScore(prev => prev + 1);
      } else {
        setScore(prev => Math.max(0, prev - 1));
      }

      setTimeout(() => {
        setCards(prevCards =>
          prevCards.map((card, index) =>
            index === a || index === b
              ? card.matched
                ? card
                : { ...card, flipped: false }
              : card
          )
        );
        setFlipped([]);
      }, 1000);
    }
  }, [flipped]); // cards est retiré ici

  const flipCard = (index) => {
    if (!revealTime && flipped.length < 2 && !cards[index].flipped && !cards[index].matched) {
      const newCards = [...cards];
      newCards[index].flipped = true;
      setCards(newCards);
      setFlipped([...flipped, index]);
    }
  };

  const isGameOver = cards.every(card => card.matched);

  useEffect(() => {
    if (isGameOver) {
      console.log("im @game over");
      onGameEnd(score);
    }
  }, [isGameOver]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold">Score: {score}</h2>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`w-16 h-16 flex items-center justify-center border text-2xl cursor-pointer rounded ${
              card.flipped || card.matched ? "bg-white" : "bg-gray-300"
            }`}
            onClick={() => flipCard(i)}
          >
            {card.flipped || card.matched ? card.icon : "❓"}
          </div>
        ))}
      </div>
      {isGameOver && <div className="mt-4">Game Over! Final score: {score}</div>}
    </div>
  );
};

export default MemoryGame;
