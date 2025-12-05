import { useState, useRef, useEffect } from 'react';
import './SpaceLearningFlow.css';

const VIDEO_SRC = "/v1.mp4";
const questions = [
  {
    text: "Q1: Why did everything float when Mila entered Space Town?",
    options: [
      "A) Because the fans were blowing",
      "B) Because the floor was slippery",
      "C) Because there was no gravity",
      "D) Because the walls were moving"
    ],
    correct: 2
  },
  {
    text: "Q2: How did astronauts eat their food in space?",
    options: [
      "A) On big plates",
      "B) With forks and knives",
      "C) They cooked it on a stove",
      "D) They ate floating blobs of food from pouches"
    ],
    correct: 3
  },
  {
    text: "Q3: Why do astronauts zip themselves into sleeping bags?",
    options: [
      "A) To stay warm",
      "B) So they don't float away",
      "C) Because the room is cold",
      "D) Because it's more comfortable"
    ],
    correct: 1
  },
  {
    text: "Q4: How does the space toilet work?",
    options: [
      "A) With running water",
      "B) By flushing like on Earth",
      "C) With air suction that pulls things the right way",
      "D) By opening a hole to space"
    ],
    correct: 2
  },
  {
    text: "Q5: Why do astronauts exercise every day on the space station?",
    options: [
      "A) To become faster runners",
      "B) Because they are bored",
      "C) To win space competitions",
      "D) Because their muscles get weak without gravity"
    ],
    correct: 3
  }
];

const GAME_PLANETS = [
  { size: "small", label: "Small", color: "var(--planet-small)" },
  { size: "medium", label: "Medium", color: "var(--planet-med)" },
  { size: "big", label: "Large", color: "var(--planet-large)" }
];

// Audio helper
const AudioFX = (() => {
  let ctx;
  const safeCtx = () => {
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); return ctx; }
    catch { return null; }
  };
  function tone(freq, dur = 0.2, vol = 0.1) {
    const c = safeCtx(); if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain).connect(c.destination);
    const now = c.currentTime;
    osc.start(now);
    osc.stop(now + dur);
  }
  return {
    success() { tone(800, 0.25, 0.12); tone(1000, 0.25, 0.08); },
    gentle() { tone(400, 0.3, 0.08); }
  };
})();

function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function SpaceLearningFlow() {
  const [currentView, setCurrentView] = useState('video'); // 'video', 'quiz', 'game'
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizWarn, setQuizWarn] = useState('');
  const [score, setScore] = useState(0);
  const [planets, setPlanets] = useState([]);
  const [gameMessage, setGameMessage] = useState('');
  const [liveText, setLiveText] = useState('');
  
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = VIDEO_SRC;
      videoRef.current.load();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyNum = Number(e.key);
      if (keyNum >= 1 && keyNum <= 4) {
        const active = document.activeElement;
        const groupName = active?.name;
        if (groupName && groupName.startsWith("q")) {
          const target = document.querySelector(`input[name="${groupName}"][value="${keyNum - 1}"]`);
          if (target) {
            target.checked = true;
            handleAnswerChange(parseInt(groupName.substring(1)), keyNum - 1);
          }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleVideoEnd = () => {
    setShowQuizModal(true);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const replayVideo = () => {
    setShowQuizModal(false);
    setShowResultsModal(false);
    setCurrentView('video');
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setLiveText("Replaying video");
  };

  const startQuiz = () => {
    setShowQuizModal(false);
    setCurrentView('quiz');
    setQuizAnswers({});
    setQuizWarn('');
    setLiveText("Quiz started");
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionIndex]: answerIndex });
    setQuizWarn('');
  };

  const validateQuiz = () => {
    const allAnswered = questions.every((_, qi) => quizAnswers[qi] !== undefined);
    if (!allAnswered) {
      setQuizWarn("Please answer all questions!");
      return false;
    }
    return true;
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, qi) => {
      if (quizAnswers[qi] === q.correct) score++;
    });
    return score;
  };

  const submitQuiz = () => {
    if (!validateQuiz()) return;
    const newScore = calculateScore();
    setScore(newScore);
    setShowResultsModal(true);
    if (newScore >= 3) AudioFX.success(); else AudioFX.gentle();
    const msg = newScore >= 3
      ? `You scored ${newScore} out of 5! Great job!`
      : `You scored ${newScore} out of 5. Nice try — you can try again!`;
    setLiveText(msg);
  };

  const restartQuiz = () => {
    setCurrentView('quiz');
    setQuizAnswers({});
    setQuizWarn('');
    setLiveText("Quiz restarted");
  };

  const startGame = () => {
    setShowResultsModal(false);
    setCurrentView('game');
    resetGame();
    setLiveText("Game started");
  };

  const resetGame = () => {
    setPlanets(shuffle([...GAME_PLANETS]));
    setGameMessage('');
  };

  const handlePlanetClick = (planet) => {
    const isCorrect = planet.size === "big";
    if (isCorrect) {
      setGameMessage("Great job!");
      setLiveText("Great job!");
      AudioFX.success();
    } else {
      setGameMessage("Try again!");
      setLiveText("Try again");
      AudioFX.gentle();
    }
  };

  useEffect(() => {
    if (currentView === 'game') {
      resetGame();
    }
  }, [currentView]);

  return (
    <div className="space-learning-flow">
      <div className="starfield"></div>
      <div className="layout">
        <h1 className="center">Kids in Space: Watch, Quiz, Play!</h1>

        {/* Teacher toolbar */}
        <div className="toolbar">
          <button className="ghost" onClick={replayVideo}>Replay Video</button>
          <button className="ghost" onClick={restartQuiz}>Restart Quiz</button>
          <button className="ghost" onClick={() => startGame()}>Skip to Game</button>
        </div>

        {/* Video Section */}
        {currentView === 'video' && (
          <section className="card">
            <h2 className="center">1) Watch the Space Video</h2>
            <video
              ref={videoRef}
              controls
              preload="auto"
              aria-label="Space lesson video"
              onEnded={handleVideoEnd}
            >
              <source src={VIDEO_SRC} type="video/mp4" />
              Your browser does not support video.
            </video>
            <div className="controls-inline">
              <button onClick={handlePlayPause}>Play / Pause</button>
              <button className="secondary" onClick={replayVideo}>Replay Video</button>
            </div>
            <p className="center" style={{ margin: '8px 0 0' }}>Quiz unlocks after the video ends. Get ready!</p>
          </section>
        )}

        {/* Quiz Section */}
        {currentView === 'quiz' && (
          <section className="card">
            <h2 className="center">2) Quick Space Quiz</h2>
            <div className="quiz">
              {questions.map((q, qi) => (
                <div key={qi} className="question">
                  <h3>{q.text}</h3>
                  <div className="options">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`option ${quizAnswers[qi] === undefined && quizWarn ? 'unanswered' : ''}`}
                        htmlFor={`q${qi}_opt${oi}`}
                      >
                        <input
                          type="radio"
                          id={`q${qi}_opt${oi}`}
                          name={`q${qi}`}
                          value={oi}
                          checked={quizAnswers[qi] === oi}
                          onChange={() => handleAnswerChange(qi, oi)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="inline-warn">{quizWarn}</div>
            <div className="submit-row">
              <button onClick={submitQuiz}>Submit Answers</button>
              <button className="ghost" onClick={restartQuiz}>Restart Quiz</button>
            </div>
          </section>
        )}

        {/* Game Section */}
        {currentView === 'game' && (
          <section className="card">
            <h2 className="center">3) Space Size Sorter Game</h2>
            <p className="center">Click the biggest planet!</p>
            <div className="planets">
              {planets.map((planet, idx) => (
                <button
                  key={idx}
                  className={`planet ${planet.size}`}
                  style={{ background: planet.color }}
                  aria-label={`${planet.label} planet`}
                  onClick={() => handlePlanetClick(planet)}
                  onTouchStart={() => handlePlanetClick(planet)}
                >
                  {planet.label}
                </button>
              ))}
            </div>
            <div className="controls-inline">
              <button className="secondary" onClick={resetGame}>Play Again</button>
              <button className="ghost" onClick={replayVideo}>Replay Video</button>
            </div>
            <div className="inline-warn" style={{ color: gameMessage === "Great job!" ? "var(--good)" : "var(--warn)" }}>
              {gameMessage}
            </div>
          </section>
        )}
      </div>

      {/* Quiz Unlock Modal */}
      {showQuizModal && (
        <div className="modal-backdrop show" onClick={() => setShowQuizModal(false)}>
          <div className="modal show" role="dialog" aria-labelledby="unlockTitle" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" aria-label="Close" onClick={() => setShowQuizModal(false)}>✕</button>
            <h2 id="unlockTitle">Great! Ready for a short quiz?</h2>
            <p>Click start to try 5 quick questions.</p>
            <div className="controls-inline">
              <button onClick={startQuiz}>Start Quiz</button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="modal-backdrop show" onClick={() => setShowResultsModal(false)}>
          <div className="modal show" role="dialog" aria-labelledby="resultsTitle" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" aria-label="Close" onClick={() => setShowResultsModal(false)}>✕</button>
            <h2 id="resultsTitle">Your score</h2>
            <p>
              {score >= 3
                ? `You scored ${score} out of 5! Great job!`
                : `You scored ${score} out of 5. Nice try — you can try again!`}
            </p>
            <div className="controls-inline">
              <button onClick={startGame}>Play the Game</button>
              <button className="ghost" onClick={replayVideo}>Replay Video</button>
              <button className="ghost" onClick={() => { setShowResultsModal(false); restartQuiz(); }}>Restart Quiz</button>
            </div>
          </div>
        </div>
      )}

      <div className="aria-live" aria-live="polite">{liveText}</div>
    </div>
  );
}

