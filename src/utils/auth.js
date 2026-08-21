import Cookies from 'js-cookie';

export const ROLES = ['admin', 'user'];

export function resolveUserRole(rawUser) {
  if (!rawUser) return null;

  const role = typeof rawUser.role === 'string' ? rawUser.role.toLowerCase() : null;
  if (ROLES.includes(role)) return role;

  if (rawUser.user_is_admin) return 'admin';

  return 'user';
}

function extractText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.fullName || val.name || val.shortName || val.title || '';
  }
  return String(val);
}

export function normalizeUser(rawUser) {
  if (!rawUser) return null;

  const role = resolveUserRole(rawUser);
  const emp = rawUser.employee || {};
  const userDetail = rawUser.userDetail || {};
  const contact = userDetail.contact || {};

  const name =
    extractText(userDetail.full_name) ||
    extractText(userDetail.fullName) ||
    extractText(rawUser.employee_name) ||
    extractText(emp.fullName) ||
    extractText(emp.name) ||
    extractText(rawUser.name) ||
    extractText(rawUser.fullName) ||
    extractText(rawUser.phone_number) ||
    extractText(rawUser.phone) ||
    '';

  const email =
    extractText(contact.email) ||
    extractText(emp.email) ||
    extractText(rawUser.email) ||
    extractText(rawUser.user_email) ||
    '';

  const phone_number =
    extractText(contact.phone) ||
    extractText(emp.phone_number) ||
    extractText(emp.phone) ||
    extractText(rawUser.phone_number) ||
    extractText(rawUser.phone) ||
    '';

  const position =
    extractText(userDetail.role) ||
    extractText(rawUser.positions?.[0]?.name) ||
    extractText(emp.position) ||
    extractText(rawUser.position) ||
    extractText(rawUser.position_name) ||
    '';

  const department =
    extractText(emp.department) ||
    extractText(rawUser.department) ||
    extractText(rawUser.department_name) ||
    '';

  const office =
    extractText(emp.office) ||
    extractText(rawUser.office) ||
    extractText(rawUser.office_name) ||
    '';

  const avatar_url =
    extractText(userDetail.avatar_url) ||
    extractText(userDetail.avatarUrl) ||
    extractText(emp.avatar_url) ||
    extractText(emp.avatar) ||
    extractText(rawUser.avatar_url) ||
    extractText(rawUser.avatar) ||
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
