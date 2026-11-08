import { useEffect, useState } from "react";
import { Button } from "../../components/shared/Button";
import { fetchAdminFeedback, updateAdminFeedbackStatus } from "../../services/adminApi";
import { cn } from "../../utils/cn";

const TABS = ["", "new", "reviewed", "archived"];
export function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("new");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminFeedback({ status, limit: 50 });
      setItems(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status]);
  const setItemStatus = async (id, next) => {
    await updateAdminFeedbackStatus(id, next);
    await load();
  };
  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold text-white">Feedback</h1><p className="text-xs text-fg-muted">User feedback (email optional).</p></div>
      <div className="flex gap-1">{TABS.map(t=> <button key={t||"all"} onClick={()=>setStatus(t)} className={cn("rounded-lg px-3 py-1.5 text-xs", status===t?"bg-white/10 text-white":"text-fg-muted hover:bg-white/5")}>{t||"all"}</button>)}</div>
      <div className="rounded-xl border border-white/[0.08] bg-[#121212]">
        {loading ? <div className="p-6 text-sm text-fg-muted">Loading...</div> : items.length ? items.map(item => (
          <div key={item._id} className="border-b border-white/[0.06] p-4 last:border-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white">{item.message}</p>
                <p className="mt-1 text-xs text-fg-muted">{item.email || "No email"} · {item.page || "unknown page"} · {new Date(item.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {status !== "reviewed" && <Button size="sm" variant="secondary" onClick={()=>setItemStatus(item._id,"reviewed")}>Reviewed</Button>}
                {status !== "archived" && <Button size="sm" variant="secondary" onClick={()=>setItemStatus(item._id,"archived")}>Archive</Button>}
                {status !== "new" && <Button size="sm" variant="secondary" onClick={()=>setItemStatus(item._id,"new")}>New</Button>}
              </div>
            </div>
          </div>
        )) : <div className="p-6 text-sm text-fg-muted">No feedback.</div>}
      </div>
    </div>
  );
}
export default AdminFeedback;
