import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Calendar,
  FileText,
  QrCode,
  Settings,
  TrendingUp,
  Users
} from "lucide-react";
import { MOCK_CHART_DATA, PIE_DATA, CHART_COLORS } from "../constants";

export default function DashboardView({ user, events, navigate, transactions }) {
  if (!user || user.role === "student") {
    return <div className="p-20 text-center text-xl">Access Denied. Organizers and admins only.</div>;
  }

  const totalRev = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalReg = events.reduce((sum, e) => sum + (e.registered || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Organizer Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user.name}.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {user.role === "admin" && (
            <>
              <button
                onClick={() => navigate("transactions")}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2"
              >
                <FileText size={18} /> Transactions
              </button>
              <button
                onClick={() => navigate("settings")}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2"
              >
                <Settings size={18} /> Payment Settings
              </button>
            </>
          )}
          <button
            onClick={() => navigate("create-event")}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700"
          >
            Create Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Total Revenue", value: `₹${totalRev}`, icon: TrendingUp, bg: "bg-emerald-100 dark:bg-emerald-900/30", color: "text-emerald-500" },
          { title: "Total Registrations", value: totalReg, icon: Users, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-500" },
          { title: "Active Events", value: events.length, icon: Calendar, bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-500" },
          { title: "Transactions", value: transactions.length, icon: QrCode, bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-500" }
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} mb-4`}>
              <kpi.icon className={kpi.color} size={24} />
            </div>
            <div className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</div>
            <div className="text-3xl font-bold">{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold mb-6">Revenue Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
        >
          <h3 className="text-xl font-bold mb-6">Events by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold">Manage Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm">
                <th className="p-4 font-medium">Event Name</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Registrations</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4 font-semibold">{e.title}</td>
                  <td className="p-4 text-slate-500">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    {e.registered}/{e.capacity}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
