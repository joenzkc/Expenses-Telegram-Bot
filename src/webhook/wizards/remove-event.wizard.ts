import { Action, Context, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { CreateEventDto } from 'src/event/dto/create-event.dto';
import { Event } from 'src/event/event.entity';
import { EventService } from 'src/event/event.service';
import { Markup, Scenes } from 'telegraf';
import { inlineKeyboard } from 'telegraf/typings/markup';

@Wizard('remove-event')
export class RemoveEventWizard {
  constructor(private readonly eventService: EventService) {}
  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    const telegram_id = ctx.message.from.username;
    const events: Event[] = await this.eventService.getActiveEvents(
      telegram_id,
    );
    const buttons = [];
    if (events.length == 0) {
      ctx.reply('You have no active events!');
      ctx.scene.leave();
      return;
    }
    let reply = 'Select the event to remove: \n';
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      ctx.wizard.state[`${i + 1}`] = event;
      reply += `${i + 1}: <b>${event.event_name}</b> \n`;
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
    const event = ctx.wizard.state[chosen];
    let reply = `Your chosen event:\n\n`;
    reply += `<b>Event name: ${event.event_name}</b>\n`;
    reply += `Budget: ${event.budget}\n\n`;
    reply += `Confirm deletion?`;
    ctx.replyWithHTML(reply, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Yes', callback_data: `yes` },
            { text: 'No', callback_data: `no` },
          ],
        ],
      },
    });
  }

  @Action(/^(yes|no)$/)
  async confirm(ctx: any) {
    const choice = ctx.callbackQuery.data;
    ctx.wizard.state['choice'] = choice == 'yes' ? 1 : 0;
    ctx.wizard.next();
    ctx.wizard.steps[ctx.wizard.cursor](ctx);
  }

  @WizardStep(3)
  async step3(ctx: Scenes.WizardContext) {
    const choice = ctx.wizard.state['choice'];
    const chosen = ctx.wizard.state['chosen'];
    const event = ctx.wizard.state[chosen];
    if (choice == 1) {
      await this.eventService.deactivateEvent(event.event_id);
      ctx.reply(
        'Event has been removed!',
        Markup.keyboard([
          ['View current event 💵', 'Add a transaction 🍟'],
          ['Set a new active event 🎈', 'Create a new event ✈'],
          ['Look at my events 👀', 'Look at last 20 transactions 😒'],
          ['Remove an event ❌', 'Unremove an event ✅'],
        ]).resize(),
      );
      ctx.scene.leave();
    } else {
      ctx.reply(
        'Event has not been removed.',
        Markup.keyboard([
          ['View current event 💵', 'Add a transaction 🍟'],
          ['Set a new active event 🎈', 'Create a new event ✈'],
          ['Look at my events 👀', 'Look at last 20 transactions 😒'],
          ['Remove an event ❌', 'Unremove an event ✅'],
        ]).resize(),
      );
      ctx.scene.leave();
    }
  }
}
