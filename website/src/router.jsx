import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import { Home } from "./pages/public/Home";
import { FactCheck } from "./pages/public/FactCheck";
import { Politicians } from "./pages/public/Politicians";
import { PoliticianDetail } from "./pages/public/PoliticianDetail";
import { SuggestUpdate } from "./pages/public/SuggestUpdate";
import { MapPage } from "./pages/public/MapPage";
import { Report } from "./pages/public/Report";
import { LiveFeed } from "./pages/public/LiveFeed";
import { Sources } from "./pages/public/Sources";
import { About } from "./pages/public/About";
import { FAQ } from "./pages/public/FAQ";
import { Privacy } from "./pages/public/Privacy";
import { DataDeletion } from "./pages/public/DataDeletion";
import { Credits } from "./pages/public/Credits";
import { NotFound } from "./pages/NotFound";
import { FeatureGate } from "./components/shared/FeatureGate";

/** Wraps a surface in its feature switch, so a disabled route stops existing. */
const gated = (flag, element) => <FeatureGate flag={flag}>{element}</FeatureGate>;

/**
 * Routing table.
 *
 * One shell, the public layout. The `/admin` routes, the admin layout and the
 * client-side admin gate are gone: they existed to moderate the report queue and
 * the fact-check feed through the API, and with no API attached an admin console
 * is a login form in front of an empty list. Putting it back is a routing change
 * plus real server-side authentication, which documentation/API.md records as an
 * open gap.
 *
 * `/politicians/:slug/suggest` is separate from `/report` on purpose. A sourced
 * profile correction and an anonymous polling-unit incident have opposite
 * requirements, so they are separate routes, separate forms and separate browser
 * stores rather than one form with a flag.
 *
 * Nothing here fetches. Every page reads bundled data, so the site is a complete
 * static bundle that runs with no backend at all.
 */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/fact-check", element: gated("webFactCheck", <FactCheck />) },
      { path: "/politicians", element: gated("politicians", <Politicians />) },
      { path: "/politicians/:slug", element: gated("politicians", <PoliticianDetail />) },
      {
        path: "/politicians/:slug/suggest",
        element: gated("politicians", <SuggestUpdate />),
      },
      { path: "/map", element: gated("incidentMap", <MapPage />) },
      { path: "/report", element: gated("reports", <Report />) },
      { path: "/live", element: gated("liveFeed", <LiveFeed />) },
      { path: "/sources", element: <Sources /> },
      { path: "/about", element: <About /> },
      { path: "/faq", element: <FAQ /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/data-deletion", element: <DataDeletion /> },
      { path: "/credits", element: <Credits /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;