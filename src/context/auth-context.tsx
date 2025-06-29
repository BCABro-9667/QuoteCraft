'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserCredentials, User } from '@/types';
import { login as loginAction, register as registerAction } from '@/lib/actions/auth.actions';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  loading: boolean;
  login: (credentials: UserCredentials) => Promise<{ success: boolean; message: string }>;
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
    try {
      const loggedInUser = sessionStorage.getItem('logged-in-user');
      if (loggedInUser) {
        setUser(JSON.parse(loggedInUser));
      }
    } catch (e) {
      console.error('Failed to parse user from sessionStorage', e);
      sessionStorage.removeItem('logged-in-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: UserCredentials): Promise<{ success: boolean; message: string }> => {
    const result = await loginAction(credentials);
    if (result.success && result.user) {
      const userToSave = { id: result.user.id, email: result.user.email, firstName: result.user.firstName, lastName: result.user.lastName };
      setUser(userToSave);
      sessionStorage.setItem('logged-in-user', JSON.stringify(userToSave));
      return { success: true, message: 'Login successful!' };
    }
    return { success: false, message: result.message || 'Invalid email or password.' };
  }, []);

  const register = useCallback(async (credentials: UserCredentials): Promise<{ success: boolean; message: string }> => {
    const result = await registerAction(credentials);
    if (result.success && result.user) {
        const userToSave = { id: result.user.id, email: result.user.email, firstName: result.user.firstName, lastName: result.user.lastName };
        setUser(userToSave);
        sessionStorage.setItem('logged-in-user', JSON.stringify(userToSave));
        return { success: true, message: 'Registration successful!' };
    }
    return { success: false, message: result.message || 'An error occurred during registration.' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('logged-in-user');
    // We use replace here to prevent the user from going back to the authenticated route
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
