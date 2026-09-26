import { KeyRound, Server, ToggleLeft } from "lucide-react";
import { CONFIG, FEATURES, API } from "../../config/config";
import { getHealth } from "../../services/api";
import { useAsync } from "../../hooks/useAsync";
import { usingDefaultPassword, getSession } from "../../services/auth";
import { Container, PageHeader } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { Alert } from "../../components/shared/Field";
import { Badge } from "../../components/shared/Badge";
import { CopyButton } from "../../components/shared/FileUpload";
import { formatDateTime } from "../../utils/formatters";

/**
 * Settings.
 *
 * Read-only on purpose. Everything here is decided at build time or by the
 * server, so the useful thing this page can do is show the current values and
 * name the risk where one exists. Writing to build-time config from a browser
 * would be a placebo, and a placebo in a security screen is worse than none.
 */
export function AdminSettings() {
  const { data: health } = useAsync((signal) => getHealth(signal));
  const session = getSession();
  const usingDefault = usingDefaultPassword();

  const rows = [
    { label: "API base URL", value: CONFIG.API_BASE },
    { label: "Site URL", value: CONFIG.SITE_URL },
    { label: "Contact email", value: CONFIG.CONTACT_EMAIL },
    { label: "WhatsApp number", value: CONFIG.WHATSAPP.display },
    { label: "WhatsApp join code", value: CONFIG.WHATSAPP.joinCode },
    { label: "Poll interval", value: `${CONFIG.POLL_INTERVAL_MS / 1000}s` },
    { label: "Report limit", value: `${CONFIG.REPORT_LIMIT.max} per hour per browser` },
    { label: "Max upload", value: `${CONFIG.MAX_UPLOAD_MB} MB` },
  ];

  const endpoints = [
    ["health", API.health],
    ["sources", API.sources],
    ["factcheck", API.factcheck],
    ["factchecks", API.factchecks],
    ["incidents", API.incidents],
    ["reports", API.reports],
  ];

  return (
    <Container size="prose" className="py-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Build-time configuration and server state. Nothing on this page is editable from a browser."
      />

      {usingDefault ? (
        <Alert tone="error" className="mt-5" title="Development password is still active">
          Set <code className="font-mono">VITE_ADMIN_PASSWORD</code> in the deployment environment
          and rebuild. Until then the access password is{" "}
          <code className="font-mono">civicsense</code>, which is in the shipped JavaScript.
        </Alert>
      ) : null}

      <section className="cs-card mt-5 p-4">
        <div className="flex items-center gap-2">
          <KeyRound size={15} className="text-fg-muted" aria-hidden="true" />
          <h2 className="text-heading text-fg">Access</h2>
        </div>

        <dl className="mt-3 space-y-2 text-sm">
          <Row
            label="Session"
            value={session ? `expires ${formatDateTime(session.expiresAt)}` : "none"}
          />
          <Row
            label="Password source"
            value={usingDefault ? "built-in default" : "VITE_ADMIN_PASSWORD"}
            tone={usingDefault ? "false" : "verified"}
          />
          <Row
            label="Enforcement"
            value="client-side only"
            tone="misleading"
          />
        </dl>

        <p className="cs-hint mt-3">
          This gate exists to keep casual visitors out of an internal tool. The moderation endpoints
          on the server accept unauthenticated PATCH requests, so anyone who knows a report id can
          approve or reject it. Closing that needs a server session, and it is the first item in the
          roadmap, and it is a backend task, not a frontend one.
        </p>
      </section>

      <section className="cs-card mt-4 p-4">
        <div className="flex items-center gap-2">
          <ToggleLeft size={15} className="text-fg-muted" aria-hidden="true" />
          <h2 className="text-heading text-fg">Feature flags</h2>
        </div>

        <ul className="mt-3 space-y-2">
          {Object.entries(FEATURES).map(([key, enabled]) => (
            <li key={key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-fg-secondary">{key}</span>
              <Badge tone={enabled ? "verified" : "unverified"} size="sm">
                {enabled ? "on" : "off"}
              </Badge>
            </li>
          ))}
        </ul>

        <p className="cs-hint mt-3">
          Flags are read from <code className="font-mono">import.meta.env</code> at build time. To
          change one, set the matching <code className="font-mono">VITE_FEATURE_*</code> variable and
          redeploy.
        </p>
      </section>

      <section className="cs-card mt-4 p-4">
        <h2 className="text-heading text-fg">Runtime configuration</h2>
        <dl className="mt-3 space-y-2 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-wrap items-baseline gap-2">
              <dt className="w-40 shrink-0 text-fg-muted">{row.label}</dt>
              <dd className="min-w-0 flex-1 truncate font-mono text-xs text-fg-secondary">
                {row.value}
              </dd>
              <CopyButton value={row.value} label="Copy" />
            </div>
          ))}
        </dl>
      </section>

      <section className="cs-card mt-4 p-4">
        <div className="flex items-center gap-2">
          <Server size={15} className="text-fg-muted" aria-hidden="true" />
          <h2 className="text-heading text-fg">Endpoints in use</h2>
        </div>

        <ul className="mt-3 space-y-1.5">
          {endpoints.map(([name, url]) => (
            <li key={name} className="flex flex-wrap items-baseline gap-2 text-xs">
              <span className="w-24 shrink-0 font-medium text-fg-secondary">{name}</span>
              <code className="min-w-0 flex-1 truncate font-mono text-fg-faint">{url}</code>
              <CopyButton value={url} label="Copy" />
            </li>
          ))}
        </ul>

        <p className="cs-hint mt-3">
          Server uptime {health?.uptime ? `${Math.round(health.uptime / 60)} min` : "unknown"} ·
          database {health?.db ? "connected" : "offline"} ·{" "}
          {health?.articles ?? 0} articles indexed
        </p>
      </section>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button href="/api/health" variant="secondary" size="sm">
          Open health endpoint
        </Button>
        <Button href={CONFIG.GITHUB_URL} variant="secondary" size="sm">
          Report an issue
        </Button>
      </div>
    </Container>
  );
}

function Row({ label, value, tone }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-fg-muted">{label}</dt>
      <dd
        className={
          tone === "verified"
            ? "font-medium text-verified"
            : tone === "false"
              ? "font-medium text-false"
              : tone === "misleading"
                ? "font-medium text-misleading"
                : "font-medium text-fg-secondary"
        }
      >
        {value}
      </dd>
    </div>
  );
}

export default AdminSettings;
