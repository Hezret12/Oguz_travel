import { createContext, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { clearSession, getStoredSession, normalizeUser, persistSession } from '../utils/auth';
import { getMeApi } from '../api/queries/getters';
import { logoutApi } from '../api/queries/post';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const hasToken = Boolean(Cookies.get('accessToken') || Cookies.get('refreshToken'));

  const {
    data: user = null,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const response = await getMeApi();
        const fetchedUser = response?.data?.data || response?.data;
        if (fetchedUser) {
          const userObj = { ...fetchedUser, user_is_login: true };
          localStorage.setItem('user', JSON.stringify(userObj));
          return normalizeUser(userObj);
        }
      } catch (err) {
        const status = err?.response?.status;
        const isAuthError =
          status === 401 ||
          status === 403 ||
          err?.message === 'No refresh token available' ||
          err?.message === 'No access token in refresh response';

        if (isAuthError) {
          clearSession();
          queryClient.setQueryData(['authUser'], null);
        } else {
          const stored = getStoredSession();
          if (stored?.user) {
            return stored.user;
          }
        }
        throw err;
      }
      return null;
    },
    enabled: hasToken,
    initialData: () => getStoredSession()?.user ?? null,
    initialDataUpdatedAt: 0,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const loading = isLoading && !user;

  const login = useCallback(
    (sessionData) => {
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
        const rest = { ...sessionData };
        delete rest.accessToken;
        delete rest.refreshToken;
        delete rest.access_token;
        delete rest.refresh_token;
        delete rest.tableNames;
        userObj = rest;
      }

      userObj = { ...userObj, user_is_login: true };
      const normalized = normalizeUser(userObj);

      persistSession({
        accessToken: finalAccessToken,
        refreshToken: finalRefreshToken,
        user: userObj,
        tableNames,
      });

      queryClient.setQueryData(['authUser'], normalized);
      return normalized;
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    clearSession();

    queryClient.cancelQueries();
    queryClient.setQueryData(['authUser'], null);

    queryClient.removeQueries();

    logoutApi().catch(() => { });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refetchUser,
    }),
    [user, loading, login, logout, refetchUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from './useAuth';
