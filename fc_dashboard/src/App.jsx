import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import ConflictTracker from "./pages/ConflictTracker";
import Reports from "./pages/Reports";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { WHATSAPP_NUMBER } from "./config";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="h-screen overflow-hidden bg-[#0A0A0A]">
        <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-3 sm:px-6 bg-[#0A0A0A] border-b border-[#1E1E1E]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-[#6B7280] hover:text-white transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-bold text-white tracking-tight">
              CivicSense
            </h1>
            <span className="text-xs text-[#6B7280] hidden sm:inline">
              Send a rumour. Get the truth back.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Live
            </span>
            <span className="text-xs text-[#6B7280] max-sm:hidden">{WHATSAPP_NUMBER}</span>
          </div>
        </header>

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="md:ml-64 ml-0 h-full pt-14 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/conflict" element={<ConflictTracker />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
