import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Shield,
  Sun,
  FileText
} from "lucide-react";
import { api, setToken, getToken } from "./api/client";
import Toast from "./components/Toast";
import AuthModal from "./components/AuthModal";
import { FALLBACK_EVENTS } from "./constants";
import HomeView from "./views/HomeView";
import EventsDirectory from "./views/EventsDirectory";
import EventDetail from "./views/EventDetail";
import PaymentView from "./views/PaymentView";
import TicketView from "./views/TicketView";
import DashboardView from "./views/DashboardView";
import CreateEventView from "./views/CreateEventView";
import PaymentSettingsView from "./views/PaymentSettingsView";
import TransactionsView from "./views/TransactionsView";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [route, setRoute] = useState({ path: "home", params: null });
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [authModal, setAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dbOnline, setDbOnline] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const refreshEvents = useCallback(async () => {
    try {
      const data = await api.getEvents();
      setEvents(data);
      setDbOnline(true);
    } catch {
      setEvents(FALLBACK_EVENTS);
      setDbOnline(false);
      showToast("Database offline — showing cached demo events", "error");
    }
  }, [showToast]);

  const refreshTransactions = useCallback(async () => {
    if (!getToken()) {
      setTransactions([]);
      return;
    }
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch {
      setTransactions([]);
    }
  }, []);

  const refreshPaymentConfig = useCallback(async () => {
    try {
      const data = await api.getPaymentConfig();
      setPaymentConfig(data);
    } catch {
      setPaymentConfig({ configured: false, currency: "INR", platformFee: 20 });
    }
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const token = getToken();
      if (!token) {
        setSessionLoading(false);
        return;
      }
      try {
        const { user: me } = await api.getMe();
        setUser(me);
      } catch {
        setToken(null);
      } finally {
        setSessionLoading(false);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    refreshEvents();
    refreshPaymentConfig();
  }, [refreshEvents, refreshPaymentConfig]);

  useEffect(() => {
    if (user?.role === "admin") refreshTransactions();
    else setTransactions([]);
  }, [user, refreshTransactions]);

  const navigate = (path, params = null) => {
    setRoute({ path, params });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = async (credentials) => {
    setAuthLoading(true);
    try {
      const data = await api.login(credentials);
      setToken(data.token);
      setUser(data.user);
      setAuthModal(false);
      showToast(`Welcome back, ${data.user.name}!`, "success");
      if (data.user.role === "admin") await refreshTransactions();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (form) => {
    setAuthLoading(true);
    try {
      const data = await api.register(form);
      setToken(data.token);
      setUser(data.user);
      setAuthModal(false);
      showToast("Account created successfully!", "success");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTransactions([]);
    navigate("home");
    showToast("Logged out successfully");
  };

  const handleCreateEvent = async (newEvent) => {
    if (!user || (user.role !== "admin" && user.role !== "organizer")) {
      showToast("Only organizers and admins can create events", "error");
      return;
    }
    setSavingEvent(true);
    try {
      await api.createEvent(newEvent);
      await refreshEvents();
      showToast("Event created successfully!", "success");
      navigate("dashboard");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleRegisterEvent = (event) => {
    if (!user) {
      setAuthModal(true);
      showToast("Please login to register", "error");
      return;
    }
    navigate("payment", { event });
  };

  const handleTicketSuccess = async (ticket) => {
    setUser((prev) => ({
      ...prev,
      tickets: [...(prev?.tickets || []), ticket]
    }));
    await refreshEvents();
    await refreshTransactions();
    navigate("ticket", { ticket });
  };

  const renderView = () => {
    switch (route.path) {
      case "home":
        return <HomeView navigate={navigate} events={events} />;
      case "events":
        return <EventsDirectory navigate={navigate} events={events} />;
      case "event-detail":
        return <EventDetail navigate={navigate} event={route.params} onRegister={handleRegisterEvent} />;
      case "payment":
        return (
          <PaymentView
            event={route.params.event}
            user={user}
            paymentConfig={paymentConfig}
            onSuccess={handleTicketSuccess}
            onCancel={() => navigate("event-detail", route.params.event)}
            showToast={showToast}
          />
        );
      case "ticket":
        return <TicketView ticket={route.params.ticket} navigate={navigate} />;
      case "dashboard":
        return (
          <DashboardView user={user} events={events} navigate={navigate} transactions={transactions} />
        );
      case "create-event":
        return (
          <CreateEventView
            navigate={navigate}
            onSave={handleCreateEvent}
            organizer={user?.name}
            saving={savingEvent}
          />
        );
      case "settings":
        return <PaymentSettingsView navigate={navigate} user={user} showToast={showToast} />;
      case "transactions":
        return <TransactionsView navigate={navigate} transactions={transactions} user={user} />;
      default:
        return <HomeView navigate={navigate} events={events} />;
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <nav
        className={`no-print fixed w-full z-40 top-0 backdrop-blur-md border-b ${
          darkMode ? "border-slate-800 bg-slate-950/80" : "border-slate-200 bg-white/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("home")}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">
                Event<span className="text-blue-600">Hub</span>
              </span>
            </div>

            <div className="hidden md:flex space-x-8">
              <button onClick={() => navigate("home")} className="font-medium hover:text-blue-500">
                Home
              </button>
              <button onClick={() => navigate("events")} className="font-medium hover:text-blue-500">
                Events
              </button>
              {user && (user.role === "admin" || user.role === "organizer") && (
                <button onClick={() => navigate("dashboard")} className="font-medium hover:text-blue-500">
                  Dashboard
                </button>
              )}
            </div>

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
                  </button>
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => navigate("dashboard")}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard size={16} /> My Dashboard
                    </button>
                    {user.role === "admin" && (
                      <>
                        <button
                          onClick={() => navigate("transactions")}
                          className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <FileText size={16} /> Transactions
                        </button>
                        <button
                          onClick={() => navigate("settings")}
                          className="w-full text-left px-4 py-2.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Settings size={16} /> Payment Settings
                        </button>
                      </>
                    )}
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-2 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={route.path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {authModal && (
          <AuthModal
            darkMode={darkMode}
            onClose={() => setAuthModal(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={authLoading}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
