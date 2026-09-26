/**
 * The 2027 presidential election field, as certified by INEC.
 *
 * EDITORIAL POLICY — this is the one dataset in the project that is NOT
 * researched from memory, because it is transcribed from a single primary
 * document rather than assembled from many sources. That makes it both the most
 * reliable and the most fragile file here.
 *
 * 1. ONE PRIMARY SOURCE, TRANSCRIBED. Every field below comes from INEC's own
 *    "Final List of Candidates" for the January 2027 presidential election,
 *    signed by Rose Oriaran-Anthony, Secretary to the Commission. The list is
 *    the electoral authority's own record of who it has cleared to contest, so
 *    it is the strongest citation available for a candidacy claim. It was
 *    transcribed from the PDF, not from news coverage, because several outlets
 *    reported the names in a different order and one mangled a spelling.
 *
 * 2. NAMES ARE NORMALISED, NOT INVENTED. INEC's form prints names in the order
 *    the candidate gave them, which for several people is surname-first and for
 *    one wraps across two lines. Names here use the conventional public form.
 *    Where that differs from the document, the conventional form wins, because
 *    the alternative is a directory that cannot be found by the person it names.
 *
 * 3. NO INTERPRETATION. `age` and `gender` are transcribed from the gender and
 *    age columns. Nothing is inferred. Notably, the PWD (pension details)
 *    column reads "None" for all 18 tickets, so no declared-asset information
 *    exists here to publish, and this file must not be used to imply otherwise.
 *
 * 4. A TICKET IS NOT A RECORD. Being on this list says who is running and with
 *    whom. It says nothing about any candidate's conduct, and the record,
 *    policies and investigations fields on a profile stay empty unless a
 *    separate primary source supports them.
 *
 * 5. DATES ARE THE POINT. `published` is the date INEC released this list and
 *    `electionDate` is the polling date. If a supplementary or amended list is
 *    published, add it rather than editing these rows: an election result page
 *    whose date is invisible is a page that will quietly go stale.
 *
 * The earlier hand-written roster of governors and office-holders was retired in
 * favour of this file. It was unverified, it contained errors, and "office held
 * today" is exactly the kind of claim that rots between election cycles.
 */

/** The document every claim on this page traces back to. */
export const INEC_SOURCE = {
  title: "Presidential and National Assembly Elections for January 2027: Final List of Candidates",
  publisher: "Independent National Electoral Commission (INEC)",
  url: "https://inecnigeria.org/documents/press/2027%20PRESIDENTIAL%20FINAL%20LIST.pdf",
  published: "2026-09-12",
  signedBy: "Rose Oriaran-Anthony, Secretary to the Commission",
};

/** Polling day for the presidential election. */
export const PRESIDENTIAL_ELECTION_DATE = "2027-01-16";

/** INEC records STATE as NIGERIA for a national contest, not a home state. */
export const NATIONAL = "Nigeria";

export const PRESIDENTIAL = "presidential";
export const RUNNING_MATE = "running-mate";

/**
 * @typedef {object} Ticket
 * @property {string} party      INEC party code, e.g. "APC".
 * @property {string} partyName  Full party name.
 * @property {string} candidate      Name as conventionally styled.
 * @property {number|null} candidateAge    Age on the INEC form, null if not listed.
 * @property {string|null} candidateGender  "F" | "M" as printed, or null.
 * @property {string} runningMate     Name as conventionally styled.
 * @property {number|null} runningMateAge
 * @property {string|null} runningMateGender
 */

/** @type {Ticket[]} All 18 certified tickets, in the document's own order. */
export const TICKETS_2027 = [
  {
    party: "AA",
    partyName: "Action Alliance",
    candidate: "Rufai Adekunle Omo-Aje",
    candidateAge: 71,
    candidateGender: "M",
    runningMate: "Shehu Hussaini",
    runningMateAge: 56,
    runningMateGender: "M",
  },
  {
    party: "ADP",
    partyName: "Action Democratic Party",
    candidate: "Aliyu Abbas-Bin",
    candidateAge: 44,
    candidateGender: "M",
    runningMate: "Chinazam Ike",
    runningMateAge: 50,
    runningMateGender: "M",
  },
  {
    party: "APP",
    partyName: "Allied Peoples Party",
    candidate: "Kabiru Yusuf",
    candidateAge: 54,
    candidateGender: "M",
    runningMate: "Peace Egobia Ofordile",
    runningMateAge: 47,
    runningMateGender: "F",
  },
  {
    party: "AAC",
    partyName: "African Action Congress",
    candidate: "Omoyele Sowore",
    candidateAge: 55,
    candidateGender: "M",
    runningMate: "Haruna Garba Magashi",
    runningMateAge: 49,
    runningMateGender: "M",
  },
  {
    party: "ADC",
    partyName: "African Democratic Congress",
    candidate: "Atiku Abubakar",
    candidateAge: 79,
    candidateGender: "M",
    runningMate: "Chibuike Rotimi Amaechi",
    runningMateAge: 61,
    runningMateGender: "M",
  },
  {
    party: "APC",
    partyName: "All Progressives Congress",
    candidate: "Bola Ahmed Tinubu",
    candidateAge: 74,
    candidateGender: "M",
    runningMate: "Kashim Shettima",
    runningMateAge: 59,
    runningMateGender: "M",
  },
  {
    party: "APM",
    partyName: "Allied People's Movement",
    candidate: "Oluseyi Abiodun Makinde",
    candidateAge: 58,
    candidateGender: "M",
    runningMate: "Musa Lawal Daura",
    runningMateAge: 73,
    runningMateGender: "M",
  },
  {
    party: "BP",
    partyName: "Boot Party",
    candidate: "Adenuga Sunday",
    candidateAge: 52,
    candidateGender: "M",
    runningMate: "Usman Turaki Mustapha",
    runningMateAge: 40,
    runningMateGender: "M",
  },
  {
    party: "DLA",
    partyName: "Democratic Labour Alliance",
    candidate: "Moses Olusoji Adebisi",
    candidateAge: 35,
    candidateGender: "M",
    runningMate: "Nafisat Usaku Abubakar",
    runningMateAge: 35,
    runningMateGender: "F",
  },
  {
    party: "LP",
    partyName: "Labour Party",
    candidate: "Sunday Chibuzo Okereke",
    candidateAge: 43,
    candidateGender: "M",
    runningMate: "Hajja Bintu Konto",
    runningMateAge: 54,
    runningMateGender: "F",
  },
  {
    party: "NDP",
    partyName: "National Democratic Party",
    candidate: "Ada Elizabeth Fredrick Okwori",
    candidateAge: 48,
    candidateGender: "F",
    runningMate: "Uchenna Anthony Chukwuemeka",
    runningMateAge: 48,
    runningMateGender: "M",
  },
  {
    party: "NRM",
    partyName: "National Rescue Movement",
    candidate: "Nkem Esther Okereke",
    candidateAge: 43,
    candidateGender: "F",
    runningMate: "Nasir Muhammed Sulaiman",
    runningMateAge: 35,
    runningMateGender: "M",
  },
  {
    party: "NDC",
    partyName: "Nigeria Democratic Congress",
    candidate: "Peter Gregory Obi",
    candidateAge: 65,
    candidateGender: "M",
    runningMate: "Musa Mohammed Rabiu Kwankwaso",
    runningMateAge: 69,
    runningMateGender: "M",
  },
  {
    party: "PDP",
    partyName: "Peoples Democratic Party",
    candidate: "Sandy Ojang Onor",
    candidateAge: 60,
    candidateGender: "M",
    runningMate: "Umaru Babangida",
    runningMateAge: 61,
    runningMateGender: "M",
  },
  {
    party: "PRP",
    partyName: "Peoples Redemption Party",
    candidate: "Donald Duke",
    candidateAge: 64,
    candidateGender: "M",
    runningMate: "Kabiru Rabiu",
    runningMateAge: 80,
    runningMateGender: "M",
  },
  {
    party: "SDP",
    partyName: "Social Democratic Party",
    candidate: "Adebayo Adewole Ebenezer",
    candidateAge: 54,
    candidateGender: "M",
    runningMate: "Usman Muhammed Bugaje",
    runningMateAge: 74,
    runningMateGender: "M",
  },
  {
    party: "YPP",
    partyName: "Young Progressives Party",
    candidate: "Peter Ada Agada",
    candidateAge: 54,
    candidateGender: "M",
    runningMate: "Patience Ndidi Key",
    runningMateAge: 52,
    runningMateGender: "F",
  },
  {
    party: "ZLP",
    partyName: "Zenith Labour Party",
    candidate: "Daniel Daberechukwu Nwanyanwu",
    candidateAge: 66,
    candidateGender: "M",
    runningMate: "Hassan Khalid",
    runningMateAge: 37,
    runningMateGender: "M",
  },
];

export default TICKETS_2027;
