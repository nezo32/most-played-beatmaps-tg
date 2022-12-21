import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import * as dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_API);



bot.start((ctx) => { ctx.reply(`Привет`) });

bot.on(message('sticker'), (ctx) => {
    ctx.reply('👍');
})

export default class Telegram {
    bot: Telegraf;

    private start(reply: string) {
        this.bot.start((ctx) => {
            ctx.reply(`${reply}`);
        })
    }

    public async launch() {
        await this.bot.launch();
    }

    public stop() {
        process.once('SIGINT', () => bot.stop('SIGINT'));
        process.once('SIGTERM', () => bot.stop('SIGTERM'));
    }

    public constructor() {
        this.bot = new Telegraf(process.env.TELEGRAM_API);
        this.start("aboba");
    }
}