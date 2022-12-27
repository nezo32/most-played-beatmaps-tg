import { v2 } from "osu-api-extended";

export default async function* mostplayedGenerator(limit: number, id?: number) {
    let offset = 0;
    try {
        while (true) {
            if (!id) return;
            yield await v2.user.beatmaps.most_played(id, { limit, offset: offset.toString() });
            offset += limit
        }
    } catch (error) {
        throw Error("Beatmaps ended");
    }
}