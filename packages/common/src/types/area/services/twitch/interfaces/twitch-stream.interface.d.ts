export declare class AreaTwitchStream {
    readonly id: string;
    readonly user_id: string;
    readonly user_login: string;
    readonly user_name: string;
    readonly game_id: string;
    readonly game_name: string;
    readonly type: string;
    readonly title: string;
    readonly tags: string;
    readonly viewer_count: string;
    readonly started_at: string;
    readonly language: string;
    readonly thumbnail_url: string;
    readonly tag_ids: string;
    readonly is_mature: string;
}
declare class Pagination {
    readonly cursor: string;
}
export declare class AreaTwitchStreams {
    readonly data: AreaTwitchStream[];
    readonly pagination: Pagination;
}
export {};
