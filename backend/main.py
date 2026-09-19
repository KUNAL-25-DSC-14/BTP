# ==========================================================
# PART 1 — IMPORTS AND CONFIGURATION
# ==========================================================
from datetime import datetime
from pathlib import Path
import os

import joblib
import pandas as pd
import requests

from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel














# ==========================================================
# PATHS
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "gradient_boosting_model.pkl"
FEATURES_PATH = BASE_DIR / "model_features.pkl"


# ==========================================================
# TOMTOM API KEY
# ==========================================================

load_dotenv()

TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")


# ==========================================================
# BANGALORE LOCATION COORDINATES
# ==========================================================

LOCATION_COORDINATES = {

    "Whitefield": "12.9698,77.7499",

    "MG Road": "12.9756,77.6061",

    "Electronic City": "12.8452,77.6602",

    "Silk Board": "12.9176,77.6238",

    "Marathahalli": "12.9591,77.6974",

    "KR Puram": "13.0075,77.6959",

    "Indiranagar": "12.9784,77.6408",

    "Koramangala": "12.9352,77.6245",

    "Hebbal": "13.0358,77.5970",

    "HSR Layout": "12.9116,77.6741",

    "JP Nagar": "12.9063,77.5857",

    "Banashankari": "12.9255,77.5468",

    "Hennur": "13.0298,77.6470",

    "Mahadevapura": "12.9913,77.6898",

    "Nagarbhavi": "12.9591,77.5119",

    "Vijayanagar": "12.9719,77.5300",

    "Yelahanka": "13.1007,77.5963",

    "Majestic": "12.9767,77.5713"
}
# ==========================================================
# PART 2 — TRAINING REFERENCE CATEGORIES
# ==========================================================

REFERENCE_CATEGORIES = {

    "source": "Banashankari",

    "destination": "Hebbal",

    "traffic_period": "Daytime",

    "rain_intensity": "Light_Rain",

    "route": "Banashankari_to_MG Road"
}


# ==========================================================
# LOAD TRAINED MODEL
# ==========================================================

model = joblib.load(MODEL_PATH)

model_features = joblib.load(FEATURES_PATH)
# ==========================================================
# PART 3 — FASTAPI APPLICATION
# ==========================================================

app = FastAPI(
    title="Bangalore Traffic Prediction API",
    description="API for predicting travel time in Bangalore",
    version="1.0.0"
)


# ==========================================================
# CORS CONFIGURATION
# ==========================================================

   
 
 app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://bangalore-traffic-prediction.vercel.app"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
 
 
 
 
 
 

 
 
 











# ==========================================================
# PART 4 — INPUT SCHEMA
# ==========================================================

class PredictionInput(BaseModel):

    timestamp: str

    source: str

    destination: str


# ==========================================================
# TRAFFIC PERIOD
# ==========================================================

def get_traffic_period(hour):

    if 7 <= hour <= 10:

        return "Morning_Rush"

    elif 17 <= hour <= 21:

        return "Evening_Rush"

    elif 11 <= hour <= 16:

        return "Daytime"

    else:

        return "Night"


# ==========================================================
# RAIN INTENSITY
# ==========================================================

def get_rain_intensity(rain):

    if rain == 0:

        return "No_Rain"

    elif rain <= 0.1:

        return "Light_Rain"

    else:

        return "Moderate_Rain"
    # ==========================================================
# PART 5 — GET LIVE WEATHER DATA
# ==========================================================

def get_weather_data():

    latitude = 12.9716

    longitude = 77.5946

    url = "https://api.open-meteo.com/v1/forecast"

    params = {

        "latitude": latitude,

        "longitude": longitude,

        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m"
        ],

        "timezone": "Asia/Kolkata"
    }

    try:

        response = requests.get(
            url,
            params=params,
            timeout=15
        )

        if response.status_code != 200:

            raise Exception(
                f"Weather API Error: {response.status_code}"
            )

        data = response.json()

        current = data["current"]

        weather = {

            "temperature_c":
                current["temperature_2m"],

            "humidity":
                current["relative_humidity_2m"],

            "precipitation_mm":
                current["precipitation"],

            "rain_mm":
                current["rain"],

            "weather_code":
                current["weather_code"],

            "wind_speed_kmh":
                current["wind_speed_10m"]
        }

        return weather

    except requests.exceptions.Timeout:

        raise Exception(
            "Weather API request timed out."
        )

    except requests.exceptions.RequestException as e:

        raise Exception(
            f"Weather API request failed: {str(e)}"
        )

    except Exception as e:

        raise Exception(str(e))
    # ==========================================================
# PART 6 — GET LIVE TOMTOM ROUTE DATA
# ==========================================================

def get_tomtom_route(origin, destination):

    # ------------------------------------------------------
    # Validate origin
    # ------------------------------------------------------

    if origin not in LOCATION_COORDINATES:

        raise Exception(
            f"Unknown origin: {origin}"
        )


    # ------------------------------------------------------
    # Validate destination
    # ------------------------------------------------------

    if destination not in LOCATION_COORDINATES:

        raise Exception(
            f"Unknown destination: {destination}"
        )


    # ------------------------------------------------------
    # Get coordinates
    # ------------------------------------------------------

    origin_coordinates = LOCATION_COORDINATES[
        origin
    ]

    destination_coordinates = LOCATION_COORDINATES[
        destination
    ]


    # ------------------------------------------------------
    # TomTom routing URL
    # ------------------------------------------------------

    url = (
        "https://api.tomtom.com/routing/1/calculateRoute/"
        f"{origin_coordinates}:{destination_coordinates}/json"
    )


    # ------------------------------------------------------
    # Request parameters
    # ------------------------------------------------------

    params = {

        "key": TOMTOM_API_KEY,

        "traffic": "true"
    }


    try:

        response = requests.get(
            url,
            params=params,
            timeout=15
        )


        # --------------------------------------------------
        # Check API response
        # --------------------------------------------------

        if response.status_code != 200:

            raise Exception(
                f"TomTom API Error: {response.status_code}"
            )


        data = response.json()


        # --------------------------------------------------
        # Get first route
        # --------------------------------------------------

        route = data["routes"][0]

        summary = route["summary"]


        # --------------------------------------------------
        # Distance
        # --------------------------------------------------

        distance_km = (
            summary["lengthInMeters"] / 1000
        )


        # --------------------------------------------------
        # Traffic delay
        # --------------------------------------------------

        traffic_delay_min = (

            summary.get(
                "trafficDelayInSeconds",
                0
            ) / 60

        )


        # --------------------------------------------------
        # Return route information
        # --------------------------------------------------

        return {

            "distance_km":
                round(distance_km, 2),

            "traffic_delay_min":
                round(traffic_delay_min, 2)
        }


    except requests.exceptions.Timeout:

        raise Exception(
            "TomTom API request timed out."
        )


    except requests.exceptions.RequestException as e:

        raise Exception(
            f"TomTom request failed: {str(e)}"
        )


    except Exception as e:

        raise Exception(str(e))
    # ==========================================================
# PART 7 — PREPARE MODEL INPUT
# ==========================================================

def prepare_model_input(input_data):

    # ------------------------------------------------------
    # Create dataframe with all 53 training features
    # ------------------------------------------------------

    input_encoded = pd.DataFrame(
        0.0,
        index=[0],
        columns=model_features
    )


    # ------------------------------------------------------
    # Numerical features
    # ------------------------------------------------------

    numerical_columns = [

        "distance_km",

        "traffic_delay_min",

        "hour",

        "day_of_week",

        "is_weekend",

        "temperature_c",

        "humidity",

        "precipitation_mm",

        "rain_mm",

        "weather_code",

        "wind_speed_kmh",

        "minute",

        "month",

        "is_raining"
    ]


    # ------------------------------------------------------
    # Copy numerical values
    # ------------------------------------------------------

    for column in numerical_columns:

        input_encoded.loc[0, column] = (
            input_data[column].iloc[0]
        )


    # ------------------------------------------------------
    # Categorical features
    # ------------------------------------------------------

    categorical_columns = [

        "source",

        "destination",

        "traffic_period",

        "rain_intensity",

        "route"
    ]


    # ------------------------------------------------------
    # One-hot encoding
    # ------------------------------------------------------

    for column in categorical_columns:

        value = input_data[column].iloc[0]

        reference = REFERENCE_CATEGORIES[column]


        # Reference category means all dummy columns
        # remain zero.

        if value == reference:

            continue


        dummy_column = f"{column}_{value}"


        # Only use columns that existed during training.

        if dummy_column in model_features:

            input_encoded.loc[
                0,
                dummy_column
            ] = 1


    return input_encoded
# ==========================================================
# PART 8 — HEALTH CHECK
# ==========================================================

@app.get("/")
def home():

    return {

        "message":
            "Bangalore Traffic Prediction API is running"
    }
# ==========================================================
# PART 9 — PREDICTION ENDPOINT
# ==========================================================

@app.post("/predict")
def predict_travel_time(data: PredictionInput):

    try:

        # ==================================================
        # 1. CURRENT TIMESTAMP
        # ==================================================

        timestamp = datetime.fromisoformat(
            data.timestamp.replace("Z", "+00:00")
        )

        hour = timestamp.hour

        minute = timestamp.minute

        day_of_week = timestamp.weekday()

        is_weekend = int(day_of_week >= 5)

        month = timestamp.month


        # ==================================================
        # 2. GET LIVE TOMTOM DATA
        # ==================================================

        route_data = get_tomtom_route(
            data.source.strip(),
            data.destination.strip()
        )

        distance_km = route_data["distance_km"]

        traffic_delay_min = route_data[
            "traffic_delay_min"
        ]


        # ==================================================
        # 3. GET LIVE WEATHER DATA
        # ==================================================

        weather = get_weather_data()

        temperature_c = weather[
            "temperature_c"
        ]

        humidity = weather[
            "humidity"
        ]

        precipitation_mm = weather[
            "precipitation_mm"
        ]

        rain_mm = weather[
            "rain_mm"
        ]

        weather_code = weather[
            "weather_code"
        ]

        wind_speed_kmh = weather[
            "wind_speed_kmh"
        ]


        # ==================================================
        # 4. FEATURE ENGINEERING
        # ==================================================

        traffic_period = get_traffic_period(
            hour
        )

        is_raining = int(
            rain_mm > 0
        )

        rain_intensity = get_rain_intensity(
            rain_mm
        )

        route = (
            data.source.strip()
            + "_to_"
            + data.destination.strip()
        )


        # ==================================================
        # 5. CREATE MODEL INPUT
        # ==================================================

        input_data = pd.DataFrame([{

            "distance_km":
                distance_km,

            "traffic_delay_min":
                traffic_delay_min,

            "hour":
                hour,

            "day_of_week":
                day_of_week,

            "is_weekend":
                is_weekend,

            "temperature_c":
                temperature_c,

            "humidity":
                humidity,

            "precipitation_mm":
                precipitation_mm,

            "rain_mm":
                rain_mm,

            "weather_code":
                weather_code,

            "wind_speed_kmh":
                wind_speed_kmh,

            "minute":
                minute,

            "month":
                month,

            "is_raining":
                is_raining,

            "source":
                data.source.strip(),

            "destination":
                data.destination.strip(),

            "traffic_period":
                traffic_period,

            "rain_intensity":
                rain_intensity,

            "route":
                route
        }])


        # ==================================================
        # 6. PREPARE 53 MODEL FEATURES
        # ==================================================

        input_encoded = prepare_model_input(
            input_data
        )


        # ==================================================
        # 7. ML PREDICTION
        # ==================================================

        prediction = model.predict(
            input_encoded
        )[0]


        # ==================================================
        # 8. RETURN RESPONSE
        # ==================================================

        return {

            "source":
                data.source,

            "destination":
                data.destination,

            "distance_km":
                distance_km,

            "traffic_delay_min":
                traffic_delay_min,

            "weather":
                weather,

            "predicted_travel_time_min":
                round(
                    float(prediction),
                    2
                )
        }


    except Exception as e:

        raise HTTPException(

            status_code=400,

            detail=str(e)
        )