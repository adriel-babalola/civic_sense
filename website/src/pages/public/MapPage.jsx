import { useEffect, useState } from "react";
import { Layers, MapPin } from "lucide-react";
import { useIncidents } from "../../hooks/useIncidents";
import { ALL } from "../../utils/constants";
import { INCIDENT_TYPES, INCIDENT_META } from "../../utils/constants";
import { Container, PageHeader, EmptyState } from "../../components/shared/Layout";
import { Select, SegmentedControl } from "../../components/shared/Input";
import { Button } from "../../components/shared/Button";
import { TypeBadge } from "../../components/shared/Badge";
import { IncidentLegend } from "../../components/shared/Legend";
import { IncidentMap } from "../../components/map/IncidentMap";
import { IncidentCard } from "../../components/incidents/IncidentCard";
import { formatDate } from "../../utils/formatters";
import { SampleBanner } from "../../components/shared/SampleBanner";

/**
 * Incident map.
 *
 * Layout is map-plus-list on desktop and a list-then-map stack on mobile: the
 * list is the accessible representation of the same data, so the map is never
 * the only way to read what happened.
 *
 * Reads bundled demonstration records rather than GET /api/incidents, which had no
 * server behind it on a static host and left this page showing an error instead
 * of a map. <SampleBanner> states that the records are samples.
 */
export function MapPage() {
  const {
    incidents,
    markers,
    counts,
    availableStates,
    filters,
    view,
  } = useIncidents();

  const [activeId, setActiveId] = useState(null);

  // A selection that no longer matches the filters is a selection pointing at
  // nothing, which reads as a bug. Clear it instead.
  useEffect(() => {
    if (activeId && !incidents.some((incident) => incident.id === activeId)) {
      setActiveId(null);
    }
  }, [incidents, activeId]);

  const active = incidents.find((incident) => incident.id === activeId) || null;

  const isFiltered = filters.type !== ALL || filters.state !== ALL;

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Field reports"
        title="Incident map"
        description="Corroborated incidents only. A report appears here after a moderator has matched it to independent reporting. The map is not a stream of unverified claims."
      />

      <SampleBanner className="mt-5" />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <SegmentedControl
            label="Filter by incident type"
            value={filters.type}
            onChange={filters.setType}
            options={[
              { value: ALL, label: "All", count: counts.total },
              ...INCIDENT_TYPES.map((type) => ({
                value: type,
                label: INCIDENT_META[type].label,
                count: counts[type],
              })),
            ]}
          />
          <Select
            aria-label="Filter by state"
            value={filters.state}
            onChange={(event) => filters.setState(event.target.value)}
            options={availableStates}
            placeholder="All states"
          />
        </div>

        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={filters.reset}>
            <Layers size={13} aria-hidden="true" />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="order-2 lg:order-1">
          <IncidentMap
            className="h-[380px] sm:h-[460px] lg:h-[560px]"
            markers={markers}
            activeId={activeId}
            onSelect={setActiveId}
            center={view.center}
            zoom={view.zoom}
          />
          <p className="cs-hint mt-2">
            No basemap is loaded, by choice: a tile server would learn your IP address and the
            area of Nigeria you are looking at. Markers are placed at state-capital coordinates
            because reports carry no GPS by design.
          </p>
        </div>

        <div className="order-1 flex flex-col lg:order-2">
          <div className="cs-card p-3">
            <IncidentLegend counts={counts} />
          </div>

          <div className="mt-3 max-h-[440px] flex-1 space-y-2 overflow-y-auto pr-0.5 lg:max-h-[520px]">
            {incidents.length ? (
              incidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  isActive={incident.id === activeId}
                  onSelect={() => setActiveId(incident.id)}
                />
              ))
            ) : (
              <EmptyState
                icon={MapPin}
                title={isFiltered ? "Nothing matches these filters" : "No incidents published"}
                description={
                  isFiltered
                    ? "Widen the type or state to see more."
                    : "Nothing has been corroborated yet. That is what an empty map means, not evidence that nothing is happening."
                }
                action={
                  isFiltered ? (
                    <Button variant="secondary" size="sm" onClick={filters.reset}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button to="/report" variant="primary" size="sm">
                      File a report
                    </Button>
                  )
                }
              />
            )}
          </div>
        </div>
      </div>

      {active ? (
        <div className="mt-5">
          <div className="cs-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={active.type} />
              <span className="text-sm font-medium text-fg">
                {active.state}
                {active.lga ? ` · ${active.lga}` : ""}
              </span>
              <span className="ml-auto text-2xs text-fg-faint">
                {formatDate(active.timestamp)}
              </span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-fg-secondary">
              {active.description}
            </p>
            {active.evidence ? (
              <p className="cs-hint mt-2">Evidence was attached to the original report.</p>
            ) : null}
          </div>
        </div>
      ) : null}

    </Container>
  );
}

export default MapPage;
