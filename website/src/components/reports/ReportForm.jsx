import { useMemo, useState } from "react";
import { Loader2, Lock, Send, ShieldCheck } from "lucide-react";
import { useSubmitReport } from "../../hooks/useReports";
import { useRateLimit } from "../../hooks/useRateLimit";
import { STATES } from "../../data/states";
import { getLgas, hasLgaRoster } from "../../data/lgas";
import { INCIDENT_TYPES, INCIDENT_META } from "../../utils/constants";
import {
  runValidators,
  validateDescription,
  validateEvidenceText,
  validateIncidentType,
  validateLga,
  validateState,
} from "../../utils/validators";
import { CONFIG } from "../../config/config";
import { Button } from "../shared/Button";
import { Alert } from "../shared/Field";
import { Input, Select, Textarea } from "../shared/Input";
import { cn } from "../../utils/cn";

const TYPE_OPTIONS = INCIDENT_TYPES.map((type) => ({
  value: type,
  label: INCIDENT_META[type].label,
}));

const STATE_OPTIONS = STATES.map((state) => ({ value: state, label: state }));

/**
 * Anonymous incident report.
 *
 * Scoped to incidents only, and deliberately unaware of politicians. This form
 * used to read `?politician=` and prefill "Regarding {name}:" into the
 * description, which quietly merged two unrelated things:
 *
 *   - An incident report is anonymous on purpose. Its safety argument is that
 *     there is no identity field and no per-person context to leak. Prefilling a
 *     named subject made the receipt and the stored record read as though we had
 *     linked a person to a report, which is precisely the association this form
 *     exists to avoid making.
 *   - A sourced profile update is not anonymous and not an incident. It is
 *     reviewed against a primary source before publication, which is a different
 *     process with a different standard.
 *
 * Suggesting a correction or an addition to a politician's profile is now a
 * separate form: ./ProfileSuggestionForm, at /politicians/:slug/suggest.
 *
 * Three decisions worth stating, because they are the reason this form is safe
 * to submit from a phone at a polling unit:
 *
 *   1. No identity field. Not hidden — absent. There is nothing to subpoena.
 *   2. The LGA is a dropdown where a canonical roster exists and a text input
 *      where it does not. A wrong list of local governments would send reports
 *      to the wrong place, so the honest fallback is to let the reporter type.
 *   3. Submission is throttled in the browser so a nervous double-tap does not
 *      create two identical reports in the moderation queue.
 */
export function ReportForm({ onSubmitted }) {
  const { submit, isSubmitting, error } = useSubmitReport();
  const rateLimit = useRateLimit();

  const [values, setValues] = useState({
    type: "",
    description: "",
    state: "",
    lga: "",
  });
  const [evidence, setEvidence] = useState("");
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const lgaRoster = hasLgaRoster(values.state);
  const lgaOptions = useMemo(
    () => getLgas(values.state).map((lga) => ({ value: lga, label: lga })),
    [values.state],
  );

  const { errors, isValid } = useMemo(
    () =>
      runValidators(
        { ...values, evidence },
        {
          type: validateIncidentType,
          state: validateState,
          lga: validateLga,
          description: validateDescription,
          evidence: validateEvidenceText,
        },
      ),
    [values, evidence],
  );

  const errorFor = (field) => (touched[field] || submitted ? errors[field] : null);

  const set = (field) => (event) => {
    const next = event.target.value;
    setValues((current) => ({
      ...current,
      [field]: next,
      // Changing the state invalidates an LGA chosen under the old one.
      ...(field === "state" ? { lga: "" } : {}),
    }));
  };

  const blur = (field) => () => setTouched((current) => ({ ...current, [field]: true }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    if (!isValid || rateLimit.isLimited) return;

    try {
      const report = await submit({ ...values, evidence });
      rateLimit.record();
      setSubmitted(false);
      setValues({ type: "", description: "", state: "", lga: "" });
      setEvidence("");
      setTouched({});
      onSubmitted?.(report);
    } catch {
      // `error` is rendered below; nothing to add here.
    }
  };

  if (rateLimit.isLimited) {
    return (
      <div className="cs-card p-6 text-center">
        <Lock size={20} className="mx-auto text-fg-faint" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-fg">You have reached the hourly limit</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-fg-muted">
          You can file {CONFIG.REPORT_LIMIT.max} reports an hour from this browser. A new slot opens{" "}
          {rateLimit.resetsAt
            ? new Date(rateLimit.resetsAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "shortly"}
          .
        </p>
        <p className="cs-hint mt-3">
          Need to send something urgently? WhatsApp has no browser limit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <fieldset>
        <legend className="cs-label">
          What happened
          <span className="ml-1 text-fg-faint" aria-hidden="true">
            *
          </span>
        </legend>

        <div
          className={cn(
            "mt-2 grid gap-2 sm:grid-cols-3",
            errorFor("type") && "text-false",
          )}
        >
          {TYPE_OPTIONS.map((option) => {
            const meta = INCIDENT_META[option.value];
            const isSelected = values.type === option.value;

            return (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-card border p-3 transition-colors",
                  isSelected
                    ? "border-brand-bright/50 bg-brand-bright/5"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={isSelected}
                  onChange={set("type")}
                  onBlur={blur("type")}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "block text-sm font-medium",
                    isSelected ? "text-fg" : "text-fg-secondary",
                  )}
                >
                  {option.label}
                </span>
                <span className="mt-1 block text-2xs leading-relaxed text-fg-faint">
                  {meta.blurb}
                </span>
              </label>
            );
          })}
        </div>
        {errorFor("type") ? <p className="cs-error-text mt-1.5">{errorFor("type")}</p> : null}
      </fieldset>

      <Textarea
        label="Describe it"
        required
        rows={5}
        maxLength={1500}
        placeholder="What you saw, where, and when. Facts, not conclusions. A moderator reads this before anything is published."
        hint={`${values.description.length}/1500 · the more specific, the easier it is to corroborate`}
        error={errorFor("description")}
        value={values.description}
        onChange={set("description")}
        onBlur={blur("description")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="State"
          required
          options={STATE_OPTIONS}
          placeholder="Select a state"
          error={errorFor("state")}
          value={values.state}
          onChange={set("state")}
          onBlur={blur("state")}
        />

        {lgaRoster ? (
          <Select
            label="Local government area"
            required
            options={lgaOptions}
            placeholder="Select an LGA"
            error={errorFor("lga")}
            value={values.lga}
            onChange={set("lga")}
            onBlur={blur("lga")}
          />
        ) : (
          <Input
            label="Local government area"
            required
            placeholder={values.state ? "Type the LGA name" : "Choose a state first"}
            disabled={!values.state}
            maxLength={80}
            error={errorFor("lga")}
            value={values.lga}
            onChange={set("lga")}
            onBlur={blur("lga")}
            hint={
              values.state
                ? `No verified LGA list for ${values.state} yet, so type it as it is written locally.`
                : undefined
            }
          />
        )}
      </div>

      <div>
        <Textarea
          label="Evidence (optional)"
          hint={
            <>
              Describe what you saw, or give a link to a video or post. This report form does not
              accept images: to send a screenshot, forward it to the WhatsApp number and the bot
              reads the claim from the image. That route is where a photo actually gets checked.
            </>
          }
          placeholder="e.g. Ballot boxes were brought in at 2:40pm, after voting had closed. A video of the queue is on the ward group's page."
          rows={3}
          maxLength={500}
          value={evidence}
          onChange={(event) => setEvidence(event.target.value)}
          onBlur={blur("evidence")}
          error={errorFor("evidence")}
        />
      </div>

      <div className="cs-card flex gap-2.5 p-3.5">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-verified" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-fg-muted">
          This form has no name, email or phone field, and we do not ask for one. Nothing that
          identifies you is sent with this report. See the{" "}
          <a href="/privacy" className="text-brand-bright underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
      </div>

      {error ? (
        <Alert tone="error" title="The report was not sent">
          {error.message}
        </Alert>
      ) : null}

      {submitted && !isValid ? (
        <Alert tone="warning" title="Check the highlighted fields">
          The report was not sent because some required information is missing.
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="cs-spinner" aria-hidden="true" />
              Sending
            </>
          ) : (
            <>
              <Send size={15} aria-hidden="true" />
              Send report
            </>
          )}
        </Button>
        <p className="text-xs text-fg-faint">
          {rateLimit.remaining} of {rateLimit.max} reports left this hour
        </p>
      </div>
    </form>
  );
}

export default ReportForm;
