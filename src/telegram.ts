import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { Osu, modes } from "./osu";

export interface IPlayer {
    name?: string,
    mode?: modes,
}

export default class Telegram {
    private bot: Telegraf;
    private osu: Osu;

    private userInput: string = '';

    private userFromChat: Map<number, IPlayer> = new Map();

    private startButtons: ReturnType<typeof Markup.inlineKeyboard> = Markup.inlineKeyboard([
        [Markup.button.callback('Set User 👥', 'btn-1'), Markup.button.callback('Set mode 👁‍🗨', 'btn-2'),],
        [Markup.button.callback('Show mostplayed beatmaps', 'btn-3')],
    ]);

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
            try {
                this.userInput = 'mode';
                await ctx.answerCbQuery();
            } catch (err) {
                console.log(err);
            }
        });
    }

    private sendMostPlayed(act: string) {
        this.bot.action(act, async (ctx) => {
            let user;
            if (ctx.chat)
                user = this.userFromChat.get(ctx.chat.id);
            if (user?.mode && user?.name) {
                try {
                    this.osu = await Osu.GetInstance(user.name, user.mode);
                    if (Object.hasOwn(this.osu.userInstance, 'error')) {
                        ctx.reply("Пользователь не найден!", {
                            reply_markup: this.startButtons.reply_markup,
                        });
                        await ctx.answerCbQuery();
                        return;
                    }
                    const beatmapsGenerator = this.osu.getMostPlayedBeatmaps(10, 0);
                    const res = await beatmapsGenerator.next();
                    console.log(res);
                    if (res.value && !(res.value instanceof Error)) {
                        for (const [index, el] of res.value.entries()) {
                            try {
                                await ctx.replyWithPhoto(el.beatmapset.covers.card, {
                                    caption: index + 1 + "\t" + el.beatmapset.artist + " " + el.beatmapset.title + ": " + el.count
                                });
                            } catch (err) {
                                await ctx.reply(
                                    index + 1 + "\t" + el.beatmapset.artist + " " + el.beatmapset.title + ": " + el.count
                                );
                            }
                        }
                    }
                    await ctx.answerCbQuery();
                    ctx.reply("Продолжаем", {
                        reply_markup: this.startButtons.reply_markup,
                    });
                } catch (err) {
                    console.log(err);
                }
            } else {
                try {
                    ctx.reply("You need to enter the username and mode first!", {
                        reply_markup: this.startButtons.reply_markup,
                    })
                    await ctx.answerCbQuery();
                } catch (err) {
                    console.log(err);
                }
            }

        });
    }

    private action(act: string) {
        switch (act) {
            case 'btn-1':
                this.setUserName(act);
                break;
            case 'btn-2':
                this.setMode(act);
                break;
            case 'btn-3':
                this.sendMostPlayed(act);
                break;
        }
    }

    private onText() {
        this.bot.on(message('text'), (ctx) => {
            let currentUser = this.userFromChat.get(ctx.chat.id);
            if (this.userInput == 'user') {
                if (currentUser && currentUser.mode) {
                    this.userFromChat.set(ctx.chat.id, { name: ctx.message.text, mode: currentUser.mode });
                } else {
                    this.userFromChat.set(ctx.chat.id, { name: ctx.message.text });
                }
                this.userInput = '';
                ctx.reply(`Name ${ctx.message.text} saved`);
            }
            if (this.userInput == 'mode') {
                try {
                    let mode: modes;
                    switch (ctx.message.text) {
                        case "Standart": mode = 'osu'; break;
                        case "Mania": mode = 'mania'; break;
                        case "Taiko": mode = 'taiko'; break;
                        case "CTB": mode = 'fruits'; break;
                        default:
                            throw (new Error("Invalid mode type"));
                    }
                    this.userInput = '';
                    if (currentUser && currentUser.name) {
                        this.userFromChat.set(ctx.chat.id, { name: currentUser.name, mode: mode });
                    } else {
                        this.userFromChat.set(ctx.chat.id, { mode });
                    }
                    ctx.reply(`Mode ${ctx.message.text} saved`);
                } catch (err) {
                    if (err instanceof Error)
                        ctx.reply(`${err.message}\nTry again!`);
                }
            }

        })
    }

    private on(filter: Parameters<typeof message>[0]) {
        if (filter == 'text') {
            this.onText();
        }
    }

    private start(reply: string) {
        this.bot.start((ctx) => {
            ctx.reply(`${reply}`, {
                reply_markup: this.startButtons.reply_markup,
            });
        })
    }

    public async launch() {
        await this.bot.launch();
    }

    public stop() {
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }

    public constructor() {
        this.bot = new Telegraf(process.env.TELEGRAM_API!);
        this.start("Привет");
        this.on('text');

        this.action('btn-1');
        this.action('btn-2');
        this.action('btn-3');
    }
}