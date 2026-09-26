# CivicSense — Website

The public website for **CivicSense**: a WhatsApp AI fact-checking bot and civic accountability platform for Nigerians.

> Send a rumour to WhatsApp. Get the truth back.

Built with Next.js 16, React 19, TailwindCSS v4, Shadcn UI and Motion.

This app is the canonical front door for CivicSense. All product pages and planned feature pages live here — see `documentation/CONTEXT_v2.md` for the page plan and 4-month roadmap.

## Home page sections

- **Hero** — animated cosmic planet with the CivicSense wordmark and the WhatsApp CTA
- **Sources** — marquee of the 17 Nigerian newsrooms and IFCN fact-checkers the bot verifies against
- **How it works** — three interactive steps from rumour to a sourced verdict
- **Sample verdicts** — scrolling cards of real claims from the civic knowledge base
- **Call to action** — the WhatsApp invite and anonymous report entry point

## Planned pages

| Route | Purpose | Status |
|---|---|---|
| `/` | Marketing home | Exists |
| `/fact-check` | Public web fact-check UI | New |
| `/politicians` | Searchable index of 50+ profiles | Month 1 |
| `/politicians/[slug]` | Bio, policies, scandals, media | Month 1 |
| `/report` | Anonymous incident report form | Port from `cs_website/` |
| `/map` | Public incident map by state/LGA | Port from `cs_website/` |
| `/live` | Live fact-check feed | New |
| `/about`, `/team`, `/sources`, `/privacy` | Trust + transparency | Partial |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # biome check .
```

## Notes

- The WhatsApp CTA opens `https://wa.me/14155238886` (Twilio sandbox). Update
  `src/config/site-config.ts` when the production number is ready.
- `mapUrl`, `reportUrl` and `dashboardUrl` in `src/config/site-config.ts` are
  placeholders — replace them with the live `cs_website` / `fc_dashboard`
  deployments, or with the ported `/report` and `/map` routes in this app.
- News outlet favicons in `src/assets/sources/` are the official site icons,
  fetched from each outlet's own domain.
- Backend calls go to the `bot_server` API. Full reference in
  `documentation/API.md`.