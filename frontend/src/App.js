import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "./api/client";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import RoleNavbar from "./components/RoleNavbar";
import Toast from "./components/Toast";
import { FALLBACK_EVENTS } from "./constants";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomeView from "./views/HomeView";
import EventsDirectory from "./views/EventsDirectory";
import EventDetail from "./views/EventDetail";
import PaymentView from "./views/PaymentView";
import TicketView from "./views/TicketView";
import CreateEventView from "./views/CreateEventView";
import PaymentSettingsView from "./views/PaymentSettingsView";
import TransactionsView from "./views/TransactionsView";
import StudentDashboardView from "./views/StudentDashboardView";
import OrganizerDashboardView from "./views/OrganizerDashboardView";
import AdminDashboardView from "./views/AdminDashboardView";
import MyRegistrationsView from "./views/MyRegistrationsView";
import ProfileView from "./views/ProfileView";
import ManageEventsView from "./views/ManageEventsView";
import UsersManagementView from "./views/UsersManagementView";
import OrganizersManagementView from "./views/OrganizersManagementView";
import UnauthorizedView from "./views/UnauthorizedView";

function useLegacyNavigate() {
  const navigate = useNavigate();
  return useCallback(
    (path, params = null) => {
      const routes = {
        home: "/",
        events: "/events",
        "event-detail": params ? `/events/${params.id}` : "/events",
        payment: params?.event ? `/payment/${params.event.id}` : "/events",
        ticket: "/ticket",
        dashboard: "/",
        "create-event": "/organizer/create-event",
        settings: "/admin/settings",
        transactions: "/admin/transactions"
      };
      if (path === "payment" && params?.event) {
        navigate(`/payment/${params.event.id}`, { state: { event: params.event } });
      } else if (path === "ticket" && params?.ticket) {
        navigate("/ticket", { state: { ticket: params.ticket } });
      } else if (path === "event-detail" && params) {
        navigate(`/events/${params.id}`, { state: { event: params } });
      } else {
        navigate(routes[path] || "/");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate]
  );
}

function EventDetailPage({ events, onRegister }) {
  const { id } = useParams();
  const location = useLocation();
  const legacyNavigate = useLegacyNavigate();
  const event = location.state?.event || events.find((e) => e.id === id);

  if (!event) {
    return <div className="p-20 text-center text-slate-500">Event not found.</div>;
  }

  return <EventDetail event={event} onRegister={onRegister} navigate={legacyNavigate} />;
}

function PaymentPage({ user, paymentConfig, onSuccess, showToast }) {
  const { id } = useParams();
  const location = useLocation();
  const legacyNavigate = useLegacyNavigate();
  const event = location.state?.event;

  if (!event || event.id !== id) {
    return <Navigate to="/events" replace />;
  }

  return (
    <PaymentView
      event={event}
      user={user}
      paymentConfig={paymentConfig}
      onSuccess={onSuccess}
      onCancel={() => legacyNavigate("event-detail", event)}
      showToast={showToast}
    />
  );
}

function TicketPage() {
  const location = useLocation();
  const legacyNavigate = useLegacyNavigate();
  const ticket = location.state?.ticket;

  if (!ticket) {
    return <Navigate to="/student/registrations" replace />;
  }

  return <TicketView ticket={ticket} navigate={legacyNavigate} />;
}

function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  const { user, updateUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [dbOnline, setDbOnline] = useState(true);
  const [savingEvent, setSavingEvent] = useState(false);
  const legacyNavigate = useLegacyNavigate();
  const navigate = useNavigate();
  const location = useLocation();

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
    if (user?.role !== "admin") {
      setTransactions([]);
      return;
    }
    try {
      const data = await api.getTransactions();
      setTransactions(data);
    } catch {
      setTransactions([]);
    }
  }, [user]);

  const refreshUsers = useCallback(async () => {
    if (user?.role !== "admin") {
      setUsers([]);
      return;
    }
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
  }, [user]);

  const refreshPaymentConfig = useCallback(async () => {
    try {
      const data = await api.getPaymentConfig();
      setPaymentConfig(data);
    } catch {
      setPaymentConfig({ configured: false, currency: "INR", platformFee: 20 });
    }
  }, []);

  useEffect(() => {
    refreshEvents();
    refreshPaymentConfig();
  }, [refreshEvents, refreshPaymentConfig]);

  useEffect(() => {
    refreshTransactions();
    refreshUsers();
  }, [refreshTransactions, refreshUsers]);

  const handleRegisterEvent = (event) => {
    if (!user) {
      navigate("/login");
      showToast("Please login to register", "error");
      return;
    }
    legacyNavigate("payment", { event });
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
      navigate(user.role === "admin" ? "/admin/dashboard" : "/organizer/dashboard");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingEvent(false);
    }
  };

  const handleTicketSuccess = async (ticket) => {
    updateUser({
      ...user,
      tickets: [...(user?.tickets || []), ticket]
    });
    await refreshEvents();
    legacyNavigate("ticket", { ticket });
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        darkMode ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <RoleNavbar darkMode={darkMode} setDarkMode={setDarkMode} dbOnline={dbOnline} />

      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/" element={<HomeView navigate={legacyNavigate} events={events} />} />
              <Route path="/events" element={<EventsDirectory navigate={legacyNavigate} events={events} />} />
              <Route
                path="/events/:id"
                element={<EventDetailPage events={events} onRegister={handleRegisterEvent} />}
              />
              <Route path="/login" element={<LoginPage showToast={showToast} />} />
              <Route path="/register" element={<RegisterPage showToast={showToast} />} />
              <Route path="/unauthorized" element={<UnauthorizedView />} />

              <Route
                path="/payment/:id"
                element={
                  <RoleProtectedRoute roles={["student", "organizer", "admin"]}>
                    <PaymentPage
                      user={user}
                      paymentConfig={paymentConfig}
                      onSuccess={handleTicketSuccess}
                      showToast={showToast}
                    />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/ticket"
                element={
                  <RoleProtectedRoute roles={["student", "organizer", "admin"]}>
                    <TicketPage />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/student/dashboard"
                element={
                  <RoleProtectedRoute roles={["student", "organizer", "admin"]}>
                    <StudentDashboardView events={events} />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/student/registrations"
                element={
                  <RoleProtectedRoute roles={["student", "organizer", "admin"]}>
                    <MyRegistrationsView />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <RoleProtectedRoute roles={["student", "organizer", "admin"]}>
                    <ProfileView />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/organizer/dashboard"
                element={
                  <RoleProtectedRoute roles={["organizer", "admin"]}>
                    <OrganizerDashboardView events={events} />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/organizer/create-event"
                element={
                  <RoleProtectedRoute roles={["organizer", "admin"]}>
                    <CreateEventView
                      navigate={legacyNavigate}
                      onSave={handleCreateEvent}
                      organizer={user?.name}
                      saving={savingEvent}
                    />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/organizer/events"
                element={
                  <RoleProtectedRoute roles={["organizer", "admin"]}>
                    <ManageEventsView events={events} />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/organizer/profile"
                element={
                  <RoleProtectedRoute roles={["organizer", "admin"]}>
                    <ProfileView />
                  </RoleProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <RoleProtectedRoute roles={["admin"]}>
                    <AdminDashboardView events={events} transactions={transactions} users={users} />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleProtectedRoute roles={["admin"]}>
                    <UsersManagementView showToast={showToast} />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/organizers"
                element={
                  <RoleProtectedRoute roles={["admin"]}>
                    <OrganizersManagementView showToast={showToast} />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/transactions"
                element={
                  <RoleProtectedRoute roles={["admin"]}>
                    <TransactionsView transactions={transactions} />
                  </RoleProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <RoleProtectedRoute roles={["admin"]}>
                    <PaymentSettingsView user={user} showToast={showToast} />
                  </RoleProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
