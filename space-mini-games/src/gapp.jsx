// src/App.jsx
import React from "react";
import "./styles.css";
import DragPlanets from "./components/DragPlanets";

export default function App() {
  return (
    <div className="app" style={{ padding: 20 }}>
      <header style={{ maxWidth: 1100, margin: "0 auto 18px" }}>
        <h1 style={{ fontSize: 36, color: "#9fe8ff", margin: 0 }}>Space Mini-Games</h1>
        <p style={{ color: "#bcdff6", marginTop: 6 }}>
          Kids mode: fun and simple.
        </p>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto" }}>
        <DragPlanets />
      </main>
    </div>
  );
}
