import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginResponse } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
type UserRole = 'guest' | 'user' | 'admin';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  isUser?: boolean;
  isActive?: boolean;

  address?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}


interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (email: string, purpose?: 'REGISTER' | 'FORGOT_PASSWORD') => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, otp: string, purpose?: 'REGISTER' | 'FORGOT_PASSWORD') => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, mobile: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  getToken: () => string | null;
  getRole: () => UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        // Invalid stored data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
      }
    }
    setIsLoading(false);
  }, []);

  const setAuthData = (response: LoginResponse) => {
    const { access_token, user: userData } = response;

    const authUser: AuthUser = {
      id: userData.id || userData._id || '',
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      isUser: userData.isUser,
      isActive: userData.isActive,
      address: userData.address || {},
    };

    // Store in localStorage
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(authUser));
    localStorage.setItem('role', userData.role);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('mobile', userData.mobile || '');
    localStorage.setItem('UserName', userData.name);
    localStorage.setItem('isUser', JSON.stringify(userData.isUser));

    setUser(authUser);
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login({ email, password });

      setAuthData(response.data);

      // ❌ REMOVE mergeCartOnLogin
      // await cartService.mergeCartOnLogin();

      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };


  const sendOtp = async (email: string, purpose: 'REGISTER' | 'FORGOT_PASSWORD' = 'REGISTER'): Promise<{ success: boolean; error?: string }> => {
    try {
      if (purpose === 'FORGOT_PASSWORD') {
        await authService.sendForgotOtp(email);
      } else {
        await authService.sendOtp({ email, purpose });
      }
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send OTP.';
      return { success: false, error: message };
    }
  };

  const verifyOtp = async (
    email: string,
    otp: string,
    purpose: 'REGISTER' | 'FORGOT_PASSWORD' = 'REGISTER'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await authService.verifyOtp({ email, otp, purpose });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid OTP.';
      return { success: false, error: message };
    }
  };

  const register = async (
    name: string,
    email: string,
    mobile: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.register({
        name,
        email,
        mobile,
        password,
      });

      setAuthData(response.data);

      // ❌ REMOVE mergeCartOnLogin
      // await cartService.mergeCartOnLogin();

      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Registration failed.';
      return { success: false, error: message };
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('mobile');
    localStorage.removeItem('UserName');
    localStorage.removeItem('isUser');

    setUser(null);

    navigate('/', { replace: true });
  };


  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  const getRole = (): UserRole => {
    if (!user) return 'guest';
    return user.role || 'guest';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        sendOtp,
        verifyOtp,
        register,
        logout,
        isAdmin: user?.role === 'admin',
        getToken,
        getRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
