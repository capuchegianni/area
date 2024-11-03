export interface DiscordGuild {
    id: string;
    name: string;
    icon: string;
    banner: string;
    owner: boolean;
    permissions: string;
    features: string[];
    approximate_member_count: number;
    approximate_presence_count: number;
}

export type DiscordGuildsResponse = DiscordGuild[];
