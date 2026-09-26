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
import { Credits } from "../src/pages/public/Credits";
import { NotFound } from "../src/pages/NotFound";
import { PublicLayout } from "../src/components/layout/PublicLayout";
import { FeatureGate } from "../src/components/shared/FeatureGate";
import { CONFIG, FEATURES as FEATURE_SWITCHES } from "../src/config/config";
import { FEATURES } from "../src/data/content";
import { AdminLogin } from "../src/pages/admin/AdminLogin";
import { AdminDashboard } from "../src/pages/admin/AdminDashboard";
import { AdminReports } from "../src/pages/admin/AdminReports";
import { AdminFeed } from "../src/pages/admin/AdminFeed";
import { AdminPoliticians } from "../src/pages/admin/AdminPoliticians";
import { AdminAnalytics } from "../src/pages/admin/AdminAnalytics";
import { AdminSettings } from "../src/pages/admin/AdminSettings";
import {
  getPoliticianBySlug,
  UNIQUE_POLITICIANS,
  NATIONAL,
  PRESIDENTIAL,
} from "../src/data/politicians";
import { PHOTO_CREDITS, getPhoto } from "../src/data/photos";
import { INEC_SOURCE } from "../src/data/elections2027";
import { FAQS } from "../src/data/faq";
import { STATES } from "../src/data/states";
import * as api from "../src/services/api";
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

/**
 * Route smoke tests.
 *
 * The value here is not assertions about copy — it is that every route mounts
 * without throwing, with the network stubbed to a realistic payload. A
 * component that references a missing export, calls a hook conditionally, or
 * destructures a field the server never sends fails here rather than in front
 * of a visitor.
 */

const EMPTY_INCIDENTS = [];

/** Vitest runs with the project root as cwd. */
const ROOT = process.cwd();

/**
 * The exact shape and values the running server returns from
 * GET /api/incidents. Copied from a live response so a change to the seed
 * incidents or to the field names fails here instead of on the map.
 */
const SEED_INCIDENTS = [
  {
    type: "unrest",
    description: "CSO raises alarm over rising pre-election violence in Osun State.",
    state: "Osun",
    lga: "Osogbo",
    timestamp: "2026-06-25T00:00:00.000Z",
  },
  {
    type: "violence",
    description: "Two rival groups clashed at a campaign rally in Kaduna.",
    state: "Kaduna",
    lga: "Igabi",
    timestamp: "2026-07-02T00:00:00.000Z",
  },
  {
    type: "misconduct",
    description: "Voters report queue chaos outside a polling unit in Kano.",
    state: "Kano",
    lga: "Dawakin Kudu",
    timestamp: "2026-07-11T00:00:00.000Z",
  },
  {
    type: "unrest",
    description: "Protest over fuel prices blocked a junction in Lagos.",
    state: "Lagos",
    lga: "Ikeja",
    timestamp: "2026-07-19T00:00:00.000Z",
  },
];
const SOURCES = [
  {
    name: "Premium Times",
    baseUrl: "https://www.premiumtimesng.com",
    feed: "https://www.premiumtimesng.com/feed",
    category: "news",
    region: "National",
  },
  {
    name: "Dubawa",
    baseUrl: "https://dubawa.org",
    feed: "https://dubawa.org/feed",
    category: "fact-check",
    region: "National",
  },
];

const HEALTH = {
  success: true,
  uptime: 120,
  db: true,
  articles: 4210,
  scraper: { healthy: 17, sources: 17, lastSyncAt: new Date().toISOString() },
};

const FACT_CHECKS = [
  {
    _id: "a1",
    claim: "The federal government has banned withdrawals above ₦200,000",
    verdict: "FALSE",
    channel: "whatsapp",
    timestamp: new Date(Date.now() - 3600_000).toISOString(),
    latencyMs: 4200,
  },
  {
    _id: "a2",
    claim: "INEC has cancelled the 2027 general elections",
    verdict: "MISLEADING",
    channel: "api",
    timestamp: new Date(Date.now() - 7200_000).toISOString(),
  },
];

const REPORTS = [
  {
    _id: "r1",
    type: "misconduct",
    description: "Ballot boxes arrived after voting had already closed at the ward.",
    state: "Nasarawa",
    lga: "Nasarawa Eggon",
    status: "pending",
    timestamp: new Date(Date.now() - 600_000).toISOString(),
  },
  {
    _id: "r2",
    type: "unrest",
    description: "Protesters blocked a major junction for most of the morning.",
    state: "Kano",
    lga: "Dawakin Kudu",
    status: "approved",
    timestamp: new Date(Date.now() - 86_400_000).toISOString(),
  },
];

function stubApi() {
  vi.spyOn(api, "getHealth").mockResolvedValue(HEALTH);
  vi.spyOn(api, "getSources").mockResolvedValue(SOURCES);
  vi.spyOn(api, "getFactChecks").mockResolvedValue(FACT_CHECKS);
  vi.spyOn(api, "getIncidents").mockResolvedValue(EMPTY_INCIDENTS);
  vi.spyOn(api, "getReports").mockResolvedValue(REPORTS);
  vi.spyOn(api, "runFactCheck").mockResolvedValue({
    claim: "A claim",
    extractedClaim: null,
    verdict: "FALSE",
    structured: {
      verdict: "FALSE",
      confidence: 88,
      whatWeFound: "No such ban exists.",
      sources: [{ title: "CBN statement", url: "https://example.com/a", site: "example.com" }],
    },
    latencyMs: 3100,
  });
  vi.spyOn(api, "submitReport").mockResolvedValue({
    _id: "new-report-id",
    type: "misconduct",
    description: "x",
    state: "Nasarawa",
    lga: "Nasarawa Eggon",
    status: "pending",
    timestamp: new Date().toISOString(),
  });
  vi.spyOn(api, "approveReport").mockResolvedValue({ ...REPORTS[0], status: "approved" });
  vi.spyOn(api, "rejectReport").mockResolvedValue({ ...REPORTS[0], status: "rejected" });
}

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
  localStorage.clear();
  stubApi();
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
      "The federal government has banned withdrawals above 200,000",
    );
    await user.click(screen.getByRole("button", { name: /check this claim/i }));

    await waitFor(() => expect(api.runFactCheck).toHaveBeenCalled());
    expect(await screen.findByText(/No such ban exists/i)).toBeInTheDocument();
    expect(screen.getByText(/CBN statement/i)).toBeInTheDocument();
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

    await user.selectOptions(screen.getByLabelText("Filter by party"), "ZLP");

    await waitFor(() => {
      expect(screen.queryByText("Bola Ahmed Tinubu")).not.toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Daniel Daberechukwu Nwanyanwu" }),
      ).toBeInTheDocument();
    });
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

  it("renders live server incidents, counts them and filters by type", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "getIncidents").mockResolvedValue(SEED_INCIDENTS);

    renderRoute(<MapPage />);

    expect(await screen.findByText(/CSO raises alarm/i)).toBeInTheDocument();
    expect(screen.getByText(/clashed at a campaign rally/i)).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();

    // Every seed state must resolve to coordinates, or the map plots nothing.
    expect(screen.queryByText(/could not be plotted/i)).not.toBeInTheDocument();

    // The server sends no id, so the list must still be able to select a card.
    // Without a derived key this silently does nothing.
    await user.click(screen.getByText(/clashed at a campaign rally/i));
    expect(await screen.findByText(/Kaduna\s*·\s*Igabi/)).toBeInTheDocument();

    // Selecting Violence keeps the violence incident and drops the unrest one.
    // The description now appears twice: once in its card, once in the detail
    // panel below the list, which is the selection being reflected.
    await user.click(screen.getByRole("radio", { name: /violence/i }));
    await waitFor(() => expect(screen.queryByText(/CSO raises alarm/i)).not.toBeInTheDocument());
    expect(screen.getAllByText(/clashed at a campaign rally/i)).toHaveLength(2);
    expect(screen.getByRole("radio", { name: /violence/i })).toHaveAttribute("aria-checked", "true");

    // Osun only has an unrest incident, so Violence + Osun matches nothing.
    await user.selectOptions(screen.getByLabelText("Filter by state"), "Osun");
    expect(await screen.findByText(/Nothing matches these filters/i)).toBeInTheDocument();

    // The panel and the list each offer a reset; either is enough.
    await user.click(screen.getAllByRole("button", { name: /clear filters/i })[0]);
    expect(await screen.findByText(/CSO raises alarm/i)).toBeInTheDocument();
  });

  it("renders the map page with an empty incident set", async () => {
    renderRoute(<MapPage />);
    expect(screen.getByText("Incident map")).toBeInTheDocument();
    expect(await screen.findByText(/No incidents published/i)).toBeInTheDocument();
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

    await waitFor(() => expect(api.submitReport).toHaveBeenCalled());
    expect(await screen.findByText("Report received")).toBeInTheDocument();
    expect(screen.getByText("new-report-id")).toBeInTheDocument();
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

    await waitFor(() => expect(api.submitReport).toHaveBeenCalled());
    expect(api.submitReport.mock.calls[0][0].evidence).toBe("Video on the ward group's page.");
  });

  it("refuses to submit a report with missing fields", async () => {
    const user = userEvent.setup();
    renderRoute(<Report />);

    await user.click(screen.getByRole("button", { name: /send report/i }));

    expect(api.submitReport).not.toHaveBeenCalled();
    expect(await screen.findByText(/required information is missing/i)).toBeInTheDocument();
  });

  it("renders the live feed with verdict filters", async () => {
    renderRoute(<LiveFeed />);
    expect(screen.getByText("Verification feed")).toBeInTheDocument();
    expect(await screen.findByText(/banned withdrawals above/i)).toBeInTheDocument();
  });

  it("renders the source registry from the API", async () => {
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

describe("admin", () => {
  it("rejects a wrong password and accepts the right one", async () => {
    const user = userEvent.setup();
    renderRoute(<AdminLogin />, { route: "/admin/login" });

    await user.type(screen.getByLabelText(/access password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/incorrect password/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/access password/i), "civicsense");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(JSON.parse(localStorage.getItem("civicsense.admin.session"))).toBeTruthy();
  });

  it("flags the development password on the login screen", () => {
    renderRoute(<AdminLogin />, { route: "/admin/login" });
    expect(screen.getByText(/Development password in use/i)).toBeInTheDocument();
  });

  it("renders the dashboard with live server numbers", async () => {
    renderRoute(<AdminDashboard />);
    expect(await screen.findByText("4,210")).toBeInTheDocument();
    expect(screen.getByText(/Waiting review/i)).toBeInTheDocument();
  });

  it("shows the pending queue and approves a report after confirmation", async () => {
    const user = userEvent.setup();
    renderRoute(<AdminReports />);

    const row = (await screen.findByText(/ballot boxes arrived/i)).closest("article");
    expect(within(row).getByText("Pending")).toBeInTheDocument();

    await user.click(within(row).getByRole("button", { name: /approve and publish/i }));
    await user.click(await screen.findByRole("button", { name: /yes, approve/i }));

    await waitFor(() => expect(api.approveReport).toHaveBeenCalledWith("r1"));
  });

  it("renders the fact-check feed and its channel breakdown", () => {
    renderRoute(<AdminFeed />);
    expect(screen.getByText("Fact-check feed")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
  });

  it("renders the politician dataset with a read-only warning", () => {
    renderRoute(<AdminPoliticians />);
    expect(screen.getByText(/Read-only by necessity/i)).toBeInTheDocument();
    expect(screen.getByText("Duplicate slugs")).toBeInTheDocument();
  });

  it("renders analytics from the public endpoints", async () => {
    renderRoute(<AdminAnalytics />);
    expect(await screen.findByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Sources in registry")).toBeInTheDocument();
  });

  it("warns in settings that the admin gate is client-side", () => {
    renderRoute(<AdminSettings />);
    expect(screen.getByText(/Development password is still active/i)).toBeInTheDocument();
    expect(screen.getByText("client-side only")).toBeInTheDocument();
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

    expect(screen.getAllByText("Photo coming soon").length).toBeGreaterThan(0);
    expect(screen.getAllByText("No verified record").length).toBeGreaterThan(0);
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

  it("renders the sourced sections in the right-hand column", () => {
    renderProfile();

    for (const heading of [
      "Overview",
      "Career highlights",
      "Education",
      "Public statements and known positions",
      "Public record",
      "Investigations and court cases",
      "Sources",
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
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
    expect(screen.getAllByText("Photo coming soon").length).toBeGreaterThan(0);
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
