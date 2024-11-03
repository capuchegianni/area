import { GMAIL_ACTIONS } from "./gmail.actions";
import { GMAIL_REACTIONS } from "./gmail.reactions";

export default {
    name: "gmail",
    actions: Object.entries(GMAIL_ACTIONS).map(
        ([name, { description, oauthProvider, metadata, oauthScopes }]) => ({
            name,
            description,
            oauthProvider,
            metadata,
            oauthScopes
        })
    ),
    reactions: Object.entries(GMAIL_REACTIONS).map(
        ([name, { description, oauthProvider, oauthScopes }]) => ({
            name,
            description,
            oauthProvider,
            oauthScopes
        })
    )
};
