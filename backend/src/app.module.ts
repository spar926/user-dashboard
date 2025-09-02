import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './users/users.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot( { isGlobal: true }), // make env variables globally via process.env
    UserModule,
    WebsocketModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
