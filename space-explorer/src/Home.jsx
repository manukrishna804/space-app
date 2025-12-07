import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarBackground from './components/StarBackground';
import GlowButton from './components/GlowButton';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="home-container">
      {/* Star background */}
      <StarBackground density={200} shooting={true} />

      {/* Animated gradient orbs */}
      <div className="gradient-orbs">
        <div
          className="orb orb-purple"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
          }}
        />
        <div
          className="orb orb-pink"
          style={{
            transform: `translate(${-mousePos.x * 0.8}px, ${-mousePos.y * 0.8}px)`
          }}
        />
        <div
          className="orb orb-blue"
          style={{
            transform: `translate(${mousePos.x * 0.6}px, ${-mousePos.y * 0.6}px)`
          }}
        />
      </div>

      {/* Main content */}
      <div className={`hero-content ${loaded ? 'hero-loaded' : ''}`}>
        {/* Subtitle */}
        <div className="hero-subtitle">
          <span className="subtitle-line"></span>
          <span className="subtitle-text">WELCOME TO THE ASTROX</span>
          <span className="subtitle-line"></span>
        </div>

        {/* Main title */}
        <h1 className="hero-title gradient-text">
          Discover Infinite
          <br />
          <span className="hero-title-accent">Infinity</span>
        </h1>

        {/* Description */}
        <p className="hero-description">
          Embark on an extraordinary journey through space and time.
          <br />
          Explore galaxies, learn about celestial wonders, and unlock the mysteries of the universe.
        </p>

        {/* CTA Button */}
        <div className="hero-cta">
          <GlowButton
            onClick={() => navigate('/choose')}
            size="lg"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }
          >
            Begin Your Journey
          </GlowButton>
        </div>
      </div>

      {/* Floating planets */}
      <div className="floating-planets">
        <div className="planet planet-1"></div>
        <div className="planet planet-2"></div>
        <div className="planet planet-3"></div>
      </div>
    </div>
  );
}