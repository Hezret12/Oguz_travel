import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  getRoleHomePath,
  getStoredSession,
  normalizeUser,
  persistSession,
} from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredSession()?.user ?? null);
  const [loading, setLoading] = useState(false);

  const login = useCallback((sessionData) => {
    const { accessToken, refreshToken, user: rawUser, tableNames } = sessionData;
    const normalized = normalizeUser(rawUser);

    const userToStore = {
      ...rawUser,
      role: normalized.role,
    };

    persistSession({
      accessToken,
      refreshToken,
      user: userToStore,
      tableNames,
    });

    setUser(normalized);
    return normalized;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

// export removed to fix fast refresh
