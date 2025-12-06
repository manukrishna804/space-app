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

                {/* Sidebar - Using Tailwind classes from imported CSS */}
                <div className="w-[450px] shrink-0 h-full min-h-full bg-white shadow-2xl flex flex-col z-10 overflow-y-auto border-l border-gray-200">
                    <div className="p-5 bg-gradient-to-r from-green-700 to-green-600 text-white shadow relative">
                        <h1 className="text-xl font-bold tracking-tight">KisanSpace</h1>
                        <p className="text-green-100 text-xs mt-1 opacity-90">Satellite Intelligence for Farmers</p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Analyzing Region</div>
                            <h2 className="text-2xl font-bold text-gray-800 leading-tight">{location.name}</h2>
                            {data && location.center && (
                                <div className="text-xs text-gray-400 mt-1 font-mono">
                                    Lat: {location.center[0].toFixed(2)} | Lon: {location.center[1].toFixed(2)}
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                                <p className="text-gray-500 font-medium animate-pulse">Processing Satellite Imagery...</p>
                            </div>
                        ) : data && (
                            <>
                                {data.isEdgeCase ? (
                                    <div className="p-6 rounded-xl bg-blue-50 border border-blue-200 text-center">
                                        <div className="text-4xl mb-4">{data.type === 'water' ? '🌊' : '🏜️'}</div>
                                        <div className="text-xl font-bold text-blue-900 mb-2">{data.action}</div>
                                        <p className="text-blue-700">{data.message}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`p-6 rounded-2xl border-l-4 shadow-sm ${data.color === '#e53e3e' ? 'bg-red-50 border-red-500' :
                                            data.color === '#dd6b20' ? 'bg-orange-50 border-orange-500' :
                                                data.color === '#3182ce' ? 'bg-blue-50 border-blue-500' :
                                                    'bg-green-50 border-green-500'
                                            } transition-all duration-500`}>
                                            <div className="flex items-start gap-3">
                                                <div className="text-3xl">
                                                    {data.color === '#e53e3e' ? '🚨' : data.color === '#dd6b20' ? '🐛' : data.color === '#3182ce' ? '☔' : '✅'}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold opacity-70 uppercase tracking-wider mb-1">Action Required</div>
                                                    <div className="text-xl font-black mb-1 leading-tight text-gray-900">{data.action}</div>
                                                    <div className="text-sm font-medium opacity-80">{data.recommendation}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                                            <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3">💰 Suggested Cash Crops</div>
                                            <ul className="space-y-3">
                                                {data.recommended_crops.map((crop, idx) => (
                                                    <li key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl">{crop.icon}</span>
                                                            <span className="font-bold text-gray-800">{crop.name}</span>
                                                        </div>
                                                        <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                            {crop.profit}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Crop Vigor</div>
                                                <div className={`text-3xl font-bold ${data.ndvi < 0.5 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {data.ndvi.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">NDVI Index</div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Soil Moisture</div>
                                                <div className="text-3xl font-bold text-gray-800">
                                                    {(data.soil_moisture * 100).toFixed(0)}<span className="text-sm text-gray-400 font-normal">%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${data.soil_moisture * 100}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Rain (48h)</div>
                                                <div className="text-2xl font-bold text-gray-800">
                                                    {data.rain_forecast} <span className="text-xs text-gray-400 font-normal">mm</span>
                                                </div>
                                                <div className="text-xs text-blue-500 mt-1">
                                                    {data.rain_forecast > 10 ? 'Rain Expected' : 'Dry Spell'}
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Drought Risk</div>
                                                <div className={`text-2xl font-bold ${data.drought_risk > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {data.drought_risk}<span className="text-sm text-gray-300">/10</span>
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm col-span-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <div className="text-xs font-semibold text-gray-400 uppercase">Pest Outbreak Probability</div>
                                                    <div className={`font-bold ${data.pest_risk > 0.6 ? 'text-orange-500' : 'text-green-500'}`}>
                                                        {(data.pest_risk * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className={`h-full rounded-full ${data.pest_risk > 0.6 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${data.pest_risk * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="mt-4 pt-6 border-t border-gray-100">
                                    <button className="w-full bg-gray-900 hover:bg-black text-white py-3.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-3 font-medium">
                                        <span className="text-lg">📱</span>
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
