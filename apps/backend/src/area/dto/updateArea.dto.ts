import { ApiPropertyOptional } from "@nestjs/swagger";
import { AreaStatus } from "@prisma/client";
import {
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";

@ValidatorConstraint({ name: "UpdateAreaDto", async: false })
class UpdateAreaDtoConstraint implements ValidatorConstraintInterface {
    validate(_prop: object, clazz: ValidationArguments) {
        const dto = clazz.object as UpdateAreaDto;
        const statusKeys = [
            AreaStatus.RUNNING,
            AreaStatus.STOPPED,
            AreaStatus.ERROR
        ];

        if (!statusKeys.includes(dto.status)) return false;

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `Invalid value for ${args.property} : ${args.value}.`;
    }
}

export class UpdateAreaDto {
    @ApiPropertyOptional({
        description: "The name of the AREA being created.",
        example: "LikeNotifier"
    })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(255)
    readonly name?: string;

    @ApiPropertyOptional({
        description: "The description of the AREA being created.",
        example:
            "This AREA will notify me every time I like a new video via a Discord webhook."
    })
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    readonly description?: string;

    @ApiPropertyOptional({
        description:
            "The action service authentication method used to post data. The value is the ID of an authentication"
    })
    @IsNumber()
    @IsOptional()
    readonly action_oauth_id?: number;

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
    @IsOptional()
    @IsObject()
    readonly reaction_body?: object;

    @ApiPropertyOptional({
        description:
            "The action service authentication method used to post data. The value is the ID of an authentication"
    })
    @IsNumber()
    @IsOptional()
    readonly reaction_oauth_id?: number;

    @ApiPropertyOptional({
        description:
            "The delay in seconds to which the poll-based event should be triggered. If the 'actionAuth' is a webhook, this value is ignored.",
        example: 10
    })
    @IsNumber()
    @IsOptional()
    @IsPositive()
    @Validate(UpdateAreaDtoConstraint)
    readonly delay?: number;

    @ApiPropertyOptional({
        description: "The AREA status.",
        enum: [AreaStatus.RUNNING, AreaStatus.STOPPED, AreaStatus.ERROR]
    })
    @IsOptional()
    @Validate(UpdateAreaDtoConstraint)
    readonly status?: AreaStatus;
}
