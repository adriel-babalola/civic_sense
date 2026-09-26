import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { NIGERIA_BOUNDS } from "../../data/states";
import { STATE_BOUNDARIES, BOUNDARY_ATTRIBUTION } from "../../data/nigeria-boundaries";
import { INCIDENT_META } from "../../utils/constants";
import { cn } from "../../utils/cn";

/**
 * Incident map.
 *
 * NO TILE LAYER — read this before "improving" the map.
 *
 * A raster tile server learns the visitor's IP address and the exact rectangle
 * they are looking at, on every single tile request. That is a location
 * disclosure, made by the map, to a third party, on a page whose entire pitch
 * is that we do not do that. So the basemap is drawn here instead, from state
 * boundaries compiled into the bundle: no request leaves the origin, and the
 * privacy page stays true.
 *
 * Two things that are easy to get wrong and were:
 *
 *   1. The caller owns the height. This component never sets one, because a
 *      `h-full` here and an `h-[560px]` at the call site both compile to
 *      `height` and the winner is whichever Tailwind happens to emit last. The
 *      element is `position: relative` with a minimum, so a caller that forgets
 *      to pass a height gets a usable box rather than a collapsed one.
 *   2. Leaflet caches its size at init. If the container is laid out after the
 *      map is created, which it is whenever the filter row above it reflows,
 *      the map keeps rendering into a zero-sized pane and looks broken. The
 *      ResizeObserver below is not a nicety; it is the fix.
 */

const MARKER_COLOR = {
  violence: "#ef4444",
  misconduct: "#f59e0b",
  unrest: "#f97316",
};

const MARKER_SIZE = 14;

/** Graticule every 2 degrees. Generated in the browser, so it costs no request. */
function graticuleDataUri() {
  const { southWest, northEast } = NIGERIA_BOUNDS;
  const [minLat, minLng] = southWest;
  const [maxLat, maxLng] = northEast;

  const parts = [];
  for (let lat = Math.ceil(minLat / 2) * 2; lat <= maxLat; lat += 2) {
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    parts.push(
      `<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="#ffffff" stroke-opacity="0.07" stroke-width="0.5"/>`,
      `<text x="1" y="${y - 1}" fill="#ffffff" fill-opacity="0.22" font-size="2.4">${lat}°N</text>`,
    );
  }
  for (let lng = Math.ceil(minLng / 2) * 2; lng <= maxLng; lng += 2) {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    parts.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="100" stroke="#ffffff" stroke-opacity="0.07" stroke-width="0.5"/>`,
      `<text x="${x + 1}" y="98" fill="#ffffff" fill-opacity="0.22" font-size="2.4">${lng}°E</text>`,
    );
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${parts.join("")}</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function markerIcon(type, isActive) {
  const color = MARKER_COLOR[type] || "#737373";
  const size = isActive ? MARKER_SIZE + 4 : MARKER_SIZE;

  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;background:${color};border:2px solid #0a0a0a;border-radius:3px;box-shadow:0 0 0 ${isActive ? 3 : 0}px ${color}66, 0 0 12px ${color}40;opacity:0.95"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * @param {object[]} markers Incidents with a `coords` field.
 * @param {string|null} activeId Currently selected incident, highlighted.
 * @param {(id: string) => void} onSelect Fired on marker click.
 * @param {string} className Height and layout. The caller must set a height.
 */
export function IncidentMap({ markers, activeId, onSelect, center, zoom, className }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Create the map once. It is never torn down on a data change, because
  // recreating it would drop the user's zoom and pan on every poll.
  useEffect(() => {
    const map = L.map(containerRef.current, {
      center: center || [9.08, 8.68],
      zoom: zoom ?? 6,
      minZoom: 5,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: false,
    });

    // The basemap: a graticule for scale, then the state outlines on top of it.
    L.imageOverlay(graticuleDataUri(), [
      [NIGERIA_BOUNDS.southWest[0], NIGERIA_BOUNDS.southWest[1]],
      [NIGERIA_BOUNDS.northEast[0], NIGERIA_BOUNDS.northEast[1]],
    ]).addTo(map);

    L.geoJSON(STATE_BOUNDARIES, {
      interactive: false,
      style: {
        color: "#3f3f46",
        weight: 1,
        fillColor: "#111113",
        fillOpacity: 1,
      },
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    map.fitBounds([NIGERIA_BOUNDS.southWest, NIGERIA_BOUNDS.northEast], {
      padding: [12, 12],
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
    // `center` and `zoom` are module constants at every call site, so listing
    // them here does not recreate the map on a poll.
  }, [center, zoom]);

  // Leaflet measures its container once. Anything that changes the size after
  // that, which is every reflow of the filter row above the map, leaves it
  // drawing into a stale pane. This is the difference between a working map and
  // a blank grey box.
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(() => {
      // Guard against the zero-size notification Leaflet itself fires while it
      // is laying out, which would otherwise bounce between states.
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        map.invalidateSize({ animate: false });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Redraw markers whenever the set or the selection changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current) layersRef.current.clearLayers();

    const group = L.layerGroup().addTo(map);
    layersRef.current = group;

    for (const incident of markers) {
      const isActive = incident.id === activeId;
      L.marker(incident.coords, {
        icon: markerIcon(incident.type, isActive),
        keyboard: true,
        title: `${INCIDENT_META[incident.type]?.label || "Incident"} in ${incident.state}`,
        alt: `${INCIDENT_META[incident.type]?.label || "Incident"} in ${incident.state}`,
        riseOnHover: true,
      })
        .on("click", () => onSelectRef.current?.(incident.id))
        .addTo(group);
    }
  }, [markers, activeId]);

  return (
    <div
      className={cn(
        // No height here on purpose. See the note at the top of the file.
        "cs-map relative min-h-[320px] overflow-hidden rounded-card border border-line bg-[#080808]",
        className,
      )}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* Leaflet renders these in its own panes; the dark theme is applied here
          because there is no stylesheet hook for the control internals. */}
      <style>{`
        .cs-map .leaflet-container { background: transparent; font-family: inherit; }
        .cs-map .leaflet-tile-pane { background: transparent; }
        .cs-map .leaflet-overlay-pane svg { filter: none; }
        .cs-map .leaflet-control-zoom { border: 1px solid var(--cs-border); border-radius: 8px; overflow: hidden; }
        .cs-map .leaflet-control-zoom a {
          background: var(--cs-surface); color: var(--cs-fg-secondary);
          border-bottom: 1px solid var(--cs-border); width: 28px; height: 28px; line-height: 26px;
        }
        .cs-map .leaflet-control-zoom a:hover { background: var(--cs-card-active); color: var(--cs-fg); }
        .cs-map .leaflet-marker-icon { cursor: pointer; transition: transform 150ms ease; }
        .cs-map .leaflet-marker-icon:hover { transform: scale(1.15); }
        .cs-map .leaflet-container:focus-visible { outline: 2px solid var(--cs-brand-bright); outline-offset: -2px; }
      `}</style>

      <p className="pointer-events-none absolute left-3 top-3 z-[500] rounded-control border border-line bg-surface/85 px-2 py-1 text-2xs text-fg-faint backdrop-blur-sm">
        {markers.length} plotted · markers sit at state-capital coordinates
      </p>

      {/* Attribution is a licence condition of the boundary data, so it is on
          the map rather than buried in a footer. */}
      <p className="pointer-events-none absolute bottom-2 left-3 z-[500] max-w-[80%] text-[10px] leading-tight text-fg-faint">
        {BOUNDARY_ATTRIBUTION}
      </p>
    </div>
  );
}

export default IncidentMap;
