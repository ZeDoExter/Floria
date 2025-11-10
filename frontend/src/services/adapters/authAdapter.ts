import { listKnownUsers, getUserRole } from '../../utils/auth';
import { loginRequest, fetchProfile } from '../../api/client';
import type { UserRole } from '../../utils/auth';

export type AuthUser = {
  email: string;
  displayName: string;
  role: UserRole;
  token?: string; // for mock we may not have a real token
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// Real backend: expects backend to set HttpOnly cookie for access token
export async function loginReal(email: string, password: string): Promise<AuthUser> {
  const { token, displayName } = await loginRequest({ email, password });
  // Role derived locally (until backend returns role explicitly)
  const role = getUserRole(email);
  return { email, displayName, role, token };
}

export async function loadProfileReal(token?: string): Promise<AuthUser | null> {
  try {
    // If backend uses cookies, token isn't required; if it returns JSON profile include displayName
    const profile = await fetchProfile(token ?? '');
    const email: string | undefined = profile?.email;
    if (!email) return null;
    const role = getUserRole(email);
    const displayName: string = profile?.displayName ?? email.split('@')[0];
    return { email, displayName, role, token };
  } catch {
    return null;
  }
}

// Mock auth: match against known users by email only (password ignored)
export async function loginMock(email: string, _password: string): Promise<AuthUser> {
  await new Promise((r) => setTimeout(r, 200));
  const user = listKnownUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { email, displayName: email.split('@')[0], role: 'customer' };
  }
  return { email: user.email, displayName: user.displayName, role: user.role };
}

export async function loadProfileMock(): Promise<AuthUser | null> {
  return null; // No server profile in mock
}

export const authAdapter = {
  mode: () => (USE_MOCK ? 'mock' : 'real') as 'mock' | 'real',
  login: (email: string, password: string) => (USE_MOCK ? loginMock(email, password) : loginReal(email, password)),
  loadProfile: (token?: string) => (USE_MOCK ? loadProfileMock() : loadProfileReal(token)),
};
