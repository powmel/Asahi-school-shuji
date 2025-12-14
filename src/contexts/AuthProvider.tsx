"use client";

import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import Cookies from 'js-cookie';

const ADMIN_UID = 'admin@example.com';

// Always logged in as admin for demonstration
const mockUser: User = {
  uid: ADMIN_UID,
  email: ADMIN_UID,
  name: '管理者',
};

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (uid: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(mockUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (uid: string) => {
    // Mock login is no longer needed
    return Promise.resolve();
  }, []);

  const logout = useCallback(() => {
    // Mock logout, but for now we want to stay logged in
    console.log("Logout function called, but disabled for demo.");
  }, []);

  const isAdmin = user?.uid === ADMIN_UID;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
