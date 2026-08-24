import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Toast from "../components/Toast.jsx";

export default function MyBookings() {
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search() {
    setError("");
    setLoading(true);
    try {
      setBookings(await api.get(`/bookings/lookup?phone=${phone}`));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-300 mb-4 inline-block">← Home</Link>
      <h1 className="font-display text-3xl font-bold text-brand mb-6 tracking-wide">MY BOOKINGS</h1>

      <label className="block text-sm text-gray-400 mb-1.5">Phone number</label>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        inputMode="numeric"
        className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10 focus:border-brand outline-none"
      />
      <button onClick={search} disabled={loading} className="w-full mb-6 p-3 rounded-xl bg-brand font-display font-bold text-black tracking-wide disabled:opacity-50 hover:bg-brand-light transition-colors">
        {loading ? "Searching..." : "Search"}
      </button>

      <Toast message={error} onDismiss={() => setError("")} />

      <div className="space-y-3">
        {bookings?.map((b) => (
          <Link key={b.id} to={`/booking/${b.id}`} className="block bg-surface-card rounded-xl p-4 text-sm border border-white/5 hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start mb-1">
              <p className="font-semibold">{b.turf.name}</p>
              <StatusBadge status={b.bookingStatus} />
            </div>
            <p className="font-mono text-signature text-xs mb-1">{b.bookingRef}</p>
            <p className="text-gray-400 font-mono text-xs">{new Date(b.slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(b.slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ₹{b.amount}</p>
          </Link>
        ))}
        {bookings?.length === 0 && <p className="text-gray-500 text-center py-6">No bookings found.</p>}
      </div>
    </main>
  );
}