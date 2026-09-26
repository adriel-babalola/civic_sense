import { RouterProvider } from "react-router-dom";
import { router } from "./router";

/**
 * Application root.
 *
 * The router is created in router.jsx and rendered here, so route modules are
 * all in one file and a route change is a single import graph.
 */
export default function App() {
  return <RouterProvider router={router} />;
}
