import { Controller, Get, Post, Body} from '@nestjs/common';
import { AppService, DbHealthStatus, UserHealthStatus } from './app.service';
import { firstValueFrom } from 'rxjs';

@Controller('/health')
export class AppController {

constructor(private readonly appService: AppService){}

  @Get()
  getHealth() {
    return this.appService.getHealth();
  }

  @Post() 
  async getUser(@Body('name') name: string): Promise<UserHealthStatus> {
    return await firstValueFrom(this.appService.getHealthUser(name));
  }

  @Get('/db')
  async getDbHealth(): Promise<DbHealthStatus> {
    return await firstValueFrom(this.appService.getDbHealth());
  }
}