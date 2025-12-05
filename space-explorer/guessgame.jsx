import React, { useState } from 'react';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';

const PLANETS = [
  {
    name: "Mars",
    clues: [
      "This planet is often called the 'Red Planet'",
      "It has two small moons named Phobos and Deimos",
      "NASA's rovers like Curiosity and Perseverance have explored this planet"
    ]
  },
  {
    name: "Saturn",
    clues: [
      "This planet is famous for its beautiful rings",
      "It's the second largest planet in our solar system",
      "It has at least 82 moons, including Titan which is bigger than Mercury"
    ]
  },
  {
    name: "Jupiter",
    clues: [
      "This is the largest planet in our solar system",
      "It has a giant storm called the Great Red Spot that's been raging for centuries",
      "This gas giant has at least 79 moons"
    ]
  },
  {
    name: "Venus",
    clues: [
      "This is the hottest planet in our solar system",
      "It's often called Earth's 'sister planet' because of similar size",
      "It rotates backwards compared to most other planets"
    ]
  },
  {
    name: "Neptune",
    clues: [
      "This planet appears blue because of methane in its atmosphere",
      "It's the farthest planet from the Sun",
      "It has the strongest winds in the solar system, reaching over 1,200 mph"
    ]
  },
  {
    name: "Mercury",
    clues: [
      "This is the smallest planet in our solar system",
      "It's the closest planet to the Sun",
      "One day on this planet lasts 59 Earth days"
    ]
  },
  {
    name: "Uranus",
    clues: [
      "This planet rotates on its side, like a rolling ball",
      "It appears blue-green in color",
      "It was the first planet discovered using a telescope"
    ]
  }
];

export default function PlanetGuessingGame() {
  const [currentPlanet, setCurrentPlanet] = useState(PLANETS[0]);
  const [cluesRevealed, setCluesRevealed] = useState(1);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);

  const handleGuess = () => {
    if (!guess.trim()) return;

    const normalizedGuess = guess.trim().toLowerCase();
    const correctAnswer = currentPlanet.name.toLowerCase();

    if (normalizedGuess === correctAnswer) {
      setMessage("🎉 Correct! You found the planet!");
      setGameWon(true);
      const points = 4 - cluesRevealed;
      setScore(score + points);
    } else {
      if (cluesRevealed < 3) {
        setCluesRevealed(cluesRevealed + 1);
        setMessage("❌ Not quite! Here's another clue...");
      } else {
        setMessage(`❌ Sorry! The answer was ${currentPlanet.name}. Try the next one!`);
        setTimeout(nextPlanet, 2000);
      }
    }
    setGuess("");
  };

  const nextPlanet = () => {
    const currentIndex = PLANETS.findIndex(p => p.name === currentPlanet.name);
    const nextIndex = (currentIndex + 1) % PLANETS.length;
    setCurrentPlanet(PLANETS[nextIndex]);
    setCluesRevealed(1);
    setGuess("");
    setMessage("");
    setGameWon(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-400" />
            Planet Detective
            <Sparkles className="text-yellow-400" />
          </h1>
          <p className="text-purple-300">Guess the planet using the clues!</p>
          <div className="mt-4 text-2xl font-bold text-yellow-400">
            Score: {score}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">
              Clues Revealed: {cluesRevealed}/3
            </h2>
            
            <div className="space-y-3">
              {currentPlanet.clues.slice(0, cluesRevealed).map((clue, index) => (
                <div 
                  key={index}
                  className="bg-purple-800/50 p-4 rounded-lg border-2 border-purple-400 animate-pulse"
                  style={{ animationDuration: '2s' }}
                >
                  <p className="text-lg">🔍 Clue {index + 1}: {clue}</p>
                </div>
              ))}
            </div>
          </div>

          {!gameWon ? (
            <div className="space-y-4">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                placeholder="Type your guess..."
                className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-purple-400 text-white placeholder-purple-300 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              
              <button
                onClick={handleGuess}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105"
              >
                Submit Guess
              </button>
            </div>
          ) : (
            <button
              onClick={nextPlanet}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <CheckCircle />
              Next Planet
            </button>
          )}

          {message && (
            <div className={`mt-4 p-4 rounded-lg text-center font-semibold text-lg ${
              message.includes('Correct') 
                ? 'bg-green-500/30 border-2 border-green-400' 
                : 'bg-red-500/30 border-2 border-red-400'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-purple-300">
          <p className="text-sm">💡 Hint: The fewer clues you need, the more points you earn!</p>
        </div>
      </div>
    </div>
  );
}