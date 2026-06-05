import React from "react";
import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardPath } from "../api/client";

export default function UnauthorizedView() {
  const { user } = useAuth();

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <ShieldOff className="mx-auto mb-6 text-red-500" size={48} />
      <h1 className="text-3xl font-bold mb-3">Access Denied</h1>
      <p className="text-slate-500 mb-8">
        You do not have permission to view this page.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Go Home
        </Link>
        {user ? (
          <Link
            to={getDashboardPath(user.role)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            My Dashboard
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
