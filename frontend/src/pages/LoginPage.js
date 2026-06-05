import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardPath } from "../api/client";

const DEMO_ACCOUNTS = [
  { role: "Student", email: "student@smarthub.edu", password: "Student@123" },
  { role: "Organizer", email: "organizer@smarthub.edu", password: "Organizer@123" },
  { role: "Admin", email: "admin@smarthub.edu", password: "Admin@123" }
];

export default function LoginPage({ showToast }) {
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form);
      showToast(`Welcome back, ${data.user.name}!`, "success");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setError("");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <LogIn className="mx-auto mb-4 text-blue-600" size={40} />
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-slate-500 mt-2">Access your EventHub account</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Password</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center mt-6 text-slate-500">
        New student?{" "}
        <Link to="/register" className="text-blue-600 font-medium hover:underline">
          Register here
        </Link>
      </p>

      <div className="mt-8">
        <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide text-center">Demo accounts</p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc)}
              className="w-full text-left px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500"
            >
              <span className="font-semibold">{acc.role}</span>
              <span className="text-slate-500 block text-xs">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
