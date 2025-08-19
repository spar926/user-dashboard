import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';

// PATCH: partial update
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 80)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: 'user' | 'admin';
}

// PUT: full replacement
export class PutUserDto {
  @IsString()
  @Length(1, 80)
  name!: string;

  @IsEmail()
  email!: string;

  @IsIn(['user', 'admin'])
  role!: 'user' | 'admin';
}
