import { useState } from "react";
import { AlertCircle, ImageIcon, Loader2, RotateCcw, Send } from "lucide-react";
import { CONFIG } from "../../config/config";
import { runSampleFactCheck } from "../../data/demo-data";
import { Container, PageHeader, SectionHeading } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { Alert } from "../../components/shared/Field";
import { Textarea } from "../../components/shared/Input";
import { FileUpload } from "../../components/shared/FileUpload";
import { VerdictCard, VerdictExplainer } from "../../components/sections/VerdictCard";
import { SampleBanner } from "../../components/shared/SampleBanner";

/**
 * A handful of real claims, offered as a starting point. A blank box is a
 * harder first step than it looks. These are illustrative examples, not a
 * popularity ranking, and nothing on this page implies otherwise.
 */
const EXAMPLES = [
  "The federal government removed the fuel subsidy in May 2023",
  "The new national minimum wage is ₦70,000 per month",
  "INEC has cancelled the 2027 general elections",
];

/**
 * Web fact-check.
 *
 * Runs locally against the sample index in ../../data/demo-data, in place of
 * POST /api/factcheck, which had no server behind it on a static host. The shape
 * of the page is the real one: same form, same four verdicts, same source list,
 * so restoring the pipeline is a change of one import.
 *
 * The result is a sample verdict and the interface says so, both before the check
 * runs and on the result itself. Presenting a canned answer as though a live
 * retrieval pass had researched the claim would be the dishonest version of this
 * feature, and on a fact-checking product that is not a tradeoff worth making for
 * a better-looking demo.
 */
export function FactCheck() {
  const [claim, setClaim] = useState("");
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const canSubmit = Boolean(claim.trim() || image) && !isRunning;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      // Brief delay so the pending state is legible. The real pipeline takes
      // seconds, and an instant result reads as a cached page rather than a check.
      await new Promise((resolve) => setTimeout(resolve, 900));
      setResult(runSampleFactCheck(claim.trim() || caption.trim() || "image"));
    } catch (err) {
      setError(err);
    } finally {
      setIsRunning(false);
    }
  };

  const reset = () => {
    setClaim("");
    setCaption("");
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <>
      <Container className="py-12 sm:py-14">
        {/* The header and the workspace share one measure. Previously the header
            ran the full 82rem while the form sat in a centred 42rem strip under
            it, so the two read as unrelated blocks. */}
        <div className="mx-auto max-w-3xl">
          <PageHeader
            eyebrow="Truth awareness"
            title="Check a claim"
            description="Write the claim, or drop in a screenshot of the poster saying it. You get a verdict and the reporting behind it."
            className="border-b-0 pb-0"
          />
        </div>

        <div className="mx-auto mt-6 max-w-3xl">
          <SampleBanner>
            No fact-checking server is connected to this deployment, so checks are answered
            from a small bundled sample index. The verdict is not a real finding. Send the claim
            to the bot to have it genuinely checked.
          </SampleBanner>
        </div>

        <div className="mx-auto mt-4 max-w-3xl">
          <form onSubmit={submit} className="cs-card p-5" noValidate>
            <Textarea
              label="The claim"
              hint="Write it as you heard it. Vague claims produce vague verdicts."
              placeholder="e.g. The federal government has banned withdrawals above 200,000 naira"
              rows={4}
              value={claim}
              onChange={(event) => setClaim(event.target.value)}
              maxLength={1000}
            />

            <div className="mt-4">
              <span className="cs-label">Or attach a screenshot</span>
              <FileUpload value={image} onChange={setImage} />
            </div>

            {image ? (
              <div className="mt-4">
                <Textarea
                  label="Caption"
                  hint="What is claimed in the image, if the text is hard to read."
                  placeholder="e.g. A poster claiming the election has been cancelled"
                  rows={2}
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  maxLength={300}
                />
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isRunning}
                disabled={!canSubmit}
              >
                {isRunning ? (
                  <>
                    <Loader2 size={15} className="cs-spinner" aria-hidden="true" />
                    Checking sources
                  </>
                ) : (
                  <>
                    <Send size={15} aria-hidden="true" />
                    Check this claim
                  </>
                )}
              </Button>
              {(claim || image || result) && !isRunning ? (
                <Button type="button" variant="ghost" size="lg" onClick={reset}>
                  <RotateCcw size={14} aria-hidden="true" />
                  Clear
                </Button>
              ) : null}
            </div>

            <p className="cs-hint mt-3">
              A live check takes up to about 30 seconds. It searches a local index of Nigerian
              newsrooms and live search in parallel, then reads the evidence once.
            </p>
          </form>

          <SuggestionPanel onPick={setClaim} disabled={Boolean(claim || image)} />

          <div className="mt-4">
            <ResultPanel result={result} error={error} isRunning={isRunning} />
          </div>

          <p className="cs-hint mt-6 text-center">
            Prefer to do this in a chat?{" "}
            <a
              href={CONFIG.WHATSAPP.joinLink}
              className="font-medium text-brand-bright hover:underline"
            >
              Send it to the bot on WhatsApp
            </a>
            .
          </p>
        </div>

        {/* The reference table is four cards across and needs the full measure.
            Inside the workspace column it collapsed to one unreadable card per
            row, so it lives outside the column with its own rule above it. */}
        <div className="mt-16 border-t border-line pt-12">
          <SectionHeading eyebrow="Reference" title="What each verdict means" />
          <VerdictExplainer className="mt-8" />
        </div>
      </Container>
    </>
  );
}

/**
 * Starting points.
 *
 * These are three fixed examples, so they are labelled as examples. The panel
 * deliberately does not claim to show "trending" checks or a live count: there
 * is no analytics pipeline behind this page, and inventing a number there would
 * contradict the entire product. The dot reflects one real thing, whether
 * something has been typed yet, and says so in words.
 */
function SuggestionPanel({ onPick, disabled }) {
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <span className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
          Or try one of these
        </span>
        <span className="flex items-center gap-1.5 text-2xs text-fg-faint">
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              disabled ? "bg-brand-bright" : "bg-fg-faint",
            ].join(" ")}
            aria-hidden="true"
          />
          {disabled ? "Ready to check" : "Waiting for a claim"}
        </span>
      </div>

      <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-3">
        {EXAMPLES.map((example) => (
          <li key={example}>
            <button
              type="button"
              onClick={() => onPick(example)}
              className="h-full w-full rounded-control border border-line bg-surface px-3 py-2 text-left text-sm leading-snug text-fg-secondary transition-colors hover:border-line-strong hover:text-fg"
            >
              {example}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Result, error, or the empty state. One component so the panel never flickers between shapes. */
function ResultPanel({ result, error, isRunning }) {
  if (isRunning) {
    return (
      <div className="cs-card p-5" aria-busy="true">
        <p role="status" className="flex items-center gap-2 text-sm text-fg-secondary">
          <Loader2 size={15} className="cs-spinner" aria-hidden="true" />
          Searching sources…
        </p>
        <div className="mt-4 space-y-2.5" aria-hidden="true">
          <div className="cs-skeleton h-5 w-24 rounded-full" />
          <div className="cs-skeleton h-3 w-full" />
          <div className="cs-skeleton h-3 w-11/12" />
          <div className="cs-skeleton h-3 w-3/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert tone="error" title="The check did not complete">
        {error.message}
        <p className="mt-2 text-fg-muted">
          If this keeps happening, the server may be down. You can also send the claim on WhatsApp.
        </p>
      </Alert>
    );
  }

  if (!result) {
    return (
      <div className="cs-card flex flex-col items-center px-6 py-12 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface">
          <ImageIcon size={17} className="text-fg-faint" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-medium text-fg">No result yet</p>
        <p className="mt-1 max-w-xs text-sm text-fg-muted">
          Enter a claim or attach an image, then run the check. The verdict and its sources appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="cs-enter space-y-3">
      <SampleBanner>
        Sample verdict from the bundled index, not a real fact-check. Nothing here has been
        independently verified.
      </SampleBanner>

      <VerdictCard record={result} />

      {result.extractedClaim ? (
        <Alert tone="info" title="Claim read from the image">
          {result.extractedClaim}
        </Alert>
      ) : null}

      <div className="cs-card space-y-2.5 p-4">
        <p className="text-2xs font-semibold uppercase tracking-[0.08em] text-fg-faint">
          Sources
        </p>
        {result.structured?.sources?.length ? (
          <ul className="space-y-1.5">
            {result.structured.sources.map((source, index) => (
              <li key={`${source.title}-${index}`} className="p-1.5">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 rounded-control transition-colors hover:bg-card-active"
                  >
                    <AlertCircle
                      size={12}
                      className="mt-1 shrink-0 text-fg-faint"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-fg group-hover:text-brand-bright">
                        {source.title}
                      </span>
                      <span className="block truncate text-2xs text-fg-faint">{source.site}</span>
                    </span>
                  </a>
                ) : (
                  // Named in the rule but absent from the registry. Shown, not
                  // hidden, and marked, so the reader can see exactly how much of
                  // the evidence is independently reachable.
                  <span className="flex items-start gap-2">
                    <AlertCircle size={12} className="mt-1 shrink-0 text-fg-faint" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-fg-secondary">
                        {source.title}
                      </span>
                      <span className="block truncate text-2xs text-fg-faint">{source.site}</span>
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-muted">
            No usable source was returned with this verdict. That is itself a signal: treat the
            claim as unconfirmed.
          </p>
        )}
      </div>
    </div>
  );
}

export default FactCheck;
