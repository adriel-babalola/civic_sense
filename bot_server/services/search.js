import axios from "axios";

const TAVILY_URL = "https://api.tavily.com/search";

const DOMAINS = [
  "premiumtimesng.com",
  "punchng.com",
  "thecable.ng",
  "channelstv.com",
  "vanguardngr.com",
  "dailypost.ng",
];

export async function searchClaim(claim) {
  try {
    const response = await axios.post(
      TAVILY_URL,
      {
        api_key: process.env.TAVILY_API_KEY,
        query: `${claim} Nigeria`,
        search_depth: "basic",
        include_answer: true,
        max_results: 5,
        include_domains: DOMAINS,
      },
      { timeout: 10000 }
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
      .map(
        (r, i) =>
          `[${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`
      )
      .join("\n\n");

    return output;
  } catch (err) {
    console.error(`  Tavily search error: ${err.message}`);
    return "";
  }
}
