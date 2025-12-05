import React, { useState } from 'react';
import LevelManager from './components/LevelManager';

function App() {
  const [currentLevel, setCurrentLevel] = useState(1);

  const handleLevelComplete = (nextLevel) => {
    setCurrentLevel(nextLevel);
  };

  return (
    <div className="app-container">
      <LevelManager currentLevel={currentLevel} onLevelComplete={handleLevelComplete} />
    </div>
  );
}

export default App;
