import { useState, useRef, useEffect } from "react";
import SpaceQuest from "../games/SpaceQuest/SpaceQuest";
import Jigsaw from "../games/Jigsaw/Jigsaw";
import DragPlanets from "../games/DragPlanets/DragPlanets";

export default function SpaceVideoSunny() {
  // Views: 'video' | 'quiz' | 'games' | 'sorter-game'
  const [view, setView] = useState("video");

  // Progress States
  const [quizUnlocked, setQuizUnlocked] = useState(true);
  const [gamesUnlocked, setGamesUnlocked] = useState(true);

  // Audio Context Ref
  const audioCtx = useRef(null);

  useEffect(() => {
    return () => {
      if (audioCtx.current) {
        audioCtx.current.close().catch(() => { });
      }
    };
  }, []);

  const playSound = (type) => {
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";

      if (type === "success") {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "error") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "click") {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }

      osc.connect(gain).connect(ctx.destination);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  return (
    <div className="rocket-app">
      <Starfield />
      <div className="content-container">

        <header className="app-header">
          <h1>Kids in Space: The Solar System</h1>
          <nav className="nav-pills">
            <button
              className={view === 'video' ? 'active' : ''}
              onClick={() => setView('video')}
            >
              1. Watch
            </button>
            <button
              className={view === 'quiz' ? 'active' : ''}
              disabled={!quizUnlocked}
              onClick={() => setView('quiz')}
              title={!quizUnlocked ? "Watch video first!" : ""}
            >
              2. Quiz
            </button>
            <button
              className={['games', 'sorter-game', 'space-quest', 'jigsaw', 'drag-planets'].includes(view) ? 'active' : ''}
              disabled={!gamesUnlocked}
              onClick={() => setView('games')}
              title={!gamesUnlocked ? "Pass quiz first!" : ""}
            >
              3. Play
            </button>
          </nav>
        </header>

        <main className="main-stage">
          {view === "video" && (
            <VideoSection
              onComplete={() => {
                setQuizUnlocked(true);
              }}
              onNext={() => setView('quiz')}
              quizUnlocked={quizUnlocked}
            />
          )}

          {view === "quiz" && (
            <QuizSection
              onPass={() => {
                setGamesUnlocked(true);
                playSound("success");
              }}
              onNext={() => setView('games')}
              playSound={playSound}
            />
          )}

          {view === "games" && (
            <GameMenu
              onSelectGame={(gameId) => {
                if (gameId === 'sorter') setView('sorter-game');
                else if (gameId === 'quest') setView('space-quest');
                else if (gameId === 'jigsaw') setView('jigsaw');
                else if (gameId === 'drag') setView('drag-planets');
                else alert("This game is coming soon!");
              }}
            />
          )}

          {view === "sorter-game" && (
            <SpaceSorterGame onBack={() => setView('games')} playSound={playSound} />
          )}

          {view === "space-quest" && (
            <SpaceQuest onBack={() => setView('games')} playSound={playSound} />
          )}

          {view === "jigsaw" && (
            <Jigsaw onBack={() => setView('games')} playSound={playSound} />
          )}

          {view === "drag-planets" && (
            <DragPlanets onBack={() => setView('games')} playSound={playSound} />
          )}

          <style>{`
        :root {
          --bg-deep: #0b0d17;
          --glass: rgba(255, 255, 255, 0.1);
          --glass-hover: rgba(255, 255, 255, 0.15);
          --border: rgba(255, 255, 255, 0.2);
          --primary: #facc15; /* Yellow/Gold for Sunny */
          --secondary: #fb923c;
          --text: #ffffff;
          --success: #4ade80;
          --error: #fb7185;
        }

        body {
          margin: 0;
          font-family: 'Outfit', 'Segoe UI', sans-serif;
          background-color: var(--bg-deep);
          color: var(--text);
          overflow-x: hidden;
        }

        .rocket-app {
          min-height: 100vh;
          position: relative;
        }

        .content-container {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .app-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          text-align: center;
        }

        .app-header h1 {
          font-size: 3rem;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          text-shadow: 0 0 30px rgba(250, 204, 21, 0.3);
        }

        .nav-pills {
          display: flex;
          gap: 1rem;
          background: rgba(0,0,0,0.3);
          padding: 0.5rem;
          border-radius: 100px;
          border: 1px solid var(--border);
          backdrop-filter: blur(10px);
        }

        .nav-pills button {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.6);
          padding: 0.8rem 1.5rem;
          border-radius: 100px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-pills button.active {
          background: var(--primary);
          color: #000;
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.4);
        }

        .nav-pills button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .main-stage {
          width: 100%;
          min-height: 500px;
          display: flex;
          justify-content: center;
        }

        /* CARD STYLES */
        .glass-card {
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 2rem;
          backdrop-filter: blur(12px);
          width: 100%;
          max-width: 900px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: #000;
          border: none;
          padding: 12px 24px;
          font-size: 1.1rem;
          border-radius: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(250, 204, 21, 0.3);
        }

        /* VIDEO */
        .video-wrapper video {
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* QUIZ */
        .quiz-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .question-card {
          background: rgba(255,255,255,0.05);
          padding: 1.5rem;
          border-radius: 16px;
        }
        
        .question-card h3 { margin-top: 0; }
        
        .options-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        
        .option-label {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .option-label:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .option-label input {
          width: 20px;
          height: 20px;
          accent-color: var(--primary);
        }

        /* GAME MENU */
        .game-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          width: 100%;
        }

        .game-card {
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: 20px;
          aspect-ratio: 4/3;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          group;
        }

        .game-card:hover {
          transform: translateY(-5px) scale(1.02);
          border-color: var(--primary);
          box-shadow: 0 15px 30px rgba(250, 204, 21, 0.2);
        }

        .game-details h3 { margin: 0; font-size: 1.5rem; }
        .game-details p { margin: 5px 0 0; opacity: 0.7; }
        
        .g-sorter { background: linear-gradient(to bottom right, rgba(250, 204, 21, 0.1), rgba(250, 204, 21, 0.2)); }
        .g-jump { background: linear-gradient(to bottom right, rgba(224, 176, 255, 0.1), rgba(224, 176, 255, 0.2)); }
        .g-catch { background: linear-gradient(to bottom right, rgba(255, 255, 100, 0.1), rgba(255, 255, 100, 0.2)); }
        .g-dodge { background: linear-gradient(to bottom right, rgba(255, 100, 100, 0.1), rgba(255, 100, 100, 0.2)); }

        /* SORTER GAME */
        .sorter-stage {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .planet-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          min-height: 200px;
          flex-wrap: wrap;
        }

        .planet-btn {
          border-radius: 50%;
          border: 4px solid transparent;
          cursor: pointer;
          transition: transform 0.2s;
          display: grid;
          place-items: center;
          font-weight: bold;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .planet-btn:active { transform: scale(0.9); }
        .planet-btn:hover { transform: scale(1.05); }

        .planet-sm { width: 80px; height: 80px; background: #ff7f7f; }
        .planet-md { width: 120px; height: 120px; background: #6fe3ff; }
        .planet-lg { width: 160px; height: 160px; background: #7cf5b3; }

        .planet-btn.correct { border-color: var(--success); box-shadow: 0 0 30px var(--success); }
        .planet-btn.wrong { border-color: var(--error); animation: shake 0.4s; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

      `}</style>
        </main>
      </div>
    </div>
  );
}

// ---------------- SUB-COMPONENTS ----------------

function Starfield() {
  return (
    <div className="starfield">
      <style>{`
        .starfield {
          position: fixed; inset: 0; pointer-events: none;
          background-image: 
            radial-gradient(1px 1px at 15% 15%, #fb923c, transparent),
            radial-gradient(2px 2px at 30% 60%, white, transparent),
            radial-gradient(1px 1px at 60% 30%, white, transparent),
            radial-gradient(2px 2px at 80% 80%, #fb923c, transparent);
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}

function VideoSection({ onComplete, onNext, quizUnlocked }) {
  const vidRef = useRef(null);

  const handleEnded = () => {
    onComplete();
  };

  return (
    <div className="glass-card fade-in">
      <h2>1. Watch the Story</h2>
      <p style={{ marginBottom: '1rem', opacity: 0.8 }}>Meet Sunny the Sun and the rest of the Solar System family!</p>

      <div className="video-wrapper">
        <video
          ref={vidRef}
          controls
          onEnded={handleEnded}
          src="/meet_planets.mp4"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {quizUnlocked && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>Video complete! You unlocked the quiz.</p>
          <button className="btn-primary" onClick={onNext}>Start Quiz Now →</button>
        </div>
      )}
    </div>
  );
}

function QuizSection({ onPass, onNext, playSound }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      id: 0,
      text: "Who is the leader of the Solar System in the story?",
      options: ["Jupiter", "Earth", "Sunny the Sun", "Mars"],
      correctIndex: 2
    },
    {
      id: 1,
      text: "Which planet is the closest to the Sun?",
      options: ["Neptune", "Mercury", "Venus", "Uranus"],
      correctIndex: 1
    },
    {
      id: 2,
      text: "Which planet has thick clouds that trap heat?",
      options: ["Saturn", "Venus", "Mars", "Earth"],
      correctIndex: 1
    },
    {
      id: 3,
      text: "Which planet has a giant storm called the Great Red Spot?",
      options: ["Jupiter", "Pluto", "Earth", "Neptune"],
      correctIndex: 0
    },
    {
      id: 4,
      text: "What does the Moon do in the story?",
      options: ["Lights up the Sun", "Orbits around Mars", "Goes around Earth", "Spins around Jupiter"],
      correctIndex: 2
    }
  ];

  const handleSelect = (qId, optionIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    playSound("click");
  };

  const handleSubmit = () => {
    // Validate all answered
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions first!");
      return;
    }

    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) correctCount++;
    });

    setScore(correctCount);
    setSubmitted(true);

    if (correctCount >= 3) {
      onPass();
    } else {
      playSound("error");
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>2. Space Quiz</h2>
        {submitted && <h3 style={{ color: score >= 3 ? 'var(--success)' : 'var(--error)' }}>Score: {score}/5</h3>}
      </div>

      <div className="quiz-container">
        {questions.map((q, i) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctIndex;

          return (
            <div key={q.id} className="question-card">
              <h3>Q{i + 1}: {q.text}</h3>
              <div className="options-list">
                {q.options.map((opt, oIdx) => {
                  let className = "option-label";
                  if (submitted) {
                    if (oIdx === q.correctIndex) className += " correct-opt";
                    else if (userAnswer === oIdx) className += " wrong-opt";
                  }

                  return (
                    <label key={oIdx} className={className} style={{
                      background: submitted && oIdx === q.correctIndex ? 'rgba(74, 222, 128, 0.2)' :
                        submitted && userAnswer === oIdx && userAnswer !== q.correctIndex ? 'rgba(251, 113, 133, 0.2)' : ''
                    }}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={userAnswer === oIdx}
                        onChange={() => handleSelect(q.id, oIdx)}
                        disabled={submitted}
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {!submitted && (
          <button className="btn-primary" onClick={handleSubmit}>Submit Answers</button>
        )}

        {submitted && score < 3 && (
          <button className="btn-primary" style={{ filter: 'grayscale(1)' }} onClick={resetQuiz}>Try Again</button>
        )}

        {submitted && score >= 3 && (
          <button className="btn-primary" onClick={onNext}>Play Games! →</button>
        )}
      </div>
    </div>
  );
}

function GameMenu({ onSelectGame }) {
  return (
    <div className="glass-card" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem' }}>Solar Arcade</h2>
      <div className="game-grid">

        <div className="game-card g-sorter" onClick={() => onSelectGame('sorter')}>
          <div className="icon">☀️</div>
          <div className="game-details">
            <h3>Size Sorter</h3>
            <p>Order the planets!</p>
          </div>
        </div>

        <div className="game-card g-catch" onClick={() => onSelectGame('quest')}>
          <div className="icon">🚀</div>
          <div className="game-details">
            <h3>Space Quest</h3>
            <p>Explore the Galaxy!</p>
          </div>
        </div>

        <div className="game-card g-jump" onClick={() => onSelectGame('jigsaw')}>
          <div className="icon">🧩</div>
          <div className="game-details">
            <h3>Planet Puzzle</h3>
            <p>Piece it together</p>
          </div>
        </div>

        <div className="game-card g-dodge" onClick={() => onSelectGame('drag')}>
          <div className="icon">🌌</div>
          <div className="game-details">
            <h3>Orbit Order</h3>
            <p>Arrange the planets</p>
          </div>
        </div>

      </div>

      <style>{`
        .icon { font-size: 4rem; margin-bottom: auto; transition: transform 0.3s; }
        .game-card:hover .icon { transform: scale(1.2) rotate(10deg); }
      `}</style>
    </div>
  );
}

function SpaceSorterGame({ onBack, playSound }) {
  const [planets, setPlanets] = useState([]);
  const [message, setMessage] = useState("Tap the LARGEST planet!");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generateLevel();
  }, []);

  const generateLevel = () => {
    const definitions = [
      { size: 'planet-sm', label: 'Small', correct: false },
      { size: 'planet-md', label: 'Med', correct: false },
      { size: 'planet-lg', label: 'Big', correct: true },
    ];
    const shuffled = [...definitions].sort(() => Math.random() - 0.5);
    setPlanets(shuffled);
    setMessage("Tap the LARGEST planet!");
  };

  const handlePlanetClick = (isCorrect) => {
    if (isCorrect) {
      playSound("success");
      setMessage("Great Job! 🎉");
      setStreak(s => s + 1);
      setTimeout(generateLevel, 1000);
    } else {
      playSound("error");
      setMessage("Oops! Try again.");
      setStreak(0);
    }
  };

  return (
    <div className="glass-card sorter-stage">
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>← Back</button>
        <span style={{ opacity: 0.6 }}>Streak: {streak}</span>
      </div>

      <h2>Planet Sizer</h2>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', minHeight: '2rem' }}>{message}</p>

      <div className="planet-row">
        {planets.map((p, i) => (
          <button
            key={i}
            className={`planet-btn ${p.size}`}
            onClick={(e) => {
              e.currentTarget.style.transform = "scale(0.9)";
              setTimeout(() => e.currentTarget.style.transform = "scale(1)", 100);
              handlePlanetClick(p.correct);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

    </div>
  );
}
