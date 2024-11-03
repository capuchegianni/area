import axios, { AxiosRequestConfig } from "axios";
import { YouTubeVideoListResponse } from "./interfaces/youtube-video.interface";
import { ForbiddenException } from "@nestjs/common";
import {
    ActionDescription,
    ActionResource
} from "../interfaces/service.interface";
import {
    transformYoutubeSubscriberToArea as transformYoutubeSubscriptionToArea,
    transformYouTubeVideoToArea
} from "./youtube.transformers";
import { YouTubeSubscribersResponse as YouTubeSubcriptionsResponse } from "./interfaces/youtube-subscribers.interface";

function onLikedVideo(accessToken: string): Promise<ActionResource> {
    const url = "https://www.googleapis.com/youtube/v3/videos";
    const config: AxiosRequestConfig = {
        params: {
            part: "id,snippet,statistics",
            myRating: "like",
            maxResults: 1
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
    return new Promise((resolve, reject) => {
        axios
            .get<YouTubeVideoListResponse>(url, config)
            .then(({ data }) => {
                if (1 !== data.items.length) return null;
                const youtubeVideo = data.items[0];
                return resolve({
                    data: transformYouTubeVideoToArea(youtubeVideo),
                    cacheValue: youtubeVideo.id
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

function onNewSubscription(accessToken: string): Promise<ActionResource> {
    const url = "https://www.googleapis.com/youtube/v3/subscriptions";
    const config: AxiosRequestConfig = {
        params: {
            part: "contentDetails,snippet,subscriberSnippet",
            mine: true,
            maxResults: 1
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    return new Promise((resolve, reject) => {
        axios
            .get<YouTubeSubcriptionsResponse>(url, config)
            .then(({ data }) => {
                if (1 !== data.items.length)
                    return resolve({ data: null, cacheValue: "" });
                const youtubeSubscription = data.items[0];
                return resolve({
                    data: transformYoutubeSubscriptionToArea(
                        youtubeSubscription
                    ),
                    cacheValue: youtubeSubscription.id
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

export const YOUTUBE_ACTIONS: { [name: string]: ActionDescription } = {
    on_liked_video: {
        description: "This event is triggered once a video has been liked.",
        oauthScopes: ["https://www.googleapis.com/auth/youtube.readonly"],
        oauthProvider: "google",
        trigger: onLikedVideo
    },
    on_new_subscriber: {
        description:
            "This event is triggered once a YouTube user subscribes to your channel.",
        oauthScopes: ["https://www.googleapis.com/auth/youtube.readonly"],
        oauthProvider: "google",
        trigger: onNewSubscription
    }
};
