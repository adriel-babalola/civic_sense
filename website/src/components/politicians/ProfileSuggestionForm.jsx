import { useMemo, useState } from "react";
import { FileSearch, Loader2, ScrollText, Send, ShieldCheck } from "lucide-react";
import { useSubmitSuggestion } from "../../hooks/useSuggestions";
import {
  runValidators,
  validateSourceUrl,
  validateUpdateDetail,
  validateUpdateType,
} from "../../utils/validators";
import { Button } from "../shared/Button";
import { Alert } from "../shared/Field";
import { Input, Textarea } from "../shared/Input";
import { PoliticianPhoto } from "../politicians/PoliticianPhoto";
import { cn } from "../../utils/cn";

/**
 * Suggestions for the profile it is given.
 *
 * Reusable: takes a `person` and renders nothing about the person beyond their
 * name, photo and party. It is mounted from the profile page's action row and
 * from the directory, and it does not care which, or read a route param to work
 * out who it is for. Anything subject-specific arrives as a prop, so the same
 * component can suggest a change for a ticket, a policy or a photo.
 *
 * WHY THIS IS NOT THE INCIDENT REPORT
 *
 * The two forms look alike and are deliberately built from the same primitives,
 * because a site that styles its forms two different ways reads as two different
 * products. They are not the same form:
 *
 *   - The incident report is anonymous and its evidence is optional. The reporter
 *     is the witness, so there is nothing to attach.
 *   - This one requires a source link and is not anonymous. A profile is a
 *     sourced document; an entry with nothing behind it is the thing this whole
 *     project exists to avoid putting in front of people.
 *
 * So the source field is the required one here, which is the exact inverse of the
 * incident form, and the wording never promises publication. It says a person
 * checks it, because a reader who submits a well-sourced correction and then
 * watches it vanish with no explanation concludes the site is useless.
 */
const UPDATE_OPTIONS = [
  {
    value: "record",
    label: "Add a record entry",
    blurb: "A documented thing they did, with a date and a source.",
  },
  {
    value: "correction",
    label: "Correct something here",
    blurb: "A name, office, party or figure on this profile is wrong.",
  },
  {
    value: "statement",
    label: "Add a position or statement",
    blurb: "Something they said, in their own words, where they said it.",
  },
  {
    value: "photo",
    label: "Add or correct a photo",
    blurb: "Only if you hold the licence. We cannot use press images.",
  },
  {
    value: "other",
    label: "Something else",
    blurb: "Tell us and we will work out where it belongs.",
  },
];

export function ProfileSuggestionForm({ person, onSubmitted }) {
  const { submit, isSubmitting, error } = useSubmitSuggestion();

  const [values, setValues] = useState({
    updateType: "",
    detail: "",
    sourceUrl: "",
  });
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { errors, isValid } = useMemo(
    () =>
      runValidators(values, {
        updateType: validateUpdateType,
        detail: validateUpdateDetail,
        sourceUrl: validateSourceUrl,
      }),
    [values],
  );

  const errorFor = (field) => (touched[field] || submitted ? errors[field] : null);

  const set = (field) => (event) => {
    const next = event.target.value;
    setValues((current) => ({ ...current, [field]: next }));
  };

  const blur = (field) => () => setTouched((current) => ({ ...current, [field]: true }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;

    try {
      const suggestion = await submit(person, { ...values, note });
      setValues({ updateType: "", detail: "", sourceUrl: "" });
      setNote("");
      setTouched({});
      setSubmitted(false);
      onSubmitted?.(suggestion);
    } catch {
      // `error` renders below; nothing to add here.
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Who this is about. Spelled out above the form rather than implied by
          the URL, because a reader who arrives from a shared link has never seen
          the page this is correcting. */}
      <div className="cs-card flex items-center gap-3 p-3.5">
        <PoliticianPhoto person={person} className="h-11 w-11 shrink-0 rounded-full" />
        <div className="min-w-0">
          <p className="cs-eyebrow">Suggesting a change to</p>
          <p className="mt-0.5 truncate text-sm font-medium text-fg">{person.name}</p>
          <p className="truncate text-2xs text-fg-muted">
            {person.partyName} · {person.office}
          </p>
        </div>
      </div>

      <fieldset>
        <legend className="cs-label">
          What kind of change is this
          <span className="ml-1 text-fg-faint" aria-hidden="true">
            *
          </span>
        </legend>

        <div
          className={cn(
            "mt-2 grid gap-2 sm:grid-cols-2",
            errorFor("updateType") && "text-false",
          )}
        >
          {UPDATE_OPTIONS.map((option) => {
            const isSelected = values.updateType === option.value;

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
                  name="updateType"
                  value={option.value}
                  checked={isSelected}
                  onChange={set("updateType")}
                  onBlur={blur("updateType")}
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
                  {option.blurb}
                </span>
              </label>
            );
          })}
        </div>
        {errorFor("updateType") ? (
          <p className="cs-error-text mt-1.5">{errorFor("updateType")}</p>
        ) : null}
      </fieldset>

      <Textarea
        label="What should it say"
        required
        rows={5}
        maxLength={2000}
        placeholder="The change itself, written so someone who has not met you can check it against the source. Include dates."
        hint={`${values.detail.length}/2000 · write what the profile should say, not why you think it should`}
        error={errorFor("detail")}
        value={values.detail}
        onChange={set("detail")}
        onBlur={blur("detail")}
      />

      <Input
        label="Source link"
        required
        type="url"
        inputMode="url"
        placeholder="https://"
        hint={
          <>
            The document this claim rests on: a court record, an official statement, a dated news
            report. A link to a social media post that says the same thing is not a source. We cannot
            publish an entry without one.
          </>
        }
        error={errorFor("sourceUrl")}
        value={values.sourceUrl}
        onChange={set("sourceUrl")}
        onBlur={blur("sourceUrl")}
      />

      <Textarea
        label="Anything else we should know (optional)"
        rows={3}
        maxLength={500}
        placeholder="e.g. This is the second outlet to report it. The court ruling is dated March, not April."
        hint="Optional. Useful context, and it is not an identity field: we do not ask for your name and adding it would not help."
        value={note}
        onChange={(event) => setNote(event.target.value)}
        onBlur={blur("note")}
      />

      {/* The honest expectations, stated before submission rather than after
          it fails. Two things a contributor needs to know: nothing goes up
          automatically, and an unsourced claim will not go up at all. */}
      <div className="cs-card space-y-2 p-3.5">
        <p className="flex gap-2.5 text-xs leading-relaxed text-fg-secondary">
          <FileSearch size={15} className="mt-0.5 shrink-0 text-fg-faint" aria-hidden="true" />
          <span>
            Nothing here is published automatically. A suggestion is checked against the source you
            link, and it is added only if it holds up. If it does not, we will say so rather than
            quietly dropping it.
          </span>
        </p>
        <p className="flex gap-2.5 border-t border-line-subtle pt-2 text-xs leading-relaxed text-fg-secondary">
          <ScrollText size={15} className="mt-0.5 shrink-0 text-fg-faint" aria-hidden="true" />
          <span>
            We publish sourced records, not accusations. A suggestion to add an allegation without a
            document will be declined, however sincerely it is sent.
          </span>
        </p>
        <p className="flex gap-2.5 border-t border-line-subtle pt-2 text-xs leading-relaxed text-fg-secondary">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-fg-faint" aria-hidden="true" />
          <span>
            You do not need to identify yourself. A sourced document is checkable on its own terms;
            who sent it is not what makes it true.
          </span>
        </p>
      </div>

      {error ? (
        <Alert tone="error" title="The suggestion was not saved">
          {error.message}
        </Alert>
      ) : null}

      {submitted && !isValid ? (
        <Alert tone="warning" title="Check the highlighted fields">
          Nothing was saved because some required information is missing. The source link is the one
          most often left out.
        </Alert>
      ) : null}

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
            Saving
          </>
        ) : (
          <>
            <Send size={15} aria-hidden="true" />
            Send suggestion
          </>
        )}
      </Button>
    </form>
  );
}

export default ProfileSuggestionForm;