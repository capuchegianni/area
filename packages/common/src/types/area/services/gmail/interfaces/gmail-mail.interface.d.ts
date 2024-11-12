export declare class AreaGmailMail {
    readonly to: string;
    readonly from?: string;
    readonly subject: string;
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
