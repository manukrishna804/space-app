import { useState, useEffect } from 'react';
import './StarBackground.css';

export default function StarBackground({ density = 150, shooting = true }) {
    const [stars, setStars] = useState([]);

    useEffect(() => {
        const newStars = Array.from({ length: density }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 0.5,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            opacity: Math.random() * 0.5 + 0.5
        }));
        setStars(newStars);
    }, [density]);

    return (
        <div className="star-background">
            {/* Static stars */}
            {stars.map(star => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        animationDuration: `${star.duration}s`,
                        animationDelay: `${star.delay}s`,
                        opacity: star.opacity
                    }}
                />
            ))}

            {/* Shooting stars */}
            {shooting && (
                <>
                    <div className="shooting-star" style={{ animationDelay: '1s', top: '20%', left: '30%' }} />
                    <div className="shooting-star" style={{ animationDelay: '3s', top: '40%', left: '60%' }} />
                    <div className="shooting-star" style={{ animationDelay: '5s', top: '70%', left: '20%' }} />
                    <div className="shooting-star" style={{ animationDelay: '7s', top: '30%', left: '80%' }} />
                </>
            )}
        </div>
    );
}
