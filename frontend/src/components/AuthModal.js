import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, LogIn, UserPlus } from "lucide-react";

const DEMO_ACCOUNTS = [
  { role: "Student", email: "student@smarthub.edu", password: "Student@123" },
  { role: "Organizer", email: "organizer@smarthub.edu", password: "Organizer@123" },
  { role: "Admin", email: "admin@smarthub.edu", password: "Admin@123" }
];

export default function AuthModal({ darkMode, onClose, onLogin, onRegister, loading }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await onLogin({ email: form.email, password: form.password });
      } else {
        await onRegister(form);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  const fillDemo = (account) => {
    setForm({ name: "", email: account.email, password: account.password });
    setMode("login");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
          darkMode ? "bg-slate-900 border border-slate-800" : "bg-white"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{mode === "login" ? "Sign In" : "Create Account"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Sign in with your SmartHub MongoDB account. Role-based access is enforced on the server.
        </p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === "login" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            <LogIn size={16} /> Login
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
              mode === "register" ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800"
            }`}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input
                required
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@college.edu"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              required
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              minLength={6}
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
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {mode === "login" && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Demo accounts</p>
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
        )}
      </motion.div>
    </div>
  );
}
