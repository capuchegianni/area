import axios, { AxiosRequestConfig } from "axios";
import { ForbiddenException } from "@nestjs/common";
import {
    ActionDescription,
    ActionResource
} from "../interfaces/service.interface";
import { AreaTwitchStreamer } from "./interfaces/twitch-streamer.interface";
import { AreaTwitchStreams, AreaTwitchStream } from "./interfaces/twitch-stream.interface";
import { AreaTwitchFollowers, AreaTwitchFollower } from "./interfaces/twitch-follower.interface";

async function getStreams(accessToken: string, streamer_name: string): Promise<AreaTwitchStreams> {
    const url = "https://api.twitch.tv/helix/streams";
    const config: AxiosRequestConfig = {
        params: {
            user_login: streamer_name,
            type: "live"
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    try {
        const response = await axios.get<{ data: AreaTwitchStreams }>(url, config);
        return response.data.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            throw new ForbiddenException("Access token expired.");
        }
        throw error;
    }
}

function stream_started(accessToken: string, streamer: AreaTwitchStreamer): Promise<ActionResource> {
    return new Promise(async (resolve, reject) => {
        try {
            const streams = await getStreams(accessToken, streamer.name);
            if (streams.data.length === 0) {
                return reject(new Error('User is not streaming'));
            }
            const twitchStream: AreaTwitchStream = streams[0];
            return resolve({
                data: twitchStream,
                cacheValue: twitchStream.id
            });
        } catch (error) {
            reject(error);
        }
    });
}

function new_follower(accessToken: string, streamer: AreaTwitchStreamer): Promise<ActionResource> {
    const url = "https://api.twitch.tv/helix/channels/followers";
    const config: AxiosRequestConfig = {
        params: {
            broadcaster_id: streamer.id,
            first: 1
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    return new Promise((resolve, reject) => {
        axios
            .get<AreaTwitchFollowers>(url, config)
            .then(({ data }) => {
                if (1 !== data.data.length) {
                    return resolve({ data: null, cacheValue: "" });
                }
                const follower = data.data[0];
                return resolve({
                    data: follower,
                    cacheValue: follower.user_id
                });
            })
            .catch((e) => {
                if (401 === e.status) {
                    return reject(new ForbiddenException("Access token expired."));
                }
                return reject(e);
            });
    });
}

function stream_ended(accessToken: string, streamer: AreaTwitchStreamer): Promise<ActionResource> {
    return new Promise(async (resolve, reject) => {
        try {
            const streams = await getStreams(accessToken, streamer.name);
            if (streams.data.length === 0) {
                return resolve({ data: 'Stream ended', cacheValue: null });
            } else {
                reject(new Error('User is still streaming'));
            }
        } catch (error) {
            reject(error);
        }
    });
}

export const TWITCH_ACTIONS: { [name: string]: ActionDescription } = {
    stream_started: {
        description: "This event is triggered once the user starts a stream.",
        oauthScopes: [""],
        oauthProvider: "twitch",
        trigger: stream_started
    },
    new_follower: {
        description: "This event is triggered once the user gets a new follower.",
        oauthScopes: ["moderator:read:followers"],
        oauthProvider: "twitch",
        trigger: new_follower
    },
    stream_ended: {
        description: "This event is triggered once the user ends a stream.",
        oauthScopes: [""],
        oauthProvider: "twitch",
        trigger: stream_ended
    }
};
