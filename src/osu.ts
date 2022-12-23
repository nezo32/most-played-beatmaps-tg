import { v2, auth } from "osu-api-extended";
import { response as IUserResponse } from "osu-api-extended/dist/api/v2/routes/user/details"
import mostplayedGenerator from "./mostplayed";

export type modes = 'osu' | 'fruits' | 'mania' | 'taiko';

export class Osu {
    public userInstance: IUserResponse;

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
        await auth.login(Number(process.env.CLIENT_ID!), process.env.CLIENT_SECRET!);
        const instance = new Osu(name, mode);
        await instance.setUserInstanse();
        return instance;
    }

    public getMostPlayedBeatmaps(limit: number, offset?: number) {
        return mostplayedGenerator(limit, this.userInstance.id);
    }
}