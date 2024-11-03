export interface YouTubeSubscriberResourceThumbnail {
    url: string;
    width: number;
    height: number;
}

export interface YouTubeSubscriberResource {
    kind: "youtube#subscription";
    etag: string;
    id: string;
    snippet: {
        publishedAt: Date;
        channelTitle: string;
        title: string;
        description: string;
        resourceId: {
            kind: string;
            channelId: string;
        };
        channelId: string;
        thumbnails: {
            default: YouTubeSubscriberResourceThumbnail;
            medium: YouTubeSubscriberResourceThumbnail;
            high: YouTubeSubscriberResourceThumbnail;
        };
    };
    contentDetails: {
        totalItemCount: number;
        newItemCount: number;
        activityType: string;
    };
    subscriberSnippet: {
        title: string;
        description: string;
        channelId: string;
        thumbnails: {
            default: YouTubeSubscriberResourceThumbnail;
            medium: YouTubeSubscriberResourceThumbnail;
            high: YouTubeSubscriberResourceThumbnail;
        };
    };
}

export interface YouTubeSubscribersResponse {
    kind: "youtube#subscriptionListResponse";
    etag: string;
    nextPageToken: string;
    prevPageToken: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YouTubeSubscriberResource[];
}
