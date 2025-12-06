import { useNavigate } from 'react-router-dom';
import StarBackground from './components/StarBackground';
import GlassCard from './components/GlassCard';
import './Choose.css';

export default function Choose() {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Kids',
      description: 'Fun stories, animations & interactive games',
      path: '/kids',
      icon: '🚀',
      gradient: 'purple',
      features: ['Animated Stories', 'Space Games', 'Planet Adventures']
    },
    {
      title: 'Explorers',
      description: 'Deep space exploration & real-time data',
      path: '/others',
      icon: '🌌',
      gradient: 'pink',
      features: ['Live Events', 'Data Analysis', 'Cosmic Insights']
    }
  ];

  return (
    <div className="choose-container">
      <StarBackground density={150} shooting={true} />

      <div className="choose-content">
        {/* Header */}
        <div className="choose-header">
          <div className="choose-eyebrow">
            <span className="eyebrow-line"></span>
            <span className="eyebrow-text">SELECT YOUR PATH</span>
            <span className="eyebrow-line"></span>
          </div>

          <h1 className="choose-title gradient-text">
            Choose Your
            <br />
            Experience
          </h1>

          <p className="choose-subtitle">
            Embark on your cosmic journey tailored to your curiosity
          </p>
        </div>

        {/* Cards Grid */}
        <div className="choose-cards">
          {options.map((option, index) => (
            <GlassCard
              key={option.path}
              onClick={() => navigate(option.path)}
              variant={option.gradient}
              className={`choose-card animate-card-${index}`}
            >
              {/* Icon */}
              <div className="card-icon">{option.icon}</div>

              {/* Title */}
              <h2 className="card-title">{option.title}</h2>

              {/* Description */}
              <p className="card-description">{option.description}</p>

              {/* Features */}
              <ul className="card-features">
                {option.features.map((feature, i) => (
                  <li key={i} className="card-feature">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Arrow indicator */}
              <div className="card-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Back button */}
        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}
