import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import * as dotenv from "dotenv";

import { Osu, modes } from "./osu";

dotenv.config();

export default class Telegram {
    private bot: Telegraf;
    private osu: Osu;

    private name: string;
    private mode: modes;
    private userInput: string = '';


    private actions = new Map<string, (a: string) => void>();

    private start(reply: string) {

        const buttons = Markup.inlineKeyboard([
            [Markup.button.callback('Set User 👥', 'btn-1'), Markup.button.callback('Set mode 👁‍🗨', 'btn-2'),],
            [Markup.button.callback('Show mostplayed beatmaps', 'btn-3')],
        ])

        this.bot.start((ctx) => {
            ctx.reply(`${reply}`, {
                reply_markup: buttons.reply_markup,
            });
        })
    }

    private setUserName(act: string) {
        this.bot.action(act, async (ctx) => {
            ctx.reply("Enter osu! username");
            this.userInput = 'user';
            try {
                await ctx.answerCbQuery();
            } catch (err) {
                console.log(err);
            }
        });
    }

    private setMode(act: string) {
        this.bot.action(act, async (ctx) => {

            const buttons = Markup.keyboard([
                [Markup.button.callback('Standart', 'mode-1'), Markup.button.callback('Mania', 'mode-2'),],
                [Markup.button.callback('Taiko', 'mode-3'), Markup.button.callback('CTB', 'mode-4'),],
            ]).resize().oneTime();

            ctx.reply("Enter osu! mode", {
                reply_markup: buttons.reply_markup,
            });
            this.userInput = 'mode';
            try {
                await ctx.answerCbQuery();
            } catch (err) {
                console.log(err);
            }
        });
    }

    private sendMostPlayed(act: string) {
        this.bot.action(act, async (ctx) => {
            if (this.mode && this.name) {
                try {
                    this.osu = await Osu.GetInstance(this.name, this.mode);
                    const beatmaps = await this.osu.getMostPlayedBeatmaps(10, 0);
                    const res = await beatmaps.get();
                    res.forEach(async (el, index) => {
                        await ctx.replyWithPhoto(el.beatmapset.covers.card, {
                            caption: index + 1 + "\t" + el.beatmapset.artist + " " + el.beatmapset.title + ": " + el.count
                        });
                    });
                    await ctx.answerCbQuery();
                } catch (err) {
                    console.log(err);
                }
            } else {
                try {
                    ctx.reply("You need to enter the username and mode first!");
                    await ctx.answerCbQuery();
                } catch (err) {
                    console.log(err);
                }
            }

        });
    }

    private action(act: string) {
        this.actions.get(act).call(this, act);
    }

    private on(filter: Parameters<typeof message>[0]) {
        if (filter == 'text') {
            this.bot.on(message(filter), (ctx) => {
                if (this.userInput == 'user') {
                    this.name = ctx.message.text;
                    this.userInput = '';
                    ctx.reply(`Name ${ctx.message.text} saved`);
                }
                if (this.userInput == 'mode') {

                    if (ctx.message.text == "Standart" || ctx.message.text == "Mania"
                        || ctx.message.text == "Taiko" || ctx.message.text == "CTB") {

                        switch (ctx.message.text) {
                            case "Standart": this.mode = 'osu'; break;
                            case "Mania": this.mode = 'mania'; break;
                            case "Taiko": this.mode = 'taiko'; break;
                            case "CTB": this.mode = 'fruits'; break;
                        }
                        this.userInput = '';
                        ctx.reply(`Mode ${ctx.message.text} saved`);
                    }
                    else {
                        ctx.reply("Invalid mode type. Try again");
                    }

                }
            })
        }
    }

    public async launch() {
        await this.bot.launch();
    }

    public stop() {
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }

    public constructor() {
        this.bot = new Telegraf(process.env.TELEGRAM_API);
        this.start("Привет");
        this.on('text');

        this.actions.set('btn-1', this.setUserName);
        this.actions.set('btn-2', this.setMode);
        this.actions.set('btn-3', this.sendMostPlayed);

        this.action('btn-1');
        this.action('btn-2');
        this.action('btn-3');
    }
}