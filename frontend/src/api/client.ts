import axios from 'axios';
import { OpenAPI, DefaultService } from './index';

const API_BASE_URL: string = typeof __API_BASE_URL__ === 'string' ? __API_BASE_URL__ : 'http://localhost:3000';

OpenAPI.BASE = API_BASE_URL;
OpenAPI.TOKEN = async () => {
  const stored = localStorage.getItem('flora-tailor/auth');
  if (stored) {
    try {
      const auth = JSON.parse(stored);
      return auth?.token;
    } catch {
      // Ignore parse errors
    }
  }
  return undefined;
};

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  displayName: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const loginRequest = async (credentials: Credentials): Promise<AuthResponse> => {
  const data = await DefaultService.authControllerLogin(credentials);
  return data.data; // NestJS global interceptor shape: { statusCode, message, data }
};

export const registerRequest = async (data: RegisterData): Promise<AuthResponse> => {
  const responseData = await DefaultService.authControllerRegister(data);
  return responseData.data;
};

export const fetchProfile = async (token: string) => {
  // Token is automatically injected by OpenAPI.TOKEN config, so we don't strictly need to pass it here,
  // but we keep the parameter for backwards compatibility.
  const data = await DefaultService.authControllerProfile();
  return data.data;
};
