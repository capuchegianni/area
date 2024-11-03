import { TWITCH_ACTIONS } from "./twitch.actions";
import { TWITCH_REACTIONS } from "./twitch.reactions";

export default {
    name: "twitch",
    actions: Object.entries(TWITCH_ACTIONS).map(
        ([name, { description, oauthProvider, metadata, oauthScopes }]) => ({
            name,
            description,
            oauthProvider,
            metadata,
            oauthScopes
        })
    ),
    reactions: Object.entries(TWITCH_REACTIONS).map(
        ([name, { description, oauthProvider, oauthScopes }]) => ({
            name,
            description,
            oauthProvider,
            oauthScopes
        })
    )
};
