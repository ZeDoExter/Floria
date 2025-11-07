export const isAdminEmail = (email?: string | null) => {
  if (!email) {
    return false;
  }

  return email.toLowerCase().includes('admin');
};
