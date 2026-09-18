function RouteResult({ from, to, distance }) {

  // Nothing selected yet
  if (!from || !to) {
    return null;
  }

  // Same location
  if (from === to) {
    return (
      <section className="route-warning">

        <div className="warning-icon">
          ⚠️
        </div>

        <div>
          <h3>
            Choose different locations
          </h3>

          <p>
            Starting point and destination cannot be the same.
          </p>
        </div>

      </section>
    );
  }


  return (
    <section className="route-result">

      {/* ================= HEADER ================= */}

      <div className="route-result-header">

        <div>

          <p className="section-label">
            🗺️ SELECTED ROUTE
          </p>

          <h3>
            Route Overview
          </h3>

        </div>


        <div className="route-status">
          ROUTE FOUND
        </div>

      </div>


      {/* ================= ROUTE ================= */}

      <div className="route-visual">

        {/* FROM */}

        <div className="route-point">

          <div className="point-icon from-point">
            ●
          </div>

          <div>

            <p>
              FROM
            </p>

            <strong>
              {from}
            </strong>

          </div>

        </div>


        {/* ROUTE LINE */}

        <div className="route-line">

          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>

        </div>


        {/* TO */}

        <div className="route-point">

          <div className="point-icon to-point">
            ●
          </div>

          <div>

            <p>
              TO
            </p>

            <strong>
              {to}
            </strong>

          </div>

        </div>

      </div>


      {/* ================= DISTANCE ================= */}

      <div className="distance-section">

        <div className="distance-icon">
          📏
        </div>

        <div>

          <p>
            Estimated Distance
          </p>

          <h4>
            {distance} km
          </h4>

        </div>

      </div>

    </section>
  );
}


/*
  IMPORTANT:
  App.jsx imports RouteResult as a default export.
*/

export default RouteResult;