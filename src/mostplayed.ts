import { v2 } from "osu-api-extended";
import { response as IMostPlayedResponse } from "osu-api-extended/dist/api/v2/routes/user/beatmaps/most_played";

export default class MostPlayed {

    private data: Array<IMostPlayedResponse>;
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