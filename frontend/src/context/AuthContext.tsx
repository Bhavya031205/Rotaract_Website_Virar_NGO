import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// 1. Define the User Interface
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER'; 
  image?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (name: string, image?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 1. Initialize state from sessionStorage (Wipes when tab closes)
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  });

  // 2. Login: Save to sessionStorage
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  // 3. Logout: Clear session & Redirect
  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Force hard redirect to login page to clear any app state
    window.location.href = '/login';
  };

  // 4. Update Profile: Sync with sessionStorage
  const updateUser = (name: string, image?: string) => {
    if (user) {
      const updatedUser = { ...user, name, image };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!token, 
      login, 
      logout, 
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};