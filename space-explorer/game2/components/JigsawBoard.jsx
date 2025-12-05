import React, { useEffect, useRef, useState } from "react";

/**
 * src/components/JigsawBoard.jsx
 *
 * - Procedural "slightly realistic" Earth, Mars, Jupiter renderers (no external images).
 * - 3 rounds. Pieces are sliced from the generated image using an off-screen canvas.
 * - Snapping rules: overlap >= 75% OR piece-center inside slot OR within magnet distance.
 * - Hint toggle shows faint full-planet image inside the board.
 *
 * Paste this file into src/components/JigsawBoard.jsx (overwrite).
 */

const GRID = 3; // 3x3 pieces = kid-friendly
const OVERLAP_THRESHOLD = 0.75;
const MAGNET_DISTANCE = 36; // px
const SNAP_TOLERANCE = 24; // px fallback

// -------------------- Utilities --------------------
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

// -------------------- Planet renderers --------------------
// All renderers produce a square canvas dataURL.

function drawEarth(size = 700) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");

  // background (space)
  ctx.fillStyle = "#02061a";
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  // Atmospheric faint halo
  const atm = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r * 1.3);
  atm.addColorStop(0, "rgba(100,170,255,0.06)");
  atm.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = atm;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Ocean base gradient
  const ocean = ctx.createRadialGradient(cx - r * 0.18, cy - r * 0.12, r * 0.12, cx, cy, r * 1.05);
  ocean.addColorStop(0, "#cfeeff");
  ocean.addColorStop(0.35, "#4bb5e4");
  ocean.addColorStop(1, "#0c507f");
  ctx.fillStyle = ocean;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Gentle ocean streaks (curved thin lines)
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.8;
  for (let i = 0; i < 12; i++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.006 + Math.random() * 0.018})`;
    ctx.beginPath();
    const ang = 0.6 + Math.random() * 1.4;
    ctx.arc(cx - r * 0.02, cy - r * 0.02 + i * (r / 24), r * (0.96 - i * 0.006), ang, Math.PI * 2 - ang);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Continent blobs (layered)
  function land(cxOff, cyOff, sX, sY, colorA, colorB) {
    const grad = ctx.createLinearGradient(cx + cxOff - 30, cy + cyOff - 30, cx + cxOff + 30, cy + cyOff + 30);
    grad.addColorStop(0, colorA);
    grad.addColorStop(1, colorB);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx + cxOff, cy + cyOff, r * sX, r * sY, Math.random() * 0.6 - 0.3, 0, Math.PI * 2);
    ctx.fill();

    // subtle darker patch for depth
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.ellipse(cx + cxOff + r * 0.06, cy + cyOff + r * 0.04, r * (sX * 0.36), r * (sY * 0.22), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  land(-r * 0.14, -r * 0.02, 0.40, 0.26, "#3aa25a", "#1f6b34");
  land(r * 0.24, r * 0.18, 0.22, 0.15, "#2f8a47", "#1e6a34");
  land(-r * 0.30, r * 0.28, 0.12, 0.08, "#3a9c54", "#2a6e39");

  // sandy tiny highlight
  ctx.fillStyle = "rgba(255,235,190,0.18)";
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.34, cy + r * 0.24, r * 0.06, r * 0.03, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // add grain/texture
  texturedNoise(ctx, cx, cy, r, () => {
    if (Math.random() < 0.6) return `rgba(10,35,60,${0.01 + Math.random() * 0.06})`;
    return `rgba(10,60,30,${0.01 + Math.random() * 0.04})`;
  }, 1200);

  // Soft cloud layer (overlapping semi-translucent ellipses)
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.3})`;
    const a = Math.random() * Math.PI * 2;
    const rr = r * (0.25 + Math.random() * 0.5);
    const x = cx + Math.cos(a) * rr * (0.6 + Math.random() * 0.4);
    const y = cy + Math.sin(a) * rr * (0.45 + Math.random() * 0.4);
    const rx = r * (0.12 + Math.random() * 0.16);
    const ry = r * (0.05 + Math.random() * 0.10);
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.ellipse(x + (Math.random() - 0.5) * rx * 0.6, y + (Math.random() - 0.5) * ry * 0.5, rx * (0.6 + Math.random() * 0.8), ry * (0.5 + Math.random()), Math.random() * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // bright specular / sun glint
  const spec = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.32, r * 0.02, cx - r * 0.15, cy - r * 0.08, r * 0.9);
  spec.addColorStop(0, "rgba(255,255,255,0.92)");
  spec.addColorStop(0.12, "rgba(255,255,255,0.18)");
  spec.addColorStop(1, "rgba(255,255,255,0.0)");
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // rim stroke for slight atmosphere
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  return c.toDataURL();
}

function drawMars(size = 700) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#020114";
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  // dusty gradient
  const g = ctx.createRadialGradient(cx - r * 0.08, cy - r * 0.08, r * 0.02, cx, cy, r * 1.05);
  g.addColorStop(0, "#ffb786");
  g.addColorStop(0.4, "#d35f3d");
  g.addColorStop(1, "#8e3b2c");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // terrain bands
  for (let i = -5; i <= 5; i++) {
    ctx.fillStyle = `rgba(90,30,25,${0.06 + Math.abs(i) * 0.02})`;
    ctx.beginPath();
    const y = cy + (i / 6) * r * 0.9;
    ctx.ellipse(cx, y, r * 0.95, r * (0.08 + Math.abs(i) * 0.01), (Math.random() * 0.08), 0, Math.PI * 2);
    ctx.fill();
  }

  // crater dots
  for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = r * (0.05 + Math.random() * 0.85);
    const x = cx + Math.cos(a) * rr * 0.78;
    const y = cy + Math.sin(a) * rr * 0.78;
    const cr = 4 + Math.random() * 18;
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.beginPath();
    ctx.ellipse(x + cr * 0.30, y + cr * 0.30, cr * 1.1, cr * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.ellipse(x - cr * 0.22, y - cr * 0.22, cr * 0.9, cr * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // dust texture
  texturedNoise(ctx, cx, cy, r, () => `rgba(120,40,30,${0.02 + Math.random() * 0.06})`, 1100);

  // rim & spec
  const spec = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.3, r * 0.02, cx - r * 0.08, cy - r * 0.06, r * 0.9);
  spec.addColorStop(0, "rgba(255,255,255,0.86)");
  spec.addColorStop(0.18, "rgba(255,255,255,0.12)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,0.10)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  return c.toDataURL();
}

function drawJupiter(size = 700) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#02030a";
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;

  // base band gradient
  const base = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  base.addColorStop(0, "#f3c48b");
  base.addColorStop(0.5, "#d99a6b");
  base.addColorStop(1, "#b06a3a");
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // band layering
  for (let i = -7; i <= 7; i++) {
    const yf = cy + (i / 7) * r * 0.9;
    ctx.fillStyle = `rgba(60,35,20,${0.04 + Math.random() * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(cx, yf, r * (0.94 - Math.abs(i) * 0.006), r * (0.06 + Math.abs(i) * 0.01), Math.random() * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.01 + Math.random() * 0.03})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx, yf + Math.random() * 2, r * 0.92, r * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // "Great spot" oval
  ctx.fillStyle = "#b05a3f";
  ctx.beginPath();
  ctx.ellipse(cx + r * 0.23, cy + r * 0.1, r * 0.16, r * 0.09, 0.42, 0, Math.PI * 2);
  ctx.fill();

  texturedNoise(ctx, cx, cy, r, () => `rgba(70,45,28,${0.02 + Math.random() * 0.05})`, 1200);

  // specular & rim
  const spec = ctx.createRadialGradient(cx - r * 0.36, cy - r * 0.26, r * 0.02, cx - r * 0.05, cy - r * 0.05, r * 0.9);
  spec.addColorStop(0, "rgba(255,255,255,0.82)");
  spec.addColorStop(0.12, "rgba(255,255,255,0.14)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  return c.toDataURL();
}

// -------------------- Rounds --------------------
const ROUNDS = [
  { name: "Earth", draw: drawEarth },
  { name: "Mars", draw: drawMars },
  { name: "Jupiter", draw: drawJupiter },
];

// -------------------- Jigsaw component --------------------

export default function JigsawBoard() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [pieces, setPieces] = useState([]); // piece objects: {id,img,correctX,correctY,x,y,w,h,placed}
  const [boardSize, setBoardSize] = useState(420);
  const [roundComplete, setRoundComplete] = useState(false);
  const [currentImageDataUrl, setCurrentImageDataUrl] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const draggingRef = useRef(null);
  const containerRef = useRef(null);

  // slice image (dataURL or URL) into grid pieces
  function sliceImageDataUrl(dataUrlOrUrl, grid = GRID) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // safe for local dataURLs or /public assets; needed for some remote hosts
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const pieceW = Math.floor(size / grid);
        const pieceH = Math.floor(size / grid);
        const created = [];
        for (let r = 0; r < grid; r++) {
          for (let c = 0; c < grid; c++) {
            const sx = c * pieceW;
            const sy = r * pieceH;
            const canvas = document.createElement("canvas");
            canvas.width = pieceW;
            canvas.height = pieceH;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, sx, sy, pieceW, pieceH, 0, 0, pieceW, pieceH);
            const d = canvas.toDataURL();
            created.push({
              id: r * grid + c,
              img: d,
              correctX: c * pieceW,
              correctY: r * pieceH,
              x: 460 + Math.random() * 160,
              y: 20 + Math.random() * (boardSize - pieceH - 40),
              w: pieceW,
              h: pieceH,
              placed: false,
            });
          }
        }
        resolve({ pieces: created, pieceW, pieceH, size });
      };
      img.onerror = (err) => reject(err);
      img.src = dataUrlOrUrl;
    });
  }

  // load a round: generate image via draw() then slice it
  async function loadRound(idx) {
    setRoundComplete(false);
    const round = ROUNDS[idx];
    const dataUrl = round.draw(700); // generate 700px square image
    setCurrentImageDataUrl(dataUrl);
    const size = 700;
    const pieceW = Math.floor(Math.min(size, size) / GRID);
    setBoardSize(pieceW * GRID);

    try {
      const result = await sliceImageDataUrl(dataUrl, GRID);
      setPieces(result.pieces);
    } catch (err) {
      console.error("Failed to slice image:", err);
      setPieces([]);
    }
  }

  useEffect(() => {
    loadRound(roundIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex]);

  // pointer handlers
  function onPointerDown(e, id) {
    e.preventDefault();
    const { clientX, clientY } = e;
    draggingRef.current = { id, offsetX: clientX, offsetY: clientY };

    // bring to top
    setPieces(prev => {
      const found = prev.find(p => p.id === id);
      const others = prev.filter(p => p.id !== id);
      return [...others, found];
    });

    try { e.target.setPointerCapture(e.pointerId); } catch {}
  }

  function onPointerMove(e) {
    if (!draggingRef.current) return;
    const { clientX, clientY } = e;
    const drag = draggingRef.current;
    const dx = clientX - drag.offsetX;
    const dy = clientY - drag.offsetY;

    setPieces(prev =>
      prev.map(p =>
        p.id === drag.id && !p.placed ? { ...p, x: p.x + dx, y: p.y + dy } : p
      )
    );

    draggingRef.current = { ...drag, offsetX: clientX, offsetY: clientY };
  }

  function intersectionArea(a, b) {
    const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return xOverlap * yOverlap;
  }

  // onPointerUp -> check snapping criteria (overlap fraction, center-in-cell, magnet distance)
  function onPointerUp(e) {
    if (!draggingRef.current) return;
    const drag = draggingRef.current;
    draggingRef.current = null;

    const draggedPiece = pieces.find(p => p.id === drag.id);
    if (!draggedPiece) return;

    const boardRect = containerRef.current?.getBoundingClientRect();
    const pieceElem = document.getElementById(`piece-img-${draggedPiece.id}`);
    const pieceRect = pieceElem?.getBoundingClientRect();

    if (boardRect && pieceRect) {
      const slotLeft = boardRect.left + draggedPiece.correctX;
      const slotTop = boardRect.top + draggedPiece.correctY;
      const slotRect = {
        left: slotLeft,
        top: slotTop,
        right: slotLeft + draggedPiece.w,
        bottom: slotTop + draggedPiece.h,
        width: draggedPiece.w,
        height: draggedPiece.h,
      };

      const inter = intersectionArea(pieceRect, slotRect);
      const slotArea = draggedPiece.w * draggedPiece.h;
      const frac = inter / slotArea;

      const pieceCenter = { x: pieceRect.left + pieceRect.width / 2, y: pieceRect.top + pieceRect.height / 2 };
      const centerInside = pieceCenter.x >= slotRect.left && pieceCenter.x <= slotRect.right && pieceCenter.y >= slotRect.top && pieceCenter.y <= slotRect.bottom;
      const slotCenter = { x: slotRect.left + slotRect.width / 2, y: slotRect.top + slotRect.height / 2 };
      const dist = Math.hypot(pieceCenter.x - slotCenter.x, pieceCenter.y - slotCenter.y);

      if (frac >= OVERLAP_THRESHOLD || centerInside || dist <= MAGNET_DISTANCE) {
        // snap into exact slot coordinates (board-relative)
        setPieces(prev => prev.map(p => (p.id === draggedPiece.id ? { ...p, x: p.correctX, y: p.correctY, placed: true } : p)));
      } else {
        setPieces(prev => prev.map(p => p));
      }
    } else {
      // fallback numeric snap
      setPieces(prev =>
        prev.map(p => {
          if (p.id !== draggedPiece.id || p.placed) return p;
          const dx = Math.abs(p.x - p.correctX);
          const dy = Math.abs(p.y - p.correctY);
          if (dx <= SNAP_TOLERANCE && dy <= SNAP_TOLERANCE) {
            return { ...p, x: p.correctX, y: p.correctY, placed: true };
          }
          return p;
        })
      );
    }

    // check completion shortly after state update
    setTimeout(() => {
      setPieces(curr => {
        const all = curr.length > 0 && curr.every(pp => pp.placed);
        setRoundComplete(all);
        return curr;
      });
    }, 30);

    try { e.target.releasePointerCapture?.(e.pointerId); } catch {}
  }

  function scrambleRound() {
    setPieces(prev => prev.map(p => ({ ...p, x: 460 + Math.random() * 160, y: 20 + Math.random() * (boardSize - p.h - 40), placed: false })));
    setRoundComplete(false);
  }

  function handleNextRound() {
    if (roundIndex < ROUNDS.length - 1) {
      setRoundIndex(prev => prev + 1);
    } else {
      setPieces([]);
      setRoundComplete(false);
    }
  }

  useEffect(() => {
    if (pieces.length === 0) return;
    const all = pieces.every(p => p.placed);
    setRoundComplete(all);
  }, [pieces]);

  // -------------------- Render --------------------
  return (
    <div style={{ paddingTop: 12, display: "flex", gap: 18, justifyContent: "center", alignItems: "flex-start" }}>
      {/* Board */}
      <div
        ref={containerRef}
        style={{
          width: boardSize,
          height: boardSize,
          position: "relative",
          background: "#fff",
          borderRadius: 12,
          border: "4px solid #eee",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* ghost hint */}
        {showHint && currentImageDataUrl && (
          <img
            src={currentImageDataUrl}
            alt="hint"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.14,
              pointerEvents: "none",
            }}
          />
        )}

        {/* grid guides */}
        {Array.from({ length: GRID }).map((_, r) =>
          Array.from({ length: GRID }).map((_, c) => {
            const cellW = boardSize / GRID;
            return (
              <div
                key={`cell-${r}-${c}`}
                style={{
                  position: "absolute",
                  left: c * cellW,
                  top: r * cellW,
                  width: cellW,
                  height: cellW,
                  boxSizing: "border-box",
                  border: "1px dashed rgba(0,0,0,0.03)",
                  pointerEvents: "none",
                }}
              />
            );
          })
        )}

        {/* placed pieces (locked) */}
        {pieces
          .filter(p => p.placed)
          .map(p => (
            <img
              key={`placed-${p.id}`}
              src={p.img}
              alt={`p-${p.id}`}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: p.w,
                height: p.h,
                borderRadius: 6,
                boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
                pointerEvents: "none",
              }}
            />
          ))}
      </div>

      {/* staging area */}
      <div style={{ width: 280, minHeight: boardSize, position: "relative" }}>
        <div style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <strong style={{ fontSize: 16 }}>{ROUNDS[roundIndex]?.name ?? "Finished!"}</strong>

          <button onClick={() => setShowHint(s => !s)} style={{ marginLeft: 8, padding: "6px 10px", borderRadius: 8, border: "none", background: showHint ? "#dbeafe" : "#f0f0f0", cursor: "pointer" }}>
            {showHint ? "Hide Hint" : "Show Hint"}
          </button>

          <button onClick={scrambleRound} style={{ marginLeft: 8, padding: "6px 10px", borderRadius: 8, border: "none", background: "#f0f0f0", cursor: "pointer" }}>
            Scramble
          </button>

          <div style={{ marginLeft: "auto", color: "#666", fontSize: 13 }}>
            Round {roundIndex + 1} / {ROUNDS.length}
          </div>
        </div>

        {pieces.length === 0 && roundIndex >= ROUNDS.length && (
          <div style={{ padding: 12 }}>🎉 You finished all rounds! Great job.</div>
        )}

        {pieces.length === 0 && roundIndex < ROUNDS.length && (
          <div style={{ padding: 12 }}>Preparing round...</div>
        )}

        {/* non-placed pieces (draggable) */}
        {pieces
          .filter(p => !p.placed)
          .map(piece => (
            <img
              id={`piece-img-${piece.id}`}
              key={piece.id}
              src={piece.img}
              alt={`piece-${piece.id}`}
              draggable={false}
              onPointerDown={e => onPointerDown(e, piece.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{
                position: "absolute",
                left: piece.x,
                top: piece.y,
                width: piece.w,
                height: piece.h,
                borderRadius: 6,
                boxShadow: "0 8px 18px rgba(0,0,0,0.14)",
                cursor: "grab",
                touchAction: "none",
                userSelect: "none",
              }}
            />
          ))}
      </div>

      {/* floating controls */}
      <div style={{ position: "fixed", right: 18, bottom: 18, textAlign: "right" }}>
        {roundComplete && roundIndex < ROUNDS.length && pieces.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 6, fontWeight: 700 }}>Round complete!</div>
            <button
              onClick={handleNextRound}
              style={{ padding: "10px 14px", background: "#18a0fb", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}
            >
              Next Round
            </button>
          </div>
        )}

        {!roundComplete && pieces.length > 0 && (
          <div style={{ background: "#fff", padding: 10, borderRadius: 10, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, color: "#444", marginBottom: 6 }}>Place all {GRID * GRID} pieces to complete the round.</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Snap: {Math.round(OVERLAP_THRESHOLD * 100)}% overlap OR center inside OR within {MAGNET_DISTANCE}px.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
