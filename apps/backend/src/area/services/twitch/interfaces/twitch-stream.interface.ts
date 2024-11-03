import { ApiProperty } from "@nestjs/swagger";

export class AreaTwitchStream {
    @ApiProperty({ description: "An ID that identifies the stream." })
    readonly id: string;

    @ApiProperty({ description: "The ID of the user that’s broadcasting the stream." })
    readonly user_id: string;

    @ApiProperty({ description: "The user’s login name." })
    readonly user_login: string;

    @ApiProperty({ description: "The user’s display name." })
    readonly user_name: string;

    @ApiProperty({ description: "The ID of the category or game being played." })
    readonly game_id: string;

    @ApiProperty({ description: "The name of the category or game being played." })
    readonly game_name: string;

    @ApiProperty({ description: "The type of stream." })
    readonly type: string;

    @ApiProperty({ description: "The stream’s title." })
    readonly title: string;

    @ApiProperty({ description: "The tags applied to the stream." })
    readonly tags: string;

    @ApiProperty({ description: "The number of users watching the stream." })
    readonly viewer_count: string;

    @ApiProperty({ description: "The UTC date and time (in RFC3339 format) of when the broadcast began." })
    readonly started_at: string;

    @ApiProperty({ description: "The language that the stream uses." })
    readonly language: string;

    @ApiProperty({ description: "A URL to an image of a frame from the last 5 minutes of the stream." })
    readonly thumbnail_url: string;

    @ApiProperty({ description: "The list of tags that apply to the stream." })
    readonly tag_ids: string;

    @ApiProperty({ description: "A Boolean value that indicates whether the stream is meant for mature audiences." })
    readonly is_mature: string;
}

class Pagination {
    @ApiProperty({ description: "The cursor used to get the next page of results." })
    readonly cursor: string;
}

export class AreaTwitchStreams {
    @ApiProperty({ description: "The list of streams." })
    readonly data: AreaTwitchStream[];

    @ApiProperty({ description: "The information used to page through the list of results." })
    readonly pagination: Pagination;
}
