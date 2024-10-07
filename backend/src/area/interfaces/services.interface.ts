import { AreaDiscordEmbed } from "../services/discord/interfaces/discordEmbed.interface";
import { AreaYouTubeVideo } from "../services/youtube/interfaces/youtubeVideo.interface";

export type ActionTrigger = (accessToken: string) => Promise<AreaYouTubeVideo>;

export type ActionTriggers = {
    [name: string]: ActionTrigger;
};

export abstract class Action {
    abstract get triggers(): ActionTriggers;
    static get endpoints(): string[] {
        return [];
    }
}

export type ReactionTrigger = (
    fields: object,
    data: AreaDiscordEmbed
) => Promise<void>;

export type ReactionTriggers = {
    [name: string]: ReactionTrigger;
};

export abstract class Reaction {
    abstract get triggers(): ReactionTriggers;
    static get endpoints(): string[] {
        return [];
    }
}
