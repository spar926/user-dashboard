// dto/create-user.dto.ts
export class CreateUserDto {
  email: string;
  name: string;
  role?: 'user' | 'admin';
}