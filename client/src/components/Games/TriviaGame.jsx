import React, { useEffect, useState } from "react";

const TriviaGame = ({onGameEnd}) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=5&category=18&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.results.map((q) => {
          const answers = [...q.incorrect_answers, q.correct_answer].sort(() => 0.5 - Math.random());
          return { ...q, answers };
        });
        setQuestions(formatted);
      });
  }, []);

  const handleAnswer = (ans) => {
    setSelectedAnswer(ans);
  
    if (ans === questions[currentIndex].correct_answer) {
      setScore(score + 1);
    }
  
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer("");
      } else {
        setShowResult(true);
        onGameEnd(score + (ans === questions[currentIndex].correct_answer ? 1 : 0));
      }
    }, 1500);
  };
  
  if (questions.length === 0) return <p>Loading questions...</p>;

  if (showResult) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold">🎉 Game Over!</h2>
        <p className="mt-2">Your final score: {score} / {questions.length}</p>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="p-4">
      <h4 className="text-lg font-semibold mb-3" dangerouslySetInnerHTML={{ __html: question.question }} />
      <ul>
        {question.answers.map((ans, i) => (
          <li key={i}>
            <button
              className={`mt-2 px-3 py-1 border rounded w-full text-left ${
                selectedAnswer
                  ? ans === question.correct_answer
                    ? "bg-green-200"
                    : ans === selectedAnswer
                    ? "bg-red-200"
                    : ""
                  : ""
              }`}
              onClick={() => !selectedAnswer && handleAnswer(ans)}
              dangerouslySetInnerHTML={{ __html: ans }}
            />
          </li>
        ))}
      </ul>
      {selectedAnswer && (
        <p className="mt-4">
          {selectedAnswer === question.correct_answer ? "✅ Correct!" : `❌ Wrong! Correct answer: ${question.correct_answer}`}
        </p>
      )}
      <p className="mt-4 text-sm text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
    </div>
  );
};

export default TriviaGame;
