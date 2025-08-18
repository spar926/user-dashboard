// dto/update-user.dto.ts
export class UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'user' | 'admin';
  isActive: boolean;
}

// dto/put-user.dto.ts
export class PutUserDto {
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
}
