import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import Spinner from "./Spinner.jsx";

const NAV = [
  { to: "/admin/requests", label: "Requests" },
  { to: "/admin/slots", label: "Slots" },
  { to: "/admin/walkins", label: "Walk-in" },
];

// Mounted once for all nested /admin/* routes — nav and auth check persist
// across navigation, only the page content below swaps out.
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    api.get("/auth/admin/me").then((res) => {
      if (!res.loggedIn) {
        navigate("/admin/login");
      } else {
        setChecked(true);
      }
    });
  }, []);

  async function logout() {
    await api.post("/auth/admin/logout", {});
    navigate("/admin/login");
  }

  if (!checked) return <Spinner label="Checking admin session..." />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-surface-card/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-display text-lg font-bold text-brand tracking-wide">GAMEZONE ADMIN</span>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  location.pathname === item.to ? "bg-brand/20 text-brand" : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={logout} className="ml-2 px-3 py-1.5 rounded-lg text-gray-500 hover:text-status-rejected text-sm">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}