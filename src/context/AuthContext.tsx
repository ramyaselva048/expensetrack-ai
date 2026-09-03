import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { authAPI, getStoredToken } from '../services/api';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: () => Promise<void>;
  signup: (userData: { name: string; email: string; password?: string; role?: string; companyName?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
}

export const DEMO_USER: UserProfile = {
  id: 'demo-user-1',
  name: 'Alex Sterling',
  email: 'alex.sterling@expensetrack.io',
  role: 'Chief Financial Officer',
  companyName: 'Apex Enterprise Technologies',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'INR',
  monthlyBudget: 250000,
  joinedDate: '2026-01-15',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and check persistent JWT session from backend
  useEffect(() => {
    async function checkSession() {
      const token = getStoredToken();
      if (!token) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (res.success && res.user) {
          setCurrentUser({
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            role: res.user.role || 'Finance Manager',
            companyName: res.user.companyName || 'Enterprise Technologies',
            avatarUrl: res.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            currency: (res.user.currency as any) || 'INR',
            monthlyBudget: 250000,
            joinedDate: new Date().toISOString().split('T')[0]
          });
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        authAPI.logout();
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();

    // Listen to unauthorized 401 events dispatched by API client
    const handleUnauthorized = () => {
      setCurrentUser(null);
    };
    window.addEventListener('expensetrack:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('expensetrack:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password = ''): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.success && res.user) {
        const profile: UserProfile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role || 'Finance Manager',
          companyName: res.user.companyName || 'Enterprise Technologies',
          avatarUrl: res.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          currency: (res.user.currency as any) || 'INR',
          monthlyBudget: 250000,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setCurrentUser(profile);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'An error occurred during authentication.' };
    }
  };

  const loginAsDemo = async () => {
    await login('alex.sterling@expensetrack.io', 'demo');
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    companyName?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await authAPI.register({
        name: userData.name,
        email: userData.email,
        password: userData.password || 'password123',
        companyName: userData.companyName,
        role: userData.role,
        currency: 'INR'
      });

      if (res.success && res.user) {
        const profile: UserProfile = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role || 'Finance Manager',
          companyName: res.user.companyName || userData.companyName || 'Enterprise Technologies',
          avatarUrl: res.user.avatarUrl,
          currency: 'INR',
          monthlyBudget: 200000,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setCurrentUser(profile);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Could not complete registration.' };
    }
  };

  const logout = () => {
    authAPI.logout();
    setCurrentUser(null);
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        loginAsDemo,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
