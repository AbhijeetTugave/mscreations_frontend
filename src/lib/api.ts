import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

import { API_URL } from "@/lib/config";

const api = axios.create({
  baseURL: API_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  //   'Accept-Version': 'v1',
  // },
   withCredentials: true,
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {

    const requestUrl = error.config?.url || "";

    // Skip auth handling for ALL auth-related routes
    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/send-otp') ||
      requestUrl.includes('/auth/verify-otp') ||
      requestUrl.includes('/auth/reset-password'); 

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // Only redirect if user actually had a session
    const hasToken = localStorage.getItem('token');

    if (
      hasToken &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('my_cart');

      toast({
        title: 'Session Expired',
        description: 'Please login again.',
        variant: 'destructive',
      });

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
