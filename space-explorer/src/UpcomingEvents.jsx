import React, { useEffect, useState } from 'react';

const API_URL = 'https://ll.thespacedevs.com/2.0.0/launch/upcoming/?limit=30';

function mapLaunchesToEvents(launches) {
  return launches.map(l => ({
    id: l.id,
    title: l.name,
    type: 'launch',
    startTime: l.net,
    location: l.pad?.name || 'Unknown pad',
    agency: l.launch_service_provider?.name || 'Unknown',
    source: 'Launch Library 2',
    detailsUrl: l.url || (l.infoURLs && l.infoURLs[0]?.url)
  }));
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');

        const [launchRes, customRes] = await Promise.all([
          fetch(API_URL),
          fetch('/celestialEvents2025.json')
        ]);

        if (!launchRes.ok) throw new Error('Launch API failed');
        const launchData = await launchRes.json();
        const launches = launchData.results || [];
        const launchEvents = mapLaunchesToEvents(launches);

        let customEvents = [];
        if (customRes.ok) {
          customEvents = await customRes.json();
        }

        const all = [...launchEvents, ...customEvents];
        all.sort(
          (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );

        setEvents(all);
      } catch (e) {
        console.error(e);
        setError('Failed to load events');
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
    if (filter === 'NASA')
      return (ev.agency || '').toUpperCase().includes('NASA');
    if (filter === 'ISRO')
      return (ev.agency || '').toUpperCase().includes('ISRO');
    return true;
  });

  return (
    <div style={{ padding: '1.5rem', color: '#e5e7eb', background: '#020617', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Upcoming Space Events</h1>

      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {[
          ['ALL', 'All'],
          ['LAUNCH', 'Launches'],
          ['METEOR', 'Meteor Showers'],
          ['ECLIPSE', 'Eclipses'],
          ['NASA', 'NASA'],
          ['ISRO', 'ISRO']
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              padding: '0.35rem 0.8rem',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: filter === value ? '#2563eb' : '#111827',
              color: '#e5e7eb',
              fontSize: '0.85rem',
              transition: 'background 0.2s ease'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p>Loading events…</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
          }}
        >
          {filtered.length === 0 && <p>No events for this filter.</p>}

          {filtered.map(ev => {
            const date = new Date(ev.startTime);
            const dateStr = isNaN(date.getTime()) ? 'TBD' : date.toLocaleString();

            const badgeColor =
              ev.type === 'launch'
                ? '#22c55e'
                : ev.type === 'meteor_shower'
                ? '#facc15'
                : ev.type === 'eclipse'
                ? '#f97316'
                : '#6b7280';

            return (
              <article
                key={ev.id}
                style={{
                  background: '#020617',
                  borderRadius: '0.75rem',
                  border: '1px solid #1f2937',
                  padding: '1rem',
                  transition: 'border-color 0.2s ease',
                  cursor: ev.detailsUrl ? 'pointer' : 'default'
                }}
                onMouseEnter={(e) => {
                  if (ev.detailsUrl) {
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1f2937';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1rem', margin: 0, flex: 1 }}>{ev.title}</h2>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      background: badgeColor,
                      color: '#020617',
                      marginLeft: '0.5rem',
                      textTransform: 'capitalize',
                      fontWeight: '600'
                    }}
                  >
                    {ev.type.replace('_', ' ')}
                  </span>
                </div>

                <p style={{ margin: '0.4rem 0', fontSize: '0.9rem' }}>
                  <strong>Time:</strong> {dateStr}
                </p>
                {ev.agency && (
                  <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>
                    <strong>Agency:</strong> {ev.agency}
                  </p>
                )}
                {ev.location && (
                  <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>
                    <strong>Location:</strong> {ev.location}
                  </p>
                )}
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#9ca3af' }}>
                  <strong>Source:</strong> {ev.source}
                </p>

                {ev.detailsUrl && (
                  <a
                    href={ev.detailsUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#60a5fa',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      display: 'inline-block',
                      marginTop: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    More details →
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

