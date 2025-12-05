import React, { useState } from 'react';
import { motion } from 'framer-motion';

const planets = [
  { name: 'Mercury', color: '#A0A0A0', size: 30, radius: 80, speed: 12, fact: "I'm the closest planet to the Sun and very hot!" },
  { name: 'Venus', color: '#E3BB76', size: 40, radius: 120, speed: 18, fact: "I'm the hottest planet and I spin backwards!" },
  { name: 'Earth', color: '#4F4CB0', size: 45, radius: 170, speed: 25, fact: "I'm your home! The only planet with life." },
  { name: 'Mars', color: '#FF5733', size: 35, radius: 220, speed: 30, fact: "I'm the Red Planet. Robots are exploring me right now!" },
  { name: 'Jupiter', color: '#D8CA9D', size: 80, radius: 300, speed: 45, fact: "I'm the biggest planet! I'm a Gas Giant." },
  { name: 'Saturn', color: '#F4D03F', size: 70, radius: 380, speed: 55, fact: "Look at my beautiful rings! They are made of ice and rock." },
  { name: 'Uranus', color: '#4FD0E7', size: 60, radius: 440, speed: 65, fact: "I spin on my side and I'm an Ice Giant!" },
  { name: 'Neptune', color: '#4b70dd', size: 58, radius: 500, speed: 75, fact: "I'm the furthest planet and have super fast winds!" }
];


const SolarSystem = ({ onComplete }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [foundPlanets, setFoundPlanets] = useState([]);
  // Initialize mission queue with shuffled planets
  const [missionQueue, setMissionQueue] = useState(() => {
      const shuffled = [...planets].sort(() => Math.random() - 0.5);
      return shuffled;
  });
  const [mission, setMission] = useState(missionQueue[0]); 
  const [hoveredPlanet, setHoveredPlanet] = useState(null);

  const handlePlanetClick = (planet) => {
    setSelectedPlanet(planet);
    
    if (planet.name === mission.name) {
        // Correct planet found
        if (!foundPlanets.includes(planet.name)) {
            const newFound = [...foundPlanets, planet.name];
            setFoundPlanets(newFound);
            
            // Next mission
            if (newFound.length < planets.length) {
                setTimeout(() => {
                    // Get next mission from the queue
                    const nextMission = missionQueue[newFound.length];
                    if (nextMission) {
                        setMission(nextMission);
                        setSelectedPlanet(null);
                    } else {
                        onComplete();
                    }
                }, 2000);
            } else {
                // All found
                setTimeout(() => {
                    onComplete();
                }, 3000);
            }
        }
    } else {
        // Wrong planet logic is handled in render (displaying the fact + wrong msg)
    }
  };

  const getQuirkyMessage = (planet) => {
      if (!mission || planet.name === mission.name) return "You found it!";
      const messages = [
          `Oops! That's ${planet.name}, not ${mission.name}!`,
          `Not quite! ${planet.name} is cool, but we need ${mission.name}.`,
          `Wrong turn! That's ${planet.name}. Keep looking!`,
          `Space is big, isn't it? That's just ${planet.name}.`
      ];
      return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="level-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <h2 style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', zIndex: 100 }}>
        Mission: Find <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{mission ? mission.name : 'All Planets!'}</span>
      </h2>
      
      <div className="solar-system" style={{ margin: '0 auto', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <div className="sun" onClick={() => setSelectedPlanet({ name: 'Sun', fact: "I'm a star, not a planet! I give you light and heat." })}></div>
        
        {planets.map((planet, index) => (
          <div 
            key={planet.name}
            className="planet-orbit-container"
            style={{ 
                animationDuration: `${planet.speed}s`,
                width: `${planet.radius * 2}px`,
                height: `${planet.radius * 2}px`,
                // We need to override the generic styles slightly to make them act as orbits
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: `-${planet.radius}px`,
                marginLeft: `-${planet.radius}px`,
                borderRadius: '50%',
                border: '1px dashed rgba(255,255,255,0.1)',
                animationPlayState: hoveredPlanet === planet.name ? 'paused' : 'running',
                pointerEvents: 'none' // Key fix: Allow clicks to pass through the orbit container
            }}
          >
            <motion.div 
                className="planet"
                whileHover={{ scale: 1.2 }}
                onMouseEnter={() => setHoveredPlanet(planet.name)}
                onMouseLeave={() => setHoveredPlanet(null)}
                onClick={(e) => { e.stopPropagation(); handlePlanetClick(planet); }}
                style={{
                    backgroundColor: planet.color,
                    width: `${planet.size}px`,
                    height: `${planet.size}px`,
                    position: 'absolute',
                    top: '50%',
                    left: 'auto',
                    right: `-${planet.size / 2}px`,
                    marginTop: `-${planet.size / 2}px`,
                    boxShadow: mission.name === planet.name ? '0 0 20px white' : 'none',
                    transformOrigin: 'center',
                    pointerEvents: 'auto', // Key fix: Re-enable clicks on the planet itself
                    cursor: 'pointer'
                }}
            />
          </div>
        ))}
      </div>

      {selectedPlanet && (
        <div className="fact-card">
          <h3>{selectedPlanet.name}</h3>
          <p>{selectedPlanet.fact}</p>
          {selectedPlanet.name === mission.name ? (
            <p style={{ color: '#00d4ff', fontWeight: 'bold' }}>Correct! Great job!</p>
          ) : (
             <p style={{ color: '#ff5733', fontStyle: 'italic' }}>{getQuirkyMessage(selectedPlanet)}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SolarSystem;
