import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, FileText, Settings, Users } from "lucide-react";
import { MOCK_CHART_DATA } from "../constants";

export default function AdminDashboardView({ events, transactions, users }) {
  const totalRev = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalReg = events.reduce((sum, e) => sum + (e.registered || 0), 0);
  const organizerCount = users.filter((u) => u.role === "organizer").length;
  const studentCount = users.filter((u) => u.role === "student").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-2">Admin Dashboard</h1>
      <p className="text-slate-500 mb-8">System overview and analytics</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { title: "Total Revenue", value: `₹${totalRev}`, icon: FileText, color: "text-emerald-500" },
          { title: "Registrations", value: totalReg, icon: Users, color: "text-blue-500" },
          { title: "Organizers", value: organizerCount, icon: Users, color: "text-purple-500" },
          { title: "Students", value: studentCount, icon: Users, color: "text-amber-500" }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold mb-6">Revenue Analytics</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
          <Link to="/admin/users" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500">
            <Users size={20} className="text-blue-500" />
            <span className="font-medium">User Management</span>
          </Link>
          <Link to="/admin/organizers" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500">
            <Calendar size={20} className="text-purple-500" />
            <span className="font-medium">Organizer Management</span>
          </Link>
          <Link to="/admin/transactions" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500">
            <FileText size={20} className="text-emerald-500" />
            <span className="font-medium">Transactions</span>
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500">
            <Settings size={20} className="text-amber-500" />
            <span className="font-medium">Payment Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
