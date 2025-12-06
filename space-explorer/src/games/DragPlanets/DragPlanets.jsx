import React, { useState, useEffect } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import './DragPlanets.css';

// PLANETS ARRAY
const PLANETS = [
    { id: "mercury", name: "Mercury", dist: 57.9, img: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg", fact: "Mercury is the smallest planet and closest to the Sun!" },
    { id: "venus", name: "Venus", dist: 108.2, img: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg", fact: "Venus is the hottest planet in our solar system." },
    { id: "earth", name: "Earth", dist: 149.6, img: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg", fact: "Earth is the only known planet to support life." },
    { id: "mars", name: "Mars", dist: 227.9, img: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg", fact: "Mars is known as the Red Planet due to rusty iron in the ground." },
    { id: "jupiter", name: "Jupiter", dist: 778.5, img: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg", fact: "Jupiter is the largest planet—so big that 1,300 Earths could fit inside!" },
    { id: "saturn", name: "Saturn", dist: 1433.5, img: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg", fact: "Saturn has the most spectacular ring system, made of ice and rock." },
    { id: "uranus", name: "Uranus", dist: 2872.5, img: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg", fact: "Uranus rotates on its side, making it roll like a ball around the Sun." },
    { id: "neptune", name: "Neptune", dist: 4495.1, img: "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg", fact: "Neptune is the windiest planet, with supersonic winds." },
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function DragPlanets({ onBack, playSound }) {
    const [items, setItems] = useState(() => shuffle(PLANETS));
    const [showAward, setShowAward] = useState(false);
    const [showFact, setShowFact] = useState(null);
    const [attempts, setAttempts] = useState(0);

    const checkOrder = () => {
        const correctOrder = PLANETS.map(p => p.id);
        const currentOrder = items.map(p => p.id);

        const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(currentOrder);

        if (isCorrect) {
            playSound && playSound("success");
            setShowAward(true);
        } else {
            playSound && playSound("error");
            setAttempts(a => a + 1);
        }
    };

    const handleReorder = (newOrder) => {
        setItems(newOrder);
        playSound && playSound("click");
    };

    return (
        <div className="drag-planets-app">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={onBack} className="btn-secondary">← Back</button>
                <div className="subtitle">Moves: {attempts}</div>
            </div>

            <h1>Planetary Architect</h1>
            <p className="subtitle">Arrange the planets from the Sun outwards!</p>

            <div className="dashboard-card">
                <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="planet-list-container">
                    {items.map((planet) => (
                        <Reorder.Item key={planet.id} value={planet} className="planet-reorder-item" whileDrag={{ scale: 1.05 }}>
                            <div className="planet-content">
                                <span className="drag-handle">☰</span>
                                <div className="planet-avatar" style={{ backgroundImage: `url(${planet.img})` }}></div>
                                <div className="planet-info">
                                    <h3>{planet.name}</h3>
                                    <p>{planet.dist} million km</p>
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                <div className="controls">
                    <button className="btn-check" onClick={checkOrder}>Check Order 🚀</button>
                    <button className="btn-secondary" onClick={() => setItems(shuffle(PLANETS))}>Shuffle 🔀</button>
                </div>
            </div>

            <AnimatePresence>
                {showAward && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                            <div className="award-badge">🏆</div>
                            <h2>Solar System Architect!</h2>
                            <p>You've successfully mapped the cosmos.</p>
                            <button className="btn-check" onClick={() => setShowAward(false)} style={{ margin: '0 auto' }}>Collect Badge</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
