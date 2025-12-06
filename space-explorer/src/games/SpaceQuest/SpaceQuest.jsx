import React, { useState } from 'react';
import SolarSystem from './levels/SolarSystem';
import PlanetMatch from './levels/PlanetMatch';
import SpaceQuiz from './levels/SpaceQuiz';
import './SpaceQuest.css';

const SpaceQuest = ({ onBack }) => {
    const [currentLevel, setCurrentLevel] = useState(1);

    const handleLevelComplete = (nextLevel) => {
        setCurrentLevel(nextLevel);
    };

    const renderLevel = () => {
        switch (currentLevel) {
            case 1:
                return <SolarSystem onComplete={() => handleLevelComplete(2)} />;
            case 2:
                return <PlanetMatch onComplete={() => handleLevelComplete(3)} />;
            case 3:
                return <SpaceQuiz onComplete={() => handleLevelComplete('win')} />;
            case 'win':
                return (
                    <div className="win-screen" style={{ textAlign: 'center', marginTop: '100px' }}>
                        <h1 style={{ fontSize: '3rem', color: '#00d4ff' }}>Course Completed!</h1>
                        <p style={{ fontSize: '1.5rem', margin: '20px 0' }}>You are now a Certified Space Explorer!</p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setCurrentLevel(1)}
                                style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '15px', border: 'none', background: '#bd00ff', color: 'white', cursor: 'pointer' }}
                            >
                                Play Again
                            </button>
                            <button
                                onClick={onBack}
                                style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '15px', border: 'none', background: '#333', color: 'white', cursor: 'pointer' }}
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div>Unknown Level</div>;
        }
    };

    return (
        <div className="space-quest-app">
            <div className="app-container">
                {/* Header / Back Button */}
                <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
                    <button
                        onClick={onBack}
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        ← Exit Game
                    </button>
                </div>

                {renderLevel()}
            </div>
        </div>
    );
};

export default SpaceQuest;
