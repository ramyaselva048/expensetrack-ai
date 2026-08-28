import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, CurrencyCode } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  loginAsDemo: () => void;
  signup: (userData: { name: string; email: string; password?: string; role?: string; companyName?: string }) => { success: boolean; message?: string };
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
}

export const DEMO_USER: UserProfile & { password?: string } = {
  id: 'demo-user-1',
  name: 'Alex Sterling',
  email: 'alex.sterling@expensetrack.io',
  password: 'demo',
  role: 'Chief Financial Officer',
  companyName: 'Apex Enterprise Technologies',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currency: 'INR',
  monthlyBudget: 250000,
  joinedDate: '2025-01-15',
};

const USERS_STORAGE_KEY = 'expensetrack_users_v1';
const SESSION_STORAGE_KEY = 'expensetrack_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      // Ensure demo user is seeded in registered users list
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      let users: (UserProfile & { password?: string })[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      
      const demoExists = users.some(u => u.email.toLowerCase() === DEMO_USER.email.toLowerCase());
      if (!demoExists) {
        users.push(DEMO_USER);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }

      // Check current session
      const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSession) {
        const parsedSession: UserProfile = JSON.parse(storedSession);
        // Refresh with latest saved user profile data
        const matched = users.find(u => u.id === parsedSession.id) || parsedSession;
        setCurrentUser(matched);
      } else {
        // When user first opens the site, do NOT show dashboard before login. First page shown is Login / Signup!
        setCurrentUser(null);
      }
    } catch (e) {
      console.error('Error loading auth session:', e);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, password?: string): { success: boolean; message?: string } => {
    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const users: (UserProfile & { password?: string })[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [DEMO_USER];
      
      const normalizedEmail = email.trim().toLowerCase();
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        return { success: false, message: 'No registered account found with this email. Please sign up.' };
      }

      // If user has a password set, verify it
      if (user.password && password && user.password !== password) {
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }

      setCurrentUser(user);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
      return { success: true };
    } catch (e) {
      return { success: false, message: 'An error occurred while signing in.' };
    }
  };

  const loginAsDemo = () => {
    setCurrentUser(DEMO_USER);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(DEMO_USER));
  };

  const signup = (userData: { name: string; email: string; password?: string; role?: string; companyName?: string }): { success: boolean; message?: string } => {
    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      const users: (UserProfile & { password?: string })[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [DEMO_USER];
      
      const normalizedEmail = userData.email.trim().toLowerCase();
      if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        return { success: false, message: 'An account with this email already exists. Please log in.' };
      }

      const newUser: UserProfile & { password?: string } = {
        id: `usr-${Date.now()}`,
        name: userData.name.trim(),
        email: normalizedEmail,
        password: userData.password,
        role: userData.role || 'Finance Manager',
        companyName: userData.companyName || 'My Organization',
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.name)}`,
        currency: 'INR',
        monthlyBudget: 200000,
        joinedDate: new Date().toISOString().split('T')[0],
      };

      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Auto log in new user upon signup
      setCurrentUser(newUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));

      return { success: true };
    } catch (e) {
      return { success: false, message: 'Could not complete registration. Please try again.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated: UserProfile = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));

    // Update in all users list
    try {
      const storedUsersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsersRaw) {
        const users: UserProfile[] = JSON.parse(storedUsersRaw);
        const idx = users.findIndex(u => u.id === currentUser.id);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...updatedData };
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
      }
    } catch (e) {
      console.error('Failed to sync updated user in storage', e);
    }
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
