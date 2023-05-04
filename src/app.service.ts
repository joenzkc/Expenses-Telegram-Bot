import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const env = process.env.TELEGRAM_BOT_TOKEN + " hello";
    return env;
  }
}
