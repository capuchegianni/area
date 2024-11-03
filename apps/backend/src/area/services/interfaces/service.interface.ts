import { DiscordGuild } from "../discord/interface/discord-guilds.interface";
import { AreaTwitchStream } from "../twitch/interfaces/twitch-stream.interface";
import { AreaTwitchFollower } from "../twitch/interfaces/twitch-follower.interface";

import {
    AreaYouTubeSubscriber,
    AreaYouTubeVideo
} from "../youtube/interfaces/youtube-video.interface";

export interface ActionResource {
    data:
        | AreaYouTubeVideo
        | AreaYouTubeSubscriber
        | DiscordGuild
        | AreaTwitchStream
        | AreaTwitchFollower
        | string
        | null;
    cacheValue: string | null;
}

export interface ActionDescription {
    description: string;
    oauthScopes: string[];
    oauthProvider: string;
    metadata: object;
    trigger: (
        accessToken: string,
        metadata: object,
        previous?: object
    ) => Promise<ActionResource>;
}

export interface ReactionDescription {
    description: string;
    oauthScopes?: string[];
    oauthProvider: string;
    produce: (accessToken: string, data: object) => Promise<void>;
}
