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
    const {
      accessToken,
      refreshToken,
      access_token,
      refresh_token,
      user: rawUser,
      tableNames,
    } = sessionData;

    const finalAccessToken = accessToken || access_token;
    const finalRefreshToken = refreshToken || refresh_token;

    let userObj = rawUser;
    if (!userObj) {
      const {
        accessToken: _at,
        refreshToken: _rt,
        access_token: _at2,
        refresh_token: _rt2,
        tableNames: _tn,
        ...rest
      } = sessionData;
      userObj = rest;
    }

    userObj = {
      ...userObj,
      user_is_login: true,
    };

    const normalized = normalizeUser(userObj);

    persistSession({
      accessToken: finalAccessToken,
      refreshToken: finalRefreshToken,
      user: userObj,
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
