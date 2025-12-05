import React, { useEffect, useState } from 'react';

export default function EventDetailsModal({ event, onClose }) {
    const [timeLeft, setTimeLeft] = useState('');

    // Countdown logic for launches or upcoming events
    useEffect(() => {
        if (!event || !event.startTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const eventDate = new Date(event.startTime);
            const diff = eventDate - now;

            if (diff <= 0) {
                setTimeLeft('HAPPENING NOW / PAST');
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [event]);

    if (!event) return null;

    // --- RENDERING LOGIC ---

    // 1. LAUNCH VIEW
    // If it's a launch, we use the specific breakdown
    if (event.type === 'launch' || event.rawLaunch) {
        const launch = event.rawLaunch || event;
        const mission = launch.mission || {};
        const rocket = launch.rocket?.configuration || {};
        const pad = launch.pad || {};
        const image = launch.image || launch.rocket?.configuration?.image_url;

        return (
            <ModalShell onClose={onClose} image={image} title={launch.title} subtitle={launch.type} tagline={`T-MINUS: ${timeLeft}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Section title="🎯 Mission Briefing">
                            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                                {mission.description || "No mission description available for this launch."}
                            </p>
                        </Section>
                        <Section title="🚀 The Rocket">
                            <InfoCard title={rocket.name || "Unknown Rocket"}>
                                <p>Family: {rocket.family || "N/A"}</p>
                                <p>Variant: {rocket.variant || "N/A"}</p>
                            </InfoCard>
                        </Section>
                    </div>
                    <div className="space-y-6">
                        <Section title="📍 Launch Site">
                            <InfoCard title={pad.name || "Unknown Pad"}>
                                <p className="text-sm text-slate-400 mt-1">{pad.location?.name || "Unknown Location"}</p>
                                <a href={`https://www.google.com/maps/search/?api=1&query=${pad.latitude},${pad.longitude}`} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs text-blue-400 hover:text-blue-300">View on Map →</a>
                            </InfoCard>
                        </Section>
                        <Section title="🏢 Agency">
                            <div className="flex items-center gap-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                {launch.agency?.logo_url && <img src={launch.agency.logo_url} alt="Logo" className="h-10 w-10 object-contain bg-white rounded-full p-1" />}
                                <div>
                                    <p className="text-white font-medium">{launch.agency?.name || "Unknown Agency"}</p>
                                    <p className="text-xs text-slate-400">{launch.agency?.type || "Organization"}</p>
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    {launch.webcast_live && (
                        <a href={launch.webcast_live} target="_blank" rel="noreferrer" className="btn-primary bg-red-600 hover:bg-red-500 shadow-red-500/20">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" /> Watch Live
                        </a>
                    )}
                </div>
            </ModalShell>
        );
    }

    // 2. GENERIC EVENT VIEW (Agency, Meteor, Eclipse)
    const isAgency = event.type === 'agency_event';
    const displayImage = event.image || (isAgency ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080' : 'https://images.unsplash.com/photo-1532003885409-fea0d4a77881?q=80&w=1080');

    return (
        <ModalShell onClose={onClose} image={displayImage} title={event.title} subtitle={isAgency ? "Agency Event" : "Celestial Event"} tagline={isAgency ? "HAPPENING SOON" : `DATE: ${new Date(event.startTime).toLocaleDateString()}`}>
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Description */}
                <Section title={isAgency ? "📰 Event Details" : "✨ Phenomenon Details"}>
                    <p className="text-slate-300 leading-relaxed text-lg">
                        {event.description || "Detailed information for this event is currently not available, but it is definitely worth watching the skies!"}
                    </p>
                </Section>

                {/* Video Embed */}
                {event.video_url && (
                    <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-700">
                        <iframe
                            src={event.video_url.replace('watch?v=', 'embed/')}
                            title="Event Video"
                            className="w-full aspect-video"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* Location & Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.location && (
                        <Section title="📍 Location / Visibility">
                            <p className="text-slate-300">{event.location}</p>
                        </Section>
                    )}
                    {event.agency && (
                        <Section title="🏢 Organized By">
                            <p className="text-slate-300">{event.agency}</p>
                        </Section>
                    )}
                </div>

                {/* External Links */}
                <div className="pt-6 border-t border-slate-700/50 flex flex-wrap gap-4">
                    {event.news_url && (
                        <a href={event.news_url} target="_blank" rel="noreferrer" className="btn-secondary">
                            Read Original Article ↗
                        </a>
                    )}
                    {event.detailsUrl && (
                        <a href={event.detailsUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                            Source Data ↗
                        </a>
                    )}
                </div>
            </div>
        </ModalShell>
    );
}

// --- SUB-COMPONENTS FOR CONSISTENCY ---

function ModalShell({ onClose, image, title, subtitle, tagline, children }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl shadow-blue-900/10">

                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-slate-800 text-white transition-colors backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Hero */}
                <div className="relative h-72 w-full overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                        <span className="inline-block px-3 py-1 mb-2 text-xs font-bold tracking-wider text-blue-200 uppercase bg-blue-900/50 backdrop-blur-md rounded-full border border-blue-500/30">
                            {subtitle}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                            {title}
                        </h2>
                        <p className="text-blue-300 font-mono text-lg font-medium drop-shadow-md">
                            {tagline}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <section>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                {title}
            </h3>
            {children}
        </section>
    );
}

function InfoCard({ title, children }) {
    return (
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-colors">
            <p className="text-white font-medium text-lg mb-2">{title}</p>
            <div className="text-sm text-slate-400 space-y-1">
                {children}
            </div>
        </div>
    );
}
