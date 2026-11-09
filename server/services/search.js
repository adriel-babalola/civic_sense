import axios from "axios";

const TAVILY_URL = "https://api.tavily.com/search";

const DOMAINS = [
  "premiumtimesng.com",
  "punchng.com",
  "thecable.ng",
  "channelstv.com",
  "vanguardngr.com",
  "dailypost.ng",
  "dailytrust.com",
  "leadership.ng",
  "tribuneonlineng.com",
  "businessday.ng",
  "pmnewsnigeria.com",
  "ripplesnigeria.com",
  "informationng.com",
  "dubawa.org",
  "factcheckhub.com",
  "factcheckafrica.net",
];

export async function searchClaim(claim, extraQuery = "") {
  if (!process.env.TAVILY_API_KEY) return "";
  try {
    const base = String(claim || "").trim();
    let query = String(extraQuery || base).trim();
    if (!query) query = base;
    // status questions benefit from recency cues; don't over-constrain
    if (/\b(dead|alive|death|died|resign|arrest|appoint|elected|sack)\b/i.test(base) && !/\b(2026|2025|latest|today|recent)\b/i.test(query)) {
      query = `${query} latest`;
    }
    if (query && !/nigeria/i.test(query)) query = `${query} Nigeria`;
    const response = await axios.post(
      TAVILY_URL,
      {
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "basic",
        include_answer: true,
        max_results: 8,
        include_domains: DOMAINS,
      },
      { timeout: 9000 }
    );

    const data = response.data;
    const results = data.results || [];
    console.log(`  Tavily returned ${results.length} results`);

    if (results.length === 0) return "";

    let output = "";
    if (data.answer) {
      output += `Summary: ${data.answer}\n\n`;
    }

    output += results
      .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`)
      .join("\n\n");

    return output;
  } catch (err) {
    console.error(`  Tavily search error: ${err.message}`);
    return "";
  }
}
