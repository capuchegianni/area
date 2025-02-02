import { AreaStatus, OAuthCredential } from "@prisma/client";
import { ActionDescription, ReactionDescription } from "../services/interfaces/service.interface";
import { User } from "src/users/interfaces/user.interface";
export interface AreaAction {
    service: string;
    method: string;
    config: ActionDescription;
}
export interface AreaReaction {
    service: string;
    method: string;
    config: ReactionDescription;
}
export interface AreaTask {
    areaId: Area["id"];
    name: string;
    action: AreaAction;
    actionMetadata: object;
    actionOAuthId: OAuthCredential["id"];
    reaction: AreaReaction;
    reactionBody: object;
    reactionOAuthId: OAuthCredential["id"];
    delay: number;
    userId: User["id"];
}
export declare abstract class Area {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly action_id: string;
    readonly action_metadata: object;
    readonly action_oauth_id: number;
    readonly reaction_id: string;
    readonly reaction_body: object;
    readonly reaction_oauth_id: number;
    readonly delay: number;
    readonly status: AreaStatus;
}
