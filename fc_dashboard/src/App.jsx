import React, { useState, useEffect } from "react";

const VERDICT_COLORS = {
  VERIFIED: "bg-green-100 text-green-800 border-green-300",
  MISLEADING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  FALSE: "bg-red-100 text-red-800 border-red-300",
  UNVERIFIED: "bg-gray-100 text-gray-800 border-gray-300",
};

function App() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChecks() {
      try {
        const res = await fetch(
          "https://civicsense-bot-production.up.railway.app/api/fact-checks"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setChecks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchChecks();
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-green-700 text-white py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">CivicSense</h1>
          <p className="text-green-200 mt-1">
            Live fact-check feed — Nigerian civic claims verified by AI
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <p className="text-gray-500 text-center py-12">Loading fact-checks...</p>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Could not load fact-checks: {error}
          </div>
        )}
        {!loading && !error && checks.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            No fact-checks yet. Send a claim to the WhatsApp bot!
          </p>
        )}
        {!loading && checks.length > 0 && (
          <div className="space-y-4">
            {checks.map((c) => (
              <div
                key={c._id}
                className="bg-white border rounded-lg p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-gray-900 font-medium flex-1">
                    "{c.claim}"
                  </p>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-sm font-semibold border ${
                      VERDICT_COLORS[c.verdict?.replace(/[*\n]/g, "").match(/VERIFIED|MISLEADING|FALSE|UNVERIFIED/)?.[0]] ||
                      "bg-gray-100 text-gray-800 border-gray-300"
                    }`}
                  >
                    {c.verdict
                      ?.replace(/[*\n]/g, "")
                      .match(/VERIFIED|MISLEADING|FALSE|UNVERIFIED/)?.[0] || "Unknown"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{c.verdict}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(c.timestamp).toLocaleString("en-NG")}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-gray-400 text-sm py-6">
        Built for BuildVerse 2026
      </footer>
    </div>
  );
}

export default App;
