import api from '@/lib/api';

export interface LoginResponse {
  access_token: string;
  user: {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    mobile: string;
    role: 'user' | 'admin';
    isUser: boolean;
    isActive: boolean;

    address?: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
}


export interface RegisterData {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', data),

  sendOtp: (data: { email: string; purpose: 'REGISTER' | 'FORGOT_PASSWORD' }) =>
    api.post('/auth/send-otp', data),

  verifyOtp: (data: { email: string; otp: string; purpose: 'REGISTER' | 'FORGOT_PASSWORD' }) =>
    api.post('/auth/verify-otp', data),

  register: (data: RegisterData) =>
    api.post<LoginResponse>('/auth/register', data),

  // Forgot password specific endpoints
  sendForgotOtp: (email: string) =>
    api.post('/auth/forgot/send-otp', { email }),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post('/auth/forgot/reset-password', data),
};
