/**
 * DevLoginHelper — sadece development ortamında görünür.
 * Login sayfasının altında 3 adet hızlı giriş butonu gösterir.
 * Production build'de hiçbir şey render etmez.
 */

import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath, normalizeUser } from '../utils/auth';

// ─── Mock kullanıcılar ────────────────────────────────────────────
// pages: kullanıcı oluşturulurken atanan sayfa erişim listesi.
// useSidebarItems bu listeye göre sidebar menüsünü oluşturur.
const DEV_USERS = [
  {
    label: 'Admin',
    emoji: '🛡️',
    color: '#ef4444',
    border: 'rgba(239,68,68,0.4)',
    bg: 'rgba(239,68,68,0.12)',
    user: {
      user_is_login: true,
      role: 'admin',
      name: 'Dev Admin',
      email: 'admin@oguztravel.dev',
      user_is_admin: true,
      pages: [
        'dashboard',
        'employee',
        'users',
        'agents',
        'bookings',
        'ticket',
        'logs',
        'settings',
      ],
    },
  },
  {
    label: 'Agent',
    emoji: '🧑‍💼',
    color: '#f59e0b',
    border: 'rgba(245,158,11,0.4)',
    bg: 'rgba(245,158,11,0.12)',
    user: {
      user_is_login: true,
      role: 'agent',
      name: 'Dev Agent',
      email: 'agent@oguztravel.dev',
      user_is_agent: true,
      pages: [
        'dashboard',
        'clients',
        'planner',
        'bookings',
      ],
    },
  },
  {
    label: 'User',
    emoji: '👤',
    color: '#14B8A6',
    border: 'rgba(20,184,166,0.4)',
    bg: 'rgba(20,184,166,0.12)',
    user: {
      user_is_login: true,
      role: 'user',
      name: 'Dev User',
      email: 'user@oguztravel.dev',
      pages: [
        'dashboard',
        'search',
        'bookings',
        'profile',
      ],
    },
  },
];

// ─── Component ────────────────────────────────────────────────────
const DevLoginHelper = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Sadece development'ta render et
  if (import.meta.env.PROD) return null;

  const handleDevLogin = (mock) => {
    // Cookie + localStorage'a mock session yaz
    Cookies.set('accessToken', 'dev-mock-token', { expires: 1 });
    Cookies.set('refreshToken', 'dev-mock-refresh', { expires: 1 });
    localStorage.setItem('user', JSON.stringify(mock.user));

    // AuthContext'i güncelle
    const normalized = normalizeUser(mock.user);
    login({
      accessToken: 'dev-mock-token',
      refreshToken: 'dev-mock-refresh',
      user: mock.user,
      tableNames: null,
    });

    navigate(getRoleHomePath(normalized.role), { replace: true });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
    }}>
      {/* Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20,
        padding: '3px 12px 3px 8px',
        fontSize: 11,
        color: 'rgba(255,255,255,0.55)',
        fontFamily: "'Inter', monospace",
        letterSpacing: '0.04em',
        userSelect: 'none',
      }}>
        <span style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#22c55e',
          boxShadow: '0 0 6px #22c55e',
          flexShrink: 0,
          animation: 'devPulse 2s ease-in-out infinite',
        }} />
        DEV MODE
        <style>{`@keyframes devPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>

      {/* Butonlar */}
      <div style={{
        display: 'flex',
        gap: 8,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: '8px 10px',
      }}>
        {DEV_USERS.map((mock) => (
          <button
            key={mock.label}
            onClick={() => handleDevLogin(mock)}
            title={`${mock.user.email}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 10,
              border: `1px solid ${mock.border}`,
              background: mock.bg,
              color: mock.color,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = mock.bg.replace('0.12', '0.22');
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = mock.bg;
            }}
          >
            <span>{mock.emoji}</span>
            {mock.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DevLoginHelper;
