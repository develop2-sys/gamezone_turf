import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold text-brand">GAMEZONE</h1>
      <p className="mt-2 text-lg text-gray-300">Book Your Game. Own Your Time.</p>
      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        <Link to="/book" className="px-8 py-4 rounded-xl bg-brand font-semibold text-black">BOOK NOW</Link>
        <Link to="/my-bookings" className="px-8 py-3 rounded-xl border border-white/20 text-sm">My Bookings</Link>
        <Link to="/admin/login" className="text-xs text-gray-500 mt-4">Admin Login</Link>
      </div>
    </main>
  );
}
