import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from './users.service';
import { PublicUser } from './types/user.model';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  create(@Body() body: {name: string; email: string, role?: 'user' | 'admin'}): Observable<PublicUser> {
      return this.users.create({
        name: body.name,
        email: body.email,
        role: body.role ?? 'user',
      });
  }

  // Get /users
  @Get()
  findAll(): Observable<PublicUser[]> {
    return this.users.findAll();
  }

  // GET /users/:id
  @Get(':id')
  findOne(@Param('id') id: string): Observable<PublicUser> {
    return this.users.findOne(id);
  }

  @Patch(':id')
  updatePatch(@Param('id') id: string, @Body() body: { name?: string; email?: string; role?: 'user' | 'admin'}): Observable<PublicUser> {
    return this.users.updatePatch(id, body);
  }

  @Put(':id')
  updatePut(@Param('id') id: string, @Body() body: Omit<PublicUser, 'id'>): Observable<PublicUser>{
    return this.users.updatePut(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('hard', new DefaultValuePipe(true), ParseBoolPipe) hard: boolean): Observable< { success: true } > {
    return this.users.remove(id, hard);
  }
}
