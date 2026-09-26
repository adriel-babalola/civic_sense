import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Public shell: fixed header, scrolling main region, footer.
 *
 * Restores scroll to the top on navigation and moves focus to the main
 * landmark, which is what a screen-reader user expects after a route change
 * but does not get by default in a client-routed SPA.
 */
export function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="cs-skip-link">
        Skip to content
      </a>

      <Header />

      <main id="main" tabIndex={-1} className="flex-1 pt-20 outline-none">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default PublicLayout;
