export declare class CreateAreaDto {
    readonly name: string;
    readonly description: string;
    readonly action_id: string;
    readonly action_metadata?: object;
    readonly action_oauth_id: number;
    readonly reaction_id: string;
    readonly reaction_body: object;
    readonly reaction_oauth_id: number;
    readonly delay: number;
}
