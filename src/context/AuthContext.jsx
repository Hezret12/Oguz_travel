import { createContext, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { clearSession, getStoredSession, normalizeUser, persistSession } from '../utils/auth';
import { getMeApi } from '../api/queries/getters';
import { logoutApi } from '../api/queries/post';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const hasToken = Boolean(Cookies.get('accessToken') || Cookies.get('refreshToken'));

  // TanStack Query for Current Auth User (/auth/me)
  const {
    data: user = null,
    isLoading,
    isFetching,
    dataUpdatedAt,
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  // ── Loading State Logic ─────────────────────────────────────────
  // isLoading  = no data at all (first ever load, no initialData)
  // isFetching = network request in-flight
  // dataUpdatedAt = 0 means only initialData exists, no real /auth/me
  //                 response has been received yet
  //
  // We stay in "loading" until the first REAL server verification
  // completes. This prevents the expired-token bounce:
  //   login → (stale cache says authenticated) → home → (401) → login
  const loading = isLoading || (isFetching && dataUpdatedAt === 0);

  // TanStack Mutation for Logout (/auth/logout)
  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearSession();
      queryClient.clear(); // Clears all cached queries on logout for privacy/security
    },
  });

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
    logoutMutation.mutate();
  }, [logoutMutation]);

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
