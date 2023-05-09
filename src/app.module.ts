import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/users.entity';
import { WebhookModule } from './webhook/webhook.module';
import { LogModule } from './log/log.module';
import { Log } from './log/log.entity';
import { EventModule } from './event/event.module';
import { Event } from './event/event.entity';
import { session } from 'telegraf';
import { TransactionModule } from './transaction/transaction.module';
import { Transaction } from './transaction/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'admin',
      database: 'expenses_telegram_bot',
      entities: [User, Log, Event, Transaction],
      synchronize: true,
    }),
    UsersModule,
    WebhookModule,
    LogModule,
    EventModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
