import { DefaultService } from './index';

const unwrapApiData = <T>(response: any): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T;
  }
  return response as T;
};

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

export type UserProfile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  description?: string;
};

export const fetchDirectory = async (token: string) => {
  const response = await DefaultService.usersControllerList();
  const payload = unwrapApiData<DirectoryResponse>(response)?.users;
  if (!Array.isArray(payload)) {
    return [] as DirectoryUser[];
  }

  return payload.map((user: any) => ({
    ...user,
    capabilities: Array.isArray(user.capabilities) ? user.capabilities : []
  }));
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await DefaultService.usersControllerGetUser(userId);
  return unwrapApiData<UserProfile>(response);
};
