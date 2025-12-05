import { useEffect } from "react";

export default function Rocket() {

  useEffect(() => {

    // ------------------ Configurable content ------------------
    const VIDEO_SRC = "v1.mp4";
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
          "B) So they don’t float away",
          "C) Because the room is cold",
          "D) Because it’s more comfortable"
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

    // ------------------ DOM refs ------------------
    const videoEl = document.getElementById("lessonVideo");
    const videoSource = document.getElementById("videoSource");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const replayBtn = document.getElementById("replayBtn");
    const quizSection = document.getElementById("quizSection");
    const quizContainer = document.getElementById("quizContainer");
    const submitQuizBtn = document.getElementById("submitQuizBtn");
    const restartQuizBtn = document.getElementById("restartQuizBtn");
    const quizWarn = document.getElementById("quizWarn");
    const quizUnlockBackdrop = document.getElementById("quizUnlockBackdrop");
    const startQuizBtn = document.getElementById("startQuizBtn");
    const closeUnlock = document.getElementById("closeUnlock");
    const resultsBackdrop = document.getElementById("resultsBackdrop");
    const resultsText = document.getElementById("resultsText");
    const resultsReplayVideo = document.getElementById("resultsReplayVideo");
    const resultsRestartQuiz = document.getElementById("resultsRestartQuiz");
    const playGameBtn = document.getElementById("playGameBtn");
    const closeResults = document.getElementById("closeResults");
    const gameSection = document.getElementById("gameSection");
    const planetRow = document.getElementById("planetRow");
    const playAgainBtn = document.getElementById("playAgainBtn");
    const gameMessage = document.getElementById("gameMessage");
    const replayVideoLink = document.getElementById("replayVideoLink");
    const replayVideoTop = document.getElementById("replayVideoTop");
    const restartQuizTop = document.getElementById("restartQuizTop");
    const skipGameTop = document.getElementById("skipGameTop");
    const videoSection = document.getElementById("videoSection");
    const liveRegion = document.getElementById("liveRegion");

    // ------------------ Audio helpers ------------------
    const AudioFX = (() => {
      let ctx;
      const safeCtx = () => {
        try {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          return ctx;
        } catch {
          return null;
        }
      };
      function tone(freq, dur = 0.2, vol = 0.1) {
        const c = safeCtx();
        if (!c) return;
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
        success() {
          tone(800, 0.25, 0.12);
          tone(1000, 0.25, 0.08);
        },
        gentle() {
          tone(400, 0.3, 0.08);
        }
      };
    })();

    // ------------------ Modal helpers ------------------
    const showModal = (b) => {
      b.classList.add("show");
      b.querySelector(".modal").classList.add("show");
      b.setAttribute("aria-hidden", "false");
    };
    const hideModal = (b) => {
      b.classList.remove("show");
      b.querySelector(".modal").classList.remove("show");
      b.setAttribute("aria-hidden", "true");
    };

    // ------------------ Video logic ------------------
    function initVideo() {
      videoSource.src = VIDEO_SRC;
      videoEl.load();
      playPauseBtn.addEventListener("click", () => {
        if (videoEl.paused) videoEl.play();
        else videoEl.pause();
      });
      replayBtn.addEventListener("click", replayVideo);
      replayVideoTop.addEventListener("click", replayVideo);
      replayVideoLink.addEventListener("click", replayVideo);
      resultsReplayVideo.addEventListener("click", () => {
        hideModal(resultsBackdrop);
        replayVideo();
      });
      videoEl.addEventListener("ended", () => {
        showModal(quizUnlockBackdrop);
      });
    }

    function replayVideo() {
      hideModal(quizUnlockBackdrop);
      hideModal(resultsBackdrop);
      quizSection.classList.add("hidden");
      gameSection.classList.add("hidden");
      videoSection.classList.remove("hidden");
      videoEl.currentTime = 0;
      videoEl.play();
      setLive("Replaying video");
    }

    // ------------------ Quiz logic ------------------
    function buildQuiz() {
      quizContainer.innerHTML = "";
      questions.forEach((q, qi) => {
        const qWrap = document.createElement("div");
        qWrap.className = "question";
        qWrap.innerHTML = `<h3>${q.text}</h3>`;
        const opts = document.createElement("div");
        opts.className = "options";
        q.options.forEach((opt, oi) => {
          const id = `q${qi}_opt${oi}`;
          const label = document.createElement("label");
          label.className = "option";
          label.setAttribute("for", id);
          label.innerHTML = `
            <input type="radio" id="${id}" name="q${qi}" value="${oi}">
            <span>${opt}</span>`;
          opts.appendChild(label);
        });
        qWrap.appendChild(opts);
        quizContainer.appendChild(qWrap);
      });
    }

    function startQuiz() {
      hideModal(quizUnlockBackdrop);
      quizSection.classList.remove("hidden");
      videoSection.classList.add("hidden");
      gameSection.classList.add("hidden");
      setLive("Quiz started");
      buildQuiz();
      quizWarn.textContent = "";
      focusFirstInput();
    }

    function focusFirstInput() {
      const first = quizContainer.querySelector("input[type=radio]");
      if (first) first.focus();
    }

    function validateQuiz() {
      let all = true;
      quizWarn.textContent = "";
      document.querySelectorAll(".option").forEach(o => o.classList.remove("unanswered"));
      questions.forEach((_, qi) => {
        const sel = document.querySelector(`input[name="q${qi}"]:checked`);
        if (!sel) {
          all = false;
          const opts = document.querySelectorAll(`input[name="q${qi}"]`);
          opts.forEach(inp => inp.parentElement.classList.add("unanswered"));
        }
      });
      if (!all) quizWarn.textContent = "Please answer all questions!";
      return all;
    }

    function calculateScore() {
      let score = 0;
      questions.forEach((q, qi) => {
        const sel = document.querySelector(`input[name="q${qi}"]:checked`);
        if (sel && Number(sel.value) === q.correct) score++;
      });
      return score;
    }

    function showResults(score) {
      const msg =
        score >= 3
          ? `You scored ${score} out of 5! Great job!`
          : `You scored ${score} out of 5. Nice try — you can try again!`;
      resultsText.textContent = msg;
      showModal(resultsBackdrop);
      if (score >= 3) AudioFX.success();
      else AudioFX.gentle();
      setLive(msg);
    }

    function restartQuiz() {
      quizSection.classList.remove("hidden");
      gameSection.classList.add("hidden");
      videoSection.classList.add("hidden");
      buildQuiz();
      quizWarn.textContent = "";
      setLive("Quiz restarted");
      focusFirstInput();
    }

    // number keys to answer
    document.addEventListener("keydown", (e) => {
      const num = Number(e.key);
      if (num >= 1 && num <= 4) {
        const active = document.activeElement;
        const group = active && active.name ? active.name : null;
        if (group && group.startsWith("q")) {
          const target = document.querySelector(
            `input[name="${group}"][value="${num - 1}"]`
          );
          if (target) target.checked = true;
        }
      }
    });

    // ------------------ Game logic ------------------
    function startGame() {
      quizSection.classList.add("hidden");
      videoSection.classList.add("hidden");
      gameSection.classList.remove("hidden");
      resetGame();
      setLive("Game started");
    }

    function resetGame() {
      gameMessage.textContent = "";
      planetRow.innerHTML = "";
      const shuffled = shuffle([...GAME_PLANETS]);
      shuffled.forEach((p) => {
        const div = document.createElement("button");
        div.className = `planet ${p.size}`;
        div.style.background = p.color;
        div.textContent = p.label;
        div.addEventListener("click", () => handlePlanetClick(p, div));
        div.addEventListener("touchstart", () => handlePlanetClick(p, div), {
          passive: true,
        });
        planetRow.appendChild(div);
      });
    }

    function handlePlanetClick(planet, el) {
      const correct = planet.size === "big";
      if (correct) {
        el.classList.remove("wrong");
        el.classList.add("correct");
        gameMessage.style.color = "var(--good)";
        gameMessage.textContent = "Great job!";
        setLive("Great job!");
        AudioFX.success();
      } else {
        el.classList.remove("correct");
        el.classList.add("wrong");
        gameMessage.style.color = "var(--warn)";
        gameMessage.textContent = "Try again!";
        setLive("Try again");
        AudioFX.gentle();
      }
    }

    // ------------------ Utilities ------------------
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const setLive = (t) => (liveRegion.textContent = t);

    // ------------------ Wiring ------------------
    function init() {
      initVideo();
      buildQuiz();

      startQuizBtn.addEventListener("click", startQuiz);
      closeUnlock.addEventListener("click", () => hideModal(quizUnlockBackdrop));
      submitQuizBtn.addEventListener("click", () => {
        if (!validateQuiz()) return;
        const score = calculateScore();
        showResults(score);
      });

      restartQuizBtn.addEventListener("click", restartQuiz);
      restartQuizTop.addEventListener("click", restartQuiz);

      resultsRestartQuiz.addEventListener("click", () => {
        hideModal(resultsBackdrop);
        restartQuiz();
      });

      closeResults.addEventListener("click", () => hideModal(resultsBackdrop));
      playGameBtn.addEventListener("click", () => {
        hideModal(resultsBackdrop);
        startGame();
      });

      skipGameTop.addEventListener("click", startGame);
      playAgainBtn.addEventListener("click", resetGame);
    }

    init();
  }, []);

  return (
    <div>
      <div className="starfield"></div>

      <style>{`
        /* entire CSS preserved from original file */
        :root {
          --bg: radial-gradient(circle at 20% 20%, #1f2a5a, #0c0e2e 60%);
          --panel: rgba(255,255,255,0.07);
          --card: #1e2553;
          --text: #eef5ff;
          --accent: #7ce7ff;
          --accent-2: #c7a0ff;
          --good: #6cf0b6;
          --warn: #ffd36e;
          --bad: #ff8e8e;
          --button: linear-gradient(120deg, #5ecbff, #7b6dff);
          --button-2: linear-gradient(120deg, #ffb347, #ff7b7b);
          --star: rgba(255,255,255,0.5);
          --planet-small: #ff7f7f;
          --planet-med: #6fe3ff;
          --planet-large: #7cf5b3;
        }

        * { box-sizing: border-box; }
        body { margin:0; font-family:"Segoe UI", system-ui,sans-serif; }

        .starfield {
          position:fixed; inset:0; pointer-events:none;
          background-image:
            radial-gradient(1px 1px at 20% 30%, var(--star), transparent),
            radial-gradient(1.5px 1.5px at 70% 20%, var(--star), transparent),
            radial-gradient(1px 1px at 40% 80%, var(--star), transparent),
            radial-gradient(1.5px 1.5px at 80% 70%, var(--star), transparent);
          opacity:.5; animation: twinkle 8s linear infinite; z-index:0;
        }

        @keyframes twinkle {
          0%,100% {opacity:.45;} 
          50% {opacity:.65;}
        }

        button {
          cursor: pointer; border:none; border-radius:14px;
          padding:14px 18px; font-size:18px; font-weight:700;
          background: var(--button); 
          color:#fff; min-height:48px;
        }

        .ghost {background:transparent; border:2px solid var(--accent); color:var(--accent);}
        .secondary {background:var(--button-2);}

        .layout {max-width:1100px; margin:0 auto; padding:18px;}
        .card {
          background:var(--panel); padding:16px; border-radius:16px;
          box-shadow:0 10px 25px rgba(0,0,0,.3);
        }

        video {
          width:100%; max-width:900px; border-radius:16px;
          border:3px solid rgba(255,255,255,0.12);
        }

        .hidden {display:none;}
        .center {text-align:center;}

        .quiz {display:grid; gap:14px;}

        .question {
          padding:12px; background:var(--card);
          border-radius:14px;
        }

        .options {display:grid; gap:10px;}
        .option {
          display:flex; align-items:center; gap:12px;
          padding:10px 12px; border-radius:12px;
        }
        .option.unanswered {border:2px solid var(--warn);}

        .planet {
          border-radius:50%; display:grid; place-items:center;
          cursor:pointer;
        }
      `}</style>

      {/* JSX layout */}
      <div className="layout">
        <h1 className="center">Kids in Space: Watch, Quiz, Play!</h1>

        <div className="toolbar">
          <button id="replayVideoTop" className="ghost">Replay Video</button>
          <button id="restartQuizTop" className="ghost">Restart Quiz</button>
          <button id="skipGameTop" className="ghost">Skip to Game</button>
        </div>

        {/* VIDEO */}
        <section id="videoSection" className="card">
          <h2 className="center">1) Watch the Space Video</h2>
          <video id="lessonVideo" controls>
            <source id="videoSource" src="" type="video/mp4" />
          </video>
          <div className="controls-inline">
            <button id="playPauseBtn">Play / Pause</button>
            <button id="replayBtn" className="secondary">Replay Video</button>
          </div>
        </section>

        {/* QUIZ */}
        <section id="quizSection" className="card hidden">
          <h2 className="center">2) Quick Space Quiz</h2>
          <div id="quizContainer" className="quiz"></div>
          <div className="inline-warn" id="quizWarn"></div>
          <div className="submit-row">
            <button id="submitQuizBtn">Submit Answers</button>
            <button id="restartQuizBtn" className="ghost">Restart Quiz</button>
          </div>
        </section>

        {/* GAME */}
        <section id="gameSection" className="card hidden">
          <h2 className="center">3) Space Size Sorter Game</h2>
          <p className="center" id="gamePrompt">Click the biggest planet!</p>
          <div className="planets" id="planetRow"></div>
          <div className="controls-inline">
            <button id="playAgainBtn" className="secondary">Play Again</button>
            <button id="replayVideoLink" className="ghost">Replay Video</button>
          </div>
          <div className="inline-warn" id="gameMessage"></div>
        </section>

      </div>

      {/* MODALS */}
      <div className="modal-backdrop" id="quizUnlockBackdrop">
        <div className="modal">
          <button className="close-btn" id="closeUnlock">✕</button>
          <h2>Great! Ready for a short quiz?</h2>
          <p>Click start to try 5 quick questions.</p>
          <div className="controls-inline">
            <button id="startQuizBtn">Start Quiz</button>
          </div>
        </div>
      </div>

      <div className="modal-backdrop" id="resultsBackdrop">
        <div className="modal">
          <button className="close-btn" id="closeResults">✕</button>
          <h2>Your score</h2>
          <p id="resultsText"></p>
          <div className="controls-inline">
            <button id="playGameBtn">Play the Game</button>
            <button id="resultsReplayVideo" className="ghost">Replay Video</button>
            <button id="resultsRestartQuiz" className="ghost">Restart Quiz</button>
          </div>
        </div>
      </div>

      <div id="liveRegion" style={{ display: "none" }}></div>
    </div>
  );
}
