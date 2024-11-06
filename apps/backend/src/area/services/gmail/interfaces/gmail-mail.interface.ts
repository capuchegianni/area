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

export interface GmailMailPayloadHeader {
    name: string;
    value: string;
}

export interface GmailMailPayloadBody {
    name: string;
    value: string;
}

export interface GmailMailPayload {
    partId: string;
    mimeType: string;
    filename: string;
    headers: GmailMailPayloadHeader[];
    body: {
        attachmentId: string;
        size: number;
        data: string;
    };
    parts: GmailMailPayload[];
}

export interface GmailMail {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    historyId: string;
    internalDate: string;
    payload: GmailMailPayload;
    sizeEstimate: number;
    raw: string;
}

export interface GmailMailsResponse {
    messages: GmailMail[];
    nextPageToken: string;
    resultSizeEstimate: number;
}
