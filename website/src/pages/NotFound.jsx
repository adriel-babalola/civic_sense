import { Link, useLocation } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "../components/shared/Button";
import { Container } from "../components/shared/Layout";

/** 404. Offers the two things a lost visitor actually wants: a way home, a way to search. */
export function NotFound() {
  const location = useLocation();
  const attempted = location.pathname;

  return (
    <Container size="prose" className="flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="cs-eyebrow">Error 404</p>
      <h1 className="mt-3 text-title text-fg">This page does not exist</h1>
      <p className="mt-3 text-[0.9375rem] text-fg-secondary">
        Nothing is published at{" "}
        <code className="rounded bg-card-active px-1.5 py-0.5 font-mono text-xs text-fg-muted">
          {attempted}
        </code>
        . It may have moved, or the link may be wrong.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button to="/" variant="primary" size="lg">
          <Home size={15} aria-hidden="true" />
          Back to home
        </Button>
        <Button to="/fact-check" variant="secondary" size="lg">
          <Search size={15} aria-hidden="true" />
          Check a claim
        </Button>
      </div>

      <nav aria-label="Popular pages" className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {[
          ["/politicians", "Politician records"],
          ["/map", "Incident map"],
          ["/report", "Report misconduct"],
          ["/faq", "FAQ"],
        ].map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className="rounded text-sm text-fg-muted transition-colors hover:text-fg"
          >
            {label}
          </Link>
        ))}
      </nav>
    </Container>
  );
}

export default NotFound;
