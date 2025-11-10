export interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  displayName?: string;
}
