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
  const emp = rawUser.employee || {};

  const name =
    emp.fullName ||
    emp.name ||
    rawUser.name ||
    rawUser.fullName ||
    rawUser.employee_name ||
    rawUser.user_name ||
    rawUser.phone_number ||
    rawUser.phone ||
    '';

  const email =
    emp.email ||
    rawUser.email ||
    rawUser.user_email ||
    '';

  const phone_number =
    emp.phone_number ||
    emp.phone ||
    rawUser.phone_number ||
    rawUser.phone ||
    '';

  const position =
    (typeof emp.position === 'object' ? emp.position?.name : emp.position) ||
    (typeof rawUser.position === 'object' ? rawUser.position?.name : rawUser.position) ||
    rawUser.position_name ||
    '';

  const department =
    (typeof emp.department === 'object' ? emp.department?.name : emp.department) ||
    (typeof rawUser.department === 'object' ? rawUser.department?.name : rawUser.department) ||
    rawUser.department_name ||
    '';

  const office =
    (typeof emp.office === 'object' ? emp.office?.name || emp.office?.shortName : emp.office) ||
    (typeof rawUser.office === 'object' ? rawUser.office?.name : rawUser.office) ||
    rawUser.office_name ||
    '';

  const avatar_url =
    emp.avatar_url ||
    emp.avatar ||
    rawUser.avatar_url ||
    rawUser.avatar ||
    '';

  return {
    ...rawUser,
    guid: rawUser.guid || rawUser.id,
    role,
    name,
    fullName: name,
    email,
    phone_number,
    position,
    department,
    office,
    avatar_url,
    employee_guid: emp.guid || emp.id || rawUser.employee_guid || null,
  };
}

export function getRoleHomePath() {
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
