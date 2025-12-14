"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import Cookies from 'js-cookie';

const ADMIN_UID = 'admin@example.com';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (uid: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userCookie = Cookies.get('user');
      if (userCookie) {
        const parsedUser = JSON.parse(userCookie);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error("Failed to parse user cookie", e);
      Cookies.remove('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((uid: string) => {
    const userData = { uid: uid, email: uid };
    setLoading(true); // Prevent UI flicker during redirect
    setUser(userData);
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
    // setLoading will be false on the new page load's useEffect
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    Cookies.remove('user');
    window.location.href = '/login';
  }, []);

  const isAdmin = user?.uid === ADMIN_UID;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
