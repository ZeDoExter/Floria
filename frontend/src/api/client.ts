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

const unwrapApiData = <T>(response: any): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
};

export const loginRequest = async (credentials: Credentials): Promise<AuthResponse> => {
  const response = await DefaultService.authControllerLogin(credentials);
  return unwrapApiData<AuthResponse>(response);
};

export const registerRequest = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await DefaultService.authControllerRegister(data);
  return unwrapApiData<AuthResponse>(response);
};

export const fetchProfile = async (token: string) => {
  // Token is automatically injected by OpenAPI.TOKEN config, so we don't strictly need to pass it here,
  // but we keep the parameter for backwards compatibility.
  const response = await DefaultService.authControllerProfile();
  return unwrapApiData(response);
};
