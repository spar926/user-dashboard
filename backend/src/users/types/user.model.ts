export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
}
