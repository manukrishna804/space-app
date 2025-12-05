// src/components/DragPlanets.jsx
import React, { useState, useRef } from "react";

// PLANETS ARRAY (with images)
const PLANETS = [
  { name: "Mercury", dist: 57.9, img: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg" },
  { name: "Venus",   dist: 108.2, img: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg" },
  { name: "Earth",   dist: 149.6, img: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg" },
  { name: "Mars",    dist: 227.9, img: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg" },
  { name: "Jupiter", dist: 778.5, img: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg" },
  { name: "Saturn",  dist: 1433.5, img: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg" },
  { name: "Uranus",  dist: 2872.5, img: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg" },
  { name: "Neptune", dist: 4495.1, img: "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg" },
];

// Shuffle helper
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DragPlanets() {
  const [items, setItems] = useState(() => shuffle(PLANETS));
  const [msg, setMsg] = useState("");
  const dragIndex = useRef(null);

  function handleDragStart(e, index) {
    dragIndex.current = index;
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e, dropIndex) {
    e.preventDefault();
    const from = dragIndex.current ?? Number(e.dataTransfer.getData("text"));
    if (from === dropIndex) return;

    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);

    dragIndex.current = null;
    setItems(next);
  }

  function checkOrder() {
    const sorted = PLANETS.slice().sort((a, b) => a.dist - b.dist);
    const correct = items.every((p, i) => p.name === sorted[i].name);
    setMsg(correct ? "Perfect! Correct order 🚀" : "Not correct — try again!");
  }

  function reset() {
    setItems(shuffle(PLANETS));
    setMsg("");
  }

  function showCorrect() {
    setItems(PLANETS.slice().sort((a, b) => a.dist - b.dist));
    setMsg("Shown correct order.");
  }

  return (
    <div className="card">
      <div className="header">
        <h3>Drag Planets (closest to Sun → farthest)</h3>
        <div>
          <button className="btn" onClick={checkOrder}>Check</button>
          <button className="btn secondary" onClick={reset} style={{ marginLeft: 8 }}>Shuffle</button>
          <button className="btn" onClick={showCorrect} style={{ marginLeft: 8, background: "#2f855a" }}>Show Correct</button>
        </div>
      </div>

      <div
        className="drop-zone"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, items.length)}
      >
        {items.map((p, i) => (
          <div
            key={p.name}
            draggable
            className="planet"
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, i)}
            title={`Distance: ${p.dist} million km`}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <img
              src={p.img}
              alt={p.name}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 6px 12px rgba(0,0,0,0.4)",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong>{p.name}</strong>
              <div className="small">Distance: {p.dist} M km</div>
            </div>
          </div>
        ))}
      </div>

      <div className="feedback">{msg}</div>
    </div>
  );
}
