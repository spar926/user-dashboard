import { PublicUser } from '../types/user.model';

export function isUser(object: unknown): object is PublicUser {
  if (
    typeof object === 'object' &&
    object !== null &&
    'id' in object &&
    'name' in object &&
    'email' in object &&
    'role' in object
  ) {
    return true;
  }
  return false;
}
