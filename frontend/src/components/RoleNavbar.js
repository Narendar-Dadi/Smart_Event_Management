import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Moon, Settings, Shield, Sun, FileText } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function RoleNavbar({ darkMode, setDarkMode, dbOnline }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = "font-medium hover:text-blue-500 transition-colors";

  const studentLinks = (
    <>
      <Link to="/events" className={linkClass}>Events</Link>
      <Link to="/student/registrations" className={linkClass}>My Registrations</Link>
      <Link to="/student/profile" className={linkClass}>Profile</Link>
    </>
  );

  const organizerLinks = (
    <>
      <Link to="/organizer/dashboard" className={linkClass}>Dashboard</Link>
      <Link to="/organizer/create-event" className={linkClass}>Create Event</Link>
      <Link to="/organizer/events" className={linkClass}>Manage Events</Link>
      <Link to="/organizer/profile" className={linkClass}>Profile</Link>
    </>
  );

  const adminLinks = (
    <>
      <Link to="/admin/dashboard" className={linkClass}>Dashboard</Link>
      <Link to="/admin/users" className={linkClass}>Users</Link>
      <Link to="/admin/organizers" className={linkClass}>Organizers</Link>
      <Link to="/admin/transactions" className={linkClass}>Transactions</Link>
      <Link to="/admin/settings" className={linkClass}>Settings</Link>
    </>
  );

  const guestLinks = (
    <>
      <Link to="/" className={linkClass}>Home</Link>
      <Link to="/events" className={linkClass}>Events</Link>
    </>
  );

  const roleLinks =
    user?.role === "admin"
      ? adminLinks
      : user?.role === "organizer"
        ? organizerLinks
        : user?.role === "student"
          ? studentLinks
          : guestLinks;

  return (
    <nav
      className={`no-print fixed w-full z-40 top-0 backdrop-blur-md border-b ${
        darkMode ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Event<span className="text-blue-600">Hub</span>
            </span>
          </Link>

          <div className="hidden md:flex space-x-8">{roleLinks}</div>

          <div className="flex items-center gap-4">
            {!dbOnline && (
              <span className="hidden sm:inline text-xs text-amber-600 dark:text-amber-400 font-medium">
                DB offline
              </span>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full font-medium">
                  <Shield size={16} /> {user.name}
                  <span className="text-xs opacity-70 capitalize">({user.role})</span>
                </button>
                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  {user.role === "admin" && (
                    <>
                      <button
                        onClick={() => navigate("/admin/transactions")}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FileText size={16} /> Transactions
                      </button>
                      <button
                        onClick={() => navigate("/admin/settings")}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Settings size={16} /> Payment Settings
                      </button>
                    </>
                  )}
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
