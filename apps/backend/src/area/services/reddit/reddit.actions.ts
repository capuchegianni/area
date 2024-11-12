import axios, { AxiosRequestConfig } from "axios";
import { ForbiddenException } from "@nestjs/common";
import {
    ActionDescription,
    ActionResource
} from "../interfaces/service.interface";

function new_post_in_sub(
    accessToken: string,
    metadata: object
): Promise<ActionResource> {
    const url = `https://oauth.reddit.com/r/${metadata["subredditName"]}/new`;
    const config: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await axios.get(url, config);
            const newestPost = data.data.children[0].data;
            return resolve({
                data: newestPost,
                cacheValue: JSON.stringify({ id: newestPost.id })
            });
        } catch (e) {
            if (e.response && e.response.status === 403) {
                reject(new ForbiddenException("Access token expired."));
            } else {
                reject(e);
            }
        }
    });
}

function new_comment_on_post(
    accessToken: string, // eslint-disable-line
    metadata: object // eslint-disable-line
): Promise<ActionResource> {
    return new Promise(async (resolve, reject) => {}); // eslint-disable-line
}

function new_vote_on_comment(
    accessToken: string, // eslint-disable-line
    metadata: object // eslint-disable-line
): Promise<ActionResource> {
    return new Promise(async (resolve, reject) => {}); // eslint-disable-line
}

export const REDDIT_ACTIONS: { [name: string]: ActionDescription } = {
    stream_started: {
        description: "This event is triggered once the user starts a stream.",
        oauthScopes: [""],
        oauthProvider: "reddit",
        metadata: { subredditName: "The subreddit's name" },
        trigger: new_post_in_sub
    },
    new_follower: {
        description:
            "This event is triggered once the user gets a new follower.",
        oauthScopes: ["moderator:read:followers"],
        oauthProvider: "reddit",
        metadata: { streamerName: "The streamer's ID" },
        trigger: new_comment_on_post
    },
    stream_ended: {
        description: "This event is triggered once the user ends a stream.",
        oauthScopes: [""],
        oauthProvider: "reddit",
        metadata: { streamerName: "The streamer's username" },
        trigger: new_vote_on_comment
    }
};
