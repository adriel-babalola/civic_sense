import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site-config";

export default function SiteFooter() {
  return (
    <footer className="border-t-2 py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row md:px-20">
          <section className="flex items-center gap-3">
            <div className="inline-flex size-8 items-center justify-center rounded-lg border">
              <Icons.logo className="size-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium">{siteConfig.name}</p>
              <p className="text-white/40 text-xs">{siteConfig.tagline}</p>
            </div>
          </section>
          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/50">
            {siteConfig.navItems.map((item, index) => (
              <a
                href={item.href}
                key={index}
                className="transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <a
              href={siteConfig.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              Try on WhatsApp
            </a>
            <a
              href={siteConfig.links.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              GitHub
            </a>
            <a
              href={siteConfig.links.politicianRequestUrl}
              className="transition hover:text-white"
            >
              Request a new politician
            </a>
          </nav>
          <div>
            <ul className="flex justify-center gap-3 text-white/40">
              <li className="cursor-pointer transition hover:text-white">
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat with CivicSense on WhatsApp"
                >
                  <Icons.whatsapp className="size-5" />
                </a>
              </li>
              <li className="cursor-pointer transition hover:text-white">
                <a
                  href={siteConfig.links.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="CivicSense on X (Twitter)"
                >
                  <Icons.x className="size-5" />
                </a>
              </li>
              <li className="cursor-pointer transition hover:text-white">
                <a
                  href={siteConfig.links.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="CivicSense on Instagram"
                >
                  <Icons.instagram className="size-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
  );
}
