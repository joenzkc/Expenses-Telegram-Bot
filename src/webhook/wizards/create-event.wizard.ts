import { Context, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { Scenes } from 'telegraf';

@Wizard('create-event')
export class CreateEventWizard {
  @WizardStep(1)
  step1(@Context() ctx: Scenes.WizardContext) {
    ctx.reply('Enter the name of the event:');
    ctx.wizard.next();
  }

  @WizardStep(2)
  @On('text')
  async step2(@Context() ctx: Scenes.SceneContext) {
    if (ctx.message && 'text' in ctx.message) {
      console.log(ctx.message.text);
    }
    ctx.scene.leave();
  }
}
