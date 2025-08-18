import { Controller, Get } from '@nestjs/common';
import { AppService, DbHealth } from './app.service';

@Controller()
export class AppController {

constructor(private readonly appService: AppService, private readonly dbHealth: DbHealth){}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('health/db')
  async getDbHealth() {
    return this.dbHealth.getDbHealth();
  }
}