import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function AdminWalkins() {
  const [turfs, setTurfs] = useState([]);
  const [turfId, setTurfId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paid, setPaid] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.get("/turfs").then((data) => {
      setTurfs(data);
      if (data[0]) setTurfId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!turfId || !date) return;
    api.get(`/slots?turfId=${turfId}&date=${date}`).then(setSlots);
  }, [turfId, date]);

  async function submit() {
    setError(""); setSuccess("");
    try {
      const data = await api.post("/admin/walkins", { turfId, slotId, customerName: name, customerPhone: phone, paymentMethod, paid });
      setSuccess(`Booking created: ${data.bookingRef}`);
      setName(""); setPhone(""); setSlotId("");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand">Create Walk-in Booking</h1>
      </div>

      <select value={turfId} onChange={(e) => setTurfId(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10">
        {turfs.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10" />

      <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10">
        <option value="">Select slot</option>
              {slots.filter((s) => s.bookable).map((s) => (
          <option key={s.id} value={s.id}>
            {new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — ₹{s.price}
          </option>
        ))}
      </select>

      <input placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10" />
      <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10" />

      <div className="flex gap-2 mb-4">
        <button onClick={() => setPaymentMethod("CASH")} className={`flex-1 p-3 rounded-xl border ${paymentMethod === "CASH" ? "border-brand bg-brand/20" : "border-white/10 bg-surface-card"}`}>Cash</button>
        <button onClick={() => setPaymentMethod("UPI")} className={`flex-1 p-3 rounded-xl border ${paymentMethod === "UPI" ? "border-brand bg-brand/20" : "border-white/10 bg-surface-card"}`}>UPI</button>
      </div>

      <label className="flex items-center gap-2 mb-6 text-sm">
        <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
        Already paid
      </label>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      {success && <p className="text-brand text-sm mb-4">{success}</p>}

      <button onClick={submit} className="w-full p-4 rounded-xl bg-brand font-semibold text-black">Create Booking</button>
    </main>
  );
}
