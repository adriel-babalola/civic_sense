import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import ConflictTracker from "./pages/ConflictTracker";
import Reports from "./pages/Reports";
import { API_BASE } from "./config";

async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/api/factchecks`);
    const json = await res.json();
    return json.data?.length || 0;
  } catch {
    return 0;
  }
}

export default function App() {
  const [stats, setStats] = useState(0);

  useEffect(() => {
    fetchStats().then(setStats);
    const interval = setInterval(() => fetchStats().then(setStats), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-surface">
        <Sidebar stats={stats} />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/conflict" element={<ConflictTracker />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
