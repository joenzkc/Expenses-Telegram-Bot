import { Injectable } from '@nestjs/common';
import { InjectBot, Start, Update } from 'nestjs-telegraf';
import { EventService } from 'src/event/event.service';
import { CreateLogDto } from 'src/log/dto/create-log.dto';
import { LogService } from 'src/log/log.service';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import { UsersService } from 'src/users/users.service';
import { Context, Telegraf, Markup } from 'telegraf';

@Injectable()
@Update()
export class WebhookService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private usersService: UsersService,
    private eventsService: EventService,
    private logService: LogService,
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
        ['Create a new event ✈', 'Look at my spending history 😒'],
        ['Look at my events 👀', 'Add a transaction 💵'],
      ])
        .oneTime()
        .resize(),
    );
  }
}
