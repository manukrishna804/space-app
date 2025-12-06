import FarmerAssistApp from '../../farmer-assist/frontend/src/App.jsx';
import 'leaflet/dist/leaflet.css';
import './FarmerAssistWrapper.css';

export default function FarmerAssistWrapper() {
    return (
        <div className="farmer-assist-reset">
            <FarmerAssistApp />
        </div>
    );
}
