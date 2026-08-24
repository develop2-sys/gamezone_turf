import { useEffect, useState } from "react";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Toast from "../components/Toast.jsx";
import Spinner from "../components/Spinner.jsx";

// Polls every 15s (paused when tab hidden) so new requests show up automatically.
export default function AdminRequests() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      setBookings(await api.get("/admin/bookings"));
    } catch {
      // AdminLayout (the parent route) handles redirecting to login if the session is gone
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  async function act(id, action) {
    setError("");
    setBusyId(id);
    try {
      await api.post(`/admin/bookings/${id}/${action}`, {});
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-brand mb-6 tracking-wide">BOOKING REQUESTS</h1>
      <Toast message={error} onDismiss={() => setError("")} />

      {bookings === null ? (
        <Spinner label="Loading requests..." />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-surface-card rounded-xl p-4 text-sm border border-white/5">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold">{b.turf.name}</p>
                <div className="flex gap-1.5">
                  <StatusBadge status={b.bookingStatus} />
                  <StatusBadge status={b.paymentStatus} />
                </div>
              </div>
              <p className="font-mono text-signature text-xs mb-2">{b.bookingRef}</p>
              <p className="text-gray-400">{b.customerName} · {b.customerPhone}</p>
              <p className="text-gray-400 font-mono text-xs mt-1">
                {new Date(b.slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(b.slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ₹{b.amount}
              </p>
              {b.payment?.transactionRef && (
                <p className="text-gray-500 font-mono text-xs mt-1">UPI Ref: {b.payment.transactionRef}</p>
              )}
              <div className="flex gap-2 mt-3">
                {b.paymentMethod === "UPI" && b.paymentStatus === "VERIFICATION_PENDING" && (
                  <>
                    <button onClick={() => act(b.id, "confirm-payment")} disabled={busyId === b.id} className="px-3 py-2 rounded-lg bg-brand text-black text-xs font-semibold disabled:opacity-50">Confirm Payment</button>
                    <button onClick={() => act(b.id, "reject-payment")} disabled={busyId === b.id} className="px-3 py-2 rounded-lg bg-status-rejected/15 text-status-rejected text-xs font-semibold disabled:opacity-50">Reject</button>
                  </>
                )}
                {b.paymentMethod === "CASH" && b.paymentStatus === "CASH_PENDING" && (
                  <>
                    <button onClick={() => act(b.id, "confirm-cash")} disabled={busyId === b.id} className="px-3 py-2 rounded-lg bg-brand text-black text-xs font-semibold disabled:opacity-50">Confirm Cash</button>
                    <button onClick={() => act(b.id, "reject-cash")} disabled={busyId === b.id} className="px-3 py-2 rounded-lg bg-status-rejected/15 text-status-rejected text-xs font-semibold disabled:opacity-50">Reject</button>
                  </>
                )}
                {b.bookingStatus === "CONFIRMED" && (
                  <button onClick={() => act(b.id, "cancel")} disabled={busyId === b.id} className="px-3 py-2 rounded-lg bg-status-rejected/15 text-status-rejected text-xs font-semibold disabled:opacity-50">Cancel</button>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-gray-500 text-center py-10">No booking requests yet.</p>}
        </div>
      )}
    </>
  );
}