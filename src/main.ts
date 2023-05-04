import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getBotToken } from 'nestjs-telegraf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const token = configService.get('TELEGRAM_BOT_TOKEN'); 
  const port = configService.get('PORT')
  await app.listen(port | 3000);
  console.log(
    `NestJS listening on Port ${port}`
  )
}
bootstrap();
