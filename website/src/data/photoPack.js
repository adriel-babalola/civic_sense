/**
 * Research photo pack: 30 portraits, 29 usable as images.
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
 * All 29 of them are wired into the site at the owner's instruction, and 3 of those
 * (Atiku, Kwankwaso, Barau Jibrin) additionally carry a verified open licence.
 * The other 26 were found by image search and came from X, news
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
 * 1 folder has no image at all: Cleopas Zuwoghe's file is a saved Bing results page, so
 * there is no photograph of him here.
 *
 * 21 of the 30 are not on a certified 2027 ticket in this dataset. They are serving
 * governors, senators and party chairs, which is a different dataset needing its
 * own verification model. Their `rosterId` is null, which is what stops a governor's
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
export const PHOTO_PACK = [
  {
    "order": 1,
    "folder": "01 - Bola Ahmed Tinubu",
    "packName": "Bola Ahmed Tinubu",
    "asset": "pack-bola-ahmed-tinubu",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://pbs.twimg.com/media/G-u2weMWwAAClNp.jpg",
    "rights": "X image URL surfaced in image search; official portrait appearance. Rights: not independently verified from the image host.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": "bola-ahmed-tinubu"
  },
  {
    "order": 2,
    "folder": "02 - Kashim Shettima",
    "packName": "Kashim Shettima",
    "asset": "pack-kashim-shettima",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://maaun.edu.ng/wp-content/uploads/2024/09/Shattima.jpg",
    "rights": "Maryam Abacha American University of Nigeria page; portrait released with an official birthday statement. Rights: copyright/permission not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": "kashim-shettima"
  },
  {
    "order": 3,
    "folder": "03 - Atiku Abubakar",
    "packName": "Atiku Abubakar",
    "asset": "pack-atiku-abubakar",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://commons.wikimedia.org/wiki/File:Atiku_Abubakar-2010_(cropped).jpg",
    "rights": "Wikimedia Commons: official Atiku portrait for 2011; author listed as Atiku Abubakar; CC BY 2.0.",
    "rightsStatus": "open-licence",
    "licence": "CC BY 2.0",
    "licenceUrl": "https://creativecommons.org/licenses/by/2.0/",
    "onCommons": true,
    "sourceIsStable": true,
    "rosterId": "atiku-abubakar"
  },
  {
    "order": 4,
    "folder": "04 - Rotimi Amaechi",
    "packName": "Rotimi Amaechi",
    "asset": "pack-rotimi-amaechi",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://4.bp.blogspot.com/-s_cpKBuc4ko/WYEfRKcNxwI/AAAAAAAAEOw/wblTfH1BTuQ1uZnR6bEEwpnctwE4WPFFwCPcBGAYYCw/s1600/Rt.%2BHon.%2BAmaechi.jpg",
    "rights": "Image surfaced from OnePage Africa article; formal portrait with Nigerian flag. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": "chibuike-rotimi-amaechi"
  },
  {
    "order": 5,
    "folder": "05 - Peter Obi",
    "packName": "Peter Obi",
    "asset": "pack-peter-obi",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://pbs.twimg.com/media/G9sF94pWIAAWt5H.jpg",
    "rights": "X image URL surfaced in image search; studio portrait. Rights: photographer/owner not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": "peter-gregory-obi"
  },
  {
    "order": 6,
    "folder": "06 - Rabiu Kwankwaso",
    "packName": "Rabiu Kwankwaso",
    "asset": "pack-rabiu-kwankwaso",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "250x250",
    "source": "https://commons.wikimedia.org/wiki/File:Rabiu_Kwankwaso.jpg",
    "rights": "Wikimedia Commons; VOA source; public-domain status in the US stated on Commons.",
    "rightsStatus": "open-licence",
    "licence": "Public domain (VOA release)",
    "licenceUrl": "https://commons.wikimedia.org/wiki/Template:PD-VOA",
    "onCommons": true,
    "sourceIsStable": true,
    "rosterId": "musa-mohammed-rabiu-kwankwaso"
  },
  {
    "order": 7,
    "folder": "07 - Seyi Makinde",
    "packName": "Seyi Makinde",
    "asset": "pack-seyi-makinde",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "316x316",
    "source": "https://tse3.mm.bing.net/th/id/OIP.O8vokM-uSF7mm5-4X_505wHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
    "rights": "X image URL surfaced in image search; formal portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": "oluseyi-abiodun-makinde"
  },
  {
    "order": 8,
    "folder": "08 - Sandy Onor",
    "packName": "Sandy Onor",
    "asset": "pack-sandy-onor",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://pbs.twimg.com/media/HJSAXzMXUAIW9Ne.jpg",
    "rights": "X image URL surfaced from TheCable post; portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": "sandy-ojang-onor"
  },
  {
    "order": 9,
    "folder": "09 - Nyesom Wike",
    "packName": "Nyesom Wike",
    "asset": "pack-nyesom-wike",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "443x443",
    "source": "https://www.nairaland.com/attachments/13776120_wike_jpega86e19de75660ef72edc5651055c0726",
    "rights": "Nairaland page reproducing a portrait described as Wike's official portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 10,
    "folder": "10 - Nentawe Yilwatda",
    "packName": "Nentawe Yilwatda",
    "asset": "pack-nentawe-yilwatda",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://apcpromisekept.com/assets/images/chairman/10.jpg",
    "rights": "APC-related official campaign/party site; labelled official portrait. Rights: site copyright/permission not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 11,
    "folder": "11 - David Mark",
    "packName": "David Mark",
    "asset": "pack-david-mark",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://nigeriareposit.nln.gov.ng/bitstreams/f6c7b9e7-357b-4e55-8b22-0373b2bee914/download",
    "rights": "The Sun Nigeria image; formal portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 12,
    "folder": "12 - Rauf Aregbesola",
    "packName": "Rauf Aregbesola",
    "asset": "pack-rauf-aregbesola",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://i0.wp.com/opinion.premiumtimesng.com/wp-content/files/sites/2/2018/11/Rauf-Aregbesola.jpg",
    "rights": "Premium Times image; portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 13,
    "folder": "13 - Cleopas Zuwoghe",
    "packName": "Cleopas Zuwoghe",
    "asset": null,
    "usable": false,
    "unusableReason": "not an image file",
    "lowResolution": false,
    "outputSize": null,
    "source": "https://www.bing.com/images/search?view=detailV2&ccid=LTY2EtDk&id=562345868C9B692B634D9F8B2A1CBD323AC4EC97&thid=OIP.LTY2EtDke9qsL0geLeQNvgHaHW&mediaurl=https%3a%2f%2flookaside.fbsbx.com%2flookaside%2fcrawler%2fmedia%2f%3fmedia_id%3d25009567368711147&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.2d363612d0e47bdaac2f481e2de40dbe%3frik%3dl%252bzEOjK9HCqLnw%26pid%3dImgRaw%26r%3d0&exph=709&expw=715&q=Cleopas+Zuwoghe+official+potrait&FORM=IRPRST&ck=26A54CB986B3F5E8B64F3E4A9ABCCA59&selectedIndex=0&itb=0",
    "rights": "INEC confirms Cleopas Moses Zuwoghe as NDC National Chairman, but a verifiable official portrait could not be located in the available search results. No image substituted.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": false,
    "rosterId": null
  },
  {
    "order": 14,
    "folder": "14 - Abdulrahman Mohammed",
    "packName": "Abdulrahman Mohammed",
    "asset": "pack-abdulrahman-mohammed",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "423x423",
    "source": "https://d1jcea4y7xhp7l.cloudfront.net/wp-content/uploads/2025/11/Abdulrahman-Mohammed.jpg",
    "rights": "The Sun Nigeria image; portrait of PDP acting chairman. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 15,
    "folder": "15 - Bala Mohammed",
    "packName": "Bala Mohammed",
    "asset": "pack-bala-mohammed",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "480x480",
    "source": "https://i0.wp.com/metoricpost.com/wp-content/uploads/2024/01/Bauchi-Gov.jpeg?resize=480%2C600&ssl=1",
    "rights": "Image surfaced in coverage of Bauchi State Governor; formal portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 16,
    "folder": "16 - Abdulaziz Yari",
    "packName": "Abdulaziz Yari",
    "asset": "pack-abdulaziz-yari",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://theinvisibleinsider.org.ng/wp-content/uploads/2023/12/WhatsApp-Image-2023-05-15-at-09.06.31.jpeg",
    "rights": "The Invisible Insider image; formal portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 17,
    "folder": "17 - Hope Uzodimma",
    "packName": "Hope Uzodimma",
    "asset": "pack-hope-uzodimma",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://hopeuzodinma.org/assets/logo-hope-uzodimma-DUuT6qIp.png",
    "rights": "Official-looking personal/government profile site; portrait. Rights: site copyright/permission not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 18,
    "folder": "18 - Godswill Akpabio",
    "packName": "Godswill Akpabio",
    "asset": "pack-godswill-akpabio",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "400x400",
    "source": "https://nass.gov.ng/mps/single/513",
    "rights": "National Assembly profile page containing his portrait. Rights: government-site reuse terms not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 19,
    "folder": "19 - Tajudeen Abbas",
    "packName": "Tajudeen Abbas",
    "asset": "pack-tajudeen-abbas",
    "usable": true,
    "unusableReason": null,
    "lowResolution": true,
    "outputSize": "132x132",
    "source": "https://officeofthespeaker.ng/uploads/news/hFeiSASe1AmqL6BhyRfY5wel5Dr2SwMZED4V0H8r.jpeg",
    "rights": "Office of the Speaker page; official portrait. Rights: government/office-site reuse terms not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 20,
    "folder": "20 - Femi Gbajabiamila",
    "packName": "Femi Gbajabiamila",
    "asset": "pack-femi-gbajabiamila",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "495x495",
    "source": "https://i0.wp.com/opinion.premiumtimesng.com/wp-content/files/sites/2/2016/05/Femi-Gbajabiamila.jpg?fit=640%2C495&ssl=1",
    "rights": "Premium Times image; formal headshot. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 21,
    "folder": "21 - Adams Oshiomhole",
    "packName": "Adams Oshiomhole",
    "asset": "pack-adams-oshiomhole",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://pbs.twimg.com/media/Fs2HguJX0AAD1Ax.jpg",
    "rights": "Official APC Nigeria X account image; office portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 22,
    "folder": "22 - Mai Mala Buni",
    "packName": "Mai Mala Buni",
    "asset": "pack-mai-mala-buni",
    "usable": true,
    "unusableReason": null,
    "lowResolution": true,
    "outputSize": "132x132",
    "source": "https://www.bing.com/images/search?view=detailV2&ccid=DRN%2fusk5&id=5A9CCBBF9485F89137A3F6DEC03B402E7204F6AE&thid=OIP.DRN_usk5MJyORD0-OE87wQHaJx&mediaurl=https%3a%2f%2fyobestate.gov.ng%2fwp-content%2fuploads%2f2024%2f12%2fBuni-Official-Picture.jpeg&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.0d137fbac939309c8e443d3e384f3bc1%3frik%3drvYEci5AO8De9g%26pid%3dImgRaw%26r%3d0&exph=2560&expw=1940&q=Mala+Buni+oficial+portrait&FORM=IRPRST&ck=691115DEA2F3B1CA461CE4DA448B9F0A&selectedIndex=1&itb=0",
    "rights": "Yobe State Office of Auditor-General site image; official portrait. Rights: government-site reuse terms not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": false,
    "rosterId": null
  },
  {
    "order": 23,
    "folder": "23 - Babajide Sanwo-Olu",
    "packName": "Babajide Sanwo-Olu",
    "asset": "pack-babajide-sanwo-olu",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://pbs.twimg.com/media/GdLF-vfXoAEJyTe.jpg",
    "rights": "Image surfaced from an official Lagos-related context; formal portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 24,
    "folder": "24 - Abba Kabir Yusuf",
    "packName": "Abba Kabir Yusuf",
    "asset": "pack-abba-kabir-yusuf",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://cdn.thenigerianvoice.com/images/content/912202531235_img_6802.jpeg",
    "rights": "Formal governor portrait reproduced by The Nigerian Voice. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": "kabiru-yusuf"
  },
  {
    "order": 25,
    "folder": "25 - Alex Otti",
    "packName": "Alex Otti",
    "asset": "pack-alex-otti",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://pbs.twimg.com/media/GzXjkbOXMAAlTFN.jpg",
    "rights": "X image from Alex Otti's account; formal governor portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 26,
    "folder": "26 - Charles Soludo",
    "packName": "Charles Soludo",
    "asset": "pack-charles-soludo",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://innovation.anambrastate.gov.ng/page/leadership",
    "rights": "Anambra State government leadership page containing portrait. Rights: government-site reuse terms not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 27,
    "folder": "27 - Siminalayi Fubara",
    "packName": "Siminalayi Fubara",
    "asset": "pack-siminalayi-fubara",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "400x400",
    "source": "https://pbs.twimg.com/profile_images/1745411480114114560/a-LU4kTE_400x400.jpg",
    "rights": "Governor's X profile image; official profile portrait. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 28,
    "folder": "28 - Umo Eno",
    "packName": "Umo Eno",
    "asset": "pack-umo-eno",
    "usable": true,
    "unusableReason": null,
    "lowResolution": true,
    "outputSize": "132x132",
    "source": "https://www.bing.com/images/search?view=detailV2&ccid=3X1Zogo3&id=88F0EFEBF63C5A04A7E49E19E0DEDBE008C27E33&thid=OIP.3X1Zogo3a8jTfuy-W1KSgAHaKd&mediaurl=https%3a%2f%2fpuoreports.ng%2fwp-content%2fuploads%2f2023%2f06%2fGov-Eno-akwa-ibom.jpg&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.dd7d59a20a376bc8d37eecbe5b529280%3frik%3dM37CCODb3uAZng%26pid%3dImgRaw%26r%3d0&exph=1280&expw=906&q=umo+eno+political+potrait&FORM=IRPRST&ck=172B1CD23617CEDCF648A9DCA93A426A&selectedIndex=1&itb=0",
    "rights": "Akwa Ibom State Government portal containing governor portrait. Rights: government-site reuse terms not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": false,
    "rosterId": null
  },
  {
    "order": 29,
    "folder": "29 - Ademola Adeleke",
    "packName": "Ademola Adeleke",
    "asset": "pack-ademola-adeleke",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "512x512",
    "source": "https://trumpetmediagroup.com/downloads/6899/download/Governor%20Ademola%20Adeleke%203.jpg?cb=ade20639e79ed70510a1268b0173d282&w=743",
    "rights": "Image from article showing governor in Osun Government House. Rights: not independently verified.",
    "rightsStatus": "unverified",
    "licence": null,
    "licenceUrl": null,
    "onCommons": false,
    "sourceIsStable": true,
    "rosterId": null
  },
  {
    "order": 30,
    "folder": "30 - Barau Jibrin",
    "packName": "Barau Jibrin",
    "asset": "pack-barau-jibrin",
    "usable": true,
    "unusableReason": null,
    "lowResolution": false,
    "outputSize": "500x500",
    "source": "https://commons.wikimedia.org/wiki/File:Barau_I_Jibrin_cropped_portrait.jpg",
    "rights": "Wikimedia Commons; author Okohamodu; CC BY 4.0.",
    "rightsStatus": "open-licence",
    "licence": "CC BY 4.0",
    "licenceUrl": "https://creativecommons.org/licenses/by/4.0/",
    "onCommons": true,
    "sourceIsStable": true,
    "rosterId": null
  }
];

/**
 * Credit entries for photos.js, keyed by asset basename.
 *
 * Merged in after the hand-curated Wikimedia entries. They never displace one:
 * for Atiku and Kwankwaso there is a properly licensed original already in
 * photos.js, and that is the copy the site uses.
 */
export const PACK_PHOTO_CREDITS = Object.fromEntries([
  [
    "pack-bola-ahmed-tinubu",
    {
      "file": "pack-bola-ahmed-tinubu",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://pbs.twimg.com/media/G-u2weMWwAAClNp.jpg",
      "sourceLabel": "original source",
      "title": "Bola Ahmed Tinubu",
      "taken": null,
      "packFolder": "01 - Bola Ahmed Tinubu",
      "unverified": true
    }
  ],
  [
    "pack-kashim-shettima",
    {
      "file": "pack-kashim-shettima",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://maaun.edu.ng/wp-content/uploads/2024/09/Shattima.jpg",
      "sourceLabel": "original source",
      "title": "Kashim Shettima",
      "taken": null,
      "packFolder": "02 - Kashim Shettima",
      "unverified": true
    }
  ],
  [
    "pack-atiku-abubakar",
    {
      "file": "pack-atiku-abubakar",
      "author": "Unknown",
      "license": "CC BY 2.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Atiku_Abubakar-2010_(cropped).jpg",
      "sourceLabel": "Wikimedia Commons",
      "title": "Atiku Abubakar",
      "taken": null,
      "packFolder": "03 - Atiku Abubakar"
    }
  ],
  [
    "pack-rotimi-amaechi",
    {
      "file": "pack-rotimi-amaechi",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://4.bp.blogspot.com/-s_cpKBuc4ko/WYEfRKcNxwI/AAAAAAAAEOw/wblTfH1BTuQ1uZnR6bEEwpnctwE4WPFFwCPcBGAYYCw/s1600/Rt.%2BHon.%2BAmaechi.jpg",
      "sourceLabel": "original source",
      "title": "Rotimi Amaechi",
      "taken": null,
      "packFolder": "04 - Rotimi Amaechi",
      "unverified": true
    }
  ],
  [
    "pack-peter-obi",
    {
      "file": "pack-peter-obi",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://pbs.twimg.com/media/G9sF94pWIAAWt5H.jpg",
      "sourceLabel": "original source",
      "title": "Peter Obi",
      "taken": null,
      "packFolder": "05 - Peter Obi",
      "unverified": true
    }
  ],
  [
    "pack-rabiu-kwankwaso",
    {
      "file": "pack-rabiu-kwankwaso",
      "author": "Unknown",
      "license": "Public domain (VOA release)",
      "licenseUrl": "https://commons.wikimedia.org/wiki/Template:PD-VOA",
      "source": "https://commons.wikimedia.org/wiki/File:Rabiu_Kwankwaso.jpg",
      "sourceLabel": "Wikimedia Commons",
      "title": "Rabiu Kwankwaso",
      "taken": null,
      "packFolder": "06 - Rabiu Kwankwaso"
    }
  ],
  [
    "pack-seyi-makinde",
    {
      "file": "pack-seyi-makinde",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://tse3.mm.bing.net/th/id/OIP.O8vokM-uSF7mm5-4X_505wHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      "sourceLabel": "original source",
      "title": "Seyi Makinde",
      "taken": null,
      "packFolder": "07 - Seyi Makinde",
      "unverified": true
    }
  ],
  [
    "pack-sandy-onor",
    {
      "file": "pack-sandy-onor",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://pbs.twimg.com/media/HJSAXzMXUAIW9Ne.jpg",
      "sourceLabel": "original source",
      "title": "Sandy Onor",
      "taken": null,
      "packFolder": "08 - Sandy Onor",
      "unverified": true
    }
  ],
  [
    "pack-nyesom-wike",
    {
      "file": "pack-nyesom-wike",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://www.nairaland.com/attachments/13776120_wike_jpega86e19de75660ef72edc5651055c0726",
      "sourceLabel": "original source",
      "title": "Nyesom Wike",
      "taken": null,
      "packFolder": "09 - Nyesom Wike",
      "unverified": true
    }
  ],
  [
    "pack-nentawe-yilwatda",
    {
      "file": "pack-nentawe-yilwatda",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://apcpromisekept.com/assets/images/chairman/10.jpg",
      "sourceLabel": "original source",
      "title": "Nentawe Yilwatda",
      "taken": null,
      "packFolder": "10 - Nentawe Yilwatda",
      "unverified": true
    }
  ],
  [
    "pack-david-mark",
    {
      "file": "pack-david-mark",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://nigeriareposit.nln.gov.ng/bitstreams/f6c7b9e7-357b-4e55-8b22-0373b2bee914/download",
      "sourceLabel": "original source",
      "title": "David Mark",
      "taken": null,
      "packFolder": "11 - David Mark",
      "unverified": true
    }
  ],
  [
    "pack-rauf-aregbesola",
    {
      "file": "pack-rauf-aregbesola",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://i0.wp.com/opinion.premiumtimesng.com/wp-content/files/sites/2/2018/11/Rauf-Aregbesola.jpg",
      "sourceLabel": "original source",
      "title": "Rauf Aregbesola",
      "taken": null,
      "packFolder": "12 - Rauf Aregbesola",
      "unverified": true
    }
  ],
  [
    "pack-abdulrahman-mohammed",
    {
      "file": "pack-abdulrahman-mohammed",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://d1jcea4y7xhp7l.cloudfront.net/wp-content/uploads/2025/11/Abdulrahman-Mohammed.jpg",
      "sourceLabel": "original source",
      "title": "Abdulrahman Mohammed",
      "taken": null,
      "packFolder": "14 - Abdulrahman Mohammed",
      "unverified": true
    }
  ],
  [
    "pack-bala-mohammed",
    {
      "file": "pack-bala-mohammed",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://i0.wp.com/metoricpost.com/wp-content/uploads/2024/01/Bauchi-Gov.jpeg?resize=480%2C600&ssl=1",
      "sourceLabel": "original source",
      "title": "Bala Mohammed",
      "taken": null,
      "packFolder": "15 - Bala Mohammed",
      "unverified": true
    }
  ],
  [
    "pack-abdulaziz-yari",
    {
      "file": "pack-abdulaziz-yari",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://theinvisibleinsider.org.ng/wp-content/uploads/2023/12/WhatsApp-Image-2023-05-15-at-09.06.31.jpeg",
      "sourceLabel": "original source",
      "title": "Abdulaziz Yari",
      "taken": null,
      "packFolder": "16 - Abdulaziz Yari",
      "unverified": true
    }
  ],
  [
    "pack-hope-uzodimma",
    {
      "file": "pack-hope-uzodimma",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://hopeuzodinma.org/assets/logo-hope-uzodimma-DUuT6qIp.png",
      "sourceLabel": "original source",
      "title": "Hope Uzodimma",
      "taken": null,
      "packFolder": "17 - Hope Uzodimma",
      "unverified": true
    }
  ],
  [
    "pack-godswill-akpabio",
    {
      "file": "pack-godswill-akpabio",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://nass.gov.ng/mps/single/513",
      "sourceLabel": "original source",
      "title": "Godswill Akpabio",
      "taken": null,
      "packFolder": "18 - Godswill Akpabio",
      "unverified": true
    }
  ],
  [
    "pack-tajudeen-abbas",
    {
      "file": "pack-tajudeen-abbas",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://officeofthespeaker.ng/uploads/news/hFeiSASe1AmqL6BhyRfY5wel5Dr2SwMZED4V0H8r.jpeg",
      "sourceLabel": "original source",
      "title": "Tajudeen Abbas",
      "taken": null,
      "packFolder": "19 - Tajudeen Abbas",
      "unverified": true,
      "lowResolution": true
    }
  ],
  [
    "pack-femi-gbajabiamila",
    {
      "file": "pack-femi-gbajabiamila",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://i0.wp.com/opinion.premiumtimesng.com/wp-content/files/sites/2/2016/05/Femi-Gbajabiamila.jpg?fit=640%2C495&ssl=1",
      "sourceLabel": "original source",
      "title": "Femi Gbajabiamila",
      "taken": null,
      "packFolder": "20 - Femi Gbajabiamila",
      "unverified": true
    }
  ],
  [
    "pack-adams-oshiomhole",
    {
      "file": "pack-adams-oshiomhole",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://pbs.twimg.com/media/Fs2HguJX0AAD1Ax.jpg",
      "sourceLabel": "original source",
      "title": "Adams Oshiomhole",
      "taken": null,
      "packFolder": "21 - Adams Oshiomhole",
      "unverified": true
    }
  ],
  [
    "pack-mai-mala-buni",
    {
      "file": "pack-mai-mala-buni",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://www.bing.com/images/search?view=detailV2&ccid=DRN%2fusk5&id=5A9CCBBF9485F89137A3F6DEC03B402E7204F6AE&thid=OIP.DRN_usk5MJyORD0-OE87wQHaJx&mediaurl=https%3a%2f%2fyobestate.gov.ng%2fwp-content%2fuploads%2f2024%2f12%2fBuni-Official-Picture.jpeg&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.0d137fbac939309c8e443d3e384f3bc1%3frik%3drvYEci5AO8De9g%26pid%3dImgRaw%26r%3d0&exph=2560&expw=1940&q=Mala+Buni+oficial+portrait&FORM=IRPRST&ck=691115DEA2F3B1CA461CE4DA448B9F0A&selectedIndex=1&itb=0",
      "sourceLabel": "original source",
      "title": "Mai Mala Buni",
      "taken": null,
      "packFolder": "22 - Mai Mala Buni",
      "unverified": true,
      "lowResolution": true,
      "sourceUnstable": true
    }
  ],
  [
    "pack-babajide-sanwo-olu",
    {
      "file": "pack-babajide-sanwo-olu",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://pbs.twimg.com/media/GdLF-vfXoAEJyTe.jpg",
      "sourceLabel": "original source",
      "title": "Babajide Sanwo-Olu",
      "taken": null,
      "packFolder": "23 - Babajide Sanwo-Olu",
      "unverified": true
    }
  ],
  [
    "pack-abba-kabir-yusuf",
    {
      "file": "pack-abba-kabir-yusuf",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://cdn.thenigerianvoice.com/images/content/912202531235_img_6802.jpeg",
      "sourceLabel": "original source",
      "title": "Abba Kabir Yusuf",
      "taken": null,
      "packFolder": "24 - Abba Kabir Yusuf",
      "unverified": true
    }
  ],
  [
    "pack-alex-otti",
    {
      "file": "pack-alex-otti",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://pbs.twimg.com/media/GzXjkbOXMAAlTFN.jpg",
      "sourceLabel": "original source",
      "title": "Alex Otti",
      "taken": null,
      "packFolder": "25 - Alex Otti",
      "unverified": true
    }
  ],
  [
    "pack-charles-soludo",
    {
      "file": "pack-charles-soludo",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://innovation.anambrastate.gov.ng/page/leadership",
      "sourceLabel": "original source",
      "title": "Charles Soludo",
      "taken": null,
      "packFolder": "26 - Charles Soludo",
      "unverified": true
    }
  ],
  [
    "pack-siminalayi-fubara",
    {
      "file": "pack-siminalayi-fubara",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://pbs.twimg.com/profile_images/1745411480114114560/a-LU4kTE_400x400.jpg",
      "sourceLabel": "original source",
      "title": "Siminalayi Fubara",
      "taken": null,
      "packFolder": "27 - Siminalayi Fubara",
      "unverified": true
    }
  ],
  [
    "pack-umo-eno",
    {
      "file": "pack-umo-eno",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://www.bing.com/images/search?view=detailV2&ccid=3X1Zogo3&id=88F0EFEBF63C5A04A7E49E19E0DEDBE008C27E33&thid=OIP.3X1Zogo3a8jTfuy-W1KSgAHaKd&mediaurl=https%3a%2f%2fpuoreports.ng%2fwp-content%2fuploads%2f2023%2f06%2fGov-Eno-akwa-ibom.jpg&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.dd7d59a20a376bc8d37eecbe5b529280%3frik%3dM37CCODb3uAZng%26pid%3dImgRaw%26r%3d0&exph=1280&expw=906&q=umo+eno+political+potrait&FORM=IRPRST&ck=172B1CD23617CEDCF648A9DCA93A426A&selectedIndex=1&itb=0",
      "sourceLabel": "original source",
      "title": "Umo Eno",
      "taken": null,
      "packFolder": "28 - Umo Eno",
      "unverified": true,
      "lowResolution": true,
      "sourceUnstable": true
    }
  ],
  [
    "pack-ademola-adeleke",
    {
      "file": "pack-ademola-adeleke",
      "author": "Unknown",
      "license": "Licence not verified",
      "licenseUrl": null,
      "source": "https://trumpetmediagroup.com/downloads/6899/download/Governor%20Ademola%20Adeleke%203.jpg?cb=ade20639e79ed70510a1268b0173d282&w=743",
      "sourceLabel": "original source",
      "title": "Ademola Adeleke",
      "taken": null,
      "packFolder": "29 - Ademola Adeleke",
      "unverified": true
    }
  ],
  [
    "pack-barau-jibrin",
    {
      "file": "pack-barau-jibrin",
      "author": "Unknown",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
      "source": "https://commons.wikimedia.org/wiki/File:Barau_I_Jibrin_cropped_portrait.jpg",
      "sourceLabel": "Wikimedia Commons",
      "title": "Barau Jibrin",
      "taken": null,
      "packFolder": "30 - Barau Jibrin"
    }
  ]
]);

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
  /(^|.)(premiumtimesng.com|thesun.ng|vanguardngr.com|dailytrust.com|thisdaylive.com|nairaland.com|metoricpost.com|theinvisibleinsider.org.ng|nigerianvoice.com|trumpetmediagroup.com|blogspot.com|lookaside.fb.com)/i.test(
    entry.source,
  ),
);

export default PHOTO_PACK;
