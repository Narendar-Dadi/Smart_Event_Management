import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Ticket, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function StudentDashboardView({ events }) {
  const { user } = useAuth();
  const tickets = user?.tickets || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-2">Student Dashboard</h1>
      <p className="text-slate-500 mb-8">Welcome, {user?.name}. Browse events and manage your registrations.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link
          to="/events"
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors"
        >
          <Calendar className="text-blue-500 mb-4" size={28} />
          <h3 className="font-bold text-lg mb-1">Browse Events</h3>
          <p className="text-slate-500 text-sm">{events.length} events available</p>
        </Link>
        <Link
          to="/student/registrations"
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors"
        >
          <Ticket className="text-emerald-500 mb-4" size={28} />
          <h3 className="font-bold text-lg mb-1">My Registrations</h3>
          <p className="text-slate-500 text-sm">{tickets.length} ticket(s)</p>
        </Link>
        <Link
          to="/student/profile"
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors"
        >
          <User className="text-purple-500 mb-4" size={28} />
          <h3 className="font-bold text-lg mb-1">Profile</h3>
          <p className="text-slate-500 text-sm">View your account details</p>
        </Link>
      </div>
    </div>
  );
}
