import { PACK_PHOTO_CREDITS, PHOTO_PACK } from "./photoPack";

/**
 * Cleared photo licences.
 *
 * EDITORIAL POLICY — a portrait of a living person is the highest-risk asset in
 * this project, so nothing enters this file without a recorded licence.
 *
 * 1. NO UNSOURCED PHOTOS. Every entry names the Wikimedia Commons file it came
 *    from, the author, and the licence. `source` is the Commons description
 *    page, which is where the licence text and any revisions live.
 *
 * 2. NO STOCK PHOTOS AND NO PRESS-SCRAPED SHOTS. A stock face next to a real
 *    name is misinformation, and a copyrighted press photo is a takedown. The
 *    only acceptable source is a licence that permits reuse, which in practice
 *    means Commons, an official government release, or a photo the subject
 *    published themselves under an open licence.
 *
 * 3. ATTRIBUTION IS NOT OPTIONAL. CC BY and CC BY-SA both require credit. The
 *    profile page shows a caption under the photo and `/credits` lists every
 *    image with its author, licence and source, so credit is visible on the
 *    page it appears on and not buried in a footer.
 *
 * 4. DO NOT MODIFY THE IMAGE. CC BY-SA share-alike obligations attach to
 *    derivatives. Displaying the file as published keeps this simple; if a photo
 *    is ever cropped or retouched, the derivative must be released under
 *    BY-SA and the change noted here.
 *
 * 5. `file` must match a real file in ../assets/politicians. The resolver below
 *    returns null when it does not, so a renamed or deleted image degrades to
 *    the initials placeholder instead of rendering a broken <img>. The test
 *    suite asserts every entry resolves.
 *
 * Images are bundled through the app rather than hot-linked from upload
 * .wikimedia.org: a hot link makes every profile view a request to Wikimedia
 * from a Nigerian reader's browser, which is slow on poor connections and rude
 * to a volunteer-run site that did not ask for the traffic.
 */

/** @type {Record<string, string>} Basename without extension to bundled URL. */
const ASSETS = import.meta.glob("../assets/politicians/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});

const BY_ID = Object.fromEntries(
  Object.entries(ASSETS).map(([path, url]) => [
    path.split("/").pop().replace(/\.jpg$/, ""),
    url,
  ]),
);

const COMMONS = "https://commons.wikimedia.org/wiki/File:";

/**
 * @typedef {object} PhotoCredit
 * @property {string} file      Basename in ../assets/politicians.
 * @property {string} author    Photographer or releasing body.
 * @property {string} license   Short licence name, e.g. "CC BY-SA 4.0".
 * @property {string} licenseUrl
 * @property {string} source    Commons description page.
 * @property {string} title     What the photograph is.
 * @property {string} taken     Year the photograph was taken or published.
 * @property {string} [modifications]  Change made to the published file, if any.
 */

/** @type {Record<string, PhotoCredit>} */
export const PHOTO_CREDITS = {
  tinubu: {
    file: "tinubu",
    author: "Nosa Asemota",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: `${COMMONS}Bola_Tinubu_portrait_(cropped).jpg`,
    title: "Official portrait of Bola Ahmed Tinubu",
    taken: "2023",
  },
  shettima: {
    file: "shettima",
    author: "Opeyemi Adelani",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: `${COMMONS}Kashim_Shettima_office_portrait.jpg`,
    title: "Kashim Shettima Mustapha in his council chambers",
    taken: "2023",
  },
  atiku: {
    file: "atiku",
    author: "Etauso",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    source: `${COMMONS}Atiku_Abubakar_2023.jpg`,
    title: "Atiku Abubakar",
    taken: "2022",
  },
  jonathan: {
    file: "jonathan",
    author: "National Library of Nigeria",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    source: `${COMMONS}Goodluck_Jonathan_official_portrait.jpg`,
    title: "Official portrait of Goodluck Ebele Jonathan",
    taken: "2013",
  },
  wike: {
    file: "wike",
    author: "Hygist",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    source: `${COMMONS}Nyesom_Wike_(2015).jpg`,
    title: "Nyesom Wike",
    taken: "2015",
  },
  kwankwaso: {
    file: "kwankwaso",
    author: "Voice of America",
    license: "Public domain (VOA)",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-VOA",
    source: `${COMMONS}Rabiu_Kwankwaso_(cropped).jpg`,
    title: "Rabiu Musa Kwankwaso during a Voice of America interview",
    taken: "2019",
  },
  obi: {
    file: "obi",
    author: "Voice of America",
    license: "Public domain (VOA)",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-VOA",
    source: `${COMMONS}Peter_Obi_2022.jpg`,
    title: "Peter Obi during a Voice of America interview",
    taken: "2022",
  },
  amaechi: {
    file: "amaechi",
    author: "International Maritime Organization",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
    source: `${COMMONS}Chibuike_Amaechi_(cropped).jpg`,
    title: "Chibuike Rotimi Amaechi at the IMO headquarters, London",
    taken: "2016",
  },

  /*
   * From the 30-image research photo pack (see ./photoPack.js and
   * research/photo-pack). It arrived with 30 candidates' portraits; three were
   * under an open licence and this is the only one of those not already bundled
   * above. Atiku and Kwankwaso are in the pack too, but the copies here are the
   * better-sourced ones, so the pack versions were left alone.
   *
   * An orphan entry for now: Barau Jibrin is not on a certified 2027 ticket in
   * this dataset, so no profile renders it yet. `jonathan` is in the same
   * position. Keeping the credit means the licence, the author and the source
   * are already recorded and correct on the day a profile for him exists, rather
   * than being reconstructed from memory later.
   *
   * The other 27 pack images are deliberately NOT here. Their rights notes all
   * read "not independently verified", and they came from X, news outlets,
   * campaign sites and image-search permalinks. `photoPack.js` records what they
   * are and why they were held back.
   */
  barau: {
    file: "barau",
    author: "Okohamodu",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
    source: `${COMMONS}Barau_I_Jibrin_cropped_portrait.jpg`,
    title: "Barau I Jibrin",
    taken: "2023",
    // CC BY requires indicating changes, and this is one: the pack's copy is
    // 815x924 and the bundled one is 500x567. Purely a downscale, no retouching,
    // so it is disclosed here rather than left out.
    modifications: "resized to 500x567",
  },
};

/**
 * Every usable credit: the hand-curated Wikimedia entries, then the research
 * pack's.
 *
 * The pack also has photos for several people we already hold cleared originals
 * for, but the copies in PHOTO_CREDITS carry verified CC terms while the pack
 * copies carry "not independently verified". UNSUPERSEDED_PACK_CREDITS drops
 * those rather than merging them, so a verified credit is never replaced or
 * duplicated by an unverified one.
 *
 * The pack entries are prefixed `pack-` in the assets folder for the same
 * reason: the names cannot collide, so this merge can never accidentally shadow
 * a curated entry by accident of a filename.
 */
const CURATED_SUBJECTS = new Set(
  Object.values(PHOTO_CREDITS).map((credit) => credit.title.trim().toLowerCase()),
);

/**
 * Pack credits that do not earn a row.
 *
 * The pack photographed several people we already hold a cleared Wikimedia
 * Commons file for, including Nyesom Wike, who is not on a 2027 ticket and so is
 * absent from the roster entirely. Emitting those would list the person twice on
 * /credits and put the "Licence not verified" row next to the verified one.
 *
 * Filtered by subject rather than by a list of names kept in the generator,
 * because photos.js imports this module and not the other way round: deriving it
 * here keeps one source of truth. A pack photo is dropped only when a curated
 * photo of the same person already exists, never on any other basis.
 */
const UNSUPERSEDED_PACK_CREDITS = Object.fromEntries(
  Object.entries(PACK_PHOTO_CREDITS).filter(
    ([, credit]) => !CURATED_SUBJECTS.has(credit.title.trim().toLowerCase()),
  ),
);

const ALL_CREDITS = { ...PHOTO_CREDITS, ...UNSUPERSEDED_PACK_CREDITS };

/**
 * Pack image for a person, looked up by their name in the research pack.
 *
 * The pack writes common short names ("Peter Obi") while the roster uses the
 * INEC form ("Peter Gregory Obi"), so the lookup goes through the pack's own
 * alias map rather than string-matching at runtime. Returns null for anyone not
 * in the pack, which is most of the roster, and for Cleopas Zuwoghe whose file
 * is a saved search page rather than a photograph.
 */
export function getPackPhotoIdFor(packName) {
  const entry = PHOTO_PACK.find((item) => item.packName === packName);
  return entry?.asset || null;
}

/**
 * Resolve a photo id to a renderable URL plus its credit.
 *
 * Returns null for an unknown id, and also for an id whose file is missing from
 * src/assets, so a bad entry shows the initials placeholder rather than a
 * broken image.
 *
 * @param {string | null | undefined} id
 * @returns {{ url: string } & PhotoCredit | null}
 */
export function getPhoto(id) {
  if (!id) return null;
  const credit = ALL_CREDITS[id];
  if (!credit) return null;
  const url = BY_ID[credit.file];
  if (!url) return null;
  return { ...credit, url };
}

/** Every cleared photo, for the /credits page. */
export function getAllPhotos() {
  return Object.entries(ALL_CREDITS)
    .map(([id]) => ({ id, ...getPhoto(id) }))
    .filter((photo) => photo.url);
}

export default PHOTO_CREDITS;
