import { Action, Context, On, Wizard, WizardStep } from 'nestjs-telegraf';
import buttons from 'src/common/buttons';
import { CreateEventDto } from 'src/event/dto/create-event.dto';
import { EventService } from 'src/event/event.service';
import { Transaction } from 'src/transaction/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import { UsersService } from 'src/users/users.service';
import { Markup, Scenes } from 'telegraf';
import { inlineKeyboard } from 'telegraf/typings/markup';
import * as moment from 'moment';

@Wizard('edit-transaction')
export class EditTransactionWizard {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly userService: UsersService,
  ) {}
  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    const telegram_id = ctx.message.from.username;
    const active_event_id = await this.userService.getActiveEventId(
      telegram_id,
    );
    const transactions: Transaction[] =
      await this.transactionService.retrieveTransactionsEventId(
        active_event_id,
      );
    const buttons = [];
    if (transactions.length == 0) {
      ctx.reply('The active event has no transactions!');
      ctx.scene.leave();
      return;
    }
    let reply = 'Select the transaction to edit: \n';
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      const time = moment
        .unix(transaction.created_at)
        .format('DD-MM-YYYY HH:mm a');

      ctx.wizard.state[`${i + 1}`] = transaction;
      reply += `${i + 1}: <b>${transaction.description}</b> Cost: ${
        transaction.cost
      } Created at ${time}\n`;
      if (i % 5 === 0) {
        buttons.push([]);
      }

      // add the button to the last row
      const row = buttons[buttons.length - 1];
      row.push({ text: i + 1, callback_data: `action:${i + 1}` });
    }
    ctx.replyWithHTML(reply, {
      reply_markup: { inline_keyboard: buttons },
      reply_to_message_id: ctx.message.message_id,
    });
  }

  @Action(/action:([1-9]|[1-9][0-9]{1,4}|100000)/)
  selectEvent(@Context() ctx: any) {
    const [, data] = ctx.callbackQuery.data.split(':');
    // save data for next step in ctx.wizard.state
    ctx.wizard.state['chosen'] = data;
    ctx.wizard.next();
    ctx.wizard.steps[ctx.wizard.cursor](ctx);
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    const chosen = ctx.wizard.state['chosen'];
    const transaction = ctx.wizard.state[chosen];
    console.log(transaction);
    const time = moment
      .unix(transaction.created_at)
      .format('DD-MM-YYYY HH:mm a');
    let reply = `<b>Chosen transaction:</b> ${transaction.description}\n`;
    reply += `<b>Cost:</b> ${transaction.cost}\n`;
    reply += `<b>Created at:</b> ${time}\n`;
    reply += `Which property would you like to edit?`;
    const buttons = [
      { text: 'Description', callback_data: `change:description` },
      { text: 'Cost', callback_data: `change:cost` },
    ];
    ctx.replyWithHTML(reply, { reply_markup: { inline_keyboard: [buttons] } });
  }

  @Action(/change:.+/)
  selectChange(ctx: any) {
    const [, data] = ctx.callbackQuery.data.split(':');
    ctx.wizard.state['change'] = data;
    ctx.wizard.next();
    ctx.wizard.steps[ctx.wizard.cursor](ctx);
  }

  @WizardStep(3)
  async step3(ctx: Scenes.WizardContext) {
    const change = ctx.wizard.state['change'];
    let reply = '';
    if (change == 'description') {
      reply += `Type in the new description:`;
    } else if (change == 'cost') {
      reply += `Type in the new cost:`;
    }
    ctx.replyWithHTML(reply);
    ctx.wizard.next();
  }

  @On('text')
  @WizardStep(4)
  async step4(ctx: Scenes.WizardContext) {
    if (ctx.message && 'text' in ctx.message) {
      const change = ctx.wizard.state['change'];
      const chosen = ctx.wizard.state['chosen'];
      const transaction = ctx.wizard.state[chosen];
      let reply = '';
      let transactionObject: Transaction = null;
      if (change == 'description') {
        const newDescription = ctx.message.text;
        transactionObject =
          await this.transactionService.updateTransactionDescription(
            transaction.id,
            newDescription,
          );
      } else if (change == 'cost') {
        const costNumber = Number(ctx.message.text);
        if (isNaN(costNumber)) {
          ctx.reply('Please input a valid number!');
          return;
        }
        transactionObject = await this.transactionService.updateTransactionCost(
          transaction.id,
          costNumber,
        );
      }
      const time = moment
        .unix(transaction.created_at)
        .format('DD-MM-YYYY HH:mm a');
      console.log(transactionObject);
      reply += `Your transaction has been updated!\n`;
      reply += `<b>Description:</b> ${transactionObject.description}\n`;
      reply += `<b>Cost:</b> ${transactionObject.cost}\n`;
      reply += `<b>Created at:</b> ${time}\n`;
      ctx.replyWithHTML(reply, Markup.keyboard(buttons).resize());
      ctx.scene.leave();
    }
  }

  // @WizardStep(2)
  // async step2(@Context() ctx: Scenes.WizardContext) {
  //   const chosen = ctx.wizard.state['chosen'];
  //   const event = ctx.wizard.state[chosen];
  //   let reply = `Your chosen event:\n\n`;
  //   reply += `<b>Event name: ${event.event_name}</b>\n`;
  //   reply += `Budget: ${event.budget}\n\n`;
  //   reply += `Confirm deletion?`;
  //   ctx.replyWithHTML(reply, {
  //     reply_markup: {
  //       inline_keyboard: [
  //         [
  //           { text: 'Yes', callback_data: `yes` },
  //           { text: 'No', callback_data: `no` },
  //         ],
  //       ],
  //     },
  //   });
  // }

  // @Action(/^(yes|no)$/)
  // async confirm(ctx: any) {
  //   const choice = ctx.callbackQuery.data;
  //   ctx.wizard.state['choice'] = choice == 'yes' ? 1 : 0;
  //   ctx.wizard.next();
  //   ctx.wizard.steps[ctx.wizard.cursor](ctx);
  // }

  // @WizardStep(3)
  // async step3(ctx: Scenes.WizardContext) {
  //   const choice = ctx.wizard.state['choice'];
  //   const chosen = ctx.wizard.state['chosen'];
  //   const event = ctx.wizard.state[chosen];
  //   if (choice == 1) {
  //     await this.eventService.deactivateEvent(event.event_id);
  //     ctx.reply('Event has been removed!', Markup.keyboard(buttons).resize());
  //     ctx.scene.leave();
  //   } else {
  //     ctx.reply(
  //       'Event has not been removed.',
  //       Markup.keyboard(buttons).resize(),
  //     );
  //     ctx.scene.leave();
  //   }
  // }
}
