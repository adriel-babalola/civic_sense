import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileSearch } from "lucide-react";
import { getPoliticianBySlug } from "../../data/politicians";
import { Container, PageHeader } from "../../components/shared/Layout";
import { Button } from "../../components/shared/Button";
import { ProfileSuggestionForm } from "../../components/politicians/ProfileSuggestionForm";
import { NotFound } from "../NotFound";

/**
 * Suggest a change to a politician's profile.
 *
 * Its own route, its own form, its own local store — deliberately not a mode of
 * the incident report. It used to be, via `/report?politician=`, and the merge
 * cost more than it saved:
 *
 *   - The incident form's whole safety argument is that there is no identity
 *     field and no per-person context. Handing it a named subject made the
 *     stored record read as though we had tied a person to a report, which is
 *     the association it exists to avoid.
 *   - The two have opposite requirements. Incident evidence is optional, since
 *     the reporter is the witness. A profile entry needs a source, always,
 *     because a profile is a sourced document and an unsourced entry is the
 *     thing this project exists not to publish.
 *
 * So: `/report` is incidents only and no longer knows what a politician is, and
 * this form asks for a source up front. They share styling primitives, which is
 * the similarity that actually matters to a reader.
 */
export function SuggestUpdate() {
  const { slug } = useParams();
  const person = getPoliticianBySlug(slug);
  const [receipt, setReceipt] = useState(null);

  if (!person) return <NotFound />;

  return (
    <>
      <Container size="prose" className="py-12 sm:py-16">
        <PageHeader
          eyebrow="Correction"
          title={`Suggest an update to ${person.name}'s profile`}
          description="Every entry on a profile carries a source. If one is missing, wrong or out of date, send the document and say what it should say instead."
        />

        <div className="mt-6">
          <Link
            to={`/politicians/${person.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to the profile
          </Link>
        </div>

        {receipt ? (
          <div className="cs-card mt-8 p-6">
            <CheckCircle2 size={22} className="text-verified" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold text-fg">Suggestion recorded</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
              Your suggestion about {person.name} has been saved in this browser. A suggestion is
              checked against the source you linked before it goes up, and if it does not hold up we
              will say so rather than dropping it silently.
            </p>

            {/*
              In a deployment with a backend this is where a review reference
              would be printed. It is not, because nothing is transmitted in this
              build and printing one would tell a contributor that a researcher
              is waiting for a submission that never arrived.
            */}
            <div className="cs-card mt-4 flex gap-2.5 p-3.5">
              <FileSearch size={15} className="mt-0.5 shrink-0 text-fg-faint" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-fg-muted">
                This demo has no server attached, so this suggestion is stored in this browser only
                and nothing has been sent. Nothing you write here reaches anyone.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button to={`/politicians/${person.id}`} variant="primary" size="sm">
                Back to {person.name.split(" ").slice(-1)[0]}&rsquo;s profile
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setReceipt(null)}>
                Suggest something else
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <ProfileSuggestionForm person={person} onSubmitted={setReceipt} />
          </div>
        )}
      </Container>
    </>
  );
}

export default SuggestUpdate;