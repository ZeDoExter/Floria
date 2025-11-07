import { apiClient } from './client';

export type DirectoryUser = {
  email: string;
  displayName: string;
  role: string;
  description: string;
  capabilities: string[];
};

export type DirectoryResponse = {
  users: DirectoryUser[];
};

export const fetchDirectory = async (token: string) => {
  const response = await apiClient.get<DirectoryResponse>('/admin/users', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const payload = response.data?.users;
  if (!Array.isArray(payload)) {
    return [] as DirectoryUser[];
  }

  return payload.map((user) => ({
    ...user,
    capabilities: Array.isArray(user.capabilities) ? user.capabilities : []
  }));
};
