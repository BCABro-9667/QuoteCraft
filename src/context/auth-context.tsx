'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { UserCredentials, User } from '@/types';
import useLocalStorage from '@/hooks/use-local-storage';

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
  const [users, setUsers] = useLocalStorage<User[]>('auth-users', []);
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
    const existingUser = users.find(u => u.email === credentials.email && u.password === credentials.password);
    if (existingUser) {
      const userToSave = { id: existingUser.id, email: existingUser.email };
      setUser(userToSave);
      sessionStorage.setItem('logged-in-user', JSON.stringify(userToSave));
      return { success: true, message: 'Login successful!' };
    }
    return { success: false, message: 'Invalid email or password.' };
  }, [users]);

  const register = useCallback(async (credentials: UserCredentials): Promise<{ success: boolean; message: string }> => {
    if (!credentials.password) {
        return { success: false, message: 'Password is required.' };
    }
    const existingUser = users.find(u => u.email === credentials.email);
    if (existingUser) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: new Date().getTime().toString(),
      email: credentials.email,
      password: credentials.password,
    };
    setUsers([...users, newUser]);
    const userToSave = { id: newUser.id, email: newUser.email };
    setUser(userToSave);
    sessionStorage.setItem('logged-in-user', JSON.stringify(userToSave));
    return { success: true, message: 'Registration successful!' };
  }, [users, setUsers]);

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
