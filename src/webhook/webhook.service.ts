import { Injectable } from '@nestjs/common';
import { Hears, InjectBot, Start, Update } from 'nestjs-telegraf';
import { EventService } from 'src/event/event.service';
import { CreateLogDto } from 'src/log/dto/create-log.dto';
import { LogService } from 'src/log/log.service';
import { Transaction } from 'src/transaction/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import { UsersService } from 'src/users/users.service';
import { Context, Telegraf, Markup, Scenes } from 'telegraf';

@Injectable()
@Update()
export class WebhookService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private usersService: UsersService,
    private eventsService: EventService,
    private logService: LogService,
    private transactionService: TransactionService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    const telegram_id = ctx.message.from.username;
    const name = ctx.message.from.first_name;
    const time = ctx.message.date;
    const users = await this.usersService.findUserTelegramId(telegram_id);
    if (!users) {
      await ctx.reply(
        'Welcome to Cells In Life bot! Creating a new profile for you...',
      );
      const userDto: CreateUserDto = { telegram_id, name };
      await this.usersService.createUser(userDto);
      const log: CreateLogDto = {
        telegram_id,
        type: 'CREATE_USER',
        time,
      };
      await this.logService.createLog(log);
      await ctx.reply('User profile created successfully!');
      return;
    }

    await ctx.reply(
      `Welcome back ${name}! What would you like to do today?`,
      Markup.keyboard([
        ['View current event 💵', 'Add a transaction 🍟'],
        ['Set a new active event 🎈', 'Create a new event ✈'],
        ['Look at my events 👀', 'Look at my spending history 😒'],
      ]).resize(),
    );
  }

  @Hears('Set a new active event 🎈')
  async setActiveEvent(ctx: Scenes.SceneContext) {
    ctx.scene.enter('set-active-event');
  }

  @Hears('Add a transaction 🍟')
  async addTransaction(ctx: Context) {
    ctx.reply('WIP!');
  }

  @Hears('Look at my events 👀')
  async lookAtEvents(ctx: Context) {
    ctx.reply('WIP!');
  }

  @Hears('Look at my spending history 😒')
  async lookAtSpendingHistory(ctx: Context) {
    ctx.reply('WIP!');
  }

  @Hears('Create a new event ✈')
  async createEvent(ctx: Scenes.SceneContext) {
    ctx.scene.enter('create-event');
  }

  @Hears('View current event 💵')
  async viewCurrentEvent(ctx: Context) {
    const telegram_id = ctx.message.from.username;
    const activeId = await this.usersService.getActiveEventId(telegram_id);
    if (!activeId) {
      ctx.reply('No active event!');
    } else {
      const event = await this.eventsService.getEventWithId(activeId);
      let reply = `*Current active event: ${event.event_name}*\n`;
      reply += `Total budget: \\$${Math.round(event.budget)}\n`;
      reply += `Remaining: \n`;
      const transactions: Transaction[] =
        await this.transactionService.retrieveTransactionsEventId(event.id);
      reply += `Transaction log: \n`;
      if (transactions.length == 0) {
        reply += `No transactions recorded\\!\n`;
      }
      for (let i = 0; i < transactions.length; i++) {
        reply += `${i}: ${transactions[i].description}, \\$${transactions[i].cost} at ${transactions[i].created_at}`;
      }
      ctx.replyWithMarkdownV2(reply);
    }
  }
}
