import { MapPin, ArrowRight } from "lucide-react";

function RouteSelector({ from, setFrom, to, setTo }) {

  const locations = [
    "Silk Board",
    "Electronic City",
    "Whitefield",
    "Marathahalli",
    "KR Puram",
    "Hebbal",
    "Indiranagar",
    "MG Road",
    "Koramangala",
    "Yeshwanthpur"
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <h3 className="text-lg font-semibold mb-5">
        Plan Your Route
      </h3>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">

        {/* FROM */}
        <div>
          <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <MapPin size={16} />
            From
          </label>

          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700
                       rounded-xl px-4 py-3 text-white
                       focus:outline-none focus:border-blue-500"
          >
            <option value="">Select starting point</option>

            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>


        {/* ARROW */}
        <div className="hidden md:flex justify-center pb-3">
          <ArrowRight className="text-blue-400" />
        </div>


        {/* TO */}
        <div>
          <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <MapPin size={16} />
            To
          </label>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700
                       rounded-xl px-4 py-3 text-white
                       focus:outline-none focus:border-blue-500"
          >
            <option value="">Select destination</option>

            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
}

export default RouteSelector;