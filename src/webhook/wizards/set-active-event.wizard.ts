import { Context, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { CreateEventDto } from 'src/event/dto/create-event.dto';
import { Event } from 'src/event/event.entity';
import { EventService } from 'src/event/event.service';
import { UsersService } from 'src/users/users.service';
import { Markup, Scenes } from 'telegraf';

@Wizard('set-active-event')
export class SetActiveEventWizard {
  constructor(
    private readonly eventService: EventService,
    private readonly userService: UsersService,
  ) {}
  @WizardStep(1)
  async step1(@Context() ctx: Scenes.WizardContext) {
    if (ctx.message && 'text' in ctx.message) {
      const telegram_id = ctx.message.from.username;
      const activeEvents: Event[] = await this.eventService.getActiveEvents(
        telegram_id,
      );
      let reply = '*Select an event from your current events* 👀\n';
      const buttons: string[] = [];
      for (let i = 0; i < activeEvents.length; i++) {
        reply += `${i + 1}: ${activeEvents[i].event_name} \n`;
        buttons[i] = `${activeEvents[i].event_name}`;
      }
      ctx.replyWithMarkdownV2(reply, Markup.keyboard(buttons).oneTime());
      ctx.wizard.next();
    }
  }

  @WizardStep(2)
  @On('text')
  async step2(@Context() ctx: Scenes.WizardContext) {
    if (ctx.message && 'text' in ctx.message) {
      const telegram_id = ctx.message.from.username;
      const event_name = ctx.message.text;
      const event = await this.eventService.getEvent(telegram_id, event_name);
      await this.userService.setActiveEventId(telegram_id, event.id);
      let reply = '*New active event set\\!* \n\n';
      reply += '*Event Details:*\n';
      reply += `Event name: ${event_name} \n`;
      // console.log(event.budget);
      const budget = Math.round(event.budget);
      reply += `Budget: ${budget}`;
      ctx.replyWithMarkdownV2(
        reply,
        Markup.keyboard([
          ['View current event 💵', 'Add a transaction 🍟'],
          ['Set a new active event 🎈', 'Create a new event ✈'],
          ['Look at my events 👀', 'Look at last 20 transactions 😒'],
          ['Remove an event ❌', 'Unremove an event ✅'],
        ]),
      );
      // console.log(event_name);
      ctx.scene.leave();
    }
  }
}
