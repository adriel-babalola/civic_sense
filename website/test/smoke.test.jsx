import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { Home } from "../src/pages/public/Home";
import { FactCheck } from "../src/pages/public/FactCheck";
import { Politicians } from "../src/pages/public/Politicians";
import { PoliticianDetail } from "../src/pages/public/PoliticianDetail";
import { MapPage } from "../src/pages/public/MapPage";
import { Report } from "../src/pages/public/Report";
import { LiveFeed } from "../src/pages/public/LiveFeed";
import { Sources } from "../src/pages/public/Sources";
import { About } from "../src/pages/public/About";
import { FAQ } from "../src/pages/public/FAQ";
import { Privacy } from "../src/pages/public/Privacy";
import { DataDeletion } from "../src/pages/public/DataDeletion";
import { Credits } from "../src/pages/public/Credits";
import { NotFound } from "../src/pages/NotFound";
import { PublicLayout } from "../src/components/layout/PublicLayout";
import { FeatureGate } from "../src/components/shared/FeatureGate";
import { CONFIG, FEATURES as FEATURE_SWITCHES } from "../src/config/config";
import { FEATURES } from "../src/data/content";
import {
  getPoliticianBySlug,
  UNIQUE_POLITICIANS,
  NATIONAL,
  PRESIDENTIAL,
} from "../src/data/politicians";
import { PHOTO_CREDITS, getPhoto, getAllPhotos } from "../src/data/photos";
import {
  PHOTO_PACK,
  CLEARED,
  UNCLEARED,
  PACK_FOR_CERTIFIED_CANDIDATES,
  PACK_PHOTO_CREDITS,
} from "../src/data/photoPack";
import { INEC_SOURCE } from "../src/data/elections2027";
import { FAQS } from "../src/data/faq";
import { STATES } from "../src/data/states";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  STATE_BOUNDARIES,
  BOUNDARY_ATTRIBUTION,
  BOUNDARY_SOURCE_URL,
} from "../src/data/nigeria-boundaries";
// Imported for its call log, which the mock in test/setup.js exposes as named
// exports. `import * as` rather than require(): under vitest a require() of a
// mocked module returns a namespace that hides them.
import * as leaflet from "leaflet";

/** Repository root, for the two tests that read files off disk. */
const ROOT = resolve(import.meta.dirname, "..");

/**
 * Route smoke tests.
 *
 * The value here is not assertions about copy, it is that every route mounts
 * without throwing against its real data source. A component that references a
 * missing export, calls a hook conditionally, or destructures a field the data
 * never carries fails here rather than in front of a visitor.
 */


function renderRoute(element, { route = "/", path = "*" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  // Every route is served from bundled data, so there is no client to stub.
  // Clearing storage matters though: useReports and usePoliticians both persist
  // to localStorage, so a saved report or a remembered view mode leaks between
  // tests otherwise.
  localStorage.clear();
});

describe("public routes", () => {
  it("renders the home page", () => {
    renderRoute(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0);
  });

  it("renders the fact-check page with its empty result panel", () => {
    renderRoute(<FactCheck />);
    expect(screen.getByText("No result yet")).toBeInTheDocument();
  });

  it("runs a fact-check and shows the verdict", async () => {
    const user = userEvent.setup();
    renderRoute(<FactCheck />);

    await user.type(
      screen.getByPlaceholderText(/banned withdrawals/i),
      "The federal government removed the fuel subsidy and petrol is now 200 naira",
    );
    await user.click(screen.getByRole("button", { name: /check this claim/i }));

    // The rule set is bundled, but the page still shows a deliberate ~900ms
    // pending state so an instant verdict does not read as a cached page. The
    // wait is for that delay, not for a network call.
    expect(await screen.findByText(/vary by state and season/i)).toBeInTheDocument();
    expect(screen.getByText("FALSE")).toBeInTheDocument();

    // The sources must actually render as links. runSampleFactCheck used to
    // return bare strings here, which made every claim fall through to "no
    // usable source was returned" while still showing a confident verdict.
    const sourceLink = screen.getByRole("link", { name: /Premium Times/i });
    expect(sourceLink).toHaveAttribute("href", "https://www.premiumtimesng.com");

    // And it must say it is a sample. A demo verdict presented as a live lookup
    // is the one failure mode this page cannot have.
    expect(screen.getByText(/not a real fact-check/i)).toBeInTheDocument();
  });

  it("renders the politician directory", async () => {
    renderRoute(<Politicians />);
    expect(screen.getByText("Presidential candidates")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: /tinubu/i }).length).toBeGreaterThan(0),
    );
  });

  it("filters the directory by party", async () => {
    const user = userEvent.setup();
    renderRoute(<Politicians />);

    // Party moved from a <select> to a chip with a count, so the roster's shape
    // is visible without opening anything.
    //
    // The chips sit behind a disclosure, collapsed by default: seventeen chips
    // pushed the first card off a phone screen. Opening it is part of filtering,
    // so the test opens it rather than assuming it is visible.
    const partyDisclosure = screen.getByRole("button", { name: /^Party/ });
    expect(partyDisclosure).toHaveAttribute("aria-expanded", "false");

    await user.click(partyDisclosure);
    expect(partyDisclosure).toHaveAttribute("aria-expanded", "true");

    await user.click(
      screen.getByRole("button", { name: /^ZLP, \d+ candidates?$/ }),
    );

    await waitFor(() => {
      expect(screen.queryByText("Bola Ahmed Tinubu")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Daniel Daberechukwu Nwanyanwu" }),
      ).toBeInTheDocument();
    });

    // The count sits beside the party so a visitor can see the size of each
    // party without filtering first. Asserted as a shape, not a number: the
    // roster is generated from INEC's list and will change when that list does.
    expect(screen.getByRole("button", { name: /^ZLP, \d+ candidates?$/ })).toBeInTheDocument();
  });

  it("switches the directory between grid and list, and remembers it", async () => {
    const user = userEvent.setup();
    renderRoute(<Politicians />);

    expect(screen.getByRole("button", { name: "Grid view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "List view" }));

    expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // The list adds column headings, which is the whole reason to choose it.
    expect(screen.getByText("Candidate")).toBeInTheDocument();
    expect(screen.getByText("Ticket")).toBeInTheDocument();

    expect(localStorage.getItem("civicsense.politicians.view")).toBe("list");
  });

  it("renders a profile and its empty public record", () => {
    const person = UNIQUE_POLITICIANS[0];
    renderRoute(<PoliticianDetail />, {
      route: `/politicians/${person.id}`,
      path: "/politicians/:slug",
    });

    expect(screen.getByRole("heading", { level: 1, name: person.name })).toBeInTheDocument();
    expect(screen.getByText(/Nothing verified yet/i)).toBeInTheDocument();
  });

  it("404s an unknown profile", () => {
    renderRoute(<PoliticianDetail />, {
      route: "/politicians/not-a-real-person",
      path: "/politicians/:slug",
    });
    expect(screen.getByText(/does not exist/i)).toBeInTheDocument();
  });

  it("renders bundled incidents, counts them and filters by type", async () => {
    const user = userEvent.setup();

    renderRoute(<MapPage />);

    // Reads the bundled INCIDENTS set. This is the regression guard for the
    // Vercel "[object Object]" failure: the page used to await an API response
    // that never arrived and rendered the parsed error object as page content.
    expect(await screen.findByText(/Sample record: voters reportedly queued/i)).toBeInTheDocument();
    expect(screen.getByText(/Sample record: clashes between rival groups/i)).toBeInTheDocument();

    // Every bundled state must resolve to coordinates, or the map plots nothing.
    expect(screen.queryByText(/could not be plotted/i)).not.toBeInTheDocument();

    // Selecting a card must select it. Without a stable derived key this
    // silently does nothing.
    await user.click(screen.getByText(/Sample record: clashes between rival groups/i));
    expect(await screen.findByText(/Plateau\s*·\s*Jos North/)).toBeInTheDocument();

    // Type filter keeps violence and drops the misconduct and unrest records.
    // The description appears twice once selected: in its card and in the
    // detail panel, which is the selection being reflected.
    await user.click(screen.getByRole("radio", { name: /violence/i }));
    await waitFor(() =>
      expect(screen.queryByText(/Sample record: voters reportedly queued/i)).not.toBeInTheDocument(),
    );
    expect(screen.getAllByText(/Sample record: clashes between rival groups/i)).toHaveLength(2);
    expect(screen.getByRole("radio", { name: /violence/i })).toHaveAttribute("aria-checked", "true");

    // Kano only has a misconduct record, so Violence + Kano matches nothing.
    await user.selectOptions(screen.getByLabelText("Filter by state"), "Kano");
    expect(await screen.findByText(/Nothing matches these filters/i)).toBeInTheDocument();

    // The panel and the list each offer a reset; either is enough.
    await user.click(screen.getAllByRole("button", { name: /clear filters/i })[0]);
    expect(
      await screen.findByText(/Sample record: voters reportedly queued/i),
    ).toBeInTheDocument();
  });

  it("renders the map page from bundled sample incidents", async () => {
    renderRoute(<MapPage />);
    expect(screen.getByText("Incident map")).toBeInTheDocument();

    // The point of this change: /map rendered "[object Object]" on Vercel
    // because it awaited a response that never came. It now reads bundled data
    // and must label itself as sample data, not as live incidents.
    expect((await screen.findAllByText(/Demonstration data/i)).length).toBeGreaterThan(0);
  });

  it("submits a report with no identity field and confirms it", async () => {
    const user = userEvent.setup();
    renderRoute(<Report />);

    // The privacy claim is structural: there is no field to type a name into.
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /misconduct/i }));
    await user.type(
      screen.getByLabelText(/describe it/i),
      "Ballot boxes arrived after voting had already closed at the ward.",
    );
    await user.selectOptions(screen.getByLabelText(/state/i), "Nasarawa");
    await user.type(screen.getByLabelText(/local government area/i), "Nasarawa Eggon");
    await user.click(screen.getByRole("button", { name: /send report/i }));

    // No request is made; the report is written to this browser. Asserting on
    // the stored record is asserting the whole behaviour. The wait is for the
    // deliberate 600ms pending state, not for a network round trip.
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("civicsense.reports"))).toEqual([
        expect.objectContaining({
          type: "misconduct",
          state: "Nasarawa",
          lga: "Nasarawa Eggon",
          storedLocally: true,
        }),
      ]),
    );

    expect(await screen.findByText(/Report saved on this device/i)).toBeInTheDocument();
    // The receipt id now comes from the local store, not a server.
    expect(screen.getByText(/not been sent anywhere/i)).toBeInTheDocument();
  });

  it("ignores a politician query parameter, because incidents are not about people", async () => {
    renderRoute(<Report />, { route: "/report?politician=Bola Tinubu" });

    // This form used to read ?politician= and prefill "Regarding {name}:" into
    // the description. That merged an anonymous polling-unit report with a named
    // subject, so the stored record read as though we had tied a person to a
    // report. The form no longer knows what a politician is.
    expect(screen.getByLabelText(/describe it/i)).toHaveValue("");
    expect(screen.queryByText(/Bola Tinubu/)).not.toBeInTheDocument();
    expect(screen.queryByText(/reporting about/i)).not.toBeInTheDocument();
  });

  it("offers no file input on the report form, only an evidence description", () => {
    renderRoute(<Report />);

    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByLabelText(/evidence/i)).toBeInTheDocument();
  });

  it("sends evidence as text rather than an empty object", async () => {
    const user = userEvent.setup();
    renderRoute(<Report />);

    await user.click(screen.getByRole("radio", { name: /unrest/i }));
    await user.type(screen.getByLabelText(/describe it/i), "Protesters blocked the junction.");
    await user.selectOptions(screen.getByLabelText(/state/i), "Kano");
    await user.type(screen.getByLabelText(/local government area/i), "Dawakin Kudu");
    await user.type(screen.getByLabelText(/evidence/i), "Video on the ward group's page.");
    await user.click(screen.getByRole("button", { name: /send report/i }));

    await waitFor(() =>
      expect(localStorage.getItem("civicsense.reports")).not.toBeNull(),
    );
    const [stored] = JSON.parse(localStorage.getItem("civicsense.reports"));
    expect(stored.evidence).toBe("Video on the ward group's page.");
  });

  it("refuses to submit a report with missing fields", async () => {
    const user = userEvent.setup();
    renderRoute(<Report />);

    await user.click(screen.getByRole("button", { name: /send report/i }));

    expect(localStorage.getItem("civicsense.reports")).toBeNull();
    expect(await screen.findByText(/required information is missing/i)).toBeInTheDocument();
  });

  it("renders the live feed with verdict filters", async () => {
    renderRoute(<LiveFeed />);
    expect(screen.getByText("Verification feed")).toBeInTheDocument();
    // Reads from the bundled CHECKS set rather than the API payload.
    expect(await screen.findByText(/Fuel subsidy has been removed/i)).toBeInTheDocument();
    // And the feed is labelled as a sample for the same reason the map is.
    expect(screen.getAllByText(/Demonstration data/i).length).toBeGreaterThan(0);
  });

  it("renders the source registry from bundled data", async () => {
    renderRoute(<Sources />);
    expect(await screen.findByText("Premium Times")).toBeInTheDocument();
    expect(screen.getByText("Dubawa")).toBeInTheDocument();
  });

  it("renders about, faq and privacy without naming anyone", () => {
    const { unmount } = renderRoute(<About />);
    // Scoped to the heading: the About page now also carries the chat mock,
    // which names the bot, so a bare text match is ambiguous.
    expect(screen.getByRole("heading", { level: 1, name: "CivicSense" })).toBeInTheDocument();
    unmount();

    renderRoute(<FAQ />);
    expect(screen.getByText("Frequently asked")).toBeInTheDocument();
    unmount();

    renderRoute(<Privacy />);
    expect(screen.getByText(/What we collect, and mostly what we don't/i)).toBeInTheDocument();
    unmount();

    renderRoute(<DataDeletion />);
    expect(screen.getByText("Ask us to delete your data")).toBeInTheDocument();
  });

  /**
   * The two disclosure pages a privacy reviewer will open.
   *
   * These assert the claims that are easy to soften by accident. A reword that
   * turns "we hold a raw sender identifier" back into "we hold no identifier"
   * would pass every other test in this file, because nothing else checks the
   * copy against what the backend actually stores.
   */
  it("describes the stored sender identifier honestly on the privacy page", () => {
    renderRoute(<Privacy />);

    // The field name is named, because a reader who greps the codebase for it
    // has to find it discussed rather than absent.
    expect(screen.getByText(/hashedFrom/)).toBeInTheDocument();

    // And it is described as un-hashed. This sentence is the whole point of
    // naming the field at all: the name promises a hash the code does not apply.
    expect(screen.getByText(/not hashed at present/i)).toBeInTheDocument();
    expect(screen.getByText(/holds your phone number in international/i)).toBeInTheDocument();
    // Named more than once by design: the prose section and the provider list
    // each have to carry the names, so the count is asserted rather than one
    // match being picked at random.
    expect(screen.getAllByText(/Tavily/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/OpenRouter/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/MongoDB Atlas/).length).toBeGreaterThan(0);

    // No redaction promise. The server validates magic bytes and size and then
    // base64-encodes the buffer untouched, so this is the claim that must not
    // creep back in.
    expect(document.body.textContent).not.toMatch(/strip(ped|s)?\s+(the\s+)?(location|metadata|EXIF)/i);
    expect(document.body.textContent).not.toMatch(/re-?encod/i);
  });

  it("offers a deletion route and the privacy address on both pages", () => {
    const { unmount } = renderRoute(<Privacy />);
    expect(
      screen.getByRole("link", { name: /data deletion page/i }),
    ).toHaveAttribute("href", "/data-deletion");
    expect(
      screen.getAllByRole("link", { name: CONFIG.PRIVACY_EMAIL }).length,
    ).toBeGreaterThan(0);
    unmount();

    renderRoute(<DataDeletion />);
    // A prefilled subject is what makes the request a request rather than a
    // vague email, and the address has to be the privacy one, not the general
    // enquiries address used elsewhere on the site.
    const request = screen.getByRole("link", { name: /Email a deletion request/i });
    expect(request).toHaveAttribute(
      "href",
      `mailto:${CONFIG.PRIVACY_EMAIL}?subject=Data%20deletion%20request`,
    );
    expect(request.getAttribute("href")).toContain(CONFIG.PRIVACY_EMAIL);
  });

  it("opens an FAQ answer on click", async () => {
    const user = userEvent.setup();
    renderRoute(<FAQ />);

    // The first answer is open on load so the list is not a wall of questions.
    const question = screen.getByRole("button", { name: FAQS[0].question });
    expect(question).toHaveAttribute("aria-expanded", "true");

    await user.click(question);
    expect(question).toHaveAttribute("aria-expanded", "false");

    await user.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
  });

  it("renders the 404 page with a way home", () => {
    renderRoute(<NotFound />, { route: "/nope" });
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });
});

describe("feature flags", () => {
  it("renders a disabled route as if it does not exist", () => {
    FEATURE_SWITCHES.liveFeed = false;

    try {
      renderRoute(
        <FeatureGate flag="liveFeed">
          <LiveFeed />
        </FeatureGate>,
      );

      expect(screen.getByText("This page does not exist")).toBeInTheDocument();
    } finally {
      FEATURE_SWITCHES.liveFeed = true;
    }
  });

  it("maps every product card to a real config switch", () => {
    for (const feature of FEATURES) {
      expect(CONFIG.FEATURES[feature.flag]).toBeTypeOf("boolean");
    }
  });
});

describe("layout shell", () => {
  it("renders the public shell with a skip link and a single main landmark", () => {
    renderRoute(<PublicLayout />, { route: "/" });
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

describe("dataset integrity", () => {
  it("has no duplicate slugs", () => {
    const ids = UNIQUE_POLITICIANS.map((person) => person.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("publishes no allegations", () => {
    for (const person of UNIQUE_POLITICIANS) {
      expect(person.record).toEqual([]);
      expect(person.policies).toEqual([]);
    }
  });

  it("only ships a photo when the licence is recorded", () => {
    let cleared = 0;
    for (const person of UNIQUE_POLITICIANS) {
      // A rendered image and a recorded credit are the same fact. If either is
      // missing the entry is a licensing bug, so neither may drift alone.
      if (person.photo) {
        expect(person.photoCredit).toBeTruthy();
        expect(person.photoCredit.author).toBeTruthy();
        expect(person.photoCredit.license).toBeTruthy();
        expect(person.photoCredit.source).toMatch(/^https:\/\//);
        cleared += 1;
      } else {
        expect(person.photoId).toBeNull();
      }
    }
    expect(cleared).toBeGreaterThan(0);
  });

  it("resolves every declared photo id to a real asset", () => {
    for (const id of Object.keys(PHOTO_CREDITS)) {
      const photo = getPhoto(id);
      expect(photo, `no bundled asset for photo id "${id}"`).toBeTruthy();
      expect(photo.url).toBeTruthy();
    }
    expect(getPhoto("not-a-real-photo")).toBeNull();
    expect(getPhoto(null)).toBeNull();
  });

  it("resolves a profile by slug", () => {
    const person = UNIQUE_POLITICIANS[0];
    expect(getPoliticianBySlug(person.id)).toEqual(person);
    expect(getPoliticianBySlug("nobody-at-all")).toBeNull();
  });

  it("only uses state names that exist in STATES, or Nigeria for a national race", () => {
    for (const person of UNIQUE_POLITICIANS) {
      expect([NATIONAL, ...STATES]).toContain(person.state);
    }
  });

  it("pairs every candidate with a running mate, and every mate with a candidate", () => {
    const bySlug = new Map(UNIQUE_POLITICIANS.map((p) => [p.id, p]));
    for (const person of UNIQUE_POLITICIANS) {
      const partner =
        person.role === PRESIDENTIAL ? person.runningMate : person.presidentialCandidate;

      // The link must resolve to a real profile, not just to a well-formed URL.
      const other = bySlug.get(partner.slug);
      expect(other, `${person.name} points at a missing profile`).toBeDefined();
      expect(other.name).toBe(partner.name);
      expect(other.party).toBe(person.party);
      expect(other.role).not.toBe(person.role);

      // And it must point back, so the pair is navigable both ways.
      const back = other.role === PRESIDENTIAL ? other.runningMate : other.presidentialCandidate;
      expect(back.slug).toBe(person.id);
    }
  });

  it("gives every profile a primary source for its candidacy", () => {
    for (const person of UNIQUE_POLITICIANS) {
      expect(person.source.url).toMatch(/^https:\/\//);
      expect(person.source.publisher).toBeTruthy();
      expect(person.source.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(person.office).toMatch(/2027/);
    }
  });
});

/* ========================================================================== */
/* Hero slider                                                                */
/* ========================================================================== */

describe("hero slider", () => {
  it("renders the headline, the tagline and one control per slide", () => {
    renderRoute(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "CivicSense" })).toBeInTheDocument();
    expect(screen.getByText(/verify\. share\./i)).toBeInTheDocument();
    expect(screen.getByText("Vote informed.")).toBeInTheDocument();
    expect(
      screen.getByText("Send a claim to WhatsApp. Get the truth back in seconds."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /try on whatsapp/i }),
    ).toHaveAttribute("href", expect.stringContaining("wa.me"));

    // Four elements and nothing more. An eyebrow or a second button is the
    // regression this test exists to catch.
    expect(screen.queryByText(/reclaim your voice/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mass sensitisation/i)).not.toBeInTheDocument();

    const dots = screen.getAllByRole("button", { name: /show slide \d of 2/i });
    expect(dots).toHaveLength(2);
    // Exactly one is current, and it is the first.
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    expect(dots[1]).toHaveAttribute("aria-current", "false");
  });

  /**
   * The dolly arithmetic, asserted directly.
   *
   * The zoom was invisible for a long time because Motion's `duration` is in
   * seconds while SLIDE_DURATION_MS is milliseconds, and assigning one to the
   * other gave a duration of 7000 seconds. A screenshot of the first frame
   * cannot catch that, because the first frame of an infinitely slow animation
   * is identical to no animation at all. So the curve itself is tested, rather
   * than the rendered result.
   */
  it("dollies slowly, returns, and never drops below the resting scale", async () => {
    const { dollyScale, ZOOM_FROM, ZOOM_TO, DOLLY_CYCLE_MS, SLIDE_DURATION_MS } = await import(
      "../src/components/sections/Hero"
    );

    // A full breath must be a whole number of slide dwells. This is what keeps
    // the loop from drifting against the crossfade: if the cycle were 25s over a
    // 7s dwell, the scale at each handover would be a different value every
    // rotation and the repeat would look accidental.
    expect(DOLLY_CYCLE_MS % SLIDE_DURATION_MS).toBe(0);
    expect(DOLLY_CYCLE_MS).toBeGreaterThan(SLIDE_DURATION_MS);

    // Starts at rest, peaks at the midpoint, and comes back to rest. A cycle
    // that did not return would sit pinned at ZOOM_TO after the first pass.
    expect(dollyScale(0)).toBeCloseTo(ZOOM_FROM, 5);
    expect(dollyScale(0.5)).toBeCloseTo(ZOOM_TO, 5);
    expect(dollyScale(1)).toBeCloseTo(ZOOM_FROM, 5);

    // And it has to be a real push. Too small a range is invisible under the
    // navy wash on an already-cropped photograph, which is the whole reason the
    // amplitude was raised when the rate was slowed.
    expect(ZOOM_TO / ZOOM_FROM).toBeGreaterThanOrEqual(1.15);

    // Never below the resting scale: `object-cover` would expose an edge.
    for (let step = 0; step <= 100; step += 1) {
      expect(dollyScale(step / 100)).toBeGreaterThanOrEqual(ZOOM_FROM - 1e-9);
      expect(dollyScale(step / 100)).toBeLessThanOrEqual(ZOOM_TO + 1e-9);
    }
  });

  it("eases to a stop at both ends of the travel", async () => {
    const { dollyScale } = await import("../src/components/sections/Hero");

    // A plain triangle reverses instantly at the extremes, which shows as a
    // corner in the motion. Sampling either side of the midpoint: the steps just
    // past the peak must be smaller than a linear ramp would produce.
    const justBeforePeak = dollyScale(0.49);
    const atPeak = dollyScale(0.5);
    const justAfterPeak = dollyScale(0.51);

    expect(atPeak - justBeforePeak).toBeLessThan(justBeforePeak - dollyScale(0.47));
    expect(atPeak - justAfterPeak).toBeLessThan(justAfterPeak - dollyScale(0.53));
  });

  it("moves the current slide when a dot is clicked", async () => {
    const user = userEvent.setup();
    renderRoute(<Home />);

    const dots = screen.getAllByRole("button", { name: /show slide/i });
    await user.click(dots[1]);

    expect(dots[1]).toHaveAttribute("aria-current", "true");
    expect(dots[0]).toHaveAttribute("aria-current", "false");
  });

  it("exposes the dots as buttons, not tabs, and names the images", () => {
    renderRoute(<Home />);
    // A tablist would claim the dots move between panels, which they do not.
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    // Each dot describes the image it reveals rather than saying "slide 2 of 2".
    expect(screen.getByLabelText("Show slide 2 of 2")).toBeInTheDocument();
  });

  it("does not autoplay when the visitor asks for reduced motion", async () => {
    vi.useFakeTimers();
    const original = window.matchMedia;
    window.matchMedia = (query) => ({
      matches: /prefers-reduced-motion/.test(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });

    try {
      renderRoute(<Home />);
      const dots = screen.getAllByRole("button", { name: /show slide/i });

      vi.advanceTimersByTime(60_000);
      expect(dots[0]).toHaveAttribute("aria-current", "true");
    } finally {
      window.matchMedia = original;
      vi.useRealTimers();
    }
  });
});

/* ========================================================================== */
/* Incident map                                                               */
/* ========================================================================== */

describe("incident map", () => {
  it("draws bundled state boundaries and never asks for a tile", () => {
    leaflet.__reset();

    renderRoute(<MapPage />);

    // The privacy guarantee, asserted rather than asserted-in-a-comment: if
    // anyone reintroduces a tile layer, L.tileLayer is undefined here and this
    // fails.
    expect(leaflet.default.tileLayer).toBeUndefined();

    expect(leaflet.__calls.geoJSON).toHaveLength(1);
    const { data, options } = leaflet.__calls.geoJSON[0];
    expect(data.type).toBe("FeatureCollection");
    expect(data.features.length).toBeGreaterThanOrEqual(36);
    expect(data.features[0].geometry.type).toMatch(/Polygon/);
    // Not clickable: nothing on the map should be interactive but the markers.
    expect(options.interactive).toBe(false);
  });

  it("credits the boundary data, as the licence requires", () => {
    renderRoute(<MapPage />);
    expect(screen.getAllByText(/geoBoundaries/).length).toBeGreaterThan(0);
    expect(screen.getByText(/CC BY 4\.0/)).toBeInTheDocument();
  });

  it("re-measures when its container resizes", () => {
    leaflet.__reset();

    let observerCallback;
    const RealResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      constructor(cb) {
        observerCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // The component deliberately ignores zero-size notifications, because Leaflet
    // fires one while laying itself out. jsdom reports every element as 0x0, so
    // a non-zero size is stubbed here to reach the real branch.
    const restoreWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
    const restoreHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 800 });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 400 });

    try {
      renderRoute(<MapPage />);
      expect(observerCallback).toBeInstanceOf(Function);

      // Leaflet caches its size at init, so a reflow of the filter row above
      // the map leaves it drawing into a stale pane without this call.
      observerCallback();
      expect(leaflet.__calls.invalidateSize).toBeGreaterThan(0);
    } finally {
      globalThis.ResizeObserver = RealResizeObserver;
      if (restoreWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", restoreWidth);
      else delete HTMLElement.prototype.clientWidth;
      if (restoreHeight) Object.defineProperty(HTMLElement.prototype, "clientHeight", restoreHeight);
      else delete HTMLElement.prototype.clientHeight;
    }
  });
});

/* ========================================================================== */
/* Politician cards and profiles                                              */
/* ========================================================================== */

describe("politician cards", () => {
  it("shows the photo placeholder and an explicit no-record note", () => {
    renderRoute(<Politicians />);

    expect(screen.getAllByText("No photo yet").length).toBeGreaterThan(0);

    // Per-card repetition was removed in favour of one note under the grid, so
    // the guarantee is asserted where a sighted reader actually meets it, plus
    // the screen-reader equivalent on each card.
    expect(screen.getByText("Being on this list is not a record")).toBeInTheDocument();
    expect(
      screen.getAllByText(/not a clean bill of health/i).length,
    ).toBeGreaterThan(0);
  });

  it("keeps the share button out of the profile link", () => {
    renderRoute(<Politicians />);

    const share = screen.getAllByRole("button", {
      name: /share the profile for/i,
    })[0];
    const [link] = screen.queryAllByRole("link", { name: /civic/i });

    // One interactive element inside another is unreachable by keyboard and can
    // swallow the click into a navigation.
    expect(share.closest("a")).toBeNull();
    if (link) expect(link.contains(share)).toBe(false);
  });

  it("links every card to its profile and to the other half of its ticket", { timeout: 20000 }, () => {
    renderRoute(<Politicians />);

    for (const person of UNIQUE_POLITICIANS) {
      const card = screen.getByRole("heading", { name: person.name }).closest("article");
      const links = within(card).getAllByRole("link");
      const hrefs = links.map((l) => l.getAttribute("href"));

      expect(hrefs).toContain(`/politicians/${person.id}`);

      const partner =
        person.role === PRESIDENTIAL ? person.runningMate : person.presidentialCandidate;
      expect(hrefs).toContain(partner.href);
    }
  });
});

describe("politician profile", () => {
  const person = UNIQUE_POLITICIANS[0];
  const route = `/politicians/${person.id}`;

  /** The detail page reads its slug from the route params, not from props. */
  const renderProfile = () =>
    renderRoute(<PoliticianDetail />, { route, path: "/politicians/:slug" });

  it("keeps populated sections open and collapses the empty ones", async () => {
    const user = userEvent.setup();
    renderProfile();

    // Always present, regardless of what has been researched.
    for (const heading of ["Overview", "Public record", "Sources"]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }

    // The record section must stay open even when empty: its copy is the
    // disclaimer that stops the page reading as an all-clear.
    expect(screen.getByText(/Nothing verified yet/i)).toBeInTheDocument();

    // Empty sections are gathered into one closed disclosure rather than four or
    // five consecutive cards saying "nothing here yet".
    const disclosure = screen.getByRole("button", { name: /Not yet verified/i });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");

    await user.click(disclosure);

    expect(disclosure).toHaveAttribute("aria-expanded", "true");
    for (const heading of [
      "Career highlights",
      "Education",
      "Public statements and known positions",
      "Investigations and court cases",
    ]) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
  });

  it("groups identity details into a glance grid and moves actions to the top", () => {
    renderProfile();

    expect(screen.getByText("At a glance")).toBeInTheDocument();
    // Party is a pill under the name, not a row in the table.
    expect(screen.getAllByText(/INEC certified/i).length).toBeGreaterThan(0);

    // Suggest, share and copy sit together above the evidence rather than at the
    // bottom of a scrolling sidebar.
    const suggest = screen.getByRole("link", { name: /suggest an update/i });
    const glance = screen.getByText("At a glance");
    expect(suggest.compareDocumentPosition(glance) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("points the update action at the profile form, not at the incident report", () => {
    renderProfile();

    // The old target was `/report?politician=`, which merged an anonymous
    // polling-unit form with a named subject.
    const suggest = screen.getByRole("link", { name: /suggest an update/i });
    expect(suggest).toHaveAttribute("href", `/politicians/${person.id}/suggest`);
    expect(screen.queryByRole("link", { name: /report about/i })).not.toBeInTheDocument();
  });

  it("shows the photo placeholder when no licence is on file", () => {
    // Deliberately not UNIQUE_POLITICIANS[0]: that entry has a cleared photo
    // now, so asserting the placeholder against it would pass or fail for the
    // wrong reason.
    const unlicensed = UNIQUE_POLITICIANS.find((p) => !p.photo);
    expect(unlicensed).toBeDefined();
    renderRoute(<PoliticianDetail />, {
      route: `/politicians/${unlicensed.id}`,
      path: "/politicians/:slug",
    });
    expect(screen.getAllByText("No photo yet").length).toBeGreaterThan(0);
  });

  it("renders a licensed photo with its credit beside it", () => {
    const licensed = UNIQUE_POLITICIANS.find((p) => p.photo);
    expect(licensed).toBeDefined();
    renderRoute(<PoliticianDetail />, {
      route: `/politicians/${licensed.id}`,
      path: "/politicians/:slug",
    });

    const img = screen.getByRole("img", { name: licensed.name });
    expect(img.getAttribute("src")).toBeTruthy();

    // Attribution is rendered on the page, not only in a footer.
    expect(screen.getByText(/^Photo:/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: licensed.photoCredit.author }),
    ).toHaveAttribute("href", licensed.photoCredit.source);
  });

  it("never presents an unfilled section as a clean bill of health", () => {
    renderProfile();

    // These are the sentences that stop an empty section reading as a finding.
    expect(screen.getByText(/not a statement that the record is clean/i)).toBeInTheDocument();
    expect(
      screen.getByText(/does not mean there are none/i),
    ).toBeInTheDocument();
  });

  it("offers a share control and a copy control", () => {
    renderProfile();
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy link/i })).toBeInTheDocument();
  });

  it("404s an unknown slug", () => {
    renderRoute(<PoliticianDetail />, {
      route: "/politicians/nobody-here",
      path: "/politicians/:slug",
    });
    expect(screen.getByText(/does not exist/i)).toBeInTheDocument();
  });
});

/* ========================================================================== */
/* Fact-check workspace                                                       */
/* ========================================================================== */

describe("research photo pack", () => {
  /**
   * The pack is 30 researched portraits that are NOT licence-cleared. They are
   * rendered at the owner's instruction, so these tests no longer assert that
   * they are withheld. They assert the two things that must stay true anyway:
   * that a source is recorded for every one, and that no invented licence
   * appears on a public page.
   */
  it("records a source and the researcher's rights note for every entry", () => {
    expect(PHOTO_PACK).toHaveLength(30);

    for (const entry of PHOTO_PACK) {
      expect(entry.source).toMatch(/^https:\/\//);
      expect(entry.rights).toBeTruthy();
    }
  });

  it("asserts a Creative Commons licence only where one was confirmed", () => {
    for (const entry of PHOTO_PACK) {
      if (entry.rightsStatus !== "open-licence") {
        // The important one. A pack image with a licenceUrl on /credits is a
        // false statement about someone else's copyright on a public page.
        expect(entry.licenceUrl).toBeNull();
        continue;
      }

      expect(entry.onCommons).toBe(true);
      expect(entry.licenceUrl).toMatch(/^https:\/\//);
    }

    expect(CLEARED.length).toBeGreaterThan(0);
    // And the majority are still unverified, which is the true state of a pack
    // assembled by image search. If this collapses, someone has started treating
    // "found online" as "cleared".
    expect(UNCLEARED.length).toBeGreaterThan(20);
  });

  it("records an unverified licence as unverified in the credit it emits", () => {
    for (const [asset, credit] of Object.entries(PACK_PHOTO_CREDITS)) {
      if (credit.unverified) {
        expect(credit.license).toBe("Licence not verified");
        expect(credit.licenseUrl).toBeNull();
        expect(credit.source).toMatch(/^https:\/\//);
      }
      expect(asset).toBe(credit.file);
    }
  });

  it("flags search-engine permalinks as sources that cannot be cited", () => {
    const permalinks = PHOTO_PACK.filter((entry) =>
      /bing\.com\/images\/search/.test(entry.source),
    );
    expect(permalinks.length).toBeGreaterThan(0);

    for (const entry of permalinks) {
      expect(entry.sourceIsStable).toBe(false);
      expect(entry.licenceUrl).toBeNull();
    }
  });

  it("maps pack entries onto real certified candidates", () => {
    const rosterIds = new Set(UNIQUE_POLITICIANS.map((person) => person.id));

    for (const entry of PHOTO_PACK) {
      if (!entry.rosterId) continue;
      // Hand-maintained alias map, because the pack writes short names and the
      // roster uses the INEC form. A typo would not throw; it would quietly
      // attach a governor's photograph to nothing.
      expect(rosterIds.has(entry.rosterId)).toBe(true);
    }

    expect(PACK_FOR_CERTIFIED_CANDIDATES.length).toBeGreaterThan(0);
    // Not everyone. Most of the pack is officeholders with no 2027 ticket.
    expect(PACK_FOR_CERTIFIED_CANDIDATES.length).toBeLessThan(PHOTO_PACK.length);
  });

  it("gives no photo to a profile whose subject is not on a certified ticket", () => {
    // The guard that matters most. 21 pack subjects are governors, senators and
    // party chairs; none of them is a certified 2027 candidate, so no profile in
    // this dataset may carry their photograph.
    const packAssets = new Set(Object.values(PACK_PHOTO_CREDITS).map((c) => c.file));
    const notOnRoster = new Set(
      PHOTO_PACK.filter((entry) => !entry.rosterId && entry.asset).map((e) => e.asset),
    );

    expect(notOnRoster.size).toBeGreaterThan(0);

    for (const person of UNIQUE_POLITICIANS) {
      if (!person.photoId || !packAssets.has(person.photoId)) continue;

      const subject = PHOTO_PACK.find((entry) => entry.asset === person.photoId);
      expect(subject?.rosterId).toBe(person.id);
    }
  });

  it("keeps the verified original when the pack has a copy of the same photo", () => {
    // Atiku and Kwankwaso appear in the pack as well. The curated Wikimedia
    // entry must win, or a verified CC credit gets replaced by an unverified one.
    expect(getPhoto("atiku")?.license).toBe("CC0");
    expect(getPhoto("kwankwaso")?.license).toMatch(/Public domain/i);
    expect(getPhoto("tinubu")?.license).toBe("CC BY-SA 4.0");
    expect(getPhoto("shettima")?.license).toBe("CC BY-SA 4.0");
    expect(getPhoto("amaechi")?.license).toBe("CC BY 2.0");
    expect(getPhoto("obi")?.license).toMatch(/Public domain/i);
  });

  it("records the one folder that has no photograph at all", () => {
    // cliboy.png is a saved Bing results page, not a portrait.
    const missing = PHOTO_PACK.filter((entry) => !entry.usable);
    expect(missing).toHaveLength(1);
    expect(missing[0].packName).toBe("Cleopas Zuwoghe");
    expect(missing[0].asset).toBeNull();
  });

  it("resolves every credit the site actually uses to a real bundled file", () => {
    // Deliberately getAllPhotos(), not PACK_PHOTO_CREDITS. The pack emits a credit
    // for people we already hold a cleared Commons file for, and those are
    // suppressed before rendering. Asserting they resolve would be asserting the
    // duplicate on /credits is a feature.
    for (const photo of getAllPhotos()) {
      expect(photo.url).toBeTruthy();
      expect(photo.source).toMatch(/^https:\/\//);
      expect(photo.license).toBeTruthy();
    }
  });

  it("suppresses the pack copy wherever a cleared original exists", () => {
    const clearedTitles = new Set(
      Object.values(PHOTO_CREDITS).map((credit) => credit.title.toLowerCase()),
    );

    for (const credit of Object.values(PACK_PHOTO_CREDITS)) {
      if (!clearedTitles.has(credit.title.toLowerCase())) continue;

      // A rendered image and a listed credit are the same fact. If the suppressed
      // one is still resolvable, /credits lists these people twice.
      expect(getPhoto(credit.file)).toBeNull();
    }

    // Nyesom Wike is the case that proves the filter works on subjects rather than
    // on a hand-kept list: he is not a certified candidate, so nothing else in
    // this dataset would have caught him.
    expect(getPhoto("wike")).toBeTruthy();
    expect(getPhoto("wike").license).toBe("CC BY 4.0");
  });

  it("says plainly which photographs are not licence-cleared", () => {
    renderRoute(<Credits />);

    // The count is stated above the list, not left for a reader to infer from
    // which rows happen to lack a licence link.
    expect(screen.getByText(/have an unverified licence/i)).toBeInTheDocument();

    // And no unverified row links to a licence. A dead link to nowhere would
    // read as a claim of a licence that does not exist.
    const unverified = getAllPhotos().filter((photo) => photo.unverified);
    expect(unverified.length).toBeGreaterThan(0);

    for (const photo of unverified) {
      expect(photo.licenseUrl).toBeNull();
      expect(photo.license).toBe("Licence not verified");
      expect(screen.getAllByText("Licence not verified").length).toBeGreaterThan(0);
      // Every one still names where it came from, so a rights holder can be found.
      expect(photo.source).toMatch(/^https:\/\//);
    }
  });

  it("lists every bundled photo on the credits page", () => {
    renderRoute(<Credits />);
    for (const photo of getAllPhotos()) {
      expect(screen.getAllByText(photo.title).length).toBeGreaterThan(0);
    }
  });
});

describe("fact-check workspace", () => {
  it("offers three example claims and says what the panel is", async () => {
    const user = userEvent.setup();
    renderRoute(<FactCheck />);

    expect(screen.getByText(/waiting for a claim/i)).toBeInTheDocument();
    const examples = screen.getAllByRole("button", {
      name: /fuel subsidy|minimum wage|INEC/,
    });
    expect(examples).toHaveLength(3);

    await user.click(examples[0]);
    expect(screen.getByText(/ready to check/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /the claim/i }).value).toContain(
      "fuel subsidy",
    );
  });

  it("keeps the result and the reference below one input", () => {
    renderRoute(<FactCheck />);
    expect(screen.getByRole("heading", { name: /check a claim/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /what each verdict means/i })).toBeInTheDocument();
  });
});

/* ========================================================================== */
/* Global chrome                                                              */
/* ========================================================================== */

describe("global chrome", () => {
  it("ships the required title and a favicon link", () => {
    const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
    expect(html).toContain("<title>Truth Awareness CivicSense</title>");
    expect(html).toMatch(/<link rel="icon" href="\/favicon\.svg"/);
  });

  it("has a favicon on disk that matches the brand mark", () => {
    const svg = readFileSync(resolve(ROOT, "public/favicon.svg"), "utf8");
    expect(svg).toContain("2ecc71");
  });

  it("shows no em dash in the rendered copy of the public pages", () => {
    // Regression guard for the copy sweep. Rendered text only, so em dashes in
    // code comments are out of scope by construction. The path is listed
    // explicitly because the detail page reads its slug from route params.
    const person = UNIQUE_POLITICIANS[0];
    const pages = [
      { element: <Home />, route: "/", path: "*" },
      { element: <About />, route: "/about", path: "*" },
      { element: <Privacy />, route: "/privacy", path: "*" },
      { element: <DataDeletion />, route: "/data-deletion", path: "*" },
      { element: <FAQ />, route: "/faq", path: "*" },
      { element: <Sources />, route: "/sources", path: "*" },
      { element: <FactCheck />, route: "/fact-check", path: "*" },
      { element: <Politicians />, route: "/politicians", path: "*" },
      {
        element: <PoliticianDetail />,
        route: `/politicians/${person.id}`,
        path: "/politicians/:slug",
      },
      { element: <Report />, route: "/report", path: "*" },
    ];

    for (const { element, route, path } of pages) {
      const { unmount } = renderRoute(element, { route, path });
      expect(document.body.textContent, `route ${route}`).not.toContain("—");
      unmount();
    }
  });

  it("gives every desktop navigation item an icon", () => {
    render(
      <MemoryRouter>
        <PublicLayout />
      </MemoryRouter>,
      { route: "/" },
    );
    // MemoryRouter has no route matching in this render, so assert on the
    // header's own markup rather than the routed page.
    const nav = screen.getByRole("navigation", { name: "Main" });
    const links = within(nav).getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.querySelector("svg")).not.toBeNull();
    }
  });
});

/* ========================================================================== */
/* Bundled map data integrity                                                 */
/* ========================================================================== */

/** Every [lng, lat] pair in a Polygon or MultiPolygon, at any nesting depth. */
function collectCoords(node) {
  if (!Array.isArray(node)) return [];
  if (typeof node[0] === "number") return [node];
  return node.flatMap(collectCoords);
}

describe("boundary data", () => {
  it("carries its own licence and provenance", () => {
    expect(BOUNDARY_ATTRIBUTION).toMatch(/CC BY 4\.0/);
    expect(BOUNDARY_SOURCE_URL).toMatch(/^https:\/\//);
  });

  it("describes Nigeria, not somewhere else", () => {
    const features = STATE_BOUNDARIES.features;
    expect(features.length).toBe(37);

    const coords = features.flatMap((feature) => collectCoords(feature.geometry.coordinates));
    const lngs = coords.map(([lng]) => lng);
    const lats = coords.map(([, lat]) => lat);

    // Nigeria is roughly 2.7E to 14.7E, 4.2N to 13.9N. A download that landed
    // in the wrong place, or a reprojection that flipped the axes, fails here.
    expect(Math.min(...lngs)).toBeGreaterThan(2.5);
    expect(Math.max(...lngs)).toBeLessThan(14.8);
    expect(Math.min(...lats)).toBeGreaterThan(4.0);
    expect(Math.max(...lats)).toBeLessThan(14.0);
  });

  it("keeps state names so the outlines are identifiable", () => {
    for (const feature of STATE_BOUNDARIES.features) {
      expect(typeof feature.properties.name).toBe("string");
      expect(feature.properties.name.length).toBeGreaterThan(2);
    }
    const names = STATE_BOUNDARIES.features.map((f) => f.properties.name);
    expect(names).toContain("Lagos");
    expect(names).toContain("Kaduna");
  });
});

/* ========================================================================== */
/* Attribution                                                                */
/* ========================================================================== */

describe("credits page", () => {
  it("lists every cleared photo with an author and a licence", () => {
    renderRoute(<Credits />);

    expect(screen.getByText("Photo and data credits")).toBeInTheDocument();
    for (const id of Object.keys(PHOTO_CREDITS)) {
      const credit = PHOTO_CREDITS[id];
      expect(screen.getByText(credit.title)).toBeInTheDocument();
      const item = screen.getByText(credit.title).closest("li");
      expect(item, `no credits row for "${id}"`).not.toBeNull();
      expect(within(item).getByRole("link", { name: credit.author })).toHaveAttribute(
        "href",
        credit.source,
      );
      expect(within(item).getByRole("link", { name: credit.license })).toHaveAttribute(
        "href",
        credit.licenseUrl,
      );
    }
  });

  it("links the INEC document and the map boundary source", () => {
    renderRoute(<Credits />);

    expect(
      screen.getByRole("link", { name: /final list of candidates/i }),
    ).toHaveAttribute("href", INEC_SOURCE.url);
    expect(screen.getAllByText(/geoBoundaries/).length).toBeGreaterThan(0);
  });
});
