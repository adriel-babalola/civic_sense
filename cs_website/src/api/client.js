const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function submitReport(data) {
  const res = await fetch(`${API_BASE}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/api/incidents`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchReports(status) {
  const q = status ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE}/api/reports${q}`);
  const json = await res.json();
  return json.data || [];
}

export async function approveReport(id) {
  const res = await fetch(`${API_BASE}/api/reports/${id}/approve`, { method: "PATCH" });
  return res.json();
}

export async function rejectReport(id) {
  const res = await fetch(`${API_BASE}/api/reports/${id}/reject`, { method: "PATCH" });
  return res.json();
}
