import React, { useEffect, useState } from 'react';

export default function LaunchDetailsModal({ launch, onClose }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!launch) return;

        const interval = setInterval(() => {
            const now = new Date();
            const launchDate = new Date(launch.startTime);
            const diff = launchDate - now;

            if (diff <= 0) {
                setTimeLeft('LAUNCHED');
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [launch]);

    if (!launch) return null;

    // Helper to safely get nested data
    const mission = launch.mission || {};
    const rocket = launch.rocket?.configuration || {};
    const pad = launch.pad || {};
    const image = launch.image || launch.rocket?.configuration?.image_url;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl shadow-blue-500/10">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-slate-800 text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Hero Section */}
                <div className="relative h-64 md:h-80 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                    {image ? (
                        <img
                            src={image}
                            alt={launch.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                            No Image Available
                        </div>
                    )}

                    <div className="absolute bottom-6 left-6 right-6 z-20">
                        <span className="inline-block px-3 py-1 mb-2 text-xs font-bold tracking-wider text-blue-900 uppercase bg-blue-400 rounded-full">
                            {launch.type}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-1 leading-tight">
                            {launch.title}
                        </h2>
                        <p className="text-blue-300 font-mono text-lg">
                            T-MINUS: {timeLeft}
                        </p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column: Mission Details */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                <span className="text-2xl">🎯</span> Mission Briefing
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                                {mission.description || "No mission description available for this launch."}
                            </p>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                <span className="text-2xl">🚀</span> The Rocket
                            </h3>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <p className="text-white font-medium text-lg">{rocket.name || "Unknown Rocket"}</p>
                                <div className="mt-2 text-sm text-slate-400 space-y-1">
                                    <p>Family: {rocket.family || "N/A"}</p>
                                    <p>Variant: {rocket.variant || "N/A"}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Key Stats & Info */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                <span className="text-2xl">📍</span> Launch Site
                            </h3>
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <p className="text-white font-medium">{pad.name || "Unknown Pad"}</p>
                                <p className="text-sm text-slate-400 mt-1">{pad.location?.name || "Unknown Location"}</p>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${pad.latitude},${pad.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    View on Map →
                                </a>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                                <span className="text-2xl">🏢</span> Agency
                            </h3>
                            <div className="flex items-center gap-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                {launch.agency?.logo_url && (
                                    <img src={launch.agency.logo_url} alt="Agency" className="h-10 w-10 object-contain bg-white rounded-full p-1" />
                                )}
                                <div>
                                    <p className="text-white font-medium">{launch.agency?.name || "Unknown Agency"}</p>
                                    <p className="text-xs text-slate-400">{launch.agency?.type || "Organization"}</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 md:p-8 border-t border-slate-700/50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        Close
                    </button>
                    {launch.webcast_live && (
                        <a
                            href={launch.webcast_live} // Note: The API usually provides a 'vidURLs' array, we'll map this in parent
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium shadow-lg shadow-red-500/30 transition-all flex items-center gap-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            Watch Live
                        </a>
                    )}
                </div>

            </div>
        </div>
    );
}
