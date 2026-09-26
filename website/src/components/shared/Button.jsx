import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * Button.
 *
 * One component covers every affordance in the product. `as` renders a router
 * `Link` or an `a` when the destination is external, so a call to action never
 * has to be a styled `div` with an onClick — which keeps middle-click, copy
 * link, and keyboard activation working.
 */

const VARIANTS = {
  primary: "cs-btn-primary",
  accent: "cs-btn-accent",
  secondary: "cs-btn-secondary",
  ghost: "cs-btn-ghost",
  danger: "cs-btn-danger",
};

const SIZES = {
  sm: "cs-btn-sm",
  md: "cs-btn-md",
  lg: "cs-btn-lg",
};

const Button = forwardRef(function Button(
  {
    as,
    variant = "secondary",
    size = "md",
    href,
    to,
    loading = false,
    disabled,
    fullWidth = false,
    className,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  const classes = cn(
    "cs-btn",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );

  // A loading button stays in the layout at its original width and stays
  // focusable, so focus is not lost mid-submit.
  const content = loading ? (
    <>
      <Loader2 size={size === "sm" ? 13 : 15} className="cs-spinner" aria-hidden="true" />
      <span>{children}</span>
    </>
  ) : (
    children
  );

  const state = { disabled: disabled || loading, "aria-busy": loading || undefined };

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...state} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    const external = href.startsWith("http");
    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...state}
        {...props}
      >
        {content}
      </a>
    );
  }

  const Component = as || "button";
  return (
    <Component ref={ref} type={Component === "button" ? type : undefined} className={classes} {...state} {...props}>
      {content}
    </Component>
  );
});

export { Button };
export default Button;
