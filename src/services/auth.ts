
import { api } from './api';
import { storage } from './storage';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  role: string;
  [key: string]: unknown;
}

interface AuthResponse {
  user: AuthUser;
  access_token: string;
  isNewUser?: boolean;
}

export const authService = {
  // Send OTP to the vendor's phone number
  async sendOtp(phone: string): Promise<unknown> {
    return api.post('/auth/send-otp', { phone });
  },
  
  
  // Login using email and password
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email: email.trim(),
      password,
    });

    if (!response.access_token) {
      throw new Error('Authentication token was not returned by the server.');
    }

    await storage.setAuthToken(response.access_token);
    return response;
  },

  // Verify OTP and save the backend JWT
  async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      '/auth/verify-otp-login',
      {
        phone,
        otp,
        role: 'VENDOR',
      },
    );

    if (!response.access_token) {
      throw new Error('Authentication token was not returned by the server.');
    }

    await storage.setAuthToken(response.access_token);

    return response;
  },

  // Fetch the authenticated user's profile
  async getProfile(): Promise<AuthUser> {
    return api.get<AuthUser>('/auth/me');
  },

  // Log out locally and clear the saved JWT
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      await storage.removeAuthToken();
    }
  },

  // Check whether a token exists on this device
  async isLoggedIn(): Promise<boolean> {
    const token = await storage.getAuthToken();
    return Boolean(token);
  },
};
