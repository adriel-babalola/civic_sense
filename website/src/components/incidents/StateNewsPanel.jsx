import { Newspaper, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { fromApiStateName } from "../../data/states";
import { relativeTime } from "../../utils/formatters";

/**
 * The panel that opens when a state is selected on the incident map.
 *
 * It shows what the news index holds for that state, newest first, drawn from
 * the outlets in the source registry. When the index has nothing (backend down,
 * or simply no recent stories), it says so plainly rather than showing an empty
 * box or, worse, falling back to unrelated rows.
 *
 * Rendered as a dialog: it is opened by an interaction, it can be dismissed, and
 * focus should be able to return to the map. It is a right-side drawer on wide
 * screens and a full-width sheet on a phone.
 */
export function StateNewsPanel({ state, articles = [], isLoading = false, onClose, className }) {
  if (!state) return null;

  const displayName = fromApiStateName(state);

  return (
    <>
      {/* Backdrop. Closes the panel on click and keeps the map visible behind. */}
      <div
        className="fixed inset-0 z-[900] bg-black/50 backdrop-blur-[1px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`News in ${displayName}`}
        className={cn(
          "cs-enter fixed right-0 top-0 z-[1000] flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl",
          className,
        )}
      >
        <header className="flex items-start gap-3 border-b border-line p-4">
          <div className="min-w-0 flex-1">
            <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
              Incident map
            </p>
            <h2 className="mt-0.5 truncate text-lg font-semibold text-fg">{displayName}</h2>
            <p className="mt-0.5 text-xs text-fg-muted">
              {isLoading
                ? "Loading recent reporting…"
                : articles.length
                  ? `${articles.length} recent ${articles.length === 1 ? "story" : "stories"}`
                  : "No recent reporting indexed"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-control border border-line p-1.5 text-fg-muted transition-colors hover:text-fg"
            aria-label="Close state panel"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3" role="status" aria-live="polite">
              {[0, 1, 2].map((key) => (
                <div key={key} className="cs-skeleton h-16 w-full rounded-card" />
              ))}
            </div>
          ) : articles.length ? (
            <ul className="space-y-3">
              {articles.map((article) => (
                <li key={article.id || article.link}>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-card cs-card-interactive block p-3"
                  >
                    <p className="text-sm font-medium leading-snug text-fg">{article.title}</p>
                    {article.snippet ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
                        {article.snippet}
                      </p>
                    ) : null}
                    <p className="mt-2 flex items-center gap-2 text-2xs text-fg-faint">
                      <span className="inline-flex items-center gap-1">
                        <Newspaper size={10} aria-hidden="true" />
                        {article.source || "Unknown source"}
                      </span>
                      {article.pubDate ? (
                        <time dateTime={article.pubDate}>{relativeTime(article.pubDate)}</time>
                      ) : null}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="cs-card flex flex-col items-center px-6 py-10 text-center">
              <Newspaper size={18} className="text-fg-faint" aria-hidden="true" />
              <p className="mt-3 text-sm font-medium text-fg">Nothing indexed for {displayName}</p>
              <p className="mt-1 max-w-xs text-sm text-fg-muted">
                No recent story from our monitored outlets names this state. An empty panel means we
                have nothing, not that nothing happened.
              </p>
            </div>
          )}
        </div>

        <footer className="border-t border-line p-3">
          <p className="text-2xs leading-relaxed text-fg-faint">
            Headlines are from monitored Nigerian outlets, tagged to a state by where the copy says
            the story happened. A tag is a mention, not an endorsement of the report.
          </p>
        </footer>
      </aside>
    </>
  );
}

export default StateNewsPanel;
