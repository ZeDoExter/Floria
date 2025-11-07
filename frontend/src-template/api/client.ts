import axios from 'axios';

const API_BASE_URL: string = typeof __API_BASE_URL__ === 'string' ? __API_BASE_URL__ : 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  displayName: string;
}

export const loginRequest = async (credentials: Credentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const fetchProfile = async (token: string) => {
  const response = await apiClient.get('/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
