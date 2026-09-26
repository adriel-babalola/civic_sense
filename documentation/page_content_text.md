# CivicSense public copy

**The framing, in one line:** truth awareness and youth/mass sensitisation, so
decisions are informed. Claim checking is the tool, not the pitch.

Source of truth for all user-visible text on the public site. Most of it lives in
`website/src/data/content.js` and `website/src/data/faq.js`; this file is the
review copy and the translation reference. If the two disagree, the code is
right and this file is stale.

Copy rules that apply to everything below:

- No em dashes. A full stop, a comma or a colon instead.
- No invented engagement numbers, view counts or "trending" labels. There is no
  analytics pipeline behind any of this.
- No allegations, ages or court outcomes about a living person without a primary
  source and a date. An unfilled section says so; it never reads as an all-clear.
- No team member names, faces or biographies anywhere on the public site.
- Nigerian spelling, "sensitise" not "sensitize", and naira written out rather
  than symbol-only in body copy.

---

## Brand

| | |
|---|---|
| Wordmark | CivicSense |
| HTML title | Truth Awareness CivicSense |
| Descriptor | Truth awareness |
| Tagline | Truth awareness, so every decision is an informed one. |
| Purpose line | Youth and mass sensitisation |
| Short description | CivicSense builds truth awareness among young Nigerians and the wider public, so decisions are informed. Check any political claim on WhatsApp and get a sourced verdict in under 30 seconds. No app, no sign-up. |

The logo is a shield with a checkmark: something you can rely on, and a claim
that survived being checked. It is unchanged by the reframe.

---

## Home page

### Hero

Full-bleed image slider behind the text. Four elements, one button. This is the
final copy; the long mission statement that used to sit here moved to About.

| Element | Copy |
|---|---|
| Heading (h1) | CivicSense |
| Tagline | Verify. Share. Vote **informed**. |
| Body | Send a claim to WhatsApp. Get the truth back in seconds. |
| Button | Try on WhatsApp |

No eyebrow, no second call to action, no footnote. The photographs rotate behind
the copy on a seven second cycle with a 1.4 second crossfade and a slow zoom, over
a single flat navy overlay at 50% so the whole image is evenly darkened and the
photograph is still legible through it. There is deliberately no gradient at the
top or bottom edge: an earlier version weighted the bottom of the frame, which
read as a smudge under the copy. Motion is disabled under
`prefers-reduced-motion`, and the first slide is eager so the largest painted
element does not arrive late.

The mission statement, **Reclaim your voice. Restore accountability. Build the
Nigeria you deserve.**, now appears on the About page only.

### Source band

Label: **Checked against reporting from**

A marquee of the 17 newsrooms in the registry. Named with their real logos,
because the whole claim of the product is which sources the verdicts come from.

### How it works

Eyebrow **How it works**, heading **Three steps, about twenty seconds**,
subline **No account to create and nothing to install. The chat is the entire
interface.**

| Step | Title | Body |
|---|---|---|
| 01 | Send what you were told | Forward a message, a poster screenshot, or a news clip to the CivicSense number on WhatsApp. It reads the claim out of an image too. |
| 02 | We check it against reporting | The claim is matched against a local index of Nigerian newsrooms, live search, and a curated civic reference set. |
| 03 | You decide for yourself | VERIFIED, FALSE, MISLEADING or UNVERIFIED, with the evidence and a link to every source. The answer comes with the reporting attached, not instead of it. |

### What you can do

Heading: **Three tools for making up your own mind**
Subline: Check a claim before you forward it, see who is deciding and what has
been documented about them, and report what you see at the polling unit.

| Title | Body | Link |
|---|---|---|
| Check before you believe | Send a rumour to WhatsApp and get a sourced verdict in under 30 seconds. Send a screenshot and the bot reads the claim out of the image. | Check a claim |
| Know who decides | The 2027 presidential field exactly as INEC certified it, with every running mate one click from their candidate. | See the candidates |
| Speak up, safely | Report violence, malpractice or unrest where it happens. No name, no account, no trail. Verified reports go on the public map. | File a report |

### Examples

Heading: **What an answer looks like**
Subline: Illustrative output, shown so you know what to expect before you send
anything. These are samples, never presented as live results.

| Claim | Verdict | Source |
|---|---|---|
| The federal government removed the fuel subsidy in May 2023. | VERIFIED | Premium Times, The Cable |
| Nigeria's external debt has crossed 100 trillion naira. | VERIFIED | Debt Management Office, BusinessDay |
| The new minimum wage is 70,000 naira per month. | VERIFIED | National Orientation Agency, Premium Times |
| Petrol now sells for 200 naira per litre nationwide. | FALSE | NBS, Premium Times |
| The minimum wage was raised to 30,000 naira in 2024. | MISLEADING | Premium Times |
| A former INEC chairman has been appointed to a cabinet position. | UNVERIFIED | No reliable source found |

### What the verdicts mean

Heading: **Four verdicts, and we only give a confident one when the evidence
earns it.** If only one source backs a claim, we say so. An honest UNVERIFIED is
more useful than a confident guess.

| Verdict | Meaning |
|---|---|
| VERIFIED | Two or more independent sources confirm it. |
| FALSE | Independent sources contradict it. |
| MISLEADING | True in part, but framed to deceive. |
| UNVERIFIED | We could not confirm it from any reliable source. |

### Mission

Eyebrow **Why we built this**, heading **Most Nigerians are not apathetic about
their country. They are misinformed about it.**

> Young Nigerians are handed more political information in a day than their
> parents saw in a year, and almost all of it arrives unverified. A screenshot
> lands in a group chat, nobody can tell whether it is real, and it gets
> forwarded anyway. By the time a newsroom has checked it, the claim has already
> shaped what a hundred thousand people believe.
>
> That is a sensitisation problem before it is a technology problem. CivicSense
> exists to put truth awareness in the path of the rumour. You forward the claim,
> and within seconds you get an answer with the reporting attached, so you can
> judge the evidence yourself and decide what to do with it.
>
> The second half of the problem is memory. Politicians make promises, get
> elected, and the record is never assembled in one place. So we keep it: who
> holds office, what they said, and what has been documented since.
>
> The aim is not to tell young Nigerians what to think. It is to make sure that
> whatever they think, they arrived at it from evidence. We are a small team of
> Nigerian engineers and researchers. We do not publish individual names on this
> site, and we answer to one anonymous email address.

### Trust

Heading: **We ask you to trust nothing. We ask you to read the sources.**

| Point | Body |
|---|---|
| No account | No app, no sign-up, no email. A chat message is the whole interface, so it works on any phone. |
| No tracking | No analytics, no advertising pixels, no third-party scripts. We do not build a profile of you. |
| Sources shown | Every verdict lists the reporting it came from. Check our work. |
| Anonymous reporting | The report form has no field that could identify you. |

### Closing call to action

Heading: **The next claim is already in your inbox**
Body: Forward it and find out before you forward it on. One message, and it is
free.
Buttons: Open WhatsApp, Report misconduct. Or email us.

---

## About

Descriptor: **Truth awareness for youth and the public, so decisions are
informed.**

> CivicSense is a truth awareness and civic sensitisation platform. Its work is
> youth and mass sensitisation: helping young Nigerians and the wider public check
> what reaches them, and reach decisions they can stand behind.
>
> The framing is deliberate. A fact-checker answers one question about one claim.
> What actually decides an election in Nigeria is a habit: whether people pause
> before they forward, and whether they learn to want the source rather than the
> summary. So fact-checking is the tool here, and truth awareness is the goal.
>
> The barrier to that habit is time. Checking is slow, the tools are in English,
> and the moment you need to check something is usually the moment you are on
> WhatsApp with two hundred other people forwarding it. So the first version of
> this was a bot, not a website: forward anything, get a verdict back in under
> thirty seconds.
>
> The website exists for the other half. Claims get checked in private, but a
> corroboration that a thousand people saw forwarded should be standing on the
> public record too. That is the incident map, and it is the part only a website
> can do.

Also on this page: **Why we are anonymous** (no team page, no founder
biography, no photographs, contact through one address), the trust points, and
the corrections notice: *A verdict is a research aid, not a legal judgement. If
you intend to act on one, in court, in a newspaper or in a campaign, read the
sources first.*

---

## Fact-check

Title **Check a claim**
Description: Write the claim, or drop in a screenshot of the poster saying it.
You get a verdict and the reporting behind it.

Field label **The claim**, hint **Write it as you heard it. Vague claims produce
vague verdicts.** Placeholder: *e.g. The federal government has banned
withdrawals above 200,000 naira*

Upload label **Or attach a screenshot.** An attached image reveals a **Caption**
field: *What is claimed in the image, if the text is hard to read.*

Button **Check this claim**, then **Checking sources** while running, and
**Clear** once there is something to clear.

Support line: A check takes up to about 30 seconds. It searches a local index of
Nigerian newsrooms and live search in parallel, then reads the evidence once.

### Example claims

Labelled **Or try one of these**, never "trending". There is no analytics
pipeline, so no popularity claim can be made. A status line reads **Waiting for a
claim** until something is typed, then **Ready to check**.

- The federal government removed the fuel subsidy in May 2023
- The new national minimum wage is 70,000 naira per month
- INEC has cancelled the 2027 general elections

### Result states

- Empty: **No result yet.** Enter a claim or attach an image, then run the check.
- Running: **Searching sources**, with a skeleton.
- Error: **The check did not complete.** If this keeps happening, the server may
  be down. You can also send the claim on WhatsApp.
- No sources found: *No usable source was returned with this verdict. That is
  itself a signal: treat the claim as unconfirmed.*
- Image claim read: **Claim read from the image**, showing the extracted text.

Footer link: Prefer to do this in a chat? **Send it to the bot on WhatsApp**.

Reference table at the foot of the page: **What each verdict means.**

---

## Politicians

Directory heading and the per-profile template are described in
`documentation/CONTEXT_v2.md` under the politician dataset policy. The copy rules
that matter:

- Every profile states **Profile unverified** until a human has reviewed it.
- Empty sections read **Career history not yet transcribed**, **Education not yet
  recorded**, **No statements transcribed yet**, **Nothing verified yet** and
  **No court cases published**, each with a sentence explaining what the absence
  does and does not mean.
- "Nothing verified yet" always carries the line: *That is not a statement that
  the record is clean. It means our research is incomplete.*
- Six of the 36 profiles have a photograph. Each is licence-cleared and credited
  twice: a caption under the image on the profile, and a full row on `/credits`.
  Everyone else renders their initials with **Photo coming soon**. No stock images,
  no news-scraped photos.
- Every profile carries an **INEC certified** badge and a link to the commission's
  own final list, published 12 September 2026. That badge means one narrow thing:
  INEC cleared this person to contest. It is not a judgement and not a record.
- The directory header shows the source line directly under the description, so
  the provenance of every name is visible before the first card.
- Standing note: *CivicSense publishes sourced records, not convictions. A charge
  is not a finding. A verdict here is a research aid, not a legal judgement.*

---

## Incident map

Subline: **Corroborated incidents only.** A report appears here after a moderator
has matched it to independent reporting. The map is not a stream of unverified
claims.

Empty state: *Nothing has been corroborated yet. That is what an empty map means,
not evidence that nothing is happening.*

On the map: *N plotted. Markers sit at state-capital coordinates* and the
boundary credit **geoBoundaries gbOpen ADM1 (GRID3), CC BY 4.0**, which is a
licence condition and is rendered on the map rather than buried in a footer.

---

## FAQ

| Question | Answer |
|---|---|
| What is CivicSense actually for? | Truth awareness. We are a youth and mass sensitisation platform: the work is helping young Nigerians and the wider public check what reaches them before they believe it, and reach decisions they can stand behind. Checking individual claims is how that is done, not the whole point of it. We are not in the business of telling anyone what to think, only of making sure the evidence is in their hands. |
| How do I use the WhatsApp bot? | Save the CivicSense number in your phone, open WhatsApp and send any political claim as a message. You can also forward a screenshot of a poster or a news clip and the bot will read the claim out of the image. The reply comes back in the same chat, usually in under 30 seconds. There is nothing to install and no account to create. |
| Is there a Telegram bot too? | Yes. The same fact-checking pipeline runs on Telegram, including image claims. Message the bot directly and it will reply in the same thread. |
| How accurate is the verdict? | The bot will only return VERIFIED or FALSE when more than one independent source agrees. When a single source backs a claim it leans toward MISLEADING or UNVERIFIED rather than overstating certainty. Every verdict shows the evidence it was drawn from, so you can read the reasoning and judge it yourself. It is a research aid and a teaching tool, not an authority, and we would rather it taught you to check the next claim yourself. |
| Which languages are supported? | English today. Yoruba, Igbo and Hausa support is planned. The pipeline already retrieves evidence independently of the language of the claim, so this is mainly a matter of matching detection and reply generation. |
| What happens after I submit a report? | Your report enters a moderation queue. A moderator checks it against news reports and, where relevant, official statements. Only reports that are corroborated get published on the incident map, tagged with the state and local government area. Nothing you submit appears on the map automatically. |
| Can I report anonymously? | Yes, and there is no field on the form that could identify you. No name, no email, no phone number. You can also submit from a browser with cookies and tracking disabled, and nothing about you is attached to the report. |
| How are reports verified before they are published? | Each report is checked against independent news coverage. Reports confirmed by multiple outlets are marked corroborated. Reports confirmed by a single credible outlet or an official statement are marked journalistic and published with that source attributed. Reports we cannot confirm are not published. |
| Is my data safe? | The report form collects only what an incident report needs: what happened, which state and LGA, and a written description. We do not ask for your name, email or phone number, we do not run analytics or advertising trackers. The full policy is on the privacy page. |
| Who is behind CivicSense? | A small team of Nigerian engineers and researchers. We do not publish individual names on this site, and we are reachable only through a single anonymous email address. |
| What if a verdict is wrong? | Write to the single contact address with the claim and the check. Corrections are made against the public record rather than quietly. |
| Can I use this without data? | Yes. WhatsApp carries a conversation over a text connection, and the bot replies in the same thread. |
| Does it cost anything? | No. There is no subscription and no paid tier. |

---

## Privacy

Highlights, in the page's own order. Full text in
`website/src/pages/public/Privacy.jsx`.

- **What we never collect.** *Your name, email address or phone number. The
  report form has no field for any of them.*
- **What a report contains.** What happened, which state and LGA, when, and a
  written description. Never anything about the person who filed it, because we
  never had it.
- **Images.** The fact-check form does accept an image, and it is re-encoded in
  your browser with location and device metadata removed before upload. Report
  evidence is text only.
- **Rate limiting.** A courtesy limit keyed to browser data, not an identity. A
  browser reset clears the counter.
- **Removal.** *If you filed something and need it removed, describe the report:
  state, LGA and approximate date are enough to locate it, and we will delete
  it.*

---

## Sources

Subline: Every verdict is assembled from a fixed registry of Nigerian newsrooms,
read by a scraper that stores articles locally so a check does not have to trust
a search engine in the moment.

The 17 registered sources: Premium Times, The Punch, Vanguard, Daily Trust,
Leadership, Channels TV, Daily Post, Nigerian Tribune, BusinessDay, PM News,
Ripples Nigeria, Information Nigeria, TheCable, The Guardian Nigeria, Dubawa,
FactCheckHub, FactCheck Africa.

---

## Excluded from the public site, deliberately

- Team member names, faces, roles or biographies.
- Local government area rosters. No gazette has been transcribed, so the field is
  free text and says so.
- Any politician photograph without a recorded author, licence and source in `website/src/data/photos.js`.
- Any count of people reached, messages sent or claims checked, unless the number
  comes from the API in front of the reader at that moment.
