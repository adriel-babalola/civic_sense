import { useId } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { Field } from "./Field";

/** Text input with a consistent shell and optional leading icon. */
export function Input({ label, hint, error, required, icon: Icon, className, wrapperClassName, ...props }) {
  const id = useId();

  const control = (a11y) => (
    <div className="relative">
      {Icon ? (
        <Icon
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
          aria-hidden="true"
        />
      ) : null}
      <input
        id={id}
        className={cn("cs-field", Icon && "pl-9", className)}
        {...a11y}
        {...props}
      />
    </div>
  );

  if (!label && !hint && !error) return control({});

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={wrapperClassName}
    >
      {control}
    </Field>
  );
}

/** Search input with a clear affordance. */
export function SearchInput({ value, onChange, placeholder = "Search", className, ...props }) {
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="cs-field pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-fg-muted transition-colors hover:bg-card-active hover:text-fg"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Select.
 *
 * A native `select` is the right control here: it gets the platform picker on
 * mobile, keyboard navigation, and screen-reader support for free. A custom
 * listbox would be a regression on all three.
 */
export function Select({
  label,
  hint,
  error,
  required,
  options = [],
  placeholder = "Select…",
  className,
  wrapperClassName,
  ...props
}) {
  const id = useId();

  const control = (a11y) => (
    <select id={id} className={cn("cs-field cs-select", className)} {...a11y} {...props}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => {
        const value = typeof option === "string" ? option : option.value;
        const text = typeof option === "string" ? option : option.label;
        return (
          <option key={value} value={value}>
            {text}
          </option>
        );
      })}
    </select>
  );

  if (!label && !hint && !error) return control({});

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={wrapperClassName}
    >
      {control}
    </Field>
  );
}

/** Multi-line input. Grows to a minimum height and never scrolls horizontally. */
export function Textarea({ label, hint, error, required, rows = 4, className, wrapperClassName, ...props }) {
  const id = useId();

  const control = (a11y) => (
    <textarea
      id={id}
      rows={rows}
      className={cn("cs-field resize-y leading-relaxed", className)}
      {...a11y}
      {...props}
    />
  );

  if (!label && !hint && !error) return control({});

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={wrapperClassName}
    >
      {control}
    </Field>
  );
}

/**
 * Segmented control. A radio group styled as tabs — used for filters where the
 * option set is small and mutually exclusive.
 */
export function SegmentedControl({ label, value, onChange, options, className, size = "md" }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex w-full rounded-control border border-line bg-surface p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const text = typeof option === "string" ? option : option.label;
        const selected = optionValue === value;
        const count = typeof option === "object" ? option.count : undefined;

        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(optionValue)}
            className={cn(
              // min-w-0 + truncate on the label: four options carrying a count
              // each ("Civil unrest 12") overflow a 375px row and push the whole
              // control past its container, which is where the map used to go
              // sideways on a phone.
              "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[6px] font-medium transition-colors",
              size === "sm" ? "px-1.5 py-1 text-xs" : "px-2 py-1.5 text-sm",
              selected
                ? "bg-card-active text-fg shadow-card"
                : "text-fg-muted hover:bg-white/[0.03] hover:text-fg-secondary",
            )}
          >
            {selected ? <Check size={12} strokeWidth={2.5} aria-hidden="true" /> : null}
            <span className="truncate">{text}</span>
            {typeof count === "number" ? (
              <span
                className={cn(
                  "shrink-0 tabular-nums text-2xs",
                  selected ? "text-fg-secondary" : "text-fg-faint",
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Disclosure row, used by the FAQ. */
export function Accordion({ open, onToggle, question, children }) {
  const id = useId();
  return (
    <div className="border-b border-line last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-4 py-4 text-left"
        >
          <span className="text-[0.9375rem] font-medium text-fg">{question}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "shrink-0 text-fg-muted transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </h3>
      <div
        id={id}
        hidden={!open}
        className="cs-enter pb-4 text-sm leading-relaxed text-fg-secondary"
      >
        {children}
      </div>
    </div>
  );
}

export default Input;
