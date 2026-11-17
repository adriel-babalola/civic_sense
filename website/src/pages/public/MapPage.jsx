import { useMemo, useState } from "react";
import { MapPin, Newspaper, RefreshCw } from "lucide-react";
import { useStateNews } from "../../hooks/useStateNews";
import { getCoords, fromApiStateName } from "../../data/states";
import { Container, PageHeader, EmptyState } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { IncidentMap } from "../../components/map/IncidentMap";
import { StateNewsPanel } from "../../components/incidents/StateNewsPanel";
import { relativeTime } from "../../utils/formatters";
import { cn } from "../../utils/cn";

/**
 * Incident map.
 *
 * Driven entirely by the live news index: GET /api/incidents/map returns every
 * Nigerian state that recent reporting names, with the newest stories attached.
 * There is no bundled sample here, so nothing on the page can be mistaken for a
 * real story when it is not.
 *
 * A state is selected by clicking its polygon on the map or its row in the list
 * beside it. The list is the accessible twin of the map click: same data, same
 * destination, reachable by keyboard.
 */
export function MapPage() {
  const stateNews = useStateNews({ perState: 8, maxStates: 20 });
  const [selectedState, setSelectedState] = useState(null);

  const states = stateNews.states;

  const newsStateNames = useMemo(() => states.map((s) => s.state), [states]);

  /** One marker per state with news, at the state-capital centroid. */
  const markers = useMemo(
    () =>
      states
        .map((entry) => {
          const coords = getCoords(entry.state);
          return coords
            ? { id: entry.state, state: entry.state, type: "news", coords, count: entry.count }
            : null;
        })
        .filter(Boolean),
    [states],
  );

  const selectedEntry = selectedState ? stateNews.byState.get(selectedState) : null;

  const toggleState = (name) => setSelectedState((current) => (current === name ? null : name));

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="News by state"
        title="Incident map"
        description="What the monitored Nigerian newsrooms are reporting, tagged to the state the story names. Select a state to read its recent reporting. A tag is where the copy says the story happened, not an endorsement of the report."
      />

      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <Newspaper size={12} className="text-fg-faint" aria-hidden="true" />
          {states.length ? `${states.length} states with recent news` : "Loading the news index"}
        </span>
        {stateNews.updatedAt ? (
          <span className="text-fg-faint">
            Updated <time dateTime={stateNews.updatedAt}>{relativeTime(stateNews.updatedAt)}</time>
          </span>
        ) : null}
        {stateNews.error ? (
          <span className="inline-flex items-center gap-1.5 text-misleading">
            Live news unavailable
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="order-2 lg:order-1">
          <IncidentMap
            className="h-[380px] sm:h-[460px] lg:h-[560px]"
            markers={markers}
            activeId={selectedState}
            onSelect={toggleState}
            center={[9.08, 8.68]}
            zoom={6}
            activeState={selectedState}
            onStateSelect={toggleState}
            newsStates={newsStateNames}
          />
          <p className="cs-hint mt-2">
            No basemap is loaded, by choice: a tile server would learn your IP address and the area
            of Nigeria you are looking at. States with news are shaded; tap one to open its
            reporting.
          </p>
        </div>

        <div className="order-1 flex flex-col lg:order-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg">States in the news</h2>
            <button
              type="button"
              onClick={stateNews.reload}
              className="inline-flex items-center gap-1 text-2xs text-fg-faint transition-colors hover:text-fg"
            >
              <RefreshCw size={11} aria-hidden="true" />
              Refresh
            </button>
          </div>

          <div className="mt-3 max-h-[440px] flex-1 space-y-2 overflow-y-auto pr-0.5 lg:max-h-[560px]">
            {stateNews.isLoading && !states.length ? (
              <div className="space-y-2" aria-busy="true">
                {[0, 1, 2, 3, 4].map((key) => (
                  <div key={key} className="cs-skeleton h-12 w-full rounded-card" />
                ))}
              </div>
            ) : states.length ? (
              states.map((entry) => {
                const isActive = selectedState === entry.state;
                const latest = entry.articles?.[0];
                return (
                  <button
                    key={entry.state}
                    type="button"
                    onClick={() => toggleState(entry.state)}
                    aria-pressed={isActive}
                    className={cn(
                      "cs-card cs-card-interactive w-full p-3 text-left",
                      isActive && "border-brand-bright/40 bg-card-active",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-fg">
                        {fromApiStateName(entry.state)}
                      </span>
                      <span className="ml-auto rounded-full border border-line bg-surface px-1.5 py-0.5 text-2xs text-fg-muted">
                        {entry.count}
                      </span>
                    </div>
                    {latest ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
                        {latest.title}
                      </p>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <EmptyState
                icon={stateNews.error ? RefreshCw : MapPin}
                title={stateNews.error ? "The news index did not load" : "No tagged news yet"}
                description={
                  stateNews.error
                    ? "The service could not be reached. This is a load failure, not an empty map."
                    : "No recent story from our monitored outlets names a Nigerian state. An empty map means we have nothing, not that nothing happened."
                }
                action={
                  stateNews.error ? (
                    <Button variant="secondary" size="sm" onClick={stateNews.reload}>
                      <RefreshCw size={13} aria-hidden="true" />
                      Try again
                    </Button>
                  ) : null
                }
              />
            )}
          </div>
        </div>
      </div>

      <StateNewsPanel
        state={selectedState}
        articles={selectedEntry?.articles || []}
        isLoading={selectedState ? stateNews.isLoading : false}
        onClose={() => setSelectedState(null)}
      />
    </Container>
  );
}

export default MapPage;
