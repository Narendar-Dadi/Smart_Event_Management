import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Plus, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function OrganizerDashboardView({ events }) {
  const { user } = useAuth();
  const myEvents = events.filter((e) => e.organizer === user?.name);
  const totalReg = myEvents.reduce((sum, e) => sum + (e.registered || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Organizer Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user?.name}.</p>
        </div>
        <Link
          to="/organizer/create-event"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { title: "My Events", value: myEvents.length, icon: Calendar, color: "text-blue-500" },
          { title: "Total Registrations", value: totalReg, icon: Users, color: "text-emerald-500" },
          { title: "All Events", value: events.length, icon: Calendar, color: "text-purple-500" }
        ].map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <kpi.icon className={`${kpi.color} mb-4`} size={28} />
            <div className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</div>
            <div className="text-3xl font-bold">{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      <Link
        to="/organizer/events"
        className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
      >
        Manage all events →
      </Link>
    </div>
  );
}
