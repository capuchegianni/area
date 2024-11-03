import axios, { AxiosRequestConfig } from "axios";
import {
    ActionDescription,
    ActionResource
} from "../interfaces/service.interface";
import { ForbiddenException } from "@nestjs/common";
import {
    DiscordGuild,
    DiscordGuildsResponse
} from "./interface/discord-guilds.interface";

async function onGuildJoin(
    accessToken: string,
    previous: DiscordGuild["id"][] = []
): Promise<ActionResource> {
    const url = "https://discord.com/api/users/@me/guilds";
    const config: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
    return new Promise((resolve, reject) => {
        axios
            .get<DiscordGuildsResponse>(url, config)
            .then(({ data }) => {
                if (!previous) {
                    return resolve({
                        data: data[0] ?? null,
                        cacheValue: JSON.stringify(
                            data.map((guild) => guild.id)
                        )
                    });
                }
                const newlyJoinedGuilds = data.filter(
                    (guild) => !previous.includes(guild.id)
                );
                if (1 !== newlyJoinedGuilds.length) return null;
                return resolve({
                    data: newlyJoinedGuilds[0],
                    cacheValue: JSON.stringify(data.map((guild) => guild.id))
                });
            })
            .catch((e) => {
                if (403 === e.status)
                    return reject(
                        new ForbiddenException("Access token expired.")
                    );
                if (429 === e.status) {
                    const retryAfter = Math.ceil(
                        e.response.headers["X-RateLimit-Reset-After"]
                    );
                    const timeout = setTimeout(
                        async () => {
                            const data = await onGuildLeave(
                                accessToken,
                                previous
                            );
                            clearTimeout(timeout);
                            return resolve(data);
                        },
                        (retryAfter + 1) * 1000
                    );
                } else return reject(e);
            });
    });
}

async function onGuildLeave(
    accessToken: string,
    previous: DiscordGuild["id"][] = []
): Promise<ActionResource> {
    const url = "https://discord.com/api/users/@me/guilds";
    const config: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
    return new Promise((resolve, reject) => {
        axios
            .get<DiscordGuildsResponse>(url, config)
            .then(({ data }) => {
                const currentGuildsIds = data.map((guild) => guild.id);
                if (!previous) {
                    return resolve({
                        data: null,
                        cacheValue: JSON.stringify(currentGuildsIds)
                    });
                }

                const newlyLeftGuilds = previous.filter(
                    (guild) => !currentGuildsIds.includes(guild)
                );

                if (1 !== newlyLeftGuilds.length)
                    return resolve({
                        data: null,
                        cacheValue: JSON.stringify(currentGuildsIds)
                    });
                return resolve({
                    data: {
                        id: newlyLeftGuilds[0],
                        approximate_member_count: 0,
                        approximate_presence_count: 0,
                        banner: "",
                        features: [],
                        icon: "",
                        name: "UNKNOWN_GUILD",
                        owner: false,
                        permissions: ""
                    } satisfies DiscordGuild,
                    cacheValue: JSON.stringify(currentGuildsIds)
                });
            })
            .catch((e) => {
                if (403 === e.status)
                    return reject(
                        new ForbiddenException("Access token expired.")
                    );
                if (429 === e.status) {
                    const retryAfter = Math.ceil(
                        e.response.headers["X-RateLimit-Reset-After"]
                    );
                    const timeout = setTimeout(
                        async () => {
                            const data = await onGuildLeave(
                                accessToken,
                                previous
                            );
                            clearTimeout(timeout);
                            return resolve(data);
                        },
                        (retryAfter + 1) * 1000
                    );
                } else return reject(e);
            });
    });
}

export const DISCORD_ACTIONS: { [name: string]: ActionDescription } = {
    on_guild_join: {
        description: "Triggers an event when a Discord guid is joined.",
        oauthProvider: "discord",
        oauthScopes: ["guilds"],
        trigger: onGuildJoin
    },
    on_guild_leave: {
        description: "Triggers an event when a Discord guild is left.",
        oauthProvider: "discord",
        oauthScopes: ["guilds"],
        trigger: onGuildLeave
    }
};
