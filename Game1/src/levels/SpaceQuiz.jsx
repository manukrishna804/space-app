import React, { useState } from 'react';
import { motion } from 'framer-motion';

const questions = [
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Sun"],
    correct: 1
  },
  {
    question: "What is the name of our galaxy?",
    options: ["Andromeda", "Milky Way", "Snickers", "Whirlpool"],
    correct: 1
  },
  {
    question: "Which serves as the center of our Solar System?",
    options: ["Earth", "The Sun", " The Moon", "Black Hole"],
    correct: 1
  }
];

const SpaceQuiz = ({ onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (index) => {
    if (showResult) return;

    const isCorrect = index === questions[currentQ].correct;
    if (isCorrect) {
        setScore(score + 1);
    }

    const nextQ = currentQ + 1;
    if (nextQ < questions.length) {
        setCurrentQ(nextQ);
    } else {
        setShowResult(true);
    }
  };

  if (showResult) {
    return (
        <div className="level-container">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="quiz-container"
            >
                <h2>Quiz Complete!</h2>
                <p>You scored {score} out of {questions.length}</p>
                <p>{score === questions.length ? "Perfect Score! You are a Space Expert!" : "Great try! Keep learning!"}</p>
                <button 
                    className="option-btn" 
                    onClick={onComplete}
                    style={{ marginTop: '20px', background: '#00d4ff' }}
                >
                    Collect Your Reward
                </button>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="level-container">
      <div className="quiz-container">
        <h2>Question {currentQ + 1}/{questions.length}</h2>
        <h3>{questions[currentQ].question}</h3>
        
        <div className="options">
            {questions[currentQ].options.map((opt, i) => (
                <button 
                    key={i} 
                    className="option-btn"
                    onClick={() => handleAnswer(i)}
                >
                    {opt}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SpaceQuiz;
