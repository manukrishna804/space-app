import React, { useEffect, useState } from 'react';
import EventDetailsModal from './EventDetailsModal';

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
    description: 'A total lunar eclipse takes place when the Earth comes between the Sun and the Moon and covers the Moon with its shadow. When this happens, the Moon can turn red.',
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
    rawLaunch: l // Fundamental for rich modal
  }));
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // This state now holds ANY event type for the modal
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">

        {/* Header Section - Centered for better focus */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight pb-2">
            Upcoming Space Events
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            Track live launches, watch celestial events, and stay updated with the latest from NASA, ISRO, and more.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {[
              ['ALL', 'All'],
              ['LAUNCH', 'Launches'],
              ['AGENCY', 'Agency Events'],
              ['METEOR', 'Meteor Showers'],
              ['ECLIPSE', 'Eclipses'],
              ['NASA', 'NASA'],
              ['ISRO', 'ISRO']
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${filter === value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-500/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-500'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-blue-500 shadow-2xl shadow-blue-500/20"></div>
            <p className="text-slate-400 animate-pulse text-lg">Scanning the cosmos...</p>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-lg p-6 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-center backdrop-blur-sm">
            <div className="text-3xl mb-2">⚠️</div>
            {error}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                <span className="text-4xl mb-4">🔭</span>
                <p className="text-xl">No events found matching this filter.</p>
              </div>
            )}

            {filtered.map(ev => {
              const date = new Date(ev.startTime);
              const dateStr = isNaN(date.getTime()) ? 'Date TBD' : date.toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric'
              });
              const timeStr = isNaN(date.getTime()) ? '' : date.toLocaleTimeString(undefined, {
                hour: '2-digit', minute: '2-digit'
              });

              // Badge Styles
              let badgeColor = 'bg-slate-700 text-slate-300';
              let badgeLabel = ev.type.replace('_', ' ');
              if (ev.type === 'launch') { badgeColor = 'bg-green-500/10 text-green-400 border-green-500/20'; badgeLabel = 'Launch' }
              else if (ev.type === 'meteor_shower') { badgeColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'; badgeLabel = 'Meteor Shower' }
              else if (ev.type === 'eclipse') { badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20'; badgeLabel = 'Eclipse' }
              else if (ev.type === 'agency_event') { badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20'; badgeLabel = 'Event' }

              return (
                <article
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className="
                    group flex flex-col h-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 
                    hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2
                    transition-all duration-300 cursor-pointer
                  "
                >
                  {/* Card Image Header */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-950 shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                    {ev.image ? (
                      <img
                        src={ev.image}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                        <span className="text-5xl opacity-20">🌌</span>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 z-20">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border backdrop-blur-md uppercase tracking-wide shadow-lg ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="flex flex-col flex-1 p-6 md:p-8">
                    <div className="mb-4">
                      <p className="text-xs font-mono text-blue-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
                        <span>📅 {dateStr}</span>
                        {timeStr && <span className="opacity-50">| {timeStr}</span>}
                      </p>
                      <h2 className="text-xl font-bold text-white leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                        {ev.title}
                      </h2>
                    </div>

                    <p className="text-sm text-slate-400 mb-6 line-clamp-3 leading-relaxed flex-1">
                      {ev.description || "Click to explore full details about this mission, timing, and visibility."}
                    </p>

                    <div className="pt-5 border-t border-slate-800 flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-2 max-w-[60%]">
                        {ev.agency && (
                          <span className="text-xs font-medium text-slate-500 bg-slate-800/80 px-2 py-1 rounded truncate">
                            {ev.agency}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-blue-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Universal Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
