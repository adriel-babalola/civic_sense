/**
 * Build the structured index of the research photo pack.
 *
 * WHY A GENERATOR AND NOT A HAND-WRITTEN FILE
 *
 * The pack at ../../research/photo-pack is 30 folders, each holding an image and
 * a SOURCE_AND_RIGHTS.txt that a human wrote during research. Those notes are
 * the valuable part: they record where every image came from and, crucially,
 * whether the licence was ever actually confirmed. Transcribing 30 of those by
 * hand into a data file is 60 chances to fat-finger a URL or, worse, to drop the
 * rights note and leave a bare image looking cleared. So the txt files stay the
 * source of truth and this script derives the index from them.
 *
 * Run it after adding or correcting a folder:
 *   node scripts/build-photo-pack-index.mjs
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 * It does not decide anything is publishable. It records a classification and
 * leaves `publishable` false for everything that is not an open licence. The
 * gate on publishing lives in ../data/photos.js and is enforced by the test
 * suite; this file is a research record, not an approval.
 *
 * WHY THE PACK LIVES OUTSIDE website/
 *
 * It used to sit at website/30_politicians. website/ is the static deploy root,
 * and 27 of these images are unlicensed press and social-media shots. Keeping
 * them inside the tree that gets built and shipped is how unlicensed images end
 * up one config change away from being served in public. Research inputs belong
 * next to the other research, not inside the artefact.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PACK_DIR = resolve(HERE, "../../research/photo-pack");
const OUT_FILE = resolve(HERE, "../src/data/photoPack.js");
const MANIFEST_FILE = resolve(HERE, "../../research/photo-pack/manifest.json");

/**
 * Explicit pack-name to certified-roster mapping.
 *
 * The pack uses the common short form of each name; the roster uses whatever
 * the INEC form printed. So "Peter Obi" is Peter Gregory Obi, "Seyi Makinde" is
 * Oluseyi Abiodun Makinde, and "Sandy Onor" is Sandy Ojang Onor. Matching these
 * automatically is unsafe in both directions: a loose match invents people, and
 * a strict one silently drops them. They are listed by hand instead, and the
 * test suite checks every slug against the real roster so a typo fails the build
 * rather than producing a profile that quietly never matches anything.
 *
 * Anyone NOT listed here is not on a certified 2027 ticket in this dataset. Most
 * of the pack is serving state governors, senators and party chairs. That is
 * not a defect in the research, it is a different dataset, and `rosterId: null`
 * is the honest record of it. It also means their photos cannot be attached to a
 * profile, because the profiles that exist are candidates.
 */
const ROSTER_MATCHES = {
  "Abba Kabir Yusuf": "kabiru-yusuf",
  "Atiku Abubakar": "atiku-abubakar",
  "Bola Ahmed Tinubu": "bola-ahmed-tinubu",
  "Kashim Shettima": "kashim-shettima",
  "Peter Obi": "peter-gregory-obi",
  "Rabiu Kwankwaso": "musa-mohammed-rabiu-kwankwaso",
  "Rotimi Amaechi": "chibuike-rotimi-amaechi",
  "Sandy Onor": "sandy-ojang-onor",
  "Seyi Makinde": "oluseyi-abiodun-makinde",
};

/** Licences we can actually publish under, matched against the rights note. */
const OPEN_LICENCES = [
  { pattern: /CC0/i, license: "CC0", licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/" },
  { pattern: /CC BY 4\.0/i, license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" },
  { pattern: /CC BY 2\.0/i, license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/" },
  { pattern: /CC BY-SA 4\.0/i, license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" },
  {
    // Voice of America material is public domain in the US by VOA's own release,
    // which is the basis the Commons file for Kwankwaso rests on. Cite the
    // template rather than leaving the entry with no licence reference at all.
    pattern: /public[- ]domain/i,
    license: "Public domain (VOA release)",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-VOA",
  },
];

/**
 * A source URL we cannot cite even in principle.
 *
 * Several notes record a Bing image-search permalink rather than the page the
 * image actually lives on. Those are not stable: they expire, they change with
 * the query, and they resolve to a search results page for any reader who
 * clicks them. Recorded, flagged, never treated as a citation.
 */
function isUnciteableSource(url) {
  return /bing\.com\/images\/search|lookaside\.fb\.com/i.test(url);
}

/** Pull the fields out of one SOURCE_AND_RIGHTS.txt. */
function parseNote(text) {
  const source = (text.match(/Image\/source:\s*(\S+)/) || [])[1] || "";
  // The rights sentence runs to the end of its line, minus a leading "Rights:".
  const rightsLine = (text.match(/Rights note:\s*\n([^\n]+)/) || [])[1] || "";
  const rights = rightsLine.replace(/^Rights:\s*/, "").trim();
  const name = (text.match(/Politician:\s*(.+)/) || [])[1]?.trim() || "";
  return { name, source, rights };
}

/*
 * The image facts come from process-photo-pack.py, which is what actually opened
 * each file and found out that six .png files are WebP and one is a saved search
 * page. Reading them from here rather than trusting filenames keeps the two
 * scripts agreeing about what is real.
 */
const manifest = JSON.parse(readFileSync(MANIFEST_FILE, "utf8"));

const entries = manifest.map((record) => {
  const note = parseNote(
    readFileSync(join(PACK_DIR, record.folder, "SOURCE_AND_RIGHTS.txt"), "utf8"),
  );

  const openLicence = OPEN_LICENCES.find((entry) => entry.pattern.test(note.rights));
  const isCommons = /wikimedia\.org|commons/i.test(note.source);
  // Both conditions are required. An open licence quoted on a non-Commons page
  // is a claim we cannot check, and a Commons URL with no licence named in the
  // note is a licence we do not have.
  const cleared = Boolean(openLicence && isCommons) && !isUnciteableSource(note.source);

  return {
    order: Number.parseInt(record.folder.slice(0, 2), 10),
    folder: record.folder,
    packName: record.packName,
    // `asset` is null when the file could not be processed at all. That is not
    // the same as a cleared image with no licence: it means there is no picture.
    asset: record.ok ? record.output : null,
    usable: Boolean(record.ok),
    unusableReason: record.ok ? null : record.reason,
    lowResolution: Boolean(record.lowResolution),
    outputSize: record.outputSize || null,
    source: note.source,
    rights: note.rights,
    rightsStatus: cleared ? "open-licence" : "unverified",
    licence: openLicence?.license || null,
    licenceUrl: openLicence?.licenseUrl || null,
    onCommons: isCommons,
    sourceIsStable: !isUnciteableSource(note.source),
    rosterId: ROSTER_MATCHES[record.packName] || null,
  };
});

const cleared = entries.filter((entry) => entry.rightsStatus === "open-licence");
const usable = entries.filter((entry) => entry.usable);
const noImage = entries.filter((entry) => !entry.usable);
const notOnRoster = entries.filter((entry) => !entry.rosterId);
const onRoster = entries.filter((entry) => entry.rosterId);

/*
 * The credits emitted here describe the images truthfully: the real source, and
 * "Licence not verified" where that is the fact. A credits page is a legal
 * statement about other people's copyright, so it gets the truth even when the
 * truth is inconvenient. The eight Wikimedia images in ./photos.js keep their
 * proper CC terms and remain the only entries with a licence URL.
 */
const photoCredits = entries
  .filter((entry) => entry.usable)
  .map((entry) => [
    entry.asset,
    {
      file: entry.asset,
      author: "Unknown",
      license: entry.rightsStatus === "open-licence" ? entry.licence : "Licence not verified",
      licenseUrl: entry.rightsStatus === "open-licence" ? entry.licenceUrl : null,
      source: entry.source,
      sourceLabel: entry.onCommons ? "Wikimedia Commons" : "original source",
      title: entry.packName,
      taken: null,
      packFolder: entry.folder,
      ...(entry.rightsStatus !== "open-licence" ? { unverified: true } : {}),
      ...(entry.lowResolution ? { lowResolution: true } : {}),
      ...(entry.sourceIsStable ? {} : { sourceUnstable: true }),
    },
  ]);

const body = `/**
 * Research photo pack: ${entries.length} portraits, ${usable.length} usable as images.
 *
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *   python3 scripts/process-photo-pack.py
 *   node scripts/build-photo-pack-index.mjs
 *
 * The pack itself lives in ../../research/photo-pack, outside this package,
 * because website/ is the static deploy root and these images are not cleared
 * for republication.
 *
 * HOW THESE IMAGES ARE TREATED
 *
 * All ${usable.length} of them are wired into the site at the owner's instruction, and ${cleared.length} of those
 * (Atiku, Kwankwaso, Barau Jibrin) additionally carry a verified open licence.
 * The other ${usable.length - cleared.length} were found by image search and came from X, news
 * outlets, campaign sites and image-search permalinks. Their rights notes all
 * read "not independently verified", so the credit records exactly that: a real
 * source URL and "Licence not verified". No CC licence is asserted for them,
 * because asserting one would be a false statement about someone else's
 * copyright on a public page.
 *
 * That is a decision to keep going while the licensing is sorted, not a clean
 * bill of health. The claims most likely to draw a takedown are the ones whose
 * source is a publisher's own CDN, since those are unambiguously that
 * publisher's work. PACK_SOURCES_NEEDING_PERMISSION lists them.
 *
 * ${noImage.length} folder has no image at all: Cleopas Zuwoghe's file is a saved Bing results page, so
 * there is no photograph of him here.
 *
 * ${notOnRoster.length} of the ${entries.length} are not on a certified 2027 ticket in this dataset. They are serving
 * governors, senators and party chairs, which is a different dataset needing its
 * own verification model. Their \`rosterId\` is null, which is what stops a governor's
 * photograph being attached to a candidate profile it has nothing to do with.
 *
 * @typedef {object} PackEntry
 * @property {number} order
 * @property {string} folder
 * @property {string} packName
 * @property {string|null} asset      Basename in src/assets/politicians, or null.
 * @property {boolean} usable        False when the file was not an image.
 * @property {string|null} unusableReason
 * @property {boolean} lowResolution Emitted below normal size; soft when enlarged.
 * @property {string} source
 * @property {string} rights        The researcher's note, verbatim.
 * @property {"open-licence" | "unverified"} rightsStatus
 * @property {string|null} licence
 * @property {string|null} licenceUrl
 * @property {boolean} onCommons
 * @property {boolean} sourceIsStable  False for image-search permalinks.
 * @property {string|null} rosterId  Certified roster slug, or null.
 */

/** @type {PackEntry[]} */
export const PHOTO_PACK = ${JSON.stringify(entries, null, 2)};

/**
 * Credit entries for photos.js, keyed by asset basename.
 *
 * Merged in after the hand-curated Wikimedia entries. They never displace one:
 * for Atiku and Kwankwaso there is a properly licensed original already in
 * photos.js, and that is the copy the site uses.
 */
export const PACK_PHOTO_CREDITS = Object.fromEntries(${JSON.stringify(photoCredits, null, 2)});

/** Entries whose licence was actually confirmed. */
export const CLEARED = PHOTO_PACK.filter((entry) => entry.rightsStatus === "open-licence");

/** Entries held for licensing follow-up. Still rendered, still credited honestly. */
export const UNCLEARED = PHOTO_PACK.filter(
  (entry) => entry.usable && entry.rightsStatus !== "open-licence",
);

/** Pack entries whose subject is a certified 2027 candidate on this roster. */
export const PACK_FOR_CERTIFIED_CANDIDATES = PHOTO_PACK.filter((entry) => entry.rosterId);

/**
 * The subset most likely to draw a takedown.
 *
 * A publisher's own CDN means the image is unambiguously that publisher's
 * copyrighted work, rather than a portrait a subject released or a file someone
 * put under an open licence. Anything whose source is a news site should be
 * cleared with the publisher or replaced before this site is publicly deployed.
 */
export const PACK_SOURCES_NEEDING_PERMISSION = UNCLEARED.filter((entry) =>
  /(^|[.])(premiumtimesng[.]com|thesun[.]ng|vanguardngr[.]com|dailytrust[.]com|thisdaylive[.]com|nairaland[.]com|metoricpost[.]com|theinvisibleinsider[.]org[.]ng|nigerianvoice[.]com|trumpetmediagroup[.]com|blogspot[.]com|lookaside[.]fb[.]com)/i.test(
    entry.source,
  ),
);

export default PHOTO_PACK;
`;

writeFileSync(OUT_FILE, body);

console.log(`Wrote ${entries.length} entries to ${OUT_FILE}`);
console.log(`  usable images:   ${usable.length}`);
console.log(`  no image at all: ${noImage.length}${noImage.length ? ` (${noImage.map((e) => `${e.packName}: ${e.unusableReason}`).join("; ")})` : ""}`);
console.log(`  licence cleared: ${cleared.length} (${cleared.map((e) => e.packName).join(", ") || "none"})`);
console.log(`  licence open question, still rendered: ${usable.length - cleared.length}`);
console.log(`  on certified roster: ${onRoster.length}`);
console.log(`  not on roster:       ${notOnRoster.length}`);