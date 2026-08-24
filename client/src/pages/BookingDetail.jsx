import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../api.js";

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [upiConfig, setUpiConfig] = useState(null);
  const [busy, setBusy] = useState(false);
  const [txnRef, setTxnRef] = useState("");
  const [payError, setPayError] = useState("");

  async function load() {
    try {
      setBooking(await api.get(`/bookings/${id}`));
    } catch {
      // keep last known state on transient errors
    }
  }

  useEffect(() => {
    load();
    api.get("/config").then(setUpiConfig);
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [id]);

    async function markPaid() {
    setPayError("");
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/pay`, { transactionRef: txnRef.trim() });
      await load();
    } catch (e) {
      setPayError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!booking) return <main className="p-8 text-center text-gray-400">Loading booking...</main>;

  // Standard UPI deep link — scannable by GPay, PhonePe, Paytm, any UPI app.
  const upiUri = upiConfig
    ? `upi://pay?pa=${encodeURIComponent(upiConfig.upiId)}&pn=${encodeURIComponent(upiConfig.payeeName)}&am=${booking.amount}&cu=INR&tn=${encodeURIComponent(booking.bookingRef)}`
    : null;

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-brand mb-1">Booking {booking.bookingStatus}</h1>
      <p className="text-sm text-gray-400 mb-6">Booking ID: {booking.bookingRef}</p>

      <div className="bg-surface-card rounded-xl p-4 space-y-2 text-sm mb-6">
        <p>Turf: {booking.turf.name}</p>
        <p>Date: {new Date(booking.slot.date).toLocaleDateString()}</p>
        <p>Time: {new Date(booking.slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        <p>Amount: ₹{booking.amount}</p>
        <p>Payment: {booking.paymentMethod} - {booking.paymentStatus}</p>
      </div>

      {booking.paymentMethod === "UPI" && booking.paymentStatus === "UNPAID" && (
        <div>
          {upiUri && (
            <div className="bg-white rounded-xl p-4 flex flex-col items-center mb-4">
              <QRCodeSVG value={upiUri} size={200} />
              <p className="text-black text-sm mt-2 font-semibold">{upiConfig.upiId}</p>
              <p className="text-black text-xs">{upiConfig.payeeName}</p>
            </div>
          )}
          <p className="text-sm text-gray-400 mb-4 text-center">Scan with any UPI app and pay ₹{booking.amount}</p>

          <label className="block text-sm text-gray-400 mb-1.5">UPI transaction reference / UTR number <span className="text-gray-600">(optional)</span></label>          <input
            value={txnRef}
            onChange={(e) => setTxnRef(e.target.value)}
            placeholder="From your UPI app after paying"
            className="w-full mb-3 p-3 rounded-xl bg-surface-card border border-white/10"
          />
          {payError && <p className="text-red-400 text-sm mb-3">{payError}</p>}
          <button onClick={markPaid} disabled={busy} className="w-full p-4 rounded-xl bg-brand font-semibold text-black disabled:opacity-50">
            {busy ? "Submitting..." : "I HAVE PAID"}
          </button>
        </div>
      )}
      {booking.paymentStatus === "VERIFICATION_PENDING" && (
        <p className="text-yellow-400 text-sm text-center">Waiting for admin to verify your payment...</p>
      )}
      {booking.paymentMethod === "CASH" && booking.paymentStatus === "CASH_PENDING" && (
        <p className="text-yellow-400 text-sm text-center">Please pay at the GameZone counter.</p>
      )}
      {booking.bookingStatus === "CONFIRMED" && (
        <p className="text-brand text-sm text-center">🎉 Your booking is confirmed!</p>
      )}
      {booking.bookingStatus === "REJECTED" && (
        <p className="text-red-400 text-sm text-center">This booking was rejected.</p>
      )}
    </main>
  );
}