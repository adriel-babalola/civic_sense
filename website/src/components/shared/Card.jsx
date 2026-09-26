import { cn } from "../../utils/cn";

/**
 * Card.
 *
 * The single surface primitive. `interactive` adds the hover treatment used
 * anywhere a card is also a link or a click target, and it is applied via a
 * group so the whole card responds rather than only its title.
 */
export function Card({ as: Component = "div", interactive = false, className, children, ...props }) {
  return (
    <Component
      className={cn("cs-card", interactive && "cs-card-interactive", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Card with a titled header row and an optional action slot on the right. */
export function CardHeader({ title, description, action, className, children }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-4 pt-4 pb-3", className)}>
      <div className="min-w-0">
        {title ? <h3 className="text-sm font-semibold text-fg">{title}</h3> : null}
        {description ? <p className="mt-0.5 text-xs text-fg-muted">{description}</p> : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn("px-4 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn("flex items-center gap-2 border-t border-line px-4 py-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Hairline divider that matches the card border. */
export function Divider({ className, ...props }) {
  return <div role="separator" className={cn("h-px bg-line", className)} {...props} />;
}

export default Card;
