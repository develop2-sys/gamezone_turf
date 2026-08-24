import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    try {
      await api.post("/auth/admin", { email, password });
      navigate("/admin/requests");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-brand mb-6">Admin Login</h1>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10" />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-3 rounded-xl bg-surface-card border border-white/10" />
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <button onClick={submit} className="w-full p-4 rounded-xl bg-brand font-semibold text-black">Login</button>
    </main>
  );
}
