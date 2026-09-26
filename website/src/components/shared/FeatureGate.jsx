import { FEATURES } from "../../config/config";
import { NotFound } from "../../pages/NotFound";

/**
 * Route-level feature switch.
 *
 * Turning a surface off in config/config.js should remove the surface, not
 * merely unlink it. Without this, a disabled feature stays reachable by typing
 * its URL — which means a feature flag that the team believes is off is still
 * live in production.
 *
 * Renders the 404 page rather than a bespoke "unavailable" screen so a disabled
 * surface is indistinguishable from one that was never built.
 */
export function FeatureGate({ flag, children }) {
  if (FEATURES[flag] === false) {
    return <NotFound />;
  }

  return children;
}

export default FeatureGate;
