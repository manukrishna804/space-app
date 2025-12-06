import React, { useState } from 'react';
import { motion } from 'framer-motion';

import questionsData from '../assets/questions.json';

const SpaceQuiz = ({ onComplete }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // Shuffle and pick 5 questions on mount
    React.useEffect(() => {
        const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 5));
    }, []);

    if (questions.length === 0) return <div>Loading Quiz...</div>;

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
