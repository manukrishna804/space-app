from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random

app = FastAPI()

# Mock Data Storage (Regions)
REGIONS = {
    "nagpur": {
        "id": "nagpur",
        "name": "Nagpur Region",
        "ndvi": 0.52,
        "rain_forecast_48h": 0.0,
        "soil_moisture": 0.18, 
        "drought_score": 7,
        "pest_risk": 0.3,
        "recommendation": "Critically low moisture in Vidarbha belt.",
        "action": "START IRRIGATION CYCLES"
    },
    "nashik": {
        "id": "nashik",
        "name": "Nashik Region",
        "ndvi": 0.72,
        "rain_forecast_48h": 15.0,
        "soil_moisture": 0.40,
        "drought_score": 2,
        "pest_risk": 0.1,
        "recommendation": "Good crop health. Rain predicted.",
        "action": "DELAY FERTILIZER"
    },
    "coastal": {
        "id": "coastal",
        "name": "Konkan Coast",
        "ndvi": 0.65,
        "rain_forecast_48h": 45.0,
        "soil_moisture": 0.55,
        "drought_score": 0,
        "pest_risk": 0.85, 
        "recommendation": "High humidity causing fungal risk.",
        "action": "PEST CONTROL ALERT"
    }
}

class SubscriptionRequest(BaseModel):
    region_id: str
    phone: str
    language: str

@app.get("/api/region/{region_id}/overview")
def get_region_overview(region_id: str):
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail="Region not found")
    return REGIONS[region_id]

@app.get("/api/region/{region_id}/timeseries")
def get_region_timeseries(region_id: str, metric: str = 'ndvi'):
    # Generate mock time-series data
    if region_id not in REGIONS:
        raise HTTPException(status_code=404, detail="Region not found")
    
    # Simple mock trend generator
    base_val = REGIONS[region_id].get(metric, 0.5)
    data = []
    import datetime
    start_date = datetime.date.today() - datetime.timedelta(days=30)
    
    for i in range(30):
        date = start_date + datetime.timedelta(days=i)
        # Add some random noise
        val = base_val + random.uniform(-0.05, 0.05)
        val = max(0, min(1, val)) # Clamp 0-1
        data.append({"date": date.isoformat(), "value": val})
        
    return data

@app.post("/api/subscribe")
def subscribe_alerts(req: SubscriptionRequest):
    # In a real app, save to DB and trigger Twilio
    print(f"Subscribed {req.phone} to {req.region_id} in {req.language}")
    return {"status": "success", "message": "Subscribed successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
