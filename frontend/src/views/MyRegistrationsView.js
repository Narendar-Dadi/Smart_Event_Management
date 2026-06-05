import React from "react";
import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function MyRegistrationsView() {
  const { user } = useAuth();
  const tickets = user?.tickets || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-2">My Registrations</h1>
      <p className="text-slate-500 mb-8">Your event tickets and registrations</p>

      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Ticket className="mx-auto mb-4 text-slate-400" size={40} />
          <p className="text-slate-500 mb-4">No registrations yet.</p>
          <Link to="/events" className="text-blue-600 font-medium hover:underline">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id || ticket.ticketId}
              to="/ticket"
              state={{ ticket }}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{ticket.eventTitle || ticket.event}</h3>
                  <p className="text-sm text-slate-500">{ticket.ticketId || ticket.id}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {ticket.status || "Confirmed"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
