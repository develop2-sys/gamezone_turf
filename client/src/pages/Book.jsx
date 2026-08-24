import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Book() {
  const navigate = useNavigate();
  const [turfs, setTurfs] = useState([]);
  const [turfId, setTurfId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/turfs").then((data) => {
      setTurfs(data);
      if (data[0]) setTurfId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!turfId || !date) return;
    setSlots([]);
    setSlotId("");
    api.get(`/slots?turfId=${turfId}&date=${date}`).then(setSlots);
  }, [turfId, date]);

  async function submit() {
    setError("");
    if (!slotId) return setError("Please select a slot.");
    if (!name.trim()) return setError("Name is required.");
    setLoading(true);
    try {
      const data = await api.post("/bookings", { turfId, slotId, customerName: name, customerPhone: phone, paymentMethod });
      navigate(`/booking/${data.bookingId}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand mb-6">BOOK YOUR TURF SLOT</h1>

     

      <label className="block text-sm mb-1">Date</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10" />

      <label className="block text-sm mb-1">Slot</label>
      


      <div className="grid grid-cols-2 gap-2 mb-4">
        {slots.map((s) => {
          // Belt-and-suspenders: disable if the server says so, OR if the
          // slot's start time has already passed according to this device's clock.
          const isPast = new Date(s.startTime).getTime() <= Date.now();
          const disabled = !s.bookable || isPast;
          return (
          <button
            key={s.id}
            disabled={disabled}
            onClick={() => setSlotId(s.id)}
            className={`p-3 rounded-xl border text-center transition-colors ${
              disabled ? "opacity-40 cursor-not-allowed border-white/10" :
              slotId === s.id ? "border-brand bg-brand/15 shadow-[0_0_0_1px_rgba(34,197,94,0.4)]" : "border-white/10 bg-surface-card hover:border-white/25"
            }`}
          >

            {new Date(s.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
           --
            {new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          <div className="font-mono text-xs text-signature mt-0.5">₹ 1500</div>
            </button>
          );
        })}
        {slots.length === 0 && <p className="text-sm text-gray-500 col-span-2">No slots for this date.</p>}
      </div>

      <label className="block text-sm mb-1">Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10" />

      <label className="block text-sm mb-1">Phone</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10" />

      
      <label className="block text-sm mb-1">Payment</label>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setPaymentMethod("UPI")} className={`flex-1 p-3 rounded-xl border ${paymentMethod === "UPI" ? "border-brand bg-brand/20" : "border-white/10 bg-surface-card"}`}>UPI</button>
        <button onClick={() => setPaymentMethod("CASH")} className={`flex-1 p-3 rounded-xl border ${paymentMethod === "CASH" ? "border-brand bg-brand/20" : "border-white/10 bg-surface-card"}`}>Cash</button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button onClick={submit} disabled={loading} className="w-full p-4 rounded-xl bg-brand font-semibold text-black disabled:opacity-50">
        {loading ? "Creating booking..." : "Create Booking"}
      </button>
    </main>
  );
}
