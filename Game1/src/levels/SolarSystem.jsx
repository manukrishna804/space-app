import React, { useState } from 'react';
import { motion } from 'framer-motion';

const planets = [
  { name: 'Mercury', color: '#A0A0A0', size: 15, radius: 80, speed: 4, fact: "I'm the closest planet to the Sun and very hot!" },
  { name: 'Venus', color: '#E3BB76', size: 25, radius: 120, speed: 7, fact: "I'm the hottest planet and I spin backwards!" },
  { name: 'Earth', color: '#4F4CB0', size: 28, radius: 170, speed: 10, fact: "I'm your home! The only planet with life." },
  { name: 'Mars', color: '#FF5733', size: 22, radius: 220, speed: 13, fact: "I'm the Red Planet. Robots are exploring me right now!" },
  { name: 'Jupiter', color: '#D8CA9D', size: 60, radius: 300, speed: 18, fact: "I'm the biggest planet! I'm a Gas Giant." },
  { name: 'Saturn', color: '#F4D03F', size: 50, radius: 380, speed: 22, fact: "Look at my beautiful rings! They are made of ice and rock." },
];

const SolarSystem = ({ onComplete }) => {
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [foundPlanets, setFoundPlanets] = useState([]);
  const [mission, setMission] = useState(planets[0]); // Start wishing to find Mercury

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
                    setMission(planets[newFound.length]);
                    setSelectedPlanet(null);
                }, 2000);
            } else {
                // All found
                setTimeout(() => {
                    onComplete();
                }, 3000);
            }
        }
    }
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
                border: '1px dashed rgba(255,255,255,0.1)'
            }}
          >
            <motion.div 
                className="planet"
                whileHover={{ scale: 1.2 }}
                onClick={(e) => { e.stopPropagation(); handlePlanetClick(planet); }}
                style={{
                    backgroundColor: planet.color,
                    width: `${planet.size}px`,
                    height: `${planet.size}px`,
                    position: 'absolute',
                    top: '50%',
                    right: '-1%', // Position on the circle
                    marginTop: `-${planet.size/2}px`,
                    marginRight: `-${planet.size/2}px`,
                    boxShadow: mission.name === planet.name ? '0 0 20px white' : 'none'
                }}
            />
          </div>
        ))}
      </div>

      {selectedPlanet && (
        <div className="fact-card">
          <h3>{selectedPlanet.name}</h3>
          <p>{selectedPlanet.fact}</p>
          {selectedPlanet.name === mission.name && (
            <p style={{ color: '#00d4ff', fontWeight: 'bold' }}>Correct! Great job!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SolarSystem;
