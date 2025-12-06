import React, { useEffect, useState } from 'react';
import StarBackground from './components/StarBackground';
import GlassCard from './components/GlassCard';
import EventDetailsModal from './EventDetailsModal';
import './UpcomingEvents.css';

const API_URL = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=20';
const EVENTS_API_URL = 'https://ll.thespacedevs.com/2.2.0/event/upcoming/?limit=20';

// Mock data generator for Meteors/Eclipses fallback
const getMockCelestialEvents = () => [
  {
    id: 'mock-meteor-1',
    name: 'Perseids Meteor Shower',
    type: { name: 'Meteor Shower' },
    date: '2025-08-12T00:00:00Z',
    description: 'The Perseids are one of the most plentiful showers (50-100 meteors per hour) and occur with warm summer nighttime weather, allowing star gazers to easily view them.',
    location: 'Northern Hemisphere',
    image: 'https://images.unsplash.com/photo-1517482813580-c20e2e9c1221?q=80&w=1080'
  },
  {
    id: 'mock-eclipse-1',
    name: 'Total Lunar Eclipse',
    type: { name: 'Eclipse' },
    date: '2025-03-14T00:00:00Z',
    description: 'A total lunar eclipse takes place when the Earth comes between the Sun and the Moon and covers the Moon with its shadow.',
    location: 'Americas, Europe',
    image: 'https://images.unsplash.com/photo-1504981882894-3a992e595034?q=80&w=1080'
  }
];

function mapLaunchesToEvents(launches) {
  return launches.map(l => ({
    id: l.id,
    title: l.name,
    type: 'launch',
    startTime: l.net,
    location: l.pad?.name || 'Unknown pad',
    agency: l.launch_service_provider?.name || 'Unknown',
    source: 'Launch Library 2',
    detailsUrl: l.url,
    image: l.image,
    rawLaunch: l
  }));
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');

        const [launchRes, eventsRes, customRes] = await Promise.all([
          fetch(API_URL),
          fetch(EVENTS_API_URL),
          fetch('/celestialEvents2025.json').catch(() => ({ ok: false }))
        ]);

        if (!launchRes.ok) throw new Error('Launch API failed');
        const launchData = await launchRes.json();
        const launchEvents = mapLaunchesToEvents(launchData.results || []);

        // Process Agency Events
        let agencyEvents = [];
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          agencyEvents = (eventsData.results || []).map(ev => ({
            id: ev.id,
            title: ev.name,
            type: 'agency_event',
            startTime: ev.date,
            location: ev.location || 'Space',
            agency: ev.agencies?.[0]?.name || 'Unknown',
            description: ev.description,
            news_url: ev.news_url,
            video_url: ev.video_url,
            image: ev.feature_image,
            source: 'SpaceDevs Events'
          }));
        }

        // Process Custom/Celestial Events
        let customEvents = [];
        if (customRes.ok) {
          customEvents = await customRes.json();
        } else {
          const mocks = getMockCelestialEvents();
          customEvents = mocks.map(m => ({
            id: m.id,
            title: m.name,
            type: m.type.name === 'Eclipse' ? 'eclipse' : 'meteor_shower',
            startTime: m.date,
            location: m.location,
            description: m.description,
            image: m.image,
            source: 'Celestial Mock'
          }));
        }

        const all = [...launchEvents, ...agencyEvents, ...customEvents];

        // Dedupe
        const seen = new Set();
        const uniqueAll = [];
        for (const e of all) {
          if (!seen.has(e.id)) {
            seen.add(e.id);
            uniqueAll.push(e);
          }
        }

        uniqueAll.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        setEvents(uniqueAll);
      } catch (e) {
        console.error(e);
        setError('Failed to load events. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = events.filter(ev => {
    if (filter === 'ALL') return true;
    if (filter === 'LAUNCH') return ev.type === 'launch';
    if (filter === 'METEOR') return ev.type === 'meteor_shower';
    if (filter === 'ECLIPSE') return ev.type === 'eclipse';
    if (filter === 'AGENCY') return ev.type === 'agency_event';
    if (filter === 'NASA') return (ev.agency || '').toUpperCase().includes('NASA');
    if (filter === 'ISRO') return (ev.agency || '').toUpperCase().includes('ISRO');
    return true;
  });

  const filterOptions = [
    { value: 'ALL', label: 'All Events', icon: '🌌' },
    { value: 'LAUNCH', label: 'Launches', icon: '🚀' },
    { value: 'AGENCY', label: 'Agency Events', icon: '🏢' },
    { value: 'METEOR', label: 'Meteor Showers', icon: '☄️' },
    { value: 'ECLIPSE', label: 'Eclipses', icon: '🌑' },
    { value: 'NASA', label: 'NASA', icon: '🇺🇸' },
    { value: 'ISRO', label: 'ISRO', icon: '🇮🇳' }
  ];

  return (
    <div className="events-container">
      <StarBackground density={150} shooting={true} />

      <div className="events-content">
        {/* Header */}
        <div className="events-header">
          <div className="events-eyebrow">
            <span className="eyebrow-line"></span>
            <span className="eyebrow-text">TRACK THE COSMOS</span>
            <span className="eyebrow-line"></span>
          </div>

          <h1 className="events-title gradient-text">
            Upcoming Space
            <br />
            Events
          </h1>

          <p className="events-subtitle">
            Track live launches, watch celestial events, and stay updated with the latest from NASA, ISRO, and more
          </p>

          {/* Filters */}
          <div className="events-filters">
            {filterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`filter-btn ${filter === opt.value ? 'filter-btn-active' : ''}`}
              >
                <span className="filter-icon">{opt.icon}</span>
                <span className="filter-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="events-loading">
            <div className="loading-spinner"></div>
            <p className="loading-text">Scanning the cosmos...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <GlassCard className="events-error" variant="pink">
            <div className="error-icon">⚠️</div>
            <h3 className="error-title">Connection Error</h3>
            <p className="error-message">{error}</p>
          </GlassCard>
        )}

        {/* Events Grid */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="no-events">
                <div className="no-events-icon">🔭</div>
                <h3 className="no-events-title">No events found</h3>
                <p className="no-events-text">Try changing your filter to see more events</p>
                <button
                  className="no-events-button"
                  onClick={() => setFilter('ALL')}
                >
                  Show All Events
                </button>
              </div>
            ) : (
              <div className="events-grid">
                {filtered.map((ev, index) => {
                  const date = new Date(ev.startTime);
                  const dateStr = isNaN(date.getTime()) ? 'Date TBD' : date.toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  });
                  const timeStr = isNaN(date.getTime()) ? '' : date.toLocaleTimeString(undefined, {
                    hour: '2-digit', minute: '2-digit'
                  });

                  // Badge styling
                  let badgeConfig = { color: 'default', label: ev.type };
                  if (ev.type === 'launch') badgeConfig = { color: 'green', label: 'Launch' };
                  else if (ev.type === 'meteor_shower') badgeConfig = { color: 'yellow', label: 'Meteor Shower' };
                  else if (ev.type === 'eclipse') badgeConfig = { color: 'orange', label: 'Eclipse' };
                  else if (ev.type === 'agency_event') badgeConfig = { color: 'purple', label: 'Event' };

                  return (
                    <GlassCard
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`event-card animate-card-${index % 6}`}
                    >
                      {/* Image */}
                      <div className="event-image-container">
                        <div className="event-image-overlay"></div>
                        {ev.image ? (
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="event-image"
                          />
                        ) : (
                          <div className="event-image-placeholder">
                            <span className="placeholder-icon">🌌</span>
                          </div>
                        )}

                        {/* Badge */}
                        <div className={`event-badge event-badge-${badgeConfig.color}`}>
                          {badgeConfig.label}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="event-content">
                        {/* Date */}
                        <div className="event-date">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{dateStr}</span>
                          {timeStr && <span className="event-time">• {timeStr}</span>}
                        </div>

                        {/* Title */}
                        <h3 className="event-title">{ev.title}</h3>

                        {/* Description */}
                        <p className="event-description">
                          {ev.description || "Click to explore full details about this mission, timing, and visibility."}
                        </p>

                        {/* Footer */}
                        <div className="event-footer">
                          {ev.agency && (
                            <span className="event-agency">{ev.agency}</span>
                          )}

                          <div className="event-cta">
                            <span>Details</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
