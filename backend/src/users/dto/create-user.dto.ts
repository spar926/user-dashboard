import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';

// dto/create-user.dto.ts
export class CreateUserDto {
  @IsString() @Length(1, 80)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';
}