import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet icons
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map centering component
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

export default function FarmerAssist() {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState({
        name: 'Nagpur, Maharashtra',
        fullName: 'Nagpur, Maharashtra, India',
        center: [21.1458, 79.0882],
        polygon: [[21.12, 79.06], [21.16, 79.06], [21.16, 79.11], [21.12, 79.11]]
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInsights(location);
    }, [location]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError('');

        try {
            const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
            const geoRes = await axios.get(geoUrl);

            if (geoRes.data && geoRes.data.length > 0) {
                const result = geoRes.data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                const delta = 0.02;
                const mockPolygon = [
                    [lat - delta, lon - delta],
                    [lat + delta, lon - delta],
                    [lat + delta, lon + delta],
                    [lat - delta, lon + delta]
                ];

                setLocation({
                    name: result.display_name.split(',')[0],
                    fullName: result.display_name,
                    center: [lat, lon],
                    polygon: mockPolygon
                });
            } else {
                setError('Location not found. Please try another name.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to search location.');
        } finally {
            setLoading(false);
        }
    };

    const fetchInsights = async (loc) => {
        setLoading(true);
        setTimeout(() => {
            const nameLower = (loc.fullName || loc.name).toLowerCase();
            const waterKeywords = ['sea', 'ocean', 'lake', 'river', 'bay', 'gulf'];
            const desertKeywords = ['desert', 'sahara', 'thar', 'kalahari'];

            let edgeCase = null;
            if (waterKeywords.some(w => nameLower.includes(w))) {
                edgeCase = 'water';
            } else if (desertKeywords.some(d => nameLower.includes(d))) {
                edgeCase = 'desert';
            }

            const seed = loc.name.length + loc.center[0] * 100;
            const mockData = generateMockData(seed, edgeCase, loc);
            setData(mockData);
            setLoading(false);
        }, 800);
    };

    const generateMockData = (seed, edgeCase, loc) => {
        if (edgeCase === 'water') {
            return {
                isEdgeCase: true,
                type: 'water',
                message: "This area appears to be a water body. Satellite agriculture analysis is not applicable.",
                color: '#3182ce',
                action: "NOT ARABLE LAND"
            };
        }
        if (edgeCase === 'desert') {
            return {
                isEdgeCase: true,
                type: 'desert',
                message: "This area appears to be a desert region. Extremely low vegetation index detected.",
                color: '#d69e2e',
                action: "EXTREME ARIDITY"
            };
        }

        const rain = Math.abs(Math.sin(seed) * 100) % 60;
        const ndvi = 0.4 + (Math.abs(Math.cos(seed)) * 0.5);
        const moisture = 0.2 + (Math.abs(Math.sin(seed * 2)) * 0.7);
        const pest = Math.abs(Math.cos(seed * 3)) % 1;
        const drought = Math.floor((1 - moisture) * 10);

        let action = "CONTINUE MONITORING";
        let rec = "Conditions are stable. Keep optimal moisture.";
        let color = "#4caf50";

        if (drought > 6) {
            action = "IRRIGATE IMMEDIATELY";
            rec = "Soil moisture critically low. Crop stress imminent.";
            color = "#e53e3e";
        } else if (pest > 0.7) {
            action = "INSPECT FOR PESTS";
            rec = "High humidity & temp favorable for pest outbreak.";
            color = "#dd6b20";
        } else if (rain > 30) {
            action = "DELAY FERTILIZER";
            rec = "Heavy rainfall predicted in next 48 hours.";
            color = "#3182ce";
        }

        let crops = [];
        const lat = loc.center[0];

        if (lat > 28) {
            crops = [
                { name: 'Wheat', profit: 'High', icon: '🌾' },
                { name: 'Mustard', profit: 'Med', icon: '🌼' },
                { name: 'Potato', profit: 'High', icon: '🥔' }
            ];
        } else if (lat < 20 && moisture > 0.5) {
            crops = [
                { name: 'Paddy (Rice)', profit: 'High', icon: '🍚' },
                { name: 'Coconut', profit: 'Stable', icon: '🥥' },
                { name: 'Spices', profit: 'Very High', icon: '🌶️' }
            ];
        } else if (lat > 20 && lat < 28 && moisture < 0.4) {
            crops = [
                { name: 'Cotton', profit: 'High', icon: '☁️' },
                { name: 'Soybean', profit: 'Med', icon: '🌱' },
                { name: 'Tur Dal', profit: 'Med', icon: '🥘' }
            ];
        } else {
            crops = [
                { name: 'Maize', profit: 'Med', icon: '🌽' },
                { name: 'Tomato', profit: 'High', icon: '🍅' },
                { name: 'Onion', profit: 'High', icon: '🧅' }
            ];
        }

        if (drought > 7) {
            crops = [{ name: 'Millet (Bajra)', profit: 'Resilient', icon: '🌾' }, ...crops.slice(0, 2)];
        }

        return {
            isEdgeCase: false,
            ndvi,
            rain_forecast: Math.floor(rain),
            soil_moisture: moisture,
            drought_risk: drought,
            pest_risk: pest,
            action,
            recommendation: rec,
            color,
            recommended_crops: crops
        };
    };

    // Inline styles to avoid CSS conflicts
    const styles = {
        container: {
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            background: '#f9fafb',
            color: '#111827',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            zIndex: 50
        },
        flexContainer: {
            display: 'flex',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative'
        },
        mapSection: {
            flex: 1,
            position: 'relative',
            zIndex: 0
        },
        searchBar: {
            position: 'absolute',
            top: '1rem',
            left: '3.5rem',
            zIndex: 1000,
            width: '20rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        },
        searchForm: {
            display: 'flex'
        },
        searchInput: {
            flex: 1,
            padding: '0.75rem',
            borderRadius: '0.5rem 0 0 0.5rem',
            border: 0,
            outline: 'none',
            color: '#374151',
            fontWeight: 500,
            height: '3rem',
            background: 'rgba(255,255,255,0.95)'
        },
        searchButton: {
            background: '#16a34a',
            color: 'white',
            padding: '0 1.5rem',
            borderRadius: '0 0.5rem 0.5rem 0',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            height: '3rem'
        },
        sidebar: {
            width: '450px',
            flexShrink: 0,
            height: '100%',
            minHeight: '100%',
            background: 'white',
            boxShadow: '-10px 0 15px -3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            overflowY: 'auto',
            borderLeft: '1px solid #e5e7eb'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.flexContainer}>
                {/* Map Section */}
                <div style={styles.mapSection}>
                    <MapContainer
                        center={location.center}
                        zoom={13}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', outline: 'none' }}
                    >
                        <ChangeView center={location.center} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Polygon
                            positions={location.polygon}
                            pathOptions={{ color: data?.color || 'blue', fillOpacity: 0.25, weight: 2, dashArray: '5, 5' }}
                        />
                        <Marker position={location.center}>
                            <Popup>{location.name}</Popup>
                        </Marker>
                    </MapContainer>

                    {/* Search Bar Overlay */}
                    <div style={styles.searchBar}>
                        <form onSubmit={handleSearch} style={styles.searchForm}>
                            <input
                                type="text"
                                style={styles.searchInput}
                                placeholder="Search locality (e.g., Nashik, Punjab)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" style={styles.searchButton}>
                                🔍
                            </button>
                        </form>
                        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem', fontSize: '0.75rem', marginTop: '0.25rem', borderRadius: '0.375rem', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>{error}</div>}
                    </div>
                </div>

                {/* Sidebar - All inline styles */}
                <div style={{
                    width: '450px',
                    flexShrink: 0,
                    height: '100%',
                    minHeight: '100%',
                    background: 'linear-gradient(to bottom, #f0fdf4, #d1fae5)',
                    boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 10,
                    overflowY: 'auto',
                    borderLeft: '1px solid #bbf7d0'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem',
                        background: 'linear-gradient(to right, #15803d, #16a34a)',
                        color: 'white',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                    }}>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>KisanSpace</h1>
                        <p style={{ color: '#bbf7d0', fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.9 }}>Satellite Intelligence for Farmers</p>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Location Header */}
                        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Analyzing Region</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', lineHeight: '1.25' }}>{location.name}</h2>
                            {data && location.center && (
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                                    Lat: {location.center[0].toFixed(2)} | Lon: {location.center[1].toFixed(2)}
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
                                <div style={{ width: '2.5rem', height: '2.5rem', border: '4px solid #bbf7d0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ color: '#6b7280', fontWeight: 500, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Processing Satellite Imagery...</p>
                            </div>
                        ) : data && (
                            <>
                                {data.isEdgeCase ? (
                                    <div style={{ padding: '1.5rem', borderRadius: '0.75rem', background: '#dbeafe', border: '1px solid #93c5fd', textAlign: 'center' }}>
                                        <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{data.type === 'water' ? '🌊' : '🏜️'}</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '0.5rem' }}>{data.action}</div>
                                        <p style={{ color: '#1d4ed8' }}>{data.message}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Action Card */}
                                        <div style={{
                                            padding: '1.5rem',
                                            borderRadius: '1rem',
                                            borderLeft: '4px solid',
                                            borderLeftColor: data.color === '#e53e3e' ? '#ef4444' : data.color === '#dd6b20' ? '#f97316' : data.color === '#3182ce' ? '#3b82f6' : '#22c55e',
                                            background: data.color === '#e53e3e' ? '#fef2f2' : data.color === '#dd6b20' ? '#fff7ed' : data.color === '#3182ce' ? '#eff6ff' : '#f0fdf4',
                                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                            transition: 'all 500ms'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                <div style={{ fontSize: '1.875rem' }}>
                                                    {data.color === '#e53e3e' ? '🚨' : data.color === '#dd6b20' ? '🐛' : data.color === '#3182ce' ? '☔' : '✅'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Action Required</div>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.25rem', lineHeight: '1.25', color: '#111827' }}>{data.action}</div>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 500, opacity: 0.8 }}>{data.recommendation}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Crops Section */}
                                        <div style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #d1fae5)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>💰 Suggested Cash Crops</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {data.recommended_crops.map((crop, idx) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '0.75rem', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <span style={{ fontSize: '1.25rem' }}>{crop.icon}</span>
                                                            <span style={{ fontWeight: 'bold', color: '#1f2937' }}>{crop.name}</span>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px' }}>
                                                            {crop.profit}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                            {/* NDVI */}
                                            <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Crop Vigor</div>
                                                <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: data.ndvi < 0.5 ? '#ef4444' : '#16a34a' }}>
                                                    {data.ndvi.toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>NDVI Index</div>
                                            </div>

                                            {/* Soil Moisture */}
                                            <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Soil Moisture</div>
                                                <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                    {(data.soil_moisture * 100).toFixed(0)}<span style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 'normal' }}>%</span>
                                                </div>
                                                <div style={{ width: '100%', background: '#f3f4f6', borderRadius: '9999px', height: '0.375rem', marginTop: '0.5rem' }}>
                                                    <div style={{ background: '#3b82f6', height: '0.375rem', borderRadius: '9999px', width: `${data.soil_moisture * 100}%` }}></div>
                                                </div>
                                            </div>

                                            {/* Rainfall */}
                                            <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Rain (48h)</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                                                    {data.rain_forecast} <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'normal' }}>mm</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>
                                                    {data.rain_forecast > 10 ? 'Rain Expected' : 'Dry Spell'}
                                                </div>
                                            </div>

                                            {/* Drought Risk */}
                                            <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Drought Risk</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: data.drought_risk > 5 ? '#dc2626' : '#16a34a' }}>
                                                    {data.drought_risk}<span style={{ fontSize: '0.875rem', color: '#d1d5db' }}>/10</span>
                                                </div>
                                            </div>

                                            {/* Pest Risk */}
                                            <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', gridColumn: 'span 2' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Pest Outbreak Probability</div>
                                                    <div style={{ fontWeight: 'bold', color: data.pest_risk > 0.6 ? '#f97316' : '#22c55e' }}>
                                                        {(data.pest_risk * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                                <div style={{ width: '100%', background: '#f3f4f6', borderRadius: '9999px', height: '0.5rem' }}>
                                                    <div style={{ height: '100%', borderRadius: '9999px', background: data.pest_risk > 0.6 ? '#f97316' : '#22c55e', width: `${data.pest_risk * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Subscribe Button */}
                                <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
                                    <button style={{
                                        width: '100%',
                                        background: '#111827',
                                        color: 'white',
                                        padding: '0.875rem 1rem',
                                        borderRadius: '0.75rem',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        fontWeight: 500,
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}>
                                        <span style={{ fontSize: '1.125rem' }}>📱</span>
                                        <span>Subscribe for Alerts</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
