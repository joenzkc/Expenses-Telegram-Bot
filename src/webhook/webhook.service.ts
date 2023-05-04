import { Injectable } from '@nestjs/common';
import { InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
@Update()
export class WebhookService {
    constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

    @Start()
    async startCommand(ctx: Context) {
        await ctx.reply("Testing");
    }
}
