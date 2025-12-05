import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Check } from 'lucide-react';

const planets = [
  { name: 'Mercury', color: '#8C7853', size: 30, order: 1 },
  { name: 'Venus', color: '#FFC649', size: 36, order: 2 },
  { name: 'Earth', color: '#4A90E2', size: 38, order: 3 },
  { name: 'Mars', color: '#E27B58', size: 32, order: 4 },
  { name: 'Jupiter', color: '#C88B3A', size: 70, order: 5 },
  { name: 'Saturn', color: '#FAD5A5', size: 65, order: 6 },
  { name: 'Uranus', color: '#4FD0E7', size: 48, order: 7 },
  { name: 'Neptune', color: '#4166F5', size: 46, order: 8 }
];

export default function PlanetOrbitGame() {
  const [userOrder, setUserOrder] = useState(Array(8).fill(null));
  const [availablePlanets, setAvailablePlanets] = useState([]);
  const [draggedPlanet, setDraggedPlanet] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const shuffled = [...planets].sort(() => Math.random() - 0.5);
    setAvailablePlanets(shuffled);
    setUserOrder(Array(8).fill(null));
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const handleDragStart = (planet, fromOrbit, orbitIndex) => {
    setDraggedPlanet({ planet, fromOrbit, orbitIndex });
  };

  const handleDrop = (orbitIndex) => {
    if (!draggedPlanet) return;

    const newUserOrder = [...userOrder];
    const newAvailable = [...availablePlanets];

    if (draggedPlanet.fromOrbit) {
      newUserOrder[draggedPlanet.orbitIndex] = null;
    } else {
      const idx = newAvailable.findIndex(p => p.name === draggedPlanet.planet.name);
      newAvailable.splice(idx, 1);
    }

    if (newUserOrder[orbitIndex]) {
      newAvailable.push(newUserOrder[orbitIndex]);
    }

    newUserOrder[orbitIndex] = draggedPlanet.planet;

    setUserOrder(newUserOrder);
    setAvailablePlanets(newAvailable);
    setDraggedPlanet(null);
    setShowFeedback(false);
  };

  const handleReturnToAvailable = (orbitIndex) => {
    const planet = userOrder[orbitIndex];
    if (!planet) return;

    const newUserOrder = [...userOrder];
    newUserOrder[orbitIndex] = null;
    setUserOrder(newUserOrder);
    setAvailablePlanets([...availablePlanets, planet]);
    setShowFeedback(false);
  };

  const checkAnswer = () => {
    const correct = userOrder.every((planet, idx) => planet && planet.order === idx + 1);
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-black p-8 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-400" size={32} />
            Planets in our Solar System
            <Sparkles className="text-yellow-400" size={32} />
          </h1>
          <p className="text-purple-200 text-lg">Drag the planets to arrange them in the correct order from the Sun</p>
        </div>

        {/* Solar System View */}
        <div className="relative bg-gradient-to-r from-black via-indigo-950 to-black rounded-3xl p-8 mb-8 border-2 border-purple-500/30 overflow-hidden min-h-[280px]">
          {/* Stars background */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random(),
                }}
              ></div>
            ))}
          </div>

          <div className="flex items-center justify-start gap-8 relative">
            {/* Sun */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 rounded-full shadow-2xl shadow-yellow-400/60"></div>
                <div className="absolute inset-0 w-24 h-24 bg-yellow-400 rounded-full animate-pulse opacity-30"></div>
              </div>
              <span className="text-yellow-400 font-bold text-lg">Sun</span>
            </div>

            {/* Planet Slots */}
            {userOrder.map((planet, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 flex-shrink-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
              >
                {planet ? (
                  <div
                    draggable
                    onDragStart={() => handleDragStart(planet, true, idx)}
                    onDoubleClick={() => handleReturnToAvailable(idx)}
                    className="flex flex-col items-center gap-2 cursor-move hover:scale-110 transition-transform"
                  >
                    <div className="relative">
                      <div
                        className="rounded-full shadow-2xl"
                        style={{
                          width: planet.size,
                          height: planet.size,
                          backgroundColor: planet.color,
                          boxShadow: `0 0 20px ${planet.color}40`,
                        }}
                      ></div>
                      {planet.name === 'Saturn' && (
                        <div
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 rounded-full"
                          style={{
                            width: planet.size + 20,
                            height: planet.size / 3,
                            borderColor: `${planet.color}80`,
                            borderTopColor: 'transparent',
                            borderBottomColor: 'transparent',
                          }}
                        ></div>
                      )}
                    </div>
                    <span className="text-white font-semibold text-sm">{planet.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 border-2 border-dashed border-purple-400/50 rounded-full bg-purple-900/20 hover:bg-purple-800/40 hover:border-purple-300 transition-all flex items-center justify-center">
                      <span className="text-purple-300 font-bold text-lg">{idx + 1}</span>
                    </div>
                    <span className="text-purple-400 text-sm">Empty</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available Planets */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-indigo-900/40 rounded-2xl p-6 mb-6 border-2 border-purple-500/30">
          <h2 className="text-white text-2xl font-bold mb-4 text-center">
            🪐 Available Planets - Drag to Position
          </h2>
          <div className="flex flex-wrap gap-6 justify-center min-h-[120px] items-center">
            {availablePlanets.map((planet) => (
              <div
                key={planet.name}
                draggable
                onDragStart={() => handleDragStart(planet, false, null)}
                className="flex flex-col items-center gap-2 p-4 bg-indigo-900/60 rounded-xl hover:bg-indigo-800/80 transition-all cursor-move border-2 border-indigo-400/50 hover:border-indigo-300 hover:scale-105"
              >
                <div className="relative">
                  <div
                    className="rounded-full shadow-xl"
                    style={{
                      width: planet.size,
                      height: planet.size,
                      backgroundColor: planet.color,
                      boxShadow: `0 0 15px ${planet.color}60`,
                    }}
                  ></div>
                  {planet.name === 'Saturn' && (
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 rounded-full"
                      style={{
                        width: planet.size + 20,
                        height: planet.size / 3,
                        borderColor: `${planet.color}80`,
                        borderTopColor: 'transparent',
                        borderBottomColor: 'transparent',
                      }}
                    ></div>
                  )}
                </div>
                <span className="text-white font-semibold">{planet.name}</span>
              </div>
            ))}
            {availablePlanets.length === 0 && (
              <div className="text-purple-300 text-lg italic">All planets placed! Click Check Answer</div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center items-center">
          <button
            onClick={checkAnswer}
            disabled={userOrder.some(p => p === null)}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
          >
            <Check size={24} />
            Check Answer
          </button>
          <button
            onClick={resetGame}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
          >
            <RotateCcw size={24} />
            Reset Game
          </button>
        </div>

        <p className="text-center text-purple-300 text-sm mt-4">
          💡 Tip: Double-click planets to return them to the available section
        </p>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`mt-6 p-6 rounded-2xl text-center text-2xl font-bold shadow-2xl ${
              isCorrect
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border-2 border-green-400'
                : 'bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-200 border-2 border-red-400'
            }`}
          >
            {isCorrect ? '🎉 Perfect! You arranged the solar system correctly!' : '❌ Not quite right. Try again!'}
          </div>
        )}
      </div>
    </div>
  );
}