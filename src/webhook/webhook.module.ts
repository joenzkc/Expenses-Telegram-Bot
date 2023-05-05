import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { LogModule } from 'src/log/log.module';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [ConfigModule, TelegrafModule, UsersModule, LogModule, EventModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
