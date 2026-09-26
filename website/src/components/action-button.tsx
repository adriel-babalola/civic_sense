import type { HTMLAttributes } from "react";

type ActionButtonProps = Omit<
  HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>,
  "className"
> & {
  label: string;
  href?: string;
};

export function ActionButton({ label, href, ...props }: ActionButtonProps) {
  const klass =
    "relative inline-flex cursor-pointer items-center rounded-lg bg-linear-to-b from-[#032d21] to-[#0b6042] px-4 py-2.5 font-medium text-sm text-white transition hover:from-[#064033] hover:to-[#0e6d4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400";

  const content = (
    <>
      <span className="absolute inset-0 rounded-lg">
        <span className="mask-[linear-gradient(to_bottom,black,transparent)] absolute inset-0 rounded-lg border border-emerald-100/20" />
        <span className="mask-[linear-gradient(to_top,black,transparent)] absolute inset-0 rounded-lg border border-emerald-50/40" />
      </span>
      <span className="relative">{label}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className={klass}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button className={klass} {...props}>
      {content}
    </button>
  );
}
