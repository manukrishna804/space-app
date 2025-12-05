import React, { useState } from 'react';
import { motion } from 'framer-motion';

const correctOrder = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

const initialPlanets = [
  { id: 'mars', name: 'Mars', color: '#FF5733', size: 50 },
  { id: 'jupiter', name: 'Jupiter', color: '#D8CA9D', size: 90 },
  { id: 'earth', name: 'Earth', color: '#4F4CB0', size: 60 },
  { id: 'mercury', name: 'Mercury', color: '#A0A0A0', size: 40 },
  { id: 'saturn', name: 'Saturn', color: '#F4D03F', size: 80 },
  { id: 'venus', name: 'Venus', color: '#E3BB76', size: 55 },
  { id: 'uranus', name: 'Uranus', color: '#4FD0E7', size: 70 },
  { id: 'neptune', name: 'Neptune', color: '#4b70dd', size: 68 },
];

const PlanetMatch = ({ onComplete }) => {
  const [placedPlanets, setPlacedPlanets] = useState(Array(8).fill(null));
  const [availablePlanets, setAvailablePlanets] = useState(initialPlanets);
  const [message, setMessage] = useState("Drag planets to the empty slots!");

  const checkDrop = (e, info, planet) => {
      const dropZones = document.querySelectorAll('.orbit-slot');
      let droppedInZone = -1;

      // Simple collision detection
      dropZones.forEach((zone, idx) => {
          const rect = zone.getBoundingClientRect();
          const point = { x: info.point.x, y: info.point.y };
          
          if (point.x >= rect.left && point.x <= rect.right && 
              point.y >= rect.top && point.y <= rect.bottom) {
              droppedInZone = idx;
          }
      });

      if (droppedInZone !== -1) {
          if (placedPlanets[droppedInZone] !== null) {
              setMessage("That slot is already taken!");
              return;
          }

          if (correctOrder[droppedInZone] === planet.name) {
              const newPlaced = [...placedPlanets];
              newPlaced[droppedInZone] = planet;
              setPlacedPlanets(newPlaced);
              
              setAvailablePlanets(availablePlanets.filter(p => p.id !== planet.id));
              setMessage(`Correct! ${planet.name} secured!`);
              
              if (newPlaced.filter(p => p).length === 8) {
                   setTimeout(onComplete, 2000);
                   setMessage("SYSTEM REPAIRED! You are amazing!");
              }
          } else {
              setMessage(`Oops! ${planet.name} doesn't go there.`);
          }
      }
  };

  return (
    <div className="match-container" style={{ overflow: 'hidden', background: 'radial-gradient(circle at bottom, #1a1a40 0%, #000000 100%)' }}>
      <h2 style={{ textAlign: 'center', marginTop: '20px' }}>Fix the Solar System!</h2>
      <p style={{ textAlign: 'center', color: '#00d4ff', fontSize: '1.2rem' }}>{message}</p>

      <div className="orbit-slots" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '20px', 
          marginTop: '30px',
          height: '250px',
          padding: '20px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          width: '90%',
          margin: '20px auto'
      }}>
        <div className="sun-icon" style={{
            width: '100px', height: '100px', background: 'radial-gradient(circle, #ffd700, #ff8c00)', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 50px #ff8c00', marginRight: '20px',
            color: 'black', fontWeight: 'bold'
        }}>Sun</div>
        
        {placedPlanets.map((p, i) => (
            <div 
                key={i} 
                className="orbit-slot"
                style={{
                    width: '100px',
                    height: '100px',
                    border: '2px dashed rgba(255,255,255,0.3)',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: p ? 'transparent' : 'rgba(0,0,0,0.3)',
                    position: 'relative'
                }}
            >
                <span style={{ position: 'absolute', top: '-25px', fontSize: '0.8rem', opacity: 0.7 }}>Orbit {i + 1}</span>
                {p ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            borderRadius: '50%',
                            boxShadow: `0 0 20px ${p.color}`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ fontSize: '10px', color: 'black', fontWeight: 'bold' }}>{p.name}</span>
                    </motion.div>
                ) : (
                    <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%', opacity: 0.2 }}></div>
                )}
            </div>
        ))}
      </div>

      <div className="planet-pool" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginTop: '40px',
          flexWrap: 'wrap',
          padding: '20px'
      }}>
        {availablePlanets.map(planet => (
            <motion.div
                key={planet.id}
                drag
                dragSnapToOrigin={true} // Key fix: Returns to start if dropped incorrectly
                whileHover={{ scale: 1.1, cursor: 'grab' }}
                whileDrag={{ scale: 1.2, cursor: 'grabbing', zIndex: 1000 }}
                onDragEnd={(e, info) => checkDrop(e, info, planet)}
                style={{
                    width: planet.size,
                    height: planet.size,
                    backgroundColor: planet.color,
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 0 10px white',
                    touchAction: 'none' // Important for touch devices
                }}
            >
                <span style={{ fontSize: '12px', color: 'black', fontWeight: 'bold', pointerEvents: 'none' }}>{planet.name}</span>
            </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlanetMatch;
