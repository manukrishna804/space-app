import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarBackground from './components/StarBackground';
import GlassCard from './components/GlassCard';
import GlowButton from './components/GlowButton';
import SpaceDataAnalyzer from './SpaceDataAnalyzer';
import './OthersHomepage.css';

export default function OthersHomepage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_KEY = 'DEMO_KEY';

    async function fetchApod() {
      try {
        const res = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('APOD fetch failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApod();
  }, []);

  return (
    <div className="others-container">
      <StarBackground density={150} shooting={true} />

      <div className="others-content">
        {/* Header */}
        <div className="others-header">
          <div className="others-eyebrow">
            <span className="eyebrow-line"></span>
            <span className="eyebrow-text">EXPLORE THE COSMOS</span>
            <span className="eyebrow-line"></span>
          </div>

          <h1 className="others-title gradient-text">
            Space Explorer
            <br />
            Dashboard
          </h1>
        </div>

        {/* APOD Hero Section */}
        <section className="apod-section">
          {loading && (
            <GlassCard className="apod-loading">
              <div className="loading-spinner"></div>
              <p>Loading Astronomy Picture of the Day...</p>
            </GlassCard>
          )}

          {error && !data && (
            <GlassCard className="apod-error">
              <div className="error-icon">🛰️</div>
              <h3>Couldn't load today's APOD</h3>
              <p>NASA servers may be temporarily unavailable.</p>
              <p className="error-details">Error: {error}</p>
            </GlassCard>
          )}

          {data && (
            <GlassCard className="apod-card" variant="default">
              {/* Background blur effect */}
              {data.media_type === 'image' && (
                <div
                  className="apod-bg-blur"
                  style={{ backgroundImage: `url(${data.url})` }}
                />
              )}

              <div className="apod-content">
                {/* Media */}
                <div className="apod-media">
                  {data.media_type === 'image' ? (
                    <img
                      src={data.url}
                      alt={data.title}
                      className="apod-image"
                    />
                  ) : (
                    <iframe
                      title="APOD Video"
                      src={data.url}
                      className="apod-video"
                      allowFullScreen
                    />
                  )}
                </div>

                {/* Info */}
                <div className="apod-info">
                  <div className="apod-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    NASA • Astronomy Picture of the Day
                  </div>

                  <h2 className="apod-title">{data.title}</h2>

                  <p className="apod-date">{data.date}</p>

                  <p className="apod-explanation">{data.explanation}</p>
                </div>
              </div>
            </GlassCard>
          )}
        </section>

        {/* Feature Cards */}
        <section className="features-section">
          <h2 className="features-title">What would you like to explore?</h2>

          <div className="features-grid">
            <GlassCard
              variant="blue"
              className="feature-card"
              onClick={() => navigate('/events')}
            >
              <div className="feature-icon">📅</div>
              <h3 className="feature-title">Upcoming Events</h3>
              <p className="feature-description">
                Track rocket launches, astronomical events, and space missions happening soon
              </p>
              <div className="feature-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </GlassCard>

            <GlassCard
              variant="pink"
              className="feature-card"
              onClick={() => navigate('/farmer-assist')}
            >
              <div className="feature-icon">🌱</div>
              <h3 className="feature-title">Farmer Assist</h3>
              <p className="feature-description">
                Space-enabled weather insights and agricultural guidance powered by satellite data
              </p>
              <div className="feature-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Space Data Analyzer */}
        <section className="analyzer-section">
          <SpaceDataAnalyzer />
        </section>

        {/* Back button */}
        <button className="others-back-button" onClick={() => navigate('/choose')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to Selection</span>
        </button>
      </div>
    </div>
  );
}
