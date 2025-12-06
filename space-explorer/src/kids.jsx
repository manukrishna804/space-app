import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import StarBackground from './components/StarBackground';
import GlassCard from './components/GlassCard';
import './Kids.css';

export default function Kids() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const items = [
    {
      title: 'Journey of Little Rocket',
      path: '/rocket',
      icon: '🚀',
      description: 'Follow a tiny rocket on its big adventure',
      gradient: 'purple'
    },
    {
      title: 'Meet the Planets',
      path: '/sunny',
      icon: '🌞',
      description: 'Discover our solar system family',
      gradient: 'blue'
    },
    {
      title: 'Humans in Space',
      path: '/human',
      icon: '👨‍🚀',
      description: 'Learn about astronauts and missions',
      gradient: 'pink'
    }
  ];

  // Filter items based on search
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="kids-container">
      <StarBackground density={120} shooting={true} />

      <div className="kids-content">
        {/* Header */}
        <div className="kids-header">
          <h1 className="kids-title gradient-text">
            Space Adventures
            <br />
            for Kids! 🌟
          </h1>
          <p className="kids-subtitle">
            Choose your favorite space story to begin
          </p>
        </div>

        {/* Search bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for space adventures..."
              className="search-input"
            />
            {search && (
              <button
                className="search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        {filteredItems.length > 0 ? (
          <div className="kids-cards">
            {filteredItems.map((item, index) => (
              <GlassCard
                key={item.path}
                onClick={() => navigate(item.path)}
                variant={item.gradient}
                className={`kids-card animate-bounce-${index}`}
              >
                <div className="kids-card-icon">{item.icon}</div>
                <h2 className="kids-card-title">{item.title}</h2>
                <p className="kids-card-description">{item.description}</p>

                <div className="kids-card-footer">
                  <span className="kids-card-cta">Start Adventure</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3 className="no-results-title">No adventures found</h3>
            <p className="no-results-text">Try searching for something else!</p>
            <button
              className="no-results-button"
              onClick={() => setSearch('')}
            >
              Show All Adventures
            </button>
          </div>
        )}

        {/* Back button */}
        <button className="kids-back-button" onClick={() => navigate('/choose')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back</span>
        </button>
      </div>
    </div>
  );
}
