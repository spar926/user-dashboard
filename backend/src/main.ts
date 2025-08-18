import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

// load environment variables from .env
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable CORS so frontend (5173) can talk to backend (3000)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // allow frontend URL
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS', // allow HTTP verbs
    credentials: true // allow cookies, auth headers
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // strip unknown fields
    forbidNonWhitelisted: true, // error on unknown fields
    transform: true             // auto-cast primitives
  }));

  const port = Number(process.env.PORT) || 3000
  await app.listen(port);
  console.log(`API listening to ${port}`)
}
bootstrap();
