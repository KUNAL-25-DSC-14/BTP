# Bangalore Traffic Prediction

A real-time **Bangalore Travel Time Prediction System** that uses live traffic and weather data to predict travel time between selected locations in Bangalore.

## 🚀 Live Demo

👉 **[Open Bangalore Traffic Prediction](https://bangalore-traffic-prediction.vercel.app/)**

## 📌 Project Overview

This project predicts travel time for different routes in Bangalore using live traffic and weather data.

The system integrates the **TomTom Traffic API** and **Open-Meteo API** to collect real-time traffic and weather information. These features are processed and passed to a trained Machine Learning model to predict the estimated travel time for a selected route.

The project consists of a ReactJS frontend and a FastAPI backend, deployed using Vercel and Render respectively.

## ✨ Features

- Real-time Bangalore traffic data
- Real-time weather data
- Source and destination selection
- Route distance calculation
- Traffic delay calculation
- Travel time prediction
- Machine Learning-based prediction
- Interactive ReactJS frontend
- FastAPI REST API
- Cloud deployment

## 🧠 Machine Learning

The project uses a **Gradient Boosting Regression** model for travel time prediction.

The model was trained using historical traffic and weather data containing features such as:

- Distance
- Traffic delay
- Hour
- Minute
- Day of week
- Weekend indicator
- Temperature
- Humidity
- Precipitation
- Rainfall
- Weather code
- Wind speed
- Rain indicator
- Source location
- Destination location
- Traffic period
- Rain intensity
- Route information

The final model uses **53 features** for prediction.

### Model Performance

| Metric | Value |
|---|---:|
| R² Score | **97.75%** |
| MAE | **1.31 minutes** |
| RMSE | **1.95 minutes** |

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     ReactJS UI      │
                    │       Vercel        │
                    └──────────┬──────────┘
                               │
                               │ Prediction Request
                               ▼
                    ┌─────────────────────┐
                    │    FastAPI Backend  │
                    │       Render        │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌────────────────┐          ┌────────────────┐
        │ TomTom Traffic │          │  Open-Meteo    │
        │      API       │          │      API       │
        └────────────────┘          └────────────────┘
                 │                           │
                 └─────────────┬─────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Feature Preparation │
                    │      53 Features    │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Gradient Boosting   │
                    │       Model         │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ Predicted Travel   │
                    │     Time (min)      │
                    └─────────────────────┘



⚙️ Tech Stack
Frontend
ReactJS
Vite
CSS
Backend
Python
FastAPI
Uvicorn
Pandas
Scikit-learn
Machine Learning
Gradient Boosting Regression
Pandas
NumPy
Scikit-learn
APIs
TomTom Traffic API
Open-Meteo API
Deployment
Vercel
Render
Project Structure

**BTP/**

│
├── backend/
│   ├── main.py
│   ├── gradient_boosting_model.pkl
│   ├── model_features.pkl
│   ├── model_metadata.json
│   ├── requirements.txt
│   └── runtime.txt
│
├── traffic-frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── components/
│   │       └── RouteResult.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
🔌 API

The FastAPI backend provides a prediction endpoint:
POST /predict
{
  "timestamp": "2026-09-19T18:30:00",
  "source": "Whitefield",
  "destination": "MG Road"
}
🔐 Environment Variables

API keys should not be committed to GitHub.

For local development, create:
backend/.env
For production, the TomTom API key is configured using the Render environment variables.

💻 Running Locally
1. Clone the Repository
git clone https://github.com/KUNAL-25-DSC-14/BTP.git
cd BTP
2. Start the Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
The backend will run at:

http://127.0.0.1:8000

FastAPI Swagger documentation:

http://127.0.0.1:8000/docs
3. Start the Frontend

Open another terminal:

cd traffic-frontend
npm install
npm run dev

The frontend will run at:

http://localhost:5173
🎯 Objective

The objective of this project is to develop a real-time machine learning system that estimates travel time for Bangalore routes using current traffic conditions, weather conditions, route information, and temporal features.

👨‍💻 Author

Kunal Kumar Singh
🔗 Links
🌐 Live Website: https://bangalore-traffic-prediction.vercel.app/
💻 GitHub Repository: https://github.com/KUNAL-25-DSC-14/BTP
📌 Project Status

The project is deployed and available online.

Frontend: Vercel
Backend: Render
Machine Learning Model: Gradient Boosting Regression
