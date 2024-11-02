import { AreaDiscordEmbed } from "../discord/interfaces/discordEmbed.interface";
import { AreaYouTubeVideo } from "../youtube/interfaces/youtubeVideo.interface";

export interface AreaServiceAuth {
    readonly apiKey?: string;
    readonly oauth?: string;
    readonly webhook?: string;
}

export interface ActionResource {
    data: AreaYouTubeVideo;
    cacheValue: string;
}

export interface ActionDescription {
    description: string;
    oauthScopes?: string[];
    auth?: keyof AreaServiceAuth;
    authProvider?: string;
    trigger: (auth: AreaServiceAuth) => Promise<ActionResource>;
}

export interface ReactionDescription {
    description: string;
    oauthScopes?: string[];
    auth?: keyof AreaServiceAuth;
    authProvider?: string;
    produce: (auth: AreaServiceAuth, data: AreaDiscordEmbed) => Promise<void>;
}
