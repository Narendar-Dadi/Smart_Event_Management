import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardPath } from "../api/client";

export default function RegisterPage({ showToast }) {
  const { user, register } = useAuth();

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      showToast("Account created successfully!", "success");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <UserPlus className="mx-auto mb-4 text-blue-600" size={40} />
        <h1 className="text-3xl font-bold">Student Registration</h1>
        <p className="text-slate-500 mt-2">Create a student account to browse and register for events</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Full Name</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
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
            minLength={6}
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
          {loading ? "Creating account..." : "Register as Student"}
        </button>
      </form>

      <p className="text-center mt-6 text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
