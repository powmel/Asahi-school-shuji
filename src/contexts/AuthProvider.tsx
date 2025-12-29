"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'admin@example.com';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        setUser(userData);
      } catch (error) {
        console.error("Failed to parse user cookie:", error);
        Cookies.remove('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string) => {
    const isUserAdmin = email === ADMIN_EMAIL;
    const userData: User = {
      uid: email, // Using email as UID for simplicity in this mock
      email: email,
      name: isUserAdmin ? '管理者' : `生徒 ${email.split('@')[0].replace('student', '')}`,
    };
    Cookies.set('user', JSON.stringify(userData), { expires: 1 });
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    Cookies.remove('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
