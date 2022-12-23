import { Osu } from "./osu";

const osu = await Osu.GetInstance("nezo", "osu");

const check = await osu.getMostPlayedBeatmaps(10, 10);
const res = await check.next();
const andNext = await check.next();

/* import Telegram from "./telegram";

const bot = new Telegram();

await bot.launch();

bot.stop();
 */