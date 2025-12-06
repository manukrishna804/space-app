import React from 'react';
import './EventDetailsModal.css';

export default function EventDetailsModal({ event, onClose }) {
    if (!event) return null;

    const date = new Date(event.startTime);
    const dateStr = isNaN(date.getTime()) ? 'Date TBD' : date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    const timeStr = isNaN(date.getTime()) ? '' : date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    // Determine badge color
    let badgeClass = 'modal-badge-default';
    if (event.type === 'launch') badgeClass = 'modal-badge-green';
    else if (event.type === 'meteor_shower') badgeClass = 'modal-badge-yellow';
    else if (event.type === 'eclipse') badgeClass = 'modal-badge-orange';
    else if (event.type === 'agency_event') badgeClass = 'modal-badge-purple';

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="modal-close" onClick={onClose} aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Image Header */}
                {event.image && (
                    <div className="modal-image-container">
                        <div className="modal-image-overlay"></div>
                        <img src={event.image} alt={event.title} className="modal-image" />
                    </div>
                )}

                {/* Content */}
                <div className="modal-content">
                    {/* Badge */}
                    <div className={`modal-badge ${badgeClass}`}>
                        {event.type === 'launch' && '🚀 Launch'}
                        {event.type === 'meteor_shower' && '☄️ Meteor Shower'}
                        {event.type === 'eclipse' && '🌑 Eclipse'}
                        {event.type === 'agency_event' && '🏢 Event'}
                        {!['launch', 'meteor_shower', 'eclipse', 'agency_event'].includes(event.type) && event.type}
                    </div>

                    {/* Title */}
                    <h2 className="modal-title">{event.title}</h2>

                    {/* Date & Time */}
                    <div className="modal-datetime">
                        <div className="modal-date">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>{dateStr}</span>
                        </div>
                        {timeStr && (
                            <div className="modal-time">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                <span>{timeStr}</span>
                            </div>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="modal-info-grid">
                        {event.location && (
                            <div className="modal-info-item">
                                <div className="modal-info-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    Location
                                </div>
                                <div className="modal-info-value">{event.location}</div>
                            </div>
                        )}

                        {event.agency && (
                            <div className="modal-info-item">
                                <div className="modal-info-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    Agency
                                </div>
                                <div className="modal-info-value">{event.agency}</div>
                            </div>
                        )}

                        {event.source && (
                            <div className="modal-info-item">
                                <div className="modal-info-label">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 16v-4" />
                                        <path d="M12 8h.01" />
                                    </svg>
                                    Source
                                </div>
                                <div className="modal-info-value">{event.source}</div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div className="modal-section">
                            <h3 className="modal-section-title">Details</h3>
                            <p className="modal-description">{event.description}</p>
                        </div>
                    )}

                    {/* Launch-specific details */}
                    {event.type === 'launch' && event.rawLaunch && (
                        <div className="modal-section">
                            <h3 className="modal-section-title">Mission Information</h3>
                            <div className="modal-mission-grid">
                                {event.rawLaunch.mission?.name && (
                                    <div className="modal-mission-item">
                                        <span className="modal-mission-label">Mission:</span>
                                        <span className="modal-mission-value">{event.rawLaunch.mission.name}</span>
                                    </div>
                                )}
                                {event.rawLaunch.rocket?.configuration?.name && (
                                    <div className="modal-mission-item">
                                        <span className="modal-mission-label">Rocket:</span>
                                        <span className="modal-mission-value">{event.rawLaunch.rocket.configuration.name}</span>
                                    </div>
                                )}
                                {event.rawLaunch.status?.name && (
                                    <div className="modal-mission-item">
                                        <span className="modal-mission-label">Status:</span>
                                        <span className="modal-mission-value">{event.rawLaunch.status.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Links */}
                    <div className="modal-actions">
                        {event.detailsUrl && (
                            <a
                                href={event.detailsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="modal-link-button"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                More Details
                            </a>
                        )}
                        {event.news_url && (
                            <a
                                href={event.news_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="modal-link-button"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                                News Article
                            </a>
                        )}
                        {event.video_url && (
                            <a
                                href={event.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="modal-link-button"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                Watch Video
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
