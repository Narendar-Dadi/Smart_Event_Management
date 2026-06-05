import React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, Download, MapPin } from "lucide-react";
import { generatePseudoQRCode } from "../utils/qr";

export default function TicketView({ ticket, navigate }) {
  if (!ticket) return null;
  const { event, ticketId } = ticket;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
        <div className="inline-flex w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Registration Successful!</h1>
        <p className="text-slate-500">Your digital ticket has been generated.</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
      >
        <div className="absolute top-1/2 -left-6 w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-full -translate-y-1/2 border-r border-slate-200 dark:border-slate-800" />
        <div className="absolute top-1/2 -right-6 w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-full -translate-y-1/2 border-l border-slate-200 dark:border-slate-800" />

        <div className="p-8 border-b-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold mb-3 inline-block">
                {event.category}
              </span>
              <h2 className="text-2xl font-bold">{event.title}</h2>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 font-mono">TICKET ID</div>
              <div className="font-bold text-lg font-mono">{ticketId}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <div className="text-sm text-slate-400 mb-1">Date</div>
              <div className="font-semibold flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" /> {new Date(event.date).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Time</div>
              <div className="font-semibold flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> {event.time}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-slate-400 mb-1">Venue</div>
              <div className="font-semibold flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" /> {event.venue}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-800/20 flex flex-col items-center justify-center">
          <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm mb-4">{generatePseudoQRCode(ticketId)}</div>
          <p className="text-sm text-slate-500 font-medium">Scan this QR code at the venue entry</p>
        </div>
      </motion.div>

      <div className="mt-8 flex justify-center gap-4 no-print">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
        >
          <Download size={20} /> Print Ticket
        </button>
        <button
          onClick={() => navigate("events")}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Explore More Events
        </button>
      </div>
    </div>
  );
}
