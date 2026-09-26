import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// jsdom implements none of these, and each one is used by a component that
// would otherwise throw on mount rather than degrade.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

if (!globalThis.ResizeObserver) {
  // The map depends on this to call invalidateSize, and a missing global would
  // otherwise make the "container resized" test pass for the wrong reason.
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!URL.createObjectURL) {
  URL.createObjectURL = () => "blob:mock";
  URL.revokeObjectURL = () => {};
}

/**
 * Leaflet mock.
 *
 * Records the calls the component makes, so tests can assert on real behaviour
 * (that the boundary layer was added, that invalidateSize ran after a resize)
 * rather than only on the rendered fallback. `__calls` is reset per test.
 */
vi.mock("leaflet", () => {
  const calls = { map: 0, geoJSON: [], imageOverlay: 0, invalidateSize: 0, removed: 0 };

  const layer = () => ({
    addTo: () => layer(),
    on: () => layer(),
    clearLayers: () => layer(),
  });

  return {
    __calls: calls,
    __reset: () => {
      calls.map = 0;
      calls.geoJSON = [];
      calls.imageOverlay = 0;
      calls.invalidateSize = 0;
      calls.removed = 0;
    },
    default: {
      map: () => {
        calls.map += 1;
        return {
          remove: () => {
            calls.removed += 1;
          },
          fitBounds: () => {},
          invalidateSize: () => {
            calls.invalidateSize += 1;
          },
          on: () => {},
        };
      },
      imageOverlay: () => {
        calls.imageOverlay += 1;
        return { addTo: () => {} };
      },
      // The map now draws state outlines from the bundled GeoJSON instead of a
      // tile layer, so this is the load-bearing call.
      geoJSON: (data, options) => {
        calls.geoJSON.push({ data, options });
        return { addTo: () => {} };
      },
      control: { zoom: () => ({ addTo: () => {} }) },
      layerGroup: () => ({ addTo: () => layer(), clearLayers: () => {} }),
      marker: () => ({ on: () => ({ addTo: () => ({}) }), addTo: () => ({}) }),
      divIcon: () => ({}),
    },
  };
});

if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}
