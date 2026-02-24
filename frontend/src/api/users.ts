import { DefaultService } from './index';

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

  const payload = response.data?.users;
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
  return response.data;
};
