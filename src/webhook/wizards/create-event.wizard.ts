import { Context, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { CreateEventDto } from 'src/event/dto/create-event.dto';
import { EventService } from 'src/event/event.service';
import { Scenes } from 'telegraf';

@Wizard('create-event')
export class CreateEventWizard {
  constructor(private readonly eventService: EventService) {}
  @WizardStep(1)
  step1(@Context() ctx: Scenes.WizardContext) {
    ctx.reply('Enter the name of the event:');
    this.eventService.test();
    ctx.wizard.next();
  }

  @WizardStep(2)
  @On('text')
  async step2(@Context() ctx: Scenes.WizardContext) {
    if (ctx.message && 'text' in ctx.message) {
      console.log(ctx.message.text);
      ctx.wizard.state['event_name'] = ctx.message.text;
    }
    const event_name = ctx.wizard.state['event_name'];
    ctx.reply(
      `Event name: ${event_name} \n\nHow much budget would you like to set?`,
    );
    ctx.wizard.next();
  }

  @WizardStep(3)
  @On('text')
  async step3(@Context() ctx: Scenes.WizardContext) {
    if (ctx.message && 'text' in ctx.message) {
      const budget: number = Number(ctx.message.text);
      if (isNaN(budget)) {
        ctx.reply('Please input a valid number!');
        return;
      }
      const budgetRounded: number = Number(budget.toFixed(2));

      const eventDto: CreateEventDto = {
        telegram_id: ctx.message.from.username,
        event_name: ctx.wizard.state['event_name'],
        budget: budgetRounded,
      };

      console.log(eventDto);
    }
    ctx.reply('Your event has been created!');
    ctx.scene.leave();
  }
}
