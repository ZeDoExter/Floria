import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Credentials, loginRequest, registerRequest } from '../api/client';
import { UserRole } from '../utils/auth';

type AuthUser = {
  token: string;
  displayName: string;
  email: string;
  role: UserRole;
  userId?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'flora-tailor/auth';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<AuthUser> & { email?: string | null };
      if (!parsed || !parsed.email || !parsed.token || !parsed.displayName || !parsed.role) {
        throw new Error('Stored auth state is missing required fields');
      }

      setUser({
        token: parsed.token,
        displayName: parsed.displayName,
        email: parsed.email,
        role: parsed.role as UserRole,
        userId: parsed.userId
      });
    } catch (error) {
      console.warn('Failed to parse stored auth state', error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user]);

  const login = async (credentials: Credentials) => {
    setIsLoading(true);
    try {
      const response = await loginRequest(credentials);
      const role = (response.user?.role as UserRole) || 'customer';
      setUser({
        token: response.token,
        displayName: response.displayName,
        email: credentials.email,
        role,
        userId: response.user?.id
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    setIsLoading(true);
    try {
      const response = await registerRequest(data);
      const role = (response.user?.role as UserRole) || 'customer';
      setUser({
        token: response.token,
        displayName: response.displayName,
        email: data.email,
        role,
        userId: response.user?.id
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      isLoading
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
