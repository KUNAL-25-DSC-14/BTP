import { useState, useEffect } from "react";
import "./App.css";
import RouteResult from "./components/RouteResult";

function App() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [prediction, setPrediction] = useState(null);
  const [liveDistance, setLiveDistance] = useState(null);
  const [trafficDelay, setTrafficDelay] = useState(null);
  const [weather, setWeather] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ==========================================================
  // BANGALORE LOCATIONS
  // ==========================================================

  const locations = [
    "Banashankari",
    "Electronic City",
    "HSR Layout",
    "Hebbal",
    "Hennur",
    "Indiranagar",
    "JP Nagar",
    "KR Puram",
    "Mahadevapura",
    "Marathahalli",
    "Nagarbhavi",
    "Vijayanagar",
    "Whitefield",
    "Yelahanka",
    "MG Road",
    "Koramangala",
    "Silk Board",
    "Majestic",
  ];


  // ==========================================================
  // LIVE ML PREDICTION
  // ==========================================================

  const getPrediction = async () => {

    if (!from || !to || from === to) {

      setPrediction(null);
      setLiveDistance(null);
      setTrafficDelay(null);
      setWeather(null);
      setError("");

      return;
    }


    setLoading(true);
    setError("");


    try {

      const now = new Date();


      // ------------------------------------------------------
      // Send only route + timestamp
      // Backend gets live TomTom + weather data.
      // ------------------------------------------------------

      const response = await fetch(
        "https://btp-2-j4xd.onrender.com/predict",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            timestamp: now.toISOString(),
            source: from,
            destination: to,
          }),
        }
      );


      if (!response.ok) {

        const errorData = await response.json()
          .catch(() => null);

        throw new Error(
          errorData?.detail ||
          "Prediction request failed"
        );
      }


      const data = await response.json();


      console.log(
        "Prediction response:",
        data
      );


      // ------------------------------------------------------
      // Store backend response
      // ------------------------------------------------------

      setPrediction(
        data.predicted_travel_time_min
      );

      setLiveDistance(
        data.distance_km
      );

      setTrafficDelay(
        data.traffic_delay_min
      );

      setWeather(
        data.weather
      );

    } catch (err) {

      console.error(
        "Prediction error:",
        err
      );

      setError(
        err.message ||
        "Unable to get traffic prediction."
      );

      setPrediction(null);
      setLiveDistance(null);
      setTrafficDelay(null);
      setWeather(null);

    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // RUN PREDICTION WHEN ROUTE CHANGES
  // ==========================================================

  useEffect(() => {

    getPrediction();

  }, [from, to]);


  // ==========================================================
  // ETA CALCULATION
  // ==========================================================

  const calculateETA = () => {

    if (
      !liveDistance ||
      prediction === null
    ) {
      return null;
    }


    // Historical baseline speed assumption.
    // This can later be replaced by a dataset-derived
    // baseline.

    const normalSpeed = 35;


    const normalMinutes =
      (liveDistance / normalSpeed) * 60;


    const delayMinutes =
      prediction - normalMinutes;


    return {

      normalMinutes:
        Math.round(normalMinutes),

      predictedMinutes:
        Math.round(prediction),

      delayMinutes:
        Math.max(
          0,
          Math.round(delayMinutes)
        ),
    };
  };


  const eta = calculateETA();


  // ==========================================================
  // FORMAT DURATION
  // ==========================================================

  const formatDuration = (minutes) => {

    if (
      minutes === null ||
      minutes === undefined
    ) {
      return "--";
    }


    const hours =
      Math.floor(minutes / 60);

    const mins =
      minutes % 60;


    if (hours === 0) {

      return `${mins} min`;
    }


    if (mins === 0) {

      return `${hours} hr`;
    }


    return `${hours} hr ${mins} min`;
  };


  // ==========================================================
  // ARRIVAL TIME
  // ==========================================================

  const getArrivalTime = () => {

    if (!eta) {
      return "--";
    }


    const now = new Date();


    const arrival = new Date(
      now.getTime() +
      eta.predictedMinutes * 60 * 1000
    );


    return arrival.toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };


  const arrivalTime =
    getArrivalTime();


  // ==========================================================
  // WEATHER DESCRIPTION
  // ==========================================================

  const getWeatherDescription = () => {

    if (!weather) {
      return "Weather unavailable";
    }


    const code = weather.weather_code;


    if (code === 0) {
      return "Clear sky";
    }

    if (code === 1) {
      return "Mainly clear";
    }

    if (
      code === 2 ||
      code === 3
    ) {
      return "Partly cloudy";
    }

    if (
      code === 45 ||
      code === 48
    ) {
      return "Foggy";
    }

    if (
      code >= 51 &&
      code <= 67
    ) {
      return "Rain";
    }

    if (
      code >= 71 &&
      code <= 77
    ) {
      return "Snow";
    }

    if (
      code >= 80 &&
      code <= 82
    ) {
      return "Rain showers";
    }

    if (
      code >= 95
    ) {
      return "Thunderstorm";
    }

    return "Variable conditions";
  };


  // ==========================================================
  // RESET ROUTE DATA
  // ==========================================================

  const resetPredictionData = () => {

    setPrediction(null);
    setLiveDistance(null);
    setTrafficDelay(null);
    setWeather(null);
    setError("");
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="app">

      {/* ====================================================
          NAVBAR
      ==================================================== */}

      <nav className="navbar">

        <div className="logo">
          Bangalore Traffic AI
        </div>


        <div className="live-status">

          <span className="live-dot"></span>

          LIVE

        </div>

      </nav>


      {/* ====================================================
          MAIN CONTENT
      ==================================================== */}

      <main className="main-content">

        <h1>
          Traffic Overview
        </h1>


        <p className="subtitle">
          AI-powered travel time prediction for Bangalore
        </p>


        {/* ==================================================
            ROUTE CARD
        ================================================== */}

        <section className="route-card">

          <h2>
            Plan Your Route
          </h2>


          <div className="route-selectors">

            {/* ------------------------------------------------
                FROM
            ------------------------------------------------ */}

            <div className="select-group">

              <label>
                FROM
              </label>


              <select
                value={from}
                onChange={(e) => {

                  setFrom(
                    e.target.value
                  );

                  resetPredictionData();
                }}
              >

                <option value="">
                  Select starting point
                </option>


                {locations.map(
                  (location) => (

                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* ------------------------------------------------
                TO
            ------------------------------------------------ */}

            <div className="select-group">

              <label>
                TO
              </label>


              <select
                value={to}
                onChange={(e) => {

                  setTo(
                    e.target.value
                  );

                  resetPredictionData();
                }}
              >

                <option value="">
                  Select destination
                </option>


                {locations.map(
                  (location) => (

                    <option
                      key={location}
                      value={location}
                    >
                      {location}
                    </option>

                  )
                )}

              </select>

            </div>

          </div>


          {/* ------------------------------------------------
              SAME LOCATION WARNING
          ------------------------------------------------ */}

          {from &&
            to &&
            from === to && (

              <p className="route-warning">

                Starting point and destination
                cannot be the same.

              </p>

            )}


          {/* ------------------------------------------------
              LIVE DISTANCE
          ------------------------------------------------ */}

          {liveDistance &&
            from !== to && (

              <div className="distance-info">

                Live route distance:

                <strong>
                  {liveDistance} km
                </strong>

              </div>

            )}

        </section>


        {/* ==================================================
            ROUTE RESULT
        ================================================== */}

        {from &&
          to &&
          from !== to &&
          liveDistance && (

            <RouteResult
              from={from}
              to={to}
              distance={liveDistance}
            />

          )}


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (

          <div className="prediction-status">

            <p>
              Fetching live traffic and weather data...
            </p>

          </div>

        )}


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="prediction-error">

            {error}

          </div>

        )}


        {/* ==================================================
            ETA CARD
        ================================================== */}

        {!loading &&
          eta && (

            <section className="eta-card">

              <div className="eta-header">

                <span>
                  ESTIMATED TRAVEL TIME
                </span>

              </div>


              <div className="eta-main">

                <div className="eta-value">

                  {formatDuration(
                    eta.predictedMinutes
                  )}

                </div>


                <div className="eta-label">

                  AI predicted

                </div>

              </div>


              <div className="eta-details">

                {/* NORMAL TIME */}

                <div className="eta-detail">

                  <span>
                    Normal Time
                  </span>


                  <strong>
                    {formatDuration(
                      eta.normalMinutes
                    )}
                  </strong>

                </div>


                {/* DELAY */}

                <div className="eta-detail">

                  <span>
                    Model Delay
                  </span>


                  <strong>

                    +{formatDuration(
                      eta.delayMinutes
                    )}

                  </strong>

                </div>


                {/* ARRIVAL */}

                <div className="eta-detail">

                  <span>
                    Expected Arrival
                  </span>


                  <strong>
                    {arrivalTime}
                  </strong>

                </div>

              </div>

            </section>

          )}


        {/* ==================================================
            LIVE TRAFFIC + WEATHER
        ================================================== */}

        {!loading &&
          prediction !== null && (

            <section className="traffic-card">

              <div className="traffic-header">

                <span>
                  LIVE CONDITIONS
                </span>

              </div>


              <div className="traffic-content">


                {/* TRAFFIC */}

                <div className="traffic-icon">
                  🚦
                </div>


                <div>

                  <h3>
                    Traffic Prediction Active
                  </h3>


                  <p>
                    TomTom traffic delay:
                    {" "}

                    <strong>
                      {trafficDelay !== null
                        ? `${trafficDelay} min`
                        : "--"}
                    </strong>
                  </p>

                </div>

              </div>


              {/* ------------------------------------------------
                  WEATHER DATA
              ------------------------------------------------ */}

              {weather && (

                <div className="weather-info">

                  <div>

                    <span>
                      Temperature
                    </span>

                    <strong>
                      {weather.temperature_c}°C
                    </strong>

                  </div>


                  <div>

                    <span>
                      Humidity
                    </span>

                    <strong>
                      {weather.humidity}%
                    </strong>

                  </div>


                  <div>

                    <span>
                      Rain
                    </span>

                    <strong>
                      {weather.rain_mm} mm
                    </strong>

                  </div>


                  <div>

                    <span>
                      Wind
                    </span>

                    <strong>
                      {weather.wind_speed_kmh} km/h
                    </strong>

                  </div>


                  <div>

                    <span>
                      Conditions
                    </span>

                    <strong>
                      {getWeatherDescription()}
                    </strong>

                  </div>

                </div>

              )}

            </section>

          )}

      </main>

    </div>

  );
}


export default App;