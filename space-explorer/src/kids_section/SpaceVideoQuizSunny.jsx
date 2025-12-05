import { useState, useRef, useEffect } from 'react';
import './SpaceVideoQuizSunny.css';

const VIDEO_SRC = "/meet_planets.mp4";
const questions = [
  {
    text: "Q1: Who is the leader of the Solar System in the story?",
    options: [
      "A) Jupiter",
      "B) Earth",
      "C) Sunny the Sun",
      "D) Mars"
    ],
    correct: 2
  },
  {
    text: "Q2: Which planet is the closest to the Sun?",
    options: [
      "A) Neptune",
      "B) Mercury",
      "C) Venus",
      "D) Uranus"
    ],
    correct: 1
  },
  {
    text: "Q3: Which planet has thick clouds that trap heat?",
    options: [
      "A) Saturn",
      "B) Venus",
      "C) Mars",
      "D) Earth"
    ],
    correct: 1
  },
  {
    text: "Q4: Which planet has a giant storm called the Great Red Spot?",
    options: [
      "A) Jupiter",
      "B) Pluto",
      "C) Earth",
      "D) Neptune"
    ],
    correct: 0
  },
  {
    text: "Q5: What does the Moon do in the story?",
    options: [
      "A) Lights up the Sun",
      "B) Orbits around Mars",
      "C) Goes around Earth and lights up the night",
      "D) Spins around Jupiter"
    ],
    correct: 2
  }
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

export default function SpaceVideoSunny() {
  const [currentView, setCurrentView] = useState('video'); // 'video', 'quiz', 'game'
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizWarn, setQuizWarn] = useState('');
  const [score, setScore] = useState(0);
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
    setLiveText(`Score ${newScore} of 5`);
  };

  const showGamePlaceholder = () => {
    setShowResultsModal(false);
    setCurrentView('game');
    setLiveText("Game placeholder shown");
  };

  return (
    <div className="space-video-quiz-sunny">
      <div className="starfield"></div>
      <div className="layout">
        <h1>Space Adventure: Watch, Quiz, Play!</h1>

        {/* Video Section */}
        {currentView === 'video' && (
          <section className="card">
            <h2>1) Watch the Space Video</h2>
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
              <button className="secondary" onClick={replayVideo}>Replay</button>
            </div>
            <p className="center" style={{ margin: '8px 0 0' }}>Quiz unlocks after the video ends.</p>
          </section>
        )}

        {/* Quiz Section */}
        {currentView === 'quiz' && (
          <section className="card">
            <h2>2) Quick Space Quiz</h2>
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
            <div className="controls-inline">
              <button onClick={submitQuiz}>Submit Answers</button>
              <button className="ghost" onClick={() => { setQuizAnswers({}); setQuizWarn(''); }}>Restart Quiz</button>
            </div>
          </section>
        )}

        {/* Game Placeholder Section */}
        {currentView === 'game' && (
          <section className="card">
            <div className="placeholder">
              <h2>Game Coming Soon!</h2>
              <p style={{ fontSize: '18px' }}>Thanks for playing. Stay tuned!</p>
              <div className="controls-inline">
                <button className="ghost" onClick={replayVideo}>Replay Video</button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Unlock Quiz Modal */}
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
            <p>You scored {score} out of 5!</p>
            <div className="controls-inline">
              <button onClick={showGamePlaceholder}>Play the Game</button>
            </div>
          </div>
        </div>
      )}

      <div className="aria-live" aria-live="polite">{liveText}</div>
    </div>
  );
}

