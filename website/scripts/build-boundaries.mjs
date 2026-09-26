/**
 * Build the bundled Nigeria state boundary file.
 *
 * WHY THIS EXISTS
 *
 * The incident map deliberately loads no tile server: a raster tile request
 * hands a third party the visitor's IP address and the exact rectangle they are
 * looking at, on a site whose pitch is that we do not do that. A graticule
 * alone, though, reads as a broken map rather than a private one.
 *
 * So we draw the country ourselves, from boundaries compiled into the bundle.
 * Nothing is requested at runtime, so the privacy page stays true and the map
 * still looks like a map.
 *
 * SOURCE
 *
 * geoBoundaries gbOpen, ADM1 (state) for Nigeria, build 9469f09.
 *   https://www.geoboundaries.org/
 *   Boundary source: GRID3 Nigeria state boundaries.
 *   Licence: CC BY 4.0, so the attribution travels with the data in
 *   src/data/nigeria-boundaries.js and is rendered on the map itself.
 *
 * The raw simplified GeoJSON is ~830 KB, which is not something to ship to
 * every visitor. This script simplifies the rings (Douglas-Peucker), drops the
 * smallest islands, and quantises coordinates, which takes it to a fraction of
 * that with no visible difference at national zoom.
 *
 * USAGE
 *
 *   node scripts/build-boundaries.mjs
 *
 * The output is committed. Re-run only when the upstream boundaries change.
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SOURCE =
  "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM1/geoBoundaries-NGA-ADM1_simplified.geojson";

/**
 * Douglas-Peucker on an open polyline.
 *
 * Standard recursive implementation, written out rather than pulled from npm:
 * one dependency is not worth it for a script that runs about four times a year.
 */
function simplify(points, tolerance) {
  if (points.length < 3) return points;

  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;

  const stack = [[0, points.length - 1]];

  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDistance = 0;
    let index = -1;

    const [ax, ay] = points[first];
    const [bx, by] = points[last];
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;

    for (let i = first + 1; i < last; i += 1) {
      const [px, py] = points[i];
      let distance;

      if (lengthSquared === 0) {
        distance = Math.hypot(px - ax, py - ay);
      } else {
        // Distance from the point to the segment, not the infinite line.
        const t = Math.max(
          0,
          Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared),
        );
        distance = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      }

      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }

    if (maxDistance > tolerance && index !== -1) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  return points.filter((_, index) => keep[index]);
}

/** Area of a ring by the shoelace formula. Used to size rings before dropping. */
function ringArea(ring) {
  let total = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    total += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(total / 2);
}

/** Quantise to `places` decimals, dropping any point that lands on its parent. */
function quantise(points, places) {
  const factor = 10 ** places;
  const out = [];
  for (const [x, y] of points) {
    const px = Math.round(x * factor) / factor;
    const py = Math.round(y * factor) / factor;
    const last = out[out.length - 1];
    if (last && last[0] === px && last[1] === py) continue;
    out.push([px, py]);
  }
  return out;
}

function closeRing(points) {
  const first = points[0];
  const last = points[points.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) points.push([...first]);
  return points;
}

/**
 * Split a polygon into an exterior ring plus its holes.
 * geoBoundaries emits holes, and Leaflet needs the winding order preserved.
 */
function processPolygon(rings, tolerance, minArea, places) {
  const exterior = rings[0];
  if (ringArea(exterior) < minArea) return null;

  const simplified = closeRing(
    quantise(
      simplify(exterior, tolerance).map(([x, y]) => [x, y]),
      places,
    ),
  );

  // A ring simplified below four points is not a polygon any more.
  if (simplified.length < 4) return null;

  const holes = rings
    .slice(1)
    .map((hole) => closeRing(quantise(simplify(hole, tolerance), places)))
    .filter((hole) => hole.length >= 4 && ringArea(hole) >= minArea);

  return [simplified, ...holes];
}

function processGeometry(geometry, tolerance, minArea, places) {
  if (geometry.type === "Polygon") {
    const polygon = processPolygon(geometry.coordinates, tolerance, minArea, places);
    return polygon ? { type: "Polygon", coordinates: polygon } : null;
  }

  if (geometry.type === "MultiPolygon") {
    const polygons = geometry.coordinates
      .map((rings) => processPolygon(rings, tolerance, minArea, places))
      .filter(Boolean);
    return polygons.length ? { type: "MultiPolygon", coordinates: polygons } : null;
  }

  return null;
}

const TOLERANCE_DEGREES = 0.012; // roughly 1.3 km, invisible below zoom 9
const MIN_RING_AREA = 0.00035; // square degrees, drops specks that read as noise
const PLACES = 4; // ~11 m, far finer than the display resolution

const response = await fetch(SOURCE);
if (!response.ok) {
  throw new Error(`Could not download the boundaries: ${response.status} ${response.statusText}`);
}

const collection = await response.json();
const states = [];

for (const feature of collection.features) {
  const geometry = processGeometry(
    feature.geometry,
    TOLERANCE_DEGREES,
    MIN_RING_AREA,
    PLACES,
  );
  if (!geometry) continue;

  states.push({
    name: feature.properties.shapeName,
    iso: feature.properties.shapeISO,
    geometry,
  });
}

states.sort((a, b) => a.name.localeCompare(b.name));

const output = {
  attribution:
    "Boundaries: geoBoundaries gbOpen ADM1 (GRID3), CC BY 4.0. Compiled into the app, not fetched at runtime.",
  source: SOURCE,
  licence: "CC BY 4.0",
  generated: "node scripts/build-boundaries.mjs",
  states,
};

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(here, "../src/data/nigeria-boundaries.json");
const json = JSON.stringify(output);

await writeFile(target, json);

const rawBytes = JSON.stringify(collection).length;
console.log(`states:        ${states.length}`);
console.log(`raw:           ${(rawBytes / 1024).toFixed(0)} KB`);
console.log(`simplified:    ${(json.length / 1024).toFixed(0)} KB`);
console.log(`reduction:     ${((1 - json.length / rawBytes) * 100).toFixed(0)}%`);
console.log(`written:       ${path.relative(process.cwd(), target)}`);
