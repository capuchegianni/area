import { AreaStatus } from "@prisma/client";
export declare class UpdateAreaDto {
    readonly name?: string;
    readonly description?: string;
    readonly action_metadata?: object;
    readonly action_oauth_id?: number;
    readonly reaction_body?: object;
    readonly reaction_oauth_id?: number;
    readonly delay?: number;
    readonly status?: AreaStatus;
}
