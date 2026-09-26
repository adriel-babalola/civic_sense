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
};

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
  const credit = PHOTO_CREDITS[id];
  if (!credit) return null;
  const url = BY_ID[credit.file];
  if (!url) return null;
  return { ...credit, url };
}

/** Every cleared photo, for the /credits page. */
export function getAllPhotos() {
  return Object.entries(PHOTO_CREDITS)
    .map(([id]) => ({ id, ...getPhoto(id) }))
    .filter((photo) => photo.url);
}

export default PHOTO_CREDITS;
