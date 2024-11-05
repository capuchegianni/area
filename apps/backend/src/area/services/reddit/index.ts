import { REDDIT_ACTIONS } from "./reddit.actions";
import { REDDIT_REACTIONS } from "./reddit.reactions";

export default {
    name: "reddit",
    actions: Object.entries(REDDIT_ACTIONS).map(
        ([name, { description, oauthProvider, metadata, oauthScopes }]) => ({
            name,
            description,
            oauthProvider,
            metadata,
            oauthScopes
        })
    ),
    reactions: Object.entries(REDDIT_REACTIONS).map(
        ([name, { description, oauthProvider, oauthScopes }]) => ({
            name,
            description,
            oauthProvider,
            oauthScopes
        })
    )
};
