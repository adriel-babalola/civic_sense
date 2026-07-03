import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { fetchIncidents } from "../api/client";
import IncidentCard from "../components/IncidentCard";
import { RefreshCw, MapPin } from "lucide-react";

const STATE_COORDS = {
  "Abia": [5.45, 7.49], "Adamawa": [9.33, 12.38], "Akwa Ibom": [5.0, 7.83],
  "Anambra": [6.22, 6.94], "Bauchi": [10.31, 9.84], "Bayelsa": [4.77, 6.07],
  "Benue": [7.73, 8.54], "Borno": [11.83, 13.15], "Cross River": [5.87, 8.60],
  "Delta": [5.50, 5.99], "Ebonyi": [6.25, 8.10], "Edo": [6.33, 5.60],
  "Ekiti": [7.67, 5.25], "Enugu": [6.44, 7.49], "FCT": [8.99, 7.18],
  "Gombe": [10.27, 11.17], "Imo": [5.48, 7.03], "Jigawa": [12.0, 9.75],
  "Kaduna": [10.52, 7.44], "Kano": [12.00, 8.52], "Katsina": [12.99, 7.60],
  "Kebbi": [11.5, 4.0], "Kogi": [7.80, 6.74], "Kwara": [8.50, 4.55],
  "Lagos": [6.52, 3.38], "Nasarawa": [8.56, 7.71], "Niger": [9.92, 6.95],
  "Ogun": [7.16, 3.35], "Ondo": [7.25, 5.20], "Osun": [7.65, 4.56],
  "Oyo": [8.16, 3.93], "Plateau": [9.93, 8.89], "Rivers": [4.82, 7.03],
  "Sokoto": [13.06, 5.25], "Taraba": [8.00, 10.52], "Yobe": [11.75, 11.97],
  "Zamfara": [12.17, 6.65],
};

const MARKER_COLORS = {
  violence: "#EF4444",
  misconduct: "#F59E0B",
  unrest: "#E8650A",
};

export default function Map() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  async function refresh() {
    try {
      const data = await fetchIncidents();
      setIncidents(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [9.08, 8.68],
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    incidents.forEach((incident) => {
      const coords = STATE_COORDS[incident.state];
      if (!coords) return;

      const color = MARKER_COLORS[incident.type] || "#6B7280";
      const icon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:${color};border:2px solid #050505;border-radius:2px;opacity:0.9"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: "",
      });

      const date = incident.timestamp
        ? new Date(incident.timestamp).toLocaleDateString()
        : "";

      const marker = L.marker(coords, { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;background:#141414;color:#a3a3a3;font-size:13px;max-width:250px;border-radius:12px;padding:4px;">
          <strong style="color:#fff;">${incident.state}, ${incident.lga}</strong><br/>
          ${incident.description.substring(0, 120)}${incident.description.length > 120 ? "..." : ""}<br/>
          <span style="color:#525252;font-size:11px;">${date}</span>
        </div>
      `);

      markersRef.current.push(marker);
    });
  }, [incidents]);

  const violence = incidents.filter((i) => i.type === "violence").length;
  const misconduct = incidents.filter((i) => i.type === "misconduct").length;
  const unrest = incidents.filter((i) => i.type === "unrest").length;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-neutral-900/80 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Incident Map</h1>
            <p className="text-sm text-neutral-400">
              Verified incidents across Nigeria
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2.5 h-2.5 rounded bg-red-500" /> {violence} Violence
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" /> {misconduct} Misconduct
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2.5 h-2.5 rounded bg-orange-500" /> {unrest} Unrest
            </span>
            <button
              onClick={refresh}
              className="flex items-center gap-1 text-neutral-500 hover:text-neutral-200 transition-colors"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[300px] sm:h-[400px] border-b border-neutral-900/80"
        style={{ background: "#0D1B2A" }}
      />

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={14} className="text-neutral-500" />
            <h2 className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
              Recent Incidents ({incidents.length})
            </h2>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-5 h-32">
                  <div className="skeleton-shimmer h-full rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {!loading && incidents.length === 0 && (
            <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-12 text-center backdrop-blur-sm">
              <p className="text-sm text-neutral-400">No incidents reported yet.</p>
            </div>
          )}

          {!loading && incidents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {incidents.map((incident, i) => (
                <IncidentCard key={i} incident={incident} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
