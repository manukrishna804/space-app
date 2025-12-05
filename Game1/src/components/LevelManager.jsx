import React from 'react';
import SolarSystem from '../levels/SolarSystem';
import PlanetMatch from '../levels/PlanetMatch';
import SpaceQuiz from '../levels/SpaceQuiz';

const LevelManager = ({ currentLevel, onLevelComplete }) => {
  switch (currentLevel) {
    case 1:
      return <SolarSystem onComplete={() => onLevelComplete(2)} />;
    case 2:
      return <PlanetMatch onComplete={() => onLevelComplete(3)} />;
    case 3:
      return <SpaceQuiz onComplete={() => onLevelComplete('win')} />;
    case 'win':
      return (
        <div className="win-screen">
          <h1>Course Completed!</h1>
          <p>You are now a Certified Space Explorer!</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      );
    default:
      return <div>Unknown Level</div>;
  }
};

export default LevelManager;
