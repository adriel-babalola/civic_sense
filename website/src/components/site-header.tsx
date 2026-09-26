"use client";

import type { Route } from "next";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { BadgeCheck, Info, Newspaper, Workflow, type LucideIcon } from "lucide-react";
import { ActionButton } from "@/components/action-button";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { siteConfig } from "@/config/site-config";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  "#about": Info,
  "#sources": Newspaper,
  "#how-it-works": Workflow,
  "#verdicts": BadgeCheck,
};

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl bg-transparent px-3 py-2.5 backdrop-blur-lg md:gap-4 md:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <div className="inline-flex size-10 items-center justify-center rounded-lg border">
            <Icons.logo className="size-8 text-emerald-400" />
          </div>
          <span className="font-semibold text-white tracking-tight">
            {siteConfig.name}
          </span>
        </Link>
        <section className="max-md:hidden">
          <nav className="flex items-center gap-8 text-sm">
{siteConfig.navItems.map((item, index) => {
              const Icon = NAV_ICONS[item.href];
              return (
                <a
                  href={item.href}
                  className="flex items-center gap-1.5 text-white/90 transition hover:text-emerald-300"
                  key={index}
                >
                  <Icon className="size-4 text-emerald-300/80" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </section>
        <section className="flex shrink-0 items-center max-md:gap-2.5">
          <div className="max-sm:hidden">
            <ActionButton
              label="Try on WhatsApp"
              href={siteConfig.whatsappUrl}
            />
          </div>
          <MobileNav
            open={isOpen}
            setOpen={setIsOpen}
            className="flex md:hidden"
          />
        </section>
      </div>
    </header>
  );
}

function MobileNav({
  open,
  setOpen,
  className,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
}) {
  // Prevent body scroll when the menu is open
  if (typeof window !== "undefined") {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "extend-touch-target !p-0 flex size-9 touch-manipulation items-center justify-start gap-2.5 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent",
            "items-center justify-center border",
            className,
          )}
        >
          <div className="relative flex h-8 w-4 items-center justify-center">
            <div className="relative size-4">
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                  open ? "top-[0.4rem] -rotate-45" : "top-1",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 block h-0.5 w-4 bg-foreground transition-all duration-100",
                  open ? "top-[0.4rem] rotate-45" : "top-2.5",
                )}
              />
            </div>
            <span className="sr-only">Toggle Menu</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="no-scrollbar h-(--radix-popper-available-height) w-(--radix-popper-available-width) overflow-y-auto rounded-none border-t border-white/10 bg-background/60 p-0 shadow-none backdrop-blur-xl duration-100"
        align="start"
        side="bottom"
        alignOffset={-32}
        sideOffset={16}
      >
        <div className="flex flex-col gap-12 overflow-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            <div className="mt-4 flex flex-col gap-3">
              <MobileLink href="/" onOpenChange={setOpen}>
                Home
              </MobileLink>
              {siteConfig.navItems.map((item, index) => (
                <MobileLink
                  key={index}
                  href={item.href as Route}
                  onOpenChange={setOpen}
                >
                  {item.label}
                </MobileLink>
              ))}
            </div>
          </div>
          <div>
            <ActionButton
              label="Try on WhatsApp"
              href={siteConfig.whatsappUrl}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: LinkProps<Route> & {
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href as Route);
        onOpenChange?.(false);
      }}
      className={cn("font-medium text-2xl", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
