import Cookies from 'js-cookie';

export const ROLES = ['admin', 'agent', 'user'];

export function resolveUserRole(rawUser) {
  if (!rawUser) return null;

  const role = typeof rawUser.role === 'string' ? rawUser.role.toLowerCase() : null;
  if (ROLES.includes(role)) return role;

  if (rawUser.user_is_admin) return 'admin';
  if (rawUser.user_is_agent) return 'agent';

  return 'user';
}

export function normalizeUser(rawUser) {
  if (!rawUser) return null;

  const role = resolveUserRole(rawUser);

  return {
    ...rawUser,
    role,
    name: rawUser.name ?? rawUser.user_name ?? rawUser.phone ?? '',
    email: rawUser.email ?? rawUser.user_email ?? '',
  };
}

export function getRoleHomePath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'agent') return '/agent';
  return '/user';
}

export function getStoredSession() {
  const accessToken = Cookies.get('accessToken');
  const rawUser = localStorage.getItem('user');

  if (!accessToken || !rawUser) return null;

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

export function persistSession({ accessToken, refreshToken, user, tableNames }) {
  Cookies.set('accessToken', accessToken);

  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, { expires: 30 });
  }

  localStorage.setItem('user', JSON.stringify(user));

  if (tableNames != null) {
    localStorage.setItem('tableNames', JSON.stringify(tableNames));
  }
}

export function clearSession() {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('tableNames');
}
