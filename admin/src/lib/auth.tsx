import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AdminUser } from '../types/admin';
import { apiRequest, tokenStore } from './api';

type AuthContextValue = {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  can: (permission: 'stats' | 'pages' | 'services' | 'messages' | 'media' | 'admins' | 'activity' | 'heaven') => boolean;
};

const rolePermissions = {
  super_admin: ['stats', 'pages', 'services', 'messages', 'media', 'admins', 'activity', 'heaven'],
  editor: ['stats', 'pages', 'services', 'media', 'heaven'],
  moderator: ['stats', 'messages', 'activity'],
  readonly: ['stats', 'activity']
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{ user: AdminUser }>('/api/auth/me');
        setUser(response.user);
      } catch {
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, []);

  useEffect(() => {
    if (!user) return;

    let timeout = window.setTimeout(() => logout(), 30 * 60 * 1000);
    const reset = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => logout(), 30 * 60 * 1000);
    };

    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('click', reset);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('click', reset);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    const response = await apiRequest<{ token: string; user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password })
    });
    tokenStore.set(response.token);
    setUser(response.user);
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  const can: AuthContextValue['can'] = (permission) => {
    if (!user) return false;
    return (rolePermissions[user.role] as readonly string[]).includes(permission);
  };

  const value = useMemo(() => ({ user, loading, login, logout, can }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth doit etre utilise dans AuthProvider.');
  return value;
}
