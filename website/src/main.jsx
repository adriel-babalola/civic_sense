import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted variable font. Bundled, not fetched from a third party: no
// request to fonts.googleapis.com means one fewer party with a record of who
// visited a civic fact-checking tool.
import "@fontsource-variable/inter";

// Leaflet ships its stylesheet with the library; Tailwind is loaded after so
// the app's own rules win where they overlap.
import "leaflet/dist/leaflet.css";
import "./styles/index.css";

import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element #root is missing from index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
