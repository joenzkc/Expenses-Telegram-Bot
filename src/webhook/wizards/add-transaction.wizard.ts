import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { EventService } from 'src/event/event.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { UsersService } from 'src/users/users.service';
import { Scenes } from 'telegraf';

@Wizard('add-transaction')
export class AddTransactionWizard {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly userService: UsersService,
    private readonly eventService: EventService,
  ) {}
  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    if (ctx.message && 'text' in ctx.message) {
      const telegram_id = ctx.message.from.username;
      const activeEventId = await this.userService.getActiveEventId(
        telegram_id,
      );
      if (!activeEventId) {
        ctx.reply('No active event! Please set an active event first');
        ctx.scene.leave();
      }
      ctx.wizard.state['event_id'] = activeEventId;
      const activeEvent = await this.eventService.getEventWithId(activeEventId);
      ctx.replyWithHTML(
        `Adding a transaction to <b>${activeEvent.event_name}</b>...\nEnter the name of the transaction: `,
      );
      ctx.wizard.next();
    }
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    if (ctx.message && 'text' in ctx.message) {
      if (ctx.message.text == '/cancel') {
        await ctx.reply('Cancelling...');
        await ctx.scene.leave();
        return;
      }
      const telegram_id = ctx.message.from.username;
      const transaction_name = ctx.message.text;
      ctx.wizard.state['transaction_name'] = transaction_name;
      ctx.wizard.state['created_at'] = ctx.message.date;
      let reply = `<b>Transaction name</b>: ${transaction_name}\n`;
      reply += `Enter the cost of the event:`;
      ctx.replyWithHTML(reply);
      ctx.wizard.next();
    }
  }

  @WizardStep(3)
  async step3(@Context() ctx: Scenes.WizardContext) {
    if (ctx.message && 'text' in ctx.message) {
      if (ctx.message.text == '/cancel') {
        await ctx.reply('Cancelling...');
        await ctx.scene.leave();
        return;
      }
      const cost: number = Number(ctx.message.text);
      if (isNaN(cost)) {
        ctx.reply('Please input a valid number!');
        return;
      }
      const costRounded: number = Number(cost.toFixed(2));
      const transactionDto: CreateTransactionDto = {
        event_id: ctx.wizard.state['event_id'],
        created_at: ctx.wizard.state['created_at'],
        cost: costRounded,
        telegram_id: ctx.message.from.username,
        description: ctx.wizard.state['transaction_name'],
      };

      await this.transactionService.createTransaction(transactionDto);
      await ctx.reply('Transaction created!');
      await ctx.scene.leave();
    }
  }
}
