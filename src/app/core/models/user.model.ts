export enum UserRole {
  User = 0,
  Admin = 1
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}