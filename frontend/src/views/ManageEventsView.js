import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ManageEventsView({ events }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const visibleEvents = isAdmin ? events : events.filter((e) => e.organizer === user?.name);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Manage Events</h1>
          <p className="text-slate-500">
            {isAdmin ? "All events in the system" : "Events you have created"}
          </p>
        </div>
        <Link
          to="/organizer/create-event"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Create Event
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {visibleEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No events to manage yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm">
                  <th className="p-4 font-medium">Event Name</th>
                  <th className="p-4 font-medium">Organizer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Registrations</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visibleEvents.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="p-4 font-semibold">{e.title}</td>
                    <td className="p-4 text-slate-500">{e.organizer}</td>
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
        )}
      </div>
    </div>
  );
}
