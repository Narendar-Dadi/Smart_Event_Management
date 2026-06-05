import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearAuth, getDashboardPath, getToken, getUser, setToken, setUser } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const persistAuth = useCallback((token, userData) => {
    setToken(token);
    setUser(userData);
    setUserState(userData);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    async function restoreSession() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: me } = await api.getMe();
        setUser(me);
        setUserState(me);
      } catch {
        clearAuth();
        setUserState(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await api.login(credentials);
      persistAuth(data.token, data.user);
      navigate(getDashboardPath(data.user.role));
      return data;
    },
    [navigate, persistAuth]
  );

  const register = useCallback(
    async (form) => {
      const data = await api.register(form);
      persistAuth(data.token, data.user);
      navigate(getDashboardPath(data.user.role));
      return data;
    },
    [navigate, persistAuth]
  );

  const updateUser = useCallback((userData) => {
    setUser(userData);
    setUserState(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
