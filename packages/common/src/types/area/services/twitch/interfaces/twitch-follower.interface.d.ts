export declare class AreaTwitchFollower {
    readonly followed_at: string;
    readonly user_id: string;
    readonly user_login: string;
    readonly user_name: string;
}
declare class Pagination {
    readonly cursor: string;
}
export declare class AreaTwitchFollowers {
    readonly data: AreaTwitchFollower[];
    readonly pagination: Pagination;
    readonly total: number;
}
export {};
