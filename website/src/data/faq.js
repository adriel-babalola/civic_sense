/** CivicSense website — FAQ content. */

export const FAQS = [
  {
    id: "what",
    question: "What is CivicSense actually for?",
    answer:
      "Truth awareness. We are a youth and mass sensitisation platform: the work is helping young Nigerians and the wider public check what reaches them before they believe it, and reach decisions they can stand behind. Checking individual claims is how that is done, not the whole point of it. We are not in the business of telling anyone what to think, only of making sure the evidence is in their hands.",
  },
  {
    id: "whatsapp",
    question: "How do I use the WhatsApp bot?",
    answer:
      "Save the CivicSense number in your phone, open WhatsApp and send any political claim as a message. You can also forward a screenshot of a poster or a news clip and the bot will read the claim out of the image. The reply comes back in the same chat, usually in under 30 seconds. There is nothing to install and no account to create.",
  },
  {
    id: "telegram",
    question: "Is there a Telegram bot too?",
    answer:
      "Yes. The same fact-checking pipeline runs on Telegram, including image claims. Message the bot directly and it will reply in the same thread.",
  },
  {
    id: "accuracy",
    question: "How accurate is the verdict?",
    answer:
      "The bot will only return VERIFIED or FALSE when more than one independent source agrees. When a single source backs a claim it leans toward MISLEADING or UNVERIFIED rather than overstating certainty. Every verdict shows the evidence it was drawn from, so you can read the reasoning and judge it yourself. It is a research aid and a teaching tool, not an authority, and we would rather it taught you to check the next claim yourself.",
  },
  {
    id: "languages",
    question: "Which languages are supported?",
    answer:
      "English today. Yoruba, Igbo and Hausa support is planned. The pipeline already retrieves evidence independently of the language of the claim, so this is mainly a matter of matching detection and reply generation.",
  },
  {
    id: "reports",
    question: "What happens after I submit a report?",
    answer:
      "Your report enters a moderation queue. A moderator checks it against news reports and, where relevant, official statements. Only reports that are corroborated get published on the incident map, tagged with the state and local government area. Nothing you submit appears on the map automatically.",
  },
  {
    id: "anonymous",
    question: "Can I report anonymously?",
    answer:
      "Yes, and there is no field on the form that could identify you. No name, no email, no phone number. You can also submit from a browser with cookies and tracking disabled, and nothing about you is attached to the report.",
  },
  {
    id: "moderation",
    question: "How are reports verified before they are published?",
    answer:
      "Each report is checked against independent news coverage. Reports confirmed by multiple outlets are marked corroborated. Reports confirmed by a single credible outlet or an official statement are marked journalistic and published with that source attributed. Reports we cannot confirm are not published.",
  },
  {
    id: "privacy",
    question: "Is my data safe?",
    answer:
      "The report form collects only what an incident report needs: what happened, which state and LGA, and a written description. We do not ask for your name, email or phone number, we do not run analytics or advertising trackers, and we strip location and device metadata from evidence images in your browser before upload. The full policy is on the privacy page.",
  },
  {
    id: "data",
    question: "Who is behind CivicSense?",
    answer:
      "A small team of Nigerian engineers and researchers. We do not publish individual names on this site, and we are reachable only through a single anonymous email address.",
  },
  {
    id: "corrections",
    question: "What if a verdict is wrong?",
    answer:
      "It happens. Verdicts are generated from retrieved evidence, and evidence has gaps. If you can show that a verdict is based on a bad source, contact us and we will re-run the check and correct the record. A corrected verdict is more useful to you than a defended one.",
  },
  {
    id: "offline",
    question: "Can I use this without data?",
    answer:
      "No. The bot searches live news sources, so it needs a connection. The incident map and the politician directory are static pages and will load, but verdicts require a network round trip.",
  },
  {
    id: "cost",
    question: "Does it cost anything?",
    answer:
      "Nothing, and there is nothing to buy. The WhatsApp number, this website and the incident map are free to use.",
  },
];

export default FAQS;
