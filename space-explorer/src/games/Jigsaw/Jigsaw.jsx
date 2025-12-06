import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced Jigsaw Game
 * Features:
 * - Particle effects on snap
 * - Data cards on round completion
 * - "Puzzle Master" award
 * - Improved visuals and animations
 */

const GRID = 3; // 3x3 pieces
const OVERLAP_THRESHOLD = 0.6; // More forgiving
const MAGNET_DISTANCE = 50; // Stronger magnet
const PARTICLES_COUNT = 20;

const COLORS = {
    background: '#0b1020',
    cardInit: '#1e293b',
    text: '#e2e8f0',
    accent: '#38bdf8',
    success: '#4ade80',
    gold: '#fbbf24'
};

// -------------------- Procedural Planet Generators --------------------

function texturedNoise(ctx, cx, cy, radius, colorFn, density = 700) {
    for (let i = 0; i < density; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = radius * Math.sqrt(Math.random()) * 0.95;
        const x = cx + Math.cos(a) * r * (0.8 + Math.random() * 0.4);
        const y = cy + Math.sin(a) * r * (0.8 + Math.random() * 0.4);
        const s = 0.35 + Math.random() * 1.6;
        ctx.fillStyle = colorFn ? colorFn() : `rgba(255,255,255,${0.02 + Math.random() * 0.06})`;
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEarth(size = 700) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");

    // Space background
    ctx.fillStyle = "#02061a";
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2, r = size * 0.42;

    // Atmosphere
    const atm = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r * 1.3);
    atm.addColorStop(0, "rgba(100,170,255,0.06)");
    atm.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2); ctx.fill();

    // Ocean
    const ocean = ctx.createRadialGradient(cx - r * 0.18, cy - r * 0.12, r * 0.12, cx, cy, r * 1.05);
    ocean.addColorStop(0, "#cfeeff");
    ocean.addColorStop(0.35, "#4bb5e4");
    ocean.addColorStop(1, "#0c507f");
    ctx.fillStyle = ocean;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    // Land
    function land(cxOff, cyOff, sX, sY, colorA, colorB) {
        const grad = ctx.createLinearGradient(cx + cxOff - 30, cy + cyOff - 30, cx + cxOff + 30, cy + cyOff + 30);
        grad.addColorStop(0, colorA); grad.addColorStop(1, colorB);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.ellipse(cx + cxOff, cy + cyOff, r * sX, r * sY, Math.random() * 0.6 - 0.3, 0, Math.PI * 2); ctx.fill();
    }
    land(-r * 0.14, -r * 0.02, 0.40, 0.26, "#3aa25a", "#1f6b34");
    land(r * 0.24, r * 0.18, 0.22, 0.15, "#2f8a47", "#1e6a34");

    // Clouds
    texturedNoise(ctx, cx, cy, r, () => `rgba(255,255,255,${0.1 + Math.random() * 0.2})`, 800);

    return c.toDataURL();
}

function drawMars(size = 700) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#020114";
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2, r = size * 0.42;

    const g = ctx.createRadialGradient(cx - r * 0.08, cy - r * 0.08, r * 0.02, cx, cy, r * 1.05);
    g.addColorStop(0, "#ffb786");
    g.addColorStop(0.4, "#d35f3d");
    g.addColorStop(1, "#8e3b2c");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    texturedNoise(ctx, cx, cy, r, () => `rgba(120,40,30,${0.02 + Math.random() * 0.06})`, 1100);

    return c.toDataURL();
}

function drawJupiter(size = 700) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");

    ctx.fillStyle = "#02030a";
    ctx.fillRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2, r = size * 0.44;

    const base = ctx.createLinearGradient(0, cy - r, 0, cy + r);
    base.addColorStop(0, "#f3c48b");
    base.addColorStop(0.5, "#d99a6b");
    base.addColorStop(1, "#b06a3a");
    ctx.fillStyle = base;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

    for (let i = -7; i <= 7; i++) {
        const yf = cy + (i / 7) * r * 0.9;
        ctx.fillStyle = `rgba(60,35,20,${0.04 + Math.random() * 0.06})`;
        ctx.beginPath(); ctx.ellipse(cx, yf, r * 0.94, r * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    }

    // Great Red Spot
    ctx.fillStyle = "#b05a3f";
    ctx.beginPath(); ctx.ellipse(cx + r * 0.23, cy + r * 0.1, r * 0.16, r * 0.09, 0.42, 0, Math.PI * 2); ctx.fill();

    return c.toDataURL();
}

const ROUNDS = [
    { name: "Earth", draw: drawEarth, fact: "Earth is the only planet with liquid water on its surface!" },
    { name: "Mars", draw: drawMars, fact: "Mars has the largest volcano in the solar system, Olympus Mons." },
    { name: "Jupiter", draw: drawJupiter, fact: "Jupiter is a gas giant with a Great Red Spot storm bigger than Earth!" },
];

// -------------------- Component --------------------

export default function Jigsaw({ onBack, playSound }) {
    const [roundIndex, setRoundIndex] = useState(0);
    const [pieces, setPieces] = useState([]);
    const [boardSize, setBoardSize] = useState(420);
    const [roundComplete, setRoundComplete] = useState(false);
    const [currentImageDataUrl, setCurrentImageDataUrl] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [showDataCard, setShowDataCard] = useState(false);
    const [showAward, setShowAward] = useState(false);
    const [particles, setParticles] = useState([]);

    const draggingRef = useRef(null);
    const containerRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    function createParticles(x, y) {
        const newParticles = Array.from({ length: PARTICLES_COUNT }).map((_, i) => ({
            id: Date.now() + i,
            x,
            y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: COLORS.accent
        }));
        setParticles(prev => [...prev, ...newParticles]);
    }

    // Particle animation loop
    useEffect(() => {
        let raf;
        const animate = () => {
            setParticles(prev => prev
                .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.05 }))
                .filter(p => p.life > 0)
            );
            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, []);

    function sliceImageDataUrl(dataUrl, grid = GRID) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const size = Math.min(img.width, img.height);
                const pieceW = Math.floor(size / grid);
                const pieceH = Math.floor(size / grid);
                const created = [];
                for (let r = 0; r < grid; r++) {
                    for (let c = 0; c < grid; c++) {
                        const canvas = document.createElement("canvas");
                        canvas.width = pieceW; canvas.height = pieceH;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, c * pieceW, r * pieceH, pieceW, pieceH, 0, 0, pieceW, pieceH);

                        created.push({
                            id: r * grid + c,
                            img: canvas.toDataURL(),
                            correctX: c * pieceW,
                            correctY: r * pieceH,
                            x: 480 + Math.random() * 150, // Initial scatter position
                            y: 50 + Math.random() * 300,
                            w: pieceW,
                            h: pieceH,
                            placed: false,
                        });
                    }
                }
                resolve({ pieces: created, pieceW });
            };
            img.src = dataUrl;
        });
    }

    async function loadRound(idx) {
        setRoundComplete(false);
        setShowDataCard(false);
        const round = ROUNDS[idx];
        const dataUrl = round.draw(700);
        setCurrentImageDataUrl(dataUrl);

        try {
            const { pieces, pieceW } = await sliceImageDataUrl(dataUrl, GRID);
            setPieces(pieces);
            setBoardSize(pieceW * GRID);
        } catch (e) { console.error(e); }
    }

    useEffect(() => { loadRound(roundIndex); }, [roundIndex]);

    // Drag Logic
    const handlePointerDown = (e, id) => {
        const piece = pieces.find(p => p.id === id);
        if (!piece || piece.placed) return;

        // Calculate offset from top-left of the piece
        const rect = e.target.getBoundingClientRect();
        dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        // Note: We track offset relative to the piece, but update position relative to the container.
        // For simplicity in this non-refactor, we'll stick to a simple delta tracking or absolute mapping.
        // Actually, let's map directly to container coordinates for smooth feel.

        const containerRect = containerRef.current.getBoundingClientRect();
        draggingRef.current = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            initialPieceX: piece.x,
            initialPieceY: piece.y,
            containerLeft: containerRect.left,
            containerTop: containerRect.top
        };

        setPieces(prev => [...prev.filter(p => p.id !== id), prev.find(p => p.id === id)]); // Bring to front
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!draggingRef.current) return;
        const { clientX, clientY } = e;
        const { id, startX, startY, initialPieceX, initialPieceY } = draggingRef.current;

        const dx = clientX - startX;
        const dy = clientY - startY;

        setPieces(prev => prev.map(p =>
            p.id === id ? { ...p, x: initialPieceX + dx, y: initialPieceY + dy } : p
        ));
    };

    const handlePointerUp = (e) => {
        if (!draggingRef.current) return;
        const { id } = draggingRef.current;
        draggingRef.current = null;

        const piece = pieces.find(p => p.id === id);
        if (!piece) return;

        // Snapping Logic
        // piece.x/y are relative to the container's internal reference usually.
        // If the container is effectively the reference frame.

        const dist = Math.hypot(piece.x - piece.correctX, piece.y - piece.correctY);

        if (dist < MAGNET_DISTANCE) {
            // SNAP!
            playSound && playSound('click'); // 'click' used for snap sound
            createParticles(piece.correctX + piece.w / 2, piece.correctY + piece.h / 2);

            setPieces(prev => prev.map(p =>
                p.id === id ? { ...p, x: p.correctX, y: p.correctY, placed: true } : p
            ));
        }
    };

    // Check completion
    useEffect(() => {
        if (pieces.length && pieces.every(p => p.placed)) {
            if (!roundComplete) {
                setRoundComplete(true);
                playSound && playSound('success');
                setTimeout(() => setShowDataCard(true), 800);
            }
        }
    }, [pieces]);

    const handleNext = () => {
        if (roundIndex < ROUNDS.length - 1) {
            setRoundIndex(prev => prev + 1);
        } else {
            setShowAward(true);
            playSound && playSound('success');
        }
    };

    return (
        <div className="jigsaw-app" style={{
            fontFamily: "'Outfit', sans-serif",
            color: COLORS.text,
            width: '100%',
            maxWidth: 1000,
            margin: '0 auto',
            padding: 24
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <button onClick={onBack} className="btn-secondary">← Back</button>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: COLORS.accent }}>
                    {ROUNDS[roundIndex]?.name} Puzzle
                </div>
            </div>

            <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
                {/* Board */}
                <div
                    ref={containerRef}
                    style={{
                        width: boardSize,
                        height: boardSize,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: `2px solid ${COLORS.accent}`,
                        borderRadius: 16,
                        position: 'relative',
                        boxShadow: `0 0 30px ${COLORS.accent}40`,
                        overflow: 'hidden' // Keep pieces inside? Or let them float out? Let's clip for neatness or handle drag bounds.
                        // Actually, overflowing pieces during drag is nice. Let's remove overflow hidden if possible, but the grid lines need it.
                        // We'll keep overflow hidden for the board area proper, and perhaps sidebar for pieces.
                    }}
                >
                    {/* Grid Lines */}
                    {Array.from({ length: GRID }).map((_, r) =>
                        Array.from({ length: GRID }).map((_, c) => (
                            <div key={`${r}-${c}`} style={{
                                position: 'absolute',
                                left: c * (boardSize / GRID),
                                top: r * (boardSize / GRID),
                                width: boardSize / GRID,
                                height: boardSize / GRID,
                                border: '1px dashed rgba(255,255,255,0.1)',
                                pointerEvents: 'none'
                            }} />
                        ))
                    )}

                    {/* Hint Image */}
                    {showHint && currentImageDataUrl && (
                        <img src={currentImageDataUrl} alt="Hint" style={{
                            position: 'absolute', opacity: 0.2, width: '100%', height: '100%', pointerEvents: 'none'
                        }} />
                    )}

                    {/* Pieces (Placed & Floating) - We render ALL here to simplify coordinate space */}
                    {pieces.map(p => (
                        <motion.img
                            key={p.id}
                            src={p.img}
                            animate={{
                                x: p.x,
                                y: p.y,
                                scale: p.placed ? 1 : 1.05,
                                zIndex: p.placed ? 1 : 10
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            onPointerDown={e => handlePointerDown(e, p.id)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            style={{
                                position: 'absolute',
                                width: p.w,
                                height: p.h,
                                cursor: p.placed ? 'default' : 'grab',
                                touchAction: 'none',
                                filter: p.placed ? 'brightness(1)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                            }}
                        />
                    ))}

                    {/* Particles */}
                    {particles.map(p => (
                        <div key={p.id} style={{
                            position: 'absolute',
                            left: p.x,
                            top: p.y,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: p.color,
                            opacity: p.life,
                            pointerEvents: 'none',
                            transform: 'translate(-50%, -50%)' // center
                        }} />
                    ))}
                </div>

                {/* Sidebar Controls */}
                <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{
                        background: COLORS.cardInit,
                        padding: 16,
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', color: COLORS.accent }}>Controls</h3>
                        <button
                            className="btn-glass"
                            onClick={() => setShowHint(!showHint)}
                            style={{ width: '100%', marginBottom: 8 }}
                        >
                            {showHint ? 'Hide Hint' : 'Show Hint 💡'}
                        </button>
                    </div>

                    <div style={{
                        background: COLORS.cardInit,
                        padding: 16,
                        borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#94a3b8' }}>Progress</h4>
                        <div style={{ height: 6, background: '#334155', borderRadius: 3 }}>
                            <div style={{
                                width: `${(pieces.filter(p => p.placed).length / (GRID * GRID)) * 100}%`,
                                height: '100%',
                                background: COLORS.success,
                                borderRadius: 3,
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Card Modal */}
            <AnimatePresence>
                {showDataCard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'grid', placeItems: 'center',
                            zIndex: 100,
                            backdropFilter: 'blur(5px)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            style={{
                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                padding: 40,
                                borderRadius: 24,
                                textAlign: 'center',
                                border: `1px solid ${COLORS.accent}`,
                                maxWidth: 500,
                                boxShadow: `0 0 50px ${COLORS.accent}40`,
                                color: 'white'
                            }}
                        >
                            <h2 style={{ color: COLORS.accent, fontSize: '2rem', marginTop: 0 }}>Planet Analyzed!</h2>
                            <div style={{ fontSize: '5rem', margin: '20px 0' }}>🪐</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: 10 }}>{ROUNDS[roundIndex].name}</h3>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#94a3b8' }}>
                                {ROUNDS[roundIndex].fact}
                            </p>
                            <button
                                onClick={() => { setShowDataCard(false); handleNext(); }}
                                style={{
                                    marginTop: 30,
                                    padding: '12px 32px',
                                    fontSize: '1.1rem',
                                    borderRadius: 12,
                                    background: `linear-gradient(90deg, ${COLORS.accent}, #2563eb)`,
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                                }}
                            >
                                Continue Mission 🚀
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Award Modal */}
            <AnimatePresence>
                {showAward && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.9)',
                            display: 'grid', placeItems: 'center',
                            zIndex: 100
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            style={{
                                textAlign: 'center',
                                color: 'white'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                style={{ fontSize: '8rem', marginBottom: 20 }}
                            >
                                🏆
                            </motion.div>
                            <h1 style={{
                                fontSize: '3.5rem',
                                background: `linear-gradient(to right, ${COLORS.gold}, #f59e0b)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: 0
                            }}>Puzzle Master!</h1>
                            <p style={{ fontSize: '1.4rem', color: '#94a3b8', marginTop: 16 }}>
                                You've assembled the solar system.
                            </p>
                            <button
                                onClick={onBack}
                                style={{
                                    marginTop: 40,
                                    padding: '16px 40px',
                                    fontSize: '1.2rem',
                                    borderRadius: 100,
                                    background: 'white',
                                    color: 'black',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Return to Base
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .btn-secondary {
                    background: rgba(255,255,255,0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-secondary:hover { background: rgba(255,255,255,0.2); }
                .btn-glass {
                    background: rgba(255,255,255,0.05);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-glass:hover { background: rgba(255,255,255,0.1); border-color: ${COLORS.accent}; }
            `}</style>
        </div>
    );
}
