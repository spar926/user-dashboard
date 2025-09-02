import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { EmailService } from './services/email.service';

@Module({
    imports: [WebsocketModule], 
    controllers: [UsersController],
    providers: [UsersService, EmailService],
})

export class UserModule {}
