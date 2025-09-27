'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.data.user);
    } catch (error) {
      Cookies.remove('auth_token');
      Cookies.remove('user_role');
    } finally {
      setLoading(false);
    }
  };

  const login = async (employeeId: string, password: string) => {
    try {
      console.log('Attempting login with:', { employeeId });
      const response = await api.post('/auth/login', { employeeId, password });
      console.log('Login response:', response.data);
      
      const { token, user: userData } = response.data.data;
      
      Cookies.set('auth_token', token, { expires: 7 });
      Cookies.set('user_role', userData.role, { expires: 7 });
      setUser(userData);
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw new Error(error.response?.data?.message || `Login failed: ${error.message}`);
    }
  };

  const logout = () => {
    Cookies.remove('auth_token');
    Cookies.remove('user_role');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}