import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AreaGmailMail {
    @ApiProperty({
        description: "The recipient emails list separated by colons."
    })
    readonly to: string;

    @ApiPropertyOptional({ description: "The sender email." })
    readonly from?: string;

    @ApiProperty({ description: "The subject of the email." })
    readonly subject: string;

    @ApiProperty({ description: "The body of the email." })
    readonly body: string;
}
