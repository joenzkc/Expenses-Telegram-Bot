import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { LogModule } from 'src/log/log.module';
import { EventModule } from 'src/event/event.module';
import { session } from 'telegraf';
import { CreateEventWizard } from './wizards/create-event.wizard';
import { SetActiveEventWizard } from './wizards/set-active-event.wizard';

@Module({
  imports: [
    ConfigModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get('TELEGRAM_BOT_TOKEN'),
        middlewares: [session()],
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    LogModule,
    EventModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, CreateEventWizard, SetActiveEventWizard],
})
export class WebhookModule {}
