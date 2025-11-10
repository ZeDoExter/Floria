import axios from 'axios';

const API_BASE_URL: string = typeof __API_BASE_URL__ === 'string' ? __API_BASE_URL__ : 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

// Add token to all requests automatically
apiClient.interceptors.request.use((config) => {
  const stored = localStorage.getItem('flora-tailor/auth');
  if (stored) {
    try {
      const auth = JSON.parse(stored);
      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  return config;
});

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
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const registerRequest = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const fetchProfile = async (token: string) => {
  const response = await apiClient.get('/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
