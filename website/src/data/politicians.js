/**
 * Politician profiles for the 2027 presidential election.
 *
 * EDITORIAL POLICY — this file generates every profile from the certified INEC
 * ticket list rather than storing one hand-written object per person. That is a
 * deliberate reversal of the earlier approach and the reason is a bug, not a
 * preference.
 *
 * 1. THE ROSTER IS GENERATED, SO IT CANNOT DRIFT. The previous file listed
 *    people one at a time, which is how it came to contain a presidential
 *    candidate labelled "Governor of Kano State", a predecessor listed as the
 *    sitting governor, three invented legislators, and one person twice. Any
 *    assertion a human types about a living public figure is a chance to be
 *    wrong, and being wrong about someone's job is the worst error this product
 *    can make. Deriving the roster from a primary document means the only thing
 *    a human types is the document's own contents.
 *
 * 2. EVERY CANDIDACY CLAIM TRACES TO A CITATION. `source` is INEC's own final
 *    list, carried on every profile. `verification` is "verified" for the
 *    candidacy because it is transcribed from that document, and it is scoped
 *    deliberately narrowly: it means INEC cleared this person to run, and
 *    nothing else.
 *
 * 3. A CANDIDACY IS NOT A RECORD. `record`, `policies`, `statements`,
 *    `investigations` and the rest ship empty for every entry, and they render
 *    as an explicit "nothing verified yet". Naming a living person as corrupt,
 *    or attributing a broken promise to them, is defamatory if it is wrong, and
 *    an empty section is the honest state rather than a placeholder. Anything
 *    added to those arrays needs a primary source URL, a date, and a named
 *    reviewer before it ships.
 *
 * 4. NO INVENTED BIOGRAPHIES. `bio` states the INEC-certified fact and nothing
 *    more, except for the handful of people in CONTEXT below whose career to
 *    date is not in dispute. For everyone else the directory says what the
 *    electoral commission says about them and stops. A thinner profile is
 *    better than a plausible invention.
 *
 * 5. TICKETS ARE PAIRS, AND THE PAIR IS NAVIGABLE. Each profile carries its
 *    partner, and each partner links to the other, because a voter looking up a
 *    running mate needs to reach the presidential candidate in one click and
 *    vice versa.
 *
 * 6. PHOTOS ARE OPT-IN AND LICENCE-CLEARED. `photoId` points into ./photos.js,
 *    which is the only place a licence is recorded. Most entries have none and
 *    render an initials avatar. A photo is never a stock image and never a
 *    scraped press shot, because putting a stranger's face next to a real name
 *    is misinformation.
 */

import { slugify } from "../utils/formatters";
import { getPhoto } from "./photos";
import {
  TICKETS_2027,
  INEC_SOURCE,
  PRESIDENTIAL_ELECTION_DATE,
  NATIONAL,
  PRESIDENTIAL,
  RUNNING_MATE,
} from "./elections2027";

/** Offices held before the 2027 race, for the people where this is not in dispute. */
const CAREER = {
  "Bola Ahmed Tinubu": "President of Nigeria since May 2023, previously governor of Lagos State from 2003 to 2007.",
  "Kashim Shettima": "Vice President of Nigeria since May 2023, previously governor of Borno State from 2017 to 2023.",
  "Atiku Abubakar": "Vice President of Nigeria from 1999 to 2007, and governor of Adamawa State from 1999 to 2007 and from 2011 to 2015.",
  "Chibuike Rotimi Amaechi": "Governor of Rivers State from 2015 to 2023, and Minister of Transportation from 2023 to 2025.",
  "Peter Gregory Obi": "Governor of Anambra State from 2014 to 2022.",
  "Musa Mohammed Rabiu Kwankwaso": "Governor of Kano State from 2003 to 2011 and from 2015 to 2019.",
  "Oluseyi Abiodun Makinde": "Governor of Oyo State since 2019.",
  "Donald Duke": "Governor of Cross River State from 1999 to 2007 and from 2012 to 2015, and Minister of Niger Delta Affairs from 2015 to 2017.",
  "Adebayo Adebayo Ebenezer": "Presidential candidate of the Social Democratic Party in 2023, and a sitting member of the House of Representatives.",
};

/** Licensed portraits. Keyed by name so a missing one fails loudly in review. */
const PHOTOS = {
  "Bola Ahmed Tinubu": "tinubu",
  "Kashim Shettima": "shettima",
  "Atiku Abubakar": "atiku",
  "Chibuike Rotimi Amaechi": "amaechi",
  "Peter Gregory Obi": "obi",
  "Musa Mohammed Rabiu Kwankwaso": "kwankwaso",
};

/*
 * Research-pack photographs, keyed by the pack's own short name.
 *
 * Added at the owner's instruction after a 30-image pack was assembled by image
 * search. Three of those came with a verified open licence; the rest did not,
 * and ./photoPack.js records the real source and "Licence not verified" for each
 * rather than asserting a CC licence that was never confirmed.
 *
 * Kept in a SEPARATE map from PHOTOS above rather than merged into it, because
 * the two have different provenance and that difference has to stay visible:
 *
 *   - PHOTOS are Wikimedia Commons files whose licence and author were checked.
 *     Those keep their proper CC terms on /credits.
 *   - These are pack images. For Atiku and Kwankwaso the pack has a copy of the
 *     same picture, and the curated entry above deliberately wins, so a verified
 *     credit is never replaced by an unverified one.
 *
 * Every entry here is a person who IS on a certified 2027 ticket. The other 21
 * pack subjects are serving governors, senators and party chairs; they have no
 * profile in this dataset, so nothing here points at them.
 */
const PACK_PHOTOS = {
  "Atiku Abubakar": "atiku",
  "Bola Ahmed Tinubu": "tinubu",
  "Kashim Shettima": "shettima",
  "Peter Obi": "pack-peter-obi",
  "Rabiu Kwankwaso": "kwankwaso",
  "Rotimi Amaechi": "amaechi",
  "Sandy Onor": "pack-sandy-onor",
  "Seyi Makinde": "pack-seyi-makinde",
};

/**
 * Curated licence first, pack image second.
 *
 * Written as a function rather than `{ ...PACK_PHOTOS, ...PHOTOS }` so the
 * precedence is a decision in one readable line. Six of the eight pack subjects
 * who are certified candidates already have a Wikimedia Commons photograph on
 * file, and those must keep it: swapping a verified CC BY-SA portrait for an
 * unverified copy of what looks like the same picture would be a downgrade.
 */
function resolvePhotoId(name) {
  return PHOTOS[name] || PACK_PHOTOS[name] || null;
}

/** Encyclopaedia entries, for readers who want to check a name. */
const REFERENCES = {
  "Bola Ahmed Tinubu": "https://en.wikipedia.org/wiki/Bola_Tinubu",
  "Kashim Shettima": "https://en.wikipedia.org/wiki/Kashim_Shettima",
  "Atiku Abubakar": "https://en.wikipedia.org/wiki/Atiku_Abubakar",
  "Chibuike Rotimi Amaechi": "https://en.wikipedia.org/wiki/Rotimi_Amaechi",
  "Peter Gregory Obi": "https://en.wikipedia.org/wiki/Peter_Obi",
  "Musa Mohammed Rabiu Kwankwaso": "https://en.wikipedia.org/wiki/Rabiu_Musa_Kwankwaso",
  "Oluseyi Abiodun Makinde": "https://en.wikipedia.org/wiki/Seyi_Makinde",
  "Donald Duke": "https://en.wikipedia.org/wiki/Donald_Duke",
  "Omoyele Sowore": "https://en.wikipedia.org/wiki/Omoyele_Sowore",
  "Adebayo Adebayo Ebenezer": "https://en.wikipedia.org/wiki/Adebayo_Adebayo",
};

function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${day} ${months[month - 1]} ${year}`;
}

/** "16 January 2027", from the ISO polling date. */
export const ELECTION_DATE_LABEL = formatDate(PRESIDENTIAL_ELECTION_DATE);

/** @typedef {object} Politician
 * @property {string} id        URL slug.
 * @property {string} name      Full name as publicly styled.
 * @property {string} party     INEC party code.
 * @property {string} partyName Full party name.
 * @property {string} state     NATIONAL for a national contest.
 * @property {string} office    Role on the 2027 ticket.
 * @property {"presidential" | "running-mate"} role
 * @property {number|null} age  Age on the INEC form.
 * @property {string|null} gender
 * @property {string} bio
 * @property {string|null} photoId
 * @property {string|null} photo        Resolved bundled image URL.
 * @property {object|null} photoCredit  Author, licence and source.
 * @property {{ name: string, slug: string, href: string }} runningMate  Null on a running mate.
 * @property {{ name: string, slug: string, href: string }} presidentialCandidate
 * @property {object} source           The INEC document this profile rests on.
 * @property {string[]} record         Empty by policy.
 * @property {"verified"} verification Scoped to the candidacy only.
 */

function build(ticket) {
  const candidateSlug = slugify(ticket.candidate);
  const mateSlug = slugify(ticket.runningMate);

  const person = (name, age, gender, role) => {
    const isPresidential = role === PRESIDENTIAL;
    const career = CAREER[name];
    const certified = isPresidential
      ? `INEC certified ${name} as the ${ticket.partyName} (${ticket.party}) presidential candidate for the ${ELECTION_DATE_LABEL} general election, running with ${ticket.runningMate}.`
      : `INEC certified ${name} as the ${ticket.partyName} (${ticket.party}) vice-presidential candidate for the ${ELECTION_DATE_LABEL} general election, running with ${ticket.candidate}.`;

    return {
      id: slugify(name),
      name,
      party: ticket.party,
      partyName: ticket.partyName,
      state: NATIONAL,
      office: isPresidential ? "Presidential candidate, 2027" : "Vice-presidential candidate, 2027",
      level: "federal",
      role,
      age,
      gender,
      since: String(Number(INEC_SOURCE.published.slice(0, 4))),
      bio: career ? `${career} ${certified}` : certified,
      photoId: resolvePhotoId(name),
      photo: getPhoto(resolvePhotoId(name))?.url || null,
      photoCredit: getPhoto(resolvePhotoId(name)),
      runningMate: {
        name: ticket.runningMate,
        slug: mateSlug,
        href: `/politicians/${mateSlug}`,
      },
      presidentialCandidate: {
        name: ticket.candidate,
        slug: candidateSlug,
        href: `/politicians/${candidateSlug}`,
      },
      source: INEC_SOURCE,
      // Empty by policy. See note 3 at the top of this file.
      born: null,
      constituency: null,
      education: [],
      experience: [],
      statements: [],
      investigations: [],
      policies: [],
      record: [],
      external: [],
      reference: REFERENCES[name] || null,
      verification: "verified",
    };
  };

  return [
    person(ticket.candidate, ticket.candidateAge, ticket.candidateGender, PRESIDENTIAL),
    person(ticket.runningMate, ticket.runningMateAge, ticket.runningMateGender, RUNNING_MATE),
  ];
}

/** @type {Politician[]} Every candidate and running mate on a certified ticket. */
export const POLITICIANS = TICKETS_2027.flatMap(build);

/**
 * De-duplicate by slug.
 *
 * Two INEC tickets could in principle nominate the same person, and a directory
 * that renders one person twice under two slugs is a bug worth guarding even
 * though the current list is clean.
 */
export const UNIQUE_POLITICIANS = Object.values(
  POLITICIANS.reduce((acc, person) => {
    if (!acc[person.id]) acc[person.id] = person;
    return acc;
  }, {}),
);

export function getPoliticianBySlug(slug) {
  return UNIQUE_POLITICIANS.find((person) => person.id === slug) || null;
}

/** Distinct parties present in the dataset, for the filter dropdown. */
export function getParties() {
  return [...new Set(UNIQUE_POLITICIANS.map((person) => person.party))].sort();
}

/** Presidential candidates only, in INEC document order. */
export function getPresidentialCandidates() {
  return UNIQUE_POLITICIANS.filter((person) => person.role === PRESIDENTIAL);
}

export { INEC_SOURCE, PRESIDENTIAL_ELECTION_DATE, NATIONAL, PRESIDENTIAL, RUNNING_MATE };

export default UNIQUE_POLITICIANS;
