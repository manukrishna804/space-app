import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './index.css';

// Fix for Leaflet default icon issues in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map centering
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

function App() {
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
      // 1. Geocode with Nominatim (OpenStreetMap)
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
      const geoRes = await axios.get(geoUrl);

      if (geoRes.data && geoRes.data.length > 0) {
        const result = geoRes.data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        // Create a mock polygon
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
      // EDGE CASE DETECTION
      const nameLower = (loc.fullName || loc.name).toLowerCase();
      const waterKeywords = ['sea', 'ocean', 'lake', 'river', 'bay', 'gulf'];
      const desertKeywords = ['desert', 'sahara', 'thar', 'kalahari'];

      let edgeCase = null;
      if (waterKeywords.some(w => nameLower.includes(w))) {
        edgeCase = 'water';
      } else if (desertKeywords.some(d => nameLower.includes(d))) {
        edgeCase = 'desert';
      }

      const seed = loc.name.length + loc.center[0] * 100; // Better seed using lat
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

    // Normal Agricultural Data
    // Use modulo with primes to get varied stats
    const rain = Math.abs(Math.sin(seed) * 100) % 60; // 0-60mm
    const ndvi = 0.4 + (Math.abs(Math.cos(seed)) * 0.5); // 0.4 - 0.9
    const moisture = 0.2 + (Math.abs(Math.sin(seed * 2)) * 0.7); // 0.2 - 0.9
    const pest = Math.abs(Math.cos(seed * 3)) % 1; // 0-1
    const drought = Math.floor((1 - moisture) * 10);
    const heat = Math.abs(Math.sin(seed * 4)) > 0.7;

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

    // CROP RECOMMENDATIONS - Region & Climate Aware
    // Using simple hashing of name/lat to deterine "zone"
    let crops = [];
    const lat = loc.center[0];

    // Very rough "climate zones" simulation
    if (lat > 28) { // North (Wheat/Mustard belt)
      crops = [
        { name: 'Wheat', profit: 'High', icon: '🌾' },
        { name: 'Mustard', profit: 'Med', icon: '🌼' },
        { name: 'Potato', profit: 'High', icon: '🥔' }
      ];
    } else if (lat < 20 && moisture > 0.5) { // South/Coastal/Wet (Rice/Spices)
      crops = [
        { name: 'Paddy (Rice)', profit: 'High', icon: '🍚' },
        { name: 'Coconut', profit: 'Stable', icon: '🥥' },
        { name: 'Spices', profit: 'Very High', icon: '🌶️' }
      ];
    } else if (lat > 20 && lat < 28 && moisture < 0.4) { // Central/Arid (Cotton/Soybean/Pulses)
      crops = [
        { name: 'Cotton', profit: 'High', icon: '☁️' },
        { name: 'Soybean', profit: 'Med', icon: '🌱' },
        { name: 'Tur Dal', profit: 'Med', icon: '🥘' }
      ];
    } else { // Generalized
      crops = [
        { name: 'Maize', profit: 'Med', icon: '🌽' },
        { name: 'Tomato', profit: 'High', icon: '🍅' },
        { name: 'Onion', profit: 'High', icon: '🧅' }
      ];
    }

    // Adjust for current conditions
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
      heat_risk: heat,
      action,
      recommendation: rec,
      color,
      recommended_crops: crops
    };
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 text-gray-900 font-sans z-50">
      <div className="flex flex-1 w-full h-full overflow-hidden relative">
        {/* Map Section */}
        <div className="flex-1 relative z-0">
          <MapContainer center={location.center} zoom={13} scrollWheelZoom={true} className="h-full w-full outline-none">
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

          {/* Overlay Search Bar on Map (Top Left) */}
          <div className="absolute top-4 left-14 z-[1000] w-80 md:w-96 shadow-lg">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                className="flex-1 p-3 rounded-l-lg border-0 outline-none text-gray-700 font-medium h-12"
                placeholder="Search locality (e.g., Nashik, Punjab)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.95)' }}
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-r-lg font-bold transition h-12"
              >
                🔍
              </button>
            </form>
            {error && <div className="bg-red-100 text-red-700 p-2 text-xs mt-1 rounded shadow">{error}</div>}
          </div>
        </div>

        {/* Sidebar Info Panel */}
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
                  // EDGE CASE UI
                  <div className="p-6 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <div className="text-4xl mb-4">{data.type === 'water' ? '🌊' : '🏜️'}</div>
                    <div className="text-xl font-bold text-blue-900 mb-2">{data.action}</div>
                    <p className="text-blue-700">{data.message}</p>
                  </div>
                ) : (
                  // NORMAL AGRICULTURE UI
                  <>
                    <div className={`p-6 rounded-2xl border-l-4 shadow-sm ${data.color === '#e53e3e' ? 'bg-red-50 border-red-500' :
                      data.color === '#dd6b20' ? 'bg-orange-50 border-orange-500' :
                        data.color === '#3182ce' ? 'bg-blue-50 border-blue-500' :
                          'bg-green-50 border-green-500'
                      } transition-all duration-500`}>
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">
                          {data.color === '#e53e3e' ? '🚨' :
                            data.color === '#dd6b20' ? '🐛' :
                              data.color === '#3182ce' ? '☔' : '✅'}
                        </div>
                        <div>
                          <div className="text-xs font-bold opacity-70 uppercase tracking-wider mb-1">Action Required</div>
                          <div className="text-xl font-black mb-1 leading-tight text-gray-900">
                            {data.action}
                          </div>
                          <div className="text-sm font-medium opacity-80">
                            {data.recommendation}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NEW SECTION: Suitable Crops */}
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

                    {/* Grid of Factors - Restored */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* NDVI */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Crop Vigor</div>
                        <div className={`text-3xl font-bold ${data.ndvi < 0.5 ? 'text-red-500' : 'text-green-600'
                          }`}>
                          {data.ndvi.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">NDVI Index</div>
                      </div>

                      {/* Soil */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Soil Moisture</div>
                        <div className="text-3xl font-bold text-gray-800">
                          {(data.soil_moisture * 100).toFixed(0)}<span className="text-sm text-gray-400 font-normal">%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${data.soil_moisture * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Rainfall */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Rain (48h)</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {data.rain_forecast} <span className="text-xs text-gray-400 font-normal">mm</span>
                        </div>
                        <div className="text-xs text-blue-500 mt-1">
                          {data.rain_forecast > 10 ? 'Rain Expected' : 'Dry Spell'}
                        </div>
                      </div>

                      {/* Drought Risk */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Drought Risk</div>
                        <div className={`text-2xl font-bold ${data.drought_risk > 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {data.drought_risk}<span className="text-sm text-gray-300">/10</span>
                        </div>
                      </div>

                      {/* Pest Risk */}
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

                {/* Footer */}
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

export default App;
