import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot( { isGlobal: true }), // make env variables globally via process.env
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
