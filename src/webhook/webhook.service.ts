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
import * as moment from 'moment';

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
        ['Look at my events 👀', 'Look at last 20 transactions 😒'],
      ]).resize(),
    );
  }

  @Hears('Set a new active event 🎈')
  async setActiveEvent(ctx: Scenes.SceneContext) {
    ctx.scene.enter('set-active-event');
  }

  @Hears('Add a transaction 🍟')
  async addTransaction(ctx: Scenes.SceneContext) {
    ctx.scene.enter('add-transaction');
  }

  @Hears('Look at my events 👀')
  async lookAtEvents(ctx: Context) {
    ctx.reply('WIP!');
  }

  @Hears('Look at last 20 transactions 😒')
  async lookAtSpendingHistory(ctx: Context) {
    const telegram_id = ctx.message.from.username;
    const transactions: Transaction[] =
      await this.transactionService.retrieveAllTransactions(telegram_id);
    if (transactions.length == 0) {
      ctx.reply('You have not added any transactions!');
      return;
    }
    let reply = `<b>Last 20 transactions 💵:</b>\n`;
    for (let i = 0; i < transactions.length && i < 20; i++) {
      const transaction = transactions[i];
      const event = await this.eventsService.getEventWithId(
        transaction.event_id,
      );
      const time = moment.unix(transaction.created_at).format('DD/MM/YY HH:mm');
      reply += `${i + 1}: <b>${event.event_name}</b>, ${
        transaction.description
      }, $${transaction.cost} at ${time} \n`;
    }
    ctx.replyWithHTML(reply);
  }

  /**
   * Creates a new event for the user to add transactions to
   * @param ctx
   */
  @Hears('Create a new event ✈')
  async createEvent(ctx: Scenes.SceneContext) {
    ctx.scene.enter('create-event');
  }

  /**
   * Views the transactions in the current active event
   * @param ctx
   */
  @Hears('View current event 💵')
  async viewCurrentEvent(ctx: Context) {
    const telegram_id = ctx.message.from.username;
    const activeId = await this.usersService.getActiveEventId(telegram_id);
    if (!activeId) {
      ctx.reply('No active event!');
    } else {
      const event = await this.eventsService.getEventWithId(activeId);
      let reply = `<b>Current active event: ${event.event_name}</b>\n`;
      reply += `Total budget: $${Math.round(event.budget)}\n`;
      const transactions: Transaction[] =
        await this.transactionService.retrieveTransactionsEventId(event.id);
      reply += `Transaction log: \n`;
      if (transactions.length == 0) {
        reply += `No transactions recorded!\n`;
      }
      let totalSpent: number = 0;
      for (let i = 0; i < transactions.length; i++) {
        const date = transactions[i].created_at;
        // Hours part from the timestamp
        const time = moment.unix(date).format('DD/MM/YY HH:mm').toString();
        reply += `${i + 1}: ${transactions[i].description}, $${
          transactions[i].cost
        } at ${time}\n`;
        console.log(`Transaction ${i} cost: ${transactions[i].cost}`);
        totalSpent += +transactions[i].cost;
      }
      console.log(totalSpent);
      const remaining = event.budget - totalSpent;
      if (remaining < 0) {
        reply += `Remaining: You have exceeded your budget by  😒\n`;
      } else {
        reply += `Remaining: $${remaining}`;
      }

      ctx.replyWithHTML(reply);
    }
  }
}
