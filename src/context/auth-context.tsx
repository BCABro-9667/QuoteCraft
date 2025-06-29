'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserCredentials, User } from '@/types';
import { login as loginAction, register as registerAction, logout as logoutAction, getCurrentUser } from '@/lib/actions/auth.actions';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  loading: boolean;
  login: (credentials: UserCredentials) => Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }>;
  register: (credentials: UserCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This effect runs once on mount on the client side
    // to check if there is an active session from the secure cookie.
    const checkSession = async () => {
        const session = await getCurrentUser();
        if (session?.user) {
            setUser(session.user);
        }
        setLoading(false);
    }
    checkSession();
  }, []);

  const login = useCallback(async (credentials: UserCredentials): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }> => {
    setLoading(true);
    const result = await loginAction(credentials);
    if (result.success && result.user) {
      setUser(result.user);
    }
    setLoading(false);
    return { success: result.success, message: result.message, user: result.user };
  }, []);

  const register = useCallback(async (credentials: UserCredentials): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const result = await registerAction(credentials);
    if (result.success && result.user) {
        setUser(result.user);
    }
    setLoading(false);
    return { success: result.success, message: result.message };
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await logoutAction();
    setUser(null);
    setLoading(false);
    // We use replace here to prevent the user from going back to the authenticated route
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
