import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    Matches,
    MaxLength
} from "class-validator";

export class CreateAreaDto {
    @ApiProperty({
        description: "The name of the AREA being created.",
        example: "LikeNotifier"
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    readonly name: string;

    @ApiProperty({
        description: "The description of the AREA being created.",
        example:
            "This AREA will notify me every time I like a new video via a Discord webhook."
    })
    @IsString()
    @IsNotEmpty()
    readonly description: string;

    @ApiProperty({
        description:
            "The action ID. It must contain the service and the method separated by a dot.",
        example: "youtube.on_liked_video"
    })
    @IsString()
    @Matches(/[a-z_]+\.[a-z_]+/)
    @IsNotEmpty()
    readonly action_id: string;

    @ApiPropertyOptional({
        description:
            "The fields to filter the AREA and make them match a particular context.",
        example: {
            streamerName: "SomeoneYouLike"
        }
    })
    @IsObject()
    @IsOptional()
    readonly action_metadata?: object;

    @ApiPropertyOptional({
        description:
            "The action service authentication method used to post data. The value is the ID of an authentication"
    })
    @IsNumber()
    readonly action_oauth_id: number;

    @ApiProperty({
        description:
            "The reaction ID. It must contain the service and the method separated by a dot.",
        example: "discord.send_embed"
    })
    @IsString()
    @Matches(/[a-z_]+\.[a-z_]+/)
    @IsNotEmpty()
    readonly reaction_id: string;

    @ApiPropertyOptional({
        description:
            "The object representing the reaction payload. It may contain variables from the action object.",
        example: {
            title: "You liked the video {{title}}.",
            description: "You can access the video by clicking [here]({{url}})",
            imageUrl: "{{thumbnail}}",
            authorName: "{{channelName}}",
            authorUrl: "https://youtube.com/channel/{{channelId}}"
        }
    })
    @IsObject()
    readonly reaction_body: object;

    @ApiProperty({
        description:
            "The action service authentication method used to post data. The value is the ID of an authentication"
    })
    @IsNumber()
    readonly reaction_oauth_id: number;

    @ApiPropertyOptional({
        description:
            "The delay in seconds to which the poll-based event should be triggered.",
        example: 10
    })
    @IsNumber()
    @IsPositive()
    readonly delay: number;
}
