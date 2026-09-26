import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Home } from "./pages/public/Home";
import { FactCheck } from "./pages/public/FactCheck";
import { Politicians } from "./pages/public/Politicians";
import { PoliticianDetail } from "./pages/public/PoliticianDetail";
import { MapPage } from "./pages/public/MapPage";
import { Report } from "./pages/public/Report";
import { LiveFeed } from "./pages/public/LiveFeed";
import { Sources } from "./pages/public/Sources";
import { About } from "./pages/public/About";
import { FAQ } from "./pages/public/FAQ";
import { Privacy } from "./pages/public/Privacy";
import { Credits } from "./pages/public/Credits";
import { NotFound } from "./pages/NotFound";
import { FeatureGate } from "./components/shared/FeatureGate";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminFeed } from "./pages/admin/AdminFeed";
import { AdminPoliticians } from "./pages/admin/AdminPoliticians";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminSettings } from "./pages/admin/AdminSettings";

/** Wraps a surface in its feature switch, so a disabled route stops existing. */
const gated = (flag, element) => <FeatureGate flag={flag}>{element}</FeatureGate>;

/**
 * Routing table.
 *
 * Two shells: `PublicLayout` for the marketing and citizen surfaces, and
 * `AdminLayout` for the internal tools. The admin shell is a route-level
 * guard — see components/layout/AdminLayout.jsx. Individual surfaces are
 * wrapped in `FeatureGate` so a disabled feature is unreachable by URL, not
 * just unlinked from the header.
 */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/fact-check", element: gated("webFactCheck", <FactCheck />) },
      { path: "/politicians", element: gated("politicians", <Politicians />) },
      { path: "/politicians/:slug", element: gated("politicians", <PoliticianDetail />) },
      { path: "/map", element: gated("incidentMap", <MapPage />) },
      { path: "/report", element: gated("reports", <Report />) },
      { path: "/live", element: gated("liveFeed", <LiveFeed />) },
      { path: "/sources", element: <Sources /> },
      { path: "/about", element: <About /> },
      { path: "/faq", element: <FAQ /> },
      { path: "/privacy", element: <Privacy /> },
      { path: "/credits", element: <Credits /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/admin/login",
    element: gated("admin", <AdminLogin />),
  },
  {
    path: "/admin",
    element: gated("admin", <AdminLayout />),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "reports", element: <AdminReports /> },
      { path: "feed", element: <AdminFeed /> },
      { path: "politicians", element: <AdminPoliticians /> },
      { path: "analytics", element: <AdminAnalytics /> },
      { path: "settings", element: <AdminSettings /> },
      { path: "*", element: <Navigate to="/admin" replace /> },
    ],
  },
]);

export default router;
