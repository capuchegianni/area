import { ApiProperty } from "@nestjs/swagger";

export class AreaTwitchStreamer {
    @ApiProperty({ description: "The name of the streamer." })
    readonly name: string;

    @ApiProperty({ description: "The ID of the streamer." })
    readonly id: string;
}
