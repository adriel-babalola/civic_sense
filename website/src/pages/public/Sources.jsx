import { useMemo, useState } from "react";
import { Rss } from "lucide-react";
import { getSources } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { SOURCE_LOGOS } from "../../data/content";
import { Container, PageHeader, ErrorState, EmptyState } from "../../components/shared/Layout";
import { SearchInput } from "../../components/shared/Input";
import { CopyButton } from "../../components/shared/FileUpload";
import { Badge } from "../../components/shared/Badge";
import { Button } from "../../components/shared/Button";
import { Skeleton } from "../../components/shared/Skeleton";
import { getLogo } from "../../utils/formatters";

/**
 * Source registry.
 *
 * GET /api/sources returns the scraper's live registry, which is the source of
 * truth. The bundled logos are a local convenience — every asset is served from
 * this origin, so listing our sources does not leak a visit to 17 newsrooms.
 */
export function Sources() {
  const { data, error, isLoading, reload } = useAsync((signal) => getSources(signal));
  const [query, setQuery] = useState("");

  const sources = useMemo(() => data || [], [data]);
  const regions = useMemo(
    () => [...new Set(sources.map((source) => source.region).filter(Boolean))].sort(),
    [sources],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sources;
    return sources.filter(
      (source) =>
        source.name?.toLowerCase().includes(needle) ||
        source.region?.toLowerCase().includes(needle) ||
        source.category?.toLowerCase().includes(needle),
    );
  }, [sources, query]);

  return (
    <Container className="py-12 sm:py-16">
      <PageHeader
        eyebrow="Method"
        title="Where the verdicts come from"
        description="Every verdict is assembled from a fixed registry of Nigerian newsrooms, read by a scraper that stores articles locally so a fact-check does not have to trust a search engine in the moment."
        action={
          <Button to="/fact-check" variant="primary" size="md">
            Check a claim
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          className="w-full sm:max-w-xs"
          value={query}
          onChange={setQuery}
          placeholder="Search sources"
        />
        <p className="text-xs text-fg-faint" role="status" aria-live="polite">
          {sources.length} sources · {filtered.length} shown
        </p>
      </div>

      {error ? (
        <ErrorState
          className="mt-6"
          error={error}
          onRetry={reload}
          title="The source registry did not load"
        />
      ) : null}

      {regions.length ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
            Regions
          </span>
          {regions.map((region) => (
            <Badge key={region} tone="neutral" size="sm">
              {region}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && !sources.length
          ? [0, 1, 2, 3, 4, 5].map((index) => (
              <Skeleton key={index} className="h-20 w-full rounded-card" />
            ))
          : filtered.map((source) => {
              const logo = getLogo(source.name, SOURCE_LOGOS);
              return (
                <div key={source.name} className="cs-card flex items-center gap-3 p-3">
                  {logo ? (
                    <img
                      src={logo}
                      alt=""
                      loading="lazy"
                      className="h-8 w-8 shrink-0 rounded object-contain opacity-80"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-line text-2xs font-semibold text-fg-faint"
                    >
                      {source.name?.slice(0, 2).toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <a
                      href={source.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm font-medium text-fg transition-colors hover:text-brand-bright"
                    >
                      {source.name}
                    </a>
                    <p className="text-2xs text-fg-faint">
                      {[source.region, source.category].filter(Boolean).join(" · ")}
                    </p>
                  </div>

                  <CopyButton value={source.feed} label="" copiedLabel="" aria-label="Copy feed URL" />
                </div>
              );
            })}
      </div>

      {!isLoading && !filtered.length ? (
        sources.length ? (
          <EmptyState
            icon={Rss}
            title="No source matches"
            description="Try a different name, or clear the search."
            action={
              <Button variant="secondary" size="sm" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Rss}
            title="The registry is empty"
            description="The server returned no sources. Check that the backend is running with its RSS registry configured."
          />
        )
      ) : null}

      <div className="cs-card mt-8 p-4">
        <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
          How this is used
        </p>
        <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
          Articles are pulled into a local index on a schedule. When a claim is checked, the
          pipeline searches that index and live search in parallel, then reads the retrieved
          articles once. We quote and link back to the reporting. We do not republish articles, and
          a verdict never replaces reading the source.
        </p>
      </div>
    </Container>
  );
}

export default Sources;
