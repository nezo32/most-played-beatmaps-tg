import { v2, auth } from "osu-api-extended";
import { response as IUserResponse } from "osu-api-extended/dist/api/v2/routes/user/details"
import mostplayedGenerator from "./mostplayed";

export type modes = 'osu' | 'fruits' | 'mania' | 'taiko';

export class Osu {
    public static async GetInstance(name: string | number, mode: modes): Promise<IUserResponse> {
        await auth.login(Number(process.env.CLIENT_ID!), process.env.CLIENT_SECRET!);
        return await v2.user.details(name, mode);
    }

    public static getMostPlayedBeatmaps(id: number, limit: number = 10) {
        return mostplayedGenerator(limit, id);
    }
}