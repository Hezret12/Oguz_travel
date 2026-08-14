import Cookies from 'js-cookie';

export const ROLES = ['admin', 'user'];

export function resolveUserRole(rawUser) {
  if (!rawUser) return null;

  const role = typeof rawUser.role === 'string' ? rawUser.role.toLowerCase() : null;
  if (ROLES.includes(role)) return role;

  if (rawUser.user_is_admin) return 'admin';

  return 'user';
}

export function normalizeUser(rawUser) {
  if (!rawUser) return null;

  const role = resolveUserRole(rawUser);

  return {
    ...rawUser,
    role,
    name: rawUser.name ?? rawUser.employee_name ?? rawUser.user_name ?? rawUser.phone_number ?? rawUser.phone ?? '',
    email: rawUser.email ?? rawUser.user_email ?? '',
  };
}

export function getRoleHomePath(role) {
  return '/';
}

export function getStoredSession() {
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  const rawUser = localStorage.getItem('user');

  if ((!accessToken && !refreshToken) || !rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser);
    if (!parsed?.user_is_login) return null;

    return {
      user: normalizeUser(parsed),
      tableNames: JSON.parse(localStorage.getItem('tableNames') || 'null'),
    };
  } catch {
    return null;
  }
}

export const getCookieOptions = (expiresDays = 7) => ({
  expires: expiresDays,
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  sameSite: 'lax',
  path: '/',
});

export function persistSession({ accessToken, refreshToken, user, tableNames }) {
  if (accessToken) {
    Cookies.set('accessToken', accessToken, getCookieOptions(7));
  }

  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, getCookieOptions(30));
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  if (tableNames != null) {
    localStorage.setItem('tableNames', JSON.stringify(tableNames));
  }
}

export function clearSession() {
  const removeOpts = { path: '/' };
  Cookies.remove('accessToken', removeOpts);
  Cookies.remove('refreshToken', removeOpts);
  localStorage.removeItem('user');
  localStorage.removeItem('tableNames');
}
