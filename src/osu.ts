import { v2, auth } from "osu-api-extended";
import { response as IUserResponse } from "osu-api-extended/dist/api/v2/routes/user/details"
import { response as IMostPlayedResponse } from "osu-api-extended/dist/api/v2/routes/user/beatmaps/most_played";
import * as dotenv from "dotenv";

dotenv.config();

type modes = 'osu' | 'fruits' | 'mania' | 'taiko';

export default class Osu {
    private userInstance: IUserResponse;

    private user: string | number | undefined;
    private mode: modes | undefined;

    private async setUserInstanse() {
        if (this.user && this.mode)
            this.userInstance = await v2.user.details(this.user, this.mode);
    }

    private setUser(name: string | number, mode: modes) {
        this.user = name;
        this.mode = mode;
    }

    protected constructor(name: string | number, mode: modes) {
        this.setUser(name, mode);
    }

    public static async GetInstance(name: string | number, mode: modes) {
        await auth.login(Number(process.env.CLIENT_ID), process.env.CLIENT_SECRET);
        const instance = new Osu(name, mode);
        await instance.setUserInstanse();
        return instance;
    }

    public async getMostPlayedBeatmaps(limit: number, offset?: number) {
        return MostPlayed.Construct(this.userInstance.id, limit, offset);
    }
}

class MostPlayed {

    data: Array<IMostPlayedResponse>;
    id: number;
    limit: number;
    offset: number;

    public async next() {
        this.offset += this.offset;
        this.data = await v2.user.beatmaps.most_played(this.id, { limit: this.limit, offset: this.offset.toString() });
        return this.data;
    }

    public async get() {
        return this.data;
    }

    private async setData(id: number, limit: number, offset?: number) {
        this.id = id;
        this.limit = limit;
        this.offset = limit;
        this.data = await v2.user.beatmaps.most_played(id, { limit, offset: offset.toString() });
        return this;
    }

    public static async Construct(id: number, limit: number, offset?: number) {
        return new MostPlayed().setData(id, limit, offset);
    }

}