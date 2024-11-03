import { YouTubeSubscriberResource as YouTubeSubscriptionResource } from "./interfaces/youtube-subscribers.interface";
import {
    YouTubeVideo,
    AreaYouTubeVideo,
    AreaYouTubeSubscriber as AreaYouTubeSubscription
} from "./interfaces/youtube-video.interface";

export function transformYouTubeVideoToArea(
    raw: YouTubeVideo
): AreaYouTubeVideo {
    const {
        default: low,
        medium,
        high,
        standard,
        maxres
    } = raw.snippet.thumbnails;
    return {
        id: raw.id,
        url: `https://youtube.com/watch?v=${raw.id}`,
        title: raw.snippet.title,
        description: raw.snippet.description,
        channelName: raw.snippet.channelTitle,
        channelId: raw.snippet.channelId,
        likes: +raw.statistics.likeCount,
        views: +raw.statistics.viewCount,
        publishedAt: new Date(raw.snippet.publishedAt),
        tags: raw.snippet.tags,
        thumbnail: (maxres ?? standard ?? high ?? medium ?? low).url
    };
}

export function transformYoutubeSubscriberToArea(
    raw: YouTubeSubscriptionResource
): AreaYouTubeSubscription {
    const { default: low, medium, high } = raw.snippet.thumbnails;
    return {
        id: raw.snippet.channelId,
        name: raw.snippet.title,
        description: raw.snippet.description,
        thumbnail: (high ?? medium ?? low).url,
        subscribedAt: raw.snippet.publishedAt,
        url: `https://www.youtube.com/channel/${raw.snippet.channelId}`
    };
}
