import type { DiscordGuild } from "../types/area/services/discord/interface/discord-guilds.interface";
import type {
    AreaYouTubeSubscriber,
    AreaYouTubeVideo
} from "../types/area/services/youtube/interfaces/youtube-video.interface";
import type { AreaTwitchStream } from "../types/area/services/twitch/interfaces/twitch-stream.interface";
import type { AreaTwitchFollower } from "../types/area/services/twitch/interfaces/twitch-follower.interface";
import type { AreaGmailMail } from "../types/area/services/gmail/interfaces/gmail-mail.interface";

const discordGuild: (keyof DiscordGuild)[] = [
    "id",
    "name",
    "icon",
    "banner",
    "owner",
    "permissions",
    "features",
    "approximate_member_count",
    "approximate_presence_count"
];

const youtubeVideo: (keyof AreaYouTubeVideo)[] = [
    "id",
    "url",
    "title",
    "description",
    "channelName",
    "channelId",
    "likes",
    "views",
    "publishedAt",
    "tags",
    "thumbnail"
];

const youtubeSubscriber: (keyof AreaYouTubeSubscriber)[] = [
    "id",
    "name",
    "description",
    "thumbnail",
    "subscribedAt",
    "url"
];

const twitchStream: (keyof AreaTwitchStream)[] = [
    "id",
    "user_id",
    "user_login",
    "user_name",
    "game_id",
    "game_name",
    "type",
    "title",
    "tags",
    "viewer_count",
    "started_at",
    "language",
    "thumbnail_url",
    "tag_ids",
    "is_mature"
];

const twitchFollower: (keyof AreaTwitchFollower)[] = [
    "followed_at",
    "user_id",
    "user_login",
    "user_name"
];

const gmailMail: (keyof AreaGmailMail)[] = [
    "to",
    "from",
    "subject",
    "body"
];

// TODO: add missing (Reddit...)
export const ACTIONS: Record<string, string[]> = {
    "discord.on_guild_join": discordGuild,
    "discord.on_guild_leave": discordGuild,
    "youtube.on_liked_video": youtubeVideo,
    "youtube.on_new_subscriber": youtubeSubscriber,
    "youtube.on_new_uploaded_video": youtubeVideo,
    "twitch.stream_started": twitchStream,
    "twitch.new_follower": twitchFollower,
    "twitch.stream_ended": twitchStream,
    "gmail.on_new_mail": gmailMail
};

export function actionFields(action: string): string[] {
    return ACTIONS[action] || [];
}
