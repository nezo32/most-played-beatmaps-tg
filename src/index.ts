import { Osu } from "./osu";
import Telegram from "./telegram";

const bot = new Telegram();

await bot.launch();

bot.stop();