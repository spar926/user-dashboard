import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';

// dto/update-user.dto.ts
export class UpdateUserDto {
  @IsOptional() @IsString() @Length(1, 80)
  name?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';
}

// dto/put-user.dto.ts
export class PutUserDto {
  @IsString() @Length(1, 80)
  name: string;

  @IsEmail()
  email: string;

  @IsIn(['user', 'admin'])
  role: 'user' | 'admin';
}
