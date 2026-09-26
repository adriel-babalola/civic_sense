import { useId } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Form field wrapper.
 *
 * Owns the label / control / hint / error relationship so no individual field
 * has to remember the `aria-describedby` wiring. The hint id and the error id
 * are both registered; when there is an error, `aria-describedby` points at the
 * error so a screen reader announces the reason instead of the hint.
 */
export function Field({ label, hint, error, required = false, htmlFor, className, children }) {
  const generatedId = useId();
  const id = htmlFor || generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="cs-label">
          {label}
          {required ? (
            <span className="ml-1 text-fg-faint" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {children({
        id,
        "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })}

      {error ? (
        <p id={errorId} className="cs-error-text flex items-start gap-1.5">
          <AlertCircle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="cs-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Standalone alert. `role="alert"` so it is announced when it appears. */
const ALERT_TONES = {
  info: { wrap: "border-line bg-card text-fg-secondary", icon: Info, iconColor: "text-fg-muted" },
  success: {
    wrap: "border-verified/25 bg-verified/5 text-verified",
    icon: CheckCircle2,
    iconColor: "text-verified",
  },
  warning: {
    wrap: "border-misleading/25 bg-misleading/5 text-misleading",
    icon: TriangleAlert,
    iconColor: "text-misleading",
  },
  error: { wrap: "border-false/25 bg-false/5 text-false", icon: AlertCircle, iconColor: "text-false" },
};

export function Alert({ tone = "info", title, className, children, ...props }) {
  const config = ALERT_TONES[tone] || ALERT_TONES.info;
  const Icon = config.icon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-2.5 rounded-control border p-3", config.wrap, className)}
      {...props}
    >
      <Icon size={15} className={cn("mt-0.5 shrink-0", config.iconColor)} aria-hidden="true" />
      <div className="min-w-0 text-sm leading-relaxed">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? "mt-0.5" : ""}>{children}</div> : null}
      </div>
    </div>
  );
}

export default Field;
