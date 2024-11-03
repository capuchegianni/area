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
    console.log("FROM CACHE", previous);
    return new Promise((resolve, reject) => {
        axios
            .get<DiscordGuildsResponse>(url, config)
            .then(({ data }) => {
                if (!previous) {
                    return resolve({
                        data: data,
                        cacheValue: JSON.stringify(
                            data.map((guild) => guild.id)
                        )
                    });
                }
                const newlyJoinedGuilds = data.filter(
                    (guild) => !previous.includes(guild.id)
                );
                if (0 === newlyJoinedGuilds.length) return null;
                return resolve({
                    data: newlyJoinedGuilds,
                    cacheValue: JSON.stringify(data.map((guild) => guild.id))
                });
            })
            .catch((e) => {
                if (403 === e.status) {
                    return reject(
                        new ForbiddenException("Access token expired.")
                    );
                }
                return reject(e);
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
                        data,
                        cacheValue: JSON.stringify(currentGuildsIds)
                    });
                }
                const newlyLeftGuilds = previous
                    .filter((guild) => !currentGuildsIds.includes(guild))
                    .map((guildId) =>
                        data.find((guild) => guild.id === guildId)
                    );
                if (0 === newlyLeftGuilds.length) return null;
                return resolve({
                    data: newlyLeftGuilds,
                    cacheValue: JSON.stringify(currentGuildsIds)
                });
            })
            .catch((e) => {
                if (403 === e.status)
                    return reject(
                        new ForbiddenException("Access token expired.")
                    );
                return reject(e);
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
