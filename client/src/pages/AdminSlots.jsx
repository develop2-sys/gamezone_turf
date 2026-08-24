import { useEffect, useState } from "react";
import { api } from "../api.js";
import Spinner from "../components/Spinner.jsx";

export default function AdminSlots() {
  const [turfs, setTurfs] = useState([]);
  const [turfId, setTurfId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [priceInput, setPriceInput] = useState("");

  useEffect(() => {
    api.get("/turfs").then((data) => {
      setTurfs(data);
      if (data[0]) setTurfId(data[0].id);
    });
  }, []);

  async function load() {
    if (!turfId || !date) return;
    try {
      setSlots(await api.get(`/slots?turfId=${turfId}&date=${date}`));
    } catch {
      // keep last known state
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 15000);
    return () => clearInterval(interval);
  }, [turfId, date]);

  async function toggleBlock(slotId, current) {
    const status = current === "BLOCKED" ? "AVAILABLE" : "BLOCKED";
    await api.patch("/admin/slots", { slotId, status });
    load();
  }

  function startEdit(slot) {
    setEditingId(slot.id);
    setPriceInput(String(slot.price));
  }

  async function savePrice(slotId) {
    const price = Number(priceInput);
    if (!price || price <= 0) return;
    await api.patch("/admin/slots", { slotId, price });
    setEditingId(null);
    load();
  }

  function displayState(s) {
    if (s.status === "AVAILABLE" && !s.bookable) return "PASSED";
    return s.status;
  }

  const colors = {
    AVAILABLE: "border-status-available/40 bg-status-available/10 text-status-available",
    PENDING: "border-status-pending/40 bg-status-pending/10 text-status-pending",
    BOOKED: "border-status-booked/40 bg-status-booked/10 text-status-booked",
    BLOCKED: "border-status-blocked/40 bg-status-blocked/10 text-status-blocked",
    PASSED: "border-white/10 bg-white/[0.03] text-gray-600",
  };
  const icons = { AVAILABLE: "●", PENDING: "◐", BOOKED: "■", BLOCKED: "▪", PASSED: "○" };

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-brand mb-6 tracking-wide">SLOT AVAILABILITY</h1>

      <div className="flex gap-2 mb-6">
        <select value={turfId} onChange={(e) => setTurfId(e.target.value)} className="flex-1 p-3 rounded-xl bg-surface-card border border-white/10 focus:border-brand outline-none">
          {turfs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 p-3 rounded-xl bg-surface-card border border-white/10 focus:border-brand outline-none" />
      </div>

      {slots === null ? (
        <Spinner label="Loading slots..." />
      ) : (
        <div className="space-y-2">
          {slots.map((s) => {
            const state = displayState(s);
            return (
              <div key={s.id} className={`flex justify-between items-center p-3 rounded-xl border text-sm ${colors[state]}`}>
                <span className="flex items-center gap-2 font-ubuntu">
                  <span aria-hidden="true">{icons[state]}</span>
                  {new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —
                  {editingId === s.id ? (
                    <>
                      <input
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        inputMode="numeric"
                        className="w-16 px-1 py-0.5 rounded bg-black/40 border border-white/20 text-white"
                        autoFocus
                      />
                      <button onClick={() => savePrice(s.id)} className="underline">Save</button>
                      <button onClick={() => setEditingId(null)} className="underline">Cancel</button>
                    </>
                  ) : (
                    <>
                      ₹{s.price}
                      {state !== "PASSED" && (
                        <button onClick={() => startEdit(s)} className="underline text-xs">Edit</button>
                      )}
                    </>
                  )}
                  — {state === "PASSED" ? "Passed" : s.status}
                </span>
                {(s.status === "AVAILABLE" || s.status === "BLOCKED") && state !== "PASSED" && (
                  <button onClick={() => toggleBlock(s.id, s.status)} className="text-xs underline shrink-0 ml-2">
                    {s.status === "BLOCKED" ? "Unblock" : "Block"}
                  </button>
                )}
              </div>
            );
          })}
          {slots.length === 0 && <p className="text-gray-500 text-sm text-center py-10">No slots for this date.</p>}
        </div>
      )}
    </>
  );
}