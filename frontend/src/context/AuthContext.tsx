import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Credentials, loginRequest } from '../api/client';
import { getUserRole, UserRole } from '../utils/auth';

type AuthUser = {
  token: string;
  displayName: string;
  email: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (credentials: Credentials) => Promise<void>;
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
      if (!parsed || !parsed.email || !parsed.token || !parsed.displayName) {
        throw new Error('Stored auth state is missing required fields');
      }

      const role = parsed.role ?? getUserRole(parsed.email);
      setUser({
        token: parsed.token,
        displayName: parsed.displayName,
        email: parsed.email,
        role
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
      const role = getUserRole(credentials.email);
      setUser({
        token: response.token,
        displayName: response.displayName,
        email: credentials.email,
        role
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
