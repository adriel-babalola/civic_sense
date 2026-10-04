import { FlaskConical } from "lucide-react";
import { cn } from "../../utils/cn";
import { SAMPLE_NOTICE } from "../../data/demo-data";

/**
 * Notice that the page below is showing demonstration data.
 *
 * This is not decoration and it is not optional. The incident map, the
 * verification feed and the source registry are populated from
 * ../data/demo-data.js, and a reader scanning a map of Nigeria cannot tell a
 * sample row from a corroborated report. Publishing invented incidents under a
 * real civic product's name would be defamatory to whoever is actually in the
 * state named, so the label travels with the data on every surface that shows it.
 *
 * It is styled as a caution rather than as an error: the data is fine for
 * previewing the interface, it is just not reporting anything.
 */
export function SampleBanner({ className, children }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-card border border-misleading/25 bg-misleading/[0.06] px-3.5 py-3",
        className,
      )}
    >
      <FlaskConical size={15} className="mt-0.5 shrink-0 text-misleading" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-fg-secondary">
        <span className="font-medium text-misleading">Demonstration data. </span>
        {children || SAMPLE_NOTICE}
      </p>
    </div>
  );
}

export default SampleBanner;