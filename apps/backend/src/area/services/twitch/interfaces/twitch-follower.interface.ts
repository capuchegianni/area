import { ApiProperty } from '@nestjs/swagger';

export class AreaTwitchFollower {
    @ApiProperty({ description: "The UTC timestamp when the user started following the broadcaster." })
    readonly followed_at: string;

    @ApiProperty({ description: "An ID that uniquely identifies the user that’s following the broadcaster." })
    readonly user_id: string;

    @ApiProperty({ description: "The user’s login name." })
    readonly user_login: string;

    @ApiProperty({ description: "The user’s display name." })
    readonly user_name: string;
}

class Pagination {
    @ApiProperty({ description: "The cursor used to get the next page of results." })
    readonly cursor: string;
}

export class AreaTwitchFollowers {
    @ApiProperty({ description: "The list of users that follow the specified broadcaster." })
    readonly data: AreaTwitchFollower[];

    @ApiProperty({ description: "Contains the information used to page through the list of results." })
    readonly pagination: Pagination;

    @ApiProperty({ description: "The total number of users that follow this broadcaster." })
    readonly total: number;
}
